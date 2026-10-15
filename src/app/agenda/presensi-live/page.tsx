"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ShieldCheck,
  RefreshCw,
  Users,
  Maximize2,
  Minimize2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  ArrowLeft,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface AgendaOption {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  isOpen: boolean;
}

interface AgendaDetail {
  id: string;
  title: string;
  category: string;
  speaker: string;
  speakerRole: string;
  date: string;
  time: string;
  location: string;
  description: string;
  quota: number;
  registeredCount: number;
  attendedCount: number;
}

interface LatestAttendee {
  id: string;
  name: string;
  nim: string | null;
  faculty?: string;
  attendedAt?: string;
}

export default function PresensiLivePage() {
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>("");
  const [agenda, setAgenda] = useState<AgendaDetail | null>(null);
  const [availableAgendas, setAvailableAgendas] = useState<AgendaOption[]>([]);
  const [token, setToken] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [scanUrl, setScanUrl] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [latestAttendees, setLatestAttendees] = useState<LatestAttendee[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update live clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Jakarta",
        }) + " WIB"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch token and generate new QR code
  const fetchNewToken = useCallback(
    async (agendaId?: string) => {
      try {
        setIsRotating(true);
        const targetId = agendaId || selectedAgendaId;
        const res = await fetch(
          `/api/presensi/token${targetId ? `?agendaId=${targetId}` : ""}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (res.ok && data.token) {
          setToken(data.token);
          setAgenda(data.agenda);
          setTotalAttended(data.agenda.attendedCount || 0);

          if (!selectedAgendaId && data.agenda.id) {
            setSelectedAgendaId(data.agenda.id);
          }

          if (data.availableAgendas) {
            setAvailableAgendas(data.availableAgendas);
          }

          // Build scan URL
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          const fullScanUrl = `${origin}/agenda/presensi?token=${data.token}`;
          setScanUrl(fullScanUrl);

          // Generate QR code data URL
          const qrUrl = await QRCode.toDataURL(fullScanUrl, {
            width: 480,
            margin: 2,
            color: {
              dark: "#001F3F",
              light: "#FFFFFF",
            },
            errorCorrectionLevel: "M",
          });
          setQrDataUrl(qrUrl);
          setSecondsLeft(data.intervalSeconds || 10);
        }
      } catch (err) {
        console.error("Failed to generate presensi QR:", err);
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsRotating(false), 400);
      }
    },
    [selectedAgendaId]
  );

  // Poll real-time attendee stats every 4 seconds
  const fetchStats = useCallback(async () => {
    if (!selectedAgendaId) return;
    try {
      const res = await fetch(`/api/presensi/stats?agendaId=${selectedAgendaId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setTotalAttended(data.totalAttended);
        if (data.latestAttendees) {
          setLatestAttendees(data.latestAttendees);
        }
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  }, [selectedAgendaId]);

  // Initial load
  useEffect(() => {
    fetchNewToken();
  }, [fetchNewToken]);

  // Periodic rotation countdown loop
  useEffect(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchNewToken();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [fetchNewToken]);

  // Stats polling interval
  useEffect(() => {
    const statsInterval = setInterval(fetchStats, 4000);
    return () => clearInterval(statsInterval);
  }, [fetchStats]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#001428] text-white flex flex-col font-sans select-none overflow-x-hidden"
    >
      {/* Top Header Bar for Projector / TV */}
      <header className="bg-[#001F3F]/90 border-b border-blue-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-semibold border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Admin</span>
          </Link>

          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 relative flex items-center justify-center shrink-0">
              <Image
                src="/images/logo/logo-masjid-white.png"
                alt="Logo Masjid UMS"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg font-serif leading-tight">
                Presensi Digital Masjid UMS
              </h1>
              <p className="text-[11px] text-amber-300 font-medium">
                Sistem Dynamic Rotating QR Code • Anti-Titip Absen
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-stone-400 font-mono">WAKTU SERVER</div>
            <div className="text-base font-bold font-mono text-emerald-400 tracking-wider">
              {currentTime || "00:00:00 WIB"}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Layar Penuh (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? "Keluar Layar Penuh" : "Mode Proyektor"}</span>
          </button>
        </div>
      </header>

      {/* Main Stage Grid for Projector View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Agenda Selector Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              Pilih Kegiatan Aktif:
            </span>
            <div className="relative">
              <select
                value={selectedAgendaId}
                onChange={(e) => {
                  setSelectedAgendaId(e.target.value);
                  fetchNewToken(e.target.value);
                }}
                className="appearance-none bg-[#002855] text-white text-xs sm:text-sm font-semibold pl-4 pr-10 py-2 rounded-xl border border-blue-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-md"
              >
                {availableAgendas.map((item) => (
                  <option key={item.id} value={item.id} className="bg-stone-900 text-white">
                    {item.title} ({item.date})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Security Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Enkripsi Token Waktu Aktif (Rotasi 10 Detik)</span>
          </div>
        </div>

        {/* Big Center Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Event Details & Instructions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-gradient-to-br from-[#002855]/80 via-[#001F3F]/80 to-[#001428]/90 p-6 sm:p-8 rounded-3xl border border-blue-800/50 shadow-2xl backdrop-blur-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest font-mono mb-4">
                {agenda?.category?.replace(/_/g, " ") || "KEGIATAN MASJID"}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white leading-tight mb-4">
                {agenda?.title || "Memuat Agenda..."}
              </h2>

              {agenda?.speaker && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                    KH
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{agenda.speaker}</div>
                    <div className="text-[11px] text-stone-300">{agenda.speakerRole}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs sm:text-sm text-stone-300 mb-6">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{agenda?.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{agenda?.time}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{agenda?.location}</span>
                </div>
              </div>
            </div>

            {/* Attendance Counter Card */}
            <div className="p-5 rounded-2xl bg-[#001428]/80 border border-amber-400/40 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Total Presensi Hadir
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse">
                  ● Real-time
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {totalAttended}
                </span>
                <span className="text-xs text-stone-300">Jamaah / Mahasiswa</span>
              </div>

              {/* Latest Attendee Ticker */}
              {latestAttendees.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10 text-xs">
                  <div className="text-[11px] text-stone-400 mb-1 font-semibold">
                    Presensi Terakhir Masuk:
                  </div>
                  <div className="space-y-1">
                    {latestAttendees.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between text-[11px] text-stone-300 bg-white/5 px-2 py-1 rounded"
                      >
                        <span className="font-medium truncate max-w-[150px]">{item.name}</span>
                        <span className="text-stone-400 font-mono text-[10px]">
                          {item.nim || "Umum"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Anti-Joki Assurance Notice */}
            <div className="flex items-start gap-2.5 text-[11px] text-stone-400 leading-snug">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Foto tangkapan layar yang dibagikan ke WhatsApp akan kedaluwarsa otomatis dan tidak dapat digunakan.
              </span>
            </div>
          </div>

          {/* Right Column: Giant Rotating QR Code Display */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white text-stone-900 p-6 sm:p-10 rounded-3xl shadow-2xl border-4 border-amber-400/80 relative overflow-hidden">
            {/* Top QR Label */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#003B73] text-white text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Arahkan Kamera HP ke Layar</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 mt-2">
                Scan Kode QR untuk Mengisi Presensi
              </h3>
            </div>

            {/* Giant QR Canvas Container */}
            <div className="relative p-4 sm:p-6 bg-[#FAF8F5] rounded-3xl border-2 border-stone-300/80 shadow-inner flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center gap-3 text-stone-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#003B73]" />
                  <span className="text-xs font-semibold">Membuat Kode QR Dinamis...</span>
                </div>
              ) : qrDataUrl ? (
                <div className={`relative transition-all duration-300 ${isRotating ? "opacity-60 scale-95" : "opacity-100 scale-100"}`}>
                  <Image
                    src={qrDataUrl}
                    alt="Presensi QR Code"
                    width={340}
                    height={340}
                    className="w-60 h-60 sm:w-76 sm:h-76 md:w-88 md:h-88 object-contain rounded-xl"
                    priority
                  />
                  {/* Central Logo Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#003B73] shadow-md flex items-center justify-center p-2">
                      <Image
                        src="/images/logo/logo-masjid.png"
                        alt="Logo UMS"
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Visual Countdown Progress Ring / Bar */}
              <div className="w-full mt-4 max-w-xs">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-stone-600 flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-[#003B73]" : "text-stone-400"}`} />
                    <span>Pergantian Otomatis:</span>
                  </span>
                  <span className={`font-mono text-sm ${secondsLeft <= 3 ? "text-rose-600 animate-pulse font-extrabold" : "text-[#003B73]"}`}>
                    {secondsLeft} Detik
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      secondsLeft <= 3 ? "bg-rose-500" : "bg-[#003B73]"
                    }`}
                    style={{ width: `${(secondsLeft / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="mt-5 grid grid-cols-3 gap-2 w-full max-w-md text-center text-stone-600 text-[11px] font-medium">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#003B73] block mb-0.5">1. Buka Kamera</span>
                Scan QR di layar ini
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#003B73] block mb-0.5">2. Buka Tautan</span>
                Form presensi resmi
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="font-bold text-[#003B73] block mb-0.5">3. Simpan Bukti</span>
                Kartu hadir terbit
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-6 py-3 border-t border-blue-900/40 text-center text-[11px] text-stone-400 shrink-0">
        Masjid UMS • Universitas Muhammadiyah Surakarta • Sistem Presensi Dinamis Anti-Joki Kehadiran
      </footer>
    </div>
  );
}
