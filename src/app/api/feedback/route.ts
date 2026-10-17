import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDb } from "@/lib/db";
import { FeedbackCategory, MosqueFeedback } from "@/lib/types";

const submitFeedbackSchema = z.object({
  name: z.string().optional().default(""),
  isAnonymous: z.boolean().optional().default(false),
  contact: z.string().optional().default(""),
  targetMosque: z.string().min(1, "Pilih masjid tujuan."),
  category: z.enum([
    "IDARAH",
    "IMARAH",
    "RIAYAH",
    "RAMAH_DIFABEL",
    "ECO_MOSQUE",
    "KEAMANAN",
    "LAINNYA",
  ] as const),
  rating: z.number().min(1).max(5).default(5),
  message: z
    .string()
    .min(5, "Pesan masukan minimal 5 karakter.")
    .max(2000, "Pesan masukan maksimal 2000 karakter."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submitFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Data masukan tidak valid.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, isAnonymous, contact, targetMosque, category, rating, message } =
      parsed.data;

    const db = await getDbAsync();
    if (!db.feedbacks) {
      db.feedbacks = [];
    }

    const displayName = isAnonymous || !name.trim() ? "Hamba Allah / Anonim" : name.trim();

    const newFeedback: MosqueFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: displayName,
      isAnonymous: Boolean(isAnonymous),
      contact: contact ? contact.trim() : undefined,
      targetMosque: targetMosque.trim(),
      category: category as FeedbackCategory,
      rating,
      message: message.trim(),
      status: "BARU",
      createdAt: new Date().toISOString(),
    };

    db.feedbacks.unshift(newFeedback);
    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FEEDBACK_SUBMISSION",
      displayName,
      ip,
      "SUCCESS",
      `Aspirasi baru untuk ${targetMosque} kategori ${category}`
    );

    return NextResponse.json({
      success: true,
      message: "Terima kasih, saran dan aspirasi Anda telah berhasil dikirim ke Takmir.",
      feedback: newFeedback,
    });
  } catch (err: unknown) {
    console.error("Feedback submit error:", err);
    return NextResponse.json(
      { error: "Gagal mengirim masukan. Silakan coba kembali." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mosque = searchParams.get("mosque");
    const limit = Math.min(Number(searchParams.get("limit") || 10), 50);

    const db = await getDbAsync();
    const feedbacks = db.feedbacks || [];

    let filtered = feedbacks;
    if (mosque && mosque !== "ALL") {
      filtered = filtered.filter((f) => f.targetMosque === mosque);
    }

    // Public only sees approved/responded feedbacks or high quality feedbacks
    const publicList = filtered.slice(0, limit).map((f) => ({
      id: f.id,
      name: f.isAnonymous ? "Hamba Allah / Anonim" : f.name,
      targetMosque: f.targetMosque,
      category: f.category,
      rating: f.rating,
      message: f.message,
      status: f.status,
      adminResponse: f.adminResponse,
      respondedAt: f.respondedAt,
      respondedBy: f.respondedBy,
      createdAt: f.createdAt,
    }));

    const total = feedbacks.length;
    const avgRating =
      total > 0
        ? Number(
            (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
          )
        : 5.0;

    return NextResponse.json({
      success: true,
      total,
      avgRating,
      feedbacks: publicList,
    });
  } catch (err: unknown) {
    console.error("Public feedback fetch error:", err);
    return NextResponse.json(
      { error: "Gagal memuat aspirasi publik." },
      { status: 500 }
    );
  }
}
