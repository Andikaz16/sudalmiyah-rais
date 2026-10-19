"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { User, History, X, Clock, Calendar, ChevronLeft, ChevronRight, Coins, ArrowRight } from "lucide-react";
import { FridayOfficerSchedule } from "@/lib/types";

interface MosqueInfo {
  id: string;
  name: string;
  location: string;
  shortName: string;
}

const MOSQUE_LIST: MosqueInfo[] = [
  {
    id: "sudalmiyah",
    name: "Masjid Hj. Sudalmiyah Rais",
    location: "Kampus 2 UMS",
    shortName: "Sudalmiyah Rais",
  },
  {
    id: "fadhlurrahman",
    name: "Masjid Fadhlurrahman",
    location: "Kampus 1 UMS",
    shortName: "Fadhlurrahman",
  },
  {
    id: "mas-mansur",
    name: "Masjid KH. Mas Mansur",
    location: "Kampus 4 UMS (Pesma)",
    shortName: "KH. Mas Mansur",
  },
  {
    id: "mahad-abu-bakar",
    name: "Masjid Ma'had Abu Bakar",
    location: "Kampus 2 UMS",
    shortName: "Ma'had Abu Bakar",
  },
  {
    id: "ar-razi",
    name: "Masjid Ar-Razi FKG",
    location: "Kampus 4 UMS (FKG)",
    shortName: "Ar-Razi FKG",
  },
  {
    id: "munajat-shabran",
    name: "Masjid Munajat Shabran",
    location: "Makamhaji (Pondok Shabran)",
    shortName: "Munajat Shabran",
  },
];

const fallbackSchedules: FridayOfficerSchedule[] = [
  {
    id: "fri-sudalmiyah",
    mosqueId: "sudalmiyah",
    mosqueName: "Masjid Hj. Sudalmiyah Rais",
    mosqueLocation: "Kampus 2 UMS",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-fadhlurrahman",
    mosqueId: "fadhlurrahman",
    mosqueName: "Masjid Fadhlurrahman",
    mosqueLocation: "Kampus 1 UMS",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-mas-mansur",
    mosqueId: "mas-mansur",
    mosqueName: "Masjid KH. Mas Mansur",
    mosqueLocation: "Kampus 4 UMS (Pesma)",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-mahad-abu-bakar",
    mosqueId: "mahad-abu-bakar",
    mosqueName: "Masjid Ma'had Abu Bakar",
    mosqueLocation: "Kampus 2 UMS",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-ar-razi",
    mosqueId: "ar-razi",
    mosqueName: "Masjid Ar-Razi FKG",
    mosqueLocation: "Kampus 4 UMS (FKG)",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-munajat-shabran",
    mosqueId: "munajat-shabran",
    mosqueName: "Masjid Munajat Shabran",
    mosqueLocation: "Makamhaji (Pondok Shabran)",
    date: "Jumat Pekan Ini",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  },
];

// Arsip Awal Berdasarkan Rilis Resmi UMS (16 Oktober 2026)
const initialFridayHistory: FridayOfficerSchedule[] = [
  {
    id: "hist-20261016-sudalmiyah",
    mosqueId: "sudalmiyah",
    mosqueName: "Masjid Hj. Sudalmiyah Rais",
    mosqueLocation: "Kampus 2 UMS",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "4 Jumadilawal 1448 H",
    khatibName: "Prof. Muhammad Da'i",
    khatibTitle: "Guru Besar Farmasi UMS / Wakil Rektor",
    khatibPhotoUrl: "",
    khutbahTheme: "Meneguhkan Integritas Moral & Keteladanan Intelektual Muslim",
    imamName: "Ustadz Mahfuzh, S.Pd.I",
    imamRole: "Imam Rawatib Masjid Sudalmiyah",
    muadzinName: "Muadzin Masjid Sudalmiyah",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:40 WIB",
    notes: "Khutbah berlangsung khidmat di Ruang Utama Shalat Lantai 2 Masjid Hj. Sudalmiyah Rais Kampus 2 UMS.",
    updatedAt: "2026-10-16T13:00:00Z",
  },
  {
    id: "hist-20261016-fadhlurrahman",
    mosqueId: "fadhlurrahman",
    mosqueName: "Masjid Fadhlurrahman",
    mosqueLocation: "Kampus 1 UMS",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "4 Jumadilawal 1448 H",
    khatibName: "Dr. Muh. Nur Rochim Maksum",
    khatibTitle: "Dosen & Dai Majelis Tabligh Muhammadiyah",
    khatibPhotoUrl: "",
    khutbahTheme: "Karakter Generasi Berkemajuan Pembawa Risalah Pencerahan",
    imamName: "Imam Shalat Jumat",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Muadzin Masjid Fadhlurrahman",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:40 WIB",
    notes: "Khutbah dan shalat fardhu Jumat di Masjid Fadhlurrahman Kampus 1 UMS.",
    updatedAt: "2026-10-16T13:00:00Z",
  },
];

export default function FridayScheduleSection() {
  const [schedules, setSchedules] = useState<FridayOfficerSchedule[]>(fallbackSchedules);
  const [history, setHistory] = useState<FridayOfficerSchedule[]>(initialFridayHistory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilterMosque, setHistoryFilterMosque] = useState<string>("all");

  // Fetch schedules and history from API with anti-cache
  const fetchSchedules = useCallback(() => {
    fetch(`/api/friday-schedule?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.schedules) && data.schedules.length > 0) {
          const sanitized = data.schedules.map((s: FridayOfficerSchedule) => ({
            ...s,
            hijriDate: s.hijriDate?.replace(/Rabiul Akhir/gi, "Jumadilawal") || "5 Jumadilawal 1448 H",
          }));
          setSchedules(sanitized);
        } else if (data.success && data.schedule) {
          setSchedules((prev) => {
            const copy = [...prev];
            copy[0] = {
              ...copy[0],
              ...data.schedule,
              hijriDate: data.schedule.hijriDate?.replace(/Rabiul Akhir/gi, "Jumadilawal") || "5 Jumadilawal 1448 H",
            };
            return copy;
          });
        }

        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          setHistory(data.history);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSchedules();
    const handleFocus = () => fetchSchedules();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchSchedules]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isHistoryModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isHistoryModalOpen]);

  // Safe navigation handlers
  const totalSlides = MOSQUE_LIST.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
  };

  // Find schedule for active mosque
  const activeMosqueInfo = MOSQUE_LIST[currentIndex] || MOSQUE_LIST[0];
  const activeSchedule =
    schedules.find(
      (s) => (s.mosqueId || s.id) === activeMosqueInfo.id
    ) || schedules[currentIndex] || fallbackSchedules[0];

  // Filtered History
  const filteredHistory = history.filter((item) => {
    if (historyFilterMosque === "all") return true;
    return item.mosqueId === historyFilterMosque;
  });

  return (
    <section
      id="petugas-jumat"
      className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Petugas Imam &amp; Khatib <span className="text-[#003B73]">Pekan Ini</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2.5 leading-relaxed">
            Susunan khidmat khatib, imam, dan muadzin Shalat Jumat di 6 masjid lingkungan Universitas Muhammadiyah Surakarta. Gunakan tombol panah untuk melihat jadwal masjid lainnya.
          </p>

          {/* Button: Lihat Petugas Imam & Khatib Sebelumnya */}
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-stone-50 active:scale-95 border border-stone-300 hover:border-[#003B73] text-stone-700 hover:text-[#003B73] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#003B73]" />
              <span>Lihat Petugas Imam &amp; Khatib Sebelumnya</span>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Mosque Badge Header with Left/Right Arrows */}
          <div className="bg-gradient-to-r from-[#003B73] via-[#004B8D] to-[#002855] text-white rounded-t-3xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-[#003B73]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {currentIndex + 1}/6
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight font-serif text-white">
                  {activeMosqueInfo.name}
                </h3>
              </div>
            </div>

            {/* Navigation Controls: Prev & Next Arrow Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevSlide}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Masjid Sebelumnya"
                aria-label="Masjid Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <span className="text-xs text-white/80 font-mono font-bold px-1.5">
                {currentIndex + 1} / {totalSlides}
              </span>

              <button
                onClick={nextSlide}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Masjid Berikutnya"
                aria-label="Masjid Berikutnya"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Officers Grid Layout */}
          <div className="bg-white rounded-b-3xl border-x border-b border-stone-200/90 shadow-lg p-6 sm:p-8 transition-opacity duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              
              {/* Main Column: Featured Khatib Card (7 Cols) */}
              <div className="lg:col-span-7 bg-[#FAF8F5]/80 rounded-3xl border border-stone-200 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  {/* Top Badge & Date Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-stone-200/80 mb-5">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#003B73] text-white shadow-sm">
                      Khatib Shalat Jumat
                    </span>
                    <span className="text-xs font-semibold text-[#B58A1E] font-mono">
                      {activeSchedule.date} • {activeSchedule.hijriDate?.replace(/Rabiul Akhir/gi, "Jumadilawal") || "5 Jumadilawal 1448 H"}
                    </span>
                  </div>

                  {/* Khatib Profile & Khutbah Info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-5">
                    {/* Khatib Photo Frame */}
                    <div className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-md shrink-0 bg-stone-100 flex flex-col items-center justify-center">
                      {activeSchedule.khatibPhotoUrl ? (
                        <>
                          <Image
                            src={activeSchedule.khatibPhotoUrl}
                            alt={activeSchedule.khatibName || "Khatib"}
                            fill
                            unoptimized
                            sizes="160px"
                            className="object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/80 to-transparent text-center">
                            <span className="text-[10px] text-white font-semibold">Khatib Resmi</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-stone-400">
                          <div className="w-14 h-14 rounded-full bg-stone-200/80 flex items-center justify-center mb-2 text-stone-500">
                            <User className="w-7 h-7" />
                          </div>
                          <span className="text-[11px] font-bold text-stone-600">Foto Khatib</span>
                          <span className="text-[10px] text-stone-400 mt-0.5">Menunggu Takmir</span>
                        </div>
                      )}
                    </div>

                    {/* Khutbah Details */}
                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                          Tema Khutbah Jumat
                        </span>
                        <h4 className="text-base sm:text-xl font-bold text-stone-900 font-serif leading-snug mt-1">
                          &ldquo;{activeSchedule.khutbahTheme}&rdquo;
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-stone-200/70">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                          Khatib
                        </span>
                        <h5 className="text-base sm:text-lg font-bold text-[#003B73]">
                          {activeSchedule.khatibName}
                        </h5>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {activeSchedule.khatibTitle}
                        </p>
                      </div>

                      <div className="inline-block px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-medium shadow-sm">
                        Waktu Mulai: <strong className="text-stone-900">{activeSchedule.time}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Reminder */}
                <div className="pt-3 border-t border-stone-200/80 bg-white p-3.5 rounded-2xl text-xs text-stone-600 leading-relaxed border border-stone-200/60">
                  <strong className="text-stone-900">Himbauan Jamaah:</strong>{" "}
                  {activeSchedule.notes || "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid."}
                </div>
              </div>

              {/* Side Column: Imam & Muadzin Cards (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                {/* Imam Card */}
                <div className="bg-[#FAF8F5]/80 rounded-3xl border border-stone-200 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-start mb-2.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#003B73] text-white">
                      Imam Shalat Jumat
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                    {activeSchedule.imamName}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5 mb-2.5">
                    {activeSchedule.imamRole}
                  </p>
                  <div className="pt-2 border-t border-stone-200/70 text-[11px] text-stone-500">
                    Memimpin shalat fardhu Jumat berjamaah setelah khutbah kedua selesai.
                  </div>
                </div>

                {/* Muadzin Card */}
                <div className="bg-[#FAF8F5]/80 rounded-3xl border border-stone-200 p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-start mb-2.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-stone-800 text-white">
                      Muadzin Jumat
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                    {activeSchedule.muadzinName}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5 mb-2.5">
                    {activeSchedule.muadzinRole}
                  </p>
                  <div className="pt-2 border-t border-stone-200/70 text-[11px] text-stone-500">
                    Mengumandangkan adzan Shalat Jumat saat khatib menaiki mimbar serta memandu iqomah.
                  </div>
                </div>

                {/* Quick Etiquette Card */}
                <div className="bg-white rounded-3xl border border-stone-200 p-4 text-xs text-stone-700 space-y-1 shadow-sm">
                  <span className="font-bold text-[#003B73] uppercase text-[10px] tracking-wider block">
                    Adab Berjamaah Shalat Jumat
                  </span>
                  <p className="leading-relaxed">
                    Diimbau menonaktifkan nada dering gawai, mengisi saf terdepan yang masih kosong, dan menyimak khutbah dengan khidmat.
                  </p>
                </div>
              </div>

            </div>

            {/* Info Hasil Infaq Shalat Jumat (Fokus MSR & MFR) */}
            {(activeMosqueInfo.id === "sudalmiyah" || activeMosqueInfo.id === "fadhlurrahman") && (
              <div className="mt-6 pt-6 border-t border-stone-200/80">
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#FAF8F5] to-amber-50/30 border border-emerald-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                      <Coins className="w-5 h-5 text-emerald-100" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-700 text-white shadow-2xs">
                          Info Infaq Shalat Jumat
                        </span>
                        {activeSchedule.infaqPeriod ? (
                          <span className="text-xs font-semibold text-stone-600">
                            • {activeSchedule.infaqPeriod}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-stone-500">
                            • {activeSchedule.date}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tracking-tight">
                          {activeSchedule.infaqAmount !== undefined &&
                          activeSchedule.infaqAmount !== null &&
                          Number(activeSchedule.infaqAmount) > 0
                            ? `Rp ${Number(activeSchedule.infaqAmount).toLocaleString("id-ID")}`
                            : "Dalam Penghitungan Takmir"}
                        </span>
                        {activeSchedule.infaqAmount !== undefined &&
                          activeSchedule.infaqAmount !== null &&
                          Number(activeSchedule.infaqAmount) > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                              Terverifikasi Takmir
                            </span>
                          )}
                      </div>
                      {activeSchedule.infaqNotes && (
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {activeSchedule.infaqNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
                    <a
                      href="#donasi"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <span>Infaq Digital QRIS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Dialog: Riwayat Petugas Imam & Khatib Sebelumnya */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col text-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#003B73]/10 text-[#003B73] flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
                    Arsip Petugas Imam &amp; Khatib Jumat
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Catatan susunan petugas Shalat Jumat sebelumnya yang otomatis terarsip
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter by Mosque Pills */}
            <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-stone-100 shrink-0">
              <button
                type="button"
                onClick={() => setHistoryFilterMosque("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  historyFilterMosque === "all"
                    ? "bg-[#003B73] text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                Semua Masjid ({history.length})
              </button>
              {MOSQUE_LIST.map((m) => {
                const count = history.filter((h) => h.mosqueId === m.id).length;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHistoryFilterMosque(m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      historyFilterMosque === m.id
                        ? "bg-[#003B73] text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {m.shortName} {count > 0 ? `(${count})` : ""}
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Scrollable List of Historical Schedules */}
            <div className="py-4 overflow-y-auto space-y-4 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-xs">
                  Belum ada arsip jadwal untuk masjid yang dipilih.
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 hover:border-[#003B73]/40 transition-all space-y-3"
                  >
                    {/* Header Row: Date & Mosque */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#003B73] text-white">
                          {item.mosqueName || "Masjid Kampus UMS"}
                        </span>
                        {item.mosqueLocation && (
                          <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                            • {item.mosqueLocation}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#B58A1E] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                        {item.time && (
                          <span className="inline-flex items-center gap-1 text-stone-500 font-normal">
                            <Clock className="w-3 h-3 ml-1" />
                            {item.time}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Officer Names Row (Highlighting Khatib & Imam) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Khatib */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Khatib Shalat Jumat
                        </span>
                        <div className="text-sm font-bold text-[#003B73] mt-0.5">
                          {item.khatibName}
                        </div>
                        {item.khatibTitle && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {item.khatibTitle}
                          </div>
                        )}
                        {item.khutbahTheme && (
                          <div className="text-xs text-stone-700 italic mt-1.5 pt-1.5 border-t border-stone-100">
                            &ldquo;{item.khutbahTheme}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Imam & Muadzin */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Imam Shalat Jumat
                          </span>
                          <div className="text-sm font-bold text-stone-900 mt-0.5">
                            {item.imamName || "Imam Shalat Jumat"}
                          </div>
                          {item.imamRole && (
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              {item.imamRole}
                            </div>
                          )}
                        </div>

                        {item.muadzinName && (
                          <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-stone-400 text-[10px] uppercase font-bold">Muadzin:</span>
                            <span className="font-semibold text-stone-700">{item.muadzinName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.notes && (
                      <div className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Arsip diperbarui otomatis setiap admin mengisi jadwal baru.</span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
