import { DailySchedule, PrayerTime } from "./types";

// Koordinat Presisi Titik Falak Masjid Sudalmiyah Rais (Kampus 2 Universitas Muhammadiyah Surakarta)
export const MASJID_COORDINATES = {
  name: "Masjid Sudalmiyah Rais, Kampus 2 UMS",
  latitude: -7.5583,
  longitude: 110.7719,
  timezone: 7, // WIB (UTC+7)
};

export type CalculationMethod = "tarjih" | "kemenag";

export const CALCULATION_STANDARDS = {
  tarjih: {
    id: "tarjih" as const,
    name: "MASA (Muhammadiyah Super App) & Majelis Tarjih PP Muhammadiyah",
    shortName: "Standar MASA (Tarjih Muhammadiyah)",
    subuhAngle: -18.0,
    isyaAngle: -18.0,
    ihtiyatSubuh: 2,
    ihtiyatDzuhur: 2,
    ihtiyatAshar: 2,
    ihtiyatMaghrib: 2,
    ihtiyatIsya: 2,
    description:
      "Berdasarkan Keputusan Munas Tarjih XXXI Tahun 2020: Sudut Subuh -18°, Isya -18°, Ihtiyat +2 menit.",
  },
  kemenag: {
    id: "kemenag" as const,
    name: "Kementerian Agama Republik Indonesia (Kemenag RI)",
    shortName: "Standar Kemenag RI",
    subuhAngle: -20.0,
    isyaAngle: -18.0,
    ihtiyatSubuh: 2,
    ihtiyatDzuhur: 3,
    ihtiyatAshar: 2,
    ihtiyatMaghrib: 2,
    ihtiyatIsya: 2,
    description:
      "Berdasarkan standar Bimas Islam Kemenag RI: Sudut Subuh -20°, Isya -18°, Ihtiyat +2-3 menit.",
  },
};

// Helper: Konversi Sudut
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Perhitungan Astronomis Posisi Matahari Presisi Tinggi (Jean Meeus / NOAA Solar Ephemeris)
function calculateSolarEphemeris(date: Date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd =
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    b -
    1524.5;

  const t = (jd - 2451545.0) / 36525.0;
  const l0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
  const m = (357.52911 + t * (35999.05029 - 0.0001537 * t)) % 360;
  const mRad = toRad(m);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);

  const c =
    Math.sin(mRad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * mRad) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * mRad) * 0.000289;

  const sunTrueLong = (l0 + c) % 360;
  const eps0 = 23.439291 - t * (0.0130042 + 0.00000016 * t);
  const epsRad = toRad(eps0);
  const sunRad = toRad(sunTrueLong);

  const sinDec = Math.sin(epsRad) * Math.sin(sunRad);
  const declination = toDeg(Math.asin(sinDec));

  const y = Math.tan(epsRad / 2.0) ** 2;
  const l0Rad = toRad(l0);
  const equationOfTime =
    4.0 *
    toDeg(
      y * Math.sin(2 * l0Rad) -
        2 * e * Math.sin(mRad) +
        4 * e * y * Math.sin(mRad) * Math.cos(2 * l0Rad) -
        0.5 * (y ** 2) * Math.sin(4 * l0Rad) -
        1.25 * (e ** 2) * Math.sin(2 * mRad)
    );

  return { declination, equationOfTime };
}

// Perhitungan Jadwal Shalat (Default: Standar MASA / Tarjih Muhammadiyah)
export function calculatePrayerTimes(
  date: Date = new Date(),
  method: CalculationMethod = "tarjih"
): DailySchedule["times"] {
  const std = CALCULATION_STANDARDS[method] || CALCULATION_STANDARDS.tarjih;
  const { declination, equationOfTime } = calculateSolarEphemeris(date);

  // Solar noon in hours (WIB)
  const noon =
    12 +
    (MASJID_COORDINATES.timezone * 15 - MASJID_COORDINATES.longitude) / 15 -
    equationOfTime / 60;

  // Sudut jam (Hour Angle)
  const hourAngle = (angle: number) => {
    const latRad = toRad(MASJID_COORDINATES.latitude);
    const decRad = toRad(declination);
    const angRad = toRad(angle);
    const cosHA =
      (Math.sin(angRad) - Math.sin(latRad) * Math.sin(decRad)) /
      (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1 || cosHA < -1) return 0;
    return toDeg(Math.acos(cosHA)) / 15;
  };

  // Sudut bayangan Ashar (Jumhur/Muhammadiyah: bayangan = panjang benda + bayangan zawal)
  const asharAlt = toDeg(
    Math.atan(1 / (1 + Math.tan(toRad(Math.abs(MASJID_COORDINATES.latitude - declination)))))
  );
  const haAshar = hourAngle(asharAlt);

  // Sudut Subuh: -18 derajat (MASA / Tarjih Muhammadiyah) atau -20 derajat (Kemenag)
  const haSubuh = hourAngle(std.subuhAngle);

  // Sudut Terbit (Syuruq) dan Maghrib: -0.833 derajat (semidiameter matahari 16' + refraksi atmosfer 34')
  const haTerbit = hourAngle(-0.833);
  const haMaghrib = hourAngle(-0.833);

  // Sudut Isya: -18 derajat (hilangnya mega merah / syafak ahmar)
  const haIsya = hourAngle(std.isyaAngle);

  const formatHours = (hours: number, ihtiyatMinutes: number = 2) => {
    const totalMinutes = Math.round(hours * 60 + ihtiyatMinutes);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const dzuhurH = noon;
  const subuhH = noon - haSubuh;
  const terbitH = noon - haTerbit;
  const asharH = noon + haAshar;
  const maghribH = noon + haMaghrib;
  const isyaH = noon + haIsya;
  const imsakH = subuhH - 10 / 60;
  const dhuhaH = terbitH + 20 / 60;

  return {
    Imsak: formatHours(imsakH, std.ihtiyatSubuh),
    Subuh: formatHours(subuhH, std.ihtiyatSubuh),
    Terbit: formatHours(terbitH, -2),
    Dhuha: formatHours(dhuhaH, 2),
    Dzuhur: formatHours(dzuhurH, std.ihtiyatDzuhur),
    Ashar: formatHours(asharH, std.ihtiyatAshar),
    Maghrib: formatHours(maghribH, std.ihtiyatMaghrib),
    Isya: formatHours(isyaH, std.ihtiyatIsya),
  };
}

export function getNextPrayer(
  times: DailySchedule["times"],
  currentTime: Date = new Date()
): {
  nextPrayer: PrayerTime;
  allPrayers: PrayerTime[];
  remainingSeconds: number;
} {
  const currentMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes() +
    currentTime.getSeconds() / 60;

  const prayers: Array<{ name: PrayerTime["name"]; time: string }> = [
    { name: "Subuh", time: times.Subuh },
    { name: "Terbit", time: times.Terbit },
    { name: "Dzuhur", time: times.Dzuhur },
    { name: "Ashar", time: times.Ashar },
    { name: "Maghrib", time: times.Maghrib },
    { name: "Isya", time: times.Isya },
  ];

  let nextIndex = 0;
  let minDiff = Infinity;

  prayers.forEach((prayer, index) => {
    const [h, m] = prayer.time.split(":").map(Number);
    const pMinutes = h * 60 + m;
    const diff = pMinutes - currentMinutes;

    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextIndex = index;
    }
  });

  // If all prayers today passed, next is Subuh tomorrow
  if (minDiff === Infinity) {
    const [h, m] = times.Subuh.split(":").map(Number);
    const pMinutes = 24 * 60 + h * 60 + m;
    minDiff = pMinutes - currentMinutes;
    nextIndex = 0;
  }

  const allPrayers: PrayerTime[] = prayers.map((p, idx) => ({
    name: p.name,
    time: p.time,
    isNext: idx === nextIndex,
  }));

  const remainingSeconds = Math.max(
    0,
    Math.floor(minDiff * 60 - currentTime.getSeconds())
  );

  return {
    nextPrayer: allPrayers[nextIndex],
    allPrayers,
    remainingSeconds,
  };
}

// Hitung Pasaran Jawa (Legi, Pahing, Pon, Wage, Kliwon)
export function getPasaranJawa(date: Date = new Date()): string {
  // Patokan astronomis: 1 Januari 2020 adalah Rabu Legi
  const baseDate = new Date(2020, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const pasaran = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const index = ((diffDays % 5) + 5) % 5;
  return pasaran[index];
}

// Daftar nama bulan Hijriyah resmi standar Indonesia & Majelis Tarjih PP Muhammadiyah
export const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadilawal",
  "Jumadilakhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

// Algoritma astronomis deterministik Hijriyah (independen lintas peramban Android, iOS, Windows, Mac)
// Mengeliminasi bug ICU Android Chrome yang mengubah nama bulan Hijriyah menjadi bulan Masehi (misal "Mei") dan era "SM"
export function calculateDeterministicHijri(date: Date = new Date()): {
  day: number;
  month: number;
  year: number;
  monthName: string;
} {
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  let b1 = 0;
  if (jd > 2299160) {
    const a1 = Math.floor((jd - 1867216.25) / 36524.25);
    b1 = jd + 1 + a1 - Math.floor(a1 / 4);
  } else {
    b1 = jd;
  }

  const bb = b1 + 1524;
  const cc = Math.floor((bb - 122.1) / 365.25);
  const dd = Math.floor(365.25 * cc);
  const ee = Math.floor((bb - dd) / 30.6001);
  day = bb - dd - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    month = ee - 13;
  }

  const iyear = 10631 / 30;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60;

  const z = jd - epochastro;
  const cyc = Math.floor(z / 10631);
  const zRemainder = z - 10631 * cyc;
  const j = Math.floor((zRemainder - shift1) / iyear);
  const iy = 30 * cyc + j;
  const zLeft = zRemainder - Math.floor(j * iyear + shift1);
  let im = Math.floor((zLeft + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = zLeft - Math.floor(29.5001 * im - 29);

  const monthIndex = Math.max(1, Math.min(12, im));
  const monthName = HIJRI_MONTH_NAMES[monthIndex - 1] || "Hijriyah";

  return {
    day: id,
    month: monthIndex,
    year: iy,
    monthName,
  };
}

// Daftar nama hari penanggalan Islam resmi (standar bahasa Indonesia & Majelis Tarjih)
export const ISLAMIC_DAY_NAMES = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export function getIslamicDayName(date: Date = new Date()): string {
  const day = date.getDay();
  return ISLAMIC_DAY_NAMES[day] || "Ahad";
}

// Konversi tanggal Masehi ke Penanggalan Hijriyah (KHGT & Standar Majelis Tarjih)
export function getHijriDate(date: Date = new Date(), includeDayName: boolean = true): string {
  const dayName = getIslamicDayName(date);
  let hijriBase = "";

  try {
    const fParts = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date);

    const dayPart = fParts.find((p) => p.type === "day")?.value;
    const monthPart = fParts.find((p) => p.type === "month")?.value;
    const yearPart = fParts.find((p) => p.type === "year")?.value;

    if (dayPart && monthPart && yearPart) {
      const mIdx = parseInt(monthPart, 10);
      if (mIdx >= 1 && mIdx <= 12) {
        const mName = HIJRI_MONTH_NAMES[mIdx - 1];
        hijriBase = `${dayPart} ${mName} ${yearPart} H`;
      }
    }
  } catch {
    // Abaikan jika lingkungan peramban tidak mendukung Intl Islamic
  }

  if (!hijriBase) {
    // Fallback deterministik independen
    const calc = calculateDeterministicHijri(date);
    hijriBase = `${calc.day} ${calc.monthName} ${calc.year} H`;
  }

  return includeDayName ? `${dayName}, ${hijriBase}` : hijriBase;
}

// Rincian Kalender Hijriyah Resmi Muhammadiyah (KHGT)
export function getMuhammadiyahCalendarDetails(date: Date = new Date()) {
  const dayName = getIslamicDayName(date);
  const hijri = getHijriDate(date, true);
  const hijriWithoutDay = getHijriDate(date, false);
  const pasaran = getPasaranJawa(date);
  return {
    dayName,
    hijri,
    hijriWithoutDay,
    pasaran,
    combined: `${hijri} (${pasaran})`,
    standard: "Kalender Hijriyah Global Tunggal (KHGT)",
    authority: "Majelis Tarjih & Tajdid PP Muhammadiyah",
  };
}

