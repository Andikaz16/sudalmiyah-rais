import { NextRequest, NextResponse, connection } from "next/server";
import path from "path";
import fs from "fs";
import { getDb, saveDb, logSecurityEvent } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";
import { PopupBanner } from "@/lib/types";

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

  const db = getDb();
  return NextResponse.json(
    { popup: db.popupBanner || null },
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawTargetUrl = formData.get("targetUrl");
    const rawTitle = formData.get("title");
    const manualTargetUrl = typeof rawTargetUrl === "string" ? rawTargetUrl.trim() : "";
    const manualTitle = typeof rawTitle === "string" ? rawTitle.trim() : "";

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

    // Store as Data URI so it renders reliably across dev, production start, and serverless
    const dataUriUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const db = getDb();
    const popupRecord: PopupBanner = {
      id: `popup-${Date.now().toString(36)}`,
      imageUrl: dataUriUrl,
      title: manualTitle,
      targetUrl: manualTargetUrl,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    db.popupBanner = popupRecord;
    saveDb(db);

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
      popup: popupRecord,
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

    if (!db.popupBanner) {
      return NextResponse.json({ error: "Belum ada pop-up banner yang tersimpan." }, { status: 404 });
    }

    if (body.isActive !== undefined) {
      db.popupBanner.isActive = Boolean(body.isActive);
    }
    if (body.targetUrl !== undefined && typeof body.targetUrl === "string") {
      db.popupBanner.targetUrl = body.targetUrl.trim();
    }
    if (body.title !== undefined && typeof body.title === "string") {
      db.popupBanner.title = body.title.trim();
    }
    db.popupBanner.updatedAt = new Date().toISOString();

    saveDb(db);

    return NextResponse.json({
      success: true,
      message: "Pengaturan pop-up banner berhasil diperbarui.",
      popup: db.popupBanner,
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
    db.popupBanner = null;
    saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "POPUP_BANNER_DELETE",
      session.email,
      ip,
      "SUCCESS",
      "Pop-up banner dinonaktifkan dan dihapus oleh admin takmir."
    );

    return NextResponse.json({
      success: true,
      message: "Pop-up banner berhasil dihapus. Tidak ada pop-up yang akan tampil bagi pengguna.",
    });
  } catch (error: any) {
    console.error("Admin Popup Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat menghapus pop-up banner." },
      { status: 500 }
    );
  }
}
