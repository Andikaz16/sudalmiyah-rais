import { NextResponse, connection } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase";

export async function GET() {
  await connection();
  return NextResponse.json(
    {
      firebaseConfigured: isFirebaseConfigured(),
      blobConfigured: false,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
