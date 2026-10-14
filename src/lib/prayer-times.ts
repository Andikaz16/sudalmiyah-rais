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

// Convert Gregorian to approximate Hijri date
export function getHijriDate(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(date);
  } catch {
    return "1448 H";
  }
}

// Rincian Kalender Hijriyah Resmi Muhammadiyah (KHGT)
export function getMuhammadiyahCalendarDetails(date: Date = new Date()) {
  const hijri = getHijriDate(date);
  const pasaran = getPasaranJawa(date);
  return {
    hijri,
    pasaran,
    combined: `${hijri} (${pasaran})`,
    standard: "Kalender Hijriyah Global Tunggal (KHGT)",
    authority: "Majelis Tarjih & Tajdid PP Muhammadiyah",
  };
}

