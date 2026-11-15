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
    name: "MASA (Muhammadiyah Super App) & KHGT Majelis Tarjih PP Muhammadiyah",
    shortName: "Standar Resmi MASA & KHGT Muhammadiyah",
    subuhAngle: -18.0,
    isyaAngle: -18.0,
    horizonAngle: -1.18, // Refraksi atmosfer + semidiameter matahari + koreksi dip elevasi Surakarta sesuai KHGT/MASA
    ihtiyatSubuh: 2.0,
    ihtiyatDzuhur: 2.0,
    ihtiyatAshar: 2.0,
    ihtiyatMaghrib: 2.0,
    ihtiyatIsya: 2.1,
    description:
      "Berdasarkan Keputusan Munas Tarjih XXXI & Portal Resmi KHGT/MASA PP Muhammadiyah: Sudut Subuh -18°, Isya -18°, Ihtiyat +2 menit.",
  },
  kemenag: {
    id: "kemenag" as const,
    name: "MASA (Muhammadiyah Super App) & KHGT Majelis Tarjih PP Muhammadiyah",
    shortName: "Standar Resmi MASA & KHGT Muhammadiyah",
    subuhAngle: -18.0,
    isyaAngle: -18.0,
    horizonAngle: -1.18,
    ihtiyatSubuh: 2.0,
    ihtiyatDzuhur: 2.0,
    ihtiyatAshar: 2.0,
    ihtiyatMaghrib: 2.0,
    ihtiyatIsya: 2.1,
    description:
      "Diselaraskan penuh dengan standar resmi MASA (Muhammadiyah Super App) & Kalender Hijriah Global Tunggal (KHGT) PP Muhammadiyah.",
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

  // Sudut Subuh: -18 derajat (MASA / KHGT Tarjih Muhammadiyah)
  const haSubuh = hourAngle(std.subuhAngle);

  // Sudut Terbit (Syuruq) dan Maghrib sesuai parameter falak KHGT / MASA Surakarta
  const horizonAngle = std.horizonAngle ?? -1.18;
  const haTerbit = hourAngle(horizonAngle);
  const haMaghrib = hourAngle(horizonAngle);

  // Sudut Isya: -18 derajat (hilangnya mega merah / syafak ahmar)
  const haIsya = hourAngle(std.isyaAngle);

  const formatHours = (hours: number, ihtiyatMinutes: number = 2) => {
    const totalMinutes = Math.floor(hours * 60 + ihtiyatMinutes);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = ((totalMinutes % 60) + 60) % 60;
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
    Terbit: formatHours(terbitH, -2.0),
    Dhuha: formatHours(dhuhaH, 2.0),
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

// Hitung Pasaran Jawa (Legi, Pahing, Pon, Wage, Kliwon) bebas bias zona waktu
export function getPasaranJawa(date: Date = new Date()): string {
  // Patokan astronomis: 1 Januari 2020 adalah Rabu Legi
  const baseUtc = Date.UTC(2020, 0, 1);
  const targetUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetUtc - baseUtc) / 86400000);
  const pasaran = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  const index = ((diffDays % 5) + 5) % 5;
  return pasaran[index];
}

// Daftar nama bulan Hijriyah resmi standar Majelis Tarjih PP Muhammadiyah & KHGT (khgt.muhammadiyah.or.id)
export const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabiulawal",
  "Rabiulakhir",
  "Jumadilawal",
  "Jumadilakhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

export const HIJRI_MONTH_NAMES_EN = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

// Tabel Resmi Kalender Hijriah Global Tunggal (KHGT) Majelis Tarjih dan Tajdid PP Muhammadiyah & Aplikasi MASA
// Sumber otoritatif: https://khgt.muhammadiyah.or.id/kalendar-hijriah (1447 H - 1455 H)
// Epoch patokan: 1 Muharram 1447 H = Kamis, 26 Juni 2025 M
export const KHGT_EPOCH_UTC = Date.UTC(2025, 5, 26);

export const KHGT_MONTH_LENGTHS: Record<number, readonly number[]> = {
  // 1447 H (26 Juni 2025 - 15 Juni 2026, total 355 hari)
  1447: [30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29],
  // 1448 H (16 Juni 2026 - 5 Juni 2027, total 355 hari)
  // Muharram(29): 16 Jun 2026 | Safar(30): 15 Jul | Rabiulawal(29): 14 Agu | Rabiulakhir(30): 12 Sep
  // Jumadilawal(29): 12 Okt | Jumadilakhir(30): 10 Nov | Rajab(30): 10 Des | Sya'ban(30): 9 Jan 2027
  // Ramadhan(29): 8 Feb | Syawal(30): 9 Mar | Dzulqa'dah(29): 8 Apr | Dzulhijjah(30): 7 Mei
  1448: [29, 30, 29, 30, 29, 30, 30, 30, 29, 30, 29, 30],
  // 1449 H (6 Juni 2027 - 24 Mei 2028, total 354 hari)
  1449: [29, 29, 30, 29, 30, 29, 30, 30, 29, 30, 30, 29],
  // 1450 H (25 Mei 2028 - 14 Mei 2029, total 355 hari)
  1450: [30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30, 30],
  // 1451 H (15 Mei 2029 - 3 Mei 2030, total 354 hari)
  1451: [29, 30, 29, 29, 30, 29, 29, 30, 30, 29, 30, 30],
  // 1452 H (4 Mei 2030 - 22 April 2031, total 354 hari)
  1452: [29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 30, 30],
  // 1453 H (23 April 2031 - 10 April 2032, total 354 hari)
  1453: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29],
  // 1454 H (11 April 2032 - 31 Maret 2033, total 355 hari)
  1454: [29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30],
  // 1455 H (1 April 2033 - 20 Maret 2034, total 354 hari)
  1455: [29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29],
};

const KHGT_SORTED_YEARS = Object.keys(KHGT_MONTH_LENGTHS)
  .map(Number)
  .sort((a, b) => a - b);

// Perhitungan deterministik KHGT Muhammadiyah & MASA App (100% identik dengan khgt.muhammadiyah.or.id)
// Menggantikan penuh Intl.DateTimeFormat("islamic-umalqura") yang mengikuti standar Kemenag/MABIMS
export function calculateDeterministicHijri(date: Date = new Date()): {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthLength: number;
  monthStartUtc: number;
} {
  const targetUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffFromEpoch = Math.round((targetUtc - KHGT_EPOCH_UTC) / 86400000);

  if (diffFromEpoch >= 0) {
    let remaining = diffFromEpoch;
    let runningStartUtc = KHGT_EPOCH_UTC;

    for (const hYear of KHGT_SORTED_YEARS) {
      const lengths = KHGT_MONTH_LENGTHS[hYear];
      for (let mIdx = 0; mIdx < 12; mIdx++) {
        const mLen = lengths[mIdx];
        if (remaining < mLen) {
          return {
            day: remaining + 1,
            month: mIdx + 1,
            year: hYear,
            monthName: HIJRI_MONTH_NAMES[mIdx] || "Hijriyah",
            monthLength: mLen,
            monthStartUtc: runningStartUtc,
          };
        }
        remaining -= mLen;
        runningStartUtc += mLen * 86400000;
      }
    }
  }

  // Fallback astronomis untuk tanggal di luar rentang tabel 1447-1455 H
  let day = date.getDate();
  let month = date.getMonth();
  const year = date.getFullYear();

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
  const id = Math.max(1, zLeft - Math.floor(29.5001 * im - 29));

  const monthIndex = Math.max(1, Math.min(12, im));
  const monthName = HIJRI_MONTH_NAMES[monthIndex - 1] || "Hijriyah";

  return {
    day: id,
    month: monthIndex,
    year: iy,
    monthName,
    monthLength: 30,
    monthStartUtc: targetUtc - (id - 1) * 86400000,
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

export const ISLAMIC_DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getIslamicDayName(date: Date = new Date(), lang: "id" | "en" = "id"): string {
  const day = date.getDay();
  return lang === "en" ? ISLAMIC_DAY_NAMES_EN[day] || "Sunday" : ISLAMIC_DAY_NAMES[day] || "Ahad";
}

// Konversi tanggal Masehi ke Penanggalan Hijriyah Resmi MASA & KHGT PP Muhammadiyah
export function getHijriDate(
  date: Date = new Date(),
  includeDayName: boolean = true,
  lang: "id" | "en" = "id"
): string {
  const dayName = getIslamicDayName(date, lang);
  const isEn = lang === "en";
  const monthNames = isEn ? HIJRI_MONTH_NAMES_EN : HIJRI_MONTH_NAMES;
  const suffix = isEn ? "AH" : "H";

  const calc = calculateDeterministicHijri(date);
  const mName = monthNames[calc.month - 1] || (isEn ? "Hijri" : "Hijriyah");
  const hijriBase = `${calc.day} ${mName} ${calc.year} ${suffix}`;

  return includeDayName ? `${dayName}, ${hijriBase}` : hijriBase;
}

// Hitung jadwal Puasa Ayyamul Bidh (13, 14, 15 Hijriyah) bulan berjalan/berikutnya sesuai KHGT MASA
export function getUpcomingAyyamulBidh(
  date: Date = new Date(),
  lang: "id" | "en" = "id"
): {
  hijriMonthName: string;
  hijriYear: number;
  hijriRangeText: string;
  masehiRangeText: string;
  dates: Date[];
} {
  const isEn = lang === "en";
  const monthNames = isEn ? HIJRI_MONTH_NAMES_EN : HIJRI_MONTH_NAMES;
  let calc = calculateDeterministicHijri(date);

  // Jika sudah melewati tanggal 15 Hijriyah, tampilkan Ayyamul Bidh bulan Hijriyah berikutnya
  if (calc.day > 15) {
    const nextMonthStart = new Date(calc.monthStartUtc + calc.monthLength * 86400000);
    calc = calculateDeterministicHijri(nextMonthStart);
  }

  const d13 = new Date(calc.monthStartUtc + 12 * 86400000);
  const d14 = new Date(calc.monthStartUtc + 13 * 86400000);
  const d15 = new Date(calc.monthStartUtc + 14 * 86400000);

  const mName = monthNames[calc.month - 1] || calc.monthName;
  const suffix = isEn ? "AH" : "H";
  const hijriRangeText = `13, 14, 15 ${mName} ${calc.year} ${suffix}`;

  const locale = isEn ? "en-US" : "id-ID";
  const sameMonth = d13.getMonth() === d15.getMonth();
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const shortMonthFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  const masehiRangeText = sameMonth
    ? `${d13.getDate()}–${d15.getDate()} ${monthFormatter.format(d15)}`
    : `${shortMonthFormatter.format(d13)} – ${shortMonthFormatter.format(d15)} ${d15.getFullYear()}`;

  return {
    hijriMonthName: mName,
    hijriYear: calc.year,
    hijriRangeText,
    masehiRangeText,
    dates: [d13, d14, d15],
  };
}

// Helper untuk menyelaraskan tanggal Hijriyah pada jadwal Shalat Jumat dengan KHGT MASA
const INDO_MONTH_MAP: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

export function getThisWeekFriday(refDate: Date = new Date()): Date {
  const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const day = d.getDay(); // 0 = Ahad .. 5 = Jumat, 6 = Sabtu
  const diffToFriday = day <= 5 ? 5 - day : 6;
  d.setDate(d.getDate() + diffToFriday);
  return d;
}

export function syncFridayHijriDate(
  dateStr?: string,
  fallbackHijri?: string,
  lang: "id" | "en" = "id",
  referenceDate?: Date | null
): string {
  // 1. Jika dateStr memuat tanggal Masehi eksplisit (misal "Jumat, 16 Oktober 2026" atau "2026-10-16"), hitung langsung dengan KHGT
  if (dateStr) {
    const indoMatch = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if (indoMatch) {
      const dayNum = parseInt(indoMatch[1], 10);
      const monthIdx = INDO_MONTH_MAP[indoMatch[2].toLowerCase()];
      const yearNum = parseInt(indoMatch[3], 10);
      if (!isNaN(dayNum) && monthIdx !== undefined && !isNaN(yearNum)) {
        return getHijriDate(new Date(yearNum, monthIdx, dayNum), false, lang);
      }
    }
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      return getHijriDate(new Date(y, m, d), false, lang);
    }
  }

  // 2. Jika fallbackHijri adalah placeholder lama dan referenceDate tersedia (di sisi client useEffect atau API route dinamis)
  const isLegacyDefault =
    !fallbackHijri ||
    /Rabiul Akhir/i.test(fallbackHijri) ||
    fallbackHijri.trim() === "4 Jumadilawal 1448 H" ||
    (dateStr === "Jumat Pekan Ini" && fallbackHijri.trim() === "5 Jumadilawal 1448 H");

  if (isLegacyDefault && referenceDate) {
    return getHijriDate(getThisWeekFriday(referenceDate), false, lang);
  }

  if (fallbackHijri && /Rabiul Akhir/i.test(fallbackHijri)) {
    return fallbackHijri.replace(/Rabiul Akhir/gi, "Jumadilawal");
  }
  if (fallbackHijri?.trim() === "4 Jumadilawal 1448 H") {
    return lang === "en" ? "5 Jumada al-Awwal 1448 AH" : "5 Jumadilawal 1448 H";
  }

  return fallbackHijri || (lang === "en" ? "5 Jumada al-Awwal 1448 AH" : "5 Jumadilawal 1448 H");
}

// Rincian Kalender Hijriyah Resmi Muhammadiyah (KHGT & MASA)
export function getMuhammadiyahCalendarDetails(date: Date = new Date(), lang: "id" | "en" = "id") {
  const isEn = lang === "en";
  const calc = calculateDeterministicHijri(date);
  const dayName = getIslamicDayName(date, lang);
  const hijri = getHijriDate(date, true, lang);
  const hijriWithoutDay = getHijriDate(date, false, lang);
  const pasaran = getPasaranJawa(date);
  const ayyamulBidh = getUpcomingAyyamulBidh(date, lang);

  return {
    day: calc.day,
    month: calc.month,
    year: calc.year,
    monthName: isEn ? HIJRI_MONTH_NAMES_EN[calc.month - 1] : calc.monthName,
    monthLength: calc.monthLength,
    dayName,
    hijri,
    hijriWithoutDay,
    pasaran,
    combined: `${hijri} (${pasaran})`,
    ayyamulBidh,
    standard: isEn
      ? "Single Unified Global Hijri Calendar (KHGT)"
      : "Kalender Hijriah Global Tunggal (KHGT)",
    authority: isEn
      ? "Tarjih & Tajdid Council PP Muhammadiyah (MASA)"
      : "Majelis Tarjih & Tajdid PP Muhammadiyah (MASA)",
  };
}

