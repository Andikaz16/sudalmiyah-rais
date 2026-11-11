import { NextRequest, NextResponse, connection } from "next/server";
import { z } from "zod";
import { getDbAsync, logSecurityEvent, saveDb, getDefaultMosqueBankAccounts } from "@/lib/db";
import { sanitizeString, verifySessionToken } from "@/lib/security";
import { MosqueBankInfo } from "@/lib/types";

const updateMosqueBankSchema = z.object({
  mosqueId: z.string().min(1, "ID Masjid wajib diisi"),
  mosqueName: z.string().optional(),
  bankName: z.string().min(2, "Nama bank minimal 2 karakter").max(100),
  accountNumber: z.string().min(3, "Nomor rekening minimal 3 karakter").max(50),
  accountHolder: z.string().min(2, "Atas nama rekening minimal 2 karakter").max(150),
  qrisImageUrl: z.string().min(1, "URL gambar QRIS tidak boleh kosong"),
  qrisMerchantName: z.string().max(150).optional().default(""),
  qrisNmid: z.string().max(50).optional().default(""),
  notes: z.string().max(500).optional().default(""),
  virtualBankUrl: z.string().max(300).optional().default(""),
  isActive: z.boolean().default(true),
});

export async function GET() {
  await connection();
  const db = await getDbAsync();
  const accounts = db.mosqueBankAccounts && db.mosqueBankAccounts.length > 0
    ? db.mosqueBankAccounts
    : getDefaultMosqueBankAccounts();

  return NextResponse.json(
    {
      success: true,
      accounts,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("sudalmiyah_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Otentikasi dibutuhkan." }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ADMIN_TAKMIR" && session.role !== "PENGURUS_AGENDA")) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parseResult = updateMosqueBankSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data masukan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const db = await getDbAsync();

    if (!db.mosqueBankAccounts || db.mosqueBankAccounts.length === 0) {
      db.mosqueBankAccounts = getDefaultMosqueBankAccounts();
    }

    const index = db.mosqueBankAccounts.findIndex((acc) => acc.mosqueId === data.mosqueId);

    const updatedAccount: MosqueBankInfo = {
      mosqueId: data.mosqueId,
      mosqueName: data.mosqueName ? sanitizeString(data.mosqueName) : (index !== -1 ? db.mosqueBankAccounts[index].mosqueName : data.mosqueId),
      bankName: sanitizeString(data.bankName),
      accountNumber: sanitizeString(data.accountNumber).replace(/\s+/g, ""),
      accountHolder: sanitizeString(data.accountHolder),
      qrisImageUrl: sanitizeString(data.qrisImageUrl),
      qrisMerchantName: data.qrisMerchantName ? sanitizeString(data.qrisMerchantName) : undefined,
      qrisNmid: data.qrisNmid ? sanitizeString(data.qrisNmid) : undefined,
      notes: data.notes ? sanitizeString(data.notes) : undefined,
      virtualBankUrl: data.virtualBankUrl ? sanitizeString(data.virtualBankUrl) : undefined,
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    };

    if (index !== -1) {
      db.mosqueBankAccounts[index] = updatedAccount;
    } else {
      db.mosqueBankAccounts.push(updatedAccount);
    }

    await saveDb(db);

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    logSecurityEvent(
      "UPDATE_MOSQUE_BANK_INFO",
      session.email,
      ip,
      "SUCCESS",
      `Rekening & QRIS diperbarui untuk masjid: ${updatedAccount.mosqueName} (${updatedAccount.bankName} - ${updatedAccount.accountNumber})`
    );

    return NextResponse.json({
      success: true,
      account: updatedAccount,
      accounts: db.mosqueBankAccounts,
    });
  } catch (err: any) {
    console.error("Error updating mosque bank info:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui rekening dan QRIS masjid." },
      { status: 500 }
    );
  }
}
