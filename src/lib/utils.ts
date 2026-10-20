import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes image URLs to ensure safe, unblocked display for Indonesian users.
 * If an external URL is known to be blocked by Indonesian ISPs (such as i.ibb.co),
 * it is automatically routed through our server-side image proxy.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Data URLs, local public paths, and first-party API routes are already 100% safe
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/images/") ||
    trimmed.startsWith("/api/media/") ||
    trimmed.startsWith("/api/image-proxy")
  ) {
    return trimmed;
  }

  // Known ISP-blocked external CDN domains in Indonesia (e.g. ImgBB)
  if (trimmed.includes("i.ibb.co") || trimmed.includes("ibb.co")) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}
