"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PopupBanner, isPopupExpired } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

export const POPUP_CACHE_KEY = "sudalmiyah_popup_cache";

// Module-level in-memory session flags:
// Persists during client-side SPA navigation between pages (e.g. Beranda -> Ruang Ibadah -> Beranda),
// but automatically resets when the browser page is reloaded / refreshed (F5 / browser refresh).
let sessionDismissed = false;
let sessionActivePopups: PopupBanner[] | null = null;

export default function AnnouncementPopup() {
  const { language } = useLanguage();
  const isEn = language === "en";

  // Synchronous initialization from local cache for instant 0ms appearance
  const [popups, setPopups] = useState<PopupBanner[]>(() => {
    if (typeof window === "undefined") return [];
    if (sessionDismissed) return [];
    if (sessionActivePopups !== null) return sessionActivePopups;

    try {
      const rawCache = localStorage.getItem(POPUP_CACHE_KEY);
      if (rawCache) {
        const parsed = JSON.parse(rawCache);
        if (Array.isArray(parsed.popups) && parsed.popups.length > 0) {
          const list = parsed.popups.filter((p: PopupBanner) => p && p.isActive && !isPopupExpired(p));
          sessionActivePopups = list;
          return list;
        }
        if (parsed.popup && parsed.popup.isActive && !isPopupExpired(parsed.popup)) {
          const list = [parsed.popup];
          sessionActivePopups = list;
          return list;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the popup announcement modal
  const handleClose = useCallback(() => {
    setPopups([]);
    sessionActivePopups = [];
    sessionDismissed = true;
  }, []);

  const totalPopups = popups.length;

  const handleNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (totalPopups > 0 ? (prev + 1) % totalPopups : 0));
  }, [totalPopups]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (totalPopups > 0 ? (prev - 1 + totalPopups) % totalPopups : 0));
  }, [totalPopups]);

  // Keep index within bounds if list changes
  useEffect(() => {
    if (currentIndex >= totalPopups && totalPopups > 0) {
      setCurrentIndex(0);
    }
  }, [totalPopups, currentIndex]);

  // Background fetch to sync with latest takmir updates
  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const res = await fetch(`/api/popup?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          let serverList: PopupBanner[] = [];
          if (Array.isArray(data.popups) && data.popups.length > 0) {
            serverList = data.popups.filter((p: PopupBanner) => p.isActive && !isPopupExpired(p));
          } else if (data.popup && data.popup.isActive && !isPopupExpired(data.popup)) {
            serverList = [data.popup];
          }

          // Guard local cache: do not overwrite active local cache with empty list
          // if it was caused by a cold serverless container restart
          try {
            const rawCache = localStorage.getItem(POPUP_CACHE_KEY);
            if (serverList.length === 0 && rawCache) {
              const parsed = JSON.parse(rawCache);
              const hasCachedPopups = Array.isArray(parsed.popups) && parsed.popups.length > 0;
              if (hasCachedPopups && !parsed.explicitlyDeleted) {
                if (!sessionDismissed) {
                  const kept = parsed.popups.filter((p: PopupBanner) => p && p.isActive && !isPopupExpired(p));
                  setPopups(kept);
                  sessionActivePopups = kept;
                }
                return;
              }
            }

            localStorage.setItem(
              POPUP_CACHE_KEY,
              JSON.stringify({
                popup: serverList[0] || null,
                popups: serverList,
                explicitlyDeleted: serverList.length === 0,
                updatedAt: new Date().toISOString(),
              })
            );
          } catch {
            // ignore storage errors
          }

          if (!sessionDismissed) {
            setPopups(serverList);
            sessionActivePopups = serverList;
            if (serverList.length === 0) {
              sessionDismissed = true;
            }
          }
        }
      } catch (err) {
        console.error("AnnouncementPopup sync error:", err);
      }
    };

    fetchPopups();
  }, []);

  // Keyboard navigation: Escape to close, ArrowLeft / ArrowRight to slide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (popups.length === 0) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft" && totalPopups > 1) {
        handlePrev();
      } else if (e.key === "ArrowRight" && totalPopups > 1) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popups.length, totalPopups, handleClose, handlePrev, handleNext]);

  // Auto-advance slider every 6.5 seconds when multiple banners are active and not hovered
  useEffect(() => {
    if (totalPopups <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPopups);
    }, 6500);

    return () => clearInterval(timer);
  }, [totalPopups, isPaused]);

  if (popups.length === 0) return null;

  const safeIndex = currentIndex < popups.length ? currentIndex : 0;
  const current = popups[safeIndex];
  if (!current) return null;

  const rawTargetUrl = current.targetUrl?.trim() || "";
  const cleanUrl = rawTargetUrl === "/donasi" ? "" : rawTargetUrl;
  const hasUrl = cleanUrl.length > 0;

  const isHttpOrHttps = cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://");
  const isExplicitInternal = cleanUrl.startsWith("/");
  const isExternalDomain = !isExplicitInternal && (cleanUrl.includes(".") || cleanUrl.startsWith("wa.me"));
  const isExternal = isHttpOrHttps || isExternalDomain;

  const normalizedHref = hasUrl
    ? isExternal
      ? isHttpOrHttps
        ? cleanUrl
        : `https://${cleanUrl}`
      : cleanUrl.startsWith("/")
      ? cleanUrl
      : `/${cleanUrl}`
    : undefined;

  const handleImageClick = (e: React.MouseEvent) => {
    if (!hasUrl) return;
    e.preventDefault();
    handleClose();
    if (isExternal && normalizedHref) {
      window.open(normalizedHref, "_blank", "noopener,noreferrer");
    } else if (normalizedHref) {
      router.push(normalizedHref);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-24 sm:pt-28 pb-8 px-4 bg-black/75 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative flex flex-col items-center justify-center w-full max-w-2xl my-auto select-none"
      >
        {/* Main Banner Card */}
        <div className="relative inline-block rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-stone-200/90 transition-all duration-300">
          {/* Close Button [X] clearly positioned and never covered by navbar */}
          <button
            type="button"
            onClick={handleClose}
            aria-label={isEn ? "Close Pop-up" : "Tutup Pop-up"}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-stone-900 border-2 border-stone-800 shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
            title={isEn ? "Close (Esc)" : "Tutup (Esc)"}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Carousel Previous Arrow Button */}
          {totalPopups > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label={isEn ? "Previous announcement" : "Pengumuman sebelumnya"}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-xs shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-white/30"
              title={isEn ? "Previous (Left Arrow)" : "Sebelumnya (Panah Kiri)"}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* Carousel Next Arrow Button */}
          {totalPopups > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label={isEn ? "Next announcement" : "Pengumuman berikutnya"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-xs shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-white/30"
              title={isEn ? "Next (Right Arrow)" : "Berikutnya (Panah Kanan)"}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {/* Banner Image */}
          {hasUrl ? (
            <a
              href={normalizedHref}
              onClick={handleImageClick}
              className="block cursor-pointer focus:outline-hidden"
              title={isEn ? "Click to open details" : "Klik untuk membuka rincian"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.id}
                src={current.imageUrl}
                alt={current.title || (isEn ? "Mosque Announcement" : "Pengumuman Masjid")}
                className="block w-auto h-auto max-w-[90vw] sm:max-w-lg md:max-w-xl max-h-[70vh] sm:max-h-[74vh] object-contain select-none transition-opacity duration-300 animate-fade-in"
              />
            </a>
          ) : (
            <div className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={current.id}
                src={current.imageUrl}
                alt={current.title || (isEn ? "Mosque Announcement" : "Pengumuman Masjid")}
                className="block w-auto h-auto max-w-[90vw] sm:max-w-lg md:max-w-xl max-h-[70vh] sm:max-h-[74vh] object-contain select-none transition-opacity duration-300 animate-fade-in"
              />
            </div>
          )}
        </div>

        {/* Carousel Multi-Banner Pagination & Dots Control */}
        {totalPopups > 1 && (
          <div className="mt-3 flex items-center gap-3 px-4 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md text-white border border-white/20 shadow-lg text-xs animate-fade-in">
            <span className="font-medium text-[11px] text-stone-200">
              {isEn
                ? `Announcement ${safeIndex + 1} of ${totalPopups}`
                : `Pengumuman ${safeIndex + 1} dari ${totalPopups}`}
            </span>
            <div className="flex items-center gap-1.5">
              {popups.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`${isEn ? "Go to slide" : "Menuju slide"} ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    idx === safeIndex
                      ? "w-4 h-2 bg-[#F59E0B]"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
