"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Compass,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  Users,
  Leaf,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function MasjidMuSection() {
  const pillars = [
    {
      code: "IDARAH",
      title: "Tata Kelola & Manajemen Terbuka",
      subtitle: "Manajemen Modern Berkemajuan",
      icon: ShieldCheck,
      color: "text-[#003B73]",
      bgBadge: "bg-[#003B73]/10 text-[#003B73] border-[#003B73]/20",
      description:
        "Pengelolaan masjid berbasis transparansi digital dengan pencatatan audit log, transparansi keuangan infaq secara terbuka, serta tata administrasi profesional berstandar persyarikatan.",
      points: [
        "Laporan keuangan digital transparan real-time",
        "SOP kepengurusan dan takmir profesional",
        "Digitalisasi perizinan sarana dan fasilitas kampus",
      ],
    },
    {
      code: "IMARAH",
      title: "Peribadatan & Dakwah Inklusif",
      subtitle: "Kemakmuran Ibadah Berstandar Tarjih",
      icon: Compass,
      color: "text-[#B58A1E]",
      bgBadge: "bg-[#B58A1E]/10 text-[#B58A1E] border-[#B58A1E]/20",
      description:
        "Penyelenggaraan ibadah fardhu berlandaskan hisab astronomis resmi Munas Tarjih PP Muhammadiyah dan MASA, diiringi kajian keislaman tematik sivitas akademika.",
      points: [
        "Jadwal shalat akurat selaras aplikasi resmi MASA",
        "Ruang ibadah digital Al-Qur'an ramah lansia & himpunan hadits",
        "Kajian ilmiah rutin mahasiswa, dosen, dan masyarakat umum",
      ],
    },
    {
      code: "RI'AYAH",
      title: "Fasilitas Ramah Umat & Eco-Mosque",
      subtitle: "Inklusif, Bersih & Ramah Lingkungan",
      icon: Leaf,
      color: "text-emerald-700",
      bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description:
        "Penyediaan infrastruktur ibadah yang nyaman, sarana ramah difabel dengan akses ramah kursi roda, efisiensi energi berkelanjutan, serta kebersihan lingkungan yang terjaga prima.",
      points: [
        "Aksesibilitas ramah difabel dan ramah lanjut usia",
        "Prinsip Eco-Mosque ramah lingkungan dan hemat energi",
        "Kenyamanan ruang shalat utama berhawa sejuk dan suci",
      ],
    },
    {
      code: "SOSIAL",
      title: "Pemberdayaan & Layanan Umat",
      subtitle: "Masjid Makmur dan Memakmurkan",
      icon: HeartHandshake,
      color: "text-[#003B73]",
      bgBadge: "bg-blue-50 text-[#003B73] border-blue-200",
      description:
        "Wujud nyata kepedulian persyarikatan melalui optimalisasi infaq dan shadaqah untuk beasiswa, santunan sosial, serta fasilitas serbaguna bagi kegiatan kemahasiswaan kampus.",
      points: [
        "Pemberdayaan sosial berbasis Infaq Digital QRIS",
        "Dukungan penuh kegiatan organisasi otonom (IMM & IPM)",
        "Pusat silaturahmi jamaah sivitas kampus dan warga Pabelan",
      ],
    },
  ];

  const highlights = [
    {
      label: "Standar Hisab MASA",
      desc: "Subuh -18°, Isya -18°, Ihtiyat +2 Menit",
      icon: Compass,
    },
    {
      label: "Inklusivitas Penuh",
      desc: "Aksesibilitas Ramah Difabel & Lansia",
      icon: Users,
    },
    {
      label: "Transparansi Real-Time",
      desc: "Laporan Infaq Terverifikasi & Diaudit",
      icon: ShieldCheck,
    },
    {
      label: "Eco-Mosque Berkelanjutan",
      desc: "Efisiensi Energi & Lingkungan Asri",
      icon: Leaf,
    },
  ];

  return (
    <section id="masjidmu" className="py-16 sm:py-20 bg-white border-y border-stone-200/80 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#D4AF37]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-t from-[#003B73]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
            Pusat Inspirasi <span className="text-[#003B73]">MasjidMu Percontohan</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
            Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta hadir sebagai model <strong>Masjid Percontohan Muhammadiyah (MasjidMu Percontohan)</strong> di lingkungan Perguruan Tinggi Muhammadiyah dan &apos;Aisyiyah. Mengimplementasikan semangat <em>Makmur dan Memakmurkan</em> melalui keunggulan Idarah, Imarah, dan Ri&apos;ayah.
          </p>
        </div>

        {/* Highlights Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 shadow-sm flex items-start gap-3.5 hover:border-[#D4AF37]/60 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-white text-[#003B73] border border-stone-200/70 shadow-xs shrink-0">
                  <Icon className="w-5 h-5 text-[#B58A1E]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
                    {item.label}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Four Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-stone-200/90 bg-[#FAF8F5]/60 p-6 sm:p-8 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:border-[#D4AF37]/40 transition-all duration-300 group"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${pillar.bgBadge}`}
                    >
                      Pilar {pillar.code}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className={`w-5 h-5 ${pillar.color}`} />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-serif mb-1 group-hover:text-[#003B73] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#B58A1E] uppercase tracking-wider mb-3">
                    {pillar.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2 border-t border-stone-200/70 pt-4 mb-4">
                    {pillar.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#003B73] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom link to related service */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1 group-hover:text-[#003B73] transition-colors">
                    <span>Standar Terintegrasi Sudalmiyah</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Call to Action */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#002855] via-[#003B73] to-[#001F3F] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-blue-400/20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-serif">
              Mewujudkan Masjid yang Makmur dan Memakmurkan
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
              Dukung akselerasi MasjidMu Percontohan Kampus 2 UMS melalui partisipasi shalat berjamaah, menghadiri kajian ilmu, pemanfaatan ruang ibadah digital, serta saluran infaq berkah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/ibadah"
              className="px-6 py-3 rounded-full bg-white text-[#003B73] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              Ruang Ibadah Digital
            </Link>
            <Link
              href="/donasi"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all hover:scale-105"
            >
              Salurkan Infaq
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
