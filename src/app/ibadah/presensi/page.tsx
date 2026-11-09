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
import { calculatePrayerTimes } from "@/lib/prayer-times";

interface MosqueOption {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

const MOSQUES: MosqueOption[] = [
  { id: "sudalmiyah", name: "Masjid Hj. Sudalmiyah Rais", location: "Kampus 2 UMS", lat: -7.5583, lng: 110.7719 },
  { id: "fadhlurrahman", name: "Masjid Fadhlurrahman", location: "Kampus 1 UMS", lat: -7.5587, lng: 110.7766 },
  { id: "mas-mansur", name: "Masjid KH. Mas Mansur", location: "Kampus 4 UMS (Pesma)", lat: -7.5558, lng: 110.7634 },
  { id: "mahad-abu-bakar", name: "Masjid Ma'had Abu Bakar", location: "Kampus 2 UMS", lat: -7.5574, lng: 110.7712 },
  { id: "munajat-shabran", name: "Masjid Al-Munajat", location: "Makamhaji (Pondok Shabran)", lat: -7.5681, lng: 110.7698 },
  { id: "ar-razi", name: "Masjid Ar-Razi FKG", location: "Kampus 4 UMS (FKG)", lat: -7.5549, lng: 110.7645 },
];

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

type PrayerKey = "SUBUH" | "DZUHUR" | "ASHAR" | "MAGHRIB" | "ISYA";

function parseTimeToMinutes(tStr: string): number {
  const [h, m] = tStr.split(":").map(Number);
  return h * 60 + m;
}

export default function ShalatPresensiPage() {
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey>("SUBUH");
  const [currentWibMinutes, setCurrentWibMinutes] = useState<number | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<{
    Subuh: string;
    Dhuha: string;
    Dzuhur: string;
    Ashar: string;
    Maghrib: string;
    Isya: string;
  }>({
    Subuh: "04:03",
    Dhuha: "05:43",
    Dzuhur: "11:23",
    Ashar: "14:33",
    Maghrib: "17:33",
    Isya: "18:44",
  });
  const [selectedMosque, setSelectedMosque] = useState<string>("sudalmiyah");
  const [participantRole, setParticipantRole] = useState<"MAHASISWA" | "DOSEN_KARYAWAN" | "UMUM">("MAHASISWA");
  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [faculty, setFaculty] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wib = new Date(utc + 7 * 3600000);
      const minutes = wib.getHours() * 60 + wib.getMinutes();
      setCurrentWibMinutes(minutes);

      // Hitung jadwal hisab astronomis resmi standar MASA / Tarjih Muhammadiyah (KHGT)
      const calculated = calculatePrayerTimes(wib, "tarjih");
      setPrayerTimes({
        Subuh: calculated.Subuh,
        Dhuha: calculated.Dhuha,
        Dzuhur: calculated.Dzuhur,
        Ashar: calculated.Ashar,
        Maghrib: calculated.Maghrib,
        Isya: calculated.Isya,
      });

      const subuhStart = parseTimeToMinutes(calculated.Subuh);
      const subuhEnd = parseTimeToMinutes(calculated.Dhuha);
      const dzuhurStart = parseTimeToMinutes(calculated.Dzuhur);
      const dzuhurEnd = parseTimeToMinutes(calculated.Ashar);
      const asharStart = parseTimeToMinutes(calculated.Ashar);
      const asharEnd = parseTimeToMinutes(calculated.Maghrib);
      const maghribStart = parseTimeToMinutes(calculated.Maghrib);
      const maghribEnd = parseTimeToMinutes(calculated.Isya);
      const isyaStart = parseTimeToMinutes(calculated.Isya);
      const isyaEnd = 23 * 60 + 59;

      // Pilih otomatis shalat yang sedang aktif; jika di luar jendela, arahkan ke shalat berikutnya
      if (minutes >= subuhStart && minutes <= subuhEnd) {
        setSelectedPrayer("SUBUH");
      } else if (minutes >= dzuhurStart && minutes <= dzuhurEnd) {
        setSelectedPrayer("DZUHUR");
      } else if (minutes >= asharStart && minutes <= asharEnd) {
        setSelectedPrayer("ASHAR");
      } else if (minutes >= maghribStart && minutes <= maghribEnd) {
        setSelectedPrayer("MAGHRIB");
      } else if (minutes >= isyaStart && minutes <= isyaEnd) {
        setSelectedPrayer("ISYA");
      } else {
        if (minutes < subuhStart) setSelectedPrayer("SUBUH");
        else if (minutes < dzuhurStart) setSelectedPrayer("DZUHUR");
        else if (minutes < asharStart) setSelectedPrayer("ASHAR");
        else if (minutes < maghribStart) setSelectedPrayer("MAGHRIB");
        else if (minutes < isyaStart) setSelectedPrayer("ISYA");
        else setSelectedPrayer("SUBUH");
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  type PrayerStatus = "UPCOMING" | "ACTIVE" | "PASSED";

  const getPrayerStatus = (startMinutes: number, endMinutes: number): PrayerStatus => {
    if (currentWibMinutes === null) return "ACTIVE";
    if (currentWibMinutes < startMinutes) return "UPCOMING";
    if (currentWibMinutes > endMinutes) return "PASSED";
    return "ACTIVE";
  };

  const prayersList: Array<{
    key: PrayerKey;
    label: string;
    time: string;
    endTime: string;
    startMinutes: number;
    endMinutes: number;
  }> = [
    {
      key: "SUBUH",
      label: "Shalat Subuh",
      time: prayerTimes.Subuh,
      endTime: prayerTimes.Dhuha,
      startMinutes: parseTimeToMinutes(prayerTimes.Subuh),
      endMinutes: parseTimeToMinutes(prayerTimes.Dhuha),
    },
    {
      key: "DZUHUR",
      label: "Shalat Dzuhur",
      time: prayerTimes.Dzuhur,
      endTime: prayerTimes.Ashar,
      startMinutes: parseTimeToMinutes(prayerTimes.Dzuhur),
      endMinutes: parseTimeToMinutes(prayerTimes.Ashar),
    },
    {
      key: "ASHAR",
      label: "Shalat Ashar",
      time: prayerTimes.Ashar,
      endTime: prayerTimes.Maghrib,
      startMinutes: parseTimeToMinutes(prayerTimes.Ashar),
      endMinutes: parseTimeToMinutes(prayerTimes.Maghrib),
    },
    {
      key: "MAGHRIB",
      label: "Shalat Maghrib",
      time: prayerTimes.Maghrib,
      endTime: prayerTimes.Isya,
      startMinutes: parseTimeToMinutes(prayerTimes.Maghrib),
      endMinutes: parseTimeToMinutes(prayerTimes.Isya),
    },
    {
      key: "ISYA",
      label: "Shalat Isya",
      time: prayerTimes.Isya,
      endTime: "23:59",
      startMinutes: parseTimeToMinutes(prayerTimes.Isya),
      endMinutes: 23 * 60 + 59,
    },
  ];

  const currentPrayerItem = prayersList.find((p) => p.key === selectedPrayer);
  const currentPrayerStatus: PrayerStatus = currentPrayerItem
    ? getPrayerStatus(currentPrayerItem.startMinutes, currentPrayerItem.endMinutes)
    : "UPCOMING";
  const isCurrentPrayerActive = currentPrayerStatus === "ACTIVE";

  // Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  // GPS
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);
  const [locationState, setLocationState] = useState<"IDLE" | "CHECKING" | "LOCATED" | "DENIED">("IDLE");
  const [detectedNearestMosque, setDetectedNearestMosque] = useState<{
    id: string;
    name: string;
    campus: string;
    distance: number;
  } | null>(null);

  const currentMosqueObj = MOSQUES.find((m) => m.id === selectedMosque) || MOSQUES[0];
  const distanceToSelected =
    userLat !== undefined && userLng !== undefined
      ? calculateDistanceMeters(userLat, userLng, currentMosqueObj.lat, currentMosqueObj.lng)
      : null;

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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);

        // Cari masjid kampus UMS terdekat dari koordinat fisik user
        let nearest = MOSQUES[0];
        let minD = calculateDistanceMeters(lat, lng, nearest.lat, nearest.lng);

        for (const m of MOSQUES) {
          const d = calculateDistanceMeters(lat, lng, m.lat, m.lng);
          if (d < minD) {
            minD = d;
            nearest = m;
          }
        }

        setDetectedNearestMosque({
          id: nearest.id,
          name: nearest.name,
          campus: nearest.location,
          distance: minD,
        });

        // Jika terdeteksi di dalam radius toleransi salah satu masjid kampus (<= 250m),
        // otomatis arahkan pilihan masjid ke masjid fisik tersebut
        if (minD <= 250) {
          setSelectedMosque(nearest.id);
        }

        setLocationState("LOCATED");
      },
      (err) => {
        console.error("GPS error:", err);
        setLocationState("DENIED");
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const currentPrayerObj = prayersList.find((p) => p.key === selectedPrayer);
    if (!currentPrayerObj) {
      setSubmitError("Silakan pilih waktu shalat yang sedang aktif.");
      return;
    }

    const prayerStatus = getPrayerStatus(currentPrayerObj.startMinutes, currentPrayerObj.endMinutes);
    if (prayerStatus === "UPCOMING") {
      setSubmitError(
        `Waktu ${currentPrayerObj.label} belum dimulai (Jadwal hisab MASA/Tarjih Muhammadiyah: ${currentPrayerObj.time} WIB). Presensi hanya dapat diisi saat waktu shalat tiba.`
      );
      return;
    }

    if (prayerStatus === "PASSED") {
      setSubmitError(
        `Waktu ${currentPrayerObj.label} telah berakhir / sudah lewat (Batas akhir hisab: ${currentPrayerObj.endTime} WIB). Presensi tidak dapat diisi untuk shalat yang sudah kelewat.`
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

    if (locationState !== "LOCATED" || userLat === undefined || userLng === undefined || distanceToSelected === null) {
      alert("Verifikasi lokasi GPS di kawasan Masjid UMS wajib dilakukan. Silakan klik tombol verifikasi lokasi GPS terlebih dahulu.");
      return;
    }

    // Validasi ketat geofence (maksimal 250 meter dari masjid yang dipilih)
    if (distanceToSelected > 250) {
      if (detectedNearestMosque && detectedNearestMosque.distance <= 250 && detectedNearestMosque.id !== selectedMosque) {
        setSubmitError(
          `Lokasi GPS Anda terdeteksi berada di kawasan ${detectedNearestMosque.name} (${detectedNearestMosque.distance} meter), bukan di ${currentMosqueObj.name} (${distanceToSelected} meter). Silakan ganti pilihan masjid Anda ke ${detectedNearestMosque.name} sesuai lokasi fisik Anda saat ini.`
        );
      } else {
        setSubmitError(
          `Posisi GPS Anda terdeteksi berjarak ${distanceToSelected} meter dari ${currentMosqueObj.name} (melebihi batas toleransi kehadiran 250 meter). Presensi shalat berjamaah wajib dilakukan langsung di lingkungan masjid kampus UMS.`
        );
      }
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
              unoptimized
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
                <span className="font-semibold">
                  Terverifikasi ({successRecord.distanceMeters !== undefined ? `${successRecord.distanceMeters}m dari masjid` : "Kawasan Masjid"})
                </span>
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
                  setDetectedNearestMosque(null);
                  setUserLat(undefined);
                  setUserLng(undefined);
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
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-[11px] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Formulir Absensi Shalat Rawatib 5 Waktu</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Standar Hisab MASA &amp; Tarjih Muhammadiyah (KHGT)</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                Presensi Shalat Berjamaah
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Jadwal shalat otomatis diselaraskan dengan hisab astronomis resmi Majelis Tarjih PP Muhammadiyah (MASA &amp; KHGT) di kawasan UMS. Verifikasi GPS di kawasan masjid UMS wajib dilakukan sebelum mengirimkan data.
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
                  {prayersList.map((p) => {
                    const isSelected = selectedPrayer === p.key;
                    const status = getPrayerStatus(p.startMinutes, p.endMinutes);
                    const isUnlocked = status === "ACTIVE";

                    let statusLabel = p.time;
                    let tooltipText = `${p.label} (Aktif: ${p.time} - ${p.endTime} WIB)`;

                    if (status === "UPCOMING") {
                      statusLabel = `Kunci (${p.time})`;
                      tooltipText = `Waktu ${p.label} belum dimulai (Jadwal Buka: ${p.time} WIB)`;
                    } else if (status === "PASSED") {
                      statusLabel = `Lewat (${p.endTime})`;
                      tooltipText = `Waktu ${p.label} telah berakhir / sudah lewat (Batas hisab: ${p.endTime} WIB)`;
                    }

                    return (
                      <button
                        key={p.key}
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          if (isUnlocked) setSelectedPrayer(p.key);
                        }}
                        title={tooltipText}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative ${
                          !isUnlocked
                            ? status === "PASSED"
                              ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50"
                              : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-md scale-[1.02] cursor-pointer"
                            : "bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-stone-300 cursor-pointer"
                        }`}
                      >
                        {!isUnlocked && (
                          <div className="absolute top-1.5 right-1.5" title={tooltipText}>
                            <Lock className="w-3 h-3 text-stone-400" />
                          </div>
                        )}
                        <span className="font-bold text-xs">{p.label.replace("Shalat ", "")}</span>
                        <span
                          className={`text-[9px] ${
                            !isUnlocked
                              ? "text-stone-400 font-mono"
                              : isSelected
                              ? "text-amber-300 font-mono font-semibold"
                              : "text-stone-500 font-mono"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!isCurrentPrayerActive && currentWibMinutes !== null && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 mt-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        {currentPrayerStatus === "PASSED"
                          ? `Waktu ${currentPrayerItem?.label} telah berakhir / lewat.`
                          : `Waktu ${currentPrayerItem?.label} belum dibuka.`}
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Presensi hanya dapat diisi tepat pada waktu shalat yang sedang aktif sesuai hisab Tarjih Muhammadiyah (KHGT). Shalat yang sudah kelewat atau belum tiba otomatis terkunci.
                      </p>
                    </div>
                  </div>
                )}
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
                      {m.name} ({m.location})
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
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    6. Verifikasi Lokasi di Masjid UMS <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                    Wajib
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Sistem mewajibkan pencocokan koordinat GPS secara akurat ke masjid yang Anda pilih (radius maksimal 250 meter) untuk memastikan kehadiran fisik di masjid.
                </p>

                {locationState === "LOCATED" && distanceToSelected !== null ? (
                  distanceToSelected <= 250 ? (
                    /* Sesuai dan Terverifikasi */
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-emerald-950">
                              Lokasi GPS Terverifikasi Sesuai
                            </div>
                            <div className="text-[11px] text-emerald-800 mt-0.5">
                              Anda berada di <strong>{currentMosqueObj.name}</strong> ({currentMosqueObj.location}).
                            </div>
                            <div className="text-[10px] text-emerald-700 font-mono mt-1">
                              Jarak fisik saat ini: {distanceToSelected} meter (Batas toleransi radius: 250m)
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          title="Deteksi ulang lokasi"
                          className="text-[11px] text-emerald-800 underline hover:text-emerald-950 shrink-0 font-medium cursor-pointer"
                        >
                          Cek Ulang
                        </button>
                      </div>
                    </div>
                  ) : detectedNearestMosque && detectedNearestMosque.distance <= 250 && detectedNearestMosque.id !== selectedMosque ? (
                    /* User berada di masjid UMS lain */
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-900">
                            Lokasi Masjid Tidak Cocok
                          </div>
                          <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                            Anda memilih <strong>{currentMosqueObj.name}</strong> (jarak: {distanceToSelected} meter), namun GPS mendeteksi Anda sedang berada di kawasan <strong>{detectedNearestMosque.name}</strong> (jarak: {detectedNearestMosque.distance} meter).
                          </p>
                        </div>
                      </div>
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMosque(detectedNearestMosque.id)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
                        >
                          Ganti Pilihan ke {detectedNearestMosque.name}
                        </button>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          Cek Ulang GPS
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Di luar semua kawasan masjid */
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-rose-900">
                            Di Luar Kawasan Masjid Kampus UMS
                          </div>
                          <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                            Posisi GPS Anda terdeteksi berjarak <strong>{distanceToSelected} meter</strong> dari {currentMosqueObj.name} (melebihi batas radius presensi 250 meter). Presensi shalat berjamaah wajib dilakukan secara langsung di lingkungan masjid kampus.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        Deteksi Ulang Koordinat GPS
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locationState === "CHECKING"}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#003B73]/5 hover:bg-[#003B73]/10 text-[#003B73] text-xs font-bold border-2 border-dashed border-[#003B73]/40 hover:border-[#003B73] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Navigation className={`w-4 h-4 text-[#003B73] ${locationState === "CHECKING" ? "animate-spin" : ""}`} />
                    <span>{locationState === "CHECKING" ? "Mendeteksi Koordinat GPS dan Mencocokkan Masjid..." : "Klik untuk Verifikasi Lokasi di Masjid UMS * (Wajib)"}</span>
                  </button>
                )}

                {locationState === "DENIED" && (
                  <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Izin akses lokasi (GPS) ditolak atau tidak aktif. Mohon izinkan browser HP Anda mengakses lokasi untuk melanjutkan absensi shalat berjamaah.</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || uploadingPhoto || !isCurrentPrayerActive}
                className={`w-full py-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  !isCurrentPrayerActive
                    ? "bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed"
                    : "bg-[#003B73] hover:bg-[#002855] active:scale-[0.99] text-white cursor-pointer"
                }`}
              >
                {!isCurrentPrayerActive ? (
                  <>
                    <Lock className="w-4 h-4 text-stone-500" />
                    <span>Presensi Terkunci (Di Luar Waktu Shalat Aktif)</span>
                  </>
                ) : isSubmitting ? (
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
