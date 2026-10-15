import { NextRequest, NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";
import { PopupBanner } from "@/lib/types";
import { POST as adminPost, PATCH as adminPatch, DELETE as adminDelete } from "@/app/api/admin/popup/route";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const db = getDb();
    const isAdminQuery = request.nextUrl.searchParams.get("admin") === "1";

    let allPopups: PopupBanner[] = [];
    if (Array.isArray(db.popupBanners) && db.popupBanners.length > 0) {
      allPopups = db.popupBanners;
    } else if (db.popupBanner) {
      allPopups = [db.popupBanner];
    }

    const filteredPopups = isAdminQuery ? allPopups : allPopups.filter((p) => p.isActive);
    const primaryPopup = filteredPopups[0] || null;

    return NextResponse.json(
      {
        popup: primaryPopup,
        popups: filteredPopups,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Popup fetch error:", error);
    return NextResponse.json({ popup: null, popups: [] }, { status: 500 });
  }
}

export const POST = adminPost;
export const PATCH = adminPatch;
export const DELETE = adminDelete;
