"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PopupBanner } from "@/lib/types";

export const POPUP_CACHE_KEY = "sudalmiyah_popup_cache";

export default function AnnouncementPopup() {
  const [popups, setPopups] = useState<PopupBanner[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPopups = async () => {
      let serverPopups: PopupBanner[] = [];
      let serverLatestTime = 0;

      try {
        const res = await fetch(`/api/popup?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.popups) && data.popups.length > 0) {
            serverPopups = data.popups.filter((p: PopupBanner) => p.isActive);
          } else if (data.popup && data.popup.isActive) {
            serverPopups = [data.popup];
          }
          if (serverPopups.length > 0) {
            serverLatestTime = Math.max(
              ...serverPopups.map((p) => new Date(p.updatedAt).getTime() || 0)
            );
          }
        }
      } catch (err) {
        console.error("AnnouncementPopup fetch error:", err);
      }

      let resolvedPopups: PopupBanner[] = serverPopups;

      // Sync with localStorage cache to guarantee immediate appearance even on serverless cold starts
      try {
        const rawCache = localStorage.getItem(POPUP_CACHE_KEY);
        if (rawCache) {
          const parsedCache = JSON.parse(rawCache) as {
            popup?: PopupBanner | null;
            popups?: PopupBanner[];
            updatedAt: string;
          };
          const cacheTime = new Date(parsedCache.updatedAt || 0).getTime();
          const cachedList = Array.isArray(parsedCache.popups)
            ? parsedCache.popups.filter((p) => p && p.isActive)
            : parsedCache.popup && parsedCache.popup.isActive
            ? [parsedCache.popup]
            : [];

          if (serverPopups.length > 0 && parsedCache.updatedAt) {
            if (cacheTime >= serverLatestTime) {
              resolvedPopups = cachedList;
            }
          } else if (serverPopups.length === 0 && cachedList.length > 0) {
            resolvedPopups = cachedList;
          }
        }
      } catch {
        // Ignore storage parse errors
      }

      setPopups(resolvedPopups);
    };

    fetchPopups();
  }, []);

  const handleCloseOne = (id: string) => {
    setPopups((prev) => prev.filter((item) => item.id !== id));
  };

  const handleBackdropClick = () => {
    // Close the top-most popup when clicking the dark backdrop
    if (popups.length > 0) {
      handleCloseOne(popups[0].id);
    }
  };

  if (popups.length === 0) return null;

  // Render popups stacked: index 0 is the front-most popup, subsequent items sit behind it
  const stackedOrder = [...popups].reverse();

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 animate-fade-in"
    >
      <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
        {stackedOrder.map((item, idx) => {
          const isTop = idx === stackedOrder.length - 1;
          const cleanUrl = item.targetUrl?.trim() || "";
          const hasUrl = cleanUrl.length > 0;
          const isExternal =
            cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://");
          const normalizedHref = hasUrl
            ? isExternal
              ? cleanUrl
              : cleanUrl.startsWith("/")
              ? cleanUrl
              : `/${cleanUrl}`
            : undefined;

          const handleImageClick = (e: React.MouseEvent) => {
            if (!hasUrl) return;
            e.preventDefault();
            handleCloseOne(item.id);
            if (isExternal) {
              window.open(cleanUrl, "_blank", "noopener,noreferrer");
            } else if (normalizedHref) {
              router.push(normalizedHref);
            }
          };

          return (
            <div
              key={item.id}
              onClick={(e) => e.stopPropagation()}
              className={`pointer-events-auto inline-block rounded-2xl overflow-hidden shadow-2xl bg-white transition-all duration-200 ${
                isTop
                  ? "relative z-20 opacity-100 scale-100"
                  : "absolute z-10 opacity-60 scale-[0.97]"
              }`}
            >
              {/* Top-Right Close Button [X] matching LPPIK UMS style */}
              <button
                type="button"
                onClick={() => handleCloseOne(item.id)}
                aria-label="Tutup Pop-up"
                className="absolute top-2.5 right-2.5 z-30 w-7 h-7 bg-white/95 hover:bg-white text-stone-800 border border-stone-400 flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>

              {hasUrl ? (
                <a
                  href={normalizedHref}
                  onClick={handleImageClick}
                  className="block cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt="Pengumuman Masjid"
                    className="block w-auto h-auto max-w-[92vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] object-contain select-none"
                  />
                </a>
              ) : (
                <div className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt="Pengumuman Masjid"
                    className="block w-auto h-auto max-w-[92vw] sm:max-w-xl md:max-w-2xl max-h-[85vh] object-contain select-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
