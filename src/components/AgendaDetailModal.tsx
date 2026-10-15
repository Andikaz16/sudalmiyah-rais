"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Agenda } from "@/lib/types";

interface AgendaDetailModalProps {
  agenda: Agenda | null;
  onClose: () => void;
  onRegisterClick?: (agenda: Agenda) => void;
}

export default function AgendaDetailModal({
  agenda,
  onClose,
  onRegisterClick,
}: AgendaDetailModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (agenda) {
      document.body.style.overflow = "hidden";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [agenda, onClose]);

  if (!agenda || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-stone-800 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#FAF8F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#003B73] text-white">
              {agenda.category?.replace(/_/g, " ")}
            </span>
            {agenda.requiresRegistration ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                Pendaftaran Online Mandiri
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span>Hadir Langsung di Masjid</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup jendela rincian agenda"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Full Poster Display */}
          {agenda.bannerUrl && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-stone-950 flex flex-col items-center justify-center border border-stone-200 shadow-inner group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={agenda.bannerUrl}
                alt={agenda.title}
                className="w-full max-h-[380px] sm:max-h-[440px] object-contain"
              />
              <a
                href={agenda.bannerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm transition-all"
              >
                <span>Lihat Poster Penuh</span>
                <ExternalLink className="w-3 h-3 text-amber-300" />
              </a>
            </div>
          )}

          {/* Event Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif leading-snug">
              {agenda.title}
            </h2>
          </div>

          {/* Target Audience / Fakultas Terjadwal Section */}
          {agenda.targetAudience && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-200 text-amber-900 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Fakultas &amp; Peserta Terjadwal
                </span>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  Wajib Hadir
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 leading-snug">
                {agenda.targetAudience}
              </p>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Mahasiswa semester yang bersangkutan diwajibkan mengikuti agenda ini sebagai bagian dari program pembinaan keagamaan &amp; mentoring LPPIK UMS.
              </p>
            </div>
          )}

          {/* Speaker Card */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#003B73]/10 text-[#003B73] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Pemateri / Narasumber
              </span>
              <div className="text-sm font-bold text-stone-900">
                {agenda.speaker}
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                {agenda.speakerRole}
              </div>
            </div>
          </div>

          {/* Schedule & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Hari &amp; Tanggal</span>
              </div>
              <p className="font-bold text-stone-900 text-sm">
                {agenda.date}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Waktu Kegiatan</span>
              </div>
              <p className="font-bold text-stone-900 text-sm">
                {agenda.time}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Lokasi Acara</span>
              </div>
              <p className="font-bold text-stone-900 text-xs sm:text-sm">
                {agenda.location}
              </p>
            </div>
          </div>

          {/* Event Description & Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-[#003B73]" />
              <span>Deskripsi &amp; Informasi Kegiatan</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2">
              <p>{agenda.description}</p>
            </div>
          </div>

          {/* Attendance Guidance */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                Tata Cara Presensi Kehadiran
              </span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              {agenda.requiresRegistration
                ? "Daftarkan diri Anda secara online untuk mengamankan kuota. Saat hadir di masjid, tunjukkan bukti konfirmasi pendaftaran."
                : "Tidak perlu mendaftar tiket online sebelumnya. Mahasiswa dan jamaah hadir langsung di lokasi masjid dan melakukan scan QR Code dinamis di layar proyektor masjid menggunakan HP saat acara berlangsung."}
            </p>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            {agenda.requiresRegistration ? (
              <button
                onClick={() => onRegisterClick && onRegisterClick(agenda)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Daftar Presensi Tiket
              </button>
            ) : (
              <Link
                href={`/agenda/presensi?agendaId=${agenda.id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Formulir Presensi QR</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
