import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agendaId = searchParams.get("agendaId");

    if (!agendaId) {
      return NextResponse.json(
        { error: "Parameter agendaId wajib disertakan." },
        { status: 400 }
      );
    }

    const db = getDb();
    const agenda = db.agendas.find((a) => a.id === agendaId);

    if (!agenda) {
      return NextResponse.json(
        { error: "Agenda tidak ditemukan." },
        { status: 404 }
      );
    }

    const attendees = db.registrations.filter(
      (r) => r.agendaId === agendaId && r.status === "ATTENDED"
    );

    const latestAttendees = attendees
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        name: r.fullName,
        nim: r.nim ? `${r.nim.substring(0, 4)}***${r.nim.slice(-2)}` : null, // Masked NIM for privacy on big screen
        faculty: r.faculty,
        attendedAt: r.attendedAt,
        photoUrl: r.photoUrl,
      }));

    return NextResponse.json(
      {
        agendaId: agenda.id,
        title: agenda.title,
        totalAttended: attendees.length,
        latestAttendees,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Presensi Stats Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik presensi." },
      { status: 500 }
    );
  }
}
