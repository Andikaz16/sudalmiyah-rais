import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, saveDb, logSecurityEvent } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { ManualNewsItem } from "@/lib/types";

const newsItemSchema = z.object({
  title: z.string().min(5, "Judul berita minimal 5 karakter").max(250),
  excerpt: z.string().min(10, "Ringkasan berita minimal 10 karakter").max(500),
  content: z.union([z.array(z.string()), z.string()]),
  imageUrl: z.string().min(1, "Foto atau gambar utama wajib disertakan"),
  publishedAt: z.string().optional(),
  badge: z.string().default("WARTA MASJID"),
  badgeClass: z.string().default("bg-[#003B73] text-white"),
  sourceDomain: z.string().default("masjid.ums.ac.id"),
  sourceUrl: z.string().default("#"),
  author: z.string().default("Takmir Masjid Sudalmiyah Rais"),
  isPublished: z.boolean().default(true),
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
    news: db.manualNews || [],
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
    const parsed = newsItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data berita tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.manualNews)) {
      db.manualNews = [];
    }

    // Ubah string content dipisah newline jika dikirim sebagai string tunggal
    let contentParagraphs: string[] = [];
    if (Array.isArray(parsed.data.content)) {
      contentParagraphs = parsed.data.content
        .map((p) => sanitizeString(p))
        .filter((p) => p.trim().length > 0);
    } else {
      contentParagraphs = parsed.data.content
        .split("\n\n")
        .map((p) => sanitizeString(p.trim()))
        .filter((p) => p.length > 0);
    }

    const newItem: ManualNewsItem = {
      id: `news-manual-${Date.now()}`,
      title: sanitizeString(parsed.data.title),
      excerpt: sanitizeString(parsed.data.excerpt),
      content: contentParagraphs.length > 0 ? contentParagraphs : [sanitizeString(parsed.data.excerpt)],
      imageUrl: parsed.data.imageUrl.trim(),
      publishedAt: parsed.data.publishedAt || new Date().toISOString(),
      badge: sanitizeString(parsed.data.badge || "WARTA MASJID"),
      badgeClass: parsed.data.badgeClass || "bg-[#003B73] text-white",
      sourceDomain: sanitizeString(parsed.data.sourceDomain || "masjid.ums.ac.id"),
      sourceUrl: parsed.data.sourceUrl || "#",
      author: sanitizeString(parsed.data.author || "Takmir Masjid Sudalmiyah Rais"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: parsed.data.isPublished,
    };

    db.manualNews.unshift(newItem);
    await saveDb(db);

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "MANUAL_NEWS_CREATED",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Berita manual baru ditambahkan: "${newItem.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Berita manual berhasil ditambahkan dan dipublikasikan.",
      newsItem: newItem,
    });
  } catch (err) {
    console.error("Manual news creation error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses penambahan berita." },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "ID berita tidak ditemukan." }, { status: 400 });
    }

    const parsed = newsItemSchema.partial().safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Format pembaruan tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.manualNews)) {
      return NextResponse.json({ error: "Data berita tidak ditemukan." }, { status: 404 });
    }

    const index = db.manualNews.findIndex((n) => n.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Berita dengan ID tersebut tidak ditemukan." }, { status: 404 });
    }

    const current = db.manualNews[index];
    let contentParagraphs = current.content;
    if (parsed.data.content) {
      if (Array.isArray(parsed.data.content)) {
        contentParagraphs = parsed.data.content
          .map((p) => sanitizeString(p))
          .filter((p) => p.trim().length > 0);
      } else {
        contentParagraphs = parsed.data.content
          .split("\n\n")
          .map((p) => sanitizeString(p.trim()))
          .filter((p) => p.length > 0);
      }
    }

    const updatedItem: ManualNewsItem = {
      ...current,
      title: parsed.data.title ? sanitizeString(parsed.data.title) : current.title,
      excerpt: parsed.data.excerpt ? sanitizeString(parsed.data.excerpt) : current.excerpt,
      content: contentParagraphs,
      imageUrl: parsed.data.imageUrl ? parsed.data.imageUrl.trim() : current.imageUrl,
      publishedAt: parsed.data.publishedAt || current.publishedAt,
      badge: parsed.data.badge ? sanitizeString(parsed.data.badge) : current.badge,
      badgeClass: parsed.data.badgeClass || current.badgeClass,
      sourceDomain: parsed.data.sourceDomain ? sanitizeString(parsed.data.sourceDomain) : current.sourceDomain,
      sourceUrl: parsed.data.sourceUrl !== undefined ? parsed.data.sourceUrl : current.sourceUrl,
      author: parsed.data.author ? sanitizeString(parsed.data.author) : current.author,
      isPublished: parsed.data.isPublished !== undefined ? parsed.data.isPublished : current.isPublished,
      updatedAt: new Date().toISOString(),
    };

    db.manualNews[index] = updatedItem;
    await saveDb(db);

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "MANUAL_NEWS_UPDATED",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Berita manual diperbarui: "${updatedItem.title}"`
    );

    return NextResponse.json({
      success: true,
      message: "Berita manual berhasil diperbarui.",
      newsItem: updatedItem,
    });
  } catch (err) {
    console.error("Manual news update error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memperbarui berita." },
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

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID berita wajib disertakan." }, { status: 400 });
  }

  const db = await getDbAsync();
  if (!Array.isArray(db.manualNews)) {
    return NextResponse.json({ error: "Data berita kosong." }, { status: 404 });
  }

  const target = db.manualNews.find((n) => n.id === id);
  if (!target) {
    return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
  }

  db.manualNews = db.manualNews.filter((n) => n.id !== id);
  await saveDb(db);

  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  logSecurityEvent(
    "MANUAL_NEWS_DELETED",
    session.email || session.name,
    clientIp,
    "WARNING",
    `Berita manual dihapus: "${target.title}" (ID: ${id})`
  );

  return NextResponse.json({
    success: true,
    message: "Berita manual berhasil dihapus.",
  });
}
