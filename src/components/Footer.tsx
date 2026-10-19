"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, language } = useLanguage();
  const isEn = language === "en";
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

  const handleComingSoon = (platform: string) => {
    setComingSoonMessage(
      isEn
        ? `Official ${platform} Channel of UMS Sudalmiyah Mosque is Coming Soon!`
        : `Kanal ${platform} Resmi Masjid Sudalmiyah UMS segera hadir (Coming Soon)!`
    );
    setTimeout(() => {
      setComingSoonMessage(null);
    }, 3500);
  };
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
                  {t.footer.campusMosque}
                </h3>
                <p className="text-xs text-stone-300">
                  {t.footer.university}
                </p>
              </div>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed max-w-md">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[#FCD34D] text-xs font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.footer.security}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {t.footer.navTitle}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/sejarah" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.history}</span>
                </Link>
              </li>
              <li>
                <Link href="/#masjidmu" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.lpcrPillars}</span>
                </Link>
              </li>
              <li>
                <Link href="/ibadah" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.worshipSpace}</span>
                </Link>
              </li>
              <li>
                <Link href="/jadwal" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.prayerSchedule}</span>
                </Link>
              </li>
              <li>
                <Link href="/agenda" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.agendaRoutine}</span>
                </Link>
              </li>
              <li>
                <Link href="/donasi" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.digitalInfaqQris}</span>
                </Link>
              </li>
              <li>
                <Link href="/#kotak-saran" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.feedbackBox}</span>
                </Link>
              </li>
              <li>
                <Link href="/#berita" className="flex items-center gap-2.5 hover:text-[#FCD34D] transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform shrink-0" />
                  <span>{t.footer.campusNews}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              {t.footer.secretariatTitle}
            </h4>
            <div className="space-y-2 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{t.footer.campusAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href="tel:+62271717417,3158"
                  className="hover:text-[#FCD34D] transition-colors"
                  title="Telepon UMS ext. 3158"
                >
                  (0271) 717417 ext. 3158
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a
                  href="mailto:lppik@ums.ac.id"
                  className="hover:text-[#FCD34D] transition-colors"
                  title="Email LPPIK UMS"
                >
                  lppik@ums.ac.id
                </a>
              </div>
            </div>

            {/* Social Media in Sekretariat Column */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2.5">
                {isEn ? "Social Media Channels" : "Kanal Media Sosial"}
              </span>
              <div className="flex items-center gap-2.5">
                {/* WhatsApp Pak Dodi */}
                <a
                  href="https://wa.me/628122684688"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all border border-white/10 hover:border-[#25D366] hover:scale-110 shadow-sm"
                  aria-label="WhatsApp Pak Dodi / Takmir (+62 812-2684-688)"
                  title="WhatsApp Pak Dodi: +62 812-2684-688"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <button
                  type="button"
                  onClick={() => handleComingSoon("Instagram")}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#E4405F] text-white flex items-center justify-center transition-all border border-white/10 hover:border-[#E4405F] hover:scale-110 shadow-sm cursor-pointer"
                  aria-label="Instagram Resmi Masjid UMS"
                  title="Instagram (Coming Soon)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </button>
                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleComingSoon("Facebook")}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all border border-white/10 hover:border-[#1877F2] hover:scale-110 shadow-sm cursor-pointer"
                  aria-label="Facebook Resmi Masjid UMS"
                  title="Facebook (Coming Soon)"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              {/* Notice Coming Soon */}
              {comingSoonMessage && (
                <div className="mt-2.5 p-2 px-3 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-medium animate-fade-in flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{comingSoonMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            {t.footer.copyright}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-300">
            <span>Jama&apos;ah</span>
            <span>Jam&apos;iyah</span>
            <span>Jariyah</span>
            <span className="text-stone-500">•</span>
            <Link href="/auth/login" className="hover:text-amber-300 transition-colors">
              {t.footer.takmirAccess}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
