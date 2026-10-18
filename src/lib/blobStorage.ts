import { put, list, del } from "@vercel/blob";
import { PopupBanner, Agenda, ManualNewsItem } from "./types";

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

/**
 * Persists the entire agendas array to Vercel Blob CDN.
 * Ensures data modified via admin persists across all Vercel serverless lambda containers.
 */
export async function saveAgendasToBlob(agendas: Agenda[]): Promise<string | null> {
  if (!isBlobConfigured()) return null;

  try {
    const jsonString = JSON.stringify(agendas, null, 2);
    const blob = await put("database/agendas.json", jsonString, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
      contentType: "application/json",
    });
    return blob.url;
  } catch (err) {
    console.warn("Notice: Could not write agendas to Vercel Blob:", err);
    return null;
  }
}

/**
 * Purges fabricated dummy documentation data if present in legacy storage.
 */
export function cleanDummyAgendaData(agendas: Agenda[]): Agenda[] {
  return agendas.map((agenda) => {
    if (
      agenda.id === "agn-cinsub-02" &&
      (agenda.actualAttendees === 1080 ||
        agenda.summaryNote?.includes("dihadiri oleh 1080 mahasiswa") ||
        (Array.isArray(agenda.documentationPhotos) &&
          agenda.documentationPhotos.includes("/uploads/agendas/agenda-subuh.jpg") &&
          agenda.documentationPhotos.includes("/uploads/agendas/agenda-tabligh.jpg")))
    ) {
      const {
        isCompleted,
        completedAt,
        actualAttendees,
        documentationPhotos,
        summaryNote,
        ...rest
      } = agenda;
      return rest;
    }
    return agenda;
  });
}

/**
 * Reads agendas from Vercel Blob if available.
 */
export async function readAgendasFromBlob(): Promise<Agenda[] | null> {
  if (!isBlobConfigured()) return null;

  try {
    const result = await list({ prefix: "database/agendas.json", limit: 1 });
    const targetBlob = result.blobs.find((b) => b.pathname === "database/agendas.json");
    if (!targetBlob) return null;

    const res = await fetch(`${targetBlob.url}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      const cleaned = cleanDummyAgendaData(data);
      const hadDummy = data.some(
        (a) =>
          a.id === "agn-cinsub-02" &&
          (a.actualAttendees === 1080 || a.summaryNote?.includes("dihadiri oleh 1080 mahasiswa"))
      );
      if (hadDummy) {
        saveAgendasToBlob(cleaned).catch(() => {});
      }
      return cleaned;
    }
    return null;
  } catch (err) {
    console.warn("Notice: Could not read agendas from Vercel Blob:", err);
    return null;
  }
}

/**
 * Persists manual news array to Vercel Blob CDN.
 */
export async function saveManualNewsToBlob(news: ManualNewsItem[]): Promise<string | null> {
  if (!isBlobConfigured()) return null;

  try {
    const jsonString = JSON.stringify(news, null, 2);
    const blob = await put("database/manual_news.json", jsonString, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
      contentType: "application/json",
    });
    return blob.url;
  } catch (err) {
    console.warn("Notice: Could not write manual news to Vercel Blob:", err);
    return null;
  }
}

/**
 * Reads manual news from Vercel Blob if available.
 */
export async function readManualNewsFromBlob(): Promise<ManualNewsItem[] | null> {
  if (!isBlobConfigured()) return null;

  try {
    const result = await list({ prefix: "database/manual_news.json", limit: 1 });
    const targetBlob = result.blobs.find((b) => b.pathname === "database/manual_news.json");
    if (!targetBlob) return null;

    const res = await fetch(`${targetBlob.url}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn("Notice: Could not read manual news from Vercel Blob:", err);
    return null;
  }
}
