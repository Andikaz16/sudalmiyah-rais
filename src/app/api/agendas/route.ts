import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDb, getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { Agenda, AgendaCategory } from "@/lib/types";
import { isBlobConfigured, readAgendasFromBlob, saveAgendasToBlob } from "@/lib/blobStorage";

const createAgendaSchema = z.object({
  title: z.string().min(5).max(150),
  category: z.enum(["SHALAT_JUMAT", "KAJIAN_MAHASISWA", "TABLIGH_AKBAR", "TAHSIN", "SOSIAL"]),
  speaker: z.string().min(3).max(100),
  speakerRole: z.string().min(3).max(100),
  date: z.string().min(10).max(10),
  time: z.string().min(5).max(50),
  location: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  quota: z.number().int().positive().max(5000),
  requiresRegistration: z.boolean(),
  targetAudience: z.string().max(250).optional(),
  bannerUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  await connection();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let agendas: Agenda[] = [];

  // Priority 1: Persistent Vercel Blob if active
  if (isBlobConfigured()) {
    try {
      const blobAgendas = await readAgendasFromBlob();
      if (Array.isArray(blobAgendas) && blobAgendas.length > 0) {
        agendas = blobAgendas;
      }
    } catch (e) {
      console.warn("Notice: Blob agendas read error:", e);
    }
  }

  // Priority 2: Database fallback
  if (agendas.length === 0) {
    const db = await getDbAsync();
    agendas = db.agendas;
  }

  if (category && category !== "ALL") {
    agendas = agendas.filter((a) => a.category === category);
  }

  // Sort by date ascending
  agendas = [...agendas].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json(
    { agendas },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
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
    const parseResult = createAgendaSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data masukan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = await getDbAsync();

    const newAgenda: Agenda = {
      id: `agn-${Date.now().toString(36)}`,
      title: sanitizeString(data.title),
      category: data.category as AgendaCategory,
      speaker: sanitizeString(data.speaker),
      speakerRole: sanitizeString(data.speakerRole),
      date: data.date,
      time: sanitizeString(data.time),
      location: sanitizeString(data.location),
      description: sanitizeString(data.description),
      quota: data.quota,
      registeredCount: 0,
      isOpen: true,
      requiresRegistration: data.requiresRegistration,
      targetAudience: data.targetAudience ? sanitizeString(data.targetAudience) : undefined,
      bannerUrl: data.bannerUrl ? sanitizeString(data.bannerUrl) : "/uploads/agendas/agenda-jumat.jpg",
      createdAt: new Date().toISOString(),
    };

    db.agendas.unshift(newAgenda);
    await saveDb(db);

    if (isBlobConfigured()) {
      try {
        await saveAgendasToBlob(db.agendas);
      } catch (blobErr) {
        console.warn("Notice: Failed to sync new agenda to Blob:", blobErr);
      }
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent("CREATE_AGENDA", session.email, ip, "SUCCESS", `Agenda dibuat: ${newAgenda.title}`);

    return NextResponse.json({ success: true, agenda: newAgenda }, { status: 201 });
  } catch (error) {
    console.error("Create Agenda Error:", error);
    return NextResponse.json({ error: "Gagal menyimpan agenda." }, { status: 500 });
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
    const { id, isCompleted, actualAttendees, documentationPhotos, summaryNote, title, description } = body;
    if (!id) {
      return NextResponse.json({ error: "ID agenda diperlukan." }, { status: 400 });
    }

    const db = await getDbAsync();
    const targetIdx = db.agendas.findIndex((a) => a.id === id);
    if (targetIdx === -1) {
      return NextResponse.json({ error: "Agenda tidak ditemukan." }, { status: 404 });
    }

    const current = db.agendas[targetIdx];
    const updatedAgenda: Agenda = {
      ...current,
      ...(isCompleted !== undefined && { isCompleted: Boolean(isCompleted) }),
      ...(actualAttendees !== undefined && {
        actualAttendees:
          actualAttendees === null || actualAttendees === "" ? null : Number(actualAttendees),
      }),
      ...(documentationPhotos !== undefined && {
        documentationPhotos: Array.isArray(documentationPhotos)
          ? documentationPhotos.map((url: string) => sanitizeString(String(url)))
          : [],
      }),
      ...(summaryNote !== undefined && {
        summaryNote: sanitizeString(String(summaryNote)),
      }),
      ...(title !== undefined && { title: sanitizeString(String(title)) }),
      ...(description !== undefined && { description: sanitizeString(String(description)) }),
      ...(Boolean(isCompleted) && !current.completedAt && { completedAt: new Date().toISOString() }),
    };

    db.agendas[targetIdx] = updatedAgenda;
    await saveDb(db);

    if (isBlobConfigured()) {
      try {
        await saveAgendasToBlob(db.agendas);
      } catch (blobErr) {
        console.warn("Notice: Failed to sync updated agenda to Blob:", blobErr);
      }
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_AGENDA",
      session.email,
      ip,
      "SUCCESS",
      `Agenda diperbarui: ${updatedAgenda.title} (Selesai: ${updatedAgenda.isCompleted ? "Ya" : "Tidak"})`
    );

    return NextResponse.json({ success: true, agenda: updatedAgenda });
  } catch (error) {
    console.error("Update Agenda Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui agenda." }, { status: 500 });
  }
}
