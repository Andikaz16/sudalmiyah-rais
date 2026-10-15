"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#001F3F] border-t border-blue-950 text-stone-300 text-xs sm:text-sm pt-14 pb-24 md:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo/logo-masjid-white.png"
                  alt="Logo Masjid UMS"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-serif">
                  Masjid Kampus
                </h3>
                <p className="text-xs text-stone-300">
                  Universitas Muhammadiyah Surakarta
                </p>
              </div>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed max-w-md">
              Pusat peribadatan dan teladan Masjid Percontohan Amal Usaha Muhammadiyah (AUM) bagi civitas akademika UMS dan masyarakat luas. Mengimplementasikan standar Idarah, Imarah, dan Ri&apos;ayah yang profesional, inklusif, makmur dan memakmurkan.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[#FCD34D] text-xs font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Sistem Terenkripsi &amp; Standar Keamanan OWASP Berlapis</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Navigasi Layanan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sejarah" className="hover:text-[#FCD34D] transition-colors">
                  Sejarah Masjid Kampus
                </Link>
              </li>
              <li>
                <Link href="/#masjidmu" className="hover:text-[#FCD34D] transition-colors">
                  Pilar Masjid Percontohan AUM
                </Link>
              </li>
              <li>
                <Link href="/ibadah" className="hover:text-[#FCD34D] transition-colors">
                  Ruang Ibadah Digital
                </Link>
              </li>
              <li>
                <Link href="/jadwal" className="hover:text-[#FCD34D] transition-colors">
                  Jadwal Shalat Surakarta
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="hover:text-[#FCD34D] transition-colors">
                  Agenda &amp; Kajian Rutin
                </Link>
              </li>
              <li>
                <Link href="/donasi" className="hover:text-[#FCD34D] transition-colors">
                  Infaq Digital QRIS
                </Link>
              </li>
              <li>
                <Link href="/#kotak-saran" className="hover:text-[#FCD34D] transition-colors">
                  Kotak Saran &amp; Aspirasi
                </Link>
              </li>
              <li>
                <Link href="/#berita" className="hover:text-[#FCD34D] transition-colors">
                  Warta Kampus &amp; Persyarikatan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Sekretariat Takmir
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Kampus 2 UMS, Jl. A. Yani, Pabelan, Kartasura, Sukoharjo, Jawa Tengah</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>(0271) 717417 ext. Takmir</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>masjid.sudalmiyah@ums.ac.id</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            Hak Cipta © 2026 Masjid Kampus - Universitas Muhammadiyah Surakarta. Seluruh Hak Dilindungi.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span>Integritas</span>
            <span>Syariah</span>
            <span>Berkemajuan</span>
            <span className="text-stone-500">•</span>
            <Link href="/auth/login" className="hover:text-amber-300 transition-colors">
              Akses Takmir
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
