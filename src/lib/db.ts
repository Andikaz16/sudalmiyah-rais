import fs from "fs";
import path from "path";
import os from "os";
import bcrypt from "bcryptjs";
import {
  Agenda,
  DonationCampaign,
  FacilityBooking,
  FinancialRecord,
  FridayOfficerSchedule,
  Registration,
  SecurityAuditLog,
  User,
  QrisSettings,
  MosqueFeedback,
  PopupBanner,
  DownloadDocument,
  ManualNewsItem,
  PrayerAttendance,
  PrayerName,
} from "./types";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getFirestoreDb, isFirebaseConfigured } from "./firebase";

export interface DatabaseSchema {
  users: User[];
  agendas: Agenda[];
  fridaySchedule: FridayOfficerSchedule;
  fridaySchedules?: FridayOfficerSchedule[];
  fridayScheduleHistory?: FridayOfficerSchedule[];
  qrisSettings: QrisSettings;
  registrations: Registration[];
  finances: FinancialRecord[];
  campaigns: DonationCampaign[];
  facilityBookings: FacilityBooking[];
  auditLogs: SecurityAuditLog[];
  feedbacks: MosqueFeedback[];
  popupBanner?: PopupBanner | null;
  popupBanners?: PopupBanner[];
  documents?: DownloadDocument[];
  manualNews?: ManualNewsItem[];
  prayerAttendances?: PrayerAttendance[];
}

function getDbFilePath(): string {
  // If running in Vercel or read-only serverless environment, use writable /tmp directory
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "masjid_store.json");
  }
  return path.join(process.cwd(), "data", "masjid_store.json");
}

// In-memory cache for fast reads
let memoryDb: DatabaseSchema | null = null;
let lastDbMtimeMs = 0;

function ensureDbDirectory(targetFilePath: string) {
  try {
    const dir = path.dirname(targetFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn("Notice: Could not create directory:", err);
  }
}

export function getDefaultFridaySchedules(primary?: FridayOfficerSchedule): FridayOfficerSchedule[] {
  const getSafeHijri = (val?: string) => {
    if (val && !val.includes("Rabiul Akhir")) return val;
    return "5 Jumadilawal 1448 H";
  };

  const sudalmiyah: FridayOfficerSchedule = {
    id: primary?.id || "fri-sudalmiyah",
    mosqueId: "sudalmiyah",
    mosqueName: "Masjid Hj. Sudalmiyah Rais",
    mosqueLocation: "Kampus 2 UMS",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: primary?.khatibName || "Dalam Konfirmasi",
    khatibTitle: primary?.khatibTitle || "Akan Diumumkan Takmir",
    khatibPhotoUrl: primary?.khatibPhotoUrl || "",
    khutbahTheme: primary?.khutbahTheme || "Tema Khutbah Dalam Konfirmasi",
    imamName: primary?.imamName || "Dalam Konfirmasi",
    imamRole: primary?.imamRole || "Imam Shalat Jumat",
    muadzinName: primary?.muadzinName || "Dalam Konfirmasi",
    muadzinRole: primary?.muadzinRole || "Muadzin Shalat Jumat",
    time: primary?.time || "11:35 WIB",
    notes: primary?.notes || "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: primary?.updatedAt || new Date().toISOString(),
  };

  const fadhlurrahman: FridayOfficerSchedule = {
    id: "fri-fadhlurrahman",
    mosqueId: "fadhlurrahman",
    mosqueName: "Masjid Fadhlurrahman",
    mosqueLocation: "Kampus 1 UMS",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  const masMansur: FridayOfficerSchedule = {
    id: "fri-mas-mansur",
    mosqueId: "mas-mansur",
    mosqueName: "Masjid KH. Mas Mansur",
    mosqueLocation: "Kampus 4 UMS (Pesma)",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  const mahadAbuBakar: FridayOfficerSchedule = {
    id: "fri-mahad-abu-bakar",
    mosqueId: "mahad-abu-bakar",
    mosqueName: "Masjid Ma'had Abu Bakar",
    mosqueLocation: "Kampus 2 UMS",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  const arRazi: FridayOfficerSchedule = {
    id: "fri-ar-razi",
    mosqueId: "ar-razi",
    mosqueName: "Masjid Ar-Razi FKG",
    mosqueLocation: "Kampus 4 UMS (FKG)",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  const munajatShabran: FridayOfficerSchedule = {
    id: "fri-munajat-shabran",
    mosqueId: "munajat-shabran",
    mosqueName: "Masjid Munajat Shabran",
    mosqueLocation: "Makamhaji (Pondok Shabran)",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Imam Shalat Jumat",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Muadzin Shalat Jumat",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  return [sudalmiyah, fadhlurrahman, masMansur, mahadAbuBakar, arRazi, munajatShabran];
}

export function getDefaultFridayScheduleHistory(): FridayOfficerSchedule[] {
  return [
    {
      id: "hist-20261016-sudalmiyah",
      mosqueId: "sudalmiyah",
      mosqueName: "Masjid Hj. Sudalmiyah Rais",
      mosqueLocation: "Kampus 2 UMS",
      date: "Jumat, 16 Oktober 2026",
      hijriDate: "4 Jumadilawal 1448 H",
      khatibName: "Prof. Muhammad Da'i",
      khatibTitle: "Guru Besar Farmasi UMS / Wakil Rektor",
      khatibPhotoUrl: "",
      khutbahTheme: "Meneguhkan Integritas Moral & Keteladanan Intelektual Muslim",
      imamName: "Ustadz Mahfuzh, S.Pd.I",
      imamRole: "Imam Rawatib Masjid Sudalmiyah",
      muadzinName: "Muadzin Masjid Sudalmiyah",
      muadzinRole: "Muadzin Shalat Jumat",
      time: "11:40 WIB",
      notes: "Khutbah Jumat di Ruang Utama Shalat Lantai 2 Masjid Hj. Sudalmiyah Rais Kampus 2 UMS.",
      updatedAt: "2026-10-16T13:00:00Z",
    },
    {
      id: "hist-20261016-fadhlurrahman",
      mosqueId: "fadhlurrahman",
      mosqueName: "Masjid Fadhlurrahman",
      mosqueLocation: "Kampus 1 UMS",
      date: "Jumat, 16 Oktober 2026",
      hijriDate: "4 Jumadilawal 1448 H",
      khatibName: "Dr. Muh. Nur Rochim Maksum",
      khatibTitle: "Dosen & Dai Majelis Tabligh Muhammadiyah",
      khatibPhotoUrl: "",
      khutbahTheme: "Karakter Generasi Berkemajuan Pembawa Risalah Pencerahan",
      imamName: "Imam Shalat Jumat",
      imamRole: "Imam Shalat Jumat",
      muadzinName: "Muadzin Masjid Fadhlurrahman",
      muadzinRole: "Muadzin Shalat Jumat",
      time: "11:40 WIB",
      notes: "Khutbah Jumat di Masjid Fadhlurrahman Kampus 1 UMS.",
      updatedAt: "2026-10-16T13:00:00Z",
    },
  ];
}

export function getDefaultDocuments(): DownloadDocument[] {
  return [
    {
      id: "doc-01",
      title: "Himpunan Putusan Tarjih (HPT) Muhammadiyah",
      category: "TARJIH_FIQIH",
      categoryLabel: "Tarjih & Fiqih",
      description: "Kumpulan fatwa, tuntunan ibadah praktis, dan putusan resmi Majelis Tarjih dan Tajdid Pimpinan Pusat Muhammadiyah sebagai pedoman pengamalan ajaran Islam berdasar Al-Qur'an dan As-Sunnah ash-Shahihah.",
      author: "Majelis Tarjih dan Tajdid PP Muhammadiyah",
      fileUrl: "/documents/hpt-muhammadiyah.pdf",
      fileName: "hpt-muhammadiyah.pdf",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      downloadCount: 342,
      publishedYear: "Cetakan Resmi",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "doc-02",
      title: "Pedoman Hidup Islami Warga Muhammadiyah (PHIWM)",
      category: "IDEOLOGI",
      categoryLabel: "Ideologi & Akhlak",
      description: "Pedoman komprehensif bagi warga Muhammadiyah dalam mengimplementasikan nilai-nilai Islam dalam kehidupan pribadi, keluarga, bermasyarakat, berorganisasi, serta mengelola amal usaha dan lingkungan.",
      author: "Pimpinan Pusat Muhammadiyah",
      fileUrl: "/documents/phiwm-pedoman-hidup-islami.pdf",
      fileName: "phiwm-pedoman-hidup-islami.pdf",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      downloadCount: 278,
      publishedYear: "Muktamar ke-44",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "doc-03",
      title: "Tanya Jawab Agama Islam Majelis Tarjih",
      category: "TARJIH_FIQIH",
      categoryLabel: "Konsultasi Ibadah",
      description: "Himpunan tanya jawab fatwa keagamaan terhadap problematika kontemporer, fiqih ibadah harian, muamalah maliyah, dan hukum keluarga Islam.",
      author: "Majelis Tarjih dan Tajdid PP Muhammadiyah",
      fileUrl: "/documents/tanya-jawab-agama-tarjih.pdf",
      fileName: "tanya-jawab-agama-tarjih.pdf",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      downloadCount: 195,
      publishedYear: "Kompilasi Fatwa",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "doc-04",
      title: "12 Langkah K.H. Ahmad Dahlan",
      category: "KEMUHAMMADIYAHAN",
      categoryLabel: "Kemuhammadiyahan",
      description: "Dokumen bersejarah intisari pedoman kepemimpinan, keikhlasan beramal, keteladanan perjuangan, dan pembinaan jiwa aktivis dakwah Muhammadiyah yang dirumuskan oleh pendiri persyarikatan.",
      author: "K.H. Ahmad Dahlan (HB Muhammadiyah)",
      fileUrl: "/documents/12-langkah-kh-ahmad-dahlan.pdf",
      fileName: "12-langkah-kh-ahmad-dahlan.pdf",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      downloadCount: 215,
      publishedYear: "Dokumen Historis",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "doc-05",
      title: "Risalah Islam Berkemajuan",
      category: "DOKUMEN_MUKTAMAR",
      categoryLabel: "Dokumen Muktamar",
      description: "Dokumen pandangan resmi persyarikatan hasil Muktamar ke-48 di Surakarta mengenai konsepsi gerakan pencerahan, praksis keumatan, kebangsaan, dan kemanusiaan universal abad kedua Muhammadiyah.",
      author: "Pimpinan Pusat Muhammadiyah",
      fileUrl: "/documents/risalah-islam-berkemajuan.pdf",
      fileName: "risalah-islam-berkemajuan.pdf",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      downloadCount: 389,
      publishedYear: "Muktamar ke-48 Surakarta",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
    {
      id: "doc-06",
      title: "Buku Panduan Standar Masjid Percontohan Muhammadiyah",
      category: "PANDUAN_MASJID",
      categoryLabel: "Panduan Takmir",
      description: "Panduan tata kelola, arsitektur, pemakmuran, dan standardisasi Masjid Ramah Aktivis, Ramah Lingkungan, Ramah Anak, dan Ramah Difabel yang diterbitkan oleh LPCR-PM PP Muhammadiyah.",
      author: "LPCR-PM Pimpinan Pusat Muhammadiyah",
      fileUrl: "/documents/panduan-masjid-percontohan.pdf",
      fileName: "panduan-masjid-percontohan.pdf",
      fileSize: "2.0 MB",
      fileFormat: "PDF",
      downloadCount: 420,
      publishedYear: "Edisi LPCR-PM PP Muhammadiyah",
      createdAt: "2026-10-15T10:00:00.000Z",
    },
  ];
}

export function getDefaultManualNews(): ManualNewsItem[] {
  return [
    {
      id: "news-manual-silaturahmi-bph-2026",
      title: "Silaturrahmi Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais dengan BPH UMS",
      excerpt: "SURAKARTA — Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais menggelar silaturrahmi koordinasi bersama Badan Pembina Harian (BPH) Universitas Muhammadiyah Surakarta di Ruang Sidang BPH UMS pada Selasa, 13 Oktober 2026.",
      content: [
        "SURAKARTA — Dalam rangka mempererat ukhuwah serta menyelaraskan arah pembinaan kemakmuran masjid kampus, jajaran Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais menggelar pertemuan silaturrahmi bersama jajaran Badan Pembina Harian (BPH) Universitas Muhammadiyah Surakarta pada Selasa, 13 Oktober 2026.",
        "Pertemuan yang bertempat di Ruang Sidang BPH UMS ini dihadiri oleh pimpinan BPH UMS, jajaran pembina, serta takmir pelaksana Masjid Hj. Sudalmiyah Rais. Agenda pertemuan membahas koordinasi kelembagaan, penguatan program ibadah, pembinaan dakwah kemahasiswaan, serta peningkatan sarana prasarana penunjang kegiatan jamaah.",
        "Melalui silaturrahmi ini, sinergi antara BPH UMS dan pengelola Masjid Hj. Sudalmiyah Rais diharapkan semakin kokoh dalam mewujudkan masjid kampus sebagai pusat peradaban, pembinaan karakter Islami, dan pusat syiar persyarikatan di lingkungan civitas akademika."
      ],
      imageUrl: "/images/news/silaturahmi-bph-1.jpg",
      publishedAt: "2026-10-13T10:00:00+07:00",
      badge: "WARTA MASJID",
      badgeClass: "bg-[#003B73] text-white",
      sourceDomain: "masjid.ums.ac.id",
      sourceUrl: "#",
      author: "Badan Pembina & Pelaksana Masjid Hj. Sudalmiyah Rais",
      createdAt: "2026-10-13T10:00:00+07:00",
      isPublished: true,
    },
  ];
}

export function getDefaultPopupBanners(): PopupBanner[] {
  return [
    {
      id: "popup-senam-donor-01",
      title: "Senam Sehat & Donor Darah - GEMILAR Milad ke-25 Ma'had Abu Bakar Ash-Shiddiq UMS",
      imageUrl: "/images/popup/senam-sehat-donor-darah.jpg",
      targetUrl: "",
      isActive: true,
      updatedAt: "2026-10-19T11:44:50.000Z",
      startDate: "2026-10-19T11:44:50.000Z",
      expiresAt: "2026-10-23T11:44:50.000Z",
      durationDays: 3,
      linkedAgendaTitle: "GEMILAR: Senam Sehat & Donor Darah",
    },
    {
      id: "popup-patungan-air-01",
      title: "Patungan Air Minum Sehat & Gratis Masjid Hj. Sudalmiyah Rais",
      imageUrl: "/images/popup/patungan-air-minum.jpg",
      targetUrl: "",
      isActive: true,
      updatedAt: "2026-10-15T13:08:05.000Z",
    },
  ];
}

export function getDefaultPrayerAttendances(): PrayerAttendance[] {
  const today = new Date().toISOString().split("T")[0];
  return [
    {
      id: "shlt-sample-01",
      prayerName: "SUBUH",
      mosqueId: "sudalmiyah",
      mosqueName: "Masjid Hj. Sudalmiyah Rais",
      mosqueLocation: "Kampus 2 UMS",
      fullName: "Ahmad Fauzi",
      participantRole: "MAHASISWA",
      nim: "L200210001",
      faculty: "Fakultas Komunikasi dan Informatika",
      phone: "089876543210",
      email: "l200210001@student.ums.ac.id",
      photoUrl: "/images/masjid-sudalmiyah.jpg",
      ticketCode: "SHLT-SBH-001",
      attendedAt: `${today}T04:35:10.000Z`,
      date: today,
      userLat: -7.5583,
      userLng: 110.7719,
      locationVerified: true,
      distanceMeters: 25,
    },
    {
      id: "shlt-sample-02",
      prayerName: "DZUHUR",
      mosqueId: "fadhlurrahman",
      mosqueName: "Masjid Fadhlurrahman",
      mosqueLocation: "Kampus 1 UMS",
      fullName: "Dr. Muhammad Ikhsan, M.Ag.",
      participantRole: "DOSEN_KARYAWAN",
      faculty: "Fakultas Agama Islam",
      phone: "081234567891",
      email: "ikhsan@ums.ac.id",
      photoUrl: "/images/hero-fadhlurrahman.jpg",
      ticketCode: "SHLT-DZH-002",
      attendedAt: `${today}T11:55:00.000Z`,
      date: today,
      userLat: -7.5587,
      userLng: 110.7766,
      locationVerified: true,
      distanceMeters: 40,
    },
    {
      id: "shlt-sample-03",
      prayerName: "ASHAR",
      mosqueId: "mas-mansur",
      mosqueName: "Masjid KH. Mas Mansur",
      mosqueLocation: "Kampus 4 UMS (Pesma)",
      fullName: "Ilham Ramadhan",
      participantRole: "MAHASISWA",
      nim: "D100220045",
      faculty: "Fakultas Teknik",
      phone: "085678901234",
      email: "d100220045@student.ums.ac.id",
      photoUrl: "/images/hero-mas-mansur.jpg",
      ticketCode: "SHLT-ASH-003",
      attendedAt: `${today}T15:15:30.000Z`,
      date: today,
      userLat: -7.5558,
      userLng: 110.7634,
      locationVerified: true,
      distanceMeters: 30,
    },
    {
      id: "shlt-sample-04",
      prayerName: "MAGHRIB",
      mosqueId: "ar-razi",
      mosqueName: "Masjid Ar-Razi FKG",
      mosqueLocation: "Kampus 4 UMS (FKG)",
      fullName: "Farhan Pratama",
      participantRole: "MAHASISWA",
      nim: "J500210012",
      faculty: "Fakultas Kedokteran Gigi",
      phone: "087890123456",
      email: "j500210012@student.ums.ac.id",
      photoUrl: "/images/hero-ar-razi.jpg",
      ticketCode: "SHLT-MGH-004",
      attendedAt: `${today}T17:50:15.000Z`,
      date: today,
      userLat: -7.5549,
      userLng: 110.7645,
      locationVerified: true,
      distanceMeters: 18,
    },
    {
      id: "shlt-sample-05",
      prayerName: "ISYA",
      mosqueId: "sudalmiyah",
      mosqueName: "Masjid Hj. Sudalmiyah Rais",
      mosqueLocation: "Kampus 2 UMS",
      fullName: "Bambang Wahyudi",
      participantRole: "UMUM",
      phone: "081390123456",
      email: "bambang.w@gmail.com",
      photoUrl: "/images/masjid-sudalmiyah.jpg",
      ticketCode: "SHLT-ISY-005",
      attendedAt: `${today}T19:10:00.000Z`,
      date: today,
      userLat: -7.5583,
      userLng: 110.7719,
      locationVerified: true,
      distanceMeters: 15,
    },
  ];
}

function getInitialData(): DatabaseSchema {
  const officialAdminPasswordHash = bcrypt.hashSync("masjidpercontohan", 10);
  const adminPasswordHash = bcrypt.hashSync("AdminSudalmiyah2026!", 10);
  const studentPasswordHash = bcrypt.hashSync("MahasiswaUMS2026!", 10);
  const defaultSchedules = getDefaultFridaySchedules();
  const defaultPopups = getDefaultPopupBanners();

  return {
    users: [
      {
        id: "usr-takmir-official",
        name: "Pengurus Takmir Masjid UMS",
        email: "masjidums@ums.ac.id",
        passwordHash: officialAdminPasswordHash,
        role: "ADMIN_TAKMIR",
        phone: "081234567890",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-takmir-01",
        name: "Pengurus Takmir Masjid Sudalmiyah Rais",
        email: "takmir@sudalmiyah.ums.ac.id",
        passwordHash: adminPasswordHash,
        role: "ADMIN_TAKMIR",
        phone: "081234567890",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-student-01",
        name: "Ahmad Fauzi",
        email: "l200210001@student.ums.ac.id",
        passwordHash: studentPasswordHash,
        role: "JAMAAH_MAHASISWA",
        nim: "L200210001",
        faculty: "Fakultas Komunikasi dan Informatika",
        phone: "089876543210",
        createdAt: new Date().toISOString(),
      },
    ],
    agendas: [
      {
        id: "agn-mvdo9gbf",
        title: "Kajian Tematik",
        category: "KAJIAN_MAHASISWA",
        speaker: "Nur Sillatorohmah H., Lc., M.H.",
        speakerRole: "Dosen Ma'had Abu Bakar ash Shiddiq & Penulis buku",
        date: "2026-10-23",
        time: "15:45 - 17:30 WIB",
        location: "Masjid Fadhlurrahman Kampus 1 UMS",
        description:
          "Di tengah pesatnya perkembangan zaman, menjadi muslimah di era modern tentu menghadirkan tantangan tersendiri. Mulai dari menjaga keistiqamahan dalam beribadah hingga menyikapi batasan dalam pergaulan harian.\n\nYuk, pahami tuntunan Islam selengkapnya dalam Kajian Tematik dengan Tema: Fikih Muslimah di Era Modern: Dari Persoalan Ibadah hingga Tantangan Pergaulan",
        quota: 250,
        registeredCount: 0,
        isOpen: true,
        requiresRegistration: false,
        targetAudience: "Terbuka untuk Seluruh Mahasiswa UMS",
        bannerUrl:
          "https://zevj7pj8sew8cphf.public.blob.vercel-storage.com/agendas/1000775421_1792318474594_7obof-bKsOqH7UyLdiVvu788Ub1L5gdkPIRz.jpg",
        createdAt: "2026-10-18T10:17:54.651Z",
      },
      {
        id: "agn-cinsub-01",
        title: "Cinta Subuh Bersama Rektor UMS",
        category: "KAJIAN_MAHASISWA",
        speaker: "Prof. Dr. Harun Joko Prayitno, M.Hum.",
        speakerRole: "Rektor Universitas Muhammadiyah Surakarta",
        date: "2026-10-10",
        time: "03.00 - Selesai WIB",
        location: "Masjid Hj. Sudalmiyah Rais Kampus 2 UMS",
        description:
          "Program pembinaan Cinta Subuh LPPIK & Koordinator Mentoring Pusat UMS bersama Rektor UMS. Fakultas terjadwal: FIK, FK, FKG. Catatan: Wajib membawa tumbler masing-masing.",
        quota: 1000,
        registeredCount: 0,
        isOpen: true,
        requiresRegistration: false,
        bannerUrl: "/uploads/agendas/cinta-subuh-harun-joko.png",
        createdAt: "2026-10-15T15:45:00.000Z",
        isCompleted: true,
        completedAt: "2026-10-10T06:30:00.000Z",
        actualAttendees: 580,
        summaryNote: "Alhamdulillah kegiatan Cinta Subuh bersama Rektor UMS Prof. Dr. Harun Joko Prayitno, M.Hum. telah terlaksana dengan sukses dan penuh berkah.",
      },
      {
        id: "agn-cinsub-02",
        title: "Cinta Subuh Bersama Dr. Mutohharun Jinan, M.Ag.",
        category: "KAJIAN_MAHASISWA",
        speaker: "Dr. Mutohharun Jinan, M.Ag.",
        speakerRole: "Dosen FAI UMS / LPPIK UMS",
        date: "2026-10-17",
        time: "03.00 - Selesai WIB",
        location: "Masjid Hj. Sudalmiyah Rais Kampus 2 UMS",
        description:
          "Program pembinaan Cinta Subuh LPPIK & Koordinator Mentoring Pusat UMS bersama Dr. Mutohharun Jinan, M.Ag. Fakultas terjadwal: FHIP, FKI, FPSI. Catatan: Wajib membawa tumbler masing-masing.",
        quota: 1000,
        registeredCount: 0,
        isOpen: true,
        requiresRegistration: false,
        bannerUrl: "/uploads/agendas/cinta-subuh-mutohharun-jinan.png",
        createdAt: "2026-10-15T15:45:00.000Z",
        isCompleted: true,
        completedAt: "2026-10-17T06:30:00.000Z",
        actualAttendees: 420,
        documentationPhotos: [
          "/api/media/med-mvei19eq-42940",
          "/api/media/med-mvei1ibk-ne1lj",
        ],
        summaryNote: "Alhamdulillah kegiatan Cinta Subuh bersama Dr. Mutohharun Jinan, M.Ag. telah terlaksana dengan khidmat dan lancar. Dihadiri ratusan jamaah dan mahasiswa fakultas terjadwal (FHIP, FKI, FPSI).",
      },
    ],
    fridaySchedule: defaultSchedules[0],
    fridaySchedules: defaultSchedules,
    fridayScheduleHistory: getDefaultFridayScheduleHistory(),
    qrisSettings: {
      id: "qris-01",
      imageUrl: "/images/qris-sudalmiyah.png",
      secondaryImageUrl: "/images/qris-bank-jateng.jpg",
      merchantName: "LAZ UMS-MSJD SUDALMIYAH",
      secondaryMerchantName: "MASJID UMS",
      nmid: "ID2024353816125",
      secondaryNmid: "-",
      institution: "Universitas Muhammadiyah Surakarta",
      updatedAt: new Date().toISOString(),
    },
    registrations: [],
    popupBanner: defaultPopups[0] || null,
    popupBanners: defaultPopups,
    finances: [
      {
        id: "fin-01",
        title: "Infaq Shalat Jumat Pekan II Oktober",
        type: "INCOME",
        category: "INFAQ_JUMAT",
        amount: 8750000,
        date: "2026-10-09",
        donorName: "Kotak Infaq Jamaah Jumat",
        description: "Penghitungan kotak infaq keliling lantai 1 dan 2 oleh tim takmir.",
        isVerified: true,
        verifiedBy: "Bendahara Takmir",
      },
      {
        id: "fin-02",
        title: "Sedekah Subuh Jamaah & Musafir",
        type: "INCOME",
        category: "SEDEKAH_SUBUH",
        amount: 2150000,
        date: "2026-10-08",
        donorName: "Hamba Allah",
        description: "Kotak infaq subuh harian.",
        isVerified: true,
        verifiedBy: "Bendahara Takmir",
      },
      {
        id: "fin-03",
        title: "Wakaf Pengembangan Sound System Digital",
        type: "INCOME",
        category: "WAKAF_RENOVASI",
        amount: 15000000,
        date: "2026-10-05",
        donorName: "Alumni Teknik UMS Angkatan 2012",
        description: "Wakaf tunai untuk peningkatan kejernihan audio ruang utama shalat.",
        isVerified: true,
        verifiedBy: "Ketua Takmir",
      },
      {
        id: "fin-04",
        title: "Biaya Operasional Kebersihan & Marbot",
        type: "EXPENSE",
        category: "OPERASIONAL",
        amount: 4500000,
        date: "2026-10-07",
        description: "Insentif marbot masjid dan pengadaan perlengkapan sanitasi wudhu.",
        isVerified: true,
        verifiedBy: "Bendahara Takmir",
      },
      {
        id: "fin-05",
        title: "Konsumsi Kajian Tematik Mahasiswa",
        type: "EXPENSE",
        category: "KEGIATAN_SOSIAL",
        amount: 1800000,
        date: "2026-10-04",
        description: "Pengadaan air mineral dan snack box peserta kajian rutin.",
        isVerified: true,
        verifiedBy: "Bendahara Takmir",
      },
    ],
    campaigns: [
      {
        id: "cmp-01",
        title: "Program Sarapan Berkah Mahasiswa & Musafir Subuh",
        targetAmount: 10000000,
        collectedAmount: 6850000,
        deadline: "2026-11-30",
        description:
          "Penyediaan 300 porsi makanan bergizi setiap Ahad pagi untuk mahasiswa perantau UMS dan musafir.",
        isActive: true,
      },
      {
        id: "cmp-02",
        title: "Peremajaan Karpet Ruang Utama Shalat Lt 2",
        targetAmount: 35000000,
        collectedAmount: 22400000,
        deadline: "2026-12-31",
        description:
          "Penggantian karpet shalat saf utama dengan kualitas tebal standar Masjid Nabawi guna kenyamanan beribadah.",
        isActive: true,
      },
    ],
    facilityBookings: [
      {
        id: "bkg-01",
        applicantName: "Rizky Ramadhan",
        organization: "Ikatan Mahasiswa Muhammadiyah (IMM) Komisariat FKI UMS",
        applicantPhone: "081399887766",
        nim: "L200220045",
        facilityName: "Proyektor (LCD Projector Masjid)",
        eventTitle: "Darul Arqam Dasar (DAD) Calon Kader IMM",
        eventDate: "2026-10-24",
        startTime: "08:00",
        endTime: "16:00",
        status: "APPROVED",
        submittedAt: new Date().toISOString(),
      },
      {
        id: "bkg-02",
        applicantName: "Ahmad Fauzi Rahman",
        organization: "HMP Informatika UMS",
        applicantPhone: "085712345678",
        nim: "L200210088",
        facilityName: "Paket Proyektor + Papan Layar (Screen)",
        eventTitle: "Sharing Session & Pelatihan Desain Grafis",
        eventDate: "2026-10-26",
        startTime: "15:30",
        endTime: "17:30",
        status: "APPROVED",
        submittedAt: new Date().toISOString(),
      },
    ],
    auditLogs: [
      {
        id: "log-01",
        timestamp: new Date().toISOString(),
        ipAddress: "127.0.0.1",
        action: "SYSTEM_INITIALIZE",
        actor: "SYSTEM",
        status: "SUCCESS",
        details: "Basis data Masjid Sudalmiyah Rais berhasil diinisialisasi.",
      },
    ],
    feedbacks: [
      {
        id: "fb-01",
        name: "Muhammad Rizky Pratama",
        isAnonymous: false,
        contact: "081392817263",
        targetMosque: "Masjid Hj. Sudalmiyah Rais",
        category: "RIAYAH",
        rating: 5,
        message: "Masjid sangat megah, sejuk, dan wangi. Mohon pertimbangkan penambahan rak sandal khusus di lorong wudhu timur lantai 1 agar saat shalat Jumat jamaah lebih tertib dan alas kaki tidak menumpuk.",
        status: "DITINDAKLANJUTI",
        adminResponse: "Jazakallahu khair Mas Rizky atas sarannya yang sangat baik. Takmir telah mengalokasikan 2 rak sepatu susun baru di sisi timur per 14 Oktober 2026.",
        respondedAt: "2026-10-14T10:30:00Z",
        respondedBy: "Takmir Sudalmiyah",
        createdAt: "2026-10-12T14:20:00Z",
      },
      {
        id: "fb-02",
        name: "Hamba Allah",
        isAnonymous: true,
        contact: "",
        targetMosque: "Masjid Fadhlurrahman",
        category: "IMARAH",
        rating: 5,
        message: "Kajian ba'da Maghrib di Kampus 1 sangat berbobot dan menenangkan hati. Kalau bisa variasi materi tentang fiqih kedokteran dan sains Islam ditambah untuk mahasiswa.",
        status: "DITINJAU",
        adminResponse: "Terima kasih atas masukannya. Bidang Imarah sedang merancang kurikulum kajian tematik integrasi Islam dan Iptek untuk semester ganjil ini.",
        respondedAt: "2026-10-14T15:00:00Z",
        respondedBy: "Takmir Fadhlurrahman",
        createdAt: "2026-10-13T19:15:00Z",
      },
      {
        id: "fb-03",
        name: "Fathimah Az-Zahra",
        isAnonymous: false,
        contact: "fathimah.zahra@student.ums.ac.id",
        targetMosque: "Masjid KH. Mas Mansur",
        category: "RAMAH_DIFABEL",
        rating: 4,
        message: "Akses ramp kursi roda menuju serambi utama pesma sudah bagus, namun mohon pegangan tangan (handrail) di tanjakan wudhu disempurnakan demi kenyamanan lansia dan rekan mahasiswa difabel.",
        status: "BARU",
        createdAt: "2026-10-15T08:45:00Z",
      },
      {
        id: "fb-04",
        name: "Budi Santoso",
        isAnonymous: false,
        contact: "085290123456",
        targetMosque: "Masjid Ma'had Abu Bakar",
        category: "ECO_MOSQUE",
        rating: 5,
        message: "Sangat mengapresiasi kebersihan tempat wudhu. Usul agar dipasang stiker hemat air wudhu (1 mud sesuai sunnah Nabi SAW) dan pemanfaatan air bekas wudhu untuk menyiram taman santri.",
        status: "BARU",
        createdAt: "2026-10-15T11:20:00Z",
      },
    ],
    documents: getDefaultDocuments(),
    manualNews: getDefaultManualNews(),
    prayerAttendances: getDefaultPrayerAttendances(),
  };
}

export function ensureDbDefaults(data: DatabaseSchema): DatabaseSchema {
  if (!data) return getInitialData();
  if (!data.manualNews || data.manualNews.length === 0) {
    data.manualNews = getDefaultManualNews();
  } else {
    const hasSilaturahmi = data.manualNews.some((n) => n.id === "news-manual-silaturahmi-bph-2026");
    if (!hasSilaturahmi) {
      data.manualNews.unshift(getDefaultManualNews()[0]);
    }
  }
  if (!data.fridaySchedules || data.fridaySchedules.length < 6) {
    const defaults = getDefaultFridaySchedules(data.fridaySchedule);
    if (!data.fridaySchedules || data.fridaySchedules.length === 0) {
      data.fridaySchedules = defaults;
    } else {
      const existingMap = new Map(data.fridaySchedules.map((s) => [s.mosqueId || s.id, s]));
      data.fridaySchedules = defaults.map((d) => {
        const key = d.mosqueId || d.id;
        return existingMap.get(key) || d;
      });
    }
  }
  if (!data.fridaySchedule && data.fridaySchedules && data.fridaySchedules[0]) {
    data.fridaySchedule = data.fridaySchedules[0];
  }
  if (!data.qrisSettings) {
    data.qrisSettings = getInitialData().qrisSettings;
  }
  if (!data.feedbacks) {
    data.feedbacks = getInitialData().feedbacks || [];
  }
  if (!data.documents || data.documents.length === 0) {
    data.documents = getDefaultDocuments();
  }
  if (data.agendas) {
    const initial = getInitialData();
    data.agendas.forEach((a) => {
      const match = initial.agendas.find((ia) => ia.id === a.id);
      if (match && !a.bannerUrl) {
        a.bannerUrl = match.bannerUrl || "/uploads/agendas/agenda-jumat.jpg";
      }
      if (match && match.isCompleted && a.isCompleted === undefined) {
        a.isCompleted = match.isCompleted;
        a.completedAt = match.completedAt;
        a.actualAttendees = a.actualAttendees || match.actualAttendees;
        a.documentationPhotos = a.documentationPhotos || match.documentationPhotos;
        a.summaryNote = a.summaryNote || match.summaryNote;
      }
    });
  } else {
    data.agendas = getInitialData().agendas;
  }
  if (!data.users || data.users.length === 0) {
    data.users = getInitialData().users;
  } else if (!data.users.some((u) => u.email.toLowerCase() === "masjidums@ums.ac.id")) {
    data.users.unshift({
      id: "usr-takmir-official",
      name: "Pengurus Takmir Masjid UMS",
      email: "masjidums@ums.ac.id",
      passwordHash: bcrypt.hashSync("masjidpercontohan", 10),
      role: "ADMIN_TAKMIR",
      phone: "081234567890",
      createdAt: new Date().toISOString(),
    });
  }
  if (!Array.isArray(data.prayerAttendances) || data.prayerAttendances.length === 0) {
    data.prayerAttendances = getDefaultPrayerAttendances();
  }
  if (!Array.isArray(data.popupBanners) || data.popupBanners.length === 0) {
    if (data.popupBanner) {
      data.popupBanners = [data.popupBanner];
    } else {
      const defaults = getDefaultPopupBanners();
      data.popupBanners = defaults;
      data.popupBanner = defaults[0] || null;
    }
  }
  if (!Array.isArray(data.registrations)) data.registrations = [];
  if (!Array.isArray(data.finances)) data.finances = [];
  if (!Array.isArray(data.campaigns)) data.campaigns = [];
  if (!Array.isArray(data.facilityBookings)) data.facilityBookings = [];
  if (!Array.isArray(data.auditLogs)) data.auditLogs = [];
  if (!Array.isArray(data.fridayScheduleHistory) || data.fridayScheduleHistory.length === 0) {
    data.fridayScheduleHistory = getDefaultFridayScheduleHistory();
  }
  return data;
}

export function getDb(): DatabaseSchema {
  const targetFile = getDbFilePath();
  const repoFile = path.join(process.cwd(), "data", "masjid_store.json");

  // In serverless (Vercel), seed /tmp/masjid_store.json from the bundled repo file if it exists
  if (targetFile !== repoFile && !fs.existsSync(targetFile) && fs.existsSync(repoFile)) {
    try {
      const initialSeed = fs.readFileSync(repoFile, "utf-8");
      ensureDbDirectory(targetFile);
      fs.writeFileSync(targetFile, initialSeed, "utf-8");
    } catch (seedErr) {
      console.warn("Notice: Could not copy initial db file to tmp:", seedErr);
    }
  }

  const fileToRead = fs.existsSync(targetFile)
    ? targetFile
    : fs.existsSync(repoFile)
    ? repoFile
    : null;

  if (!fileToRead) {
    if (memoryDb) return memoryDb;
    const initial = getInitialData();
    memoryDb = initial;
    saveDb(initial);
    return initial;
  }

  try {
    const stat = fs.statSync(fileToRead);
    if (memoryDb && stat.mtimeMs === lastDbMtimeMs) {
      return memoryDb;
    }
    const content = fs.readFileSync(fileToRead, "utf-8");
    memoryDb = ensureDbDefaults(JSON.parse(content));
    lastDbMtimeMs = stat.mtimeMs;
    return memoryDb as DatabaseSchema;
  } catch (err) {
    console.error("Database read error, falling back to initial data:", err);
    if (memoryDb) return memoryDb;
    const fallback = getInitialData();
    memoryDb = fallback;
    return fallback;
  }
}

export async function getDbAsync(): Promise<DatabaseSchema> {
  if (isFirebaseConfigured()) {
    try {
      const firestore = getFirestoreDb();
      if (firestore) {
        const docRef = doc(firestore, "masjid_sudalmiyah", "data_store");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const cloudData = ensureDbDefaults(snap.data() as DatabaseSchema);
          memoryDb = cloudData;
          return cloudData;
        } else {
          // First time initialization: seed Firestore with current local data
          const local = getDb();
          await setDoc(docRef, JSON.parse(JSON.stringify(local)));
          memoryDb = local;
          return local;
        }
      }
    } catch (err) {
      console.warn("Notice: Firestore read error, falling back to local file:", err);
    }
  }

  const db = getDb();
  memoryDb = db;
  return db;
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  memoryDb = data;
  const targetFile = getDbFilePath();
  try {
    ensureDbDirectory(targetFile);
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    const stat = fs.statSync(targetFile);
    lastDbMtimeMs = stat.mtimeMs;
  } catch (err) {
    // Graceful fallback for read-only serverless filesystems
    console.warn("Notice: Could not persist to disk, keeping in memory cache:", err);
  }

  // Persist directly to Firebase Cloud Firestore if configured
  if (isFirebaseConfigured()) {
    try {
      const firestore = getFirestoreDb();
      if (firestore) {
        const docRef = doc(firestore, "masjid_sudalmiyah", "data_store");
        await setDoc(docRef, JSON.parse(JSON.stringify(data)), { merge: true });
      }
    } catch (err) {
      console.error("Notice: Firestore write error:", err);
      throw err;
    }
  }
}

/**
 * Granular update for specific fields in Firestore to prevent race-condition data wipes.
 */
export async function saveDbFields(
  fields: Array<keyof DatabaseSchema>,
  payload: Partial<DatabaseSchema>
): Promise<void> {
  const db = await getDbAsync();
  for (const f of fields) {
    if (payload[f] !== undefined) {
      (db as any)[f] = payload[f];
    }
  }
  memoryDb = db;

  try {
    const targetFile = getDbFilePath();
    ensureDbDirectory(targetFile);
    fs.writeFileSync(targetFile, JSON.stringify(db, null, 2), "utf-8");
    const stat = fs.statSync(targetFile);
    lastDbMtimeMs = stat.mtimeMs;
  } catch (err) {
    // Graceful fallback for read-only serverless filesystems
  }

  if (isFirebaseConfigured()) {
    try {
      const firestore = getFirestoreDb();
      if (firestore) {
        const docRef = doc(firestore, "masjid_sudalmiyah", "data_store");
        const updatePayload: Record<string, any> = {};
        for (const f of fields) {
          if (payload[f] !== undefined) {
            updatePayload[f] = JSON.parse(JSON.stringify(payload[f]));
          }
        }
        await updateDoc(docRef, updatePayload);
      }
    } catch (err) {
      console.error("Notice: Firestore fields update error:", err);
      throw err;
    }
  }
}

export async function saveDbField<K extends keyof DatabaseSchema>(
  field: K,
  value: DatabaseSchema[K]
): Promise<void> {
  return saveDbFields([field], { [field]: value });
}

export function logSecurityEvent(
  action: string,
  actor: string,
  ip: string,
  status: "SUCCESS" | "WARNING" | "BLOCKED",
  details: string
): void {
  try {
    const log: SecurityAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      action,
      actor,
      status,
      details,
    };

    if (memoryDb) {
      if (!memoryDb.auditLogs) memoryDb.auditLogs = [];
      memoryDb.auditLogs.unshift(log);
      if (memoryDb.auditLogs.length > 200) {
        memoryDb.auditLogs = memoryDb.auditLogs.slice(0, 200);
      }
    }

    try {
      const targetFile = getDbFilePath();
      if (fs.existsSync(targetFile)) {
        const raw = fs.readFileSync(targetFile, "utf-8");
        const parsed = JSON.parse(raw);
        if (!parsed.auditLogs) parsed.auditLogs = [];
        parsed.auditLogs.unshift(log);
        if (parsed.auditLogs.length > 200) parsed.auditLogs = parsed.auditLogs.slice(0, 200);
        fs.writeFileSync(targetFile, JSON.stringify(parsed, null, 2), "utf-8");
      }
    } catch {
      // ignore local write errors
    }

    if (isFirebaseConfigured()) {
      const firestore = getFirestoreDb();
      if (firestore) {
        const docRef = doc(firestore, "masjid_sudalmiyah", "data_store");
        getDoc(docRef)
          .then((snap) => {
            if (snap.exists()) {
              const currentData = snap.data();
              const existingLogs: SecurityAuditLog[] = Array.isArray(currentData.auditLogs)
                ? currentData.auditLogs
                : [];
              existingLogs.unshift(log);
              const trimmed = existingLogs.slice(0, 200);
              updateDoc(docRef, { auditLogs: trimmed }).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Security event logging error ignored:", err);
  }
}

