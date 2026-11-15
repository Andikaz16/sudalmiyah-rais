"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import PrayerCountdownCard from "@/components/PrayerCountdownCard";
import {
  Calendar,
  Info,
  Sparkles,
} from "lucide-react";
import {
  calculatePrayerTimes,
  CALCULATION_STANDARDS,
  getHijriDate,
  getPasaranJawa,
  getIslamicDayName,
} from "@/lib/prayer-times";
import { useLanguage } from "@/context/LanguageContext";

export default function JadwalPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [selectedMonth, setSelectedMonth] = useState(10); // November default
  const [currentDay, setCurrentDay] = useState(15);
  const [currentMonth, setCurrentMonth] = useState(10);
  const [mounted, setMounted] = useState(false);

  const year = 2026;

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setCurrentMonth(now.getMonth());
    setCurrentDay(now.getDate());
  }, []);

  const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate();
  const scheduleList = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, selectedMonth, i + 1);
    const times = calculatePrayerTimes(d, "tarjih");
    const hijriFormatted = getHijriDate(d, false, language);
    const pasaran = getPasaranJawa(d);
    const dayName = getIslamicDayName(d, language);
    return {
      day: i + 1,
      dateFormatted: new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
        day: "numeric",
        month: "short",
      }).format(d),
      dayName,
      pasaran,
      hijriFormatted,
      isToday: mounted && currentDay === i + 1 && currentMonth === selectedMonth,
      times,
    };
  });

  const monthNamesId = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNames = isEn ? monthNamesEn : monthNamesId;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Title */}
        <div className="mb-8 text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
            {isEn ? (
              <>
                Prayer Times &amp; <span className="text-[#003B73]">Surakarta Imsakiyah</span>
              </>
            ) : (
              <>
                Jadwal Shalat &amp; <span className="text-[#003B73]">Imsakiyah Surakarta</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {isEn
              ? "Calculated based on genuine astronomical hisab for coordinates of Sudalmiyah Rais Mosque Campus 2 Universitas Muhammadiyah Surakarta (-7.5583° S, 110.7719° E) in accordance with the 31st Munas Tarjih PP Muhammadiyah decree (Subuh -18°, Isha -18°, Ihtiyat +2 minutes)."
              : "Dihitung berdasarkan hisab hakiki astronomis titik koordinat Masjid Sudalmiyah Rais Kampus 2 Universitas Muhammadiyah Surakarta (-7.5583° LS, 110.7719° BT) sesuai Putusan Munas Tarjih PP Muhammadiyah ke-31 (Subuh -18°, Isya -18°, Ihtiyat +2 menit)."}
          </p>
        </div>

        {/* Live Card Highlight */}
        <div className="mb-10">
          <PrayerCountdownCard />
        </div>

        {/* Monthly Calendar Section */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
                <Calendar className="w-5 h-5 text-[#B58A1E]" />
                <span>
                  {isEn ? "Monthly Schedule:" : "Kalender Bulanan:"} {monthNames[selectedMonth]} {year}
                </span>
              </h2>
              <span className="text-xs text-stone-500">
                {isEn ? "Western Indonesia Time (WIB)" : "Waktu Indonesia Barat (WIB)"} • {CALCULATION_STANDARDS.tarjih.shortName}
              </span>
            </div>

            {/* Controls: Official MASA Badge, Month Select, Print */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Official MASA / KHGT Standard Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#003B73]/10 text-[#003B73] rounded-xl border border-[#003B73]/25 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#B58A1E]" />
                <span>
                  {isEn ? "MASA & KHGT Muhammadiyah" : "Standar Resmi MASA & KHGT"}
                </span>
              </div>

              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-stone-300 text-stone-800 text-xs font-semibold focus:outline-none focus:border-[#003B73] cursor-pointer"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name} {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#003B73] hover:bg-[#002855] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {isEn ? "Print Schedule" : "Cetak Jadwal"}
              </button>
            </div>
          </div>

          {/* Educational Note: MASA & KHGT Muhammadiyah */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#003B73]">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {isEn
                  ? "Official Synchronization with MASA (Muhammadiyah Super App) & KHGT PP Muhammadiyah:"
                  : "Sinkronisasi Penuh Aplikasi Resmi MASA (Muhammadiyah Super App) & KHGT PP Muhammadiyah:"}
              </span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
              {isEn ? (
                <>
                  Both the Hijri calendar dates and the 5 daily prayer times on this portal strictly adhere to the <strong>Single Unified Global Hijri Calendar (KHGT)</strong> and the <strong>31st Munas Tarjih PP Muhammadiyah Decree</strong> (Fajr angle <strong>-18°</strong>, Isha <strong>-18°</strong>, Ihtiyat <strong>+2 minutes</strong>), 100% synchronized with the official <strong>MASA (Muhammadiyah Super App)</strong>.
                </>
              ) : (
                <>
                  Seluruh penanggalan Hijriyah dan jadwal waktu shalat pada portal ini mengacu 100% pada <strong>Kalender Hijriah Global Tunggal (KHGT)</strong> serta <strong>Keputusan Munas Tarjih Muhammadiyah ke-31</strong> (sudut Subuh <strong>-18°</strong>, Isya <strong>-18°</strong>, Ihtiyat <strong>+2 menit</strong>) sebagaimana tertera pada aplikasi resmi <strong>MASA (Muhammadiyah Super App)</strong>.
                </>
              )}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase text-[11px] tracking-wider bg-[#FAF8F5]">
                  <th className="py-3 px-4 font-semibold">{isEn ? "Gregorian Date" : "Tanggal Masehi"}</th>
                  <th className="py-3 px-4 font-semibold text-[#B58A1E]">{isEn ? "Hijri Date (KHGT MASA)" : "Tanggal Hijriyah (KHGT MASA)"}</th>
                  <th className="py-3 px-3 font-semibold text-stone-400">Imsak</th>
                  <th className="py-3 px-3 font-semibold text-[#003B73]">{isEn ? "Fajr" : "Subuh"}</th>
                  <th className="py-3 px-3 font-semibold text-stone-400">{isEn ? "Sunrise" : "Terbit"}</th>
                  <th className="py-3 px-3 font-semibold text-stone-500">Dhuha</th>
                  <th className="py-3 px-3 font-semibold text-[#003B73]">Dzuhur</th>
                  <th className="py-3 px-3 font-semibold text-[#003B73]">Ashar</th>
                  <th className="py-3 px-3 font-semibold text-[#003B73]">Maghrib</th>
                  <th className="py-3 px-3 font-semibold text-[#003B73]">{isEn ? "Isha" : "Isya"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {scheduleList.map((item) => (
                  <tr
                    key={item.day}
                    className={`transition-colors ${
                      item.isToday
                        ? "bg-[#003B73]/10 font-bold text-stone-900"
                        : "hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-medium whitespace-nowrap">
                      <span className="font-semibold text-stone-900">{item.dayName}</span>{" "}
                      <span className="text-stone-500 text-xs">({item.pasaran})</span>,{" "}
                      <span>{item.dateFormatted}</span>
                      {item.isToday && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] bg-[#003B73] text-white font-bold uppercase tracking-tight">
                          {isEn ? "Today" : "Hari Ini"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-[#B58A1E] whitespace-nowrap">
                      {item.hijriFormatted}
                    </td>
                    <td className="py-3 px-3 text-stone-400">{item.times.Imsak}</td>
                    <td className="py-3 px-3 text-[#003B73] font-semibold">{item.times.Subuh}</td>
                    <td className="py-3 px-3 text-stone-400">{item.times.Terbit}</td>
                    <td className="py-3 px-3 text-stone-500">{item.times.Dhuha}</td>
                    <td className="py-3 px-3 text-[#003B73] font-semibold">{item.times.Dzuhur}</td>
                    <td className="py-3 px-3 text-[#003B73] font-semibold">{item.times.Ashar}</td>
                    <td className="py-3 px-3 text-[#003B73] font-semibold">{item.times.Maghrib}</td>
                    <td className="py-3 px-3 text-[#003B73] font-semibold">{item.times.Isya}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
