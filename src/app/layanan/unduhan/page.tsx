"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  FileText,
  Download,
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { DownloadDocument } from "@/lib/types";

export default function UnduhanPage() {
  const [documents, setDocuments] = useState<DownloadDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  const handleDownload = async (doc: DownloadDocument) => {
    // Record download count
    try {
      fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id }),
      });
      // Increment local count
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d))
      );
    } catch (err) {
      console.error(err);
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName || `${doc.title}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [
    { id: "ALL", label: "Semua Dokumen" },
    { id: "TARJIH_FIQIH", label: "Tarjih & Fiqih" },
    { id: "IDEOLOGI", label: "Ideologi & Akhlak" },
    { id: "KEMUHAMMADIYAHAN", label: "Kemuhammadiyahan" },
    { id: "DOKUMEN_MUKTAMAR", label: "Dokumen Muktamar" },
    { id: "PANDUAN_MASJID", label: "Panduan Takmir" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Navigation Switcher between Services */}
        <div className="bg-white border-b border-stone-200 sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2.5 scrollbar-none">
              <Link
                href="/layanan"
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-stone-600 hover:text-[#003B73] hover:bg-stone-100 transition-colors shrink-0 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-stone-400" />
                <span>Peminjaman Fasilitas &amp; Aula</span>
              </Link>
              <span className="text-stone-300">/</span>
              <div className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#003B73] text-white shrink-0 flex items-center gap-2 shadow-xs">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Pusat Unduhan &amp; Pustaka Dokumen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Header */}
        <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-stone-200/80 py-12 sm:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-bold mb-4 font-mono">
              <ShieldCheck className="w-4 h-4 text-[#003B73]" />
              <span>Pustaka Resmi Persyarikatan Muhammadiyah</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
              Pusat Unduhan &amp; <span className="text-[#003B73]">Pustaka Dokumen</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-2xl mx-auto">
              Akses dan unduh berkas pedoman resmi, Himpunan Putusan Tarjih (HPT), Pedoman Hidup Islami Warga Muhammadiyah (PHIWM), Risalah Islam Berkemajuan, serta Buku Panduan Standar Masjid Percontohan.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dokumen, fatwa, atau pedoman..."
                  className="w-full pl-11 pr-24 py-3 rounded-full bg-white border border-stone-300 focus:border-[#003B73] focus:ring-2 focus:ring-[#003B73]/20 text-stone-900 text-xs sm:text-sm placeholder:text-stone-400 shadow-sm outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cari
                </button>
              </div>
            </form>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {categories.map((c) => {
                const isActive = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#003B73] text-white shadow-xs"
                        : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Document Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                Daftar Dokumen Tersedia
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Menampilkan {documents.length} dokumen rujukan dan panduan digital
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-white border border-stone-200 p-6 animate-pulse"
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 text-stone-500 max-w-lg mx-auto">
              <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-stone-800">Dokumen tidak ditemukan</h3>
              <p className="text-xs text-stone-500 mt-1">
                Silakan coba kata kunci pencarian lain atau pilih kategori Semua Dokumen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-3xl bg-white border border-stone-200 hover:border-[#D4AF37]/70 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* Header Card with Category Badge and Icon */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-3 rounded-2xl bg-[#003B73]/10 text-[#003B73] shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-stone-100 text-[#003B73] border border-stone-200">
                        {doc.categoryLabel || doc.category.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Document Title & Author */}
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-[#003B73] transition-colors font-serif line-clamp-2 leading-snug">
                        {doc.title}
                      </h3>
                      <div className="text-[11px] text-stone-500 mt-1 font-medium">
                        Oleh: <span className="text-stone-700">{doc.author}</span>
                      </div>
                    </div>

                    {/* Document Description */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {doc.description}
                    </p>
                  </div>

                  {/* Footer Card with File Meta and Actions */}
                  <div className="mt-6 pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                      <span className="font-semibold text-stone-700">
                        {doc.fileFormat} • {doc.fileSize || "1.9 MB"}
                      </span>
                      <span>{doc.downloadCount || 0} kali diunduh</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2.5 px-3 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                        <span>Baca Online</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="w-full text-center py-2.5 px-3 rounded-full text-xs font-bold bg-[#003B73] hover:bg-[#002855] text-white shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Unduh PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Need another document note */}
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#001F3F] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                Membutuhkan Literatur atau Dokumen Pedoman Lainnya?
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
                Pengurus Takmir Masjid Sudalmiyah senantiasa memperbarui pustaka digital. Silakan sampaikan rekomendasi dokumen atau buku panduan yang ingin ditambahkan melalui Kotak Aspirasi Jamaah.
              </p>
            </div>
            <Link
              href="/#feedback"
              className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shrink-0 shadow-md"
            >
              Kirim Usulan Dokumen
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
