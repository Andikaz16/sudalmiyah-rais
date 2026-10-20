import { NextRequest, NextResponse, connection } from "next/server";
import path from "path";
import fs from "fs";
import { getDbAsync, saveDb, saveDbFields, logSecurityEvent, DatabaseSchema } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";
import { PopupBanner } from "@/lib/types";
import { uploadMediaToFirebase, deleteMediaFromFirebase, isFirebaseConfigured } from "@/lib/firebase";
import { isImgbbConfigured, uploadImageToImgBB } from "@/lib/imgbb";

function getPopupsList(db: DatabaseSchema): PopupBanner[] {
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

  const db = await getDbAsync();
  let popups = getPopupsList(db);

  // Ensure no legacy automatic /donasi persists in response
  popups = popups.map((p) => {
    if (p.targetUrl === "/donasi") {
      return { ...p, targetUrl: "" };
    }
    return p;
  });

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
        const db = await getDbAsync();
        db.popupBanners = body.popups;
        db.popupBanner = body.popups[0] || null;
        await saveDbFields(["popupBanners", "popupBanner"], {
          popupBanners: body.popups,
          popupBanner: body.popups[0] || null,
        });
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
    const rawExpiresAt = formData.get("expiresAt");
    const rawStartDate = formData.get("startDate");
    const rawDurationDays = formData.get("durationDays");
    const rawLinkedAgendaId = formData.get("linkedAgendaId");
    const rawLinkedAgendaTitle = formData.get("linkedAgendaTitle");

    const manualTargetUrl = typeof rawTargetUrl === "string" ? rawTargetUrl.trim() : "";
    const replaceId = typeof rawReplaceId === "string" ? rawReplaceId.trim() : "";
    const expiresAt = typeof rawExpiresAt === "string" && rawExpiresAt.trim() ? rawExpiresAt.trim() : null;
    const startDate = typeof rawStartDate === "string" && rawStartDate.trim() ? rawStartDate.trim() : new Date().toISOString();
    const durationDays = rawDurationDays ? Number(rawDurationDays) : null;
    const linkedAgendaId = typeof rawLinkedAgendaId === "string" && rawLinkedAgendaId.trim() ? rawLinkedAgendaId.trim() : undefined;
    const linkedAgendaTitle = typeof rawLinkedAgendaTitle === "string" && rawLinkedAgendaTitle.trim() ? rawLinkedAgendaTitle.trim() : undefined;

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

    let finalImageUrl = "";
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeFilename = `popup_${Date.now()}${ext}`;

    // 1. Priority 1: Firebase Cloud Firestore media store (100% accessible in Indonesia, first-party domain)
    if (isFirebaseConfigured()) {
      try {
        finalImageUrl = await uploadMediaToFirebase(safeFilename, buffer, file.type, "popup");
      } catch (fbErr) {
        console.warn("Notice: Firebase media upload failed for popup, falling back:", fbErr);
      }
    }

    // 2. Priority 2: ImgBB Cloud Hosting (proxied through first-party domain to bypass ISP blocks)
    if (!finalImageUrl && isImgbbConfigured()) {
      try {
        const rawImgbbUrl = await uploadImageToImgBB(buffer, safeFilename, file.type);
        if (rawImgbbUrl) {
          finalImageUrl = `/api/image-proxy?url=${encodeURIComponent(rawImgbbUrl)}`;
        }
      } catch (imgbbErr) {
        console.warn("Notice: ImgBB popup upload failed, falling back:", imgbbErr);
      }
    }

    // 3. Priority 3: Fallback to Data URI
    if (!finalImageUrl) {
      finalImageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const db = await getDbAsync();
    const existingList = getPopupsList(db);

    const popupRecord: PopupBanner = {
      id: replaceId || `popup-${Date.now().toString(36)}`,
      imageUrl: finalImageUrl,
      title: "",
      targetUrl: manualTargetUrl,
      isActive: true,
      updatedAt: new Date().toISOString(),
      startDate,
      expiresAt,
      durationDays,
      linkedAgendaId,
      linkedAgendaTitle,
    };

    let updatedList: PopupBanner[];
    if (replaceId && existingList.some((p) => p.id === replaceId)) {
      updatedList = existingList.map((p) =>
        p.id === replaceId
          ? {
              ...p,
              imageUrl: finalImageUrl,
              targetUrl: manualTargetUrl !== "" ? manualTargetUrl : p.targetUrl,
              expiresAt: expiresAt !== undefined ? expiresAt : p.expiresAt,
              startDate: startDate !== undefined ? startDate : p.startDate,
              durationDays: durationDays !== undefined ? durationDays : p.durationDays,
              linkedAgendaId: linkedAgendaId !== undefined ? linkedAgendaId : p.linkedAgendaId,
              linkedAgendaTitle: linkedAgendaTitle !== undefined ? linkedAgendaTitle : p.linkedAgendaTitle,
              updatedAt: popupRecord.updatedAt,
            }
          : p
      );
    } else {
      updatedList = [popupRecord, ...existingList];
    }

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    await saveDbFields(["popupBanners", "popupBanner"], {
      popupBanners: updatedList,
      popupBanner: updatedList[0] || null,
    });

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
    const db = await getDbAsync();
    let list = getPopupsList(db);

    if (list.length === 0 && !body.imageUrl) {
      return NextResponse.json({ error: "Belum ada pop-up banner yang tersimpan." }, { status: 404 });
    }

    const targetId = typeof body.id === "string" && body.id.trim() ? body.id.trim() : list[0]?.id;
    const nowIso = new Date().toISOString();

    const itemExists = list.some((p) => p.id === targetId);
    if (!itemExists) {
      if (body.imageUrl) {
        list = [
          {
            id: targetId,
            imageUrl: body.imageUrl,
            title: typeof body.title === "string" ? body.title.trim() : "",
            targetUrl: typeof body.targetUrl === "string" ? body.targetUrl.trim() : "",
            isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
            updatedAt: nowIso,
          },
          ...list,
        ];
      } else {
        return NextResponse.json(
          { error: "Pop-up yang dimaksud tidak ditemukan dalam sistem." },
          { status: 404 }
        );
      }
    }

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
        startDate: body.startDate !== undefined ? body.startDate : item.startDate,
        expiresAt: body.expiresAt !== undefined ? (body.expiresAt || null) : item.expiresAt,
        durationDays: body.durationDays !== undefined ? body.durationDays : item.durationDays,
        linkedAgendaId: body.linkedAgendaId !== undefined ? body.linkedAgendaId : item.linkedAgendaId,
        linkedAgendaTitle: body.linkedAgendaTitle !== undefined ? body.linkedAgendaTitle : item.linkedAgendaTitle,
        updatedAt: nowIso,
      };
    });

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    await saveDbFields(["popupBanners", "popupBanner"], {
      popupBanners: updatedList,
      popupBanner: updatedList[0] || null,
    });

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
    const db = await getDbAsync();
    const idParam = request.nextUrl.searchParams.get("id")?.trim();
    const list = getPopupsList(db);

    const removedItem = idParam ? list.find((p) => p.id === idParam) : null;
    const updatedList = idParam ? list.filter((p) => p.id !== idParam) : [];

    db.popupBanners = updatedList;
    db.popupBanner = updatedList[0] || null;
    await saveDbFields(["popupBanners", "popupBanner"], {
      popupBanners: updatedList,
      popupBanner: updatedList[0] || null,
    });

    if (removedItem?.imageUrl && removedItem.imageUrl.startsWith("/api/media/")) {
      deleteMediaFromFirebase(removedItem.imageUrl).catch(() => {});
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
