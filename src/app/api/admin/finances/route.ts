import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDbFields } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { FinancialRecord } from "@/lib/types";

const financeItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Judul / uraian transaksi minimal 3 karakter").max(200),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "INFAQ_JUMAT",
    "SEDEKAH_SUBUH",
    "WAKAF_RENOVASI",
    "PEMBANGUNAN",
    "OPERASIONAL",
    "HONORARIUM",
    "KEGIATAN_SOSIAL",
    "LAINNYA",
  ]),
  amount: z.number().int().min(100, "Nominal minimal Rp 100").max(5000000000),
  date: z.string().min(4, "Tanggal transaksi wajib diisi").max(40),
  mosqueName: z.string().max(150).optional().or(z.literal("")),
  donorName: z.string().max(150).optional().or(z.literal("")),
  proofUrl: z.string().max(500).optional().or(z.literal("")),
  description: z.string().min(3, "Rincian kegunaan / keterangan minimal 3 karakter").max(1000),
  isVerified: z.boolean().default(true),
  verifiedBy: z.string().max(120).optional().or(z.literal("")),
});

async function authorizeAdmin(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 }) };
  }
  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return { error: NextResponse.json({ error: "Akses ditolak." }, { status: 403 }) };
  }
  return { session };
}

function sortRecords(list: FinancialRecord[]): FinancialRecord[] {
  return [...list].sort((a, b) => {
    const diff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    return Number.isNaN(diff) ? 0 : diff;
  });
}

function buildSummary(list: FinancialRecord[]) {
  const totalIncome = list
    .filter((f) => f.type === "INCOME" && f.isVerified)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalExpense = list
    .filter((f) => f.type === "EXPENSE" && f.isVerified)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  return {
    totalIncome,
    totalExpense,
    currentBalance: totalIncome - totalExpense,
    totalTransactions: list.length,
  };
}

export async function GET(request: NextRequest) {
  await connection();
  const auth = await authorizeAdmin(request);
  if (auth.error) return auth.error;

  const db = await getDbAsync();
  const sorted = sortRecords(Array.isArray(db.finances) ? db.finances : []);

  return NextResponse.json(
    {
      success: true,
      records: sorted,
      summary: buildSummary(sorted),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = financeItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data transaksi keuangan tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.finances)) {
      db.finances = [];
    }

    const d = parsed.data;
    const newRecord: FinancialRecord = {
      id: `fin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: sanitizeString(d.title),
      type: d.type,
      category: d.category,
      amount: d.amount,
      date: sanitizeString(d.date),
      mosqueName: d.mosqueName ? sanitizeString(d.mosqueName) : "Masjid Hj. Sudalmiyah Rais",
      donorName: d.donorName ? sanitizeString(d.donorName) : undefined,
      proofUrl: d.proofUrl ? d.proofUrl.trim() : undefined,
      description: sanitizeString(d.description),
      isVerified: d.isVerified,
      verifiedBy: d.verifiedBy ? sanitizeString(d.verifiedBy) : "Bendahara Takmir",
      updatedAt: new Date().toISOString(),
    };

    db.finances.unshift(newRecord);
    await saveDbFields(["finances"], { finances: db.finances });

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FINANCE_CREATED",
      auth.session.email || auth.session.name,
      ip,
      "SUCCESS",
      `Catatan keuangan ${d.type === "INCOME" ? "Pemasukan" : "Pengeluaran"} Rp ${d.amount.toLocaleString("id-ID")}: "${newRecord.title}"`
    );

    const sorted = sortRecords(db.finances);
    return NextResponse.json({
      success: true,
      message: "Catatan laporan keuangan berhasil disimpan.",
      record: newRecord,
      records: sorted,
      summary: buildSummary(sorted),
    });
  } catch (err) {
    console.error("POST /api/admin/finances error:", err);
    return NextResponse.json({ error: "Gagal menyimpan laporan keuangan." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = financeItemSchema.safeParse(body);
    if (!parsed.success || !parsed.data.id) {
      return NextResponse.json(
        { error: parsed.success ? "ID transaksi wajib disertakan." : parsed.error.issues[0]?.message || "Data tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDbAsync();
    if (!Array.isArray(db.finances)) {
      db.finances = [];
    }

    const d = parsed.data;
    const idx = db.finances.findIndex((f) => f.id === d.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Data transaksi tidak ditemukan." }, { status: 404 });
    }

    const updatedRecord: FinancialRecord = {
      ...db.finances[idx],
      title: sanitizeString(d.title),
      type: d.type,
      category: d.category,
      amount: d.amount,
      date: sanitizeString(d.date),
      mosqueName: d.mosqueName ? sanitizeString(d.mosqueName) : "Masjid Hj. Sudalmiyah Rais",
      donorName: d.donorName ? sanitizeString(d.donorName) : undefined,
      proofUrl: d.proofUrl ? d.proofUrl.trim() : undefined,
      description: sanitizeString(d.description),
      isVerified: d.isVerified,
      verifiedBy: d.verifiedBy ? sanitizeString(d.verifiedBy) : "Bendahara Takmir",
      updatedAt: new Date().toISOString(),
    };

    db.finances[idx] = updatedRecord;
    await saveDbFields(["finances"], { finances: db.finances });

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FINANCE_UPDATED",
      auth.session.email || auth.session.name,
      ip,
      "SUCCESS",
      `Catatan keuangan diperbarui: "${updatedRecord.title}" (Rp ${updatedRecord.amount.toLocaleString("id-ID")})`
    );

    const sorted = sortRecords(db.finances);
    return NextResponse.json({
      success: true,
      message: "Catatan laporan keuangan berhasil diperbarui.",
      record: updatedRecord,
      records: sorted,
      summary: buildSummary(sorted),
    });
  } catch (err) {
    console.error("PUT /api/admin/finances error:", err);
    return NextResponse.json({ error: "Gagal memperbarui laporan keuangan." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parameter id dibutuhkan." }, { status: 400 });
  }

  try {
    const db = await getDbAsync();
    if (!Array.isArray(db.finances)) {
      db.finances = [];
    }

    const idx = db.finances.findIndex((f) => f.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    const removed = db.finances[idx];
    db.finances.splice(idx, 1);
    await saveDbFields(["finances"], { finances: db.finances });

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "FINANCE_DELETED",
      auth.session.email || auth.session.name,
      ip,
      "SUCCESS",
      `Catatan keuangan dihapus: "${removed.title}"`
    );

    const sorted = sortRecords(db.finances);
    return NextResponse.json({
      success: true,
      message: "Catatan transaksi berhasil dihapus.",
      records: sorted,
      summary: buildSummary(sorted),
    });
  } catch (err) {
    console.error("DELETE /api/admin/finances error:", err);
    return NextResponse.json({ error: "Gagal menghapus transaksi." }, { status: 500 });
  }
}
