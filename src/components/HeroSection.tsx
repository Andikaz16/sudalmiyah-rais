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

        {/* Cinematic Multi-Layer Dark Vignette Overlay for maximum photo vibrancy and crisp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-slate-950/90 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,31,63,0.55)_0%,_rgba(2,6,23,0.72)_55%,_rgba(2,6,23,0.92)_100%)] z-20 pointer-events-none" />
      </div>

      {/* Majestic Islamic Arch & Arabesque Side Ornaments */}
      {/* Left Side Ornament */}
      <div className="absolute top-0 left-0 w-44 sm:w-64 lg:w-80 h-[480px] sm:h-[560px] pointer-events-none z-20 overflow-hidden">
        <svg
          className="w-full h-full opacity-85 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
          viewBox="0 0 320 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldOrnamentLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#D97706" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="goldOrnamentInnerL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Top-Left Corner Geometric Arch Bracket */}
          <path
            d="M 0,0 L 110,0 C 95,28 78,55 58,72 C 38,89 12,98 0,102 Z"
            fill="url(#goldOrnamentLeft)"
            fillOpacity="0.08"
            stroke="url(#goldOrnamentLeft)"
            strokeWidth="1.5"
          />
          <path
            d="M 0,16 L 80,16 C 68,36 52,56 36,68 C 22,79 8,84 0,86"
            stroke="url(#goldOrnamentInnerL)"
            strokeWidth="1"
          />

          {/* Corner 8-pointed Star Medallion */}
          <g transform="translate(42, 42)">
            <rect x="-9" y="-9" width="18" height="18" stroke="url(#goldOrnamentLeft)" strokeWidth="1.2" fill="none" />
            <rect x="-9" y="-9" width="18" height="18" stroke="url(#goldOrnamentLeft)" strokeWidth="1.2" fill="none" transform="rotate(45)" />
            <circle cx="0" cy="0" r="4" fill="url(#goldOrnamentLeft)" />
          </g>

          {/* Primary Mihrab Keel Arch Rib */}
          <path
            d="M 0,80 C 145,110 205,210 180,320 C 160,410 85,480 0,510"
            stroke="url(#goldOrnamentLeft)"
            strokeWidth="2"
          />

          {/* Secondary Concentric Arch Rib */}
          <path
            d="M 0,110 C 115,135 170,220 150,315 C 132,395 70,455 0,480"
            stroke="url(#goldOrnamentInnerL)"
            strokeWidth="1.2"
          />

          {/* Delicate Fine Tertiary Outline */}
          <path
            d="M 0,140 C 85,160 135,230 120,310 C 105,375 55,425 0,450"
            stroke="url(#goldOrnamentInnerL)"
            strokeWidth="0.8"
            strokeOpacity="0.7"
          />

          {/* Apex Medallion: 8-Pointed Star Rosette with Rays */}
          <g transform="translate(175, 318)">
            {/* Outer Rosette Ring */}
            <circle cx="0" cy="0" r="22" stroke="url(#goldOrnamentLeft)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="18" stroke="url(#goldOrnamentInnerL)" strokeWidth="1" />
            {/* 8-Pointed Star */}
            <rect x="-10" y="-10" width="20" height="20" stroke="url(#goldOrnamentLeft)" strokeWidth="1.4" fill="url(#goldOrnamentLeft)" fillOpacity="0.15" />
            <rect x="-10" y="-10" width="20" height="20" stroke="url(#goldOrnamentLeft)" strokeWidth="1.4" fill="url(#goldOrnamentLeft)" fillOpacity="0.15" transform="rotate(45)" />
            {/* Inner Core */}
            <circle cx="0" cy="0" r="5" fill="url(#goldOrnamentLeft)" />
            
            {/* Cardinal Radiating Diamonds */}
            <polygon points="0,-27 3,-24 0,-21 -3,-24" fill="url(#goldOrnamentLeft)" />
            <polygon points="0,27 3,24 0,21 -3,24" fill="url(#goldOrnamentLeft)" />
            <polygon points="27,0 24,3 21,0 24,-3" fill="url(#goldOrnamentLeft)" />
            <polygon points="-27,0 -24,3 -21,0 -24,-3" fill="url(#goldOrnamentLeft)" />
          </g>

          {/* Upper Arabesque Flourish Tendril */}
          <path
            d="M 125,165 C 165,185 180,155 160,135 C 140,118 108,138 120,165 C 126,178 142,185 155,180"
            stroke="url(#goldOrnamentLeft)"
            strokeWidth="1.2"
          />
          <circle cx="160" cy="135" r="2.5" fill="url(#goldOrnamentLeft)" />

          {/* Lower Arabesque Flourish Tendril */}
          <path
            d="M 120,385 C 158,400 172,430 150,448 C 130,460 102,440 112,412 C 118,398 135,392 148,396"
            stroke="url(#goldOrnamentLeft)"
            strokeWidth="1.2"
          />
          <circle cx="150" cy="448" r="2.5" fill="url(#goldOrnamentLeft)" />

          {/* Accent Diamonds along Arch Spine */}
          <polygon points="75,108 78,112 75,116 72,112" fill="url(#goldOrnamentLeft)" />
          <polygon points="128,142 131,146 128,150 125,146" fill="url(#goldOrnamentLeft)" />
          <polygon points="183,230 186,234 183,238 180,234" fill="url(#goldOrnamentLeft)" />
          <polygon points="138,405 141,409 138,413 135,409" fill="url(#goldOrnamentLeft)" />
          <polygon points="75,472 78,476 75,480 72,476" fill="url(#goldOrnamentLeft)" />
        </svg>
      </div>

      {/* Right Side Ornament (Mirrored Perfectly) */}
      <div className="absolute top-0 right-0 w-44 sm:w-64 lg:w-80 h-[480px] sm:h-[560px] pointer-events-none z-20 overflow-hidden">
        <svg
          className="w-full h-full opacity-85 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
          viewBox="0 0 320 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldOrnamentRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#D97706" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="goldOrnamentInnerR" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <g transform="translate(320, 0) scale(-1, 1)">
            {/* Top Corner Geometric Arch Bracket */}
            <path
              d="M 0,0 L 110,0 C 95,28 78,55 58,72 C 38,89 12,98 0,102 Z"
              fill="url(#goldOrnamentRight)"
              fillOpacity="0.08"
              stroke="url(#goldOrnamentRight)"
              strokeWidth="1.5"
            />
            <path
              d="M 0,16 L 80,16 C 68,36 52,56 36,68 C 22,79 8,84 0,86"
              stroke="url(#goldOrnamentInnerR)"
              strokeWidth="1"
            />

            {/* Corner 8-pointed Star Medallion */}
            <g transform="translate(42, 42)">
              <rect x="-9" y="-9" width="18" height="18" stroke="url(#goldOrnamentRight)" strokeWidth="1.2" fill="none" />
              <rect x="-9" y="-9" width="18" height="18" stroke="url(#goldOrnamentRight)" strokeWidth="1.2" fill="none" transform="rotate(45)" />
              <circle cx="0" cy="0" r="4" fill="url(#goldOrnamentRight)" />
            </g>

            {/* Primary Mihrab Keel Arch Rib */}
            <path
              d="M 0,80 C 145,110 205,210 180,320 C 160,410 85,480 0,510"
              stroke="url(#goldOrnamentRight)"
              strokeWidth="2"
            />

            {/* Secondary Concentric Arch Rib */}
            <path
              d="M 0,110 C 115,135 170,220 150,315 C 132,395 70,455 0,480"
              stroke="url(#goldOrnamentInnerR)"
              strokeWidth="1.2"
            />

            {/* Delicate Fine Tertiary Outline */}
            <path
              d="M 0,140 C 85,160 135,230 120,310 C 105,375 55,425 0,450"
              stroke="url(#goldOrnamentInnerR)"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />

            {/* Apex Medallion: 8-Pointed Star Rosette with Rays */}
            <g transform="translate(175, 318)">
              {/* Outer Rosette Ring */}
              <circle cx="0" cy="0" r="22" stroke="url(#goldOrnamentRight)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="18" stroke="url(#goldOrnamentInnerR)" strokeWidth="1" />
              {/* 8-Pointed Star */}
              <rect x="-10" y="-10" width="20" height="20" stroke="url(#goldOrnamentRight)" strokeWidth="1.4" fill="url(#goldOrnamentRight)" fillOpacity="0.15" />
              <rect x="-10" y="-10" width="20" height="20" stroke="url(#goldOrnamentRight)" strokeWidth="1.4" fill="url(#goldOrnamentRight)" fillOpacity="0.15" transform="rotate(45)" />
              {/* Inner Core */}
              <circle cx="0" cy="0" r="5" fill="url(#goldOrnamentRight)" />
              
              {/* Cardinal Radiating Diamonds */}
              <polygon points="0,-27 3,-24 0,-21 -3,-24" fill="url(#goldOrnamentRight)" />
              <polygon points="0,27 3,24 0,21 -3,24" fill="url(#goldOrnamentRight)" />
              <polygon points="27,0 24,3 21,0 24,-3" fill="url(#goldOrnamentRight)" />
              <polygon points="-27,0 -24,3 -21,0 -24,-3" fill="url(#goldOrnamentRight)" />
            </g>

            {/* Upper Arabesque Flourish Tendril */}
            <path
              d="M 125,165 C 165,185 180,155 160,135 C 140,118 108,138 120,165 C 126,178 142,185 155,180"
              stroke="url(#goldOrnamentRight)"
              strokeWidth="1.2"
            />
            <circle cx="160" cy="135" r="2.5" fill="url(#goldOrnamentRight)" />

            {/* Lower Arabesque Flourish Tendril */}
            <path
              d="M 120,385 C 158,400 172,430 150,448 C 130,460 102,440 112,412 C 118,398 135,392 148,396"
              stroke="url(#goldOrnamentRight)"
              strokeWidth="1.2"
            />
            <circle cx="150" cy="448" r="2.5" fill="url(#goldOrnamentRight)" />

            {/* Accent Diamonds along Arch Spine */}
            <polygon points="75,108 78,112 75,116 72,112" fill="url(#goldOrnamentRight)" />
            <polygon points="128,142 131,146 128,150 125,146" fill="url(#goldOrnamentRight)" />
            <polygon points="183,230 186,234 183,238 180,234" fill="url(#goldOrnamentRight)" />
            <polygon points="138,405 141,409 138,413 135,409" fill="url(#goldOrnamentRight)" />
            <polygon points="75,472 78,476 75,480 72,476" fill="url(#goldOrnamentRight)" />
          </g>
        </svg>
      </div>

      {/* Left and Right Manual Slide Controls with Regal Glassmorphism */}
      <button
        onClick={prevSlide}
        aria-label="Slide Sebelumnya"
        className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-[#003B73] border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white items-center justify-center backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-95 cursor-pointer group"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Slide Berikutnya"
        className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-[#003B73] border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white items-center justify-center backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 active:scale-95 cursor-pointer group"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-16 pb-24 sm:pb-28">
        {/* Unified Mosque Badge with Royal Gold Framing */}
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-slate-950/70 backdrop-blur-md border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-[0_0_20px_rgba(217,119,6,0.25)] transition-all duration-300 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]">
          <span className="text-amber-400 text-[10px] sm:text-xs">✦</span>
          <span>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</span>
          <span className="text-amber-400 text-[10px] sm:text-xs">✦</span>
        </div>

        {/* Dynamic Grand Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-serif drop-shadow-2xl min-h-[115px] sm:min-h-[145px] lg:min-h-[165px] flex flex-col justify-center">
          <span className="transition-opacity duration-300">{active.leadWord}</span>
          <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-lg transition-opacity duration-300">
            {active.mosqueName}
          </span>
        </h1>

        {/* Dynamic Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md min-h-[75px] sm:min-h-[60px] flex items-center justify-center transition-opacity duration-300">
          {active.description}
        </p>

        {/* Centered CTA Pill Buttons - Clean and pure text, no icons */}
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

      {/* Smooth Concave Dome Arch Bottom Divider into #FAF8F5 with Gold Accent Rim */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-30 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          className="relative block w-full h-12 sm:h-20 lg:h-24 text-[#FAF8F5]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldArchRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.2" />
              <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FDE68A" stopOpacity="1" />
              <stop offset="75%" stopColor="#F59E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Subtle 2.5px Golden Arch Border */}
          <path
            d="M0,0 C480,120 960,120 1440,0"
            fill="none"
            stroke="url(#goldArchRim)"
            strokeWidth="2.5"
            className="drop-shadow-[0_-2px_8px_rgba(245,158,11,0.4)]"
          />
          {/* Main White Section Body */}
          <path
            d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
