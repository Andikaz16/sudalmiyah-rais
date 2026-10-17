import { NextResponse, connection } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isBlobConfigured } from "@/lib/blobStorage";

export async function GET() {
  await connection();
  return NextResponse.json(
    {
      firebaseConfigured: isFirebaseConfigured(),
      blobConfigured: isBlobConfigured(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
