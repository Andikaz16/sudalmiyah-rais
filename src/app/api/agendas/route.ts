import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDb, getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { Agenda, AgendaCategory } from "@/lib/types";

const createAgendaSchema = z.object({
  title: z.string().min(3, "Judul agenda minimal 3 karakter").max(250, "Judul agenda maksimal 250 karakter"),
  category: z.enum(["SHALAT_JUMAT", "KAJIAN_MAHASISWA", "TABLIGH_AKBAR", "TAHSIN", "SOSIAL"]),
  speaker: z.string().min(2, "Nama pemateri / penyelenggara minimal 2 karakter").max(200),
  speakerRole: z.string().min(2, "Jabatan / lembaga minimal 2 karakter").max(200),
  date: z.string().min(8, "Format tanggal tidak valid").max(20),
  time: z.string().min(2, "Format waktu minimal 2 karakter").max(100),
  location: z.string().min(3, "Lokasi ruang minimal 3 karakter").max(300, "Lokasi ruang maksimal 300 karakter"),
  description: z.string().min(3, "Deskripsi kegiatan minimal 3 karakter").max(5000, "Deskripsi kegiatan maksimal 5.000 karakter"),
  quota: z.preprocess((val) => {
    const num = Number(val);
    return isNaN(num) || num <= 0 ? 1000 : num;
  }, z.number().int().positive().max(100000)),
  requiresRegistration: z.boolean(),
  targetAudience: z.string().max(300).optional(),
  bannerUrl: z.string().optional(),
});

export async function GET(request: NextRequest) {
  await connection();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const db = await getDbAsync();
  let agendas: Agenda[] = Array.isArray(db.agendas) ? [...db.agendas] : [];

  if (category && category !== "ALL") {
    agendas = agendas.filter((a) => a.category === category);
  }

  // Urutkan agenda terbaru di sebelah kiri (descending): tanggal terbaru di awal/kiri, yang lebih lama bergeser ke kanan
  agendas = [...agendas].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
      return timeB - timeA;
    }
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdB - createdA;
  });

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
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const firstEntry = Object.entries(fieldErrors)[0];
      const detailMsg = firstEntry ? `${firstEntry[0]}: ${firstEntry[1]?.join(", ")}` : "Format data tidak sesuai";
      return NextResponse.json(
        { error: `Data masukan tidak valid (${detailMsg})`, details: fieldErrors },
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
      ...(isCompleted !== undefined && {
        isCompleted: Boolean(isCompleted),
        ...(!Boolean(isCompleted) && { completedAt: undefined }),
      }),
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
