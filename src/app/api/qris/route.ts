import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, logSecurityEvent, saveDb } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { QrisSettings } from "@/lib/types";

const updateQrisSchema = z.object({
  imageUrl: z.string().min(1, "URL gambar QRIS tidak boleh kosong."),
  merchantName: z.string().min(3).max(150),
  nmid: z.string().min(5).max(50),
  institution: z.string().min(2).max(150),
});

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    success: true,
    qris: db.qrisSettings,
  });
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
    const parseResult = updateQrisSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data masukan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = getDb();

    const updatedQris: QrisSettings = {
      id: db.qrisSettings?.id || `qris-${Date.now()}`,
      imageUrl: sanitizeString(data.imageUrl),
      merchantName: sanitizeString(data.merchantName),
      nmid: sanitizeString(data.nmid),
      institution: sanitizeString(data.institution),
      updatedAt: new Date().toISOString(),
    };

    db.qrisSettings = updatedQris;
    saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_QRIS_SETTINGS",
      session.email,
      ip,
      "SUCCESS",
      `Gambar & Pengaturan QRIS diperbarui: ${updatedQris.merchantName} (${updatedQris.nmid})`
    );

    return NextResponse.json({
      success: true,
      qris: updatedQris,
    });
  } catch (err: any) {
    console.error("Error updating QRIS settings:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui pengaturan QRIS." },
      { status: 500 }
    );
  }
}
