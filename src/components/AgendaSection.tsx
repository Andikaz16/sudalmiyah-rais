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
  ArrowRight,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Agenda, AgendaCategory } from "@/lib/types";
import RegistrationModal from "./RegistrationModal";

export default function AgendaSection() {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);

  const fetchAgendas = async (cat: string) => {
    setLoading(true);
    try {
      const url = cat === "ALL" ? "/api/agendas" : `/api/agendas?category=${cat}`;
      const res = await fetch(url);
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
            Agenda &amp; Kajian <span className="text-[#003B73]">Masjid Sudalmiyah</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Ikuti kegiatan ibadah berjamaah, kajian tematik mahasiswa berkemajuan, serta kelas bimbingan tahsin Al-Qur&apos;an di lingkungan Kampus 2 UMS.
          </p>

          {/* Banner Layar Presensi Live QR Dinamis */}
          <div className="flex justify-center mt-5">
            <Link
              href="/agenda/presensi-live"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#002855] via-[#003B73] to-[#001F3F] text-white text-xs sm:text-sm font-bold shadow-lg border border-amber-400/40 hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300">
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>Layar Presensi Live (Mode Proyektor QR Dinamis 10s)</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Category Filter Tabs (Wrapping responsif agar semua terlihat utuh di mobile tanpa scrollbar) */}
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

        {/* Agenda Cards Grid (Matching reference 3-column card cards) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, i) => (
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
            {agendas.map((item) => {
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
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100">
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
                        {item.requiresRegistration ? (
                          <span className="text-[10px] text-white bg-[#B58A1E] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Wajib Registrasi
                          </span>
                        ) : (
                          <span className="text-[10px] text-white bg-blue-700 font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            Terbuka Umum
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#003B73] transition-colors line-clamp-2 mb-3 font-serif">
                        {item.title}
                      </h3>

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

                {/* Action Button */}
                <div className="p-6 pt-0 space-y-2">
                  {item.requiresRegistration ? (
                    <button
                      onClick={() => setSelectedAgenda(item)}
                      disabled={isFull || !item.isOpen}
                      className={`w-full text-center px-4 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isFull
                          ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                          : "bg-[#003B73] hover:bg-[#002855] text-white shadow-md shadow-[#003B73]/15"
                      }`}
                    >
                      {isFull ? "Kuota Penuh" : "Daftar Presensi Tiket"}
                    </button>
                  ) : (
                    <div className="text-center py-2.5 text-xs text-stone-500 font-medium bg-[#FAF8F5] rounded-full border border-stone-200">
                      Silakan Hadir Langsung di Masjid
                    </div>
                  )}

                  <Link
                    href={`/agenda/presensi-live?agendaId=${item.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-full text-xs font-semibold text-[#003B73] bg-[#003B73]/10 hover:bg-[#003B73]/15 border border-[#003B73]/20 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#003B73]" />
                    <span>Layar QR Presensi Acara</span>
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal Dialog */}
      <RegistrationModal
        agenda={selectedAgenda}
        onClose={() => setSelectedAgenda(null)}
        onSuccess={() => fetchAgendas(activeCategory)}
      />
    </section>
  );
}
