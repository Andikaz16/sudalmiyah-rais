"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center overflow-hidden">
      {/* Full-Bleed HD Background Mosque Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <Image
          src="/images/masjid-sudalmiyah.jpg"
          alt="Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta"
          fill
          priority
          unoptimized
          className="object-cover object-[center_35%]"
        />

        {/* Cinematic Dual-Tone Dark Overlay so that the mosque is clearly visible while text is crisp */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/50 to-slate-950/85" />
      </div>

      {/* Decorative Golden Curvilinear Lines on sides with breathing glow */}
      <svg
        className="absolute top-0 left-0 w-44 sm:w-72 h-96 pointer-events-none opacity-40 z-10 animate-soft-glow"
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -50,0 C 80,100 120,250 40,400"
          stroke="#FCD34D"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M -30,0 C 120,120 160,260 70,400"
          stroke="#FCD34D"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
      </svg>

      <svg
        className="absolute top-0 right-0 w-44 sm:w-72 h-96 pointer-events-none opacity-40 z-10 animate-soft-glow"
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 350,0 C 220,100 180,250 260,400"
          stroke="#FCD34D"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 330,0 C 180,120 140,260 230,400"
          stroke="#FCD34D"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
      </svg>

      {/* Hero Content Overlay with Entrance Animations */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10 sm:pt-16 pb-24 sm:pb-28">
        {/* Grand Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-serif drop-shadow-2xl animate-fade-up">
          Kedamaian Ibadah di
          <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-lg">
            Masjid Sudalmiyah Rais
          </span>
        </h1>

        {/* Subtitle with high contrast - Pure welcoming essence, no feature enumeration */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base lg:text-lg text-stone-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md animate-fade-up delay-150">
          Tempat yang teduh untuk bersujud dan menenangkan jiwa. Menghadirkan suasana peribadatan yang khusyuk, mempererat ukhuwah, serta menjadi rumah kebaikan yang senantiasa terbuka menyambut seluruh umat.
        </p>

        {/* Centered CTA Pill Buttons - Clean and pure text, no icons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up delay-300">
          <Link
            href="/agenda"
            className="px-8 py-3.5 rounded-full bg-[#0D5C58] hover:bg-[#094744] text-white text-sm sm:text-base font-bold shadow-2xl border border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Daftar Kajian & Kegiatan
          </Link>

          <Link
            href="/donasi"
            className="px-7 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-stone-200 hover:text-white text-sm sm:text-base font-semibold backdrop-blur-md border border-stone-600/70 hover:border-amber-400/60 transition-all duration-300 hover:scale-105"
          >
            Salurkan Infaq Digital
          </Link>
        </div>
      </div>

      {/* Smooth Concave Dome Arch Bottom Divider into #FAF8F5 (matching signature curve) */}
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
