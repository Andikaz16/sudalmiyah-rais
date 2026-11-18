export interface CampusMosqueGeo {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

export const MAX_PRESENSI_RADIUS_METERS = 250;

/**
 * Koordinat GPS terverifikasi untuk seluruh 6 Masjid Kampus UMS:
 * - sudalmiyah      : Sayap Barat Gedung Induk Siti Walidah, Kampus 2 UMS
 * - fadhlurrahman   : Masjid Fadhlurrahman, Kampus 1 UMS (OSM verified)
 * - mas-mansur      : Masjid KH. Mas Mansur, Kampus 4 UMS / Pesma Jl. Adi Sucipto (OSM verified)
 * - mahad-abu-bakar : Masjid Ma'had Abu Bakar Ash-Shiddiq, Jl. Menco I Pabelan (OSM verified)
 * - munajat-shabran : Masjid Al-Munajat / Syarif, Pondok Shabran, Jl. Latar Putih Saripan Makamhaji (OSM verified)
 * - ar-razi         : Masjid Ar-Razi FKG, Kampus 4 UMS Jl. Adi Sucipto (OSM verified)
 */
export const CAMPUS_MOSQUES_LIST: CampusMosqueGeo[] = [
  {
    id: "sudalmiyah",
    name: "Masjid Hj. Sudalmiyah Rais",
    location: "Kampus 2 UMS",
    lat: -7.55795,
    lng: 110.77135,
  },
  {
    id: "fadhlurrahman",
    name: "Masjid Fadhlurrahman",
    location: "Kampus 1 UMS",
    lat: -7.558417,
    lng: 110.769078,
  },
  {
    id: "mas-mansur",
    name: "Masjid KH. Mas Mansur",
    location: "Kampus 4 UMS (Pesma)",
    lat: -7.54715,
    lng: 110.769005,
  },
  {
    id: "mahad-abu-bakar",
    name: "Masjid Ma'had Abu Bakar",
    location: "Kampus 2 UMS",
    lat: -7.557558,
    lng: 110.767305,
  },
  {
    id: "munajat-shabran",
    name: "Masjid Al-Munajat",
    location: "Makamhaji (Pondok Shabran)",
    lat: -7.565203,
    lng: 110.776681,
  },
  {
    id: "ar-razi",
    name: "Masjid Ar-Razi FKG",
    location: "Kampus 4 UMS (FKG)",
    lat: -7.546779,
    lng: 110.767221,
  },
];

export const CAMPUS_MOSQUES_MAP: Record<string, CampusMosqueGeo> = Object.fromEntries(
  CAMPUS_MOSQUES_LIST.map((m) => [m.id, m])
);

export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
