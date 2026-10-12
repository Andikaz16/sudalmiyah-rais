import { NextRequest, NextResponse } from "next/server";
import {
  calculatePrayerTimes,
  getHijriDate,
  getNextPrayer,
  CALCULATION_STANDARDS,
  CalculationMethod,
} from "@/lib/prayer-times";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const methodParam = searchParams.get("method");
  const method: CalculationMethod =
    methodParam === "kemenag" ? "kemenag" : "tarjih";

  const now = new Date();
  const times = calculatePrayerTimes(now, method);
  const nextPrayerInfo = getNextPrayer(times, now);
  const hijri = getHijriDate(now);
  const standardInfo = CALCULATION_STANDARDS[method];

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
    method: standardInfo.name,
    methodDescription: standardInfo.description,
    parameters: {
      subuhAngle: standardInfo.subuhAngle,
      isyaAngle: standardInfo.isyaAngle,
      ihtiyatMinutes: standardInfo.ihtiyatSubuh,
    },
    date: formattedDate,
    hijri,
    times,
    nextPrayer: nextPrayerInfo.nextPrayer,
    allPrayers: nextPrayerInfo.allPrayers,
    remainingSeconds: nextPrayerInfo.remainingSeconds,
  });
}
