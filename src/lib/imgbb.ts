/**
 * ImgBB Image Hosting Integration
 * Uploads images to ImgBB and returns permanent CDN text URLs.
 * Keeps Firebase Firestore database 100% lightweight and fast.
 */

const DEFAULT_IMGBB_KEY = "bc025fb5e5e5c0c7a94b4155f603edce";

export function getImgbbApiKey(): string {
  return (
    process.env.IMGBB_API_KEY ||
    process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
    DEFAULT_IMGBB_KEY
  ).trim();
}

export function isImgbbConfigured(): boolean {
  return Boolean(getImgbbApiKey().length > 0);
}

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
  thumbUrl?: string;
}

/**
 * Uploads an image binary buffer to ImgBB API.
 * Returns the direct permanent CDN URL (e.g. https://i.ibb.co/...).
 */
export async function uploadImageToImgBB(
  buffer: Buffer | ArrayBuffer,
  filename: string = "image.jpg",
  contentType: string = "image/jpeg"
): Promise<string> {
  const apiKey = getImgbbApiKey();
  if (!apiKey) {
    throw new Error("ImgBB API key is not configured.");
  }

  const uint8 = buffer instanceof Buffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
  const blob = new Blob([uint8], { type: contentType });

  const formData = new FormData();
  formData.append("image", blob, filename);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok || !json.success || !json.data) {
      const errMsg = json?.error?.message || `ImgBB upload failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    // Direct permanent image URL
    const directUrl = json.data.url || json.data.display_url;
    if (!directUrl) {
      throw new Error("ImgBB did not return a valid image URL.");
    }

    return directUrl;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("ImgBB upload error:", err.message || err);
    throw err;
  }
}
