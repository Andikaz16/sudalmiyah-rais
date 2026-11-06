"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Copy,
  Check,
  Printer,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Languages,
} from "lucide-react";
import { KhutbahItem } from "@/lib/types";
import {
  isArabicParagraph,
  getArabicTransliteration,
} from "@/lib/arabic-transliteration";

function KhutbahDetailContent() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : (rawSlug as string) || "";

  const [khutbah, setKhutbah] = useState<KhutbahItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1 to 5
  const [activeTab, setActiveTab] = useState<"ALL_TEXT" | "KHUTBAH_1" | "KHUTBAH_2">("ALL_TEXT");
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/khutbah?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setKhutbah(data.data);
        } else {
          setError(data.error || "Naskah khutbah tidak ditemukan.");
        }
      } catch (err) {
        console.error("Gagal memuat detail khutbah:", err);
        setError("Terjadi kendala saat memuat naskah khutbah. Silakan coba kembali.");
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [slug]);

  const handleCopy = () => {
    if (!khutbah) return;
    const fullText = `*${khutbah.title}*\nOleh: ${khutbah.author}\nSumber: ${
      khutbah.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid Kampus UMS"
    }\nTanggal: ${khutbah.date}\n\n=== KHUTBAH PERTAMA ===\n\n${khutbah.firstKhutbah}\n\n=== KHUTBAH KEDUA ===\n\n${
      khutbah.secondKhutbah
    }\n\nDiakses dari Portal Resmi Masjid Kampus UMS: https://masjid.ums.ac.id/layanan/khutbah/${khutbah.slug}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const getFontSizeClass = (level: number) => {
    switch (level) {
      case 1:
        return "text-sm leading-relaxed";
      case 2:
        return "text-base sm:text-lg leading-relaxed";
      case 3:
        return "text-lg sm:text-xl leading-loose";
      case 4:
        return "text-xl sm:text-2xl leading-loose";
      case 5:
        return "text-2xl sm:text-3xl leading-loose";
      default:
        return "text-base sm:text-lg leading-relaxed";
    }
  };

  const renderContentWithLatin = (rawText: string) => {
    if (!rawText) return null;

    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-6">
        {paragraphs.map((p, idx) => {
          const isArabic = isArabicParagraph(p);
          const latin = isArabic && showLatin ? getArabicTransliteration(p) : null;

          if (isArabic) {
            return (
              <div
                key={idx}
                className="my-4 p-5 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-3"
              >
                {/* Teks Arab */}
                <p
                  dir="rtl"
                  className="font-serif text-right text-stone-900 leading-loose text-xl sm:text-2xl font-medium tracking-wide selection:bg-amber-200"
                >
                  {p}
                </p>

                {/* Bacaan Latin / Transliterasi */}
                {showLatin && (
                  <div className="pt-3 border-t border-amber-200/70">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      <Languages className="w-3.5 h-3.5 text-amber-700" />
                      <span>Bacaan Latin:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-sans italic text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-200/60 leading-relaxed">
                      {latin || "Bacaan doa/ayat sesuai kaidah tajwid berharakat di atas."}
                    </p>
                  </div>
                )}
              </div>
            );
          }

          return (
            <p
              key={idx}
              className={`${getFontSizeClass(
                fontSizeLevel
              )} text-stone-800 font-serif leading-relaxed sm:leading-loose`}
            >
              {p}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 w-full">
        {/* Back Bar & Breadcrumb */}
        <section className="bg-white border-b border-stone-200 py-3.5 px-4 print:hidden sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <Link
              href="/layanan/khutbah"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#003B73] hover:text-[#002B54] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Khutbah</span>
            </Link>

            {khutbah && (
              <div className="flex items-center gap-2">
                {/* Latin Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowLatin((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    showLatin
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                  }`}
                  title="Aktifkan atau nonaktifkan teks latin pada bacaan Arab"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Teks Latin:</span>
                  <span className="font-bold">{showLatin ? "ON" : "OFF"}</span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 transition-all cursor-pointer"
                  title="Cetak Naskah atau Simpan PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cetak / PDF</span>
                </button>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 transition-all cursor-pointer"
                  title="Salin Naskah Khutbah"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 hidden sm:inline">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Salin</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-[#003B73] rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-stone-500">Memuat naskah khutbah lengkap...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-2xl border border-dashed border-stone-300 text-center space-y-4">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto" />
            <h2 className="text-lg font-bold text-stone-900">{error}</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Naskah yang Anda cari mungkin telah diperbarui atau alamat tautan tidak sesuai.
            </p>
            <Link
              href="/layanan/khutbah"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003B73] hover:bg-[#002B54] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Daftar Naskah Khutbah</span>
            </Link>
          </div>
        )}

        {/* Loaded Detail Article */}
        {!loading && khutbah && (
          <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {/* Header / Meta Container */}
            <header className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-2xs space-y-5 mb-8 print:border-none print:shadow-none print:p-0 print:mb-6">
              {/* Badge Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      khutbah.source === "SUARA_MUHAMMADIYAH"
                        ? "bg-[#800000] text-white"
                        : "bg-[#003B73] text-white"
                    }`}
                  >
                    {khutbah.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid Kampus UMS"}
                  </span>
                  {khutbah.theme && (
                    <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-600 text-xs font-medium border border-stone-200">
                      {khutbah.theme}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{khutbah.date}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 leading-snug">
                {khutbah.title}
              </h1>

              {/* Khatib & Portal link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-[#B58A1E] flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Khatib / Penulis:</span>
                    <span className="font-semibold text-stone-800">{khutbah.author}</span>
                  </div>
                </div>

                {khutbah.sourceUrl && (
                  <a
                    href={khutbah.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-[#800000] font-semibold border border-stone-200 transition-colors print:hidden"
                  >
                    <span>Sumber Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </header>

            {/* Reading Toolbar & Tab Switcher (Screen only) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-2xs mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
              {/* Tabs */}
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("ALL_TEXT")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "ALL_TEXT"
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Teks Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("KHUTBAH_1")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "KHUTBAH_1"
                      ? "bg-[#003B73] text-white shadow-2xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Khutbah Pertama
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("KHUTBAH_2")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "KHUTBAH_2"
                      ? "bg-[#003B73] text-white shadow-2xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Khutbah Kedua &amp; Doa
                </button>
              </div>

              {/* Font scaling controls for Mimbar */}
              <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1 border border-stone-200">
                <span className="text-[11px] font-medium text-stone-500 pl-2 pr-1 hidden sm:inline">Ukuran Font:</span>
                <button
                  type="button"
                  onClick={() => setFontSizeLevel((prev) => Math.max(1, prev - 1))}
                  disabled={fontSizeLevel <= 1}
                  className="p-1 rounded-lg hover:bg-white text-stone-700 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Perkecil Ukuran Teks"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-stone-700 select-none">
                  A{fontSizeLevel > 2 ? `+${fontSizeLevel - 2}` : fontSizeLevel < 2 ? "-1" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setFontSizeLevel((prev) => Math.min(5, prev + 1))}
                  disabled={fontSizeLevel >= 5}
                  className="p-1 rounded-lg hover:bg-white text-stone-700 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Perbesar Ukuran Teks (Mode Mimbar)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Khutbah Body Content */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-12 shadow-2xs space-y-10 print:border-none print:shadow-none print:p-0">
              {/* KHUTBAH PERTAMA */}
              {(activeTab === "ALL_TEXT" || activeTab === "KHUTBAH_1") && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#003B73]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#003B73] text-white font-bold flex items-center justify-center text-xs">
                        1
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-[#003B73] uppercase tracking-wider">
                        Khutbah Pertama
                      </h2>
                    </div>
                    <span className="text-xs text-stone-400 italic hidden sm:inline">
                      Khutbatul Hajah &amp; Inti Pembahasan
                    </span>
                  </div>

                  {renderContentWithLatin(khutbah.firstKhutbah)}
                </section>
              )}

              {/* SEPARATOR (if showing all) */}
              {activeTab === "ALL_TEXT" && (
                <div className="py-6 border-t-2 border-dashed border-stone-200 text-center">
                  <span className="px-4 py-1.5 rounded-full bg-stone-100 text-stone-500 text-xs font-semibold uppercase tracking-wider">
                    Duduk di Antara Dua Khutbah
                  </span>
                </div>
              )}

              {/* KHUTBAH KEDUA */}
              {(activeTab === "ALL_TEXT" || activeTab === "KHUTBAH_2") && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#003B73]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-[#003B73] text-white font-bold flex items-center justify-center text-xs">
                        2
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-[#003B73] uppercase tracking-wider">
                        Khutbah Kedua &amp; Doa
                      </h2>
                    </div>
                    <span className="text-xs text-stone-400 italic hidden sm:inline">
                      Wasiat Taqwa, Shalawat, &amp; Doa Jamaah
                    </span>
                  </div>

                  {renderContentWithLatin(khutbah.secondKhutbah)}
                </section>
              )}
            </div>

            {/* Print Only Footer */}
            <div className="hidden print:block pt-8 mt-8 border-t border-stone-400 text-xs text-stone-600">
              <p className="font-semibold">Masjid Hj. Sudalmiyah Rais — Kampus 2 Universitas Muhammadiyah Surakarta</p>
              <p>Portal Resmi: https://masjid.ums.ac.id/layanan/khutbah | Edisi: {khutbah.date}</p>
            </div>
          </article>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default function KhutbahDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-[#003B73] rounded-full animate-spin" />
          <p className="text-xs font-medium text-stone-500">Memuat naskah khutbah...</p>
        </div>
      }
    >
      <KhutbahDetailContent />
    </Suspense>
  );
}
