"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Compass,
  BellRing,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from "lucide-react";
import { calculatePrayerTimes, getHijriDate, getNextPrayer } from "@/lib/prayer-times";

export default function PrayerCountdownCard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [data, setData] = useState<{
    times: ReturnType<typeof calculatePrayerTimes>;
    nextPrayer: { name: string; time: string };
    allPrayers: Array<{ name: string; time: string; isNext?: boolean }>;
    remainingSeconds: number;
    hijri: string;
    formattedDate: string;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now);
      const times = calculatePrayerTimes(now);
      const nextInfo = getNextPrayer(times, now);
      const hijri = getHijriDate(now);
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);

      setData({
        times,
        nextPrayer: nextInfo.nextPrayer,
        allPrayers: nextInfo.allPrayers,
        remainingSeconds: nextInfo.remainingSeconds,
        hijri,
        formattedDate,
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data || !currentTime) {
    return (
      <div className="w-full bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 animate-pulse shadow-md">
        <div className="h-6 bg-stone-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-stone-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const hours = Math.floor(data.remainingSeconds / 3600);
  const minutes = Math.floor((data.remainingSeconds % 3600) / 60);
  const seconds = data.remainingSeconds % 60;

  const getPrayerIcon = (name: string) => {
    switch (name) {
      case "Subuh":
        return Sunrise;
      case "Terbit":
        return Sun;
      case "Dzuhur":
        return Sun;
      case "Ashar":
        return Sunset;
      case "Maghrib":
        return Sunset;
      case "Isya":
        return Moon;
      default:
        return Clock;
    }
  };

  return (
    <div className="w-full bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background Soft Accent Glows with breathing glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none animate-soft-glow" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#0D5C58]/10 rounded-full blur-3xl pointer-events-none animate-soft-glow" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B58A1E] mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#B58A1E]" />
            <span>Koordinat Masjid Sudalmiyah Rais Kampus 2 UMS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-serif">
            {data.formattedDate}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B58A1E]" />
            <span>{data.hijri}</span>
          </p>
        </div>

        {/* Live Countdown Badge (Teal and Gold style) */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-[#0D5C58]/10 text-[#0D5C58]">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
              Menuju Waktu {data.nextPrayer.name} ({data.nextPrayer.time} WIB)
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0D5C58] tracking-tight">
              {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Schedule Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 mt-6">
        {data.allPrayers.map((prayer) => {
          const Icon = getPrayerIcon(prayer.name);
          const isNext = prayer.isNext;

          return (
            <div
              key={prayer.name}
              className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 ${
                isNext
                  ? "bg-gradient-to-b from-[#0D5C58] to-[#094744] text-white shadow-xl shadow-[#0D5C58]/25 scale-[1.03] border border-emerald-400/30 animate-pulse-glow"
                  : "bg-[#FAF8F5] border border-stone-200/80 text-stone-700 hover:border-[#D4AF37]/50 hover:bg-white hover:shadow-sm"
              }`}
            >
              {isNext && (
                <span className="absolute -top-2.5 right-3 bg-[#D4AF37] text-stone-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Berikutnya
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isNext ? "text-[#FCD34D]" : "text-stone-500"
                  }`}
                >
                  {prayer.name}
                </span>
                <Icon
                  className={`w-4 h-4 ${isNext ? "text-[#FCD34D]" : "text-stone-400"}`}
                />
              </div>

              <div
                className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                  isNext ? "text-white" : "text-stone-900"
                }`}
              >
                {prayer.time}
              </div>

              <div
                className={`text-[10px] mt-1 font-mono ${
                  isNext ? "text-stone-200" : "text-stone-400"
                }`}
              >
                WIB
              </div>
            </div>
          );
        })}
      </div>

      {/* Auxiliary times footer: Imsak & Dhuha */}
      <div className="mt-5 pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-stone-800">Imsak:</strong> {data.times.Imsak} WIB
          </span>
          <span>
            <strong className="text-stone-800">Dhuha:</strong> {data.times.Dhuha} WIB
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-500">
          <Compass className="w-3.5 h-3.5 text-[#B58A1E]" />
          <span>Arah Kiblat Surakarta: 294.5° (Barat Laut)</span>
        </div>
      </div>
    </div>
  );
}
