import { DailySchedule, PrayerTime } from "./types";

// Surakarta Coordinates (Kampus 1 & 2 UMS)
const LATITUDE = -7.5583;
const LONGITUDE = 110.7719;
const TIMEZONE = 7; // WIB (UTC+7)

// Helper: Degree to Radian and vice versa
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Astronomical Prayer Time Calculation using Kemenag Standard
export function calculatePrayerTimes(date: Date = new Date()): DailySchedule["times"] {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  // Solar declination & Equation of time approximation
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const declination = 23.45 * Math.sin(b); // degrees

  // Solar noon in hours (WIB)
  const noon = 12 + (TIMEZONE * 15 - LONGITUDE) / 15 - equationOfTime / 60;

  // Hour angles
  const hourAngle = (angle: number) => {
    const latRad = toRad(LATITUDE);
    const decRad = toRad(declination);
    const angRad = toRad(angle);
    const cosHA = (Math.sin(angRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
    if (cosHA > 1 || cosHA < -1) return 0;
    return toDeg(Math.acos(cosHA)) / 15;
  };

  // Shadow angle for Ashar (Shafi'i: shadow = object + noon shadow)
  const asharAlt = toDeg(Math.atan(1 / (1 + Math.tan(toRad(Math.abs(LATITUDE - declination))))));
  const haAshar = hourAngle(asharAlt);

  // Fajr/Subuh angle: -20 degrees (Kemenag standard)
  const haSubuh = hourAngle(-20);

  // Sunrise/Terbit angle: -0.833 degrees
  const haTerbit = hourAngle(-0.833);

  // Maghrib angle: -0.833 degrees
  const haMaghrib = hourAngle(-0.833);

  // Isha/Isya angle: -18 degrees (Kemenag standard)
  const haIsya = hourAngle(-18);

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
    Imsak: formatHours(imsakH, 2),
    Subuh: formatHours(subuhH, 2),
    Terbit: formatHours(terbitH, -2),
    Dhuha: formatHours(dhuhaH, 2),
    Dzuhur: formatHours(dzuhurH, 3),
    Ashar: formatHours(asharH, 2),
    Maghrib: formatHours(maghribH, 2),
    Isya: formatHours(isyaH, 2),
  };
}

export function getNextPrayer(times: DailySchedule["times"], currentTime: Date = new Date()): {
  nextPrayer: PrayerTime;
  allPrayers: PrayerTime[];
  remainingSeconds: number;
} {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;

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

  const remainingSeconds = Math.max(0, Math.floor(minDiff * 60 - currentTime.getSeconds()));

  return {
    nextPrayer: allPrayers[nextIndex],
    allPrayers,
    remainingSeconds,
  };
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
    return "1447 H";
  }
}
