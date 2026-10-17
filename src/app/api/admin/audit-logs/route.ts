import { NextResponse, connection } from "next/server";
import { getDbAsync } from "@/lib/db";

export async function GET() {
  await connection();
  const db = await getDbAsync();
  return NextResponse.json({ logs: db.auditLogs });
}
