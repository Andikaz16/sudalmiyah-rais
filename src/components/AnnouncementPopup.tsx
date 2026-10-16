"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PopupBanner } from "@/lib/types";

export const POPUP_CACHE_KEY = "sudalmiyah_popup_cache";

// Module-level in-memory session flags:
// Persists during client-side SPA navigation between pages (e.g. Beranda -> Ruang Ibadah -> Beranda),
// but automatically resets when the browser page is reloaded / refreshed (F5 / browser refresh).
let sessionDismissed = false;
let sessionActivePopups: PopupBanner[] | null = null;

export default function AnnouncementPopup() {
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
          const list = parsed.popups.filter((p: PopupBanner) => p && p.isActive);
          sessionActivePopups = list;
          return list;
        }
        if (parsed.popup && parsed.popup.isActive) {
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

  const router = useRouter();

  const handleCloseOne = useCallback((id: string) => {
    setPopups((prev) => {
      const next = prev.filter((item) => item.id !== id);
      sessionActivePopups = next;
      if (next.length === 0) {
        sessionDismissed = true;
      }
      return next;
    });
  }, []);

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
            serverList = data.popups.filter((p: PopupBanner) => p.isActive);
          } else if (data.popup && data.popup.isActive) {
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
                // Keep local cache
                if (!sessionDismissed) {
                  const kept = parsed.popups.filter((p: PopupBanner) => p && p.isActive);
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

  // Listen to Escape key to close the front popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && popups.length > 0) {
        handleCloseOne(popups[0].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [popups, handleCloseOne]);

  if (popups.length === 0) return null;

  const current = popups[0];
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
    handleCloseOne(current.id);
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
      onClick={() => handleCloseOne(current.id)}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-start pt-24 sm:pt-28 pb-8 px-4 bg-black/75 backdrop-blur-[2px] overflow-y-auto animate-fade-in"
    >
      <div className="relative flex items-center justify-center w-full max-w-2xl my-auto">
        <div
          key={current.id}
          onClick={(e) => e.stopPropagation()}
          className="relative inline-block rounded-2xl overflow-hidden shadow-2xl bg-white border-2 border-stone-200/90 animate-fade-in"
        >
          {/* Close Button [X] clearly positioned and never covered by navbar */}
          <button
            type="button"
            onClick={() => handleCloseOne(current.id)}
            aria-label="Tutup Pop-up"
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-stone-900 border-2 border-stone-800 shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {hasUrl ? (
            <a
              href={normalizedHref}
              onClick={handleImageClick}
              className="block cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageUrl}
                alt="Pengumuman Masjid"
                className="block w-auto h-auto max-w-[90vw] sm:max-w-lg md:max-w-xl max-h-[72vh] sm:max-h-[75vh] object-contain select-none"
              />
            </a>
          ) : (
            <div className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageUrl}
                alt="Pengumuman Masjid"
                className="block w-auto h-auto max-w-[90vw] sm:max-w-lg md:max-w-xl max-h-[72vh] sm:max-h-[75vh] object-contain select-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
