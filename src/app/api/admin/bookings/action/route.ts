import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, logSecurityEvent, saveDb } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";

const actionSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parse = actionSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { bookingId, status } = parse.data;
    const db = getDb();
    const booking = db.facilityBookings.find((b) => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
    }

    booking.status = status;
    saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "BOOKING_STATUS_UPDATE",
      session.email,
      ip,
      "SUCCESS",
      `Peminjaman ${booking.eventTitle} diubah status menjadi ${status}`
    );

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking Action Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status peminjaman." }, { status: 500 });
  }
}
