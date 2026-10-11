import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      nim: payload.nim,
    },
  });
}
