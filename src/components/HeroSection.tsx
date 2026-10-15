"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  leadWord: string;
  mosqueName: string;
  description: string;
  objectPosition: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "sudalmiyah",
    image: "/images/masjid-sudalmiyah.jpg",
    leadWord: "Kedamaian Ibadah di",
    mosqueName: "Masjid Sudalmiyah Rais",
    description:
      "Masjid percontohan Amal Usaha Muhammadiyah (AUM) di tingkat PTMA sebagai pembinaan sivitas akademika UMS yang diproyeksikan menjadi masjid ramah aktivis dan lingkungan",
    objectPosition: "object-[center_35%]",
  },
  {
    id: "fadhlurrahman",
    image: "/images/hero-fadhlurrahman.jpg",
    leadWord: "Kesejukan Syiar di",
    mosqueName: "Masjid Fadhlurrahman",
    description:
      "Masjid pertama dan bersejarah yang menjadi ruh pembinaan Al-Islam dan Kemuhammadiyahan bagi civitas akademika UMS",
    objectPosition: "object-center",
  },
  {
    id: "mas-mansur",
    image: "/images/hero-mas-mansur.jpg",
    leadWord: "Keteduhan Ruhani di",
    mosqueName: "Masjid KH. Mas Mansur",
    description:
      "Sentra pembinaan mahasiswa interdisipliner UMS dan International dalam pengembangan keilmuan yang berakhlak, berprestasi dan bermanfaat",
    objectPosition: "object-center",
  },
  {
    id: "mahad-abu-bakar",
    image: "/images/hero-mahad-abu-bakar.jpg",
    leadWord: "Keluhuran Ilmu & Adab di",
    mosqueName: "Masjid Ma'had Abu Bakar",
    description:
      "Pusat dirasat Islamiyah dan bahasa Arab Ma'had Abu bakar Ash-Shiddiq yang sekarang statusnya menjadi Amal Usaha Muhammadiyah (AUM) di lingkungan UMS",
    objectPosition: "object-[center_40%]",
  },
  {
    id: "ar-razi",
    image: "/images/hero-ar-razi.jpg",
    leadWord: "Keberkahan & Dedikasi di",
    mosqueName: "Masjid Ar-Razi FKG",
    description:
      "Fasilitas peribadatan modern penopang spiritualitas dan etika profesi calon dokter gigi, tenaga medis, serta sivitas akademika Fakultas Kedokteran Gigi Penumping UMS.",
    objectPosition: "object-center",
  },
  {
    id: "munajat-shabran",
    image: "/images/hero-munajat-shabran.jpg",
    leadWord: "Ghirah Perkaderan di",
    mosqueName: "Masjid Munajat Shabran",
    description:
      "Pusat perkaderan mahasiswa utusan wilayah Muhammadiyah seluruh Indonesia yang diorbitkan menjadi kader intelek ulama', ulama' intelek.",
    objectPosition: "object-center",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const active = HERO_SLIDES[currentSlide];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center overflow-hidden"
    >
      {/* Full-Bleed Background Mosque Images Carousel */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.mosqueName}
              fill
              priority={idx === 0}
              unoptimized
              className={`object-cover ${slide.objectPosition}`}
            />
          </div>
        ))}

        {/* Clean Minimalist Cinematic Overlay - Transparent center so mosque photography looks vivid, bright, and HD */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/20 to-slate-950/80 z-20 pointer-events-none" />
      </div>

      {/* Minimalist Left and Right Slide Controls */}
      <button
        onClick={prevSlide}
        aria-label="Slide Sebelumnya"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Slide Berikutnya"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-12 lg:pt-14 pb-20 sm:pb-24">
        {/* Logo LPCR-PM PP Muhammadiyah */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-300">
            <Image
              src="/images/logo/logo-lpcr.png"
              alt="Logo LPCR-PM PP Muhammadiyah"
              width={80}
              height={80}
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              priority
            />
          </div>
        </div>

        {/* Minimalist Mosque Badge - Compact on mobile, enlarged on laptop */}
        <div className="inline-flex items-center justify-center px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2.5 lg:py-3 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/50 text-amber-200 text-xs sm:text-base lg:text-lg font-semibold tracking-wide mb-5 sm:mb-7 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300">
          <span>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</span>
        </div>

        {/* Dynamic Grand Headline with Elegant Soft Golden Neon Glow */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] font-serif min-h-[115px] sm:min-h-[145px] lg:min-h-[165px] flex flex-col justify-center">
          <span className="text-white [text-shadow:_0_0_16px_rgba(255,255,255,0.5),_0_2px_8px_rgba(0,0,0,0.85)] transition-opacity duration-300">
            {active.leadWord}
          </span>
          <span className="block mt-2 sm:mt-3 text-[#FEF08A] [text-shadow:_0_0_12px_rgba(253,224,71,0.75),_0_0_24px_rgba(245,158,11,0.55),_0_0_40px_rgba(217,119,6,0.35),_0_2px_8px_rgba(0,0,0,0.9)] transition-opacity duration-300">
            {active.mosqueName}
          </span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-stone-100 max-w-2xl mx-auto leading-relaxed [text-shadow:_0_1px_8px_rgba(0,0,0,0.95)] min-h-[75px] sm:min-h-[60px] flex items-center justify-center transition-opacity duration-300">
          {active.description}
        </p>

        {/* Centered CTA Pill Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/agenda"
            className="px-8 py-3.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-sm sm:text-base font-bold shadow-2xl border border-amber-400/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Daftar Kajian &amp; Kegiatan
          </Link>

          <Link
            href="/donasi"
            className="px-7 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-stone-200 hover:text-white text-sm sm:text-base font-semibold backdrop-blur-md border border-stone-600/70 hover:border-amber-400/60 transition-all duration-300 hover:scale-105"
          >
            Salurkan Infaq Digital
          </Link>
        </div>
      </div>

      {/* Smooth Concave Dome Arch Bottom Divider into #FAF8F5 (Clean Minimalist Signature Curve) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-30 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-12 sm:h-20 lg:h-24 text-[#FAF8F5] fill-current"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}
