"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  User,
  GraduationCap,
  Building,
  Navigation,
  ArrowRight,
  Camera,
  UploadCloud,
  X,
  ImageIcon,
} from "lucide-react";

interface AgendaInfo {
  id: string;
  title: string;
  category: string;
  speaker: string;
  speakerRole: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface AttendanceResult {
  id?: string;
  ticketCode: string;
  fullName: string;
  nim?: string;
  faculty?: string;
  photoUrl?: string;
  agendaTitle: string;
  speaker?: string;
  location?: string;
  date?: string;
  time?: string;
  attendedAt?: string;
  locationVerified?: boolean;
  distanceMeters?: number;
}

function PresensiContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<
    "LOADING" | "EXPIRED" | "INVALID" | "FORM" | "SUBMITTING" | "SUCCESS" | "DUPLICATE"
  >("LOADING");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [agenda, setAgenda] = useState<AgendaInfo | null>(null);

  // Form State
  const [participantRole, setParticipantRole] = useState<"MAHASISWA" | "DOSEN_KARYAWAN" | "UMUM">("MAHASISWA");
  const [fullName, setFullName] = useState<string>("");
  const [nim, setNim] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string>("");
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [locationState, setLocationState] = useState<"IDLE" | "CHECKING" | "LOCATED" | "DENIED">("IDLE");

  // Success Result
  const [attendanceResult, setAttendanceResult] = useState<AttendanceResult | null>(null);
  const [formSecondsLeft, setFormSecondsLeft] = useState<number>(120);

  // Verifikasi token saat halaman pertama kali dimuat
  useEffect(() => {
    if (!token) {
      setStatus("INVALID");
      setErrorMessage("Tautan presensi tidak menyertakan kode token yang valid. Silakan scan ulang kode QR di layar masjid.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/presensi/verify?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.ok && data.valid && data.agenda) {
          setAgenda(data.agenda);
          setStatus("FORM");
        } else {
          if (data.error === "EXPIRED") {
            setStatus("EXPIRED");
            setErrorMessage(
              data.message ||
                "Akses ditutup: Kode QR ini sudah kedaluwarsa (> 10 detik). Kode QR di layar masjid berganti otomatis setiap 10 detik untuk memastikan kehadiran langsung di masjid."
            );
          } else {
            setStatus("INVALID");
            setErrorMessage(data.message || "Kode QR tidak valid atau telah dimanipulasi.");
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("INVALID");
        setErrorMessage("Gagal memverifikasi token presensi. Periksa koneksi internet Anda.");
      }
    };

    verifyToken();
  }, [token]);

  // Countdown timer sesi pengisian form (maksimal 120 detik setelah lolos verifikasi scan)
  useEffect(() => {
    if (status !== "FORM") return;
    const timer = setInterval(() => {
      setFormSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("EXPIRED");
          setErrorMessage("Sesi pengisian formulir presensi telah habis (batas waktu 2 menit). Silakan scan ulang kode QR terbaru yang sedang tayang di layar masjid.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Helper kompresi gambar presensi di browser
  const compressPresensiPhoto = async (inputFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(inputFile);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(inputFile);
              } else {
                const compressedFile = new File([blob], inputFile.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            0.8
          );
        };
        img.onerror = () => resolve(inputFile);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(inputFile);
      reader.readAsDataURL(inputFile);
    });
  };

  // Handler Unggah Foto Presensi
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setPhotoError("");
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimes.includes(rawFile.type)) {
      setPhotoError("Format berkas harus gambar JPG, PNG, atau WEBP.");
      return;
    }

    if (rawFile.size > 15 * 1024 * 1024) {
      setPhotoError("Ukuran foto maksimal 15MB.");
      return;
    }

    // Buat pratinjau lokal
    const previewUrl = URL.createObjectURL(rawFile);
    setPhotoPreview(previewUrl);

    setUploadingPhoto(true);
    try {
      const file = await compressPresensiPhoto(rawFile);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/presensi/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setPhotoUrl(data.url);
      } else {
        setPhotoError(data.error || "Gagal mengunggah foto. Silakan coba lagi.");
        setPhotoPreview("");
        setPhotoUrl("");
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setPhotoError("Terjadi kendala jaringan saat mengunggah foto.");
      setPhotoPreview("");
      setPhotoUrl("");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    setPhotoPreview("");
    setPhotoError("");
  };

  // Deteksi lokasi koordinat pengguna (opsional)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("DENIED");
      return;
    }

    setLocationState("CHECKING");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationState("LOCATED");
      },
      () => {
        setLocationState("DENIED");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (participantRole === "MAHASISWA" && !nim.trim()) {
      alert("NIM wajib diisi untuk mahasiswa UMS.");
      return;
    }

    if (!photoUrl) {
      alert("Foto diri atau bukti kehadiran fisik wajib diunggah.");
      return;
    }

    setStatus("SUBMITTING");

    try {
      const res = await fetch("/api/presensi/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          fullName: fullName.trim(),
          participantRole,
          nim: participantRole === "MAHASISWA" ? nim.trim().toUpperCase() : undefined,
          faculty: faculty.trim() || undefined,
          photoUrl,
          userLat,
          userLng,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAttendanceResult(data.attendance);
        setStatus("SUCCESS");
      } else if (res.status === 409 && data.isDuplicate) {
        setAttendanceResult(data.attendance);
        setErrorMessage(data.error);
        setStatus("DUPLICATE");
      } else {
        if (data.errorCode === "EXPIRED") {
          setStatus("EXPIRED");
          setErrorMessage(data.error || "Waktu pengisian formulir telah melebihi batas. Silakan scan ulang kode QR terbaru di layar.");
        } else {
          alert(data.error || "Gagal mencatat presensi.");
          setStatus("FORM");
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Terjadi kendala jaringan saat mengirim data presensi.");
      setStatus("FORM");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Mobile-Friendly Top Bar */}
      <header className="bg-[#001F3F] text-white py-3.5 px-4 sm:px-6 shadow-md border-b border-blue-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
            <Image
              src="/images/logo/logo-masjid-white.png"
              alt="Logo Masjid UMS"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base font-serif leading-tight">
              Presensi Kegiatan Masjid UMS
            </h1>
            <p className="text-[10px] text-amber-300 font-medium">
              Sistem Kehadiran Digital Resmi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Sesi Aktif</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* VIEW 1: LOADING STATE */}
        {status === "LOADING" && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 text-center shadow-lg space-y-4">
            <RefreshCw className="w-10 h-10 animate-spin text-[#003B73] mx-auto" />
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
              Memverifikasi Keabsahan Kode QR...
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              Sistem sedang memeriksa tanda tangan digital dan usia token untuk memastikan presensi dilakukan langsung di lokasi.
            </p>
          </div>
        )}

        {/* VIEW 2: EXPIRED STATE (KODE QR KEDALUWARSA) */}
        {status === "EXPIRED" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-300 text-center shadow-xl space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold uppercase tracking-wider mb-2 font-mono">
                Akses Ditutup Keras (Batas Waktu 10 Detik Habis)
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                Kode QR Sudah Kedaluwarsa
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 leading-relaxed text-left space-y-2">
              <p className="font-semibold text-stone-900">Mengapa akses langsung ditutup?</p>
              <p>
                {errorMessage ||
                  "Kode QR di layar proyektor masjid hanya berlaku maksimal 10 detik dan langsung ditutup secara ketat untuk mencegah kecurangan titip absen melalui pengiriman foto atau tangkapan layar."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Langkah Solusi:</span>
                Silakan arahkan kamera HP Anda langsung ke layar proyektor masjid dan scan kode QR terbaru yang sedang tayang aktif.
              </div>
            </div>

            <Link
              href="/agenda"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#003B73] hover:bg-[#002855] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <span>Kembali ke Halaman Agenda</span>
            </Link>
          </div>
        )}

        {/* VIEW 3: INVALID TOKEN */}
        {status === "INVALID" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 text-center shadow-xl space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold font-serif text-stone-900">
              Tautan Presensi Tidak Valid
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed">
              {errorMessage || "Tautan yang Anda akses tidak memiliki kode keamanan yang terdaftar pada sistem."}
            </p>

            <Link
              href="/agenda"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#003B73] text-white font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              <span>Kembali ke Halaman Agenda</span>
            </Link>
          </div>
        )}

        {/* VIEW 4: ATTENDANCE FORM (TOKEN VALID) */}
        {(status === "FORM" || status === "SUBMITTING") && agenda && (
          <div className="space-y-4 animate-fade-up">
            {/* Event Header Card */}
            <div className="bg-gradient-to-br from-[#002855] to-[#001F3F] text-white p-5 rounded-3xl shadow-lg border border-blue-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono">
                  {agenda.category?.replace(/_/g, " ")}
                </span>
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  QR Valid
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold font-serif text-white leading-snug mb-3">
                {agenda.title}
              </h2>

              <div className="space-y-1.5 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{agenda.date} • {agenda.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{agenda.location}</span>
                </div>
              </div>
            </div>

            {/* Form Input Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Sisa Waktu Sesi Pengisian:</span>
                </div>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    formSecondsLeft <= 30
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-amber-200 text-amber-950"
                  }`}
                >
                  {formSecondsLeft} detik
                </span>
              </div>

              <h3 className="text-base font-bold font-serif text-stone-900 mb-1">
                Formulir Presensi Kehadiran
              </h3>
              <p className="text-xs text-stone-500 mb-5">
                Pastikan identitas yang diisikan sesuai untuk verifikasi administrasi kegiatan.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Kategori Peserta
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setParticipantRole("MAHASISWA")}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        participantRole === "MAHASISWA"
                          ? "bg-[#003B73] text-white shadow-sm"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Mahasiswa UMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setParticipantRole("DOSEN_KARYAWAN")}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        participantRole === "DOSEN_KARYAWAN"
                          ? "bg-[#003B73] text-white shadow-sm"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Dosen / Karyawan
                    </button>
                    <button
                      type="button"
                      onClick={() => setParticipantRole("UMUM")}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        participantRole === "UMUM"
                          ? "bg-[#003B73] text-white shadow-sm"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Umum / Jamaah
                    </button>
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent bg-stone-50/50"
                    />
                  </div>
                </div>

                {/* NIM (Khusus Mahasiswa) */}
                {participantRole === "MAHASISWA" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Nomor Induk Mahasiswa (NIM) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={nim}
                        onChange={(e) => setNim(e.target.value.toUpperCase())}
                        placeholder="Contoh: L200210001"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent bg-stone-50/50"
                      />
                    </div>
                  </div>
                )}

                {/* Fakultas / Instansi */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {participantRole === "MAHASISWA" ? "Fakultas / Program Studi" : "Fakultas / Unit Kerja / Asal Instansi"}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder={participantRole === "MAHASISWA" ? "Contoh: FKI / Informatika" : "Contoh: Biro Keuangan / FAI"}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#003B73] focus:border-transparent bg-stone-50/50"
                    />
                  </div>
                </div>

                {/* Upload Foto Mahasiswa / Jamaah (Wajib) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700">
                      Foto Diri / Presensi di Lokasi <span className="text-rose-500 font-bold">* (Wajib)</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">Maks 5MB (JPG/PNG/WEBP)</span>
                  </div>

                  {!photoPreview ? (
                    <label className="relative border-2 border-dashed border-stone-300 hover:border-[#003B73] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-stone-50 group">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003B73] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-stone-800">
                        Ambil Foto Kamera / Pilih Berkas
                      </span>
                      <span className="text-[11px] text-stone-500 mt-1 max-w-xs">
                        Foto selfie langsung di lokasi kegiatan Masjid Hj. Sudalmiyah Rais Kampus 2 UMS
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handlePhotoChange}
                        disabled={uploadingPhoto}
                        className="sr-only"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl border border-stone-200 overflow-hidden bg-stone-900 shadow-inner p-2.5 flex items-center gap-3.5">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-stone-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoPreview}
                          alt="Foto Presensi"
                          className="w-full h-full object-cover"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-stone-950/70 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        {uploadingPhoto ? (
                          <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah foto kehadiran...</span>
                          </div>
                        ) : photoUrl ? (
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Foto Berhasil Diunggah</span>
                            </div>
                            <p className="text-[11px] text-stone-300 truncate">
                              Siap untuk konfirmasi presensi
                            </p>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={uploadingPhoto}
                          className="mt-2 text-[11px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                        >
                          Ganti / Hapus Foto
                        </button>
                      </div>
                    </div>
                  )}

                  {photoError && (
                    <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{photoError}</span>
                    </p>
                  )}
                </div>

                {/* Geolocation Button */}
                <div className="pt-2">
                  {locationState === "LOCATED" ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">Lokasi GPS Terverifikasi di Kawasan Masjid UMS</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locationState === "CHECKING"}
                      className="w-full py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-[#003B73] ${locationState === "CHECKING" ? "animate-spin" : ""}`} />
                      <span>{locationState === "CHECKING" ? "Mendeteksi Koordinat GPS..." : "Verifikasi Lokasi di Masjid UMS (Opsional)"}</span>
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "SUBMITTING"}
                  className="w-full mt-4 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {status === "SUBMITTING" ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                      <span>Memproses Presensi Kehadiran...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-stone-950" />
                      <span>Konfirmasi Kehadiran Saya</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 5: SUCCESS ATTENDANCE TICKET */}
        {status === "SUCCESS" && attendanceResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 text-center shadow-2xl space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Presensi Terverifikasi
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                Kehadiran Berhasil Dicatat!
              </h2>
            </div>

            {/* Digital Pass Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#002855] via-[#001F3F] to-[#001428] text-white text-left space-y-3.5 shadow-lg border border-amber-400/50">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div className="text-xs text-emerald-300 font-bold tracking-wide uppercase">
                    Presensi Berhasil Dicatat
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone-300">
                  <div className="text-[10px] text-stone-400">WAKTU HADIR</div>
                  <div className="font-mono text-emerald-400 font-bold">
                    {attendanceResult.attendedAt
                      ? new Date(attendanceResult.attendedAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "Asia/Jakarta",
                        }) + " WIB"
                      : "Tercatat"}
                  </div>
                </div>
              </div>

              {/* Attendee Info with Photo */}
              <div className="flex items-center gap-3.5">
                {attendanceResult.photoUrl ? (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-stone-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attendanceResult.photoUrl}
                      alt={attendanceResult.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-white">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-0.5 min-w-0">
                  <div className="text-base font-bold text-white font-serif truncate">
                    {attendanceResult.fullName}
                  </div>
                  {attendanceResult.nim && (
                    <div className="text-xs font-mono font-bold text-amber-300">
                      NIM: {attendanceResult.nim} {attendanceResult.faculty ? `• ${attendanceResult.faculty}` : ""}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span>Foto Kehadiran Terverifikasi</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-stone-300 space-y-1">
                <div className="font-semibold text-white">{attendanceResult.agendaTitle}</div>
                <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Masjid Hj. Sudalmiyah Rais Kampus 2 UMS</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Bukti kehadiran ini telah tercatat secara resmi di basis data takmir dan dapat disimpan sebagai bukti kehadiran kegiatan.
            </p>

            <Link
              href="/agenda"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#003B73] hover:bg-[#002855] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <span>Selesai &amp; Kembali ke Halaman Utama</span>
            </Link>
          </div>
        )}

        {/* VIEW 6: DUPLICATE RECORD (SUDAH PERNAH PRESENSI) */}
        {status === "DUPLICATE" && attendanceResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 text-center shadow-xl space-y-5 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold font-serif text-stone-900 leading-tight">
              Anda Sudah Tercatat Hadir
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed">
              {errorMessage || "Data presensi dengan identitas ini sudah tercatat sebelumnya pada agenda ini."}
            </p>

            <div className="p-4 rounded-2xl bg-[#001F3F] text-white text-left text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-stone-400">Status Kehadiran:</span>
                <span className="text-xs font-bold text-emerald-400">Sudah Melakukan Presensi</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {attendanceResult.photoUrl && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-stone-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attendanceResult.photoUrl}
                      alt={attendanceResult.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="font-sans font-bold text-white">{attendanceResult.fullName}</div>
                  <div className="text-[11px] text-stone-300">{attendanceResult.nim ? `NIM ${attendanceResult.nim}` : "Umum"}</div>
                </div>
              </div>
            </div>

            <Link
              href="/agenda"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#003B73] text-white font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              <span>Kembali ke Halaman Agenda</span>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-stone-500 border-t border-stone-200">
        Masjid UMS • Universitas Muhammadiyah Surakarta
      </footer>
    </div>
  );
}

export default function PresensiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-stone-600 text-xs">
          Memuat formulir presensi...
        </div>
      }
    >
      <PresensiContent />
    </Suspense>
  );
}
