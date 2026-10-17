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
  Check,
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Header Banner - Disesuaikan dengan Masjid Kampus UMS */}
        <section className="bg-white border-b border-stone-200 py-12 sm:py-16 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-bold uppercase tracking-wider mb-4 border border-[#003B73]/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Layanan Civitas &amp; Ormawa Kampus UMS</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
              Peminjaman Ruang &amp; <span className="text-[#003B73]">Inventaris Masjid</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-4 leading-relaxed max-w-3xl mx-auto">
              Layanan permohonan peminjaman fasilitas ruang (Aula Utama Serbaguna, Ruang Rapat Takmir, Serambi Sayap Timur) serta inventaris resmi takmir khusus <strong>Proyektor (LCD)</strong> dan <strong>Papan/Layar Proyektor (Screen)</strong> Masjid Kampus UMS (Masjid Hj. Sudalmiyah Rais Kampus 2 &amp; Masjid Fadhlurrahman Kampus 1). Fasilitas ini dapat dimanfaatkan oleh Organisasi Otonom Muhammadiyah (IMM, HW, Tapak Suci), HMP, UKM, fakultas, dan sivitas akademika UMS guna mendukung syiar Islam, kajian ilmiah, rapat koordinasi, serta pelatihan kader persyarikatan.
            </p>

            {/* Quick Badges Info */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-medium">
                <Projector className="w-3.5 h-3.5 text-[#003B73]" />
                <span>Proyektor (LCD)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-medium">
                <Presentation className="w-3.5 h-3.5 text-[#B58A1E]" />
                <span>Papan / Layar Proyektor</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Aula &amp; Ruang Pertemuan</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-stone-200 text-stone-700 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Sistem Terverifikasi Takmir</span>
              </span>
            </div>
          </div>
        </section>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md">
                <div className="mb-6">
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
                      Unggah surat resmi bertanda tangan pimpinan lembaga/ormawa tertuju ke Takmir Masjid Kampus UMS. Tautan surat ini tersimpan aman di database takmir dan tidak dipublikasikan ke pihak luar demi menjaga privasi antar lembaga.
                    </p>
                  </div>

                  <div className="pt-3">
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

            {/* Bookings Tracker & Guidelines */}
            <div className="lg:col-span-5 space-y-6">
              {/* Alur Peminjaman Resmi Masjid Kampus UMS */}
              <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-300/80 space-y-3.5 shadow-xs">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <Info className="w-4 h-4 text-[#003B73]" />
                  <span>Alur Peminjaman Masjid Kampus UMS</span>
                </h3>
                <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Cek Ketersediaan Jadwal</strong>
                      <span className="text-stone-600">Pastikan tanggal dan waktu peminjaman ruang atau proyektor belum terisi pada daftar Jadwal Terverifikasi di bawah.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Isi Formulir &amp; Lampirkan Surat</strong>
                      <span className="text-stone-600">Isi data sivitas akademika UMS dan sertakan tautan surat permohonan resmi tertuju kepada Takmir Masjid Kampus UMS.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-stone-900 block">Konfirmasi Takmir untuk ACC</strong>
                      <span className="text-stone-600">Setelah mengisi form, hubungi narahubung Takmir via WhatsApp agar permohonan Anda segera diverifikasi dan di-ACC.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ketentuan Peminjaman Ruang & Inventaris */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-sm">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <GraduationCap className="w-4 h-4 text-[#B58A1E]" />
                  <span>Ketentuan Penggunaan &amp; Peminjaman</span>
                </h3>
                <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-disc list-inside">
                  <li>
                    <strong>Inventaris yang Boleh Dipinjam:</strong> Khusus barang inventaris, Takmir hanya memperbolehkan peminjaman <strong>Proyektor (LCD)</strong> dan <strong>Papan/Layar Proyektor</strong>.
                  </li>
                  <li>
                    <strong>Tanggung Jawab Alat:</strong> Peminjam wajib menjaga keutuhan, kebersihan, dan keamanan alat serta mengembalikan tepat waktu dalam kondisi prima.
                  </li>
                  <li>
                    <strong>Keselarasan AIK:</strong> Kegiatan tidak boleh bertentangan dengan prinsip Al-Islam &amp; Kemuhammadiyahan (AIK).
                  </li>
                  <li>
                    <strong>Waktu Shalat Berjamaah:</strong> Seluruh aktivitas wajib dihentikan 15 menit sebelum adzan shalat fardhu berkumandang untuk persiapan shalat berjamaah.
                  </li>
                  <li>
                    <strong>Kebersihan Masjid:</strong> Wajib menjaga kebersihan ruang ibadah, karpet, fasilitas wudhu, dan toilet masjid.
                  </li>
                  <li>
                    <strong>Batas Pengajuan:</strong> Surat permohonan resmi diajukan minimal 3 hari sebelum waktu pelaksanaan agenda.
                  </li>
                </ul>
              </div>

              {/* Narahubung Takmir Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#002855] to-[#003B73] text-white space-y-3 shadow-md">
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
                  Hubungi narahubung takmir setelah mengirimkan formulir untuk konfirmasi ketersediaan dan percepatan persetujuan (ACC).
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

              {/* Jadwal Peminjaman Terverifikasi (Aman & Terbuka) */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                    <Calendar className="w-5 h-5 text-[#B58A1E]" />
                    <span>Jadwal Terverifikasi</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                    Real-time
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 leading-snug">
                  Daftar jadwal disinkronkan secara aman untuk memantau ketersediaan tanpa mengekspos isi surat atau privasi pemohon.
                </p>

                {bookings.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400">
                    Belum ada jadwal peminjaman saat ini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-stone-900 text-xs line-clamp-1">{b.facilityName}</strong>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                              b.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : b.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {b.status === "APPROVED"
                              ? "Disetujui"
                              : b.status === "REJECTED"
                              ? "Ditolak"
                              : "Menunggu Review"}
                          </span>
                        </div>
                        <div className="text-stone-800 font-medium">{b.eventTitle}</div>
                        <div className="text-stone-500 text-[11px]">
                          {b.organization} • {b.eventDate} ({b.startTime} - {b.endTime} WIB)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
