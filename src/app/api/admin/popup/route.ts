import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getDb, saveDb, logSecurityEvent } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";
import { PopupBanner } from "@/lib/types";

// Heuristic keyword classifier for masjid announcement banners
function classifyBannerFallback(filename: string, title?: string): { targetUrl: string; category: string; reasoning: string } {
  const combined = `${filename} ${title || ""}`.toLowerCase();

  if (/(infaq|sedekah|donasi|wakaf|qris|zakat|rekening|lazismu|pembangunan)/i.test(combined)) {
    return {
      targetUrl: "/donasi",
      category: "Infaq & Donasi Digital",
      reasoning: "Terdeteksi kata kunci terkait donasi, infaq, atau sedekah masjid.",
    };
  }

  if (/(jadwal|waktu|shalat|khatib|imam|muadzin|jumat)/i.test(combined)) {
    return {
      targetUrl: "/jadwal",
      category: "Jadwal Shalat & Petugas Jumat",
      reasoning: "Terdeteksi informasi seputar waktu shalat atau jadwal petugas Jumat.",
    };
  }

  if (/(tarjih|fatwa|hpt|fiqih|tanya|konsultasi|ibadah)/i.test(combined)) {
    return {
      targetUrl: "/ibadah",
      category: "Tanya Tarjih & Fiqih Ibadah",
      reasoning: "Terdeteksi topik fatwa Tarjih atau konsultasi fiqih Islam.",
    };
  }

  if (/(aula|peminjaman|gedung|ruang|sarpras|fasilitas)/i.test(combined)) {
    return {
      targetUrl: "/layanan",
      category: "Layanan Fasilitas & Peminjaman",
      reasoning: "Terdeteksi pengumuman peminjaman fasilitas atau aula masjid.",
    };
  }

  if (/(sejarah|profil|arsitektur|biografi|sudalmiyah)/i.test(combined)) {
    return {
      targetUrl: "/sejarah",
      category: "Sejarah & Profil Masjid",
      reasoning: "Terdeteksi konten profil sejarah Masjid Hj. Sudalmiyah Rais.",
    };
  }

  // Default to Agenda & Kajian
  return {
    targetUrl: "/agenda",
    category: "Agenda Kegiatan & Kajian",
    reasoning: "Diarahkan ke agenda kegiatan dan kajian Masjid Sudalmiyah Rais.",
  };
}

// Intelligent image reader using Gemini API
async function analyzeBannerWithAI(buffer: Buffer, mimeType: string, filename: string): Promise<{
  title: string;
  category: string;
  targetUrl: string;
  reasoning: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analisis gambar poster pengumuman masjid ini secara cermat.
Tugas Anda:
1. Ekstrak judul utama atau topik pengumuman kegiatan yang tertera pada poster.
2. Identifikasi kategori utama pengumuman.
3. Tentukan halaman tujuan internal (targetUrl) yang paling tepat saat pengunjung mengklik pop-up ini:
   - Pilih '/agenda' jika poster tentang kajian, tabligh akbar, cinta subuh, shalat jumat, pembinaan mahasiswa, seminar, workshop, atau kegiatan masjid.
   - Pilih '/donasi' jika poster tentang infaq, sedekah subuh, wakaf, zakat, penggalangan dana, atau QRIS masjid.
   - Pilih '/jadwal' jika poster tentang jadwal shalat lima waktu atau petugas khatib/imam.
   - Pilih '/ibadah' jika poster tentang tanya tarjih, fatwa fiqih, atau panduan ibadah.
   - Pilih '/layanan' jika poster tentang peminjaman aula gedung atau fasilitas masjid.
   - Pilih '/sejarah' jika poster tentang profil sejarah masjid Hj. Sudalmiyah Rais.
Berikan respon HANYA berupa JSON valid tanpa markdown formatting:
{
  "title": "Judul poster",
  "category": "Kategori kegiatan",
  "targetUrl": "/agenda",
  "reasoning": "Alasan singkat pemilihan halaman ini"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType,
            },
          },
          prompt,
        ],
      });

      const responseText = response.text || "";
      const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed.targetUrl && typeof parsed.targetUrl === "string") {
        return {
          title: parsed.title || filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          category: parsed.category || "Agenda Kegiatan",
          targetUrl: parsed.targetUrl.startsWith("/") ? parsed.targetUrl : `/${parsed.targetUrl}`,
          reasoning: parsed.reasoning || "Dianalisis secara cerdas oleh model Gemini Vision.",
        };
      }
    } catch (err) {
      console.warn("Gemini vision analysis fallback to heuristic:", err);
    }
  }

  // Heuristic Fallback
  const fallback = classifyBannerFallback(filename);
  const cleanTitle = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
  return {
    title: cleanTitle.length > 3 ? cleanTitle : "Pengumuman Masjid Sudalmiyah",
    category: fallback.category,
    targetUrl: fallback.targetUrl,
    reasoning: fallback.reasoning,
  };
}

export async function GET(request: NextRequest) {
  // Verify session
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const db = getDb();
  return NextResponse.json({ popup: db.popupBanner || null });
}

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
    const manualTargetUrl = (formData.get("targetUrl") as string | null)?.trim();
    const manualTitle = (formData.get("title") as string | null)?.trim();

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

    // Save image to /public/uploads/popup/
    let publicUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "popup");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name).toLowerCase() || ".jpg";
      const safeFilename = `popup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const destinationPath = path.join(uploadDir, safeFilename);

      fs.writeFileSync(destinationPath, buffer);
      publicUrl = `/uploads/popup/${safeFilename}`;
    } catch (fsErr) {
      // Fallback data URI
      console.warn("Filesystem write fallback to data URI:", fsErr);
      publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Perform intelligent analysis on the image
    const aiAnalysis = await analyzeBannerWithAI(buffer, file.type, file.name);

    const finalTargetUrl = manualTargetUrl || aiAnalysis.targetUrl || "/agenda";
    const finalTitle = manualTitle || aiAnalysis.title || "Pengumuman Masjid Sudalmiyah";

    const db = getDb();
    const popupRecord: PopupBanner = {
      id: `popup-${Date.now().toString(36)}`,
      imageUrl: publicUrl,
      title: finalTitle,
      targetUrl: finalTargetUrl,
      detectedCategory: aiAnalysis.category,
      aiReasoning: aiAnalysis.reasoning,
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
      `Pop-up banner diunggah: [${finalTitle}] diarahkan ke [${finalTargetUrl}] via Smart Analyzer`
    );

    return NextResponse.json({
      success: true,
      message: "Pop-up banner berhasil diunggah dan dianalisis.",
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
