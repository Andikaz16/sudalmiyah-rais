"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Camera,
  UploadCloud,
  X,
  User,
  GraduationCap,
  Building2,
  Calendar,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Share2,
  Lock,
} from "lucide-react";

interface MosqueOption {
  id: string;
  name: string;
}

const MOSQUES: MosqueOption[] = [
  { id: "sudalmiyah", name: "Masjid Hj. Sudalmiyah Rais" },
  { id: "fadhlurrahman", name: "Masjid Fadhlurrahman" },
  { id: "mas-mansur", name: "Masjid KH. Mas Mansur" },
  { id: "mahad-abu-bakar", name: "Masjid Ma'had Abu Bakar" },
  { id: "ar-razi", name: "Masjid Ar-Razi FKG" },
  { id: "munajat-shabran", name: "Masjid Al-Munajat Pondok Shabran" },
];

type PrayerKey = "SUBUH" | "DZUHUR" | "ASHAR" | "MAGHRIB" | "ISYA";

interface PrayerOption {
  key: PrayerKey;
  label: string;
  timeHint: string;
  startMinutes: number; // minutes from midnight WIB (UTC+7)
  startTimeFormatted: string;
}

const PRAYERS: PrayerOption[] = [
  { key: "SUBUH", label: "Shalat Subuh", timeHint: "04:15 - 05:30 WIB", startMinutes: 4 * 60 + 10, startTimeFormatted: "04:15" },
  { key: "DZUHUR", label: "Shalat Dzuhur", timeHint: "11:35 - 13:00 WIB", startMinutes: 11 * 60 + 30, startTimeFormatted: "11:35" },
  { key: "ASHAR", label: "Shalat Ashar", timeHint: "14:50 - 16:30 WIB", startMinutes: 14 * 60 + 50, startTimeFormatted: "14:50" },
  { key: "MAGHRIB", label: "Shalat Maghrib", timeHint: "17:40 - 18:30 WIB", startMinutes: 17 * 60 + 40, startTimeFormatted: "17:40" },
  { key: "ISYA", label: "Shalat Isya", timeHint: "18:50 - 20:30 WIB", startMinutes: 18 * 60 + 50, startTimeFormatted: "18:50" },
];

function computeWibMinutes(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  return wib.getHours() * 60 + wib.getMinutes();
}

export default function ShalatPresensiPage() {
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>("SUBUH");
  const [currentWibMinutes, setCurrentWibMinutes] = useState<number | null>(null);
  const [selectedMosque, setSelectedMosque] = useState<string>("sudalmiyah");
  const [participantRole, setParticipantRole] = useState<"MAHASISWA" | "DOSEN_KARYAWAN" | "UMUM">("MAHASISWA");
  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [faculty, setFaculty] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const minutes = computeWibMinutes();
      setCurrentWibMinutes(minutes);

      if (minutes >= 18 * 60 + 50) setSelectedPrayer("ISYA");
      else if (minutes >= 17 * 60 + 40) setSelectedPrayer("MAGHRIB");
      else if (minutes >= 14 * 60 + 50) setSelectedPrayer("ASHAR");
      else if (minutes >= 11 * 60 + 30) setSelectedPrayer("DZUHUR");
      else setSelectedPrayer("SUBUH");
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const isPrayerUnlocked = (startMinutes: number): boolean => {
    if (currentWibMinutes === null) return true;
    return currentWibMinutes >= startMinutes;
  };

  // Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // GPS
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [locationState, setLocationState] = useState<"IDLE" | "CHECKING" | "LOCATED" | "DENIED">("IDLE");
  const [locationDistance, setLocationDistance] = useState<number | null>(null);

  // Submit status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successRecord, setSuccessRecord] = useState<{
    ticketCode: string;
    prayerName: string;
    mosqueName: string;
    fullName: string;
    nim?: string;
    attendedAt: string;
    distanceMeters?: number;
  } | null>(null);

  // Compress photo
  const compressPhoto = async (inputFile: File): Promise<File> => {
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const preview = URL.createObjectURL(rawFile);
    setPhotoPreview(preview);
    setUploadingPhoto(true);

    try {
      const file = await compressPhoto(rawFile);
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
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const nowMinutes = computeWibMinutes();
    const currentPrayerObj = PRAYERS.find((p) => p.key === selectedPrayer);
    if (currentPrayerObj && nowMinutes < currentPrayerObj.startMinutes) {
      setSubmitError(
        `Waktu ${currentPrayerObj.label} belum dimulai (jadwal mulai pukul ${currentPrayerObj.startTimeFormatted} WIB). Presensi hanya dapat diisi setelah waktu shalat tiba.`
      );
      return;
    }

    if (!fullName.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    if (participantRole === "MAHASISWA" && !nim.trim()) {
      alert("NIM wajib diisi untuk mahasiswa UMS.");
      return;
    }

    if (!photoUrl) {
      alert("Foto diri atau bukti kehadiran fisik di masjid wajib diunggah.");
      return;
    }

    if (locationState !== "LOCATED" || userLat === undefined || userLng === undefined) {
      alert("Verifikasi lokasi GPS di kawasan Masjid UMS wajib dilakukan. Silakan klik tombol 'Verifikasi Lokasi di Kawasan Masjid UMS' terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/presensi/shalat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prayerName: selectedPrayer,
          mosqueId: selectedMosque,
          fullName: fullName.trim(),
          participantRole,
          nim: participantRole === "MAHASISWA" ? nim.trim().toUpperCase() : undefined,
          faculty: faculty.trim() || undefined,
          phone: phone.trim() || "-",
          photoUrl,
          userLat,
          userLng,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessRecord(data.attendance);
      } else {
        setSubmitError(data.error || "Gagal mencatat presensi shalat.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Terjadi kendala jaringan saat mengirimkan data presensi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#001F3F] text-white py-3.5 px-4 sm:px-6 shadow-md border-b border-blue-950 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/ibadah" className="p-1.5 rounded-full hover:bg-white/10 text-stone-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 relative shrink-0">
            <Image
              src="/images/logo/logo-masjid-white.png"
              alt="Logo Masjid UMS"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-xs sm:text-sm font-serif leading-tight">
              Presensi Shalat Berjamaah
            </h1>
            <p className="text-[10px] text-amber-300 font-medium">
              6 Masjid Kampus Universitas Muhammadiyah Surakarta
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-[11px] font-semibold text-stone-300 hover:text-white px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors hidden sm:inline-block"
        >
          Beranda
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {successRecord ? (
          /* Success Result Card */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Presensi Berhasil Diverifikasi
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif mt-3">
                Alhamdulillah, Kehadiran Tercatat
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Data presensi Shalat {successRecord.prayerName} Anda telah resmi masuk ke basis data takmir masjid kampus UMS.
              </p>
            </div>

            {/* Electronic Ticket Details */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-5 text-left space-y-3 font-sans text-xs">
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Kode Presensi</span>
                <span className="font-mono font-bold text-[#003B73]">{successRecord.ticketCode}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Nama Jamaah</span>
                <span className="font-bold text-stone-900">{successRecord.fullName}</span>
              </div>
              {successRecord.nim && (
                <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">NIM Mahasiswa</span>
                  <span className="font-mono font-semibold text-sky-700">{successRecord.nim}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Waktu Shalat</span>
                <span className="font-bold text-stone-900">Shalat {successRecord.prayerName}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Masjid Kampus</span>
                <span className="font-semibold text-stone-800">{successRecord.mosqueName}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Waktu Presensi</span>
                <span className="font-mono text-stone-700">
                  {new Date(successRecord.attendedAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Jakarta",
                  })}{" "}
                  WIB
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verifikasi GPS</span>
                </span>
                <span className="font-semibold">Terverifikasi di Masjid Kampus</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessRecord(null);
                  setPhotoUrl("");
                  setPhotoPreview("");
                  setLocationState("IDLE");
                }}
                className="w-full py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Presensi Shalat Lainnya
              </button>
              <Link
                href="/ibadah"
                className="w-full py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors border border-stone-300 text-center"
              >
                Kembali ke Ruang Ibadah
              </Link>
            </div>
          </div>
        ) : (
          /* Main Attendance Form */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-5 sm:p-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-[11px] font-bold mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Formulir Absensi Shalat Rawatib 5 Waktu</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                Presensi Shalat Berjamaah
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Silakan pilih waktu shalat dan masjid lokasi Anda berjamaah. Verifikasi GPS di kawasan masjid UMS wajib dilakukan sebelum mengirimkan data.
              </p>
            </div>

            {submitError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Pilih Waktu Shalat */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  1. Pilih Waktu Shalat <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRAYERS.map((p) => {
                    const isSelected = selectedPrayer === p.key;
                    const isUnlocked = isPrayerUnlocked(p.startMinutes);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (isUnlocked) setSelectedPrayer(p.key);
                        }}
                        title={
                          !isUnlocked
                            ? `Waktu ${p.label} belum dimulai (Mulai ${p.startTimeFormatted} WIB)`
                            : p.label
                        }
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative ${
                          !isUnlocked
                            ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-md scale-[1.02] cursor-pointer"
                            : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-stone-300 cursor-pointer"
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute top-1.5 right-1.5" title="Waktu shalat belum tiba">
                            <Lock className="w-3 h-3 text-stone-400" />
                          </div>
                        )}
                        <span className="font-bold text-xs">{p.label.replace("Shalat ", "")}</span>
                        <span
                          className={`text-[9px] ${
                            !isUnlocked
                              ? "text-stone-400 font-mono"
                              : isSelected
                              ? "text-amber-300"
                              : "text-stone-400"
                          }`}
                        >
                          {!isUnlocked ? `Kunci (${p.startTimeFormatted})` : p.timeHint.split(" - ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Pilih Masjid Lokasi Jamaah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  2. Pilih Masjid UMS <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedMosque}
                  onChange={(e) => setSelectedMosque(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#FAF8F5] border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#003B73]"
                >
                  {MOSQUES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Peran Jamaah */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  3. Kategori Jamaah <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "MAHASISWA", label: "Mahasiswa UMS", icon: GraduationCap },
                    { id: "DOSEN_KARYAWAN", label: "Dosen / Tendik", icon: Building2 },
                    { id: "UMUM", label: "Jamaah Umum", icon: User },
                  ].map((role) => {
                    const isSelected = participantRole === role.id;
                    const IconComp = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setParticipantRole(role.id as any)}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-sm"
                            : "bg-[#FAF8F5] text-stone-600 border-stone-200 hover:border-stone-300 text-xs font-medium"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[11px] leading-tight">{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Form Identitas */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Lengkap <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap sesuai identitas"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                  />
                </div>

                {participantRole === "MAHASISWA" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nomor Induk Mahasiswa (NIM) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: L200210001"
                      value={nim}
                      onChange={(e) => setNim(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#003B73]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Fakultas / Unit Kerja
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: FKI / FK / Pascasarjana"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs sm:text-sm focus:outline-none focus:border-[#003B73]"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Foto Kehadiran di Masjid */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    5. Bukti Foto Kehadiran Shalat <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    Wajib
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Unggah foto selfie atau suasana shalat di masjid sebagai bukti fisik kehadiran.
                </p>

                {photoPreview ? (
                  <div className="relative w-full max-w-xs mx-auto aspect-4/3 rounded-2xl overflow-hidden border-2 border-stone-300 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Pratinjau Kehadiran" className="w-full h-full object-cover" />
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                        <span>Mengompresi dan mengunggah foto...</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl("");
                        setPhotoPreview("");
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100/80 transition-all cursor-pointer">
                    <Camera className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-xs font-bold text-stone-700">Ambil Foto atau Pilih dari Galeri</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG, atau WEBP (Maksimal 15MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {photoError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{photoError}</span>
                  </p>
                )}
              </div>

              {/* 6. Verifikasi Lokasi GPS (Wajib) */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    6. Verifikasi Lokasi di Masjid UMS <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    Wajib
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Sistem mewajibkan pencocokan koordinat GPS untuk memastikan Anda berada langsung di lingkungan masjid kampus UMS.
                </p>

                {locationState === "LOCATED" ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Lokasi GPS Terverifikasi</div>
                      <div className="text-[11px] text-emerald-700">
                        Koordinat Anda berhasil divalidasi di kawasan masjid kampus UMS.
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locationState === "CHECKING"}
                    className="w-full py-3 px-4 rounded-2xl bg-[#003B73]/5 hover:bg-[#003B73]/10 text-[#003B73] text-xs font-bold border-2 border-dashed border-[#003B73]/40 hover:border-[#003B73] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Navigation className={`w-4 h-4 text-[#003B73] ${locationState === "CHECKING" ? "animate-spin" : ""}`} />
                    <span>{locationState === "CHECKING" ? "Mendeteksi Koordinat GPS..." : "Klik untuk Verifikasi Lokasi di Masjid UMS * (Wajib)"}</span>
                  </button>
                )}

                {locationState === "DENIED" && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Izin akses lokasi (GPS) ditolak atau tidak aktif. Mohon izinkan browser HP Anda mengakses lokasi untuk melanjutkan absensi shalat.</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || uploadingPhoto}
                className="w-full py-4 rounded-2xl bg-[#003B73] hover:bg-[#002855] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Memproses Presensi Shalat Berjamaah...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Kirim Presensi Shalat {selectedPrayer}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
