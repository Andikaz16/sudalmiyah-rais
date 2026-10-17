import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDb, getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { FridayOfficerSchedule } from "@/lib/types";

const updateFridaySchema = z.object({
  id: z.string().optional(),
  mosqueId: z.string().optional(),
  mosqueName: z.string().optional(),
  mosqueLocation: z.string().optional(),
  date: z.string().min(1).max(100),
  hijriDate: z.string().min(1).max(100),
  khatibName: z.string().min(1).max(150),
  khatibTitle: z.string().max(200).optional().or(z.literal("")),
  khatibPhotoUrl: z.string().optional().or(z.literal("")),
  khutbahTheme: z.string().max(300).optional().or(z.literal("")),
  imamName: z.string().max(150).optional().or(z.literal("")),
  imamRole: z.string().max(150).optional().or(z.literal("")),
  muadzinName: z.string().max(150).optional().or(z.literal("")),
  muadzinRole: z.string().max(150).optional().or(z.literal("")),
  time: z.string().min(1).max(50),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  await connection();
  const db = await getDbAsync();
  const { searchParams } = new URL(request.url);
  const mosqueId = searchParams.get("mosqueId");

  let schedules = db.fridaySchedules || [];
  let changed = false;

  if (db.fridaySchedule && db.fridaySchedule.hijriDate?.includes("Rabiul Akhir")) {
    db.fridaySchedule.hijriDate = db.fridaySchedule.hijriDate.replace(/Rabiul Akhir/gi, "Jumadilawal");
    changed = true;
  }

  schedules = schedules.map((s) => {
    if (s.hijriDate?.includes("Rabiul Akhir")) {
      changed = true;
      return {
        ...s,
        hijriDate: s.hijriDate.replace(/Rabiul Akhir/gi, "Jumadilawal"),
      };
    }
    return s;
  });

  if (changed) {
    db.fridaySchedules = schedules;
    saveDb(db);
  }

  const activeSchedule = mosqueId
    ? schedules.find((s) => (s.mosqueId || s.id) === mosqueId) || db.fridaySchedule
    : db.fridaySchedule || schedules[0];

  return NextResponse.json(
    {
      success: true,
      schedule: activeSchedule,
      schedules: schedules,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
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
    const db = await getDbAsync();
    if (!db.fridaySchedules) {
      db.fridaySchedules = [];
    }

    const targetMosqueId = data.mosqueId || "sudalmiyah";
    const existingIndex = db.fridaySchedules.findIndex(
      (s) => (s.mosqueId || s.id) === targetMosqueId
    );
    const existing = existingIndex >= 0 ? db.fridaySchedules[existingIndex] : null;

    const updatedSchedule: FridayOfficerSchedule = {
      id: data.id || existing?.id || `fri-${targetMosqueId}`,
      mosqueId: targetMosqueId,
      mosqueName: data.mosqueName ? sanitizeString(data.mosqueName) : (existing?.mosqueName || "Masjid Kampus UMS"),
      mosqueLocation: data.mosqueLocation ? sanitizeString(data.mosqueLocation) : existing?.mosqueLocation,
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

    if (existingIndex >= 0) {
      db.fridaySchedules[existingIndex] = updatedSchedule;
    } else {
      db.fridaySchedules.push(updatedSchedule);
    }

    if (targetMosqueId === "sudalmiyah") {
      db.fridaySchedule = updatedSchedule;
    }

    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_FRIDAY_SCHEDULE",
      session.email,
      ip,
      "SUCCESS",
      `Jadwal Shalat Jumat diperbarui untuk ${updatedSchedule.mosqueName || targetMosqueId}: Khatib ${updatedSchedule.khatibName}`
    );

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      schedules: db.fridaySchedules,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui jadwal jumat.";
    console.error("Error updating friday schedule:", err);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
