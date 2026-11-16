"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/context/LanguageContext";
import { FinancialCategory, FinancialRecord } from "@/lib/types";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Search,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Coins,
  Filter,
} from "lucide-react";

const CATEGORY_LABELS_ID: Record<FinancialCategory, string> = {
  INFAQ_JUMAT: "Infaq Shalat Jumat",
  SEDEKAH_SUBUH: "Sedekah Subuh",
  WAKAF_RENOVASI: "Wakaf & Renovasi",
  PEMBANGUNAN: "Pembangunan Masjid",
  OPERASIONAL: "Operasional & Marbot",
  HONORARIUM: "Honorarium Khatib / Dai",
  KEGIATAN_SOSIAL: "Kajian & Kegiatan Sosial",
  LAINNYA: "Keperluan Lainnya",
};

const CATEGORY_LABELS_EN: Record<FinancialCategory, string> = {
  INFAQ_JUMAT: "Friday Prayer Infaq",
  SEDEKAH_SUBUH: "Dawn Charity (Subuh)",
  WAKAF_RENOVASI: "Waqf & Renovation",
  PEMBANGUNAN: "Mosque Construction",
  OPERASIONAL: "Operations & Maintenance",
  HONORARIUM: "Preacher / Scholar Honorarium",
  KEGIATAN_SOSIAL: "Islamic Study & Social Events",
  LAINNYA: "Other Purposes",
};

function formatDateDisplay(dateStr: string, isEn: boolean): string {
  if (!dateStr) return "-";
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(isEn ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMonthOption(ym: string, isEn: boolean): string {
  const [y, m] = ym.split("-");
  const parsed = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return ym;
  return parsed.toLocaleDateString(isEn ? "en-US" : "id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default function KeuanganMasjidPage() {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [monthFilter, setMonthFilter] = useState<string>("ALL");
  const [mosqueFilter, setMosqueFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    const loadFinances = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/finances?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        const list = Array.isArray(data.records)
          ? data.records
          : Array.isArray(data.recentTransactions)
          ? data.recentTransactions
          : [];
        setRecords(list);
      } catch (err) {
        console.error("Gagal memuat laporan keuangan masjid:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadFinances();
    return () => {
      active = false;
    };
  }, []);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.date && /^\d{4}-\d{2}/.test(r.date)) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const availableMosques = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      set.add(r.mosqueName || "Masjid Hj. Sudalmiyah Rais");
    });
    return Array.from(set).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
      if (monthFilter !== "ALL" && !(r.date || "").startsWith(monthFilter)) return false;
      const mosque = r.mosqueName || "Masjid Hj. Sudalmiyah Rais";
      if (mosqueFilter !== "ALL" && mosque !== mosqueFilter) return false;
      if (q) {
        const catLabel = (isEn ? CATEGORY_LABELS_EN : CATEGORY_LABELS_ID)[r.category] || r.category;
        const hay = `${r.title} ${r.description} ${r.donorName || ""} ${mosque} ${catLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [records, typeFilter, categoryFilter, monthFilter, mosqueFilter, searchQuery, isEn]);

  const filteredStats = useMemo(() => {
    const income = filteredRecords
      .filter((r) => r.type === "INCOME" && r.isVerified)
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const expense = filteredRecords
      .filter((r) => r.type === "EXPENSE" && r.isVerified)
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredRecords]);

  const overallStats = useMemo(() => {
    const income = records
      .filter((r) => r.type === "INCOME" && r.isVerified)
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const expense = records
      .filter((r) => r.type === "EXPENSE" && r.isVerified)
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [records]);

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      "No",
      "Tanggal",
      "Jenis",
      "Kategori",
      "Masjid",
      "Judul Transaksi",
      "Kegunaan / Rincian",
      "Sumber / Penerima",
      "Pemasukan (Rp)",
      "Pengeluaran (Rp)",
      "Status",
    ];
    const rows = filteredRecords.map((r, i) => {
      const cat = CATEGORY_LABELS_ID[r.category] || r.category;
      const mosque = r.mosqueName || "Masjid Hj. Sudalmiyah Rais";
      const esc = (v: string) => `"${String(v || "").replace(/"/g, '""')}"`;
      return [
        i + 1,
        esc(r.date),
        esc(r.type === "INCOME" ? "Pemasukan" : "Pengeluaran"),
        esc(cat),
        esc(mosque),
        esc(r.title),
        esc(r.description),
        esc(r.donorName || "-"),
        r.type === "INCOME" ? r.amount : 0,
        r.type === "EXPENSE" ? r.amount : 0,
        esc(r.isVerified ? `Terverifikasi (${r.verifiedBy || "Takmir"})` : "Menunggu Verifikasi"),
      ].join(",");
    });
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-keuangan-masjid-ums-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryLabels = isEn ? CATEGORY_LABELS_EN : CATEGORY_LABELS_ID;
  const hasActiveFilter =
    typeFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    monthFilter !== "ALL" ||
    mosqueFilter !== "ALL" ||
    searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full pb-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-b from-[#002B54] to-[#003B73] text-white py-12 sm:py-16 px-4 border-b border-stone-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B58A1E_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Wallet className="w-3.5 h-3.5" />
                <span>{isEn ? "Financial Transparency Portal" : "Portal Transparansi Keuangan"}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                {isEn ? "Mosque Financial Report" : "Laporan Keuangan Masjid Sudalmiyah"}
              </h1>
              <p className="text-sm sm:text-base text-stone-200 mt-3 leading-relaxed">
                {isEn
                  ? "Transparent ledger of incoming infaq, alms, and waqf funds as well as operational expenses and mosque utilization verified by Takmir."
                  : "Catatan terbuka pemasukan infaq, sedekah, wakaf, serta rincian pengeluaran dana operasional dan program kemakmuran Masjid Hj. Sudalmiyah Rais dan jaringan Masjid Kampus UMS."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isEn ? "Download CSV" : "Unduh Excel / CSV"}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-sky-200" />
                <span>{isEn ? "Print Report" : "Cetak Laporan"}</span>
              </button>
              <Link
                href="/donasi"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B58A1E] hover:bg-[#9c7516] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>{isEn ? "Digital Infaq QRIS" : "Infaq Digital QRIS"}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Summary KPI Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Pemasukan */}
            <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-md flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                  {hasActiveFilter
                    ? isEn
                      ? "Filtered Income"
                      : "Total Pemasukan (Terfilter)"
                    : isEn
                    ? "Total Verified Income"
                    : "Total Pemasukan Infaq"}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-1 tracking-tight">
                  Rp {filteredStats.income.toLocaleString("id-ID")}
                </p>
                {hasActiveFilter && (
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    {isEn ? "Overall:" : "Keseluruhan:"} Rp {overallStats.income.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-md flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
                  {hasActiveFilter
                    ? isEn
                      ? "Filtered Expenses"
                      : "Total Pengeluaran (Terfilter)"
                    : isEn
                    ? "Total Verified Expenses"
                    : "Total Pengeluaran Kas"}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-rose-950 font-mono mt-1 tracking-tight">
                  Rp {filteredStats.expense.toLocaleString("id-ID")}
                </p>
                {hasActiveFilter && (
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    {isEn ? "Overall:" : "Keseluruhan:"} Rp {overallStats.expense.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            {/* Saldo Bersih */}
            <div className="bg-white rounded-2xl border border-[#003B73]/30 p-5 shadow-md flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#003B73] block">
                  {hasActiveFilter
                    ? isEn
                      ? "Filtered Net Balance"
                      : "Selisih / Saldo (Terfilter)"
                    : isEn
                    ? "Current Mosque Cash Balance"
                    : "Saldo Kas Masjid Saat Ini"}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#003B73] font-mono mt-1 tracking-tight">
                  Rp {filteredStats.balance.toLocaleString("id-ID")}
                </p>
                {hasActiveFilter && (
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    {isEn ? "Total Balance:" : "Saldo Total:"} Rp {overallStats.balance.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#003B73]/10 text-[#003B73] flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 print:hidden">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-600 inline-flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#003B73]" />
                  {isEn ? "Type:" : "Jenis:"}
                </span>
                {[
                  { id: "ALL" as const, label: isEn ? "All Transactions" : "Semua Transaksi" },
                  { id: "INCOME" as const, label: isEn ? "Income (+)" : "Pemasukan (+)" },
                  { id: "EXPENSE" as const, label: isEn ? "Expense (-)" : "Pengeluaran (-)" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTypeFilter(opt.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      typeFilter === opt.id
                        ? opt.id === "INCOME"
                          ? "bg-emerald-700 text-white shadow-xs"
                          : opt.id === "EXPENSE"
                          ? "bg-rose-700 text-white shadow-xs"
                          : "bg-[#003B73] text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter("ALL");
                    setCategoryFilter("ALL");
                    setMonthFilter("ALL");
                    setMosqueFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                >
                  {isEn ? "Reset Filters" : "Reset Filter"}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search purpose, donor, notes..." : "Cari keperluan, judul, sumber..."}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#003B73]/30"
                />
              </div>

              {/* Month Filter */}
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]/30 cursor-pointer"
              >
                <option value="ALL">{isEn ? "All Months / Periods" : "Semua Bulan / Periode"}</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthOption(ym, isEn)}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]/30 cursor-pointer"
              >
                <option value="ALL">{isEn ? "All Categories" : "Semua Kategori Penggunaan"}</option>
                {(Object.keys(categoryLabels) as FinancialCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>

              {/* Mosque Filter */}
              <select
                value={mosqueFilter}
                onChange={(e) => setMosqueFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]/30 cursor-pointer"
              >
                <option value="ALL">{isEn ? "All Campus Mosques" : "Semua Masjid Kampus"}</option>
                {availableMosques.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Financial Ledger Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                  {isEn
                    ? "Detailed Infaq Income & Expense Ledger"
                    : "Tabel Rincian Pemasukan & Pengeluaran Uang Infaq Masjid"}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isEn
                    ? `Showing ${filteredRecords.length} recorded financial transactions`
                    : `Menampilkan ${filteredRecords.length} catatan transaksi pemasukan dan penggunaan dana`}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEn ? "Audited by Takmir" : "Terdata & Terverifikasi Takmir"}</span>
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-9 h-9 border-4 border-stone-200 border-t-[#003B73] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-stone-500">
                  {isEn ? "Loading financial ledger..." : "Memuat tabel laporan keuangan masjid..."}
                </p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-2">
                <Wallet className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-sm font-bold text-stone-800">
                  {isEn ? "No matching financial records" : "Belum ada catatan transaksi yang sesuai"}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {isEn
                    ? "Try clearing your filters or search query."
                    : "Coba ubah filter pencarian atau tunggu bendahara takmir menambahkan catatan transaksi."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#003B73]/5 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                        <th className="py-3.5 px-4 w-12 text-center">No</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isEn ? "Date" : "Tanggal"}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isEn ? "Type" : "Arus Kas"}</th>
                        <th className="py-3.5 px-4">{isEn ? "Category & Mosque" : "Kategori & Masjid"}</th>
                        <th className="py-3.5 px-4">{isEn ? "Purpose & Details" : "Uraian / Kegunaan Dana"}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap text-emerald-800">
                          {isEn ? "Income (Rp)" : "Pemasukan (Rp)"}
                        </th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap text-rose-800">
                          {isEn ? "Expense (Rp)" : "Pengeluaran (Rp)"}
                        </th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {filteredRecords.map((item, idx) => {
                        const isIncome = item.type === "INCOME";
                        const mosque = item.mosqueName || "Masjid Hj. Sudalmiyah Rais";
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-stone-50/90 transition-colors align-top"
                          >
                            <td className="py-3.5 px-4 text-center font-mono text-stone-400">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap font-medium text-stone-700">
                              {formatDateDisplay(item.date, isEn)}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isIncome
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft className="w-3 h-3" />
                                ) : (
                                  <ArrowUpRight className="w-3 h-3" />
                                )}
                                <span>
                                  {isIncome
                                    ? isEn
                                      ? "Income"
                                      : "Pemasukan"
                                    : isEn
                                    ? "Expense"
                                    : "Pengeluaran"}
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-stone-800 block">
                                {categoryLabels[item.category] || item.category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                                <Building2 className="w-3 h-3 text-[#003B73]" />
                                {mosque}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-md">
                              <p className="font-bold text-stone-900 leading-snug">{item.title}</p>
                              <p className="text-stone-600 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                              {item.donorName && (
                                <p className="text-[11px] text-stone-500 mt-1">
                                  <strong className="font-semibold">
                                    {isIncome
                                      ? isEn
                                        ? "Source:"
                                        : "Sumber:"
                                      : isEn
                                      ? "Recipient:"
                                      : "Penerima / Pihak:"}
                                  </strong>{" "}
                                  {item.donorName}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-emerald-700">
                              {isIncome ? `+ Rp ${Number(item.amount).toLocaleString("id-ID")}` : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-rose-700">
                              {!isIncome ? `- Rp ${Number(item.amount).toLocaleString("id-ID")}` : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {item.isVerified ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                                  title={item.verifiedBy || "Takmir"}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{item.verifiedBy || (isEn ? "Verified" : "Terverifikasi")}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                  <Clock className="w-3 h-3" />
                                  <span>{isEn ? "Pending" : "Proses"}</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-stone-100/90 border-t-2 border-stone-300 font-bold text-xs">
                        <td colSpan={5} className="py-3.5 px-4 text-right text-stone-800 uppercase tracking-wider">
                          {isEn ? "Total (Verified Transactions)" : "Jumlah Total (Terverifikasi)"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-800 whitespace-nowrap">
                          Rp {filteredStats.income.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-rose-800 whitespace-nowrap">
                          Rp {filteredStats.expense.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[#003B73] whitespace-nowrap">
                          Saldo: Rp {filteredStats.balance.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-stone-100">
                  {filteredRecords.map((item) => {
                    const isIncome = item.type === "INCOME";
                    const mosque = item.mosqueName || "Masjid Hj. Sudalmiyah Rais";
                    return (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {isIncome
                              ? isEn
                                ? "Income"
                                : "Pemasukan"
                              : isEn
                              ? "Expense"
                              : "Pengeluaran"}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500">
                            {formatDateDisplay(item.date, isEn)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-stone-900 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-[#003B73] font-semibold mt-0.5">
                              {categoryLabels[item.category] || item.category} • {mosque}
                            </p>
                          </div>
                          <span
                            className={`text-sm font-mono font-black whitespace-nowrap shrink-0 ${
                              isIncome ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {isIncome ? "+" : "-"} Rp {Number(item.amount).toLocaleString("id-ID")}
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                        {item.donorName && (
                          <p className="text-[11px] text-stone-500">
                            {isIncome ? (isEn ? "Source:" : "Sumber:") : (isEn ? "Recipient:" : "Penerima:")}{" "}
                            <span className="font-semibold text-stone-700">{item.donorName}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
