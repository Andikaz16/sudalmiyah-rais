import { NextRequest, NextResponse } from "next/server";
import { getDbAsync, saveDb, logSecurityEvent } from "@/lib/db";
import { sanitizeString, checkRateLimit } from "@/lib/security";
import { PrayerAttendance, PrayerName } from "@/lib/types";
import { calculatePrayerTimes } from "@/lib/prayer-times";
import { z } from "zod";

const CAMPUS_MOSQUES: Record<string, { name: string; location: string; lat: number; lng: number }> = {
  sudalmiyah: { name: "Masjid Hj. Sudalmiyah Rais", location: "Kampus 2 UMS", lat: -7.5583, lng: 110.7719 },
  fadhlurrahman: { name: "Masjid Fadhlurrahman", location: "Kampus 1 UMS", lat: -7.5587, lng: 110.7766 },
  "mas-mansur": { name: "Masjid KH. Mas Mansur", location: "Kampus 4 UMS (Pesma)", lat: -7.5558, lng: 110.7634 },
  "mahad-abu-bakar": { name: "Masjid Ma'had Abu Bakar", location: "Kampus 2 UMS", lat: -7.5574, lng: 110.7712 },
  "ar-razi": { name: "Masjid Ar-Razi FKG", location: "Kampus 4 UMS (FKG)", lat: -7.5549, lng: 110.7645 },
  "munajat-shabran": { name: "Masjid Al-Munajat Pondok Shabran", location: "Makamhaji (Pondok Shabran)", lat: -7.5681, lng: 110.7698 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

    // Validasi waktu shalat: shalat yang belum tiba waktunya tidak dapat dipresensi (standar hisab MASA/Tarjih Muhammadiyah/KHGT)
    const nowUtc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const nowWib = new Date(nowUtc + 7 * 3600000);
    const currentWibMinutes = nowWib.getHours() * 60 + nowWib.getMinutes();

    const times = calculatePrayerTimes(nowWib, "tarjih");
    const parseTimeToMinutes = (tStr: string) => {
      const [h, m] = tStr.split(":").map(Number);
      return h * 60 + m;
    };

    const PRAYER_SCHEDULE: Record<PrayerName, { start: number; label: string; timeStr: string }> = {
      SUBUH: { start: parseTimeToMinutes(times.Subuh), label: "Subuh", timeStr: `${times.Subuh} WIB` },
      DZUHUR: { start: parseTimeToMinutes(times.Dzuhur), label: "Dzuhur", timeStr: `${times.Dzuhur} WIB` },
      ASHAR: { start: parseTimeToMinutes(times.Ashar), label: "Ashar", timeStr: `${times.Ashar} WIB` },
      MAGHRIB: { start: parseTimeToMinutes(times.Maghrib), label: "Maghrib", timeStr: `${times.Maghrib} WIB` },
      ISYA: { start: parseTimeToMinutes(times.Isya), label: "Isya", timeStr: `${times.Isya} WIB` },
    };

    const targetPrayer = PRAYER_SCHEDULE[data.prayerName];
    if (targetPrayer && currentWibMinutes < targetPrayer.start) {
      return NextResponse.json(
        {
          error: `Waktu Shalat ${targetPrayer.label} belum dimulai (Jadwal MASA/Tarjih: ${targetPrayer.timeStr}). Presensi hanya dapat diisi setelah waktu shalat tiba.`,
        },
        { status: 400 }
      );
    }
    const mosqueData = CAMPUS_MOSQUES[data.mosqueId] || {
      name: "Masjid Kampus UMS",
      location: "Kawasan UMS",
      lat: -7.5583,
      lng: 110.7719,
    };

    // Validasi lokasi Geolocation (Wajib dalam kawasan masjid / radius toleransi 500 meter)
    let minDistance = calculateDistance(data.userLat, data.userLng, mosqueData.lat, mosqueData.lng);

    // Cek juga ke masjid kampus lainnya jika jamaah berada di kompleks kampus UMS
    for (const key of Object.keys(CAMPUS_MOSQUES)) {
      const other = CAMPUS_MOSQUES[key];
      const d = calculateDistance(data.userLat, data.userLng, other.lat, other.lng);
      if (d < minDistance) {
        minDistance = d;
      }
    }

    const locationVerified = minDistance <= 550; // toleransi 550 meter mencakup seluruh aula & pelataran kampus
    if (!locationVerified) {
      return NextResponse.json(
        {
          error: `Posisi GPS Anda terdeteksi berjarak ${Math.round(minDistance)} meter dari kawasan Masjid UMS (melebihi toleransi batas kehadiran). Pastikan Anda berada langsung di lingkungan masjid kampus UMS saat presensi.`,
        },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.prayerAttendances)) {
      db.prayerAttendances = [];
    }

    const todayDate = new Date().toISOString().split("T")[0];
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
      distanceMeters: Math.round(minDistance),
    };

    db.prayerAttendances.unshift(newAttendance);
    await saveDb(db);

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
