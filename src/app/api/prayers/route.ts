import { NextResponse } from "next/server";
import { calculatePrayerTimes, getHijriDate, getNextPrayer } from "@/lib/prayer-times";

export async function GET() {
  const now = new Date();
  const times = calculatePrayerTimes(now);
  const nextPrayerInfo = getNextPrayer(times, now);
  const hijri = getHijriDate(now);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return NextResponse.json({
    location: "Masjid Sudalmiyah Rais, Kampus Universitas Muhammadiyah Surakarta",
    coordinates: {
      latitude: -7.5583,
      longitude: 110.7719,
      timezone: "WIB (UTC+7)",
    },
    date: formattedDate,
    hijri,
    times,
    nextPrayer: nextPrayerInfo.nextPrayer,
    allPrayers: nextPrayerInfo.allPrayers,
    remainingSeconds: nextPrayerInfo.remainingSeconds,
  });
}
