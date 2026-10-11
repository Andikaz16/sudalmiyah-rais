"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calendar,
  HeartHandshake,
  BookOpen,
  Home,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const items = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/ibadah", label: "Ibadah", icon: BookOpen },
    { href: "/jadwal", label: "Jadwal", icon: Compass },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/donasi", label: "Infaq", icon: HeartHandshake },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-stone-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 ${
                isActive
                  ? "text-[#0D5C58] font-bold"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? "bg-[#0D5C58]/10" : "bg-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#0D5C58]" : "text-stone-400"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
