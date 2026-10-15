"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { PopupBanner } from "@/lib/types";

export const POPUP_CACHE_KEY = "sudalmiyah_popup_cache";

export default function AnnouncementPopup() {
  const [popup, setPopup] = useState<PopupBanner | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchPopup = async () => {
      let serverPopup: PopupBanner | null = null;

      try {
        const res = await fetch(`/api/popup?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.popup) {
            serverPopup = data.popup;
          }
        }
      } catch (err) {
        console.error("AnnouncementPopup fetch error:", err);
      }

      // Check local cache sync (ensures instant consistency across serverless cold-starts)
      let resolvedPopup: PopupBanner | null = serverPopup;
      try {
        const rawCache = localStorage.getItem(POPUP_CACHE_KEY);
        if (rawCache) {
          const parsedCache = JSON.parse(rawCache) as {
            popup: PopupBanner | null;
            updatedAt: string;
          };
          if (serverPopup && parsedCache.updatedAt) {
            const serverTime = new Date(serverPopup.updatedAt).getTime();
            const cacheTime = new Date(parsedCache.updatedAt).getTime();
            if (cacheTime >= serverTime) {
              resolvedPopup = parsedCache.popup;
            }
          } else if (!serverPopup && parsedCache.popup) {
            resolvedPopup = parsedCache.popup;
          }
        }
      } catch {
        // Ignore storage parse errors
      }

      if (resolvedPopup && resolvedPopup.isActive) {
        setPopup(resolvedPopup);
        setIsOpen(true);
      } else {
        setPopup(null);
        setIsOpen(false);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !popup) return null;

  const cleanTargetUrl = popup.targetUrl?.trim() || "";
  const hasTargetUrl = cleanTargetUrl.length > 0;
  const cleanTitle = popup.title?.trim() || "";

  const handleClickBanner = () => {
    if (!hasTargetUrl) return;
    handleClose();
    if (cleanTargetUrl.startsWith("http://") || cleanTargetUrl.startsWith("https://")) {
      window.open(cleanTargetUrl, "_blank", "noopener,noreferrer");
    } else {
      router.push(cleanTargetUrl.startsWith("/") ? cleanTargetUrl : `/${cleanTargetUrl}`);
    }
  };

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

        {/* Image Body (Clickable only if targetUrl is filled by admin) */}
        <div
          onClick={hasTargetUrl ? handleClickBanner : undefined}
          className={`relative w-full overflow-y-auto bg-stone-950 flex flex-col items-center justify-center max-h-[68vh] ${
            hasTargetUrl ? "cursor-pointer group" : "cursor-default"
          }`}
          title={hasTargetUrl ? "Klik untuk membuka tautan pengumuman" : cleanTitle || "Pengumuman Masjid"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={popup.imageUrl}
            alt={cleanTitle || "Pengumuman Masjid"}
            className={`w-full h-auto max-h-[68vh] object-contain transition-transform duration-300 ${
              hasTargetUrl ? "group-hover:scale-[1.01]" : ""
            }`}
          />

          {/* Hover Overlay Hint only when targetUrl is provided */}
          {hasTargetUrl && (
            <div className="absolute inset-0 bg-[#001F3F]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-full bg-white text-[#001F3F] text-xs font-bold shadow-xl flex items-center gap-2">
                <span>Buka Tautan Pengumuman</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            {cleanTitle ? (
              <h4 className="text-xs font-bold text-stone-900 truncate font-serif">
                {cleanTitle}
              </h4>
            ) : (
              <span className="text-xs font-medium text-stone-600">
                Informasi Resmi Takmir Masjid Hj. Sudalmiyah Rais
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {hasTargetUrl && (
              <button
                onClick={handleClickBanner}
                className="px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Buka Tautan</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
