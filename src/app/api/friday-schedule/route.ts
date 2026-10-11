import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, logSecurityEvent, saveDb } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { FridayOfficerSchedule } from "@/lib/types";

const updateFridaySchema = z.object({
  date: z.string().min(3).max(100),
  hijriDate: z.string().min(3).max(100),
  khatibName: z.string().min(3).max(150),
  khatibTitle: z.string().min(3).max(200),
  khatibPhotoUrl: z.string().min(1),
  khutbahTheme: z.string().min(5).max(300),
  imamName: z.string().min(3).max(150),
  imamRole: z.string().min(3).max(150),
  muadzinName: z.string().min(3).max(150),
  muadzinRole: z.string().min(3).max(150),
  time: z.string().min(3).max(50),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    success: true,
    schedule: db.fridaySchedule,
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
    const parseResult = updateFridaySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data masukan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = getDb();

    const updatedSchedule: FridayOfficerSchedule = {
      id: db.fridaySchedule?.id || `fri-${Date.now()}`,
      date: sanitizeString(data.date),
      hijriDate: sanitizeString(data.hijriDate),
      khatibName: sanitizeString(data.khatibName),
      khatibTitle: sanitizeString(data.khatibTitle),
      khatibPhotoUrl: sanitizeString(data.khatibPhotoUrl),
      khutbahTheme: sanitizeString(data.khutbahTheme),
      imamName: sanitizeString(data.imamName),
      imamRole: sanitizeString(data.imamRole),
      muadzinName: sanitizeString(data.muadzinName),
      muadzinRole: sanitizeString(data.muadzinRole),
      time: sanitizeString(data.time),
      notes: data.notes ? sanitizeString(data.notes) : undefined,
      updatedAt: new Date().toISOString(),
    };

    db.fridaySchedule = updatedSchedule;
    saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_FRIDAY_SCHEDULE",
      session.email,
      ip,
      "SUCCESS",
      `Jadwal Shalat Jumat diperbarui: Khatib ${updatedSchedule.khatibName}`
    );

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
    });
  } catch (err: any) {
    console.error("Error updating friday schedule:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui jadwal jumat." },
      { status: 500 }
    );
  }
}
