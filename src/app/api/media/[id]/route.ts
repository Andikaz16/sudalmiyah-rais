import { NextRequest, NextResponse, connection } from "next/server";
import { getMediaFromFirebase } from "@/lib/firebase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();
  const { id } = await params;

  if (!id) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const media = await getMediaFromFirebase(id);
  if (!media) {
    return new NextResponse("Media Not Found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.data), {
    status: 200,
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
