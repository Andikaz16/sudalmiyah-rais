"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Projector,
  Presentation,
  Building2,
  MessageSquare,
  Clock,
  Phone,
  ShieldCheck,
  ExternalLink,
  Info,
  ChevronDown,
  ArrowDown,
  Check,
  Users,
} from "lucide-react";
import { FacilityBooking } from "@/lib/types";

export default function LayananPage() {
  const [formData, setFormData] = useState({
    applicantName: "",
    organization: "",
    applicantPhone: "",
    nim: "",
    facilityName: "Paket Proyektor + Papan Layar (Screen)",
    eventTitle: "",
    eventDate: "",
    startTime: "08:00",
    endTime: "12:00",
    letterUrl: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    applicantName: string;
    organization: string;
    applicantPhone: string;
    nim: string;
    facilityName: string;
    eventTitle: string;
    eventDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.bookings) setBookings(json.bookings);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengajukan permohonan.");

      setSuccess("Permohonan peminjaman berhasil diajukan dan sedang menunggu verifikasi/ACC dari Takmir Masjid Kampus UMS.");
      setSubmittedData({ ...formData });
      fetchBookings();
      setFormData({
        applicantName: "",
        organization: "",
        applicantPhone: "",
        nim: "",
        facilityName: "Paket Proyektor + Papan Layar (Screen)",
        eventTitle: "",
        eventDate: "",
        startTime: "08:00",
        endTime: "12:00",
        letterUrl: "",
        notes: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "ALL") return true;
    return b.status === filterStatus;
  });

  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const getBookingIcon = (facilityName: string) => {
    const lower = facilityName.toLowerCase();
    if (lower.includes("proyektor") || lower.includes("lcd")) {
      return <Projector className="w-4 h-4 text-[#003B73]" />;
    }
    if (lower.includes("layar") || lower.includes("papan") || lower.includes("screen")) {
      return <Presentation className="w-4 h-4 text-[#B58A1E]" />;
    }
    return <Building2 className="w-4 h-4 text-emerald-700" />;
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Banner - Presisi & Sesuai Identitas Masjid Kampus UMS */}
        <section className="bg-white border-b border-stone-200/90 py-10 sm:py-14 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-bold uppercase tracking-wider mb-3.5 border border-[#003B73]/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Layanan Civitas &amp; Ormawa Kampus UMS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
              Peminjaman Ruang &amp; <span className="text-[#003B73]">Inventaris Masjid</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-stone-600 mt-3.5 leading-relaxed max-w-3xl mx-auto">
              Layanan permohonan peminjaman fasilitas ruang serta inventaris resmi takmir khusus <strong>Proyektor (LCD)</strong> dan <strong>Papan/Layar Proyektor (Screen)</strong> Masjid Kampus UMS (Masjid Hj. Sudalmiyah Rais &amp; Masjid Fadhlurrahman). Fasilitas ini diperuntukkan bagi Ortom (IMM, HW, Tapak Suci), HMP, UKM, fakultas, dan sivitas akademika UMS untuk mendukung syiar Islam, kajian ilmiah, rapat, dan pelatihan kader persyarikatan.
            </p>

            {/* Quick Actions & Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-semibold">
                <Projector className="w-3.5 h-3.5 text-[#003B73]" />
                <span>Proyektor (LCD)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-semibold">
                <Presentation className="w-3.5 h-3.5 text-[#B58A1E]" />
                <span>Papan / Layar Proyektor</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Aula &amp; Ruang Takmir</span>
              </span>
              <a
                href="#jadwal-terverifikasi"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Lihat Jadwal Terverifikasi</span>
                <ArrowDown className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Section 1: Balanced Grid (Form on Left, Guidelines & Narahubung on Right) */}
        <section id="form-peminjaman" className="py-10 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Form Column (Left: 7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md h-full flex flex-col justify-between">
                <div>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2 font-serif">
                      <FileText className="w-5 h-5 text-[#B58A1E]" />
                      <span>Formulir Permohonan Izin Ruang &amp; Inventaris</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Silakan isi data lengkap penanggung jawab acara dari sivitas akademika UMS.
                    </p>
                  </div>

                  {success && (
                    <div className="mb-6 p-5 sm:p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3.5 text-xs sm:text-sm text-emerald-900 shadow-sm animate-in fade-in">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm sm:text-base text-emerald-950">
                            Permohonan Peminjaman Berhasil Diajukan!
                          </h4>
                          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                            Data permohonan Anda telah tercatat aman di sistem Takmir Masjid Kampus UMS. Sesuai alur resmi Masjid UMS, silakan kirimkan konfirmasi ke narahubung takmir (Mas Faris) agar pengajuan Anda segera diverifikasi dan di-ACC.
                          </p>
                        </div>
                      </div>

                      {submittedData && (
                        <div className="pt-2">
                          <a
                            href={`https://wa.me/6285848601435?text=${encodeURIComponent(
                              `Assalamu'alaikum Mas Faris, saya telah mengajukan permohonan peminjaman di Portal Resmi Masjid Kampus UMS:\n\n` +
                              `• Nama Penanggung Jawab: ${submittedData.applicantName}\n` +
                              `• NIM: ${submittedData.nim}\n` +
                              `• Lembaga / Ortom / UKM: ${submittedData.organization}\n` +
                              `• Fasilitas / Barang: ${submittedData.facilityName}\n` +
                              `• Nama Agenda: ${submittedData.eventTitle}\n` +
                              `• Tanggal: ${submittedData.eventDate} (${submittedData.startTime} - ${submittedData.endTime} WIB)\n\n` +
                              `Mohon untuk dapat ditinjau dan di-ACC. Terima kasih. Jazakallahu khair.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Kirim Konfirmasi ke WA Mas Faris (085848601435)</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-rose-800">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Nama Penanggung Jawab *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Muhammad Ihsan"
                          value={formData.applicantName}
                          onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          NIM Penanggung Jawab *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: L200210044"
                          value={formData.nim}
                          onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm uppercase focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Organisasi / Lembaga *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: IMM Korkom UMS / HMP Informatika / UKM"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Nomor WhatsApp Aktif *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="081234567890 (Untuk konfirmasi takmir)"
                          value={formData.applicantPhone}
                          onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                    </div>

                    {/* Pilihan Fasilitas Ruang & Barang Inventaris (Proyektor + Papan Layar) */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Fasilitas Ruang / Barang Inventaris yang Dipinjam *
                      </label>
                      <select
                        value={formData.facilityName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facilityName: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                      >
                        <optgroup label="Barang Inventaris Masjid (Sesuai Ketentuan Takmir)">
                          <option value="Paket Proyektor + Papan Layar (Screen)">
                            Paket Proyektor (LCD) + Papan/Layar Proyektor (Tripod Screen)
                          </option>
                          <option value="Proyektor (LCD Projector)">
                            Proyektor (LCD Projector Masjid)
                          </option>
                          <option value="Papan / Layar Proyektor (Tripod Screen)">
                            Papan / Layar Proyektor (Tripod Screen Projector)
                          </option>
                        </optgroup>
                        <optgroup label="Fasilitas Ruang Masjid">
                          <option value="Aula Utama Serbaguna Lt 1">
                            Aula Utama Serbaguna Lantai 1 (Kapasitas 300 org)
                          </option>
                          <option value="Ruang Rapat Takmir">
                            Ruang Rapat Takmir Lantai 1 (Kapasitas 25 org)
                          </option>
                          <option value="Serambi Sayap Timur Lt 2">
                            Serambi Sayap Timur Lantai 2 (Kajian / Tahsin)
                          </option>
                        </optgroup>
                        <optgroup label="Paket Ruang + Proyektor & Layar">
                          <option value="Aula Utama Lt 1 + Proyektor & Layar">
                            Aula Utama Serbaguna + Proyektor &amp; Papan Layar
                          </option>
                          <option value="Ruang Rapat Takmir + Proyektor & Layar">
                            Ruang Rapat Takmir + Proyektor &amp; Papan Layar
                          </option>
                          <option value="Sound System & Multimedia Lengkap">
                            Sound System &amp; Fasilitas Multimedia Lengkap
                          </option>
                        </optgroup>
                      </select>
                      <p className="text-[11px] text-stone-500 mt-1">
                        * Sesuai ketentuan takmir, barang inventaris yang diperbolehkan dipinjam khusus <strong>Proyektor (LCD)</strong> dan <strong>Papan / Layar Proyektor</strong>.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Kegiatan / Agenda *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Pelatihan Kepemimpinan Kader & Kajian Bulanan"
                        value={formData.eventTitle}
                        onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Tanggal Acara *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Jam Mulai *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Jam Selesai *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                        />
                      </div>
                    </div>

                    {/* Tautan Surat Permohonan Resmi */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tautan Surat Permohonan Resmi (Google Drive / Dokumen)
                      </label>
                      <input
                        type="url"
                        placeholder="Contoh: https://drive.google.com/file/d/... (Pastikan akses dibuka untuk takmir)"
                        value={formData.letterUrl}
                        onChange={(e) => setFormData({ ...formData, letterUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Tautan surat tersimpan aman di sistem takmir dan tidak dipublikasikan ke pihak luar demi menjaga privasi antar lembaga.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-center px-6 py-3.5 rounded-full bg-[#003B73] hover:bg-[#002855] disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                      >
                        {loading ? "Mengirim Permohonan..." : "Kirim Permohonan Izin Fasilitas & Inventaris"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Guidelines & Contact Column (Right: 5 Cols - Perfectly Balanced in Height) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              {/* Alur Peminjaman Resmi Masjid Kampus UMS */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF8F5] border border-stone-300/80 space-y-3 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <Info className="w-4 h-4 text-[#003B73]" />
                  <span>Alur Peminjaman Masjid Kampus UMS</span>
                </h3>
                <div className="space-y-2.5 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Cek Ketersediaan Jadwal</strong>
                      <span className="text-stone-600">
                        Pastikan tanggal dan waktu belum terisi pada{" "}
                        <a href="#jadwal-terverifikasi" className="text-[#003B73] font-bold underline">
                          jadwal terverifikasi di bawah
                        </a>.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Isi Formulir &amp; Lampirkan Surat</strong>
                      <span className="text-stone-600">Isi data sivitas UMS dan sertakan tautan surat permohonan resmi tertuju ke Takmir.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Konfirmasi Takmir untuk ACC</strong>
                      <span className="text-stone-600">Hubungi narahubung Takmir via WhatsApp agar permohonan segera diproses dan di-ACC.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ketentuan Peminjaman Ruang & Inventaris */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 space-y-2.5 shadow-sm">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <GraduationCap className="w-4 h-4 text-[#B58A1E]" />
                  <span>Ketentuan Penggunaan &amp; Peminjaman</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-600 leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Inventaris yang Boleh Dipinjam:</strong> Khusus inventaris barang, Takmir hanya mengizinkan <strong>Proyektor (LCD)</strong> dan <strong>Papan/Layar Proyektor</strong>.
                  </li>
                  <li>
                    <strong>Tanggung Jawab Alat:</strong> Wajib menjaga keutuhan dan kebersihan proyektor serta mengembalikan tepat waktu setelah acara selesai.
                  </li>
                  <li>
                    <strong>Keselarasan AIK:</strong> Kegiatan wajib selaras dengan nilai Al-Islam &amp; Kemuhammadiyahan.
                  </li>
                  <li>
                    <strong>Waktu Shalat Berjamaah:</strong> Seluruh aktivitas dihentikan 15 menit sebelum adzan shalat fardhu.
                  </li>
                  <li>
                    <strong>Kebersihan Masjid:</strong> Menjaga kebersihan ruang ibadah, karpet, wudhu, dan toilet masjid.
                  </li>
                  <li>
                    <strong>Batas Pengajuan:</strong> Surat diajukan minimal 3 hari sebelum pelaksanaan kegiatan.
                  </li>
                </ul>
              </div>

              {/* Narahubung Takmir Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#002855] to-[#003B73] text-white space-y-2.5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shrink-0">
                    <Phone className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Narahubung Takmir (Konfirmasi &amp; ACC)</h4>
                    <p className="text-xs text-stone-200">Mas Faris (Layanan Peminjaman Masjid UMS)</p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-200 leading-relaxed">
                  Hubungi narahubung takmir setelah mengirim formulir untuk konfirmasi ketersediaan dan percepatan persetujuan (ACC).
                </p>
                <div className="pt-1">
                  <a
                    href="https://wa.me/6285848601435"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp: 085848601435 (Mas Faris)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Jadwal Peminjaman Terverifikasi (Full-Width, Elegant & Zero-Waste Layout) */}
        <section id="jadwal-terverifikasi" className="pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/80">
          <div className="space-y-6">
            {/* Section Header with Stats & Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#B58A1E] text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Sinkronisasi Transparan &amp; Aman</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  Jadwal Peminjaman Terverifikasi
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                  Pantau ketersediaan ruang aula dan inventaris proyektor secara aman tanpa mengekspos isi surat permohonan atau privasi kontak pemohon.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-stone-200 shadow-xs self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === "ALL"
                      ? "bg-[#003B73] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Semua ({bookings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("APPROVED")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === "APPROVED"
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Disetujui ({approvedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PENDING")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === "PENDING"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Menunggu ({pendingCount})
                </button>
              </div>
            </div>

            {/* Bookings Grid Cards */}
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 text-stone-500 max-w-lg mx-auto shadow-xs">
                <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-800">Belum Ada Jadwal Pada Kategori Ini</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Seluruh tanggal masih terbuka untuk diajukan peminjaman ruang atau proyektor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 hover:border-[#003B73]/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Facility Name + Status Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-stone-100 group-hover:bg-[#003B73]/10 transition-colors shrink-0">
                            {getBookingIcon(b.facilityName)}
                          </div>
                          <span className="text-xs font-bold text-stone-900 line-clamp-1">
                            {b.facilityName}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider ${
                            b.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : b.status === "REJECTED"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {b.status === "APPROVED"
                            ? "Disetujui"
                            : b.status === "REJECTED"
                            ? "Ditolak"
                            : "Menunggu Review"}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h4 className="text-sm sm:text-base font-bold text-stone-900 font-serif leading-snug line-clamp-2">
                        {b.eventTitle}
                      </h4>

                      {/* Organization / Applicant */}
                      <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                        <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="line-clamp-1">{b.organization}</span>
                      </div>
                    </div>

                    {/* Card Footer: Date & Time Info */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <div className="flex items-center gap-1.5 font-medium text-stone-700">
                        <Calendar className="w-3.5 h-3.5 text-[#B58A1E]" />
                        <span>{formatDateDisplay(b.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-stone-500">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{b.startTime} - {b.endTime} WIB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
