import { NextRequest, NextResponse } from "next/server";
import { getDbAsync, saveDb, logSecurityEvent } from "@/lib/db";
import { verifyDynamicToken, calculateDistanceMeters, MASJID_COORDINATES } from "@/lib/presensi-token";
import { sanitizeString, generateTicketCode, checkRateLimit } from "@/lib/security";
import { Registration } from "@/lib/types";
import { z } from "zod";

const presensiSchema = z.object({
  token: z.string().min(1, "Token presensi wajib diisi"),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  participantRole: z.enum(["MAHASISWA", "DOSEN_KARYAWAN", "UMUM"]).default("MAHASISWA"),
  nim: z.string().max(25).optional(),
  faculty: z.string().max(100).optional(),
  photoUrl: z.string().min(1, "Foto kehadiran peserta wajib diunggah"),
  phone: z.string().max(30).optional().default("-"),
  email: z.string().max(100).optional().default(""),
  userLat: z.number().optional(),
  userLng: z.number().optional(),
  deviceId: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting: 12 submits per minute per IP
  const rateLimit = checkRateLimit(`presensi-submit-${ip}`, 12, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan presensi. Silakan tunggu beberapa saat." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = presensiSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Data presensi tidak lengkap atau tidak valid.",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validasi token (diberi toleransi pengisian form maksimal 120 detik / 2 menit sejak QR discan)
    const verification = verifyDynamicToken(data.token, 120);

    if (!verification.valid) {
      return NextResponse.json(
        {
          error: verification.message || "Kode QR sudah kedaluwarsa. Silakan scan ulang kode QR terbaru di layar.",
          errorCode: verification.error,
        },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    const agendaId = verification.agendaId!;
    const agenda = db.agendas.find((a) => a.id === agendaId);

    if (!agenda) {
      return NextResponse.json(
        { error: "Agenda kegiatan tidak ditemukan pada sistem." },
        { status: 404 }
      );
    }

    const cleanNim = data.nim ? sanitizeString(data.nim).toUpperCase().trim() : undefined;
    const cleanEmail = data.email && data.email.trim() !== ""
      ? data.email.toLowerCase().trim()
      : (cleanNim ? `${cleanNim.toLowerCase()}@student.ums.ac.id` : `peserta_${Date.now()}@presensi.ums.ac.id`);
    const cleanPhone = data.phone ? sanitizeString(data.phone) : "-";
    const cleanFullName = sanitizeString(data.fullName);
    const cleanFaculty = data.faculty ? sanitizeString(data.faculty) : undefined;
    const photoUrl = data.photoUrl;

    // Validasi duplikasi kehadiran: cek apakah peserta sudah presensi (status ATTENDED) pada agenda ini
    const existingAttended = db.registrations.find((r) => {
      if (r.agendaId !== agendaId || r.status !== "ATTENDED") return false;
      if (cleanNim && r.nim && r.nim.toUpperCase() === cleanNim) return true;
      if (cleanEmail && r.email && r.email.toLowerCase() === cleanEmail) return true;
      if (!cleanNim && r.fullName.toLowerCase() === cleanFullName.toLowerCase()) return true;
      return false;
    });

    if (existingAttended) {
      const jamHadir = existingAttended.attendedAt
        ? new Date(existingAttended.attendedAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })
        : "WIB";

      return NextResponse.json(
        {
          error: `Peserta dengan ${cleanNim ? `NIM ${cleanNim}` : "nama ini"} sudah tercatat hadir pada pukul ${jamHadir} WIB. Presensi hanya dapat dilakukan 1 kali.`,
          isDuplicate: true,
          attendance: {
            ticketCode: existingAttended.ticketCode,
            fullName: existingAttended.fullName,
            nim: existingAttended.nim,
            photoUrl: existingAttended.photoUrl,
            agendaTitle: existingAttended.agendaTitle,
            attendedAt: existingAttended.attendedAt,
          },
        },
        { status: 409 }
      );
    }

    // Evaluasi lokasi Geolocation jika dikirim oleh browser
    let locationVerified = false;
    let distanceMeters: number | undefined;

    if (data.userLat !== undefined && data.userLng !== undefined) {
      distanceMeters = calculateDistanceMeters(data.userLat, data.userLng);
      locationVerified = distanceMeters <= MASJID_COORDINATES.maxRadiusMeters;
    }

    // Periksa apakah peserta sebelumnya sudah mendaftar (pre-register, status CONFIRMED)
    const existingRegistration = db.registrations.find((r) => {
      if (r.agendaId !== agendaId) return false;
      if (cleanNim && r.nim && r.nim.toUpperCase() === cleanNim) return true;
      if (cleanEmail && r.email && r.email.toLowerCase() === cleanEmail) return true;
      if (!cleanNim && r.fullName.toLowerCase() === cleanFullName.toLowerCase()) return true;
      return false;
    });

    const nowIso = new Date().toISOString();
    let finalRecord: Registration;

    if (existingRegistration) {
      // Perbarui data yang sudah terdaftar menjadi ATTENDED
      existingRegistration.status = "ATTENDED";
      existingRegistration.attendedAt = nowIso;
      existingRegistration.checkInMethod = "QR_DYNAMIC";
      existingRegistration.participantRole = data.participantRole;
      existingRegistration.locationVerified = locationVerified;
      existingRegistration.photoUrl = photoUrl;
      if (cleanFaculty) existingRegistration.faculty = cleanFaculty;
      finalRecord = existingRegistration;
    } else {
      // Catat sebagai peserta walk-in langsung di lokasi (misal Cinsub / Tabligh Akbar)
      const ticketCode = generateTicketCode("PRES");
      finalRecord = {
        id: `reg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        agendaId: agenda.id,
        agendaTitle: agenda.title,
        fullName: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        isUmsStudent: data.participantRole === "MAHASISWA",
        nim: cleanNim,
        faculty: cleanFaculty,
        photoUrl,
        ticketCode,
        status: "ATTENDED",
        registeredAt: nowIso,
        attendedAt: nowIso,
        checkInMethod: "QR_DYNAMIC",
        participantRole: data.participantRole,
        locationVerified,
      };

      db.registrations.unshift(finalRecord);
      agenda.registeredCount = (agenda.registeredCount || 0) + 1;
    }

    await saveDb(db);

    logSecurityEvent(
      "PRESENSI_CHECKIN",
      finalRecord.email,
      ip,
      "SUCCESS",
      `Presensi berhasil: [${agenda.title}] nama: ${finalRecord.fullName} ${finalRecord.nim ? `NIM: ${finalRecord.nim}` : ""} via Dynamic QR Code`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Presensi kehadiran berhasil dikonfirmasi!",
        attendance: {
          id: finalRecord.id,
          ticketCode: finalRecord.ticketCode,
          fullName: finalRecord.fullName,
          nim: finalRecord.nim,
          faculty: finalRecord.faculty,
          photoUrl: finalRecord.photoUrl,
          agendaTitle: agenda.title,
          speaker: agenda.speaker,
          location: agenda.location,
          date: agenda.date,
          time: agenda.time,
          attendedAt: finalRecord.attendedAt,
          locationVerified,
          distanceMeters,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Presensi Submit Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mencatat presensi." },
      { status: 500 }
    );
  }
}
