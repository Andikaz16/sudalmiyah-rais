import { NextRequest, NextResponse } from "next/server";
import { getDbAsync, saveDbFields, logSecurityEvent } from "@/lib/db";
import { sanitizeString, checkRateLimit } from "@/lib/security";
import { PrayerAttendance, PrayerName } from "@/lib/types";
import { calculatePrayerTimes } from "@/lib/prayer-times";
import {
  CAMPUS_MOSQUES_MAP,
  MAX_PRESENSI_RADIUS_METERS,
  calculateDistanceMeters,
} from "@/lib/mosque-locations";
import { z } from "zod";

const shalatPresensiSchema = z.object({
  prayerName: z.enum(["SUBUH", "DZUHUR", "ASHAR", "MAGHRIB", "ISYA"]),
  mosqueId: z.string().min(1, "Masjid wajib dipilih"),
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  participantRole: z.enum(["MAHASISWA", "DOSEN_KARYAWAN", "UMUM"]).default("MAHASISWA"),
  nim: z.string().max(30).optional(),
  faculty: z.string().max(100).optional(),
  phone: z.string().max(30).optional().default("-"),
  email: z.string().max(100).optional().default(""),
  photoUrl: z.string().min(1, "Foto kehadiran shalat berjamaah wajib diunggah"),
  userLat: z.number(),
  userLng: z.number(),
  gpsAccuracyMeters: z.number().min(0).max(50000).optional(),
  marbotPresent: z.boolean().default(true),
  marbotName: z.string().max(100).optional().default(""),
  marbotSignatureUrl: z.string().max(250000).optional().default(""),
  marbotNotes: z.string().max(300).optional().default(""),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimit = checkRateLimit(`shalat-submit-${ip}`, 15, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan presensi. Silakan tunggu beberapa saat." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = shalatPresensiSchema.safeParse(body);

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

    // Validasi waktu shalat: shalat yang belum tiba waktunya atau sudah kelewat tidak dapat dipresensi (standar hisab MASA/Tarjih Muhammadiyah/KHGT)
    const nowUtc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const nowWib = new Date(nowUtc + 7 * 3600000);
    const currentWibMinutes = nowWib.getHours() * 60 + nowWib.getMinutes();

    const times = calculatePrayerTimes(nowWib, "tarjih");
    const parseTimeToMinutes = (tStr: string) => {
      const [h, m] = tStr.split(":").map(Number);
      return h * 60 + m;
    };

    const PRAYER_SCHEDULE: Record<
      PrayerName,
      { start: number; end: number; label: string; timeStr: string; endTimeStr: string }
    > = {
      SUBUH: {
        start: parseTimeToMinutes(times.Subuh),
        end: parseTimeToMinutes(times.Dhuha),
        label: "Subuh",
        timeStr: `${times.Subuh} WIB`,
        endTimeStr: `${times.Dhuha} WIB`,
      },
      DZUHUR: {
        start: parseTimeToMinutes(times.Dzuhur),
        end: parseTimeToMinutes(times.Ashar),
        label: "Dzuhur",
        timeStr: `${times.Dzuhur} WIB`,
        endTimeStr: `${times.Ashar} WIB`,
      },
      ASHAR: {
        start: parseTimeToMinutes(times.Ashar),
        end: parseTimeToMinutes(times.Maghrib),
        label: "Ashar",
        timeStr: `${times.Ashar} WIB`,
        endTimeStr: `${times.Maghrib} WIB`,
      },
      MAGHRIB: {
        start: parseTimeToMinutes(times.Maghrib),
        end: parseTimeToMinutes(times.Isya),
        label: "Maghrib",
        timeStr: `${times.Maghrib} WIB`,
        endTimeStr: `${times.Isya} WIB`,
      },
      ISYA: {
        start: parseTimeToMinutes(times.Isya),
        end: 23 * 60 + 59,
        label: "Isya",
        timeStr: `${times.Isya} WIB`,
        endTimeStr: "23:59 WIB",
      },
    };

    const targetPrayer = PRAYER_SCHEDULE[data.prayerName];
    if (targetPrayer) {
      if (currentWibMinutes < targetPrayer.start) {
        return NextResponse.json(
          {
            error: `Waktu Shalat ${targetPrayer.label} belum dimulai (Jadwal MASA/Tarjih: ${targetPrayer.timeStr}). Presensi hanya dapat diisi saat waktu shalat tiba.`,
          },
          { status: 400 }
        );
      }
      if (currentWibMinutes > targetPrayer.end) {
        return NextResponse.json(
          {
            error: `Waktu Shalat ${targetPrayer.label} telah berakhir / sudah lewat (Batas hisab Tarjih: ${targetPrayer.endTimeStr}). Presensi untuk waktu shalat yang sudah kelewat tidak dapat diisi.`,
          },
          { status: 400 }
        );
      }
    }
    if (data.marbotPresent) {
      if (!data.marbotName || data.marbotName.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama marbot yang bertugas wajib diisi jika marbot berada di masjid." },
          { status: 400 }
        );
      }
      if (!data.marbotSignatureUrl || data.marbotSignatureUrl.trim().length === 0) {
        return NextResponse.json(
          { error: "Paraf / tanda tangan marbot wajib diisi langsung pada kolom paraf." },
          { status: 400 }
        );
      }
    }

    const mosqueData = CAMPUS_MOSQUES_MAP[data.mosqueId] || {
      id: data.mosqueId,
      name: "Masjid Kampus UMS",
      location: "Kawasan UMS",
      lat: -7.55795,
      lng: 110.77135,
    };

    // Validasi lokasi Geolocation spesifik terhadap masjid yang dipilih jamaah
    const selectedDistance = calculateDistanceMeters(data.userLat, data.userLng, mosqueData.lat, mosqueData.lng);

    // Cari masjid kampus yang secara fisik paling dekat dengan koordinat GPS user
    let nearestKey = data.mosqueId;
    let nearestMosque = mosqueData;
    let nearestDistance = selectedDistance;

    for (const key of Object.keys(CAMPUS_MOSQUES_MAP)) {
      const other = CAMPUS_MOSQUES_MAP[key];
      const d = calculateDistanceMeters(data.userLat, data.userLng, other.lat, other.lng);
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestKey = key;
        nearestMosque = other;
      }
    }

    // Jika akurasi GPS indoor berada dalam batas wajar, beri toleransi kecil hanya saat jarak masih mendekati gedung masjid
    const accuracyMargin =
      data.gpsAccuracyMeters && data.gpsAccuracyMeters > 30
        ? Math.min(Math.round(data.gpsAccuracyMeters * 0.4), 80)
        : 0;
    const effectiveRadius = MAX_PRESENSI_RADIUS_METERS + accuracyMargin;

    if (selectedDistance > effectiveRadius) {
      if (nearestDistance <= effectiveRadius && nearestKey !== data.mosqueId) {
        return NextResponse.json(
          {
            error: `Lokasi GPS Anda terdeteksi berada di kawasan ${nearestMosque.name} (${Math.round(nearestDistance)} meter), bukan di ${mosqueData.name} (${Math.round(selectedDistance)} meter). Silakan pilih ${nearestMosque.name} sesuai lokasi fisik Anda saat ini.`,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: `Posisi GPS Anda terdeteksi berjarak ${Math.round(selectedDistance)} meter dari ${mosqueData.name} (melebihi batas toleransi radius presensi ${MAX_PRESENSI_RADIUS_METERS} meter). Pastikan Anda berada langsung di lingkungan masjid kampus UMS saat presensi.`,
        },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.prayerAttendances)) {
      db.prayerAttendances = [];
    }

    const todayDate = nowWib.toISOString().split("T")[0];
    const cleanNim = data.nim ? sanitizeString(data.nim).toUpperCase().trim() : undefined;
    const cleanFullName = sanitizeString(data.fullName);

    // Cek duplikasi kehadiran pada shalat yang sama di hari yang sama
    const duplicate = db.prayerAttendances.find((p) => {
      if (p.date !== todayDate || p.prayerName !== data.prayerName) return false;
      if (cleanNim && p.nim && p.nim.toUpperCase() === cleanNim) return true;
      if (!cleanNim && p.fullName.toLowerCase() === cleanFullName.toLowerCase()) return true;
      return false;
    });

    if (duplicate) {
      const jamHadir = duplicate.attendedAt
        ? new Date(duplicate.attendedAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })
        : "WIB";

      return NextResponse.json(
        {
          error: `Presensi shalat ${data.prayerName} untuk ${cleanNim ? `NIM ${cleanNim}` : cleanFullName} sudah tercatat sebelumnya pada pukul ${jamHadir} WIB.`,
          isDuplicate: true,
          attendance: duplicate,
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const prefixCode = data.prayerName.substring(0, 3);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const ticketCode = `SHLT-${prefixCode}-${Date.now().toString().slice(-4)}${randomHex}`;

    const newAttendance: PrayerAttendance = {
      id: `shlt-${Date.now().toString(36)}-${randomHex.toLowerCase()}`,
      prayerName: data.prayerName as PrayerName,
      mosqueId: data.mosqueId,
      mosqueName: mosqueData.name,
      mosqueLocation: mosqueData.location,
      fullName: cleanFullName,
      participantRole: data.participantRole,
      nim: cleanNim,
      faculty: data.faculty ? sanitizeString(data.faculty) : undefined,
      phone: data.phone ? sanitizeString(data.phone) : "-",
      email: data.email ? sanitizeString(data.email) : undefined,
      photoUrl: data.photoUrl,
      ticketCode,
      attendedAt: nowIso,
      date: todayDate,
      userLat: data.userLat,
      userLng: data.userLng,
      locationVerified: true,
      distanceMeters: Math.round(selectedDistance),
      gpsAccuracyMeters: data.gpsAccuracyMeters ? Math.round(data.gpsAccuracyMeters) : undefined,
      marbotPresent: data.marbotPresent,
      marbotName: data.marbotPresent && data.marbotName ? sanitizeString(data.marbotName) : undefined,
      marbotSignatureUrl: data.marbotPresent && data.marbotSignatureUrl ? data.marbotSignatureUrl : undefined,
      marbotNotes: data.marbotNotes ? sanitizeString(data.marbotNotes) : undefined,
    };

    db.prayerAttendances.unshift(newAttendance);
    await saveDbFields(["prayerAttendances"], { prayerAttendances: db.prayerAttendances });

    logSecurityEvent(
      "PRAYER_ATTENDANCE_SUCCESS",
      cleanNim || cleanFullName,
      ip,
      "SUCCESS",
      `Presensi Shalat ${data.prayerName} di ${mosqueData.name} berhasil.`
    );

    return NextResponse.json({
      success: true,
      message: `Presensi Shalat ${data.prayerName} berhasil dicatat.`,
      attendance: newAttendance,
    });
  } catch (error) {
    console.error("Prayer attendance error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada sistem saat mencatat presensi shalat." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prayer = searchParams.get("prayer");
    const mosqueId = searchParams.get("mosqueId");
    const date = searchParams.get("date");

    const db = await getDbAsync();
    let list = db.prayerAttendances || [];

    if (prayer && prayer !== "all") {
      list = list.filter((p) => p.prayerName.toUpperCase() === prayer.toUpperCase());
    }

    if (mosqueId && mosqueId !== "all") {
      list = list.filter((p) => p.mosqueId === mosqueId);
    }

    if (date) {
      list = list.filter((p) => p.date === date);
    }

    return NextResponse.json({
      success: true,
      total: list.length,
      attendances: list,
    });
  } catch (error) {
    console.error("Failed to get prayer attendances:", error);
    return NextResponse.json(
      { error: "Gagal memuat data absensi shalat." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    const db = await getDbAsync();

    if (action === "clear-all") {
      db.prayerAttendances = [];
      await saveDbFields(["prayerAttendances"], { prayerAttendances: [] });
      return NextResponse.json({
        success: true,
        message: "Seluruh data absensi shalat berhasil dikosongkan.",
      });
    }

    if (id) {
      db.prayerAttendances = (db.prayerAttendances || []).filter((p) => p.id !== id);
      await saveDbFields(["prayerAttendances"], { prayerAttendances: db.prayerAttendances });
      return NextResponse.json({
        success: true,
        message: "Data presensi shalat berhasil dihapus.",
      });
    }

    return NextResponse.json(
      { error: "Parameter aksi tidak valid." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Failed to delete prayer attendance:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data presensi shalat." },
      { status: 500 }
    );
  }
}
