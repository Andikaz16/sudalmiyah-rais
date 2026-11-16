import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDbFields } from "@/lib/db";
import { checkRateLimit, sanitizeString } from "@/lib/security";
import { FinancialRecord } from "@/lib/types";

const donationSubmitSchema = z.object({
  donorName: z.string().min(2).max(100),
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
  amount: z.number().int().min(10000, "Donasi minimal Rp 10.000").max(500000000),
  description: z.string().max(200).optional(),
  mosqueName: z.string().max(120).optional(),
});

export function sortFinancesDesc(records: FinancialRecord[]): FinancialRecord[] {
  return [...records].sort((a, b) => {
    const timeDiff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
    return 0;
  });
}

export async function GET() {
  await connection();
  const db = await getDbAsync();
  const list = Array.isArray(db.finances) ? sortFinancesDesc(db.finances) : [];

  const totalIncome = list
    .filter((f) => f.type === "INCOME" && f.isVerified)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = list
    .filter((f) => f.type === "EXPENSE" && f.isVerified)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const currentBalance = totalIncome - totalExpense;

  return NextResponse.json(
    {
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        currentBalance,
        totalTransactions: list.length,
      },
      campaigns: db.campaigns || [],
      records: list,
      recentTransactions: list.slice(0, 20),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  const rateLimitResult = checkRateLimit(`donation-${ip}`, 5, 60 * 1000);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan tunggu sesaat." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = donationSubmitSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data donasi tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = await getDbAsync();

    const newRecord: FinancialRecord = {
      id: `fin-${Date.now().toString(36)}`,
      title: `Infaq Online: ${data.category.replace(/_/g, " ")}`,
      type: "INCOME",
      category: data.category,
      amount: data.amount,
      date: new Date().toISOString().split("T")[0],
      mosqueName: data.mosqueName ? sanitizeString(data.mosqueName) : "Masjid Hj. Sudalmiyah Rais",
      donorName: sanitizeString(data.donorName),
      description: data.description ? sanitizeString(data.description) : "Infaq digital melalui portal Masjid Sudalmiyah",
      isVerified: true,
      verifiedBy: "Sistem Otomatis / Takmir",
    };

    db.finances.unshift(newRecord);
    await saveDbFields(["finances"], { finances: db.finances });

    logSecurityEvent(
      "DONATION_SUBMITTED",
      newRecord.donorName || "ANONYMOUS",
      ip,
      "SUCCESS",
      `Donasi Rp ${data.amount.toLocaleString("id-ID")} berhasil dicatat.`
    );

    return NextResponse.json({
      success: true,
      message: "Terima kasih, catatan donasi/infaq Anda telah tersimpan di sistem kas masjid.",
      record: newRecord,
    });
  } catch (error) {
    console.error("Donation Submit Error:", error);
    return NextResponse.json({ error: "Gagal memproses donasi." }, { status: 500 });
  }
}
