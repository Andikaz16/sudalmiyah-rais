import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateDynamicToken, ROTATION_INTERVAL_SECONDS, TOKEN_MAX_AGE_SECONDS } from "@/lib/presensi-token";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAgendaId = searchParams.get("agendaId");

    const db = getDb();
    const agendas = db.agendas;

    if (!agendas || agendas.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data agenda yang tersedia." },
        { status: 404 }
      );
    }

    // Cari agenda yang diminta atau gunakan agenda aktif pertama
    let targetAgenda = requestedAgendaId
      ? agendas.find((a) => a.id === requestedAgendaId)
      : agendas.find((a) => a.isOpen) || agendas[0];

    if (!targetAgenda) {
      targetAgenda = agendas[0];
    }

    const now = Date.now();
    const token = generateDynamicToken(targetAgenda.id, now);

    // Hitung jumlah kehadiran nyata (status ATTENDED) untuk agenda ini
    const attendedCount = db.registrations.filter(
      (r) => r.agendaId === targetAgenda.id && r.status === "ATTENDED"
    ).length;

    return NextResponse.json(
      {
        token,
        generatedAt: now,
        intervalSeconds: ROTATION_INTERVAL_SECONDS,
        maxAgeSeconds: TOKEN_MAX_AGE_SECONDS,
        agenda: {
          id: targetAgenda.id,
          title: targetAgenda.title,
          category: targetAgenda.category,
          speaker: targetAgenda.speaker,
          speakerRole: targetAgenda.speakerRole,
          date: targetAgenda.date,
          time: targetAgenda.time,
          location: targetAgenda.location,
          description: targetAgenda.description,
          quota: targetAgenda.quota,
          registeredCount: targetAgenda.registeredCount,
          attendedCount,
        },
        availableAgendas: agendas.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          date: a.date,
          time: a.time,
          isOpen: a.isOpen,
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Presensi Token Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat token presensi dinamis." },
      { status: 500 }
    );
  }
}
