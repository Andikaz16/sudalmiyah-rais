import { NextRequest, NextResponse } from "next/server";
import { getDbAsync, saveDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const db = await getDbAsync();
  let documents = db.documents || [];

  if (category && category !== "ALL") {
    documents = documents.filter((d) => d.category === category);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    documents = documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        (d.categoryLabel && d.categoryLabel.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    success: true,
    documents,
  });
}

// Endpoint to track download count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID dokumen diperlukan." }, { status: 400 });
    }

    const db = await getDbAsync();
    if (!db.documents) {
      return NextResponse.json({ error: "Data dokumen kosong." }, { status: 404 });
    }

    const doc = db.documents.find((d) => d.id === id);
    if (!doc) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan." }, { status: 404 });
    }

    doc.downloadCount = (doc.downloadCount || 0) + 1;
    await saveDb(db);

    return NextResponse.json({
      success: true,
      downloadCount: doc.downloadCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mencatat unduhan." }, { status: 500 });
  }
}
