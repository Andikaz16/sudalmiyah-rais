"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight,
} from "lucide-react";
import { KhutbahItem } from "@/lib/types";

export default function KhutbahPage() {
  const [khutbahs, setKhutbahs] = useState<KhutbahItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyText = (e: React.MouseEvent, item: KhutbahItem) => {
    e.stopPropagation();
    e.preventDefault();
    const fullText = `*${item.title}*\nOleh: ${item.author}\nSumber: ${
      item.source === "SUARA_MUHAMMADIYAH" ? "Suara Muhammadiyah" : "Takmir Masjid Kampus UMS"
    }\nTanggal: ${item.date}\n\n=== KHUTBAH PERTAMA ===\n\n${item.firstKhutbah}\n\n=== KHUTBAH KEDUA ===\n\n${
      item.secondKhutbah
    }\n\nDiakses dari Portal Resmi Masjid UMS: https://masjid.ums.ac.id/layanan/khutbah/${item.slug}`;

    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#002B54] to-[#003B73] text-white py-12 sm:py-16 px-4 border-b border-stone-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B58A1E_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight mb-3">
              Pusat Naskah Khutbah Jum&apos;at
            </h1>
            <p className="text-sm sm:text-base text-stone-200 max-w-2xl leading-relaxed">
              Koleksi naskah khutbah pilihan yang terstruktur, padat, dan mencerahkan. Bersumber resmi dari{" "}
              <strong className="text-amber-300 font-semibold">Suara Muhammadiyah</strong> serta materi kajian{" "}
              <strong className="text-white font-semibold">Takmir Masjid Kampus UMS</strong> dilengkapi teks Arab dan bacaan Latin untuk memudahkan para khatib dalam bertugas di mimbar Jum&apos;at.
            </p>
          </div>
        </section>

        {/* Content Container */}
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
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
              {khutbahs.map((item) => {
                const detailHref = `/layanan/khutbah/${encodeURIComponent(item.slug || item.id)}`;

                return (
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

                      {/* Title Link */}
                      <Link href={detailHref} className="block group-hover:text-[#003B73] transition-colors">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 group-hover:text-[#003B73] transition-colors leading-snug">
                          {item.title}
                        </h3>
                      </Link>

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
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B73] hover:bg-[#002B54] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Baca Naskah</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleCopyText(e, item)}
                          className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
                          title="Salin Naskah ke Clipboard"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
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
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
