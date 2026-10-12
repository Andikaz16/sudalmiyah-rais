"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import QuranIcon from "@/components/QuranIcon";
import TasbihIcon from "@/components/TasbihIcon";
import TilawahIcon from "@/components/TilawahIcon";
import DoaIcon from "@/components/DoaIcon";
import KiblatIcon from "@/components/KiblatIcon";
import KiblatCompass from "@/components/KiblatCompass";
import AsmaulHusnaIcon from "@/components/AsmaulHusnaIcon";
import ZakatCalculator from "@/components/ZakatCalculator";
import {
  SURAH_LIST,
  JUZ_LIST,
  getJuzSurahSegment,
  ASMAUL_HUSNA,
  DOA_LIST,
  HADITS_LIST,
  PANDUAN_SHALAT,
  SurahMeta,
  JuzMeta,
  DoaItem,
  HaditsItem,
  PanduanShalatItem,
} from "@/lib/ibadah-data";

type FeatureKey =
  | "quran"
  | "tasbih"
  | "tilawah"
  | "doa"
  | "kiblat"
  | "asmaul-husna"
  | "zakat"
  | "kalender"
  | "panduan-shalat"
  | "hadits";

interface FeatureCard {
  id: FeatureKey;
  title: string;
  shortDesc: string;
  badge: string;
  iconSymbol: string;
}

const FEATURE_LIST: FeatureCard[] = [
  {
    id: "quran",
    title: "Al-Qur'an Digital",
    shortDesc: "Mushaf 114 surat & 30 juz, teks Arab, latin & terjemahan Kemenag",
    badge: "114 Surat & 30 Juz",
    iconSymbol: "القرآن",
  },
  {
    id: "tasbih",
    title: "Tasbih Digital",
    shortDesc: "Penghitung dzikir sentuh interaktif dengan getar & target",
    badge: "Counter Dzikir",
    iconSymbol: "سبحة",
  },
  {
    id: "tilawah",
    title: "Audio Tilawah",
    shortDesc: "Murottal merdu 114 surat dengan qari terkemuka",
    badge: "Murottal Merdu",
    iconSymbol: "تلاوة",
  },
  {
    id: "doa",
    title: "Doa & Dzikir Harian",
    shortDesc: "Kumpulan doa shahih Hisnul Muslim dan dzikir pagi petang",
    badge: "Hisnul Muslim",
    iconSymbol: "دعاء",
  },
  {
    id: "kiblat",
    title: "Arah Kiblat",
    shortDesc: "Kompas azimut 294.3° Surakarta & Kampus UMS",
    badge: "294.3° Barat Laut",
    iconSymbol: "القبلة",
  },
  {
    id: "asmaul-husna",
    title: "Asmaul Husna",
    shortDesc: "99 Nama Agung Allah, kaligrafi, makna & fadhilah",
    badge: "99 Nama Agung",
    iconSymbol: "الأسماء",
  },
  {
    id: "zakat",
    title: "Kalkulator Zakat",
    shortDesc: "Standar resmi BAZNAS RI 2026: penghasilan, maal, fitrah, fidyah & pertanian",
    badge: "Standar BAZNAS RI",
    iconSymbol: "زكاة",
  },
  {
    id: "kalender",
    title: "Kalender Hijriyah",
    shortDesc: "Penanggalan Islam & jadwal puasa sunnah Senin-Kamis",
    badge: "Puasa Sunnah",
    iconSymbol: "تقويم",
  },
  {
    id: "panduan-shalat",
    title: "Panduan Shalat",
    shortDesc: "Tuntunan wudhu & shalat sesuai Tarjih Muhammadiyah",
    badge: "Tarjih HPT",
    iconSymbol: "صلاة",
  },
  {
    id: "hadits",
    title: "Hadits Pilihan",
    shortDesc: "Koleksi Hadits Arba'in An-Nawawiyah & intisari fawaid",
    badge: "Arba'in Nawawiyah",
    iconSymbol: "حديث",
  },
];

export default function IbadahPage() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);

  // Close feature view with ESC to return to menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveFeature(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentFeat = FEATURE_LIST.find((f) => f.id === activeFeature);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full pb-24 md:pb-20">
        {/* VIEW 1: Main Menu Grid (when activeFeature === null) */}
        {activeFeature === null ? (
          <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-white via-white to-[#FAF8F5] border-b border-stone-200/80 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight animate-fade-up">
                  Ruang Ibadah <span className="text-[#0D5C58]">Digital</span>
                </h1>
                <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-2xl mx-auto font-sans animate-fade-up delay-150">
                  Kumpulan piranti penunjang ibadah harian jamaah Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta untuk memperkaya kedekatan spiritual setiap saat.
                </p>
              </div>
            </section>

            {/* 10 Feature Tiles Section: 3 Columns on Mobile, 5 Columns on Laptop */}
            <section className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-8 sm:pt-12">
              <div className="mb-5 sm:mb-7 px-1 animate-fade-up delay-200">
                <h2 className="text-lg sm:text-2xl font-bold text-stone-900 font-serif">
                  Menu Layanan Ibadah
                </h2>
                <p className="text-xs sm:text-sm text-stone-500">
                  Pilih salah satu kotak untuk membuka fitur ibadah digital.
                </p>
              </div>

              {/* GRID: grid-cols-3 on mobile, lg:grid-cols-5 on laptop with Staggered Entrance */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
                {FEATURE_LIST.map((feat, idx) => (
                  <button
                    key={feat.id}
                    onClick={() => {
                      setActiveFeature(feat.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{ animationDelay: `${idx * 45}ms` }}
                    className="group relative bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-between text-center shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden aspect-square sm:aspect-auto sm:min-h-[200px] animate-fade-up"
                  >
                    {/* Decorative background glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D5C58]/5 via-transparent to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Top Badge (Hidden on mobile for clean app-icon look, visible on desktop) */}
                    <div className="hidden sm:flex w-full justify-end">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-[#0D5C58] group-hover:text-white transition-colors">
                        {feat.badge}
                      </span>
                    </div>

                    {/* Central Icon Box (App-Icon style with custom icons or Arabic text) */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0D5C58]/10 border border-[#0D5C58]/20 text-[#0D5C58] group-hover:bg-[#0D5C58] group-hover:text-white group-hover:border-[#0D5C58] group-hover:scale-110 transition-all duration-300 flex items-center justify-center font-serif text-base sm:text-xl font-bold shadow-inner my-auto sm:my-2">
                      {feat.id === "quran" ? (
                        <QuranIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : feat.id === "tasbih" ? (
                        <TasbihIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : feat.id === "tilawah" ? (
                        <TilawahIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : feat.id === "doa" ? (
                        <DoaIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : feat.id === "kiblat" ? (
                        <KiblatIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : feat.id === "asmaul-husna" ? (
                        <AsmaulHusnaIcon className="w-7 h-7 sm:w-9 sm:h-9" />
                      ) : (
                        <span className="leading-none select-none tracking-normal">
                          {feat.iconSymbol}
                        </span>
                      )}
                    </div>

                    {/* Title & Short Description */}
                    <div className="w-full">
                      <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#0D5C58] transition-colors line-clamp-2 leading-tight">
                        {feat.title}
                      </h3>
                      <p className="hidden sm:block text-[11px] text-stone-500 mt-1 line-clamp-2 leading-snug">
                        {feat.shortDesc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          /* VIEW 2: In-Page Full Feature View (Not a pop-up modal) */
          <div className="animate-fade-in">
            {/* Header In-Page Navigation Bar */}
            <section className="bg-white border-b border-stone-200/90 py-4 sm:py-5 sticky top-16 z-30 shadow-xs animate-fade-down">
              <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
                <div className="flex items-center justify-between gap-3">
                  {/* Back button (Arrow Icon) + Title */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveFeature(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-stone-200 shrink-0"
                      title="Kembali ke Menu Ruang Ibadah"
                      aria-label="Kembali ke Menu Ruang Ibadah"
                    >
                      <svg
                        className="w-5 h-5 text-stone-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                        />
                      </svg>
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                          Ruang Ibadah
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] font-semibold text-[#0D5C58]">
                          {currentFeat?.badge}
                        </span>
                      </div>
                      <h1 className="text-base sm:text-xl font-bold text-stone-900 font-serif leading-tight flex items-center gap-2">
                        {currentFeat?.id === "quran" && (
                          <QuranIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        {currentFeat?.id === "tasbih" && (
                          <TasbihIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        {currentFeat?.id === "tilawah" && (
                          <TilawahIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        {currentFeat?.id === "doa" && (
                          <DoaIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        {currentFeat?.id === "kiblat" && (
                          <KiblatIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        {currentFeat?.id === "asmaul-husna" && (
                          <AsmaulHusnaIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D5C58] shrink-0" />
                        )}
                        <span>{currentFeat?.title}</span>
                      </h1>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-xs text-stone-500">
                    <span>Masjid Sudalmiyah Rais UMS</span>
                  </div>
                </div>
              </div>
            </section>

            {/* In-Page Feature Content Container: Full Width tanpa border pembungkus */}
            <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-8">
              <div className="w-full text-stone-800">
                {activeFeature === "quran" && <QuranFeatureView />}
                {activeFeature === "tasbih" && <TasbihFeatureView />}
                {activeFeature === "tilawah" && <TilawahFeatureView />}
                {activeFeature === "doa" && <DoaFeatureView />}
                {activeFeature === "kiblat" && <KiblatFeatureView />}
                {activeFeature === "asmaul-husna" && <AsmaulHusnaFeatureView />}
                {activeFeature === "zakat" && <ZakatFeatureView />}
                {activeFeature === "kalender" && <KalenderFeatureView />}
                {activeFeature === "panduan-shalat" && <PanduanShalatFeatureView />}
                {activeFeature === "hadits" && <HaditsFeatureView />}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

// -------------------------------------------------------------
// 1. Al-Qur'an Digital View (Berdasarkan Surat & Berdasarkan Juz)
// -------------------------------------------------------------
interface QuranSettings {
  arabicSize: "sm" | "md" | "lg" | "xl";
  showLatin: boolean;
  latinSize: "sm" | "md" | "lg";
  showTranslation: boolean;
  translationSize: "sm" | "md" | "lg";
}

interface JuzReadingContext {
  juzNumber: number;
  juzName: string;
  startAyah: number;
  endAyah: number;
  surahNumber: number;
}

function QuranFeatureView() {
  const [viewMode, setViewMode] = useState<"surat" | "juz">("surat");
  const [searchSurah, setSearchSurah] = useState("");
  const [searchJuz, setSearchJuz] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<{
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    arti: string;
    tempatTurun: string;
    ayat: {
      nomorAyat: number;
      teksArab: string;
      teksLatin: string;
      teksIndonesia: string;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<QuranSettings>({
    arabicSize: "md",
    showLatin: true,
    latinSize: "md",
    showTranslation: true,
    translationSize: "md",
  });

  // Juz Reading Context State
  const [juzContext, setJuzContext] = useState<JuzReadingContext | null>(null);
  const [onlyJuzVerses, setOnlyJuzVerses] = useState<boolean>(true);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mushaf_settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const updateSettings = (newSettings: QuranSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("mushaf_settings", JSON.stringify(newSettings));
    } catch {}
  };

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSurah.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchSurah.toLowerCase()) ||
      s.number.toString().includes(searchSurah)
  );

  const filteredJuz = JUZ_LIST.filter((j) => {
    const q = searchJuz.toLowerCase();
    const matchNumber = j.number.toString().includes(q);
    const matchName = j.name.toLowerCase().includes(q);
    const matchArabic = j.arabicName.includes(q);
    const matchStart = j.startSurahName.toLowerCase().includes(q);
    const matchEnd = j.endSurahName.toLowerCase().includes(q);
    const matchSurahs = j.surahNumbers.some((num) => {
      const s = SURAH_LIST.find((item) => item.number === num);
      return s ? s.name.toLowerCase().includes(q) : false;
    });
    return (
      matchNumber ||
      matchName ||
      matchArabic ||
      matchStart ||
      matchEnd ||
      matchSurahs
    );
  });

  const handleOpenSurah = async (surahNumber: number, targetAyah?: number) => {
    setSelectedSurah(surahNumber);
    setLoading(true);
    setSurahDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${surahNumber}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSurahDetail(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      if (targetAyah && targetAyah > 1) {
        setTimeout(() => {
          const el = document.getElementById(`ayah-${targetAyah}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 350);
      }
    }
  };

  const handleOpenRegularSurah = (surahNumber: number) => {
    setJuzContext(null);
    handleOpenSurah(surahNumber);
  };

  const handleOpenJuzSurah = (juzNumber: number, surahNumber: number) => {
    const juz = JUZ_LIST.find((j) => j.number === juzNumber);
    const segment = getJuzSurahSegment(juzNumber, surahNumber);
    if (juz && segment) {
      setJuzContext({
        juzNumber,
        juzName: juz.name,
        startAyah: segment.startAyah,
        endAyah: segment.endAyah,
        surahNumber,
      });
      setOnlyJuzVerses(true);
      handleOpenSurah(surahNumber, segment.startAyah);
    } else {
      setJuzContext(null);
      handleOpenSurah(surahNumber);
    }
  };

  // Helper font size classes
  const getArabicClass = () => {
    switch (settings.arabicSize) {
      case "sm":
        return "text-2xl sm:text-3xl leading-[2.4]";
      case "lg":
        return "text-4xl sm:text-5xl leading-[2.8]";
      case "xl":
        return "text-5xl sm:text-6xl leading-[3.1]"; // Mode lansia
      case "md":
      default:
        return "text-3xl sm:text-4xl leading-[2.6]";
    }
  };

  const getLatinClass = () => {
    switch (settings.latinSize) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base font-medium";
      case "md":
      default:
        return "text-sm";
    }
  };

  const getTranslationClass = () => {
    switch (settings.translationSize) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-base";
      case "md":
      default:
        return "text-sm";
    }
  };

  // Ayahs to display (filtered by Juz if onlyJuzVerses is active)
  const displayedAyahs =
    surahDetail && juzContext && onlyJuzVerses
      ? surahDetail.ayat.filter(
          (a) =>
            a.nomorAyat >= juzContext.startAyah &&
            a.nomorAyat <= juzContext.endAyah
        )
      : surahDetail?.ayat || [];

  return (
    <div className="space-y-6">
      {/* Jika Surat sedang dibuka untuk dibaca */}
      {selectedSurah ? (
        <div>
          {/* Header Bar Baca Surat */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-stone-200 mb-6 gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedSurah(null);
                  setJuzContext(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <svg
                  className="w-4 h-4 text-stone-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                <span>Daftar Al-Qur'an</span>
              </button>

              {/* Tombol Pengaturan (Icon Gerigi) */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer border border-stone-200 shadow-xs"
                title="Pengaturan Huruf & Tampilan"
              >
                <svg
                  className="w-4 h-4 text-stone-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Pengaturan Font</span>
                <span className="sm:hidden text-xs">Font</span>
              </button>
            </div>

            {surahDetail && (
              <div className="md:text-right">
                <span className="text-xs text-stone-500 block">
                  Surat Ke-{surahDetail.nomor} • {surahDetail.jumlahAyat} Ayat •{" "}
                  {surahDetail.tempatTurun}
                </span>
                <h3 className="font-bold text-stone-900 font-serif text-lg sm:text-xl">
                  {surahDetail.namaLatin} ({surahDetail.nama}) - {surahDetail.arti}
                </h3>
              </div>
            )}
          </div>

          {/* Banner Context Jika Sedang Membaca Berdasarkan Juz */}
          {juzContext && surahDetail && (
            <div className="p-4 rounded-2xl bg-[#0D5C58]/10 border border-[#0D5C58]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D5C58] text-white">
                    Juz {juzContext.juzNumber}
                  </span>
                  <span className="text-xs font-bold text-[#0D5C58]">
                    {juzContext.juzName}
                  </span>
                </div>
                <p className="text-xs text-stone-700 mt-1">
                  Cakupan Ayat dalam Juz Ini: Surat {surahDetail.namaLatin} Ayat{" "}
                  {juzContext.startAyah} sampai {juzContext.endAyah}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyJuzVerses(!onlyJuzVerses)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {onlyJuzVerses
                    ? `Tampilkan Seluruh Surat (Ayat 1 - ${surahDetail.jumlahAyat})`
                    : `Hanya Ayat Juz ${juzContext.juzNumber} (${juzContext.startAyah} - ${juzContext.endAyah})`}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-20 text-center text-stone-500 text-sm">
              Memuat ayat Al-Qur'an...
            </div>
          )}

          {!loading && surahDetail && (
            <div className="space-y-6">
              {/* Basmalah Banner */}
              {juzContext && juzContext.startAyah > 1 ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0D5C58]/5 border border-[#0D5C58]/15 text-center mb-6 space-y-1">
                  <p className="font-serif text-xl sm:text-2xl text-[#0D5C58]">
                    أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ • بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <p className="text-xs text-stone-500 font-sans">
                    Memulai tilawah Juz {juzContext.juzNumber} dari Ayat {juzContext.startAyah}.
                  </p>
                </div>
              ) : surahDetail.nomor !== 1 && surahDetail.nomor !== 9 ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0D5C58]/5 border border-[#0D5C58]/15 text-center mb-6">
                  <p className="font-serif text-2xl sm:text-3xl text-[#0D5C58]">
                    بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  <p className="text-xs text-stone-500 mt-1 font-sans">
                    Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
                  </p>
                </div>
              ) : null}

              {/* Daftar Ayat */}
              <div className="space-y-4">
                {displayedAyahs.map((ayah) => {
                  const isJuzStart =
                    juzContext && ayah.nomorAyat === juzContext.startAyah;
                  return (
                    <div
                      key={ayah.nomorAyat}
                      id={`ayah-${ayah.nomorAyat}`}
                      className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all space-y-3 ${
                        isJuzStart
                          ? "border-[#0D5C58] ring-2 ring-[#0D5C58]/20 shadow-md"
                          : "border-stone-200/90 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-[#0D5C58]/10 text-[#0D5C58] font-bold text-xs flex items-center justify-center font-mono">
                            {ayah.nomorAyat}
                          </span>
                          {isJuzStart && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D5C58] text-white">
                              Awal Bacaan Juz {juzContext.juzNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-400">
                          Ayat {ayah.nomorAyat}
                        </span>
                      </div>

                      {/* Teks Arab dengan Ukuran Font Dinamis */}
                      <p
                        className={`font-serif text-right text-stone-900 tracking-normal pt-2 ${getArabicClass()}`}
                      >
                        {ayah.teksArab}
                      </p>

                      {/* Teks Latin Transliterasi */}
                      {settings.showLatin && (
                        <p
                          className={`text-[#0D5C58] italic font-sans leading-relaxed pt-1 ${getLatinClass()}`}
                        >
                          {ayah.teksLatin}
                        </p>
                      )}

                      {/* Teks Terjemahan Bahasa Indonesia */}
                      {settings.showTranslation && (
                        <p
                          className={`text-stone-700 font-sans leading-relaxed pt-2 border-t border-stone-100 ${getTranslationClass()}`}
                        >
                          {ayah.teksIndonesia}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigasi Bawah Antar Surat & Juz */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-stone-200">
                <button
                  onClick={() => {
                    setSelectedSurah(null);
                    setJuzContext(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Kembali ke Daftar Al-Qur'an
                </button>

                {/* Logika Navigasi Lanjutan untuk Mode Juz */}
                {juzContext ? (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {(() => {
                      const currentJuzObj = JUZ_LIST.find(
                        (j) => j.number === juzContext.juzNumber
                      );
                      if (!currentJuzObj) return null;
                      const sIdx = currentJuzObj.surahNumbers.indexOf(
                        surahDetail.nomor
                      );

                      return (
                        <>
                          {sIdx > 0 && (
                            <button
                              onClick={() =>
                                handleOpenJuzSurah(
                                  juzContext.juzNumber,
                                  currentJuzObj.surahNumbers[sIdx - 1]
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Surat Sebelumnya dalam Juz {juzContext.juzNumber}
                            </button>
                          )}
                          {sIdx < currentJuzObj.surahNumbers.length - 1 ? (
                            <button
                              onClick={() =>
                                handleOpenJuzSurah(
                                  juzContext.juzNumber,
                                  currentJuzObj.surahNumbers[sIdx + 1]
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-[#0D5C58] hover:bg-[#094340] text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Lanjut Surat Berikutnya dalam Juz {juzContext.juzNumber}
                            </button>
                          ) : juzContext.juzNumber < 30 ? (
                            <button
                              onClick={() => {
                                const nextJuz = JUZ_LIST.find(
                                  (j) => j.number === juzContext.juzNumber + 1
                                );
                                if (nextJuz) {
                                  handleOpenJuzSurah(
                                    nextJuz.number,
                                    nextJuz.startSurahNumber
                                  );
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-[#0D5C58] hover:bg-[#094340] text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Selesai Juz {juzContext.juzNumber} • Lanjut ke Juz{" "}
                              {juzContext.juzNumber + 1}
                            </button>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {selectedSurah > 1 && (
                      <button
                        onClick={() => handleOpenRegularSurah(selectedSurah - 1)}
                        className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Surat Sebelumnya
                      </button>
                    )}
                    {selectedSurah < 114 && (
                      <button
                        onClick={() => handleOpenRegularSurah(selectedSurah + 1)}
                        className="px-4 py-2 rounded-xl bg-[#0D5C58] hover:bg-[#094340] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Surat Berikutnya
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Jika belum memilih surat: Tab Switcher Surat & Juz (Full Width Grids) */
        <div className="space-y-5">
          {/* Segmented Switcher (Daftar Surat & Daftar Juz) + Tombol Pengaturan Font */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 border-b border-stone-200/90 pb-3">
            {/* Segmented Tab Bar (50% - 50% di Mobile, max-w-md di Desktop) */}
            <div className="flex-1 max-w-md bg-stone-100/90 border border-stone-200/90 p-1 rounded-2xl flex items-center">
              <button
                onClick={() => setViewMode("surat")}
                className={`flex-1 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                  viewMode === "surat"
                    ? "bg-[#0D5C58] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>Daftar Surat</span>
                <span className="ml-1 text-[11px] font-normal opacity-85">(114)</span>
              </button>
              <button
                onClick={() => setViewMode("juz")}
                className={`flex-1 py-2 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all cursor-pointer ${
                  viewMode === "juz"
                    ? "bg-[#0D5C58] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <span>Daftar Juz</span>
                <span className="ml-1 text-[11px] font-normal opacity-85">(30)</span>
              </button>
            </div>

            {/* Tombol Pengaturan Font (Sejajar dalam 1 Baris) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="h-10 px-3 sm:px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
              title="Pengaturan Huruf & Tampilan Al-Qur'an"
              aria-label="Pengaturan Huruf & Tampilan Al-Qur'an"
            >
              <svg
                className="w-4 h-4 text-stone-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="hidden sm:inline">Pengaturan Font</span>
              <span className="sm:hidden text-xs">Font</span>
            </button>
          </div>

          {/* TAB 1: Berdasarkan Surat (Penuh Layar hingga 6 Kolom di Monitor Besar) */}
          {viewMode === "surat" && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchSurah}
                  onChange={(e) => setSearchSurah(e.target.value)}
                  placeholder="Cari nama surat, terjemahan, atau nomor (misal: Kahf, Yasin, 67)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:outline-none focus:border-[#0D5C58] bg-white shadow-2xs"
                />
              </div>

              {/* Grid 114 Surat: Responsif penuh layar lebar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3.5">
                {filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleOpenRegularSurah(surah.number)}
                    className="w-full text-left p-4 rounded-2xl border border-stone-200 hover:border-[#0D5C58] hover:bg-[#0D5C58]/5 transition-all flex items-center justify-between group cursor-pointer bg-white shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-8 h-8 rounded-xl bg-stone-100 group-hover:bg-[#0D5C58] group-hover:text-white transition-colors text-stone-700 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                        {surah.number}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#0D5C58] truncate">
                          {surah.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 truncate">
                          {surah.translation} • {surah.numberOfAyahs} Ayat
                        </p>
                      </div>
                    </div>
                    <span className="font-serif text-lg text-stone-800 group-hover:text-[#0D5C58] shrink-0 font-bold">
                      {surah.arabicName}
                    </span>
                  </button>
                ))}
              </div>

              {filteredSurahs.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-sm">
                  Tidak ditemukan surat yang cocok dengan kata kunci "{searchSurah}".
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Berdasarkan Juz (Penuh Layar hingga 4 Kolom di Monitor Besar) */}
          {viewMode === "juz" && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchJuz}
                  onChange={(e) => setSearchJuz(e.target.value)}
                  placeholder="Cari nomor juz, nama juz, atau nama surat (misal: Juz 30, Amma, Al-Mulk)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:outline-none focus:border-[#0D5C58] bg-white shadow-2xs"
                />
              </div>

              {/* Grid 30 Juz: 4 Kolom di Desktop/Laptop Lebar */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredJuz.map((juz) => {
                  const isExpanded = expandedJuz === juz.number;
                  return (
                    <div
                      key={juz.number}
                      className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-[#0D5C58] transition-all space-y-3.5 shadow-2xs hover:shadow-sm"
                    >
                      {/* Baris Atas: Badge Juz & Kaligrafi Arab */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#0D5C58]/10 text-[#0D5C58] font-bold text-xs">
                            Juz {juz.number}
                          </span>
                          <span className="text-xs text-stone-400">
                            {juz.surahNumbers.length} Surat
                          </span>
                        </div>
                        <span className="font-serif text-base text-[#0D5C58] font-bold">
                          {juz.arabicName}
                        </span>
                      </div>

                      {/* Judul Juz & Rentang Ayat */}
                      <div>
                        <h4 className="font-bold text-stone-900 text-base font-serif">
                          {juz.name}
                        </h4>
                        <div className="text-xs text-stone-600 mt-1.5 space-y-0.5">
                          <p>
                            <span className="font-medium text-stone-500">Mulai:</span> Surat {juz.startSurahName} (Ayat {juz.startAyah})
                          </p>
                          <p>
                            <span className="font-medium text-stone-500">Sampai:</span> Surat {juz.endSurahName} (Ayat {juz.endAyah})
                          </p>
                        </div>
                      </div>

                      {/* Daftar Surat di dalam Juz */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-stone-500">
                          <span className="font-semibold uppercase tracking-wider">
                            Pilih Surat dalam Juz Ini:
                          </span>
                          <button
                            onClick={() =>
                              setExpandedJuz(isExpanded ? null : juz.number)
                            }
                            className="text-[#0D5C58] font-semibold hover:underline cursor-pointer"
                          >
                            {isExpanded ? "Sembunyikan" : "Lihat Semua"}
                          </button>
                        </div>

                        {/* Surat Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(isExpanded ? juz.surahNumbers : juz.surahNumbers.slice(0, 4)).map((sNum) => {
                            const surahItem = SURAH_LIST.find((s) => s.number === sNum);
                            if (!surahItem) return null;
                            const segment = getJuzSurahSegment(juz.number, sNum);
                            return (
                              <button
                                key={sNum}
                                onClick={() => handleOpenJuzSurah(juz.number, sNum)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#0D5C58] hover:text-white text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                                title={`Mulai baca dari Ayat ${segment?.startAyah || 1}`}
                              >
                                {surahItem.name} ({segment?.startAyah}-{segment?.endAyah})
                              </button>
                            );
                          })}
                          {!isExpanded && juz.surahNumbers.length > 4 && (
                            <button
                              onClick={() => setExpandedJuz(juz.number)}
                              className="px-2 py-1 rounded-lg bg-stone-50 text-stone-500 hover:text-stone-800 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              +{juz.surahNumbers.length - 4} Surat Lainnya
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tombol Aksi Mulai Baca dari Surat Awal */}
                      <div className="pt-2 border-t border-stone-100">
                        <button
                          onClick={() => handleOpenJuzSurah(juz.number, juz.startSurahNumber)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#0D5C58]/10 hover:bg-[#0D5C58] text-[#0D5C58] hover:text-white text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Mulai Baca Juz {juz.number} (Ayat {juz.startAyah})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredJuz.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-sm">
                  Tidak ditemukan juz yang cocok dengan kata kunci "{searchJuz}".
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL PENGATURAN TAMPILAN AL-QUR'AN (Khusus Ramah Lansia & Jamaah) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-800 animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0D5C58]/10 border border-[#0D5C58]/20 text-[#0D5C58] flex items-center justify-center">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    Pengaturan Tampilan Al-Qur'an
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Kenyamanan membaca untuk seluruh jamaah & orang tua
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Presets Cepat */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Pilihan Cepat (Preset):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      updateSettings({
                        arabicSize: "xl",
                        showLatin: true,
                        latinSize: "lg",
                        showTranslation: true,
                        translationSize: "lg",
                      })
                    }
                    className="p-3 rounded-2xl border border-[#0D5C58]/30 bg-[#0D5C58]/5 hover:bg-[#0D5C58]/10 text-left transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs text-[#0D5C58] block">
                      Mode Ramah Lansia
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Huruf Arab ekstra besar & teks sangat jelas
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      updateSettings({
                        arabicSize: "lg",
                        showLatin: false,
                        latinSize: "md",
                        showTranslation: false,
                        translationSize: "md",
                      })
                    }
                    className="p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-all cursor-pointer"
                  >
                    <span className="font-bold text-xs text-stone-800 block">
                      Mode Mushaf Arab
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Hanya teks Arab fokus tilawah
                    </span>
                  </button>
                </div>
              </div>

              {/* Setting 1: Ukuran Font Teks Arab */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">
                    Ukuran Huruf Arab:
                  </label>
                  <span className="text-[11px] font-semibold text-[#0D5C58]">
                    {settings.arabicSize === "sm" && "Kecil"}
                    {settings.arabicSize === "md" && "Sedang (Standar)"}
                    {settings.arabicSize === "lg" && "Besar"}
                    {settings.arabicSize === "xl" && "Ekstra Besar (Lansia)"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: "sm", label: "Kecil" },
                      { id: "md", label: "Sedang" },
                      { id: "lg", label: "Besar" },
                      { id: "xl", label: "Ekstra" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() =>
                        updateSettings({ ...settings, arabicSize: opt.id })
                      }
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        settings.arabicSize === opt.id
                          ? "bg-[#0D5C58] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Setting 2: Teks Latin Transliterasi */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block">
                      Transliterasi Latin
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Membantu panduan pelafalan membaca
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({
                        ...settings,
                        showLatin: !settings.showLatin,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.showLatin
                        ? "bg-[#0D5C58] text-white"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {settings.showLatin ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                {settings.showLatin && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(
                      [
                        { id: "sm", label: "Latin Kecil" },
                        { id: "md", label: "Latin Sedang" },
                        { id: "lg", label: "Latin Besar" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          updateSettings({ ...settings, latinSize: opt.id })
                        }
                        className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          settings.latinSize === opt.id
                            ? "bg-[#0D5C58] text-white shadow-xs"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Setting 3: Terjemahan Bahasa Indonesia */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block">
                      Terjemahan Bahasa Indonesia
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Terjemahan resmi Kemenag RI
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      updateSettings({
                        ...settings,
                        showTranslation: !settings.showTranslation,
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      settings.showTranslation
                        ? "bg-[#0D5C58] text-white"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {settings.showTranslation ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                {settings.showTranslation && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(
                      [
                        { id: "sm", label: "Arti Kecil" },
                        { id: "md", label: "Arti Sedang" },
                        { id: "lg", label: "Arti Besar" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          updateSettings({
                            ...settings,
                            translationSize: opt.id,
                          })
                        }
                        className={`py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          settings.translationSize === opt.id
                            ? "bg-[#0D5C58] text-white shadow-xs"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Preview Box */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <label className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  Pratinjau Tampilan Teks:
                </label>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2">
                  <p
                    className={`font-serif text-right text-stone-900 ${getArabicClass()}`}
                  >
                    بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                  {settings.showLatin && (
                    <p
                      className={`text-[#0D5C58] italic font-sans ${getLatinClass()}`}
                    >
                      Bismillahir-rahmanir-rahim
                    </p>
                  )}
                  {settings.showTranslation && (
                    <p
                      className={`text-stone-700 font-sans border-t border-stone-200 pt-1.5 ${getTranslationClass()}`}
                    >
                      Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between">
              <button
                onClick={() =>
                  updateSettings({
                    arabicSize: "md",
                    showLatin: true,
                    latinSize: "md",
                    showTranslation: true,
                    translationSize: "md",
                  })
                }
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                Setel Ulang Standar
              </button>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0D5C58] hover:bg-[#094340] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. Tasbih Digital View
// -------------------------------------------------------------
function TasbihFeatureView() {
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [rounds, setRounds] = useState<number>(0);
  const [dzikirText, setDzikirText] = useState<string>("Subhanallah");

  const dzikirOptions = [
    { title: "Subhanallah", arab: "سُبْحَانَ اللَّهِ", arti: "Maha Suci Allah" },
    { title: "Alhamdulillah", arab: "الْحَمْدُ لِلَّهِ", arti: "Segala Puji Bagi Allah" },
    { title: "Allahu Akbar", arab: "اللَّهُ أَكْبَرُ", arti: "Allah Maha Besar" },
    { title: "Astaghfirullah", arab: "أَسْتَغْفِرُ اللَّهَ", arti: "Aku Memohon Ampun Kepada Allah" },
    { title: "Laa ilaaha illallah", arab: "لَا إِلَهَ إِلَّا اللَّهُ", arti: "Tiada Tuhan Selain Allah" },
  ];

  const currentDzikir = dzikirOptions.find((d) => d.title === dzikirText) || dzikirOptions[0];

  const handleIncrement = () => {
    // Haptic feedback
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40);
    }

    const next = count + 1;
    if (target > 0 && next >= target) {
      setCount(0);
      setRounds((r) => r + 1);
    } else {
      setCount(next);
    }
  };

  const handleReset = () => {
    setCount(0);
    setRounds(0);
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Dzikir selector pills */}
      <div className="w-full flex items-center justify-center gap-1.5 flex-wrap">
        {dzikirOptions.map((d) => (
          <button
            key={d.title}
            onClick={() => {
              setDzikirText(d.title);
              setCount(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              dzikirText === d.title
                ? "bg-[#0D5C58] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Dzikir display box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0D5C58]/5 border border-[#0D5C58]/20 w-full max-w-md">
        <p className="font-serif text-3xl sm:text-4xl text-[#0D5C58] mb-1">
          {currentDzikir.arab}
        </p>
        <p className="text-sm font-bold text-stone-800">{currentDzikir.title}</p>
        <p className="text-xs text-stone-500">{currentDzikir.arti}</p>
      </div>

      {/* Target Selector */}
      <div className="flex items-center gap-2 text-xs text-stone-600">
        <span className="font-medium">Target Putaran:</span>
        {[33, 99, 100, 0].map((t) => (
          <button
            key={t}
            onClick={() => setTarget(t)}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              target === t
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t === 0 ? "Bebas" : `${t}x`}
          </button>
        ))}
      </div>

      {/* Large Round Counter Button */}
      <div className="relative">
        <button
          onClick={handleIncrement}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-[#0D5C58] to-[#083E3B] text-white flex flex-col items-center justify-center shadow-xl shadow-[#0D5C58]/30 hover:scale-105 active:scale-95 transition-all select-none border-4 border-[#D4AF37]"
        >
          <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight">
            {count}
          </span>
          <span className="text-xs text-[#D4AF37] font-semibold mt-1 tracking-wider uppercase">
            {target > 0 ? `Target ${target}` : "Hitung Dzikir"}
          </span>
          <span className="text-[10px] text-white/70 mt-1 flex items-center gap-1.5">
            <TasbihIcon className="w-3.5 h-3.5 inline-block shrink-0 text-[#D4AF37]" />
            Tekan di Sini
          </span>
        </button>
      </div>

      {/* Round & Action Stats */}
      <div className="flex items-center justify-between w-full max-w-sm pt-2">
        <div className="text-left">
          <span className="text-[10px] text-stone-400 block uppercase font-medium">
            Putaran Selesai
          </span>
          <span className="text-base font-bold text-stone-900">
            {rounds} Kali
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors"
        >
          Setel Ulang (Reset)
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Audio Tilawah Murottal View
// -------------------------------------------------------------
function TilawahFeatureView() {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(67); // Default Al-Mulk
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedQari, setSelectedQari] = useState<string>("alafasy");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const qariList = [
    {
      id: "alafasy",
      name: "Syaikh Misyari Rasyid Al-Afasi",
      baseUrl: "https://cdn.mp3quran.net/audio/mishary-alafasy/r1",
    },
    {
      id: "sudais",
      name: "Syaikh Abdurrahman As-Sudais",
      baseUrl: "https://server11.mp3quran.net/sds",
    },
    {
      id: "ghamdi",
      name: "Syaikh Saad Al-Ghamdi",
      baseUrl: "https://server7.mp3quran.net/s_gmd",
    },
  ];

  const currentQari = qariList.find((q) => q.id === selectedQari) || qariList[0];
  const currentSurah = SURAH_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_LIST[66];

  // Quick favorite playlist
  const popularSurahs = [1, 18, 36, 55, 56, 67, 78, 112, 113, 114];

  // Helper format 3-digit
  const pad3 = (num: number) => num.toString().padStart(3, "0");
  const audioSrc = `${currentQari.baseUrl}/${pad3(selectedSurahNumber)}.mp3`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSelectSurah = (num: number) => {
    setSelectedSurahNumber(num);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatSecs = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Audio Player Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0D5C58] to-[#083E3B] text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <TilawahIcon className="w-4 h-4 text-[#D4AF37] shrink-0" />
              Surat Ke-{currentSurah.number} ({currentSurah.revelation})
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              {currentSurah.name} ({currentSurah.arabicName})
            </h3>
            <p className="text-xs text-stone-300">
              {currentSurah.translation} • {currentSurah.numberOfAyahs} Ayat
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30">
            {currentQari.name.split(" ")[1]}
          </span>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) setDuration(audioRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Progress Bar Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTime(val);
              if (audioRef.current) audioRef.current.currentTime = val;
            }}
            className="w-full accent-[#D4AF37] h-1.5 rounded-lg cursor-pointer bg-white/20"
          />
          <div className="flex justify-between text-[11px] text-stone-300 font-mono">
            <span>{formatSecs(currentTime)}</span>
            <span>{formatSecs(duration)}</span>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleSelectSurah(Math.max(1, selectedSurahNumber - 1))}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            Surat Sebelumnya
          </button>

          <button
            onClick={togglePlay}
            className="px-6 py-2.5 rounded-full bg-[#D4AF37] hover:bg-[#b89529] text-stone-900 font-bold text-sm shadow-md transition-transform active:scale-95"
          >
            {isPlaying ? "Jeda Audio" : "Putar Tilawah"}
          </button>

          <button
            onClick={() => handleSelectSurah(Math.min(114, selectedSurahNumber + 1))}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            Surat Berikutnya
          </button>
        </div>
      </div>

      {/* Qari Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-700">Pilihan Qari / Pelantun Tilawah:</label>
        <div className="flex flex-wrap gap-2">
          {qariList.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSelectedQari(q.id);
                setIsPlaying(false);
                if (audioRef.current) {
                  audioRef.current.pause();
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedQari === q.id
                  ? "bg-[#0D5C58] text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Surah Playlist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700">Pilihan Surat Cepat:</label>
          <span className="text-[11px] text-stone-500">114 Surat Tersedia</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pb-2">
          {popularSurahs.map((num) => {
            const s = SURAH_LIST.find((item) => item.number === num);
            if (!s) return null;
            return (
              <button
                key={num}
                onClick={() => handleSelectSurah(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedSurahNumber === num
                    ? "bg-[#0D5C58] text-white font-bold"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Dropdown for All 114 Surahs */}
        <select
          value={selectedSurahNumber}
          onChange={(e) => handleSelectSurah(Number(e.target.value))}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold bg-white focus:outline-none focus:border-[#0D5C58]"
        >
          {SURAH_LIST.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.name} ({s.translation}) - {s.numberOfAyahs} Ayat
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Doa & Dzikir Harian View
// -------------------------------------------------------------
function DoaFeatureView() {
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "semua", label: "Semua Doa" },
    { id: "pagi_petang", label: "Pagi & Petang" },
    { id: "harian", label: "Harian" },
    { id: "masjid", label: "Masjid" },
    { id: "shalat", label: "Shalat" },
    { id: "keselamatan", label: "Keselamatan" },
  ];

  const filteredDoa =
    activeCategory === "semua"
      ? DOA_LIST
      : DOA_LIST.filter((d) => d.category === activeCategory);

  const handleCopy = (item: DoaItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.latin}\n\nArtinya:\n"${item.translation}"\n(${item.source})`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? "bg-[#0D5C58] text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Doa Cards List */}
      <div className="space-y-4">
        {filteredDoa.map((doa) => (
          <div
            key={doa.id}
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D5C58]/10 text-[#0D5C58] uppercase tracking-wider flex items-center gap-1.5">
                <DoaIcon className="w-3.5 h-3.5 text-[#0D5C58] shrink-0" />
                {doa.categoryLabel}
              </span>
              <button
                onClick={() => handleCopy(doa)}
                className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-semibold transition-colors"
              >
                {copiedId === doa.id ? "Tersalin" : "Salin Teks"}
              </button>
            </div>

            <h3 className="font-bold text-stone-900 text-sm font-sans">
              {doa.title}
            </h3>

            <p className="font-serif text-2xl text-right text-stone-900 leading-relaxed pt-1">
              {doa.arabic}
            </p>

            <p className="text-xs text-[#0D5C58] italic leading-relaxed">
              {doa.latin}
            </p>

            <p className="text-xs text-stone-700 leading-relaxed pt-2 border-t border-stone-100">
              "{doa.translation}"
            </p>

            <p className="text-[10px] text-stone-400 font-medium">
              Riwayat: {doa.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Kompas Arah Kiblat View
// -------------------------------------------------------------
function KiblatFeatureView() {
  return <KiblatCompass />;
}

// -------------------------------------------------------------
// 6. Asmaul Husna View
// -------------------------------------------------------------
function AsmaulHusnaFeatureView() {
  const [search, setSearch] = useState("");

  const filteredNames = ASMAUL_HUSNA.filter(
    (item) =>
      item.latin.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase()) ||
      item.number.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Banner Pengantar dengan Ikon Bintang Segi Delapan Asmaul Husna */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0D5C58]/10 via-[#0D5C58]/5 to-[#D4AF37]/10 border border-[#0D5C58]/20 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left shadow-2xs">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-1 rounded-2xl bg-white shadow-md border border-stone-200">
          <Image
            src="/images/icon-asmaul-husna.png"
            alt="Asmaul Husna"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D5C58] text-white text-[11px] font-semibold">
            <AsmaulHusnaIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>99 Nama Agung & Sifat Mulia Allah SWT</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
            Al-Asma' Al-Husna (الأسماء الحسنى)
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
            "Hanya milik Allah asma-ul husna, maka bermohonlah kepada-Nya dengan menyebut asma-ul husna itu..." (QS. Al-A'raf: 180). Lengkap dengan kaligrafi Arab, transliterasi latin, arti, dan tadabbur maknanya.
          </p>
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari Asmaul Husna (misal: Rahman, Pengasih, 1)..."
        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:outline-none focus:border-[#0D5C58] bg-stone-50"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNames.map((item) => (
          <div
            key={item.number}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 font-bold text-xs flex items-center justify-center">
                {item.number}
              </span>
              <span className="font-serif text-2xl text-[#0D5C58] font-bold">
                {item.arabic}
              </span>
            </div>
            <h4 className="font-bold text-stone-900 text-sm">{item.latin}</h4>
            <p className="text-xs text-[#B58A1E] font-semibold">
              {item.translation}
            </p>
            <p className="text-xs text-stone-600 leading-relaxed pt-1">
              {item.meaning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Kalkulator Zakat & Fidyah View
// -------------------------------------------------------------
function ZakatFeatureView() {
  return <ZakatCalculator />;
}

// -------------------------------------------------------------
// 8. Kalender Hijriyah & Puasa Sunnah View
// -------------------------------------------------------------
function KalenderFeatureView() {
  const [todayText, setTodayText] = useState("");

  useEffect(() => {
    const d = new Date();
    setTodayText(
      d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const puasaSchedule = [
    {
      name: "Puasa Senin & Kamis",
      day: "Setiap Hari Senin & Kamis",
      desc: "Amalan puasa sunnah mingguan yang senantiasa dijaga oleh Rasulullah SAW karena pada hari tersebut amalan diangkat kepada Allah.",
    },
    {
      name: "Puasa Ayyamul Bidh",
      day: "13, 14, 15 Setiap Bulan Hijriyah",
      desc: "Puasa pada hari-hari putih saat bulan purnama penuh. Pahalanya seperti berpuasa sepanjang tahun.",
    },
    {
      name: "Puasa Asyura & Tasu'a",
      day: "9 & 10 Muharram",
      desc: "Menghapuskan dosa-dosa setahun yang telah lalu.",
    },
    {
      name: "Puasa Hari Arafah",
      day: "9 Dzulhijjah",
      desc: "Menghapuskan dosa setahun yang lalu dan setahun yang akan datang.",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Current Date Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0D5C58] to-[#083E3B] text-white text-center space-y-1 shadow-md">
        <span className="text-[11px] text-[#D4AF37] uppercase font-bold tracking-wider">
          Penanggalan Hari Ini
        </span>
        <h3 className="text-xl sm:text-2xl font-bold font-serif">
          {todayText || "Memuat tanggal..."}
        </h3>
        <p className="text-xs text-stone-300">
          Tahun 1448 Hijriyah • Kalender Islam Terpadu
        </p>
      </div>

      {/* Sunnah Fasting Schedule */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-stone-900 font-serif">
          Jadwal Puasa Sunnah Pilihan:
        </h4>

        <div className="space-y-2.5">
          {puasaSchedule.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">
                  {p.name}
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0D5C58]/10 text-[#0D5C58]">
                  {p.day}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed pt-1">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Niat Puasa Sunnah Card */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
        <span className="font-bold text-[#0D5C58] block">Niat Puasa Sunnah:</span>
        <p className="font-serif text-lg text-stone-800 text-right">
          نَوَيْتُ صَوْمَ يَوْمِ الإِثْنَيْنِ / الخَمِيْسِ سُنَّةً لِلَّهِ تَعَالَى
        </p>
        <p className="text-[11px] text-stone-600 italic">
          Nawaitu shauma yaumil itsnaini / al-khamisi sunnatan lillahi ta'ala.
        </p>
        <p className="text-[11px] text-stone-500">
          "Saya niat berpuasa sunnah hari Senin / Kamis karena Allah Ta'ala."
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 9. Panduan Shalat & Thaharah View
// -------------------------------------------------------------
function PanduanShalatFeatureView() {
  const [selectedId, setSelectedId] = useState<string>("panduan-1");
  const currentGuide =
    PANDUAN_SHALAT.find((p) => p.id === selectedId) || PANDUAN_SHALAT[0];

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {PANDUAN_SHALAT.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedId === p.id
                ? "bg-[#0D5C58] text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Guide Header */}
      <div className="border-b border-stone-200 pb-3">
        <h3 className="font-bold text-stone-900 text-base font-serif">
          {currentGuide.title}
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">{currentGuide.summary}</p>
      </div>

      {/* Step by step */}
      <div className="space-y-4">
        {currentGuide.steps.map((step, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-sm"
          >
            <h4 className="font-bold text-stone-900 text-sm text-[#0D5C58]">
              {step.title}
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              {step.desc}
            </p>

            {step.readingArab && (
              <div className="mt-2 p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                <p className="font-serif text-xl text-right text-stone-900">
                  {step.readingArab}
                </p>
                {step.readingLatin && (
                  <p className="text-xs text-[#0D5C58] italic font-sans">
                    {step.readingLatin}
                  </p>
                )}
                {step.readingTranslation && (
                  <p className="text-xs text-stone-600 font-sans">
                    "{step.readingTranslation}"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 10. Kumpulan Hadits Pilihan View
// -------------------------------------------------------------
function HaditsFeatureView() {
  const [selectedHaditsId, setSelectedHaditsId] = useState<number>(1);
  const currentHadits =
    HADITS_LIST.find((h) => h.id === selectedHaditsId) || HADITS_LIST[0];

  return (
    <div className="space-y-5">
      {/* Hadits selector pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {HADITS_LIST.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHaditsId(h.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedHaditsId === h.id
                ? "bg-[#0D5C58] text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Hadits {h.id}
          </button>
        ))}
      </div>

      {/* Selected Hadits Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D5C58]/10 text-[#0D5C58] uppercase">
            {currentHadits.theme}
          </span>
          <h3 className="font-bold text-stone-900 text-base font-serif mt-1.5">
            {currentHadits.title}
          </h3>
        </div>

        <p className="font-serif text-2xl sm:text-3xl text-right text-stone-900 leading-loose">
          {currentHadits.arabic}
        </p>

        <div className="space-y-1 border-t border-stone-100 pt-3">
          <span className="text-xs font-bold text-stone-900 block">
            Terjemahan Hadits:
          </span>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            "{currentHadits.translation}"
          </p>
        </div>

        <div className="space-y-2 border-t border-stone-100 pt-3">
          <span className="text-xs font-bold text-[#0D5C58] block">
            Pelajaran & Faedah Hadits (Fawaid):
          </span>
          <ul className="space-y-1.5 text-xs text-stone-600 list-disc list-inside">
            {currentHadits.lessons.map((lesson, idx) => (
              <li key={idx} className="leading-relaxed">
                {lesson}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-stone-400 font-medium pt-2 border-t border-stone-100">
          Sumber Riwayat: {currentHadits.source}
        </p>
      </div>
    </div>
  );
}
