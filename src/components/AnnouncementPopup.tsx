"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { PopupBanner } from "@/lib/types";

export default function AnnouncementPopup() {
  const [popup, setPopup] = useState<PopupBanner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch("/api/popup", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();

        if (data.popup && data.popup.isActive) {
          // Check if dismissed in this browser session
          const dismissedId = sessionStorage.getItem("sudalmiyah_popup_dismissed");
          if (dismissedId !== data.popup.id) {
            setPopup(data.popup);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("AnnouncementPopup error:", err);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    if (popup) {
      sessionStorage.setItem("sudalmiyah_popup_dismissed", popup.id);
    }
    setIsOpen(false);
  };

  const handleClickBanner = () => {
    if (!popup) return;
    handleClose();
    if (popup.targetUrl.startsWith("http://") || popup.targetUrl.startsWith("https://")) {
      window.open(popup.targetUrl, "_blank", "noopener,noreferrer");
    } else {
      router.push(popup.targetUrl);
    }
  };

  if (!isOpen || !popup) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/80 animate-scale-up flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#001F3F] text-white px-4 py-3 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs font-bold font-serif tracking-wide text-amber-300 uppercase">
              Pengumuman &amp; Warta Masjid UMS
            </span>
          </div>

          <button
            onClick={handleClose}
            aria-label="Tutup Pengumuman"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clickable Image Body */}
        <div
          onClick={handleClickBanner}
          className="relative w-full overflow-y-auto cursor-pointer group bg-stone-950 flex flex-col items-center justify-center max-h-[65vh]"
          title="Klik untuk membuka informasi pengumuman"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={popup.imageUrl}
            alt={popup.title || "Pengumuman Masjid"}
            className="w-full h-auto max-h-[65vh] object-contain group-hover:scale-[1.01] transition-transform duration-300"
          />

          {/* Hover Overlay Hint */}
          <div className="absolute inset-0 bg-[#001F3F]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-white text-[#001F3F] text-xs font-bold shadow-xl flex items-center gap-2">
              <span>Buka Halaman Terkait</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-stone-900 truncate font-serif">
              {popup.title}
            </h4>
            <p className="text-[11px] text-stone-500 truncate">
              {popup.detectedCategory || "Klik untuk melihat rincian agenda"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClose}
              className="px-3.5 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleClickBanner}
              className="px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Buka Info</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
