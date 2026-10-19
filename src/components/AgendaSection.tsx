"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  GraduationCap,
  Eye,
  ArrowRight,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { Agenda, AgendaCategory } from "@/lib/types";
import RegistrationModal from "./RegistrationModal";
import AgendaDetailModal from "./AgendaDetailModal";
import { useLanguage } from "@/context/LanguageContext";

interface AgendaSectionProps {
  isHomePage?: boolean;
  limit?: number;
}

export default function AgendaSection({ isHomePage = false, limit = 3 }: AgendaSectionProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
  const [viewingDetailAgenda, setViewingDetailAgenda] = useState<Agenda | null>(null);

  const fetchAgendas = async (cat: string) => {
    setLoading(true);
    try {
      const cacheBuster = `t=${Date.now()}`;
      const url =
        cat === "ALL"
          ? `/api/agendas?${cacheBuster}`
          : `/api/agendas?category=${cat}&${cacheBuster}`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      const data = await res.json();
      setAgendas(data.agendas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas(activeCategory);

    // Auto-refresh when tab gains focus so edits in /admin immediately show up
    const handleFocus = () => {
      fetchAgendas(activeCategory);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [activeCategory]);

  const categories: Array<{ id: string; label: string }> = [
    { id: "ALL", label: "Semua Kegiatan" },
    { id: "SHALAT_JUMAT", label: "Shalat Jumat" },
    { id: "KAJIAN_MAHASISWA", label: "Kajian Mahasiswa" },
    { id: "TABLIGH_AKBAR", label: "Tabligh Akbar" },
    { id: "TAHSIN", label: "Tahsin Al-Qur'an" },
    { id: "SOSIAL", label: "Sosial" },
  ];

  return (
    <section id="agenda" className="py-10 sm:py-16 bg-[#FAF8F5] text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading Centered */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            {isEn ? (
              <>
                Agendas &amp; Lectures <span className="text-[#003B73]">Sudalmiyah Mosque</span>
              </>
            ) : (
              <>
                Agenda &amp; Kajian <span className="text-[#003B73]">Masjid Sudalmiyah</span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            {isEn
              ? "Join congregational worship, progressive student study circles, and Al-Qur'an tahsin classes at Campus 2 UMS."
              : "Ikuti kegiatan ibadah berjamaah, kajian tematik mahasiswa berkemajuan, serta kelas bimbingan tahsin Al-Qur'an di lingkungan Kampus 2 UMS."}
          </p>
        </div>

        {/* Category Filter Tabs (Hanya ditampilkan pada halaman utama Agenda /agenda) */}
        {!isHomePage && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10 px-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === c.id
                    ? "bg-[#003B73] text-white shadow-md shadow-[#003B73]/15"
                    : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 shadow-2xs"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Agenda Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(isHomePage ? 3 : 6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-stone-100 border border-stone-200 animate-pulse"
              />
            ))}
          </div>
        ) : agendas.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-50 border border-stone-200 text-stone-500">
            Tidak ada agenda untuk kategori ini saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {(isHomePage ? agendas.slice(0, limit) : agendas).map((item) => {
              const quotaPercent = Math.min(
                100,
                Math.round((item.registeredCount / item.quota) * 100)
              );
              const isFull = item.registeredCount >= item.quota;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-stone-200 hover:border-[#D4AF37]/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-xl group"
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div
                      onClick={() => setViewingDetailAgenda(item)}
                      className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer group/thumb"
                      title="Klik untuk melihat detail kegiatan"
                    >
                      <Image
                        src={item.bannerUrl || "/uploads/agendas/agenda-jumat.jpg"}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Top Badges Overlay */}
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-stone-200 text-[#003B73] shadow-sm">
                          {item.category.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        {item.isCompleted ? (
                          <span className="text-[10px] text-white bg-emerald-700 font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                            <span>Selesai / Terlaksana</span>
                          </span>
                        ) : item.requiresRegistration ? (
                          <span className="text-[10px] text-white bg-[#B58A1E] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Wajib Registrasi
                          </span>
                        ) : (
                          <span className="text-[10px] text-white bg-emerald-700 font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Hadir Langsung di Masjid
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-full bg-white text-[#003B73] text-xs font-bold shadow-lg flex items-center gap-1.5">
                          {item.isCompleted ? (
                            <>
                              <Camera className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Lihat Hasil &amp; Foto</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#003B73]" />
                              <span>Buka Detail</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6">
                      {/* Title */}
                      <h3
                        onClick={() => setViewingDetailAgenda(item)}
                        className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#003B73] transition-colors line-clamp-2 mb-3 font-serif cursor-pointer"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {/* Target Audience / Fakultas Terjadwal Callout */}
                      {item.targetAudience && (
                        <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 mb-4 flex items-start gap-2.5">
                          <GraduationCap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                              Fakultas Terjadwal (Wajib):
                            </span>
                            <span className="text-xs font-bold text-stone-900 leading-snug line-clamp-2 block">
                              {item.targetAudience}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Highlight Hasil Kegiatan jika agenda sudah selesai */}
                      {item.isCompleted && (
                        <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 mb-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
                                Hasil Kegiatan:
                              </span>
                              <span className="text-xs font-extrabold text-emerald-900 block">
                                {item.actualAttendees
                                  ? `${item.actualAttendees.toLocaleString("id-ID")} Peserta Hadir`
                                  : "Kegiatan Selesai"}
                              </span>
                            </div>
                          </div>
                          {item.documentationPhotos && item.documentationPhotos.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              {item.documentationPhotos.length} Foto
                            </span>
                          )}
                        </div>
                      )}

                    {/* Speaker Info */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 mb-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#003B73]/10 text-[#003B73] shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          {item.speaker}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {item.speakerRole}
                        </div>
                      </div>
                    </div>

                    {/* Event Meta */}
                    <div className="space-y-2 text-xs text-stone-600 mb-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-stone-400" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                    </div>

                    {/* Quota Progress */}
                    {item.requiresRegistration && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[11px] text-stone-500 mb-1.5 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Kapasitas Terisi</span>
                          </span>
                          <span className="text-stone-700 font-semibold">
                            {item.registeredCount} / {item.quota} Jamaah
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? "bg-rose-500" : "bg-[#003B73]"
                            }`}
                            style={{ width: `${quotaPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 space-y-2.5">
                  {item.isCompleted ? (
                    <button
                      type="button"
                      onClick={() => setViewingDetailAgenda(item)}
                      className="w-full text-center px-4 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white shadow-md shadow-emerald-700/15 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] group/btn"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>Lihat Hasil &amp; Foto Kegiatan</span>
                      <ArrowRight className="w-4 h-4 text-emerald-200 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  ) : item.requiresRegistration ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingDetailAgenda(item)}
                        className="w-full text-center py-2.5 px-3 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-600" />
                        <span>Rincian</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAgenda(item)}
                        disabled={isFull || !item.isOpen}
                        className={`w-full text-center py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isFull
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : "bg-[#003B73] hover:bg-[#002855] text-white shadow-xs"
                        }`}
                      >
                        {isFull ? "Penuh" : "Daftar Tiket"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setViewingDetailAgenda(item)}
                      className="w-full text-center px-4 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#003B73] hover:bg-[#002855] text-white shadow-md shadow-[#003B73]/15 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] group/btn"
                    >
                      <Eye className="w-4 h-4 text-amber-300" />
                      <span>Lihat Detail Kegiatan</span>
                      <ArrowRight className="w-4 h-4 text-amber-300 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  <div className="text-center text-[11px] text-stone-500 font-medium">
                    {item.isCompleted
                      ? "Dokumentasi & Laporan Kehadiran Tersedia"
                      : !item.requiresRegistration
                      ? "Hadir Langsung di Lokasi • Presensi QR di Masjid"
                      : "Pendaftaran Online Mahasiswa Mandiri"}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Tombol Lihat Semua Agenda jika berada di Beranda */}
        {isHomePage && (
          <div className="text-center mt-10">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>{isEn ? "View All Agendas & Lectures" : "Lihat Semua Agenda & Kajian"}</span>
              <span className="text-amber-300">&rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AgendaDetailModal
        agenda={viewingDetailAgenda}
        onClose={() => setViewingDetailAgenda(null)}
        onRegisterClick={(agenda) => {
          setViewingDetailAgenda(null);
          setSelectedAgenda(agenda);
        }}
      />

      {/* Registration Modal Dialog */}
      <RegistrationModal
        agenda={selectedAgenda}
        onClose={() => setSelectedAgenda(null)}
        onSuccess={() => fetchAgendas(activeCategory)}
      />
    </section>
  );
}
