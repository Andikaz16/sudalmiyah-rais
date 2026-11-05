"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  BookOpen,
  ExternalLink,
  Calendar,
  User,
  Copy,
  Check,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { KhutbahItem } from "@/lib/types";

export default function KhutbahPage() {
  const [khutbahs, setKhutbahs] = useState<KhutbahItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeKhutbah, setActiveKhutbah] = useState<KhutbahItem | null>(null);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1 = sm, 2 = base, 3 = lg, 4 = xl, 5 = 2xl
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL_TEXT" | "KHUTBAH_1" | "KHUTBAH_2">("ALL_TEXT");

  const printRef = useRef<HTMLDivElement>(null);

  const fetchKhutbahs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/khutbah");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setKhutbahs(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat naskah khutbah:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhutbahs();
  }, []);

  const handleCopyText = (item: KhutbahItem) => {
    const fullText = `*${item.title}*\nOleh: ${item.author}\nSumber: ${
      item.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid Kampus UMS"
    }\nTanggal: ${item.date}\n\n=== KHUTBAH PERTAMA ===\n\n${item.firstKhutbah}\n\n=== KHUTBAH KEDUA ===\n\n${
      item.secondKhutbah
    }\n\nDiakses dari Portal Resmi Masjid UMS: https://masjid.ums.ac.id/layanan/khutbah`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handlePrint = (item: KhutbahItem) => {
    setActiveKhutbah(item);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getFontSizeClass = (level: number) => {
    switch (level) {
      case 1:
        return "text-sm leading-relaxed";
      case 2:
        return "text-base leading-relaxed";
      case 3:
        return "text-lg leading-loose";
      case 4:
        return "text-xl leading-loose";
      case 5:
        return "text-2xl leading-loose";
      default:
        return "text-base leading-relaxed";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#002B54] to-[#003B73] text-white py-12 sm:py-16 px-4 border-b border-stone-200 print:hidden relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B58A1E_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-3">
              Pusat Naskah Khutbah Jum&apos;at
            </h1>
            <p className="text-sm sm:text-base text-stone-200 max-w-2xl leading-relaxed">
              Koleksi naskah khutbah pilihan yang terstruktur, padat, dan mencerahkan. Bersumber resmi dari{" "}
              <strong className="text-amber-300 font-semibold">Suara Muhammadiyah</strong> serta materi kajian{" "}
              <strong className="text-white font-semibold">Takmir Masjid Kampus UMS</strong> untuk memudahkan para khatib
              dalam bertugas di mimbar Jum&apos;at.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12 print:hidden">
          {/* List or Loading State */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-stone-200 border-t-[#003B73] rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-stone-500">Memuat naskah khutbah resmi...</p>
            </div>
          ) : khutbahs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-300 max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800 mb-1">Naskah Belum Tersedia</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Belum ada naskah khutbah yang tersimpan saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {khutbahs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5 sm:p-6 space-y-3">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.source === "SUARA_MUHAMMADIYAH"
                              ? "bg-[#800000]/10 text-[#800000] border border-[#800000]/20"
                              : "bg-[#003B73]/10 text-[#003B73] border border-[#003B73]/20"
                          }`}
                        >
                          {item.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid UMS"}
                        </span>
                        {item.theme && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium border border-stone-200">
                            {item.theme}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 group-hover:text-[#003B73] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Author */}
                    <div className="flex items-start gap-1.5 text-xs text-stone-600">
                      <User className="w-3.5 h-3.5 text-[#B58A1E] shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-1">{item.author}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 pt-1 border-t border-stone-100">
                      {item.summary}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveKhutbah(item);
                        setActiveTab("ALL_TEXT");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B73] hover:bg-[#002B54] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Baca Naskah</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyText(item)}
                        className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                        title="Salin Naskah ke Clipboard"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrint(item)}
                        className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                        title="Cetak atau Unduh Naskah PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-stone-600 hover:text-[#800000] hover:bg-stone-200/60 transition-colors"
                          title="Buka Halaman Resmi"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reader Modal (Active Khutbah) */}
        {activeKhutbah && (
          <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
            <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] overflow-hidden my-auto print:border-none print:shadow-none print:max-h-none print:rounded-none">
              {/* Modal Top Header Bar */}
              <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      activeKhutbah.source === "SUARA_MUHAMMADIYAH"
                        ? "bg-[#800000] text-white"
                        : "bg-[#003B73] text-white"
                    }`}
                  >
                    {activeKhutbah.source === "SUARA_MUHAMMADIYAH"
                      ? "Suara Muhammadiyah"
                      : "Takmir Masjid Kampus UMS"}
                  </span>
                  <span className="text-xs text-stone-500 font-mono hidden sm:inline">
                    {activeKhutbah.date}
                  </span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Font Size Scaling */}
                  <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel((prev) => Math.max(1, prev - 1))}
                      disabled={fontSizeLevel <= 1}
                      className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                      title="Perkecil Font"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 text-[11px] font-mono text-stone-600 font-bold select-none">
                      A{fontSizeLevel > 2 ? `+${fontSizeLevel - 2}` : fontSizeLevel < 2 ? "-1" : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFontSizeLevel((prev) => Math.min(5, prev + 1))}
                      disabled={fontSizeLevel >= 5}
                      className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                      title="Perbesar Font (Mode Mimbar)"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Print Button */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer"
                    title="Cetak Naskah (PDF)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyText(activeKhutbah)}
                    className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer"
                    title="Salin Naskah"
                  >
                    {copiedId === activeKhutbah.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => setActiveKhutbah(null)}
                    className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
                    title="Tutup Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Tabs for Fast Jumps */}
              <div className="px-5 py-2.5 bg-white border-b border-stone-100 flex items-center justify-between gap-2 overflow-x-auto print:hidden">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ALL_TEXT")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab === "ALL_TEXT"
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Teks Lengkap
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("KHUTBAH_1")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab === "KHUTBAH_1"
                        ? "bg-[#003B73] text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Khutbah Pertama
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("KHUTBAH_2")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab === "KHUTBAH_2"
                        ? "bg-[#003B73] text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    Khutbah Kedua &amp; Doa
                  </button>
                </div>

                {activeKhutbah.sourceUrl && (
                  <a
                    href={activeKhutbah.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#800000] hover:underline shrink-0"
                  >
                    <span>Portal Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Modal Body / Reader Viewport */}
              <div
                ref={printRef}
                className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#FFFDF9] print:bg-white print:p-0 print:overflow-visible"
              >
                {/* Print Header Header (Only appears on print) */}
                <div className="hidden print:block border-b-2 border-stone-800 pb-4 mb-6">
                  <div className="flex justify-between items-center text-xs text-stone-600 mb-2">
                    <span className="font-bold uppercase tracking-wider">
                      Masjid Hj. Sudalmiyah Rais — Kampus 2 UMS
                    </span>
                    <span>Portal Resmi: https://masjid.ums.ac.id</span>
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-stone-900">{activeKhutbah.title}</h1>
                  <p className="text-xs text-stone-700 mt-1">
                    Khatib / Penulis: <strong>{activeKhutbah.author}</strong> | Sumber:{" "}
                    {activeKhutbah.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid UMS"} |
                    Edisi: {activeKhutbah.date}
                  </p>
                </div>

                {/* Article Header (Screen view) */}
                <div className="space-y-3 pb-6 border-b border-stone-200 print:hidden">
                  <h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
                    {activeKhutbah.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-[#B58A1E]" />
                      <span>{activeKhutbah.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeKhutbah.date}</span>
                    </div>
                  </div>
                </div>

                {/* Khutbah Pertama */}
                {(activeTab === "ALL_TEXT" || activeTab === "KHUTBAH_1") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <h4 className="text-sm font-bold text-[#003B73] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#003B73] text-white flex items-center justify-center text-xs font-mono">
                          1
                        </span>
                        Khutbah Pertama
                      </h4>
                      <span className="text-xs text-stone-400 italic">Khutbatul Hajah &amp; Inti Materi</span>
                    </div>

                    <div
                      className={`${getFontSizeClass(
                        fontSizeLevel
                      )} text-stone-800 whitespace-pre-line font-serif space-y-4 print:text-sm print:leading-relaxed`}
                    >
                      {activeKhutbah.firstKhutbah}
                    </div>
                  </div>
                )}

                {/* Khutbah Kedua */}
                {(activeTab === "ALL_TEXT" || activeTab === "KHUTBAH_2") && (
                  <div className="space-y-4 pt-6 border-t border-stone-200">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <h4 className="text-sm font-bold text-[#003B73] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#003B73] text-white flex items-center justify-center text-xs font-mono">
                          2
                        </span>
                        Khutbah Kedua &amp; Doa
                      </h4>
                      <span className="text-xs text-stone-400 italic">Pujian, Shalawat &amp; Doa Kaum Muslimin</span>
                    </div>

                    <div
                      className={`${getFontSizeClass(
                        fontSizeLevel
                      )} text-stone-800 whitespace-pre-line font-serif space-y-4 print:text-sm print:leading-relaxed`}
                    >
                      {activeKhutbah.secondKhutbah}
                    </div>
                  </div>
                )}

                {/* Print Footer Notice */}
                <div className="hidden print:block pt-6 border-t border-stone-300 text-[10px] text-stone-500 text-center">
                  Dicetak melalui Portal Resmi Masjid Hj. Sudalmiyah Rais Universitas Muhammadiyah Surakarta —
                  https://masjid.ums.ac.id/layanan/khutbah
                </div>
              </div>

              {/* Modal Bottom Bar */}
              <div className="px-5 py-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 print:hidden">
                <span>
                  Tip: Gunakan tombol <strong className="text-stone-800">A+</strong> di pojok kanan atas untuk
                  memperbesar teks ketika membacakan naskah di mimbar.
                </span>

                <button
                  type="button"
                  onClick={() => setActiveKhutbah(null)}
                  className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer"
                >
                  Tutup Naskah
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
}
