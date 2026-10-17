import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { checkRateLimit, generateTicketCode, sanitizeString } from "@/lib/security";
import { Registration } from "@/lib/types";

const registrationSchema = z.object({
  agendaId: z.string().min(1),
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter").max(80),
  email: z.string().email("Format email tidak valid").max(100),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(16),
  isUmsStudent: z.boolean(),
  nim: z.string().max(20).optional(),
  faculty: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting: 10 registrations per 1 minute
  const rateLimitResult = checkRateLimit(`register-${ip}`, 10, 60 * 1000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan pendaftaran. Silakan coba sesaat lagi." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = registrationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = await getDbAsync();

    // Verify agenda exists and is open
    const agenda = db.agendas.find((a) => a.id === data.agendaId);
    if (!agenda) {
      return NextResponse.json({ error: "Agenda kegiatan tidak ditemukan." }, { status: 404 });
    }

    if (!agenda.isOpen) {
      return NextResponse.json({ error: "Pendaftaran untuk agenda ini telah ditutup." }, { status: 400 });
    }

    if (agenda.registeredCount >= agenda.quota) {
      return NextResponse.json({ error: "Kuota pendaftaran agenda ini telah penuh." }, { status: 400 });
    }

    // Check duplicate registration by email or NIM
    const duplicate = db.registrations.find(
      (r) =>
        r.agendaId === data.agendaId &&
        (r.email.toLowerCase() === data.email.toLowerCase() ||
          (data.isUmsStudent && data.nim && r.nim?.toLowerCase() === data.nim.toLowerCase()))
    );

    if (duplicate) {
      return NextResponse.json(
        {
          error: "Anda telah terdaftar sebelumnya pada agenda ini.",
          existingTicketCode: duplicate.ticketCode,
        },
        { status: 409 }
      );
    }

    const ticketCode = generateTicketCode("SUDALMIYAH");

    const newRegistration: Registration = {
      id: `reg-${Date.now().toString(36)}`,
      agendaId: agenda.id,
      agendaTitle: agenda.title,
      fullName: sanitizeString(data.fullName),
      email: data.email.toLowerCase().trim(),
      phone: sanitizeString(data.phone),
      isUmsStudent: data.isUmsStudent,
      nim: data.nim ? sanitizeString(data.nim).toUpperCase() : undefined,
      faculty: data.faculty ? sanitizeString(data.faculty) : undefined,
      ticketCode,
      status: "CONFIRMED",
      registeredAt: new Date().toISOString(),
    };

    db.registrations.unshift(newRegistration);
    agenda.registeredCount += 1;
    await saveDb(db);

    logSecurityEvent(
      "EVENT_REGISTRATION",
      newRegistration.email,
      ip,
      "SUCCESS",
      `Pendaftaran baru untuk [${agenda.title}] dengan tiket ${ticketCode}`
    );

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil dikonfirmasi.",
        registration: newRegistration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses pendaftaran." },
      { status: 500 }
    );
  }
}
