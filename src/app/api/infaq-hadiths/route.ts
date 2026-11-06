import { NextResponse, connection } from "next/server";
import { getDbAsync, getDefaultInfaqHadiths } from "@/lib/db";
import { InfaqHadith } from "@/lib/types";

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    const db = await getDbAsync();
    let hadiths: InfaqHadith[] = Array.isArray(db.infaqHadiths) && db.infaqHadiths.length > 0
      ? db.infaqHadiths
      : getDefaultInfaqHadiths();

    if (!includeAll) {
      hadiths = hadiths.filter((h) => h.isActive !== false);
    }

    hadiths.sort((a, b) => {
      const orderA = a.order ?? a.id ?? 0;
      const orderB = b.order ?? b.id ?? 0;
      return orderA - orderB;
    });

    return NextResponse.json(
      {
        success: true,
        count: hadiths.length,
        hadiths,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/infaq-hadiths error:", error);
    return NextResponse.json(
      {
        success: true,
        count: getDefaultInfaqHadiths().length,
        hadiths: getDefaultInfaqHadiths(),
      },
      { status: 200 }
    );
  }
}
