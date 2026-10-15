import crypto from "crypto";

const PRESENSI_SECRET =
  process.env.PRESENSI_SECRET || "sudalmiyah-presensi-secret-key-2026-dynamic-qr";

// Waktu rotasi tampilan di layar proyektor (detik)
export const ROTATION_INTERVAL_SECONDS = 10;

// Batas toleransi maksimal token berlaku sejak digenerate (detik)
// 10s rotasi + 20s toleransi latensi jaringan/kamera = 30 detik
export const TOKEN_MAX_AGE_SECONDS = 30;

export interface TokenVerificationResult {
  valid: boolean;
  agendaId?: string;
  timestamp?: number;
  ageSeconds?: number;
  error?: "EXPIRED" | "INVALID" | "MALFORMED";
  message?: string;
}

/**
 * Generate Dynamic Time-Bound Token for Attendance QR Code.
 * Format: agendaId.timestamp.hmacSignature
 */
export function generateDynamicToken(agendaId: string, timestamp = Date.now()): string {
  const payload = `${agendaId}.${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", PRESENSI_SECRET)
    .update(payload)
    .digest("hex")
    .substring(0, 16); // 16-char hex is secure and compact for QR codes

  return `${payload}.${hmac}`;
}

/**
 * Verify Dynamic Time-Bound Token from Attendee Scan.
 */
export function verifyDynamicToken(
  token: string,
  maxAgeSeconds = TOKEN_MAX_AGE_SECONDS
): TokenVerificationResult {
  if (!token || typeof token !== "string") {
    return {
      valid: false,
      error: "MALFORMED",
      message: "Token presensi tidak ditemukan.",
    };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      valid: false,
      error: "MALFORMED",
      message: "Format kode token presensi tidak valid.",
    };
  }

  const [agendaId, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return {
      valid: false,
      error: "MALFORMED",
      message: "Data waktu pada token tidak valid.",
    };
  }

  // Verifikasi keaslian signature HMAC
  const expectedHmac = crypto
    .createHmac("sha256", PRESENSI_SECRET)
    .update(`${agendaId}.${timestamp}`)
    .digest("hex")
    .substring(0, 16);

  if (signature !== expectedHmac) {
    return {
      valid: false,
      error: "INVALID",
      message: "Kode QR tidak sah atau telah dimanipulasi.",
    };
  }

  // Hitung usia token dalam detik
  const now = Date.now();
  const ageSeconds = Math.floor((now - timestamp) / 1000);

  // Jika token dibuat di masa depan lebih dari 5 detik (clock drift ekstrem)
  if (ageSeconds < -5) {
    return {
      valid: false,
      error: "INVALID",
      message: "Sinkronisasi waktu perangkat tidak sesuai.",
    };
  }

  // Periksa apakah token sudah kedaluwarsa (> maxAgeSeconds)
  if (ageSeconds > maxAgeSeconds) {
    return {
      valid: false,
      agendaId,
      timestamp,
      ageSeconds,
      error: "EXPIRED",
      message: `Kode QR sudah kedaluwarsa (${ageSeconds} detik yang lalu). Kode QR berganti tiap ${ROTATION_INTERVAL_SECONDS} detik untuk mencegah titip absen. Silakan scan ulang kode QR terbaru di layar masjid.`,
    };
  }

  return {
    valid: true,
    agendaId,
    timestamp,
    ageSeconds,
  };
}

/**
 * Validasi jarak koordinat (Haversine Formula) ke Masjid Sudalmiyah UMS.
 * Lokasi Masjid Sudalmiyah Kampus 2 UMS: Lat -7.5583, Lng 110.7719
 */
export const MASJID_COORDINATES = {
  latitude: -7.5583,
  longitude: 110.7719,
  maxRadiusMeters: 250, // radius 250 meter mencakup seluruh kawasan masjid & plaza kampus 2 UMS
};

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number = MASJID_COORDINATES.latitude,
  lon2: number = MASJID_COORDINATES.longitude
): number {
  const R = 6371e3; // Radius bumi dalam meter
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
