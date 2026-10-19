import { NextResponse, connection } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isImgbbConfigured } from "@/lib/imgbb";

export async function GET() {
  await connection();
  return NextResponse.json(
    {
      firebaseConfigured: isFirebaseConfigured(),
      imgbbConfigured: isImgbbConfigured(),
      blobConfigured: false,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
