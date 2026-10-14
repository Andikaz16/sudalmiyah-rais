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
  CalendarDays,
} from "lucide-react";
import {
  calculatePrayerTimes,
  getHijriDate,
  getNextPrayer,
  getMuhammadiyahCalendarDetails,
} from "@/lib/prayer-times";

export default function PrayerCountdownCard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [data, setData] = useState<{
    times: ReturnType<typeof calculatePrayerTimes>;
    nextPrayer: { name: string; time: string };
    allPrayers: Array<{ name: string; time: string; isNext?: boolean }>;
    remainingSeconds: number;
    hijri: string;
    formattedDate: string;
    muhammadiyahCalendar: ReturnType<typeof getMuhammadiyahCalendarDetails>;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now);
      const times = calculatePrayerTimes(now);
      const nextInfo = getNextPrayer(times, now);
      const hijri = getHijriDate(now);
      const muhammadiyahCalendar = getMuhammadiyahCalendarDetails(now);
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
        muhammadiyahCalendar,
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
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#003B73]/10 rounded-full blur-3xl pointer-events-none animate-soft-glow" />

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B58A1E]">
              <MapPin className="w-3.5 h-3.5 text-[#B58A1E]" />
              <span>Kampus 2 UMS Surakarta</span>
            </div>
            <span className="text-stone-300">•</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#003B73]/10 text-[#003B73] border border-[#003B73]/20">
              Standar MASA (Muhammadiyah)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-serif">
            {data.formattedDate}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-300/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B58A1E]" />
              <span className="font-serif font-bold">{data.muhammadiyahCalendar.hijri}</span>
              <span className="text-[11px] font-sans text-stone-600 font-semibold">({data.muhammadiyahCalendar.pasaran})</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">• KHGT Majelis Tarjih</span>
          </div>
        </div>

        {/* Kolom Kanan: Live Countdown & Card Kalender Muhammadiyah di Bawah Jam */}
        <div className="flex flex-col gap-2.5 w-full lg:w-auto lg:min-w-[360px]">
          {/* Live Countdown Badge */}
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-3.5 sm:p-4 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3 rounded-xl bg-[#003B73]/10 text-[#003B73] shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                Menuju Waktu {data.nextPrayer.name} ({data.nextPrayer.time} WIB)
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#003B73] tracking-tight">
                {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* DEDICATED KALENDER MUHAMMADIYAH CARD DI BAWAH JAM (Sesuai Permintaan Pak Dodi) */}
          <div className="bg-gradient-to-r from-[#003B73]/5 via-[#D4AF37]/10 to-[#003B73]/5 border border-[#D4AF37]/45 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#B58A1E] shrink-0 shadow-inner">
                <CalendarDays className="w-5 h-5 text-[#B58A1E]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#003B73] bg-[#003B73]/10 px-2 py-0.5 rounded-md">
                    Kalender Muhammadiyah
                  </span>
                  <span className="text-[9px] font-bold text-[#B58A1E] bg-amber-100/90 border border-amber-300/70 px-1.5 py-0.5 rounded font-mono">
                    KHGT
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-stone-900 tracking-tight mt-0.5 font-serif flex items-center gap-1.5">
                  <span>{data.muhammadiyahCalendar.hijri}</span>
                  <span className="text-xs font-sans text-stone-600 font-semibold">({data.muhammadiyahCalendar.pasaran})</span>
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  {data.muhammadiyahCalendar.authority}
                </div>
              </div>
            </div>

            <a
              href="/ibadah"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B73] hover:text-[#002855] hover:underline shrink-0 bg-white border border-stone-200/90 px-3 py-1.5 rounded-xl shadow-xs transition-all hover:bg-stone-50"
              title="Buka Ruang Ibadah & Kalender Muhammadiyah"
            >
              <span>Ruang Ibadah</span>
              <span className="text-xs">&rarr;</span>
            </a>
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
                  ? "bg-gradient-to-b from-[#003B73] to-[#002855] text-white shadow-xl shadow-[#003B73]/25 scale-[1.03] border border-amber-400/40 animate-pulse-glow"
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-[#003B73] font-semibold bg-[#003B73]/10 px-2.5 py-0.5 rounded-full border border-[#003B73]/20">
            Hisab Tarjih Munas XXXI (Subuh -18°)
          </span>
          <div className="flex items-center gap-1.5 text-stone-500">
            <Compass className="w-3.5 h-3.5 text-[#B58A1E]" />
            <span>Kiblat: 294.5°</span>
          </div>
        </div>
      </div>
    </div>
  );
}
