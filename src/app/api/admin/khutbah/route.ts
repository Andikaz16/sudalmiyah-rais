import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, saveDb, logSecurityEvent } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { KhutbahItem } from "@/lib/types";
import { invalidateKhutbahCache } from "@/app/api/khutbah/route";

const khutbahItemSchema = z.object({
  title: z.string().min(5, "Judul khutbah minimal 5 karakter").max(300),
  theme: z.string().max(100).optional(),
  author: z.string().min(3, "Nama khatib / penulis minimal 3 karakter").max(200),
  date: z.string().min(3, "Tanggal khutbah wajib diisi").max(100),
  summary: z.string().min(10, "Ringkasan khutbah minimal 10 karakter").max(1000),
  firstKhutbah: z.string().min(20, "Naskah khutbah pertama minimal 20 karakter"),
  secondKhutbah: z.string().min(20, "Naskah khutbah kedua minimal 20 karakter"),
  fullContent: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  sourceUrl: z.string().optional(),
  isPublished: z.boolean().default(true),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

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
    khutbahs: db.khutbahList || [],
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
    const parsed = khutbahItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data khutbah tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.khutbahList)) {
      db.khutbahList = [];
    }

    const baseSlug = generateSlug(parsed.data.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const newItem: KhutbahItem = {
      id: `khutbah-takmir-${Date.now()}`,
      title: sanitizeString(parsed.data.title),
      slug: uniqueSlug,
      theme: parsed.data.theme ? sanitizeString(parsed.data.theme) : "Khutbah Jumat",
      source: "TAKMIR_MASJID",
      author: sanitizeString(parsed.data.author),
      date: sanitizeString(parsed.data.date),
      summary: sanitizeString(parsed.data.summary),
      firstKhutbah: parsed.data.firstKhutbah.trim(),
      secondKhutbah: parsed.data.secondKhutbah.trim(),
      fullContent: parsed.data.fullContent?.trim(),
      fileUrl: parsed.data.fileUrl?.trim(),
      fileName: parsed.data.fileName ? sanitizeString(parsed.data.fileName) : undefined,
      sourceUrl: parsed.data.sourceUrl?.trim(),
      isPublished: parsed.data.isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.khutbahList.unshift(newItem);
    await saveDb(db);
    invalidateKhutbahCache();

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "KHUTBAH_CREATED",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Naskah khutbah baru ditambahkan: "${newItem.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Naskah khutbah berhasil ditambahkan.",
      item: newItem,
    });
  } catch (error) {
    console.error("POST /api/admin/khutbah error:", error);
    return NextResponse.json({ error: "Gagal menyimpan naskah khutbah." }, { status: 500 });
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
    const { id, ...data } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID khutbah tidak valid." }, { status: 400 });
    }

    const parsed = khutbahItemSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data khutbah tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.khutbahList)) {
      db.khutbahList = [];
    }

    const index = db.khutbahList.findIndex((k) => k.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Naskah khutbah tidak ditemukan." }, { status: 404 });
    }

    const existing = db.khutbahList[index];
    db.khutbahList[index] = {
      ...existing,
      title: sanitizeString(parsed.data.title),
      theme: parsed.data.theme ? sanitizeString(parsed.data.theme) : existing.theme,
      author: sanitizeString(parsed.data.author),
      date: sanitizeString(parsed.data.date),
      summary: sanitizeString(parsed.data.summary),
      firstKhutbah: parsed.data.firstKhutbah.trim(),
      secondKhutbah: parsed.data.secondKhutbah.trim(),
      fullContent: parsed.data.fullContent?.trim() || existing.fullContent,
      fileUrl: parsed.data.fileUrl?.trim() || existing.fileUrl,
      fileName: parsed.data.fileName ? sanitizeString(parsed.data.fileName) : existing.fileName,
      sourceUrl: parsed.data.sourceUrl?.trim() || existing.sourceUrl,
      isPublished: parsed.data.isPublished,
      updatedAt: new Date().toISOString(),
    };

    await saveDb(db);
    invalidateKhutbahCache();

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "KHUTBAH_UPDATED",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Naskah khutbah diperbarui: "${parsed.data.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Naskah khutbah berhasil diperbarui.",
      item: db.khutbahList[index],
    });
  } catch (error) {
    console.error("PUT /api/admin/khutbah error:", error);
    return NextResponse.json({ error: "Gagal memperbarui naskah khutbah." }, { status: 500 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID khutbah tidak valid." }, { status: 400 });
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.khutbahList)) {
      return NextResponse.json({ error: "Naskah khutbah tidak ditemukan." }, { status: 404 });
    }

    const index = db.khutbahList.findIndex((k) => k.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Naskah khutbah tidak ditemukan." }, { status: 404 });
    }

    const removed = db.khutbahList.splice(index, 1)[0];
    await saveDb(db);
    invalidateKhutbahCache();

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "KHUTBAH_DELETED",
      session.email || session.name,
      clientIp,
      "WARNING",
      `Naskah khutbah dihapus: "${removed.title}" (ID: ${id})`
    );

    return NextResponse.json({
      success: true,
      message: "Naskah khutbah berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/khutbah error:", error);
    return NextResponse.json({ error: "Gagal menghapus naskah khutbah." }, { status: 500 });
  }
}
