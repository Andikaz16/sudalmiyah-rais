"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Globe,
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  getHijriDate,
  getPasaranJawa,
  getIslamicDayName,
  getMuhammadiyahCalendarDetails,
} from "@/lib/prayer-times";
import { useLanguage } from "@/context/LanguageContext";

export default function MuhammadiyahCalendarWidget() {
  const { language, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [hijriText, setHijriText] = useState<string>("");
  const [pasaranText, setPasaranText] = useState<string>("");
  const [masehiText, setMasehiText] = useState<string>("");

  const isEn = language === "en";

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setHijriText(getHijriDate(now, true, language));
    setPasaranText(getPasaranJawa(now));
    setMasehiText(
      new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    );
  }, [language]);

  const principles = t.calendar.principles;

  const upcomingIbadah = [
    {
      label: isEn ? "Voluntary Fasting" : "Puasa Sunnah",
      name: isEn ? "Monday & Thursday" : "Senin & Kamis",
      schedule: isEn ? "Weekly Routine" : "Rutin Mingguan",
      note: isEn
        ? "Righteous deeds presented before Allah SWT every Monday and Thursday."
        : "Amalan saat catatan amalan dihadapkan kepada Allah SWT.",
      badge: isEn ? "Sunnah Maqbulah" : "Sunnah Maqbulah",
    },
    {
      label: isEn ? "Mid-Month Fasting" : "Puasa Pertengahan Bulan",
      name: isEn ? "Ayyamul Bidh" : "Ayyamul Bidh",
      schedule: isEn ? "13, 14, 15 Hijri" : "13, 14, 15 Hijriyah",
      note: isEn
        ? "Multiplied fasting rewards equivalent to fasting throughout the whole year."
        : "Pahala puasa berlipat ganda laksana berpuasa sepanjang tahun.",
      badge: isEn ? "Every Month" : "Tiap Bulan",
    },
  ];

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
      <div className="bg-gradient-to-br from-white via-[#FAF8F5] to-amber-50/30 border border-stone-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        {/* Soft Ambient Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#003B73]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-stone-200/80 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#003B73] text-white shadow-xs">
                <Globe className="w-3.5 h-3.5 text-[#FCD34D]" />
                {t.calendar.badgeOfficial}
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                {t.calendar.tarjihCouncil}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
              {t.calendar.title}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2 max-w-3xl leading-relaxed">
              {t.calendar.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/ibadah"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#003B73]/20 hover:border-[#003B73] text-[#003B73] text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all group"
            >
              <span>{t.calendar.fullGuide}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 relative z-10">
          {/* Card 1: Today's Primary Date Display (Col 5) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#003B73] to-[#002855] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-blue-900/40 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs uppercase font-bold tracking-widest text-[#FCD34D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" />
                  {t.calendar.todayKhgt}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-stone-200 border border-white/20">
                  {t.calendar.globalTunggal}
                </span>
              </div>

              {/* Tanggal Hijriyah */}
              <div className="font-serif font-black text-3xl sm:text-4xl text-white tracking-tight leading-snug">
                {hijriText || (isEn ? "Loading Calendar..." : "Memuat Kalender...")}
              </div>

              {/* Pasaran Jawa & Masehi */}
              <div className="mt-3.5 pt-3.5 border-t border-white/15 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-300 font-medium">
                    {isEn ? "Javanese Pasaran:" : "Pasaran Jawa:"}
                  </span>
                  <span className="font-bold text-[#FCD34D] bg-[#001f3f]/60 px-2.5 py-0.5 rounded-md border border-amber-400/20 font-mono">
                    {pasaranText ? `${getIslamicDayName(currentDate || new Date(), language)} ${pasaranText}` : "..."}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-300 font-medium">{t.calendar.gregorian}:</span>
                  <span className="font-semibold text-white">
                    {masehiText || "..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Badge of Card 1 */}
            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-stone-300">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#FCD34D]" />
                {t.calendar.standarMasa}
              </span>
              <span className="text-[#FCD34D] font-mono font-bold">1448 H</span>
            </div>
          </div>

          {/* Card 2: Upcoming Puasa Sunnah & Ibadah Schedule (Col 4) */}
          <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-[#B58A1E]">
                    <CalendarDays className="w-4 h-4 text-[#B58A1E]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {t.calendar.fastingTitle}
                    </h3>
                    <p className="text-[11px] text-stone-500">{t.calendar.fastingDesc}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {upcomingIbadah.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80 hover:border-[#D4AF37]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-[#003B73]">
                        {item.name}
                      </span>
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-[#B58A1E] border border-amber-300/40">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-800">
                      {item.schedule}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 leading-snug">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-500">
                {t.calendar.fastingGate}
              </span>
              <Link
                href="/ibadah"
                className="text-xs text-[#003B73] hover:text-[#002855] font-bold inline-flex items-center gap-1 group"
              >
                <span>{t.calendar.fastingGuide}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Prinsip Pokok & Keunggulan KHGT (Col 3) */}
          <div className="lg:col-span-3 bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-[#003B73]/10 text-[#003B73]">
                  <BookOpen className="w-4 h-4 text-[#003B73]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {t.calendar.principlesTitle}
                  </h3>
                  <p className="text-[11px] text-stone-500">{t.calendar.principlesSubtitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                {principles.map((prinsip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {prinsip.title}
                      </div>
                      <div className="text-[11px] text-stone-500 leading-tight mt-0.5">
                        {prinsip.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
              <span>{t.calendar.principlesFooter}</span>
              <span className="font-semibold text-stone-700">{t.calendar.principlesCouncil}</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner: Edukasi & Akses Cepat */}
        <div className="mt-6 pt-5 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-stone-800">
              {t.calendar.centerNoticeTitle}
            </span>
            <span className="text-stone-600">
              {t.calendar.centerNoticeDesc}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/ibadah"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#003B73]/10 hover:bg-[#003B73]/15 text-[#003B73] font-bold text-xs transition-colors"
            >
              <span>{t.calendar.exploreButton}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
