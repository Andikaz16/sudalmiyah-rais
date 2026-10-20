"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  GraduationCap,
  ExternalLink,
  Info,
  CheckCircle2,
  Users,
  Camera,
  ZoomIn,
} from "lucide-react";
import { Agenda } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeImageUrl } from "@/lib/utils";

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
  const { language } = useLanguage();
  const isEn = language === "en";
  const [mounted, setMounted] = useState<boolean>(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

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

  const getCategoryLabel = (cat: string) => {
    if (!isEn) return cat?.replace(/_/g, " ") || "";
    switch (cat) {
      case "SHALAT_JUMAT": return "Friday Prayer";
      case "KAJIAN_MAHASISWA": return "Student Lecture";
      case "TABLIGH_AKBAR": return "Grand Gathering";
      case "TAHSIN": return "Quran Tahsin";
      case "SOSIAL": return "Social & Charity";
      default: return cat?.replace(/_/g, " ") || "";
    }
  };

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
              {getCategoryLabel(agenda.category)}
            </span>
            {agenda.isCompleted ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                <span>{isEn ? "Event Completed" : "Kegiatan Selesai Terlaksana"}</span>
              </span>
            ) : agenda.requiresRegistration ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                {isEn ? "Online Registration Required" : "Pendaftaran Online Mandiri"}
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span>{isEn ? "Attend In Person" : "Hadir Langsung di Masjid"}</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label={isEn ? "Close event details" : "Tutup jendela rincian agenda"}
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
                <span>{isEn ? "View Full Poster" : "Lihat Poster Penuh"}</span>
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

          {/* Laporan Hasil & Dokumentasi Acara (Jika Agenda Sudah Selesai) */}
          {agenda.isCompleted && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 border border-emerald-300/80 shadow-sm space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>{isEn ? "Event Results & Documentation Report" : "Laporan Hasil & Dokumentasi Kegiatan"}</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isEn ? "Status: Completed" : "Status: Terlaksana"}
                </span>
              </div>

              {/* Stat Jamaah Hadir & Foto Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {isEn ? "Total Attendees (Actual)" : "Jumlah Peserta Hadir (Aktual)"}
                    </span>
                    <span className="text-base font-extrabold text-emerald-950">
                      {agenda.actualAttendees
                        ? `${agenda.actualAttendees.toLocaleString(isEn ? "en-US" : "id-ID")} ${isEn ? "Attendees" : "Jamaah"}`
                        : (isEn ? "Completed" : "Selesai Terlaksana")}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-[#003B73] shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {isEn ? "Photo Documentation" : "Dokumentasi Foto"}
                    </span>
                    <span className="text-sm font-extrabold text-stone-800">
                      {agenda.documentationPhotos?.length
                        ? `${agenda.documentationPhotos.length} ${isEn ? "Photos Available" : "Foto Tersedia"}`
                        : (isEn ? "Documentation Saved" : "Dokumentasi Tersimpan")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary / Ringkasan Acara */}
              {agenda.summaryNote && (
                <div className="p-3.5 rounded-2xl bg-white/90 border border-emerald-200/80 text-xs text-stone-700 leading-relaxed">
                  <span className="font-bold text-emerald-950 block mb-1">
                    {isEn ? "Execution Summary:" : "Ringkasan Pelaksanaan:"}
                  </span>
                  <p>{agenda.summaryNote}</p>
                </div>
              )}

              {/* Galeri Foto Dokumentasi */}
              {agenda.documentationPhotos && agenda.documentationPhotos.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isEn ? "Event Photo Gallery:" : "Galeri Foto Hasil Kegiatan:"}</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {agenda.documentationPhotos.map((photoUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setPreviewPhoto(photoUrl)}
                        className="relative h-28 sm:h-32 rounded-2xl overflow-hidden bg-stone-900 border border-emerald-200 group/item cursor-pointer shadow-2xs hover:shadow-md transition-all"
                        title={isEn ? "Click to enlarge photo" : "Klik untuk memperbesar foto dokumentasi"}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeImageUrl(photoUrl)}
                          alt={`Dokumentasi kegiatan ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-1.5 rounded-full bg-white/90 text-stone-900 shadow-sm">
                            <ZoomIn className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target Audience / Fakultas Terjadwal Section */}
          {agenda.targetAudience && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-200 text-amber-900 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {isEn ? "Scheduled Faculty & Students" : "Fakultas & Peserta Terjadwal"}
                </span>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  {isEn ? "Mandatory Attendance" : "Wajib Hadir"}
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 leading-snug">
                {agenda.targetAudience}
              </p>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                {isEn
                  ? "Students from the respective faculties are required to attend this event as part of LPPIK UMS religious mentoring program."
                  : "Mahasiswa semester yang bersangkutan diwajibkan mengikuti agenda ini sebagai bagian dari program pembinaan keagamaan & mentoring LPPIK UMS."}
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
                {isEn ? "Speaker / Lecturer" : "Pemateri / Narasumber"}
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
                <span>{isEn ? "Day & Date" : "Hari & Tanggal"}</span>
              </div>
              <p className="font-bold text-stone-900 text-sm">
                {agenda.date}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{isEn ? "Time" : "Waktu Kegiatan"}</span>
              </div>
              <p className="font-bold text-stone-900 text-sm">
                {agenda.time}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{isEn ? "Event Location" : "Lokasi Acara"}</span>
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
              <span>{isEn ? "Description & Event Information" : "Deskripsi & Informasi Kegiatan"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2">
              <p>{agenda.description}</p>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-[#FAF8F5] flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isEn ? "Close" : "Tutup"}
          </button>

          {!agenda.isCompleted && agenda.requiresRegistration && onRegisterClick && (
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                onClick={() => onRegisterClick(agenda)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {isEn ? "Book Ticket / Registration" : "Daftar Presensi Tiket"}
              </button>
            </div>
          )}
          {agenda.isCompleted && (
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEn ? "Event Completed" : "Kegiatan Telah Terlaksana"}</span>
            </span>
          )}
        </div>

        {/* Lightbox Preview */}
        {previewPhoto && (
          <div
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setPreviewPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Tutup foto"
              >
                <X className="w-5 h-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(previewPhoto)}
                alt="Dokumentasi foto pembesar"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
