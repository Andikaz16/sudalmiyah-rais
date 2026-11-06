import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, saveDb, logSecurityEvent, getDefaultInfaqHadiths } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { InfaqHadith } from "@/lib/types";

const hadithSchema = z.object({
  theme: z.string().min(3, "Tema hadits minimal 3 karakter").max(120),
  themeEn: z.string().max(150).optional(),
  arabic: z.string().min(5, "Teks Arab minimal 5 karakter"),
  translation: z.string().min(10, "Terjemahan minimal 10 karakter"),
  translationEn: z.string().optional(),
  source: z.string().min(3, "Sumber / Perawi minimal 3 karakter").max(120),
  fadhilah: z.string().min(5, "Fadhilah / Keutamaan minimal 5 karakter").max(300),
  fadhilahEn: z.string().max(350).optional(),
  isActive: z.boolean().default(true),
  order: z.number().optional(),
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
  let hadiths = Array.isArray(db.infaqHadiths) && db.infaqHadiths.length > 0
    ? db.infaqHadiths
    : getDefaultInfaqHadiths();

  hadiths.sort((a, b) => (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0));

  return NextResponse.json({
    success: true,
    hadiths,
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
    const parsed = hadithSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data hadits tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.infaqHadiths) || db.infaqHadiths.length === 0) {
      db.infaqHadiths = getDefaultInfaqHadiths();
    }

    const maxId = db.infaqHadiths.reduce((max, h) => Math.max(max, h.id), 0);
    const newId = maxId + 1;
    const maxOrder = db.infaqHadiths.reduce((max, h) => Math.max(max, h.order ?? h.id), 0);

    const newHadith: InfaqHadith = {
      id: newId,
      theme: sanitizeString(parsed.data.theme),
      themeEn: parsed.data.themeEn ? sanitizeString(parsed.data.themeEn) : undefined,
      arabic: parsed.data.arabic.trim(),
      translation: sanitizeString(parsed.data.translation),
      translationEn: parsed.data.translationEn ? sanitizeString(parsed.data.translationEn) : undefined,
      source: sanitizeString(parsed.data.source),
      fadhilah: sanitizeString(parsed.data.fadhilah),
      fadhilahEn: parsed.data.fadhilahEn ? sanitizeString(parsed.data.fadhilahEn) : undefined,
      isActive: parsed.data.isActive ?? true,
      order: parsed.data.order ?? maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.infaqHadiths.push(newHadith);
    await saveDb(db);

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "MUTIARA_HADITH_CREATE",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Menambahkan mutiara hadits baru: ${newHadith.theme} (${newHadith.source})`
    );

    return NextResponse.json({
      success: true,
      hadith: newHadith,
      message: "Mutiara hadits berhasil ditambahkan.",
    });
  } catch (error) {
    console.error("POST /api/admin/infaq-hadiths error:", error);
    return NextResponse.json({ error: "Gagal menyimpan hadits." }, { status: 500 });
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
    const id = Number(body.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID hadits tidak valid." }, { status: 400 });
    }

    const parsed = hadithSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data hadits tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.infaqHadiths) || db.infaqHadiths.length === 0) {
      db.infaqHadiths = getDefaultInfaqHadiths();
    }

    const index = db.infaqHadiths.findIndex((h) => h.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Hadits tidak ditemukan." }, { status: 404 });
    }

    const existing = db.infaqHadiths[index];
    const updatedHadith: InfaqHadith = {
      ...existing,
      theme: sanitizeString(parsed.data.theme),
      themeEn: parsed.data.themeEn ? sanitizeString(parsed.data.themeEn) : undefined,
      arabic: parsed.data.arabic.trim(),
      translation: sanitizeString(parsed.data.translation),
      translationEn: parsed.data.translationEn ? sanitizeString(parsed.data.translationEn) : undefined,
      source: sanitizeString(parsed.data.source),
      fadhilah: sanitizeString(parsed.data.fadhilah),
      fadhilahEn: parsed.data.fadhilahEn ? sanitizeString(parsed.data.fadhilahEn) : undefined,
      isActive: parsed.data.isActive ?? existing.isActive,
      order: parsed.data.order ?? existing.order,
      updatedAt: new Date().toISOString(),
    };

    db.infaqHadiths[index] = updatedHadith;
    await saveDb(db);

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "MUTIARA_HADITH_UPDATE",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Memperbarui mutiara hadits #${id}: ${updatedHadith.theme}`
    );

    return NextResponse.json({
      success: true,
      hadith: updatedHadith,
      message: "Mutiara hadits berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PUT /api/admin/infaq-hadiths error:", error);
    return NextResponse.json({ error: "Gagal memperbarui hadits." }, { status: 500 });
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
    const isReset = searchParams.get("reset") === "true";
    const idParam = searchParams.get("id");

    const db = await getDbAsync();

    if (isReset) {
      db.infaqHadiths = getDefaultInfaqHadiths();
      await saveDb(db);

      const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
      logSecurityEvent(
        "MUTIARA_HADITH_RESET",
        session.email || session.name,
        clientIp,
        "SUCCESS",
        "Mereset daftar mutiara hadits ke 8 hadits default."
      );

      return NextResponse.json({
        success: true,
        message: "Daftar mutiara hadits berhasil direset ke standar.",
        hadiths: db.infaqHadiths,
      });
    }

    const id = Number(idParam);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID hadits tidak valid." }, { status: 400 });
    }

    if (!Array.isArray(db.infaqHadiths)) {
      db.infaqHadiths = getDefaultInfaqHadiths();
    }

    const deleted = db.infaqHadiths.find((h) => h.id === id);
    db.infaqHadiths = db.infaqHadiths.filter((h) => h.id !== id);
    await saveDb(db);

    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "MUTIARA_HADITH_DELETE",
      session.email || session.name,
      clientIp,
      "SUCCESS",
      `Menghapus mutiara hadits #${id}: ${deleted?.theme || "-"}`
    );

    return NextResponse.json({
      success: true,
      message: "Mutiara hadits berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/admin/infaq-hadiths error:", error);
    return NextResponse.json({ error: "Gagal menghapus hadits." }, { status: 500 });
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
    const id = Number(body.id);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID hadits tidak valid." }, { status: 400 });
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.infaqHadiths)) {
      db.infaqHadiths = getDefaultInfaqHadiths();
    }

    const index = db.infaqHadiths.findIndex((h) => h.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Hadits tidak ditemukan." }, { status: 404 });
    }

    if (body.isActive !== undefined) {
      db.infaqHadiths[index].isActive = Boolean(body.isActive);
    }
    if (body.order !== undefined) {
      db.infaqHadiths[index].order = Number(body.order);
    }
    db.infaqHadiths[index].updatedAt = new Date().toISOString();

    await saveDb(db);

    return NextResponse.json({
      success: true,
      hadith: db.infaqHadiths[index],
      message: "Status hadits berhasil diubah.",
    });
  } catch (error) {
    console.error("PATCH /api/admin/infaq-hadiths error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status." }, { status: 500 });
  }
}
