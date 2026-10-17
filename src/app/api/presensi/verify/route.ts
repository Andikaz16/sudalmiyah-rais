import { NextRequest, NextResponse } from "next/server";
import { getDbAsync } from "@/lib/db";
import { verifyDynamicToken, TOKEN_MAX_AGE_SECONDS } from "@/lib/presensi-token";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: "MALFORMED",
          message: "Parameter token presensi tidak disertakan dalam tautan.",
        },
        { status: 400 }
      );
    }

    // Verifikasi validitas dan kedaluwarsa token
    const verification = verifyDynamicToken(token, TOKEN_MAX_AGE_SECONDS);

    if (!verification.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: verification.error,
          message: verification.message,
          ageSeconds: verification.ageSeconds,
        },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    const agenda = db.agendas.find((a) => a.id === verification.agendaId);

    if (!agenda) {
      return NextResponse.json(
        {
          valid: false,
          error: "NOT_FOUND",
          message: "Data agenda kegiatan tidak ditemukan pada pangkalan data.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        ageSeconds: verification.ageSeconds,
        agenda: {
          id: agenda.id,
          title: agenda.title,
          category: agenda.category,
          speaker: agenda.speaker,
          speakerRole: agenda.speakerRole,
          date: agenda.date,
          time: agenda.time,
          location: agenda.location,
          description: agenda.description,
        },
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
    console.error("Presensi Verify Error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "INTERNAL_ERROR",
        message: "Terjadi gangguan saat memverifikasi kode token presensi.",
      },
      { status: 500 }
    );
  }
}
