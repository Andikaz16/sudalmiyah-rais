"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/ibadah", label: "Ruang Ibadah" },
    { href: "/jadwal", label: "Jadwal Shalat" },
    { href: "/layanan", label: "Layanan" },
    { href: "/donasi", label: "Infaq Digital" },
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

          {/* Right Action Button - Text Only without icons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/admin"
                className="px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-[1.02]"
              >
                Panel Takmir
              </Link>
            ) : (
              <Link
                href="/agenda"
                className="px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#003B73]/15 transition-all hover:scale-[1.02] border border-amber-400/30"
              >
                Agenda Masjid
              </Link>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 focus:outline-none"
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
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-[#003B73]/10 text-[#003B73] font-bold"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-stone-200">
            {user ? (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-3 rounded-full bg-[#003B73] text-white font-semibold text-sm"
              >
                Panel Takmir Masjid
              </Link>
            ) : (
              <Link
                href="/agenda"
                onClick={() => setIsOpen(false)}
                className="block text-center w-full px-4 py-3 rounded-full bg-[#003B73] text-white font-semibold text-sm shadow-md"
              >
                Agenda Masjid
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
