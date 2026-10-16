"use client";

import React, { useState } from "react";
import {
  Send,
  Star,
  CheckCircle2,
  Building2,
  User,
  Phone,
} from "lucide-react";
import { FeedbackCategory, MosqueFeedback } from "@/lib/types";

const MOSQUE_OPTIONS = [
  "Masjid Hj. Sudalmiyah Rais",
  "Masjid Fadhlurrahman",
  "Masjid KH. Mas Mansur",
  "Masjid Ma'had Abu Bakar",
  "Masjid Ar-Razi FKG",
  "Masjid Munajat Shabran",
  "Semua Masjid Kampus",
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

  return (
    <section id="kotak-saran" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
            Kotak Saran &amp; <span className="text-[#003B73]">Aspirasi Jamaah</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Sinergi kebaikan untuk kemajuan 6 masjid kampus percontohan UMS. Setiap masukan, kritik fasilitas, dan usulan dakwah terkumpul langsung di dashboard Pengurus Takmir untuk ditindaklanjuti.
          </p>
        </div>

        {/* Form Input Aspirasi Langsung */}
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

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setSuccessData(null)}
                  className="px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
                >
                  Kirim Aspirasi Lainnya
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
                        className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
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
                  Data masukan tersimpan aman dan terhubung langsung ke Dashboard Pengurus Takmir Masjid UMS.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
