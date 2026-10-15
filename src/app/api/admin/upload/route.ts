import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { verifySessionToken } from "@/lib/security";
import { logSecurityEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Verify session
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
    const rawFolder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "Berkas gambar tidak ditemukan." }, { status: 400 });
    }

    // Sanitize folder
    const allowedFolders = ["khatib", "agendas", "qris", "general", "documents"];
    const folder = allowedFolders.includes(rawFolder) ? rawFolder : "general";

    // Validate MIME type
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "application/pdf",
    ];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap gunakan format JPG, PNG, WEBP, atau PDF." },
        { status: 400 }
      );
    }

    // Validate size (max 25MB for PDF, 5MB for images)
    const MAX_SIZE = file.type === "application/pdf" ? 25 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `Ukuran berkas terlalu besar. Maksimal ukuran adalah ${
            file.type === "application/pdf" ? "25MB" : "5MB"
          }.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Build safe filename
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const rawName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const safeFilename = `${rawName}_${uniqueSuffix}${ext}`;
    const destinationPath = path.join(uploadDir, safeFilename);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/uploads/${folder}/${safeFilename}`;

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPLOAD_MEDIA",
      session.email,
      ip,
      "SUCCESS",
      `Unggah berkas ${folder}/${safeFilename} (${(file.size / 1024).toFixed(1)} KB)`
    );

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses unggahan." },
      { status: 500 }
    );
  }
}
