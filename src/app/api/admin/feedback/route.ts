import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { verifySessionToken } from "@/lib/security";
import { FeedbackStatus } from "@/lib/types";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const mosque = searchParams.get("mosque");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const db = await getDbAsync();
    const feedbacks = db.feedbacks || [];

    let filtered = [...feedbacks];

    if (status && status !== "ALL") {
      filtered = filtered.filter((f) => f.status === status);
    }
    if (mosque && mosque !== "ALL") {
      filtered = filtered.filter(
        (f) =>
          f.targetMosque === mosque ||
          f.targetMosque.startsWith(mosque) ||
          mosque.startsWith(f.targetMosque)
      );
    }
    if (category && category !== "ALL") {
      filtered = filtered.filter((f) => f.category === category);
    }
    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.message.toLowerCase().includes(search) ||
          f.name.toLowerCase().includes(search) ||
          (f.contact && f.contact.toLowerCase().includes(search)) ||
          f.targetMosque.toLowerCase().includes(search)
      );
    }

    const counts = {
      total: feedbacks.length,
      baru: feedbacks.filter((f) => f.status === "BARU").length,
      ditinjau: feedbacks.filter((f) => f.status === "DITINJAU").length,
      ditindaklanjuti: feedbacks.filter((f) => f.status === "DITINDAKLANJUTI").length,
      diarsipkan: feedbacks.filter((f) => f.status === "DIARSIPKAN").length,
    };

    return NextResponse.json({
      success: true,
      counts,
      feedbacks: filtered,
    });
  } catch (err: unknown) {
    console.error("Admin feedback GET error:", err);
    return NextResponse.json({ error: "Gagal memuat data masukan." }, { status: 500 });
  }
}

const updateFeedbackSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["BARU", "DITINJAU", "DITINDAKLANJUTI", "DIARSIPKAN"]).optional(),
  adminResponse: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateFeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
    }

    const { id, status, adminResponse } = parsed.data;
    const db = await getDbAsync();
    if (!db.feedbacks) db.feedbacks = [];

    const feedbackIndex = db.feedbacks.findIndex((f) => f.id === id);
    if (feedbackIndex === -1) {
      return NextResponse.json({ error: "Masukan tidak ditemukan." }, { status: 404 });
    }

    const feedback = db.feedbacks[feedbackIndex];
    if (status) {
      feedback.status = status as FeedbackStatus;
    }
    if (adminResponse !== undefined) {
      feedback.adminResponse = adminResponse.trim();
      feedback.respondedAt = new Date().toISOString();
      feedback.respondedBy = session.name || "Takmir";
      if (!status || status === "BARU") {
        feedback.status = "DITINJAU";
      }
    }

    db.feedbacks[feedbackIndex] = feedback;
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FEEDBACK_UPDATED",
      session.email,
      ip,
      "SUCCESS",
      `Update feedback ID ${id} status: ${feedback.status}`
    );

    return NextResponse.json({
      success: true,
      message: "Data aspirasi berhasil diperbarui.",
      feedback,
    });
  } catch (err: unknown) {
    console.error("Admin feedback PATCH error:", err);
    return NextResponse.json({ error: "Gagal memperbarui masukan." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || session.role !== "ADMIN_TAKMIR") {
    return NextResponse.json({ error: "Forbidden - Hanya Admin Takmir Utama" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    const db = await getDbAsync();
    if (!db.feedbacks) db.feedbacks = [];

    if (action === "clear-all") {
      const count = db.feedbacks.length;
      db.feedbacks = [];
      await saveDb(db);

      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      logSecurityEvent(
        "FEEDBACK_CLEARED",
        session.email,
        ip,
        "WARNING",
        `Mengosongkan semua data masukan jamaah (${count} pesan dihapus)`
      );

      return NextResponse.json({
        success: true,
        message: "Semua data masukan jamaah berhasil dikosongkan.",
      });
    }

    if (!id) {
      return NextResponse.json({ error: "ID masukan diperlukan." }, { status: 400 });
    }

    const exists = db.feedbacks.some((f) => f.id === id);
    if (!exists) {
      return NextResponse.json({ error: "Masukan tidak ditemukan." }, { status: 404 });
    }

    db.feedbacks = db.feedbacks.filter((f) => f.id !== id);
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FEEDBACK_DELETED",
      session.email,
      ip,
      "WARNING",
      `Hapus masukan ID ${id}`
    );

    return NextResponse.json({
      success: true,
      message: "Masukan berhasil dihapus.",
    });
  } catch (err: unknown) {
    console.error("Admin feedback DELETE error:", err);
    return NextResponse.json({ error: "Gagal menghapus masukan." }, { status: 500 });
  }
}
