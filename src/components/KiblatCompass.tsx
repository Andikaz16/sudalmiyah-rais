"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Compass, RotateCw, CheckCircle2, Info, Navigation2, Smartphone } from "lucide-react";
import KiblatIcon from "@/components/KiblatIcon";

// Koordinat Resmi Masjid Sudalmiyah Rais UMS:
// Lintang: 7.5583° S (-7.5583), Bujur: 110.7719° E (+110.7719)
// Koordinat Ka'bah Masjidil Haram:
// Lintang: 21.4225° N (+21.4225), Bujur: 39.8262° E (+39.8262)
// Azimut Kiblat dari Utara Sejati: 294.3° (Barat Laut / 24.3° condong dari Barat ke Utara)
const QIBLA_AZIMUTH = 294.3;
const QIBLA_TOLERANCE = 3.5; // Toleransi derajat untuk indikator pas

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
}

export default function KiblatCompass() {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [sensorPermission, setSensorPermission] = useState<"granted" | "denied" | "prompt" | "unsupported">("prompt");
  const [isManualSim, setIsManualSim] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(270); // Default menghadap Barat
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const lastVibrateRef = useRef<number>(0);

  // Sudut hadap aktif (sensor atau manual slider)
  const currentHeading = hasSensor && !isManualSim ? deviceHeading : manualHeading;

  // Sudut relatif penunjuk kiblat terhadap ponsel (0° = tepat lurus ke atas layar ponsel)
  const relativeQiblaAngle = (QIBLA_AZIMUTH - currentHeading + 360) % 360;

  // Cek apakah ponsel sedang mengarah tepat ke kiblat
  const angleDiff = Math.abs((relativeQiblaAngle > 180 ? 360 - relativeQiblaAngle : relativeQiblaAngle));
  const currentlyAligned = angleDiff <= QIBLA_TOLERANCE;

  // Haptic feedback getaran saat tepat menghadap kiblat
  useEffect(() => {
    setIsAligned(currentlyAligned);
    if (currentlyAligned) {
      const now = Date.now();
      if (now - lastVibrateRef.current > 1500) {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([40, 60, 40]);
        }
        lastVibrateRef.current = now;
      }
    }
  }, [currentlyAligned]);

  // Handler orientasi perangkat
  const handleOrientation = useCallback((e: DeviceOrientationEvent | DeviceOrientationEventiOS) => {
    let heading: number | null = null;

    // 1. iOS Safari Webkit Compass Heading (paling akurat)
    const iosEvent = e as DeviceOrientationEventiOS;
    if (typeof iosEvent.webkitCompassHeading === "number" && !isNaN(iosEvent.webkitCompassHeading)) {
      heading = iosEvent.webkitCompassHeading;
    } 
    // 2. Android deviceorientationabsolute / alpha
    else if (typeof e.alpha === "number" && !isNaN(e.alpha)) {
      if ((e as DeviceOrientationEvent & { absolute?: boolean }).absolute || e.alpha !== null) {
        heading = (360 - e.alpha) % 360;
      }
    }

    if (heading !== null && !isNaN(heading)) {
      const rounded = Math.round(heading * 10) / 10;
      setDeviceHeading(rounded);
      setHasSensor(true);
      setSensorPermission("granted");
    }
  }, []);

  // Request Permission untuk iOS 13+
  const requestSensorPermission = async () => {
    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (response === "granted") {
          setSensorPermission("granted");
          window.addEventListener("deviceorientation", handleOrientation as EventListener, true);
        } else {
          setSensorPermission("denied");
          setIsManualSim(true);
        }
      } catch {
        setSensorPermission("denied");
        setIsManualSim(true);
      }
    } else {
      // Perangkat non-iOS / Android biasa langsung pasang listener
      setupSensorListeners();
    }
  };

  const setupSensorListeners = useCallback(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as Record<string, unknown>;

    if ("ondeviceorientationabsolute" in win) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
    } else if ("DeviceOrientationEvent" in win) {
      window.addEventListener("deviceorientation", handleOrientation as EventListener, true);
    } else {
      setSensorPermission("unsupported");
      setIsManualSim(true);
    }
  }, [handleOrientation]);

  useEffect(() => {
    setupSensorListeners();
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
        window.removeEventListener("deviceorientation", handleOrientation as EventListener, true);
      }
    };
  }, [setupSensorListeners, handleOrientation]);

  return (
    <div className="flex flex-col items-center text-center space-y-7 py-2 max-w-3xl mx-auto">
      {/* Title & Coordinate Intro */}
      <div className="space-y-2 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-semibold">
          <KiblatIcon className="w-3.5 h-3.5" />
          <span>Hisab Falak Masjid Sudalmiyah Rais UMS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
          Kompas Arah Kiblat Interaktif
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Koordinat Kampus 2 UMS Surakarta (<strong>7.5583° LS, 110.7719° BT</strong>) mengarah tepat{" "}
          <strong>294.3° Barat Laut</strong> (24.3° dari arah Barat condong ke Utara) menuju Ka'bah di Masjidil Haram Makkah.
        </p>
      </div>

      {/* Sensor Status & Permission Toolbar */}
      <div className="w-full max-w-md flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Smartphone className={`w-4 h-4 ${hasSensor && !isManualSim ? "text-emerald-600" : "text-stone-400"}`} />
          <span>
            Mode:{" "}
            <strong className={hasSensor && !isManualSim ? "text-emerald-700" : "text-amber-700"}>
              {hasSensor && !isManualSim ? "Sensor Kompas Ponsel Aktif" : "Simulasi / Kalibrasi Manual"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!hasSensor && sensorPermission !== "granted" && (
            <button
              onClick={requestSensorPermission}
              className="px-3 py-1 rounded-xl bg-[#003B73] hover:bg-[#002855] text-white font-semibold transition-colors cursor-pointer text-[11px]"
            >
              Aktifkan Sensor Gerak
            </button>
          )}

          <button
            onClick={() => setIsManualSim(!isManualSim)}
            className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors cursor-pointer text-[11px]"
            title="Ganti ke mode slider derajat manual"
          >
            {isManualSim ? "Pakai Sensor" : "Atur Manual"}
          </button>
        </div>
      </div>

      {/* Live Alignment Notification Banner */}
      <div
        className={`w-full max-w-md p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2.5 ${
          isAligned
            ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-md ring-2 ring-emerald-500/30"
            : "bg-stone-100/80 border-stone-200 text-stone-700"
        }`}
      >
        {isAligned ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
            <div className="text-left">
              <span className="font-extrabold text-xs block text-emerald-800">
                Alhamdulillah! Ponsel Tepat Menghadap Kiblat
              </span>
              <span className="text-[11px] text-emerald-700">
                Arah hadap: {currentHeading}° (Selisih hanya {angleDiff.toFixed(1)}° dari 294.3°)
              </span>
            </div>
          </>
        ) : (
          <>
            <Navigation2
              className="w-4 h-4 text-[#003B73] shrink-0"
              style={{ transform: `rotate(${relativeQiblaAngle}deg)` }}
            />
            <div className="text-left text-xs">
              <span className="font-semibold text-stone-800 block">
                {relativeQiblaAngle < 180
                  ? `Putar ponsel ke KANAN sekitar ${relativeQiblaAngle.toFixed(0)}°`
                  : `Putar ponsel ke KIRI sekitar ${(360 - relativeQiblaAngle).toFixed(0)}°`}
              </span>
              <span className="text-[11px] text-stone-500">
                Arah hadap saat ini: {currentHeading.toFixed(1)}° • Arah Kiblat: {QIBLA_AZIMUTH}°
              </span>
            </div>
          </>
        )}
      </div>

      {/* Interactive Compass Graphic from User Artwork (Gambar 1) */}
      <div className="relative flex items-center justify-center my-3">
        {/* Glow halo when aligned */}
        <div
          className={`absolute w-72 h-72 sm:w-84 sm:h-84 rounded-full transition-all duration-500 pointer-events-none ${
            isAligned
              ? "bg-emerald-500/20 blur-xl scale-110"
              : "bg-transparent scale-100"
          }`}
        />

        {/* Outer Dial Container */}
        <div
          className={`relative w-68 h-68 sm:w-80 sm:h-80 rounded-full flex items-center justify-center bg-white p-2.5 transition-all duration-300 ${
            isAligned
              ? "shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500"
              : "shadow-xl border-4 border-stone-200/80"
          }`}
        >
          {/* Compass Dial Image (Rotates with Qibla angle relative to phone) */}
          <div
            className="relative w-full h-full rounded-full transition-transform duration-200 ease-out select-none"
            style={{
              transform: `rotate(${relativeQiblaAngle}deg)`,
            }}
          >
            <Image
              src="/images/compass-qibla.png"
              alt="Kompas Kiblat Sudalmiyah"
              fill
              priority
              className="object-contain drop-shadow-sm"
            />
          </div>

          {/* Top Indicator Arrow on Device (Top of Phone Marker) */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[11px] border-b-[#003B73]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-[#003B73] bg-white/90 px-1.5 py-0.2 rounded-full border border-stone-200 shadow-2xs mt-0.5">
              Depan Ponsel
            </span>
          </div>
        </div>
      </div>

      {/* Manual Heading Slider (Untuk Pengguna Desktop / Non-Sensor) */}
      <div className="w-full max-w-md p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-700 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-[#003B73]" />
            {hasSensor && !isManualSim ? "Sensor Kompas Aktif" : "Uji Putaran Derajat Arah Hadap:"}
          </span>
          <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded-lg border border-stone-200">
            {currentHeading.toFixed(1)}°
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="359"
          step="0.5"
          value={currentHeading}
          disabled={hasSensor && !isManualSim}
          onChange={(e) => {
            setIsManualSim(true);
            setManualHeading(Number(e.target.value));
          }}
          className="w-full accent-[#003B73] h-2 rounded-lg cursor-pointer bg-stone-200 disabled:opacity-60"
        />

        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
          <span>0° (U)</span>
          <span>90° (T)</span>
          <span>180° (S)</span>
          <span className="text-[#003B73] font-bold">294.3° (Kiblat)</span>
          <span>360°</span>
        </div>
      </div>

      {/* Numerical Data Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
            Azimut Kiblat
          </span>
          <span className="text-base font-bold text-[#003B73]">294.3°</span>
          <span className="text-[10px] text-stone-500 block">Barat Laut (U-B)</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
            Arah Hadap Ponsel
          </span>
          <span className="text-base font-bold text-stone-900 font-mono">
            {currentHeading.toFixed(1)}°
          </span>
          <span className="text-[10px] text-stone-500 block">Dari Utara Sejati</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
            Jarak ke Ka'bah
          </span>
          <span className="text-base font-bold text-stone-900">~8.375 km</span>
          <span className="text-[10px] text-stone-500 block">Lengkung Geodesik</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
            Status Akurasi
          </span>
          <span className={`text-xs font-bold block ${isAligned ? "text-emerald-700" : "text-amber-700"}`}>
            {isAligned ? "Tepat Sejajar" : `Selisih ${angleDiff.toFixed(1)}°`}
          </span>
          <span className="text-[10px] text-stone-500 block">Toleransi ±3.5°</span>
        </div>
      </div>

      {/* Petunjuk Penggunaan Praktis */}
      <div className="w-full max-w-2xl p-4 rounded-2xl bg-[#003B73]/5 border border-[#003B73]/20 text-left text-xs space-y-2">
        <h4 className="font-bold text-[#003B73] flex items-center gap-1.5 text-sm">
          <Compass className="w-4 h-4" />
          <span>Panduan Praktis Menentukan Arah Kiblat:</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-stone-700 leading-relaxed">
          <li>Letakkan ponsel mendatar di atas lantai atau telapak tangan secara horizontal.</li>
          <li>Jauhkan dari benda logam, magnet, atau perangkat elektronik besar agar sensor kompas tidak terdistorsi.</li>
          <li>Putar posisi Anda perlahan hingga tanda panah Ka'bah menghadap lurus ke depan dan bingkai kompas menyala hijau.</li>
        </ol>
      </div>

      {/* SEKSI SUMBER DATA & METODOLOGI PERHITUNGAN HISAB FALAK */}
      <div className="w-full max-w-2xl p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm text-left space-y-4 text-xs text-stone-700">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Info className="w-4 h-4 text-[#003B73] shrink-0" />
          <h3 className="font-bold text-stone-900 text-sm font-serif">
            Sumber Data & Metodologi Perhitungan Arah Kiblat
          </h3>
        </div>

        <div className="space-y-3 leading-relaxed">
          <div>
            <h5 className="font-bold text-stone-900 mb-1">1. Otoritas Hisab & Rujukan Resmi:</h5>
            <ul className="list-disc list-inside space-y-0.5 text-stone-600 pl-1">
              <li>
                <strong>Majelis Tarjih dan Tajdid Pimpinan Pusat Muhammadiyah</strong>: Buku Pedoman Hisab Muhammadiyah & Keputusan Muktamar Tarjih mengenai penentuan arah kiblat menggunakan trigonometri bola.
              </li>
              <li>
                <strong>Kementerian Agama Republik Indonesia</strong>: Direktorat Jenderal Bimbingan Masyarakat Islam melalui Sistem Informasi Hisab Rukyat & Verifikasi SiKiblat Kemenag RI.
              </li>
              <li>
                <strong>Standar Geodesi WGS 84 (World Geodetic System 1984)</strong>: Acuan sistem koordinat lintang dan bujur satelit GPS global.
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 mb-1">2. Data Titik Koordinat:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div>
                <span className="font-bold text-[#003B73] block">Titik Awal (Masjid Sudalmiyah Rais UMS):</span>
                <span>• Lintang: 7° 33' 30.0" LS (-7.5583°)</span>
                <br />
                <span>• Bujur: 110° 46' 18.8" BT (+110.7719°)</span>
              </div>
              <div>
                <span className="font-bold text-[#003B73] block">Titik Tujuan (Ka'bah, Makkah):</span>
                <span>• Lintang: 21° 25' 21.0" LU (+21.4225°)</span>
                <br />
                <span>• Bujur: 39° 49' 34.3" BT (+39.8262°)</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 mb-1">3. Rumus Trigonometri Bola (Spherical Trigonometry):</h5>
            <p className="text-stone-600 text-[11px]">
              Dihitung menggunakan formula lingkaran besar (<em>Great-Circle Navigation</em>):
            </p>
            <div className="p-2.5 rounded-xl bg-stone-100 font-mono text-[11px] text-stone-800 text-center my-1.5 border border-stone-200">
              tan Q = sin(Δλ) / (cos φ₁ · tan φ₂ - sin φ₁ · cos Δλ)
            </div>
            <p className="text-[11px] text-stone-500">
              Dengan <strong>Δλ</strong> adalah selisih bujur (110.7719° - 39.8262° = 70.9457°), <strong>φ₁</strong> lintang masjid (-7.5583°), dan <strong>φ₂</strong> lintang Ka'bah (21.4225°).
              Perhitungan menghasilkan nilai <strong>24° 18' dari Barat ke Utara (B-U)</strong> atau ekuivalen dengan azimut kompas <strong>294° 18' (294.3°) diukur searah jarum jam dari Utara Sejati</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
