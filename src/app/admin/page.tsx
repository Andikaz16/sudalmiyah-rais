"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  QrCode,
} from "lucide-react";
import { Agenda, FridayOfficerSchedule, QrisSettings, Registration } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"AGENDAS" | "PETUGAS_JUMAT" | "QRIS_INFAQ" | "REGISTRATIONS">("AGENDAS");
  const [stats, setStats] = useState<{
    totalAgendas: number;
    totalRegistrations: number;
    pendingBookings: number;
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
  } | null>(null);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  // Friday officer schedule state
  const [fridaySchedule, setFridaySchedule] = useState<FridayOfficerSchedule | null>(null);
  const [savingFriday, setSavingFriday] = useState(false);
  const [uploadingKhatibPhoto, setUploadingKhatibPhoto] = useState(false);
  const [fridaySaveSuccess, setFridaySaveSuccess] = useState(false);

  // QRIS Infaq state
  const [qrisSettings, setQrisSettings] = useState<QrisSettings | null>(null);
  const [savingQris, setSavingQris] = useState(false);
  const [uploadingQrisImage, setUploadingQrisImage] = useState(false);
  const [qrisSaveSuccess, setQrisSaveSuccess] = useState(false);

  // Modal new agenda state
  const [isNewAgendaOpen, setIsNewAgendaOpen] = useState(false);
  const [newAgenda, setNewAgenda] = useState({
    title: "",
    category: "KAJIAN_MAHASISWA" as Agenda["category"],
    speaker: "",
    speakerRole: "",
    date: "2026-10-15",
    time: "16:00 - 17:30 WIB",
    location: "Aula Serbaguna Lantai 1, Masjid Sudalmiyah Rais",
    description: "",
    quota: 200,
    requiresRegistration: true,
    bannerUrl: "/uploads/agendas/agenda-jumat.jpg",
  });
  const [uploadingAgendaThumbnail, setUploadingAgendaThumbnail] = useState(false);
  const [savingAgenda, setSavingAgenda] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, agendaRes, fridayRes, qrisRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/agendas"),
        fetch("/api/friday-schedule"),
        fetch("/api/qris"),
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        router.push("/auth/login");
        return;
      }

      const statsJson = await statsRes.json();
      const agendaJson = await agendaRes.json();
      const fridayJson = await fridayRes.json();
      const qrisJson = await qrisRes.json();

      setStats(statsJson.stats);
      setAgendas(agendaJson.agendas || []);
      setRegistrations(statsJson.recentRegistrations || []);
      if (fridayJson.success && fridayJson.schedule) {
        setFridaySchedule(fridayJson.schedule);
      }
      if (qrisJson.success && qrisJson.qris) {
        setQrisSettings(qrisJson.qris);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  // Upload Khatib Photo from Media file
  const handleKhatibPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKhatibPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "khatib");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto khatib.");

      if (fridaySchedule) {
        setFridaySchedule({ ...fridaySchedule, khatibPhotoUrl: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto khatib.");
    } finally {
      setUploadingKhatibPhoto(false);
    }
  };

  // Save Friday Schedule Changes
  const handleUpdateFridaySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridaySchedule) return;
    setSavingFriday(true);
    setFridaySaveSuccess(false);
    try {
      const res = await fetch("/api/friday-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fridaySchedule),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jadwal jumat.");

      setFridaySaveSuccess(true);
      setTimeout(() => setFridaySaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan jadwal.");
    } finally {
      setSavingFriday(false);
    }
  };

  // Upload QRIS Image from Media file
  const handleQrisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQrisImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "qris");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar QRIS.");

      if (qrisSettings) {
        setQrisSettings({ ...qrisSettings, imageUrl: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar QRIS.");
    } finally {
      setUploadingQrisImage(false);
    }
  };

  // Save QRIS Settings Changes
  const handleUpdateQrisSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrisSettings) return;
    setSavingQris(true);
    setQrisSaveSuccess(false);
    try {
      const res = await fetch("/api/qris", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qrisSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan QRIS.");

      setQrisSaveSuccess(true);
      setTimeout(() => setQrisSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan QRIS.");
    } finally {
      setSavingQris(false);
    }
  };

  // Upload Agenda Thumbnail from Media file
  const handleAgendaThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAgendaThumbnail(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "agendas");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah thumbnail.");

      setNewAgenda((prev) => ({ ...prev, bannerUrl: data.url }));
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah thumbnail agenda.");
    } finally {
      setUploadingAgendaThumbnail(false);
    }
  };

  // Create New Agenda
  const handleCreateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAgenda(true);
    try {
      const res = await fetch("/api/agendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgenda),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat agenda.");
      setIsNewAgendaOpen(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingAgenda(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans pb-16">
      {/* Top Admin Header */}
      <header className="bg-[#001F3F] border-b border-stone-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-11 h-11 flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <Image
                src="/images/logo/logo-masjid-white.png"
                alt="Logo Masjid UMS"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </Link>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-white font-serif">
                Dashboard Manajemen Takmir
              </h1>
              <p className="text-[11px] text-stone-300">
                Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/agenda/presensi-live"
              target="_blank"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-3.5 py-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Layar Presensi Live</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full border border-stone-600 hidden sm:block transition-colors"
            >
              Lihat Portal Publik
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Cards Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Total Agenda */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Total Agenda
                </span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  {stats.totalAgendas}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Kegiatan aktif
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#003B73]/10 text-[#003B73]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Total Registrations */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Jamaah Terdaftar
                </span>
                <div className="text-2xl font-black text-[#003B73] mt-1 font-mono">
                  {stats.totalRegistrations}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Presensi terverifikasi
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#003B73]/10 text-[#003B73]">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls - Pure Text without Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-stone-200 no-scrollbar">
          <button
            onClick={() => setActiveTab("AGENDAS")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "AGENDAS"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Kelola Agenda & Kajian
          </button>
          <button
            onClick={() => setActiveTab("PETUGAS_JUMAT")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "PETUGAS_JUMAT"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Petugas Shalat & Khatib Pekan Ini
          </button>
          <button
            onClick={() => setActiveTab("QRIS_INFAQ")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "QRIS_INFAQ"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Kelola QRIS Infaq
          </button>
          <button
            onClick={() => setActiveTab("REGISTRATIONS")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "REGISTRATIONS"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Presensi & Tiket Jamaah
          </button>
        </div>

        {/* Tab 1: AGENDAS */}
        {activeTab === "AGENDAS" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">Daftar Agenda Masjid</h2>
                <p className="text-xs text-stone-500 mt-0.5">Kelola jadwal kajian, bimbingan tahsin, dan kegiatan kemahasiswaan dengan thumbnail media</p>
              </div>
              <button
                onClick={() => setIsNewAgendaOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
              >
                Tambah Agenda Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agendas.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Thumbnail Preview */}
                    <div className="relative h-36 w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={item.bannerUrl || "/uploads/agendas/agenda-jumat.jpg"}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="320px"
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#003B73] border border-stone-200">
                          {item.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-center text-xs text-stone-500">
                        <span className="font-mono">{item.date}</span>
                        <span>{item.registeredCount} / {item.quota} Jamaah</span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm line-clamp-2 font-serif">{item.title}</h3>
                      <div className="text-xs text-stone-700 pt-1">
                        <div><strong>Pemateri:</strong> {item.speaker}</div>
                        <div className="text-[11px] text-stone-500">{item.speakerRole}</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 text-[11px] text-stone-400 border-t border-stone-100">
                    {item.time} • {item.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: PETUGAS SHALAT & KHATIB JUMAT */}
        {activeTab === "PETUGAS_JUMAT" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Pengaturan Petugas Shalat & Khatib Pekan Ini
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Perbarui nama khatib, unggah foto khatib dari media perangkat, serta sesuaikan tema khutbah, imam, dan muadzin.
              </p>
            </div>

            {fridaySaveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Perubahan jadwal petugas shalat dan khatib berhasil disimpan dan langsung tayang di beranda.
              </div>
            )}

            {fridaySchedule ? (
              <form onSubmit={handleUpdateFridaySchedule} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Photo & Khatib Highlight */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Photo Preview & Upload Button */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative w-36 h-44 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md bg-stone-100">
                      <Image
                        src={fridaySchedule.khatibPhotoUrl || "/uploads/khatib/prof-sofyan-anif.jpg"}
                        alt="Foto Khatib"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    {/* Media Upload Input */}
                    <label className="cursor-pointer px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold text-center transition-colors shadow-sm">
                      {uploadingKhatibPhoto ? "Mengunggah..." : "Ganti Foto Khatib (Media)"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleKhatibPhotoUpload}
                        disabled={uploadingKhatibPhoto}
                      />
                    </label>
                    <span className="text-[10px] text-stone-400 text-center">Format JPG, PNG, atau WEBP</span>
                  </div>

                  {/* Khatib Fields */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Lengkap Khatib Beserta Gelar
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.khatibName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Contoh: Prof. Dr. Sofyan Anif, M.Si."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jabatan / Instansi Khatib
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.khatibTitle}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                        placeholder="Contoh: Rektor Universitas Muhammadiyah Surakarta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tema / Judul Khutbah Jumat
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.khutbahTheme}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khutbahTheme: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                        placeholder="Contoh: Membangun Integritas Moral di Era Digital"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tanggal Masehi
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.date}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: Jumat, 16 Oktober 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tanggal Hijriyah
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.hijriDate}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, hijriDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: 5 Rabiul Akhir 1448 H"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Waktu Pelaksanaan
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.time}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: 11:35 WIB"
                    />
                  </div>
                </div>

                {/* Imam & Muadzin Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-[#003B73] uppercase tracking-wider block">
                      Petugas Imam Shalat Jumat
                    </span>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Imam
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.imamName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Peran / Tugas
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.imamRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                      Petugas Muadzin Shalat Jumat
                    </span>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Muadzin
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.muadzinName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Peran / Tugas
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.muadzinRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes for Jamaah */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catatan / Himbauan Jamaah
                  </label>
                  <textarea
                    rows={2}
                    value={fridaySchedule.notes || ""}
                    onChange={(e) => setFridaySchedule({ ...fridaySchedule, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                    placeholder="Contoh: Jamaah diimbau hadir lebih awal sebelum adzan berkumandang..."
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingFriday}
                    className="px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50"
                  >
                    {savingFriday ? "Menyimpan Perubahan..." : "Simpan Perubahan Jadwal Jumat"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200">
                Memuat data jadwal jumat...
              </div>
            )}
          </div>
        )}

        {/* Tab: QRIS_INFAQ */}
        {activeTab === "QRIS_INFAQ" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Kelola Gambar & Pengaturan QRIS Infaq
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Unggah gambar QRIS resmi masjid dan sesuaikan informasi penerima merchant untuk jamaah
              </p>
            </div>

            {qrisSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
                Pengaturan dan gambar QRIS berhasil diperbarui serta langsung aktif pada tampilan situs.
              </div>
            )}

            {qrisSettings ? (
              <form onSubmit={handleUpdateQrisSettings} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
                
                {/* QRIS Image & Upload Row */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 space-y-4">
                  <span className="text-[11px] font-bold text-[#003B73] uppercase tracking-wider block">
                    Gambar Kode QRIS Resmi Masjid
                  </span>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Live Preview Frame */}
                    <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-md shrink-0 bg-white flex items-center justify-center p-2">
                      <Image
                        src={qrisSettings.imageUrl || "/images/qris-sudalmiyah.png"}
                        alt="Pratinjau QRIS Masjid"
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/80 to-transparent text-center">
                        <span className="text-[10px] text-white font-semibold">Pratinjau QRIS</span>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1">
                          Unggah Berkas Gambar QRIS Baru (Media)
                        </label>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          Pilih berkas gambar barcode QRIS langsung dari perangkat komputer atau ponsel Anda tanpa perlu mengisi tautan URL manual. Format didukung: PNG, JPG, JPEG, WEBP (maksimal 5MB).
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="inline-block px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95">
                          {uploadingQrisImage ? "Mengunggah Berkas..." : "Pilih Berkas QRIS (Media)"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingQrisImage}
                            onChange={handleQrisImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Lokasi Berkas Aktif:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={qrisSettings.imageUrl}
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merchant Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Merchant QRIS
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisSettings.merchantName}
                      onChange={(e) => setQrisSettings({ ...qrisSettings, merchantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                      placeholder="Contoh: MASJID SUDALMIYAH RAIS UMS"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kode NMID Nasional
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisSettings.nmid}
                      onChange={(e) => setQrisSettings({ ...qrisSettings, nmid: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono"
                      placeholder="Contoh: ID1020260389100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Institusi / Lokasi
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisSettings.institution}
                      onChange={(e) => setQrisSettings({ ...qrisSettings, institution: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: Universitas Muhammadiyah Surakarta"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingQris}
                    className="px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50"
                  >
                    {savingQris ? "Menyimpan Pengaturan..." : "Simpan Pengaturan QRIS"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200">
                Memuat data pengaturan QRIS...
              </div>
            )}
          </div>
        )}

        {/* Tab 3: REGISTRATIONS */}
        {activeTab === "REGISTRATIONS" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">Data Jamaah Terdaftar (Presensi E-Ticket)</h2>
              <p className="text-xs text-stone-500 mt-0.5">Daftar mahasiswa dan jamaah yang memegang tiket barcode kegiatan</p>
            </div>
            <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider bg-[#FAF8F5]">
                      <th className="py-3.5 px-4 font-semibold">Kode Tiket</th>
                      <th className="py-3.5 px-4 font-semibold">Nama Jamaah</th>
                      <th className="py-3.5 px-4 font-semibold">Status Sivitas</th>
                      <th className="py-3.5 px-4 font-semibold">Agenda</th>
                      <th className="py-3.5 px-4 font-semibold">Kontak</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-stone-50">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#003B73]">
                          {reg.ticketCode}
                        </td>
                        <td className="py-3.5 px-4 text-stone-900">{reg.fullName}</td>
                        <td className="py-3.5 px-4 text-stone-700">
                          {reg.isUmsStudent ? (
                            <span className="text-sky-700 font-semibold">
                              Mahasiswa ({reg.nim})
                            </span>
                          ) : (
                            <span className="text-stone-500">Jamaah Umum</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                          {reg.agendaTitle}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 font-mono">
                          {reg.phone}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                            Terkonfirmasi
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Add New Agenda */}
      {isNewAgendaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-4 font-serif">Tambah Agenda Masjid Baru</h3>
            <form onSubmit={handleCreateAgenda} className="space-y-4">
              
              {/* Media Upload for Agenda Thumbnail */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Thumbnail Gambar Agenda (Upload dari Media)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                    <Image
                      src={newAgenda.bannerUrl || "/uploads/agendas/agenda-jumat.jpg"}
                      alt="Pratinjau Thumbnail"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-block px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold transition-colors">
                      {uploadingAgendaThumbnail ? "Mengunggah..." : "Pilih Berkas Media"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAgendaThumbnailUpload}
                        disabled={uploadingAgendaThumbnail}
                      />
                    </label>
                    <p className="text-[10px] text-stone-400">Pilih berkas JPG, PNG, atau WEBP dari perangkat</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  value={newAgenda.title}
                  onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newAgenda.category}
                    onChange={(e) => setNewAgenda({ ...newAgenda, category: e.target.value as Agenda["category"] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  >
                    <option value="SHALAT_JUMAT">Shalat Jumat</option>
                    <option value="KAJIAN_MAHASISWA">Kajian Mahasiswa</option>
                    <option value="TABLIGH_AKBAR">Tabligh Akbar</option>
                    <option value="TAHSIN">Tahsin Al-Qur&apos;an</option>
                    <option value="SOSIAL">Sosial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kapasitas Kuota</label>
                  <input
                    type="number"
                    required
                    value={newAgenda.quota}
                    onChange={(e) => setNewAgenda({ ...newAgenda, quota: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Pemateri</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.speaker}
                    onChange={(e) => setNewAgenda({ ...newAgenda, speaker: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jabatan / Lembaga</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.speakerRole}
                    onChange={(e) => setNewAgenda({ ...newAgenda, speakerRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newAgenda.date}
                    onChange={(e) => setNewAgenda({ ...newAgenda, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.time}
                    onChange={(e) => setNewAgenda({ ...newAgenda, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Ruang</label>
                <input
                  type="text"
                  required
                  value={newAgenda.location}
                  onChange={(e) => setNewAgenda({ ...newAgenda, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  required
                  value={newAgenda.description}
                  onChange={(e) => setNewAgenda({ ...newAgenda, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAgendaOpen(false)}
                  className="px-5 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAgenda || uploadingAgendaThumbnail}
                  className="px-6 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {savingAgenda ? "Menyimpan..." : "Simpan Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
