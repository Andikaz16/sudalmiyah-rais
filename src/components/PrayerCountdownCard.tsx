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
import {
  calculatePrayerTimes,
  getHijriDate,
  getNextPrayer,
  getMuhammadiyahCalendarDetails,
} from "@/lib/prayer-times";
import { useLanguage } from "@/context/LanguageContext";

export default function PrayerCountdownCard() {
  const { language, t } = useLanguage();
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
      const formattedDate = new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", {
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
  }, [language]);

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

  const getTranslatedName = (name: string) => {
    switch (name) {
      case "Subuh":
        return t.prayer.subuh;
      case "Terbit":
        return t.prayer.terbit;
      case "Dzuhur":
        return t.prayer.dzuhur;
      case "Ashar":
        return t.prayer.ashar;
      case "Maghrib":
        return t.prayer.maghrib;
      case "Isya":
        return t.prayer.isya;
      case "Imsak":
        return t.prayer.imsak;
      case "Dhuha":
        return t.prayer.dhuha;
      default:
        return name;
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
              <span>{t.prayer.location}</span>
            </div>
            <span className="text-stone-300">•</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#003B73]/10 text-[#003B73] border border-[#003B73]/20">
              {t.prayer.standard}
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
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">• {t.prayer.khgtStandard}</span>
          </div>
        </div>

        {/* Kolom Kanan: Live Countdown Badge */}
        <div className="flex flex-col justify-center w-full lg:w-auto lg:min-w-[340px]">
          <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="p-3.5 rounded-2xl bg-[#003B73]/10 text-[#003B73] shrink-0">
              <BellRing className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                {t.prayer.countdownTo} {getTranslatedName(data.nextPrayer.name)} ({data.nextPrayer.time} {t.prayer.wib})
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#003B73] tracking-tight">
                {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
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
                  ? "bg-gradient-to-b from-[#003B73] to-[#002855] text-white shadow-xl shadow-[#003B73]/25 scale-[1.03] border border-amber-400/40 animate-pulse-glow"
                  : "bg-[#FAF8F5] border border-stone-200/80 text-stone-700 hover:border-[#D4AF37]/50 hover:bg-white hover:shadow-sm"
              }`}
            >
              {isNext && (
                <span className="absolute -top-2.5 right-3 bg-[#D4AF37] text-stone-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {t.prayer.next}
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isNext ? "text-[#FCD34D]" : "text-stone-500"
                  }`}
                >
                  {getTranslatedName(prayer.name)}
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
                {t.prayer.wib}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auxiliary times footer: Imsak & Dhuha */}
      <div className="mt-5 pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-stone-800">{t.prayer.imsak}:</strong> {data.times.Imsak} {t.prayer.wib}
          </span>
          <span>
            <strong className="text-stone-800">{t.prayer.dhuha}:</strong> {data.times.Dhuha} {t.prayer.wib}
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
