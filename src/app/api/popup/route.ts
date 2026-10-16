import { NextRequest, NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";
import { PopupBanner } from "@/lib/types";
import { isBlobConfigured, readPopupsFromBlob } from "@/lib/blobStorage";
import { POST as adminPost, PATCH as adminPatch, DELETE as adminDelete } from "@/app/api/admin/popup/route";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const isAdminQuery = request.nextUrl.searchParams.get("admin") === "1";

    let allPopups: PopupBanner[] = [];

    // Prioritize persistent Vercel Blob storage if configured
    if (isBlobConfigured()) {
      try {
        const blobList = await readPopupsFromBlob();
        if (Array.isArray(blobList) && blobList.length > 0) {
          allPopups = blobList;
        }
      } catch (blobErr) {
        console.warn("Notice: Vercel Blob read error, falling back to local db:", blobErr);
      }
    }

    if (allPopups.length === 0) {
      const db = getDb();
      if (Array.isArray(db.popupBanners) && db.popupBanners.length > 0) {
        allPopups = db.popupBanners;
      } else if (db.popupBanner) {
        allPopups = [db.popupBanner];
      }
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
