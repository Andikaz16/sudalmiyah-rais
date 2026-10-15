import { NextResponse, connection } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  await connection();
  const db = getDb();
  return NextResponse.json({ logs: db.auditLogs });
}
