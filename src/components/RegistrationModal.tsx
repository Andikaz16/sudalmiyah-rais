"use client";

import React, { useState } from "react";
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Download,
  Loader2,
} from "lucide-react";
import { Agenda, Registration } from "@/lib/types";

interface RegistrationModalProps {
  agenda: Agenda | null;
  onClose: () => void;
  onSuccess: (registration: Registration) => void;
}

export default function RegistrationModal({
  agenda,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    isUmsStudent: true,
    nim: "",
    faculty: "Fakultas Komunikasi dan Informatika",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<Registration | null>(null);

  if (!agenda) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agendas/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agendaId: agenda.id,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          isUmsStudent: formData.isUmsStudent,
          nim: formData.isUmsStudent ? formData.nim : undefined,
          faculty: formData.isUmsStudent ? formData.faculty : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setTicketResult(data.registration);
      onSuccess(data.registration);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan pada sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-stone-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
          <div>
            <span className="text-[11px] font-semibold text-[#0D5C58] uppercase tracking-wider">
              {ticketResult ? "Tiket Presensi Resmi" : "Formulir Pendaftaran Kegiatan"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 line-clamp-1 font-serif">
              {agenda.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {ticketResult ? (
            /* Ticket Confirmation View */
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs sm:text-sm text-emerald-800 font-medium">
                  Pendaftaran terkonfirmasi. Simpan kode tiket ini untuk verifikasi presensi di lokasi masjid.
                </div>
              </div>

              {/* Digital Boarding Ticket Card */}
              <div className="border-2 border-[#D4AF37]/50 rounded-3xl bg-[#FAF8F5] p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-dashed border-stone-300">
                  <div>
                    <span className="text-[10px] text-[#B58A1E] uppercase tracking-widest font-bold">
                      Masjid Sudalmiyah Rais UMS
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-stone-900 line-clamp-1 font-serif">
                      {ticketResult.agendaTitle}
                    </h4>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-[#0D5C58] shadow-sm">
                    <QrCode className="w-7 h-7" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 border-b border-dashed border-stone-300 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Nama Peserta</span>
                    <strong className="text-stone-900 text-xs">{ticketResult.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Status Jamaah</span>
                    <strong className="text-stone-900 text-xs">
                      {ticketResult.isUmsStudent ? `Mahasiswa UMS (${ticketResult.nim})` : "Jamaah Umum"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Waktu Kegiatan</span>
                    <span className="text-stone-700 text-xs">{agenda.date} ({agenda.time})</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[10px] uppercase font-semibold">Lokasi Acara</span>
                    <span className="text-stone-700 text-xs">{agenda.location}</span>
                  </div>
                </div>

                {/* Ticket Code Display */}
                <div className="pt-4 flex flex-col items-center text-center">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-semibold">
                    Kode Tiket Presensi Digital
                  </span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-[#0D5C58] tracking-wider bg-white px-5 py-2 rounded-xl border border-stone-200 shadow-sm">
                    {ticketResult.ticketCode}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 text-center px-5 py-3 rounded-full bg-[#0D5C58] hover:bg-[#0A4D4A] text-white font-bold text-sm shadow-md transition-colors"
                >
                  Cetak / Unduh Tiket
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Event Meta summary */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#0D5C58]" />
                  <span>
                    Pemateri: <strong>{agenda.speaker}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#0D5C58]" />
                  <span>{agenda.date}</span>
                  <Clock className="w-3.5 h-3.5 text-[#0D5C58] ml-2" />
                  <span>{agenda.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0D5C58]" />
                  <span className="line-clamp-1">{agenda.location}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Sesuai KTP / KTM
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rafli Pratama"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#0D5C58]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alamat Email Aktif
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#0D5C58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#0D5C58]"
                  />
                </div>
              </div>

              {/* UMS Student Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isUmsStudent}
                    onChange={(e) => setFormData({ ...formData, isUmsStudent: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0D5C58] focus:ring-[#0D5C58]"
                  />
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                    <GraduationCap className="w-4 h-4 text-[#B58A1E]" />
                    <span>Saya Mahasiswa Universitas Muhammadiyah Surakarta</span>
                  </div>
                </label>

                {formData.isUmsStudent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1 font-semibold">
                        Nomor Induk Mahasiswa (NIM)
                      </label>
                      <input
                        type="text"
                        required={formData.isUmsStudent}
                        placeholder="Contoh: L200210001"
                        value={formData.nim}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-xs uppercase focus:outline-none focus:border-[#0D5C58]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1 font-semibold">
                        Fakultas
                      </label>
                      <select
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#0D5C58]"
                      >
                        <option value="Fakultas Komunikasi dan Informatika">FKI (Informatika & Ilkom)</option>
                        <option value="Fakultas Teknik">Fakultas Teknik</option>
                        <option value="Fakultas Agama Islam">Fakultas Agama Islam</option>
                        <option value="Fakultas Kedokteran">Fakultas Kedokteran</option>
                        <option value="Fakultas Ekonomi dan Bisnis">FEB</option>
                        <option value="Fakultas Keguruan dan Ilmu Pendidikan">FKIP</option>
                        <option value="Fakultas Farmasi">Fakultas Farmasi</option>
                        <option value="Fakultas Hukum">Fakultas Hukum</option>
                        <option value="Fakultas Psikologi">Fakultas Psikologi</option>
                        <option value="Fakultas Ilmu Kesehatan">FIK</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-center px-5 py-3.5 rounded-full bg-[#0D5C58] hover:bg-[#0A4D4A] disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {loading ? "Memproses Pendaftaran..." : "Konfirmasi & Terbitkan Tiket Presensi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
