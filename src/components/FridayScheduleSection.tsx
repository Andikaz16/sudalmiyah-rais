"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FridayOfficerSchedule } from "@/lib/types";

const fallbackFridaySchedule: FridayOfficerSchedule = {
  id: "fri-01",
  date: "Jumat, 16 Oktober 2026",
  hijriDate: "5 Rabiul Akhir 1448 H",
  khatibName: "Prof. Dr. Sofyan Anif, M.Si.",
  khatibTitle: "Rektor Universitas Muhammadiyah Surakarta",
  khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
  khutbahTheme: "Membangun Integritas Moral & Karakter Mahasiswa Muslim Berkemajuan di Era AI",
  imamName: "Ustadz Muhammad Ridwan, Al-Hafizh",
  imamRole: "Imam Rawatib Masjid Sudalmiyah Rais",
  muadzinName: "Bilal Ramadhan, S.Kom.",
  muadzinRole: "Muadzin Masjid Sudalmiyah Rais",
  time: "11:35 WIB",
  notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid, serta menata alas kaki dengan rapi di loker yang disediakan.",
  updatedAt: new Date().toISOString(),
};

export default function FridayScheduleSection() {
  const [schedule, setSchedule] = useState<FridayOfficerSchedule>(fallbackFridaySchedule);

  useEffect(() => {
    fetch("/api/friday-schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schedule) {
          setSchedule(data.schedule);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="petugas-jumat" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Petugas Shalat &amp; Khatib <span className="text-[#003B73]">Pekan Ini</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Susunan petugas khidmat dan tema khutbah Shalat Jumat berjamaah di Masjid Sudalmiyah Rais Kampus 2 UMS.
          </p>
        </div>

        {/* Officers Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Main Column: Featured Khatib Jumat Card (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-8 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all duration-300">
            <div>
              {/* Top Badge & Date Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-stone-100 mb-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#003B73] text-white shadow-sm">
                  Khatib Shalat Jumat
                </span>
                <span className="text-xs font-semibold text-[#B58A1E] font-mono">
                  {schedule.date} • {schedule.hijriDate}
                </span>
              </div>

              {/* Khatib Profile & Khutbah Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                {/* Khatib Photo Frame */}
                <div className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-md shrink-0 bg-stone-100">
                  <Image
                    src={schedule.khatibPhotoUrl || "/uploads/khatib/prof-sofyan-anif.jpg"}
                    alt={schedule.khatibName}
                    fill
                    unoptimized
                    sizes="160px"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/80 to-transparent text-center">
                    <span className="text-[10px] text-white font-semibold">Khatib Resmi</span>
                  </div>
                </div>

                {/* Khutbah Details */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Tema Khutbah Jumat
                    </span>
                    <h3 className="text-base sm:text-xl font-bold text-stone-900 font-serif leading-snug mt-1">
                      &ldquo;{schedule.khutbahTheme}&rdquo;
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Khatib
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-[#003B73]">
                      {schedule.khatibName}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {schedule.khatibTitle}
                    </p>
                  </div>

                  <div className="inline-block px-3 py-1 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-700 font-medium">
                    Waktu Mulai: <strong className="text-stone-900">{schedule.time}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Reminder */}
            {schedule.notes && (
              <div className="pt-4 border-t border-stone-100 bg-[#FAF8F5] p-3.5 rounded-2xl text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-900">Himbauan Jamaah:</strong> {schedule.notes}
              </div>
            )}
          </div>

          {/* Side Column: Imam & Muadzin Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            {/* Imam Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all duration-300">
              <div className="flex items-center justify-start mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#003B73] text-white">
                  Imam Shalat Jumat
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                {schedule.imamName}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5 mb-3">
                {schedule.imamRole}
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                Memimpin shalat fardhu Jumat berjamaah setelah khutbah kedua selesai.
              </div>
            </div>

            {/* Muadzin Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 flex flex-col justify-between hover:border-[#D4AF37]/60 transition-all duration-300">
              <div className="flex items-center justify-start mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-800 text-white">
                  Muadzin Jumat
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                {schedule.muadzinName}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5 mb-3">
                {schedule.muadzinRole}
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                Mengumandangkan adzan Shalat Jumat saat khatib menaiki mimbar serta memandu iqomah.
              </div>
            </div>

            {/* Quick Etiquette Card */}
            <div className="bg-[#FAF8F5] rounded-3xl border border-stone-200 p-5 text-xs text-stone-700 space-y-1.5">
              <span className="font-bold text-[#003B73] uppercase text-[10px] tracking-wider block">
                Adab Berjamaah Shalat Jumat
              </span>
              <p className="leading-relaxed">
                Diimbau menonaktifkan nada dering gawai, mengisi saf terdepan yang masih kosong, dan menyimak khutbah dengan khidmat.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
