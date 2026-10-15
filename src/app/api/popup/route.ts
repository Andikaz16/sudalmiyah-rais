import { NextRequest, NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";
import { POST as adminPost, PATCH as adminPatch, DELETE as adminDelete } from "@/app/api/admin/popup/route";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const db = getDb();
    const isAdminQuery = request.nextUrl.searchParams.get("admin") === "1";

    const popup = isAdminQuery
      ? db.popupBanner || null
      : db.popupBanner && db.popupBanner.isActive
      ? db.popupBanner
      : null;

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

export const POST = adminPost;
export const PATCH = adminPatch;
export const DELETE = adminDelete;
