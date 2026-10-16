import { NextRequest, NextResponse, connection } from "next/server";
import path from "path";
import fs from "fs";
import { getDb, saveDb, logSecurityEvent } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";
import { PopupBanner } from "@/lib/types";
import {
  isBlobConfigured,
  uploadImageToBlob,
  savePopupsToBlob,
  readPopupsFromBlob,
  deleteBlobByUrl,
} from "@/lib/blobStorage";

function getPopupsList(db: ReturnType<typeof getDb>): PopupBanner[] {
  if (Array.isArray(db.popupBanners) && db.popupBanners.length > 0) {
    return db.popupBanners;
  }
  if (db.popupBanner) {
    return [db.popupBanner];
  }
  return [];
}

export async function GET(request: NextRequest) {
  await connection();

  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  let popups: PopupBanner[] = [];
  if (isBlobConfigured()) {
    try {
      const blobList = await readPopupsFromBlob();
      if (Array.isArray(blobList) && blobList.length > 0) {
        popups = blobList;
      }
    } catch (err) {
      console.warn("Notice: Vercel Blob read error in admin GET:", err);
    }
  }

  if (popups.length === 0) {
    const db = getDb();
    popups = getPopupsList(db);
  }

  return NextResponse.json(
    {
      popup: popups[0] || null,
      popups,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (Array.isArray(body.popups)) {
        const db = getDb();
        db.popupBanners = body.popups;
        db.popupBanner = body.popups[0] || null;
        saveDb(db);
        if (isBlobConfigured()) {
          savePopupsToBlob(body.popups).catch(() => {});
        }
        return NextResponse.json({
          success: true,
          message: "Pop-up banner berhasil disinkronkan.",
          popup: db.popupBanner,
          popups: db.popupBanners,
        });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawTargetUrl = formData.get("targetUrl");
    const rawReplaceId = formData.get("replaceId");
    const manualTargetUrl = typeof rawTargetUrl === "string" ? rawTargetUrl.trim() : "";
    const replaceId = typeof rawReplaceId === "string" ? rawReplaceId.trim() : "";

    if (!file) {
      return NextResponse.json({ error: "Berkas gambar pop-up tidak ditemukan." }, { status: 400 });
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap gunakan format gambar JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas pop-up terlalu besar. Maksimal 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optional archival write to /public/uploads/popup/ when local disk is writable
    try {
      if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "popup");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = path.extname(file.name).toLowerCase() || ".jpg";
        const safeFilename = `popup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
        const destinationPath = path.join(uploadDir, safeFilename);
        fs.writeFileSync(destinationPath, buffer);
      }
    } catch {
      // Ignore archival write error on read-only environments
    }

    let finalImageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    if (isBlobConfigured()) {
      try {
        const ext = path.extname(file.name).toLowerCase() || ".jpg";
        const safeFilename = `popup_${Date.now()}${ext}`;
        finalImageUrl = await uploadImageToBlob(safeFilename, buffer, file.type);
      } catch (blobErr) {
        console.warn("Notice: Vercel Blob upload failed, fallback to Data URI:", blobErr);
      }
    }

    const db = getDb();
    let existingList: PopupBanner[] = [];
    if (isBlobConfigured()) {
      try {
        const blobList = await readPopupsFromBlob();
        if (Array.isArray(blobList) && blobList.length > 0) {
          existingList = blobList;
        }
      } catch {}
    }
    if (existingList.length === 0) {
      existingList = getPopupsList(db);
    }

    const popupRecord: PopupBanner = {
      id: replaceId || `popup-${Date.now().toString(36)}`,
      imageUrl: finalImageUrl,
      title: "",
      targetUrl: manualTargetUrl,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    let updatedList: PopupBanner[];
    if (replaceId && existingList.some((p) => p.id === replaceId)) {
      updatedList = existingList.map((p) =>
        p.id === replaceId
          ? {
              ...p,
              imageUrl: finalImageUrl,
              targetUrl: manualTargetUrl !== "" ? manualTargetUrl : p.targetUrl,
              updatedAt: popupRecord.updatedAt,
            }
          : p
      );
    } else {
      updatedList = [popupRecord, ...existingList];
    }

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    saveDb(db);

    if (isBlobConfigured()) {
      savePopupsToBlob(updatedList).catch((err) =>
        console.warn("Notice: Vercel Blob sync error:", err)
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "POPUP_BANNER_UPDATE",
      session.email,
      ip,
      "SUCCESS",
      `Pop-up banner baru diunggah${manualTargetUrl ? ` dengan tautan [${manualTargetUrl}]` : " (tanpa tautan URL)"}`
    );

    return NextResponse.json({
      success: true,
      message: "Pop-up banner berhasil diunggah.",
      popup: db.popupBanner,
      popups: updatedList,
    });
  } catch (error: any) {
    console.error("Admin Popup Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses pop-up banner." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const db = getDb();
    let list: PopupBanner[] = [];
    if (isBlobConfigured()) {
      try {
        const blobList = await readPopupsFromBlob();
        if (Array.isArray(blobList) && blobList.length > 0) {
          list = blobList;
        }
      } catch {}
    }
    if (list.length === 0) {
      list = getPopupsList(db);
    }

    if (list.length === 0) {
      return NextResponse.json({ error: "Belum ada pop-up banner yang tersimpan." }, { status: 404 });
    }

    const targetId = typeof body.id === "string" && body.id.trim() ? body.id.trim() : list[0].id;
    const nowIso = new Date().toISOString();

    const updatedList = list.map((item) => {
      if (item.id !== targetId) return item;
      return {
        ...item,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : item.isActive,
        targetUrl:
          body.targetUrl !== undefined && typeof body.targetUrl === "string"
            ? body.targetUrl.trim()
            : item.targetUrl,
        title:
          body.title !== undefined && typeof body.title === "string"
            ? body.title.trim()
            : item.title,
        updatedAt: nowIso,
      };
    });

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    saveDb(db);

    if (isBlobConfigured()) {
      savePopupsToBlob(updatedList).catch(() => {});
    }

    const updatedItem = updatedList.find((p) => p.id === targetId) || updatedList[0];

    return NextResponse.json({
      success: true,
      message: "Pengaturan pop-up banner berhasil diperbarui.",
      popup: updatedItem,
      popups: updatedList,
    });
  } catch (error: any) {
    console.error("Admin Popup Patch Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memperbarui pop-up banner." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const db = getDb();
    const idParam = request.nextUrl.searchParams.get("id")?.trim();
    let list: PopupBanner[] = [];
    if (isBlobConfigured()) {
      try {
        const blobList = await readPopupsFromBlob();
        if (Array.isArray(blobList) && blobList.length > 0) {
          list = blobList;
        }
      } catch {}
    }
    if (list.length === 0) {
      list = getPopupsList(db);
    }

    const removedItem = idParam ? list.find((p) => p.id === idParam) : null;
    const updatedList = idParam ? list.filter((p) => p.id !== idParam) : [];

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    saveDb(db);

    if (isBlobConfigured()) {
      savePopupsToBlob(updatedList).catch(() => {});
      if (removedItem?.imageUrl && removedItem.imageUrl.includes("blob.vercel-storage.com")) {
        deleteBlobByUrl(removedItem.imageUrl).catch(() => {});
      }
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "POPUP_BANNER_DELETE",
      session.email,
      ip,
      "SUCCESS",
      "Pop-up banner dihapus oleh admin takmir."
    );

    return NextResponse.json({
      success: true,
      message: "Pop-up banner berhasil dihapus.",
      popup: db.popupBanner,
      popups: updatedList,
    });
  } catch (error: any) {
    console.error("Admin Popup Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat menghapus pop-up banner." },
      { status: 500 }
    );
  }
}
