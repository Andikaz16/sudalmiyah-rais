"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Star,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  User,
  Phone,
  Filter,
} from "lucide-react";
import { FeedbackCategory, MosqueFeedback } from "@/lib/types";

const MOSQUE_OPTIONS = [
  "Masjid Hj. Sudalmiyah Rais (Kampus 2)",
  "Masjid Fadhlurrahman (Kampus 1)",
  "Masjid KH. Mas Mansur (Kampus 4)",
  "Masjid Ma'had Abu Bakar (Kampus 2)",
  "Masjid Ar-Razi FKG (Kampus 4)",
  "Masjid Munajat Shabran (Makamhaji)",
  "Semua Masjid Kampus (Saran Umum)",
];

const CATEGORY_OPTIONS: { key: FeedbackCategory; label: string; desc: string }[] = [
  { key: "RIAYAH", label: "Ri'ayah (Fasilitas & Kebersihan)", desc: "AC, wudhu, toilet, sound system, karpet, kerapian" },
  { key: "IMARAH", label: "Imarah (Ibadah & Kajian)", desc: "Shalat berjamaah, materi kajian, khatib Jumat, tahsin" },
  { key: "IDARAH", label: "Idarah (Pelayanan & Manajemen)", desc: "Layanan takmir, transparansi infaq, keterbukaan informasi" },
  { key: "RAMAH_DIFABEL", label: "Ramah Difabel & Lansia", desc: "Akses kursi roda, handrail tangga, toilet ramah disabilitas" },
  { key: "ECO_MOSQUE", label: "Eco-Mosque (Lingkungan)", desc: "Penghematan air wudhu, efisiensi listrik, penanganan sampah" },
  { key: "KEAMANAN", label: "Keamanan & Parkir", desc: "Penataan motor/mobil, penitipan barang, penerangan area" },
  { key: "LAINNYA", label: "Aspirasi Lainnya", desc: "Ide kreatif dan masukan kemajuan masjid kampus" },
];

export default function FeedbackSection() {
  const [activeView, setActiveView] = useState<"FORM" | "LIST">("FORM");
  const [targetMosque, setTargetMosque] = useState(MOSQUE_OPTIONS[0]);
  const [category, setCategory] = useState<FeedbackCategory>("RIAYAH");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<MosqueFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Public responses feed
  const [publicFeedbacks, setPublicFeedbacks] = useState<MosqueFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [filterMosqueFeed, setFilterMosqueFeed] = useState("ALL");

  const fetchPublicFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const url =
        filterMosqueFeed === "ALL"
          ? "/api/feedback?limit=8"
          : `/api/feedback?mosque=${encodeURIComponent(filterMosqueFeed)}&limit=8`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.feedbacks) {
        setPublicFeedbacks(data.feedbacks);
      }
    } catch {
      // Ignore network errors silently for non-critical feed
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchPublicFeedbacks();
  }, [filterMosqueFeed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (message.trim().length < 5) {
      setErrorMessage("Mohon sampaikan masukan minimal 5 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isAnonymous ? "" : name,
          isAnonymous,
          contact: contact.trim(),
          targetMosque,
          category,
          rating,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim masukan.");
      }

      setSuccessData(data.feedback);
      setMessage("");
      setContact("");
      fetchPublicFeedbacks();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kendala saat mengirim data."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return "Perlu Banyak Perbaikan";
      case 2:
        return "Cukup, Masih Kurang";
      case 3:
        return "Standar / Cukup Baik";
      case 4:
        return "Sangat Baik & Nyaman";
      case 5:
        return "Istimewa & Memuaskan";
      default:
        return "";
    }
  };

  const getCategoryBadgeColor = (cat: FeedbackCategory) => {
    switch (cat) {
      case "RIAYAH":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "IMARAH":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IDARAH":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "RAMAH_DIFABEL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ECO_MOSQUE":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "KEAMANAN":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  const getStatusBadge = (status: MosqueFeedback["status"]) => {
    switch (status) {
      case "DITINDAKLANJUTI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Telah Ditindaklanjuti
          </span>
        );
      case "DITINJAU":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Sedang Ditinjau Takmir
          </span>
        );
      case "BARU":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <MessageSquare className="w-3 h-3 text-blue-600" />
            Diterima
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section id="kotak-saran" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#003B73]" />
            <span>Layanan Aspirasi Jamaah Terpadu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
            Kotak Saran &amp; <span className="text-[#003B73]">Aspirasi Jamaah</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Sinergi kebaikan untuk kemajuan 6 masjid kampus percontohan UMS. Setiap masukan, kritik fasilitas, dan usulan dakwah terkumpul langsung di dashboard Pengurus Takmir untuk ditindaklanjuti.
          </p>

          {/* Navigation View Switcher */}
          <div className="inline-flex p-1 bg-stone-200/70 rounded-full mt-6 shadow-inner">
            <button
              onClick={() => setActiveView("FORM")}
              className={`px-5 sm:px-7 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeView === "FORM"
                  ? "bg-[#003B73] text-white shadow-sm"
                  : "text-stone-700 hover:text-stone-950"
              }`}
            >
              Kirim Masukan &amp; Aspirasi
            </button>
            <button
              onClick={() => setActiveView("LIST")}
              className={`px-5 sm:px-7 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeView === "LIST"
                  ? "bg-[#003B73] text-white shadow-sm"
                  : "text-stone-700 hover:text-stone-950"
              }`}
            >
              Aspirasi Jamaah &amp; Tindak Lanjut Takmir
            </button>
          </div>
        </div>

        {/* View 1: Form Input Aspirasi */}
        {activeView === "FORM" && (
          <div className="max-w-3xl mx-auto">
            {successData ? (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-md text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                  Aspirasi Berhasil Terkirim ke Takmir!
                </h3>
                <p className="text-stone-600 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
                  Jazakumullah khairan katsiran. Masukan Anda untuk <strong>{successData.targetMosque}</strong> telah tercatat di sistem admin takmir dan akan segera ditinjau oleh pengurus bidang terkait.
                </p>

                <div className="mt-6 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-left text-xs text-stone-600 space-y-1.5 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="text-stone-500">ID Masukan:</span>
                    <span className="font-mono font-bold text-stone-800">{successData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Masjid Tujuan:</span>
                    <span className="font-semibold text-stone-800">{successData.targetMosque}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Status Awal:</span>
                    <span className="font-semibold text-blue-700">Diterima Pengurus Takmir</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setActiveView("FORM");
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                  >
                    Kirim Aspirasi Lainnya
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("LIST");
                      setSuccessData(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Lihat Respon Takmir
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl p-6 sm:p-9 border border-stone-200/90 shadow-md space-y-6"
              >
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* 1. Pilih Masjid Tujuan */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-2">
                    1. Pilih Masjid Kampus Tujuan <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MOSQUE_OPTIONS.map((mosqueName) => (
                      <button
                        type="button"
                        key={mosqueName}
                        onClick={() => setTargetMosque(mosqueName)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                          targetMosque === mosqueName
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-sm font-semibold"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300"
                        }`}
                      >
                        <Building2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            targetMosque === mosqueName ? "text-amber-300" : "text-stone-400"
                          }`}
                        />
                        <span className="line-clamp-2">{mosqueName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pilih Kategori Masukan */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-2">
                    2. Kategori Aspirasi / Bidang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label} - {cat.desc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Rating Kepuasan / Apresiasi */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-1.5">
                    3. Tingkat Kepuasan &amp; Apresiasi Pelayanan
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 sm:w-7 sm:h-7 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-stone-700">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>
                </div>

                {/* 4. Pesan Saran & Aspirasi */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-900 mb-1.5">
                    4. Isi Saran, Masukan, atau Apresiasi Konstruktif <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan usulan konkret Anda (contoh: usulan penambahan dispenser air minum jamaah, perbaikan kran wudhu di sisi barat, rekomendasi tema kajian mahasiswa, dll)..."
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1">
                    <span>Minimal 5 karakter, maksimal 2.000 karakter</span>
                    <span>{message.length}/2000</span>
                  </div>
                </div>

                {/* 5. Identitas Pengirim (Opsional & Ramah Anonimitas) */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs sm:text-sm font-bold text-stone-900">
                      5. Identitas Jamaah (Opsional)
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-600 hover:text-stone-900">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded border-stone-300 text-[#003B73] focus:ring-[#003B73] w-4 h-4"
                      />
                      <span>Kirim sebagai Anonim / Hamba Allah</span>
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama Lengkap / Panggilan"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="No. WhatsApp / Email (Opsional)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 pl-1">
                          Diisi bila Anda bersedia dihubungi takmir terkait tindak lanjut.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl bg-[#003B73] hover:bg-[#002855] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Mengirim Aspirasi ke Takmir...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Aspirasi Sekarang</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-stone-500 text-center mt-2.5">
                    Data masukan dijaga kerahasiaannya dan hanya dapat diakses oleh Pengurus Takmir Masjid UMS yang berwenang.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {/* View 2: Feed Aspirasi Publik & Respon Takmir */}
        {activeView === "LIST" && (
          <div className="space-y-6">
            {/* Filter Masjid Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setFilterMosqueFeed("ALL")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filterMosqueFeed === "ALL"
                    ? "bg-[#003B73] text-white shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                Semua Masjid Kampus
              </button>
              {MOSQUE_OPTIONS.slice(0, 4).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMosqueFeed(m)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filterMosqueFeed === m
                      ? "bg-[#003B73] text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {m.split(" (")[0]}
                </button>
              ))}
            </div>

            {loadingFeedbacks ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-3 border-[#003B73]/20 border-t-[#003B73] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-stone-500">Memuat aspirasi jamaah...</p>
              </div>
            ) : publicFeedbacks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
                <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-stone-800 font-serif">Belum Ada Masukan Terbuka</h4>
                <p className="text-xs text-stone-500 mt-1">Jadilah yang pertama menyampaikan saran dan apresiasi untuk masjid ini.</p>
                <button
                  onClick={() => setActiveView("FORM")}
                  className="mt-4 px-5 py-2 rounded-full bg-[#003B73] text-white text-xs font-bold"
                >
                  Tulis Aspirasi
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {publicFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Mosque badge & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-[#003B73] bg-[#003B73]/10 px-3 py-1 rounded-full">
                          {fb.targetMosque}
                        </span>
                        {getStatusBadge(fb.status)}
                      </div>

                      {/* User Info & Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-xs font-bold font-mono">
                            {fb.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block leading-tight">
                              {fb.name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(fb.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= fb.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Category Pill */}
                      <div className="mb-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(
                            fb.category
                          )}`}
                        >
                          {CATEGORY_OPTIONS.find((c) => c.key === fb.category)?.label || fb.category}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-4">
                        &ldquo;{fb.message}&rdquo;
                      </p>
                    </div>

                    {/* Takmir Response Box if available */}
                    {fb.adminResponse && (
                      <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Tanggapan Pengurus Takmir
                          </span>
                          {fb.respondedAt && (
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {new Date(fb.respondedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-700 text-[11px] sm:text-xs leading-relaxed italic">
                          {fb.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
