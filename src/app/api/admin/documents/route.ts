import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, saveDb, logSecurityEvent } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { DocumentCategory, DownloadDocument } from "@/lib/types";

const documentSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum([
    "TARJIH_FIQIH",
    "IDEOLOGI",
    "KEMUHAMMADIYAHAN",
    "DOKUMEN_MUKTAMAR",
    "PANDUAN_MASJID",
    "UMUM",
  ]),
  categoryLabel: z.string().max(100).optional(),
  description: z.string().min(5).max(1000),
  author: z.string().min(2).max(150),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.string().optional(),
  fileFormat: z.string().default("PDF"),
  publishedYear: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const db = await getDbAsync();
  return NextResponse.json({
    success: true,
    isLocked: db.documentsLocked ?? true,
    documents: db.documents || [],
  });
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
    const body = await request.json();
    const parsed = documentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data dokumen tidak valid.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = await getDbAsync();
    if (!db.documents) {
      db.documents = [];
    }

    const categoryLabels: Record<DocumentCategory, string> = {
      TARJIH_FIQIH: "Tarjih & Fiqih",
      IDEOLOGI: "Ideologi & Akhlak",
      KEMUHAMMADIYAHAN: "Kemuhammadiyahan",
      DOKUMEN_MUKTAMAR: "Dokumen Muktamar",
      PANDUAN_MASJID: "Panduan Takmir",
      UMUM: "Umum",
    };

    const newDoc: DownloadDocument = {
      id: `doc-${Date.now().toString(36)}`,
      title: sanitizeString(data.title),
      category: data.category as DocumentCategory,
      categoryLabel: data.categoryLabel
        ? sanitizeString(data.categoryLabel)
        : categoryLabels[data.category as DocumentCategory],
      description: sanitizeString(data.description),
      author: sanitizeString(data.author),
      fileUrl: sanitizeString(data.fileUrl),
      fileName: sanitizeString(data.fileName),
      fileSize: data.fileSize ? sanitizeString(data.fileSize) : "PDF",
      fileFormat: sanitizeString(data.fileFormat || "PDF"),
      downloadCount: 0,
      publishedYear: data.publishedYear ? sanitizeString(data.publishedYear) : undefined,
      createdAt: new Date().toISOString(),
    };

    db.documents.unshift(newDoc);
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "CREATE_DOCUMENT",
      session.email,
      ip,
      "SUCCESS",
      `Dokumen dibuat: ${newDoc.title}`
    );

    return NextResponse.json({ success: true, document: newDoc }, { status: 201 });
  } catch (err: any) {
    console.error("Create document error:", err);
    return NextResponse.json({ error: err.message || "Gagal menyimpan dokumen." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "ID dokumen diperlukan." }, { status: 400 });
    }

    const db = await getDbAsync();
    if (!db.documents) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    const index = db.documents.findIndex((d) => d.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    const target = db.documents[index];

    if (updateData.title) target.title = sanitizeString(updateData.title);
    if (updateData.category) target.category = updateData.category;
    if (updateData.categoryLabel) target.categoryLabel = sanitizeString(updateData.categoryLabel);
    if (updateData.description) target.description = sanitizeString(updateData.description);
    if (updateData.author) target.author = sanitizeString(updateData.author);
    if (updateData.fileUrl) target.fileUrl = sanitizeString(updateData.fileUrl);
    if (updateData.fileName) target.fileName = sanitizeString(updateData.fileName);
    if (updateData.fileSize) target.fileSize = sanitizeString(updateData.fileSize);
    if (updateData.fileFormat) target.fileFormat = sanitizeString(updateData.fileFormat);
    if (updateData.publishedYear) target.publishedYear = sanitizeString(updateData.publishedYear);
    target.updatedAt = new Date().toISOString();

    db.documents[index] = target;
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_DOCUMENT",
      session.email,
      ip,
      "SUCCESS",
      `Dokumen diperbarui: ${target.title}`
    );

    return NextResponse.json({ success: true, document: target });
  } catch (err: any) {
    console.error("Update document error:", err);
    return NextResponse.json({ error: err.message || "Gagal memperbarui dokumen." }, { status: 500 });
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID dokumen diperlukan." }, { status: 400 });
  }

  const db = await getDbAsync();
  if (!db.documents) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
  }

  const existing = db.documents.find((d) => d.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
  }

  db.documents = db.documents.filter((d) => d.id !== id);
  await saveDb(db);

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  logSecurityEvent(
    "DELETE_DOCUMENT",
    session.email,
    ip,
    "SUCCESS",
    `Dokumen dihapus: ${existing.title}`
  );

  return NextResponse.json({ success: true, message: "Dokumen berhasil dihapus." });
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
    const { isLocked } = body;

    const db = await getDbAsync();
    db.documentsLocked = Boolean(isLocked);
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "TOGGLE_DOCUMENTS_LOCK",
      session.email,
      ip,
      "SUCCESS",
      `Akses publik dokumen diubah menjadi: ${db.documentsLocked ? "TERKUNCI" : "TERBUKA"}`
    );

    return NextResponse.json({
      success: true,
      isLocked: db.documentsLocked,
      message: `Akses publik dokumen berhasil ${db.documentsLocked ? "dikunci" : "dibuka"}.`,
    });
  } catch (err: any) {
    console.error("Toggle documents lock error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengubah status akses dokumen." },
      { status: 500 }
    );
  }
}
