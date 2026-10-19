"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Building2,
  BookOpen,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [layananDropdownOpen, setLayananDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleDropdownEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setLayananDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setLayananDropdownOpen(false);
    }, 250);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLayananDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setLayananDropdownOpen(false);
    setIsOpen(false);
  }, [pathname]);

  const navLinks: Array<{ href: string; label: string; isDropdown?: boolean }> = [
    { href: "/", label: t.navbar.home },
    { href: "/sejarah", label: t.navbar.history },
    { href: "/ibadah", label: t.navbar.worship },
    { href: "/jadwal", label: t.navbar.prayerTimes },
    { href: "/layanan", label: t.navbar.services, isDropdown: true },
    { href: "/donasi", label: t.navbar.digitalInfaq },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/70 text-stone-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 sm:gap-3.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logo/logo-masjid.png"
                alt="Logo Masjid UMS"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#003B73] group-hover:text-[#B58A1E] transition-colors font-serif">
                Masjid Kampus
              </span>
              <span className="text-[10px] text-stone-500 tracking-wider uppercase font-medium">
                Universitas Muhammadiyah Surakarta
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              if (link.isDropdown) {
                const isLayananActive = pathname.startsWith("/layanan");
                return (
                  <div
                    key="layanan-dropdown"
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
                        setLayananDropdownOpen((prev) => !prev);
                      }}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                        isLayananActive
                          ? "text-[#003B73] font-semibold bg-[#003B73]/10"
                          : "text-stone-600 hover:text-[#003B73] hover:bg-stone-100/60"
                      }`}
                    >
                      <span>Layanan</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          layananDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Box with zero-gap hover bridge */}
                    {layananDropdownOpen && (
                      <div
                        className="absolute top-full left-0 pt-2 w-72 z-50 animate-fade-in"
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleDropdownLeave}
                      >
                        {/* Invisible hover bridge buffer connecting trigger button to menu */}
                        <div className="absolute -top-2 left-0 right-0 h-4 bg-transparent pointer-events-auto" />

                        <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xl p-2 space-y-1 relative z-10">
                          <Link
                            href="/layanan"
                            onClick={() => setLayananDropdownOpen(false)}
                            className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                              pathname === "/layanan"
                                ? "bg-stone-100 text-[#003B73]"
                                : "hover:bg-stone-50 text-stone-800"
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-[#003B73]/10 text-[#003B73] shrink-0 mt-0.5">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">
                                {t.navbar.bookingForm}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                                {t.navbar.bookingFormDesc}
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/layanan/unduhan"
                            onClick={() => setLayananDropdownOpen(false)}
                            className={`p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                              pathname === "/layanan/unduhan"
                                ? "bg-stone-100 text-[#003B73]"
                                : "hover:bg-stone-50 text-stone-800"
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-800 shrink-0 mt-0.5">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">
                                {t.navbar.downloadCenter}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                                {t.navbar.downloadCenterDesc}
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-[#003B73] font-semibold bg-[#003B73]/10"
                      : "text-stone-600 hover:text-[#003B73] hover:bg-stone-100/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language Switcher Button (ID | EN) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="inline-flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/90 shadow-xs">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  language === "id"
                    ? "bg-[#003B73] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="Bahasa Indonesia"
                aria-label="Ganti ke Bahasa Indonesia"
              >
                <span>ID</span>
                <span className="hidden lg:inline text-[10px] font-normal opacity-90">INA</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                  language === "en"
                    ? "bg-[#003B73] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                title="English"
                aria-label="Switch to English"
              >
                <span>EN</span>
                <span className="hidden lg:inline text-[10px] font-normal opacity-90">ENG</span>
              </button>
            </div>
          </div>

          {/* Mobile menu trigger + compact language toggle */}
          <div className="flex md:hidden items-center gap-2">
            <div className="inline-flex items-center p-0.5 rounded-full bg-stone-100 border border-stone-200/90">
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  language === "id"
                    ? "bg-[#003B73] text-white shadow-xs"
                    : "text-stone-600"
                }`}
                aria-label="Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-[#003B73] text-white shadow-xs"
                    : "text-stone-600"
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium ${
              pathname === "/" ? "bg-[#003B73]/10 text-[#003B73] font-bold" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {t.navbar.home}
          </Link>
          <Link
            href="/sejarah"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium ${
              pathname === "/sejarah" ? "bg-[#003B73]/10 text-[#003B73] font-bold" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {t.navbar.history}
          </Link>
          <Link
            href="/ibadah"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium ${
              pathname === "/ibadah" ? "bg-[#003B73]/10 text-[#003B73] font-bold" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {t.navbar.worship}
          </Link>
          <Link
            href="/jadwal"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium ${
              pathname === "/jadwal" ? "bg-[#003B73]/10 text-[#003B73] font-bold" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {t.navbar.prayerTimes}
          </Link>

          {/* Layanan Group in Mobile */}
          <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block px-2 py-0.5">
              {t.navbar.servicesGroup}
            </span>
            <Link
              href="/layanan"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                pathname === "/layanan" ? "bg-[#003B73] text-white" : "text-stone-800 hover:bg-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.navbar.bookingForm}</span>
            </Link>
            <Link
              href="/layanan/unduhan"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                pathname === "/layanan/unduhan" ? "bg-[#003B73] text-white" : "text-stone-800 hover:bg-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.navbar.downloadCenter}</span>
            </Link>
          </div>

          <Link
            href="/donasi"
            onClick={() => setIsOpen(false)}
            className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium ${
              pathname === "/donasi" ? "bg-[#003B73]/10 text-[#003B73] font-bold" : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            {t.navbar.digitalInfaq}
          </Link>

          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-stone-100 rounded-xl">
              <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#003B73]" />
                {t.navbar.language}
              </span>
              <div className="inline-flex items-center p-0.5 rounded-full bg-white border border-stone-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("id")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    language === "id" ? "bg-[#003B73] text-white shadow-xs" : "text-stone-700"
                  }`}
                >
                  ID (Indonesia)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    language === "en" ? "bg-[#003B73] text-white shadow-xs" : "text-stone-700"
                  }`}
                >
                  EN (English)
                </button>
              </div>
            </div>

            <Link
              href="/agenda"
              onClick={() => setIsOpen(false)}
              className="block text-center w-full px-4 py-2.5 rounded-xl bg-[#003B73] text-white font-semibold text-xs shadow-sm"
            >
              {t.navbar.mosqueAgenda}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
