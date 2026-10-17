import { put, list, del } from "@vercel/blob";
import { PopupBanner } from "./types";

/**
 * Checks if Vercel Blob storage is enabled via BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID (OIDC).
 */
export function isBlobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    process.env.VERCEL_BLOB_STORE_ID
  );
}

/**
 * Uploads an arbitrary file (image, pdf, document) to Vercel Blob CDN.
 * Returns the permanent public CDN URL (e.g. https://...public.blob.vercel-storage.com/<folder>/...).
 */
export async function uploadFileToBlob(
  filename: string,
  data: Buffer | Blob,
  contentType?: string,
  folder: string = "uploads"
): Promise<string> {
  if (!isBlobConfigured()) {
    throw new Error("Vercel Blob storage is not configured.");
  }

  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const blob = await put(`${folder}/${cleanFilename}`, data, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });

  return blob.url;
}

/**
 * Uploads an image file to Vercel Blob CDN specifically in the popups folder.
 * Returns the permanent public CDN URL.
 */
export async function uploadImageToBlob(
  filename: string,
  data: Buffer | Blob,
  contentType?: string
): Promise<string> {
  return uploadFileToBlob(filename, data, contentType, "popups");
}

/**
 * Persists the entire pop-up banners array to Vercel Blob CDN.
 * This guarantees permanent state persistence across all Vercel serverless containers.
 */
export async function savePopupsToBlob(popups: PopupBanner[]): Promise<string | null> {
  if (!isBlobConfigured()) return null;

  try {
    const jsonString = JSON.stringify(popups, null, 2);
    const blob = await put("database/popups.json", jsonString, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/json",
    });
    return blob.url;
  } catch (err) {
    console.warn("Notice: Could not write popups to Vercel Blob:", err);
    return null;
  }
}

/**
 * Reads pop-up banners from Vercel Blob if available.
 */
export async function readPopupsFromBlob(): Promise<PopupBanner[] | null> {
  if (!isBlobConfigured()) return null;

  try {
    const result = await list({ prefix: "database/popups.json", limit: 1 });
    const targetBlob = result.blobs.find((b) => b.pathname === "database/popups.json");
    if (!targetBlob) return null;

    const res = await fetch(`${targetBlob.url}?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn("Notice: Could not read popups from Vercel Blob:", err);
    return null;
  }
}

/**
 * Deletes a blob by its full URL if it belongs to Vercel Blob.
 */
export async function deleteBlobByUrl(url: string): Promise<void> {
  if (!isBlobConfigured() || !url.includes("blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (err) {
    console.warn("Notice: Could not delete blob:", err);
  }
}
