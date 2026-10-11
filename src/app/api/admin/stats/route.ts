import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const totalAgendas = db.agendas.length;
  const totalRegistrations = db.registrations.length;
  const pendingBookings = db.facilityBookings.filter((b) => b.status === "PENDING").length;

  const totalIncome = db.finances
    .filter((f) => f.type === "INCOME" && f.isVerified)
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = db.finances
    .filter((f) => f.type === "EXPENSE" && f.isVerified)
    .reduce((sum, f) => sum + f.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  return NextResponse.json({
    stats: {
      totalAgendas,
      totalRegistrations,
      pendingBookings,
      totalIncome,
      totalExpense,
      currentBalance,
    },
    recentAgendas: db.agendas.slice(0, 5),
    recentRegistrations: db.registrations.slice(0, 10),
    recentBookings: db.facilityBookings.slice(0, 5),
    recentAuditLogs: db.auditLogs.slice(0, 10),
  });
}
