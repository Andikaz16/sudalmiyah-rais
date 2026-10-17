import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { checkRateLimit, sanitizeString } from "@/lib/security";
import { FacilityBooking } from "@/lib/types";

const bookingSchema = z.object({
  applicantName: z.string().min(3).max(80),
  organization: z.string().min(3).max(100),
  applicantPhone: z.string().min(10).max(16),
  nim: z.string().min(6).max(20),
  facilityName: z.string().min(2).max(100),
  eventTitle: z.string().min(5).max(150),
  eventDate: z.string().min(10).max(10),
  startTime: z.string().min(4).max(10),
  endTime: z.string().min(4).max(10),
  letterUrl: z.string().max(400).optional().or(z.literal("")),
  notes: z.string().max(400).optional().or(z.literal("")),
});

export async function GET() {
  const db = await getDbAsync();
  return NextResponse.json({ bookings: db.facilityBookings });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimitResult = checkRateLimit(`booking-${ip}`, 5, 60 * 1000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak pengajuan. Silakan tunggu beberapa menit." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = bookingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data pengajuan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = await getDbAsync();

    const newBooking: FacilityBooking = {
      id: `bkg-${Date.now().toString(36)}`,
      applicantName: sanitizeString(data.applicantName),
      organization: sanitizeString(data.organization),
      applicantPhone: sanitizeString(data.applicantPhone),
      nim: sanitizeString(data.nim).toUpperCase(),
      facilityName: sanitizeString(data.facilityName),
      eventTitle: sanitizeString(data.eventTitle),
      eventDate: data.eventDate,
      startTime: data.startTime,
      endTime: data.endTime,
      letterUrl: data.letterUrl ? sanitizeString(data.letterUrl) : undefined,
      notes: data.notes ? sanitizeString(data.notes) : undefined,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };

    db.facilityBookings.unshift(newBooking);
    await saveDb(db);

    logSecurityEvent(
      "FACILITY_BOOKING_SUBMITTED",
      newBooking.nim,
      ip,
      "SUCCESS",
      `Permohonan izin ruang: ${newBooking.facilityName} oleh ${newBooking.organization}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Permohonan peminjaman ruang berhasil diajukan dan sedang menunggu verifikasi takmir.",
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking Submit Error:", error);
    return NextResponse.json({ error: "Gagal memproses permohonan peminjaman." }, { status: 500 });
  }
}
