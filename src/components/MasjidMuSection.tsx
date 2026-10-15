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
} from "lucide-react";

export default function MasjidMuSection() {
  const pillars = [
    {
      code: "IDARAH",
      title: "Tata Kelola & Manajemen AUM Berkemajuan",
      subtitle: "Good Governance Institusi Persyarikatan",
      icon: ShieldCheck,
      color: "text-[#003B73]",
      bgBadge: "bg-[#003B73]/10 text-[#003B73] border-[#003B73]/20",
      description:
        "Standar manajemen kelembagaan masjid di lingkungan Amal Usaha Muhammadiyah (AUM) dengan tata kelola profesional, transparansi digital terverifikasi audit, kepengurusan terstruktur, dan akuntabilitas syariah.",
      points: [
        "Integrasi tata kelola manajerial berstandar AUM & PTMA",
        "Laporan keuangan infaq terbuka, teraudit & real-time",
        "SOP takmir profesional dan digitalisasi layanan fasilitas",
      ],
    },
    {
      code: "IMARAH",
      title: "Kemakmuran Ibadah & Episentrum AIK",
      subtitle: "Dakwah Mencerahkan & Kaderisasi Persyarikatan",
      icon: Compass,
      color: "text-[#B58A1E]",
      bgBadge: "bg-[#B58A1E]/10 text-[#B58A1E] border-[#B58A1E]/20",
      description:
        "Menggerakkan peribadatan berpedoman resmi HPT PP Muhammadiyah dan hisab MASA, sekaligus menjadi episentrum pembinaan Al-Islam dan Kemuhammadiyahan (AIK) bagi seluruh pimpinan, dosen, karyawan, dan mahasiswa.",
      points: [
        "Pusat pembinaan ideologi AIK civitas akademika & pimpinan AUM",
        "Jadwal shalat hisab astronomis standar Munas Tarjih & MASA",
        "Kajian tematik ilmiah, fatwa tarjih, dan ruang ibadah digital",
      ],
    },
    {
      code: "RI'AYAH",
      title: "Infrastruktur Unggul & Eco-Mosque",
      subtitle: "Standar Sarana Representatif AUM",
      icon: Leaf,
      color: "text-emerald-700",
      bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description:
        "Pemeliharaan fisik, sanitasi, dan fasilitas masjid representatif standar kampus unggul. Mengedepankan prinsip Eco-Campus/Eco-Mosque ramah lingkungan, hemat energi, serta aksesibilitas inklusif ramah difabel dan lansia.",
      points: [
        "Standar sarana representatif bagi tamu, civitas, dan jamaah AUM",
        "Aksesibilitas ramah kursi roda, disabilitas, dan ramah lansia",
        "Penerapan prinsip Eco-Mosque, efisiensi energi & kebersihan prima",
      ],
    },
    {
      code: "SOSIAL",
      title: "Pemberdayaan Umat & Sinergi Persyarikatan",
      subtitle: "Masjid Makmur dan Memakmurkan Sekitar",
      icon: HeartHandshake,
      color: "text-[#003B73]",
      bgBadge: "bg-blue-50 text-[#003B73] border-blue-200",
      description:
        "Wujud kepedulian sosial AUM melalui optimalisasi infaq digital untuk beasiswa mahasiswa, kemaslahatan masyarakat sekitar kampus, serta sinergi pengkaderan bersama Organisasi Otonom (Ortom) Muhammadiyah.",
      points: [
        "Penyaluran infaq berkah untuk beasiswa dan santunan sosial",
        "Sinergi aktif bersama Ortom (IMM, Tapak Suci, HW, & 'Aisyiyah)",
        "Pelayanan umat dan kemitraan harmonis warga sekitar lingkungan AUM",
      ],
    },
  ];

  const highlights = [
    {
      label: "Episentrum AIK & Kader",
      desc: "Penguatan Ideologi Civitas Akademika AUM",
      icon: BookOpen,
    },
    {
      label: "Standar Hisab MASA Tarjih",
      desc: "Akurasi Waktu Ibadah & Pedoman HPT Resmi",
      icon: Compass,
    },
    {
      label: "Tata Kelola & Audit Terbuka",
      desc: "Transparansi Finansial Infaq & Good Governance",
      icon: ShieldCheck,
    },
    {
      label: "Fasilitas Unggul & Inklusif",
      desc: "Aksesibilitas Difabel & Prinsip Eco-Campus",
      icon: Users,
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
            Masjid Percontohan <span className="text-[#003B73]">AUM</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
            Masjid UMS hadir sebagai teladan dan standar <strong>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</strong> di lingkungan Perguruan Tinggi Muhammadiyah dan &apos;Aisyiyah (PTMA) serta institusi persyarikatan. Menjadi episentrum pembinaan spiritual, integrasi Al-Islam &amp; Kemuhammadiyahan (AIK), pengkaderan persyarikatan, serta tata kelola modern berbasis Idarah, Imarah, dan Ri&apos;ayah.
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
                    <span>Standar Keunggulan Masjid AUM UMS</span>
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
              Mewujudkan Standar Masjid Percontohan AUM Berkemajuan
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
              Dukung penguatan peran masjid di lingkungan Amal Usaha Muhammadiyah melalui partisipasi aktif ibadah berjamaah, penguatan kajian AIK, pemanfaatan ruang ibadah digital, serta saluran infaq berkah.
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
