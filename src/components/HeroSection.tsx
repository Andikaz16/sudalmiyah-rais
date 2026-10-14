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
      "Pusat keteduhan ibadah dan teladan Masjid Percontohan yang makmur dan memakmurkan. Menghadirkan kekhusyukan spiritual, mempererat ukhuwah berkemajuan, serta mengabdi sebagai rumah kebaikan bagi sivitas akademika Kampus 2 UMS dan seluruh umat.",
    objectPosition: "object-[center_35%]",
  },
  {
    id: "fadhlurrahman",
    image: "/images/hero-fadhlurrahman.jpg",
    leadWord: "Kesejukan Syiar di",
    mosqueName: "Masjid Fadhlurrahman",
    description:
      "Pusat syiar dakwah Islamiyah, pengajian berkala sivitas akademika, dan denyut spiritual bersejarah di lingkungan Kampus 1 Universitas Muhammadiyah Surakarta.",
    objectPosition: "object-center",
  },
  {
    id: "mas-mansur",
    image: "/images/hero-mas-mansur.jpg",
    leadWord: "Keteduhan Ruhani di",
    mosqueName: "Masjid KH. Mas Mansur",
    description:
      "Sentra pembinaan adab, tahfidzul Qur'an, dan keilmuan berkemajuan santri Pesantren Mahasiswa KH. Mas Mansur Kampus 4 UMS dalam meneguhkan integritas moral generasi bangsa.",
    objectPosition: "object-center",
  },
  {
    id: "mahad-abu-bakar",
    image: "/images/hero-mahad-abu-bakar.jpg",
    leadWord: "Keluhuran Ilmu & Adab di",
    mosqueName: "Masjid Ma'had Abu Bakar",
    description:
      "Wahana ibadah dan pendalaman dirasat Islamiyah serta bahasa Arab Ma'had Abu Bakar Ash-Shiddiq UMS yang sarat keteladanan dan keberkahan sunnah.",
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
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-16 pb-24 sm:pb-28">
        {/* Minimalist Mosque Badge */}
        <div className="inline-flex items-center justify-center px-4 sm:px-5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-amber-300 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-md transition-all duration-300">
          <span>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</span>
        </div>

        {/* Dynamic Grand Headline with Sharp Text Shadows for HD Background Legibility */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-serif [text-shadow:_0_3px_20px_rgba(0,0,0,0.95)] drop-shadow-2xl min-h-[115px] sm:min-h-[145px] lg:min-h-[165px] flex flex-col justify-center">
          <span className="transition-opacity duration-300">{active.leadWord}</span>
          <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent [filter:drop-shadow(0_3px_15px_rgba(0,0,0,0.95))] transition-opacity duration-300">
            {active.mosqueName}
          </span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/95 max-w-2xl mx-auto leading-relaxed [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] min-h-[75px] sm:min-h-[60px] flex items-center justify-center transition-opacity duration-300">
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
