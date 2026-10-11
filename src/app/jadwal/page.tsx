"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import PrayerCountdownCard from "@/components/PrayerCountdownCard";
import {
  Compass,
  Download,
  Calendar,
} from "lucide-react";
import { calculatePrayerTimes } from "@/lib/prayer-times";

export default function JadwalPage() {
  const [selectedMonth, setSelectedMonth] = useState(9); // October
  const [currentDay, setCurrentDay] = useState(10);
  const [currentMonth, setCurrentMonth] = useState(9);
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
    const times = calculatePrayerTimes(d);
    return {
      day: i + 1,
      dateFormatted: new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(d),
      isToday: mounted && currentDay === i + 1 && currentMonth === selectedMonth,
      times,
    };
  });

  const monthNames = [
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Title */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
            Jadwal Shalat & <span className="text-[#0D5C58]">Imsakiyah Surakarta</span>
          </h1>
          <p className="text-sm text-stone-500 mt-3 leading-relaxed">
            Dihitung berdasarkan hisab astronomis akurat khusus titik koordinat Masjid Sudalmiyah Rais Kampus 2 Universitas Muhammadiyah Surakarta (-7.5583° LS, 110.7719° BT) dengan standar Kementerian Agama Republik Indonesia (+2 menit ihtiyat).
          </p>
        </div>

        {/* Live Card Highlight */}
        <div className="mb-12">
          <PrayerCountdownCard />
        </div>

        {/* Monthly Calendar Section */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
                <Calendar className="w-5 h-5 text-[#B58A1E]" />
                <span>Kalender Bulanan: {monthNames[selectedMonth]} {year}</span>
              </h2>
              <span className="text-xs text-stone-500">
                Waktu Indonesia Barat (WIB)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-stone-300 text-stone-800 text-xs font-semibold focus:outline-none focus:border-[#0D5C58]"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name} {year}
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="px-6 py-2 rounded-full bg-[#0D5C58] hover:bg-[#0A4D4A] text-white text-xs font-bold shadow-sm transition-colors"
              >
                Cetak Jadwal
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase text-[11px] tracking-wider bg-[#FAF8F5]">
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-3 font-semibold text-stone-400">Imsak</th>
                  <th className="py-3 px-3 font-semibold text-[#0D5C58]">Subuh</th>
                  <th className="py-3 px-3 font-semibold text-stone-400">Terbit</th>
                  <th className="py-3 px-3 font-semibold text-stone-500">Dhuha</th>
                  <th className="py-3 px-3 font-semibold text-[#0D5C58]">Dzuhur</th>
                  <th className="py-3 px-3 font-semibold text-[#0D5C58]">Ashar</th>
                  <th className="py-3 px-3 font-semibold text-[#0D5C58]">Maghrib</th>
                  <th className="py-3 px-3 font-semibold text-[#0D5C58]">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {scheduleList.map((item) => (
                  <tr
                    key={item.day}
                    className={`transition-colors ${
                      item.isToday
                        ? "bg-[#0D5C58]/10 font-bold text-stone-900"
                        : "hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-medium whitespace-nowrap">
                      {item.dateFormatted}
                      {item.isToday && (
                        <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] bg-[#0D5C58] text-white font-bold uppercase tracking-tight">
                          Hari Ini
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-400">{item.times.Imsak}</td>
                    <td className="py-3 px-3 text-[#0D5C58] font-semibold">{item.times.Subuh}</td>
                    <td className="py-3 px-3 text-stone-400">{item.times.Terbit}</td>
                    <td className="py-3 px-3 text-stone-500">{item.times.Dhuha}</td>
                    <td className="py-3 px-3 text-[#0D5C58] font-semibold">{item.times.Dzuhur}</td>
                    <td className="py-3 px-3 text-[#0D5C58] font-semibold">{item.times.Ashar}</td>
                    <td className="py-3 px-3 text-[#0D5C58] font-semibold">{item.times.Maghrib}</td>
                    <td className="py-3 px-3 text-[#0D5C58] font-semibold">{item.times.Isya}</td>
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
