"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
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
  },
  {
    id: "fri-fadhlurrahman",
    mosqueId: "fadhlurrahman",
    mosqueName: "Masjid Fadhlurrahman",
    mosqueLocation: "Kampus 1 UMS",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dr. Syamsul Hidayat, M.Ag.",
    khatibTitle: "Dekan FAI UMS / Majelis Tarjih",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Meneladani Jejak Historis & Ruh Perjuangan Dakwah Islam Berkemajuan",
    imamName: "Ustadz H. Ahmad Dahlan, S.Pd.I.",
    imamRole: "Imam Rawatib Masjid Fadhlurrahman",
    muadzinName: "Farhan Al-Ghifari",
    muadzinRole: "Muadzin Masjid Fadhlurrahman",
    time: "11:35 WIB",
    notes: "Saf utama lantai 1 diprioritaskan bagi civitas akademika dan masyarakat sekitar. Harap parkir kendaraan dengan rapi.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-mas-mansur",
    mosqueId: "mas-mansur",
    mosqueName: "Masjid KH. Mas Mansur",
    mosqueLocation: "Kampus 4 UMS (Pesma)",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Drs. Dahlan Rais, M.Hum.",
    khatibTitle: "Ketua BPH UMS / PP Muhammadiyah",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Ukhuwah Islamiyah & Penguatan Karakter Mahasantri Berwawasan Global",
    imamName: "Ustadz Mu'tashim Billah, Lc.",
    imamRole: "Imam & Pembina Pesma KH. Mas Mansur",
    muadzinName: "Zaidan Ilham, S.Ag.",
    muadzinRole: "Muadzin Pesma KH. Mas Mansur",
    time: "11:35 WIB",
    notes: "Mahasantri Pesma wajib mengisi saf dari depan secara tertib. Dilarang membawa barang berharga tanpa pengawasan.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-mahad-abu-bakar",
    mosqueId: "mahad-abu-bakar",
    mosqueName: "Masjid Ma'had Abu Bakar",
    mosqueLocation: "Kampus 2 UMS",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Dr. Mirwan Akhmad Taufiq, M.S.I.",
    khatibTitle: "Direktur Ma'had Abu Bakar Ash-Shiddiq",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Urgensi Bahasa Al-Qur'an dan Keluhuran Adab dalam Menuntut Ilmu",
    imamName: "Syaikh Hasan Al-Yamani, Lc.",
    imamRole: "Imam Ma'had Abu Bakar",
    muadzinName: "Abdullah Azzam",
    muadzinRole: "Muadzin Ma'had Abu Bakar",
    time: "11:35 WIB",
    notes: "Khutbah disampaikan dengan pengantar bahasa Arab fusha dan terjemah ringkas. Jamaah diharapkan menjaga ketenangan.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-ar-razi",
    mosqueId: "ar-razi",
    mosqueName: "Masjid Ar-Razi FKG",
    mosqueLocation: "Kampus 4 UMS (FKG)",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "drg. Morita Sari, Sp.KG., Ph.D.",
    khatibTitle: "Dosen FKG UMS / Praktisi Kesehatan Islam",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Kesehatan Jasmani dan Ruhani sebagai Amanah Dakwah Kedokteran Islam",
    imamName: "Ustadz Fathurrahman Al-Hafizh",
    imamRole: "Imam Masjid Ar-Razi",
    muadzinName: "Ilham Ramadhan, S.KG.",
    muadzinRole: "Muadzin Masjid Ar-Razi",
    time: "11:35 WIB",
    notes: "Disediakan tempat wudhu higienis di sayap timur dan barat. Jamaah diimbau membawa sajadah pribadi.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fri-munajat-shabran",
    mosqueId: "munajat-shabran",
    mosqueName: "Masjid Munajat Shabran",
    mosqueLocation: "Makamhaji (Pondok Shabran)",
    date: "Jumat, 16 Oktober 2026",
    hijriDate: "5 Jumadilawal 1448 H",
    khatibName: "Nurul Huda, M.Ag.",
    khatibTitle: "Mudir Pondok Hajjah Nuriyah Shabran",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Menyiapkan Ulama Intelek dan Intelek Ulama untuk Kepemimpinan Umat",
    imamName: "Ustadz Saifuddin, M.Ag.",
    imamRole: "Imam Masjid Munajat Shabran",
    muadzinName: "Ibrahim Maulana",
    muadzinRole: "Muadzin Kader Shabran",
    time: "11:35 WIB",
    notes: "Shalat Jumat terbuka bagi santri, asatidz, dan masyarakat Makamhaji sekitarnya.",
    updatedAt: new Date().toISOString(),
  },
];

export default function FridayScheduleSection() {
  const [schedules, setSchedules] = useState<FridayOfficerSchedule[]>(fallbackSchedules);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Fetch schedules from API
  useEffect(() => {
    fetch("/api/friday-schedule")
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
      })
      .catch(() => {});
  }, []);

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

  return (
    <section
      id="petugas-jumat"
      className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Petugas Shalat &amp; Khatib <span className="text-[#003B73]">Pekan Ini</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2.5 leading-relaxed">
            Susunan khidmat khatib, imam, dan muadzin Shalat Jumat di 6 masjid lingkungan Universitas Muhammadiyah Surakarta. Gunakan tombol panah untuk melihat jadwal masjid lainnya.
          </p>
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
                <h3 className="text-base sm:text-xl font-bold tracking-tight font-serif text-white">
                  {activeMosqueInfo.name}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  Lokasi: {activeMosqueInfo.location}
                </p>
              </div>
            </div>

            {/* Navigation Controls: Prev & Next Arrow Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevSlide}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Masjid Sebelumnya"
                aria-label="Masjid Sebelumnya"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <span className="text-xs text-white/80 font-mono font-bold px-1.5">
                {currentIndex + 1} / {totalSlides}
              </span>

              <button
                onClick={nextSlide}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Masjid Berikutnya"
                aria-label="Masjid Berikutnya"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
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
                    <div className="relative w-36 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-md shrink-0 bg-stone-100">
                      <Image
                        src={activeSchedule.khatibPhotoUrl || "/uploads/khatib/prof-sofyan-anif.jpg"}
                        alt={activeSchedule.khatibName}
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
                {activeSchedule.notes && (
                  <div className="pt-3 border-t border-stone-200/80 bg-white p-3.5 rounded-2xl text-xs text-stone-600 leading-relaxed border border-stone-200/60">
                    <strong className="text-stone-900">Himbauan Jamaah:</strong> {activeSchedule.notes}
                  </div>
                )}
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
          </div>
        </div>

      </div>
    </section>
  );
}
