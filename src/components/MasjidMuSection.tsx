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
import { useLanguage } from "@/context/LanguageContext";

export default function MasjidMuSection() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const pillars = [
    {
      code: "JAMA'AH",
      title: isEn ? "Congregational Guidance & Worship Prosperity" : "Pembinaan Jama'ah & Kemakmuran Ibadah",
      subtitle: isEn ? "Enlightening Da'wah & AIK Strengthening" : "Dakwah Mencerahkan & Penguatan AIK",
      icon: Users,
      color: "text-[#B58A1E]",
      bgBadge: "bg-[#B58A1E]/10 text-[#B58A1E] border-[#B58A1E]/20",
      description: isEn
        ? "Advancing worship guided by official HPT PP Muhammadiyah and MASA SatuMu calculations, strengthening AIK ideology, and hosting inspiring scholarly thematic lectures for campus civitas and society."
        : "Menggerakkan peribadatan berpedoman resmi HPT PP Muhammadiyah dan hisab MASA SatuMu, penguatan ideologi AIK, serta kajian tematik ilmiah yang menyejukkan bagi civitas akademika dan masyarakat.",
      points: isEn
        ? [
            "Center for AIK ideology guidance for UMS academics & students",
            "Astronomical hisab prayer times based on Munas Tarjih & MASA SatuMu",
            "Thematic scientific lectures, tarjih fatwas, and digital prayer space",
          ]
        : [
            "Pusat pembinaan ideologi AIK civitas akademika & mahasiswa",
            "Jadwal shalat hisab astronomis standar Munas Tarjih & MASA SatuMu",
            "Kajian tematik ilmiah, fatwa tarjih, dan ruang ibadah digital",
          ],
    },
    {
      code: "JAM'IYAH",
      title: isEn ? "Modern Organizational Governance & Management" : "Tata Kelola Organisasi & Manajemen Modern",
      subtitle: isEn ? "Good Governance & Institutional Synergy" : "Good Governance & Sinergi Persyarikatan",
      icon: ShieldCheck,
      color: "text-[#003B73]",
      bgBadge: "bg-[#003B73]/10 text-[#003B73] border-[#003B73]/20",
      description: isEn
        ? "AUM institutional mosque management standards with professional governance, audited digital transparency, structured organization, and active synergy with campus bodies, Ortom, Ormawa, and student units."
        : "Standar manajemen kelembagaan masjid Amal Usaha Muhammadiyah (AUM) dengan tata kelola profesional, transparansi digital terverifikasi audit, kepengurusan terstruktur, serta sinergi erat bersama institusi kampus, Ortom, Ormawa, dan UKM.",
      points: isEn
        ? [
            "Managerial governance integration meeting AUM & PTMA standards",
            "Open, audited, and real-time infaq financial reports",
            "Active synergy with Ortom (IMM, Tapak Suci, HW, & 'Aisyiyah), Ormawa, & UKM",
          ]
        : [
            "Integrasi tata kelola manajerial berstandar AUM & PTMA",
            "Laporan keuangan infaq terbuka, teraudit & real-time",
            "Sinergi aktif bersama Ortom (IMM, Tapak Suci, HW, & 'Aisyiyah), Ormawa, dan UKM",
          ],
    },
    {
      code: "JARIYAH",
      title: isEn ? "Community Empowerment & Sustainable Facilities" : "Pemberdayaan Umat & Sarana Lestari",
      subtitle: isEn ? "Digital Philanthropy, Scholarships & Eco-Mosque" : "Filantropi Digital, Beasiswa & Eco-Mosque",
      icon: HeartHandshake,
      color: "text-emerald-700",
      bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: isEn
        ? "Optimizing digital infaq and waqf for student scholarships and community welfare, supported by representative campus-standard physical facilities that are eco-friendly and disability-inclusive."
        : "Optimalisasi infaq dan wakaf digital untuk beasiswa mahasiswa serta kemaslahatan sosial, didukung sarana prasarana fisik representatif standar kampus unggul yang ramah lingkungan dan difabel.",
      points: isEn
        ? [
            "Distribution of infaq blessings for scholarships and social assistance",
            "Inclusive accessibility for disabilities, seniors, & premier amenities",
            "Implementation of Eco-Mosque principles and energy efficiency",
          ]
        : [
            "Penyaluran infaq berkah untuk beasiswa dan santunan sosial",
            "Aksesibilitas inklusif ramah disabilitas, lansia, & sarana unggul",
            "Penerapan prinsip Eco-Mosque ramah lingkungan & efisiensi energi",
          ],
    },
  ];

  const highlights = [
    {
      label: isEn ? "AIK Strengthening" : "Penguatan AIK",
      desc: isEn ? "Ideological Guidance for UMS Academics" : "Pembinaan Ideologi Civitas Akademika UMS",
      icon: BookOpen,
    },
    {
      label: isEn ? "MASA SatuMu Standard" : "Standar MASA SatuMu",
      desc: isEn ? "Prayer Time Accuracy & Official HPT Guidance" : "Akurasi Waktu Ibadah & Pedoman HPT Resmi",
      icon: Compass,
    },
    {
      label: isEn ? "Open Governance & Audit" : "Tata Kelola & Audit Terbuka",
      desc: isEn ? "Infaq Financial Transparency & Good Governance" : "Transparansi Finansial Infaq & Good Governance",
      icon: ShieldCheck,
    },
    {
      label: isEn ? "Exemplary & Inclusive Facilities" : "Fasilitas Unggul & Inklusif",
      desc: isEn ? "Disability Accessibility & Eco-Campus Principles" : "Aksesibilitas Difabel & Prinsip Eco-Campus",
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
            {isEn ? (
              <>
                LPCR-PM <span className="text-[#003B73]">Model Mosque</span>
              </>
            ) : (
              <>
                Masjid Percontohan <span className="text-[#003B73]">LPCR-PM</span>
              </>
            )}
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wider text-[#003B73]/90 uppercase font-sans">
            {isEn
              ? "Institute for Branch & Ranting Development and Mosque Guidance PP Muhammadiyah"
              : "Lembaga Pengembangan Cabang Ranting & Pembinaan Masjid PP Muhammadiyah"}
          </p>

          <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed">
            {isEn ? (
              <>
                UMS Mosque serves as an exemplary model mosque of{" "}
                <strong className="font-bold text-stone-900">
                  Muhammadiyah Institutional Undertakings (AUM)
                </strong>{" "}
                within Muhammadiyah and &apos;Aisyiyah Higher Education (PTMA). Becoming the
                epicenter of da&apos;wah and Islamic &amp; Muhammadiyah education (AIK), cadre
                development, and modern governance based on 3J ({" "}
                <strong className="font-bold text-stone-900">
                  Jama&apos;ah, Jam&apos;iyah, and Jariyah
                </strong>{" "}
                ).
              </>
            ) : (
              <>
                Masjid UMS hadir sebagai masjid percontohan{" "}
                <strong className="font-bold text-stone-900">
                  Amal Usaha Muhammadiyah (AUM)
                </strong>{" "}
                di lingkungan Perguruan Tinggi Muhammadiyah dan &apos;Aisyiyah (PTMA). Menjadi
                episentrum dakwah dan pembinaan Al-Islam &amp; Kemuhammadiyahan (AIK), pengkaderan,
                serta tata kelola modern berbasis 3J ({" "}
                <strong className="font-bold text-stone-900">
                  Jama&apos;ah, Jam&apos;iyah, dan Jariyah
                </strong>{" "}
                ).
              </>
            )}
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

        {/* Three 3J Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-stone-200/90 bg-[#FAF8F5]/60 p-6 sm:p-7 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:border-[#D4AF37]/40 transition-all duration-300 group"
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
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif mb-1 group-hover:text-[#003B73] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#B58A1E] uppercase tracking-wider mb-3">
                    {pillar.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-stone-600 leading-relaxed mb-5">
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
                    <span>{isEn ? "3J Pillars of UMS LPCR-PM Mosque" : "Pilar 3J Masjid LPCR-PM UMS"}</span>
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
              {isEn
                ? "Realizing Progressive LPCR-PM Model Mosque Standards"
                : "Mewujudkan Standar Masjid Percontohan LPCR-PM Berkemajuan"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed">
              {isEn
                ? "Support strengthening the role of mosques in LPCR-PM and Amal Usaha Muhammadiyah (AUM) through active congregational worship, AIK study groups, digital prayer spaces, and noble infaq donations."
                : "Dukung penguatan peran masjid di lingkungan LPCR-PM dan Amal Usaha Muhammadiyah (AUM) melalui partisipasi aktif ibadah berjamaah, penguatan kajian AIK, pemanfaatan ruang ibadah digital, serta saluran infaq berkah."}
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
