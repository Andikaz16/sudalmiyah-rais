import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const popup = db.popupBanner && db.popupBanner.isActive ? db.popupBanner : null;

    return NextResponse.json(
      { popup },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Popup fetch error:", error);
    return NextResponse.json({ popup: null }, { status: 500 });
  }
}
