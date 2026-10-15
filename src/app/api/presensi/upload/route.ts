import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { checkRateLimit } from "@/lib/security";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting: 15 uploads per minute per IP
  const rateLimit = checkRateLimit(`presensi-upload-${ip}`, 15, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan unggah foto. Silakan tunggu beberapa saat." },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Berkas foto kehadiran tidak ditemukan." },
        { status: 400 }
      );
    }

    // Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format berkas tidak didukung. Harap gunakan format gambar JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas foto terlalu besar. Maksimal ukuran adalah 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "presensi");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const safeFilename = `presensi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destinationPath = path.join(uploadDir, safeFilename);

      fs.writeFileSync(destinationPath, buffer);

      const publicUrl = `/uploads/presensi/${safeFilename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: safeFilename,
        size: file.size,
      });
    } catch (fsError) {
      // Fallback to data URI if local filesystem write is not permitted
      console.warn("Filesystem write fallback to data URI:", fsError);
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUri,
        filename: file.name,
        size: file.size,
      });
    }
  } catch (error: any) {
    console.error("Presensi Photo Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat memproses unggahan foto kehadiran." },
      { status: 500 }
    );
  }
}
