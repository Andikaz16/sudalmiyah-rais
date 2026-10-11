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
} from "lucide-react";
import { FacilityBooking } from "@/lib/types";

export default function LayananPage() {
  const [formData, setFormData] = useState({
    applicantName: "",
    organization: "",
    applicantPhone: "",
    nim: "",
    facilityName: "Aula Utama Lt 1" as FacilityBooking["facilityName"],
    eventTitle: "",
    eventDate: "",
    startTime: "08:00",
    endTime: "12:00",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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

      setSuccess("Permohonan peminjaman berhasil diajukan dan sedang ditinjau oleh Takmir.");
      fetchBookings();
      setFormData({
        applicantName: "",
        organization: "",
        applicantPhone: "",
        nim: "",
        facilityName: "Aula Utama Lt 1",
        eventTitle: "",
        eventDate: "",
        startTime: "08:00",
        endTime: "12:00",
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
        {/* Header Banner */}
        <section className="bg-white border-b border-stone-200 py-12 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-block px-4 py-1 rounded-full border border-stone-300 text-stone-600 text-xs font-semibold tracking-wide uppercase mb-3">
              Layanan Kampus Terpadu
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
              Peminjaman Fasilitas & <span className="text-[#0D5C58]">Ruang Masjid</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
              Fasilitas Masjid Sudalmiyah Rais dapat dimanfaatkan untuk kegiatan organisasi otonom Muhammadiyah (IMM), himpunan mahasiswa prodi (HMP), unit kegiatan mahasiswa, serta kajian keislaman kampus.
            </p>
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
                    <span>Formulir Permohonan Izin Tempat</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Silakan isi data lengkap penanggung jawab acara dari sivitas akademika UMS.
                  </p>
                </div>

                {success && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{success}</span>
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
                        Nama Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Ihsan"
                        value={formData.applicantName}
                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        NIM Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: L200210044"
                        value={formData.nim}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm uppercase focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Organisasi / Lembaga
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: IMM Korkom UMS / HMP Informatika"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="081234567890"
                        value={formData.applicantPhone}
                        onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Fasilitas Ruang yang Dipinjam
                    </label>
                    <select
                      value={formData.facilityName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facilityName: e.target.value as FacilityBooking["facilityName"],
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                    >
                      <option value="Aula Utama Lt 1">Aula Utama Serbaguna Lantai 1 (Kapasitas 300 org)</option>
                      <option value="Ruang Rapat Takmir">Ruang Rapat Takmir (Kapasitas 25 org)</option>
                      <option value="Serambi Timur">Serambi Sayap Timur Lt 2 (Bimbingan/Tahsin)</option>
                      <option value="Sound & Multimedia">Peminjaman Sound & Proyektor Multimedia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Kegiatan / Agenda
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pelatihan Kepemimpinan Kader & Kajian Bulanan"
                      value={formData.eventTitle}
                      onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tanggal Acara
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-center px-6 py-3.5 rounded-full bg-[#0D5C58] hover:bg-[#0A4D4A] disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      {loading ? "Mengirim Permohonan..." : "Kirim Permohonan Izin Fasilitas"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Bookings Tracker & Guidelines */}
            <div className="lg:col-span-5 space-y-6">
              {/* Guidelines */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-3 shadow-sm">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <GraduationCap className="w-4 h-4 text-[#B58A1E]" />
                  <span>Ketentuan Penggunaan Fasilitas</span>
                </h3>
                <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-disc list-inside">
                  <li>Kegiatan tidak boleh bertentangan dengan Al-Islam & Kemuhammadiyahan.</li>
                  <li>Wajib menjaga kebersihan wudhu, toilet, dan karpet masjid.</li>
                  <li>Kegiatan dihentikan 15 menit sebelum adzan shalat fardhu berkumandang.</li>
                  <li>Surat permohonan resmi diajukan minimal 3 hari sebelum agenda.</li>
                </ul>
              </div>

              {/* Status List */}
              <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 font-serif">
                  <Calendar className="w-5 h-5 text-[#B58A1E]" />
                  <span>Jadwal Peminjaman Terverifikasi</span>
                </h3>

                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 text-xs">{b.facilityName}</strong>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
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
