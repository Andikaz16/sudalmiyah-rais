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
} from "./types";

interface DatabaseSchema {
  users: User[];
  agendas: Agenda[];
  fridaySchedule: FridayOfficerSchedule;
  fridaySchedules?: FridayOfficerSchedule[];
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
  const sudalmiyah: FridayOfficerSchedule = {
    id: primary?.id || "fri-sudalmiyah",
    mosqueId: "sudalmiyah",
    mosqueName: "Masjid Hj. Sudalmiyah Rais",
    mosqueLocation: "Kampus 2 UMS",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: primary?.khatibName || "Prof. Dr. Sofyan Anif, M.Si.",
    khatibTitle: primary?.khatibTitle || "Rektor Universitas Muhammadiyah Surakarta",
    khatibPhotoUrl: primary?.khatibPhotoUrl || "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: primary?.khutbahTheme || "Membangun Integritas Moral & Karakter Mahasiswa Muslim Berkemajuan di Era AI",
    imamName: primary?.imamName || "Ustadz Muhammad Ridwan, Al-Hafizh",
    imamRole: primary?.imamRole || "Imam Rawatib Masjid Sudalmiyah Rais",
    muadzinName: primary?.muadzinName || "Bilal Ramadhan, S.Kom.",
    muadzinRole: primary?.muadzinRole || "Muadzin Masjid Sudalmiyah Rais",
    time: primary?.time || "11:35 WIB",
    notes: primary?.notes || "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid, serta menata alas kaki dengan rapi di loker yang disediakan.",
    updatedAt: primary?.updatedAt || new Date().toISOString(),
  };

  const fadhlurrahman: FridayOfficerSchedule = {
    id: "fri-fadhlurrahman",
    mosqueId: "fadhlurrahman",
    mosqueName: "Masjid Fadhlurrahman",
    mosqueLocation: "Kampus 1 UMS",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: "Dr. Syamsul Hidayat, M.Ag.",
    khatibTitle: "Dekan FAI UMS / Majelis Tarjih",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Meneladani Jejak Historis & Ruh Perjuangan Dakwah Islam Berkemajuan",
    imamName: "Ustadz H. Ahmad Dahlan, S.Pd.I.",
    imamRole: "Imam Rawatib Masjid Fadhlurrahman",
    muadzinName: "Farhan Al-Ghifari",
    muadzinRole: "Muadzin Masjid Fadhlurrahman",
    time: "11:35 WIB",
    notes: "Saf utama lantai 1 diprioritaskan bagi civitas akademika dan masyarakat sekitar. Harap parkir kendaraan dengan rapi.",
    updatedAt: new Date().toISOString(),
  };

  const masMansur: FridayOfficerSchedule = {
    id: "fri-mas-mansur",
    mosqueId: "mas-mansur",
    mosqueName: "Masjid KH. Mas Mansur",
    mosqueLocation: "Kampus 4 UMS (Pesma)",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: "Drs. Dahlan Rais, M.Hum.",
    khatibTitle: "Ketua BPH UMS / PP Muhammadiyah",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Ukhuwah Islamiyah & Penguatan Karakter Mahasantri Berwawasan Global",
    imamName: "Ustadz Mu'tashim Billah, Lc.",
    imamRole: "Imam & Pembina Pesma KH. Mas Mansur",
    muadzinName: "Zaidan Ilham, S.Ag.",
    muadzinRole: "Muadzin Pesma KH. Mas Mansur",
    time: "11:35 WIB",
    notes: "Mahasantri Pesma wajib mengisi saf dari depan secara tertib. Dilarang membawa barang berharga tanpa pengawasan.",
    updatedAt: new Date().toISOString(),
  };

  const mahadAbuBakar: FridayOfficerSchedule = {
    id: "fri-mahad-abu-bakar",
    mosqueId: "mahad-abu-bakar",
    mosqueName: "Masjid Ma'had Abu Bakar",
    mosqueLocation: "Kampus 2 UMS",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: "Dr. Mirwan Akhmad Taufiq, M.S.I.",
    khatibTitle: "Direktur Ma'had Abu Bakar Ash-Shiddiq",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Urgensi Bahasa Al-Qur'an dan Keluhuran Adab dalam Menuntut Ilmu",
    imamName: "Syaikh Hasan Al-Yamani, Lc.",
    imamRole: "Imam Ma'had Abu Bakar",
    muadzinName: "Abdullah Azzam",
    muadzinRole: "Muadzin Ma'had Abu Bakar",
    time: "11:35 WIB",
    notes: "Khutbah disampaikan dengan pengantar bahasa Arab fusha dan terjemah ringkas. Jamaah diharapkan menjaga ketenangan.",
    updatedAt: new Date().toISOString(),
  };

  const arRazi: FridayOfficerSchedule = {
    id: "fri-ar-razi",
    mosqueId: "ar-razi",
    mosqueName: "Masjid Ar-Razi FKG",
    mosqueLocation: "Kampus 4 UMS (FKG)",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: "drg. Morita Sari, Sp.KG., Ph.D.",
    khatibTitle: "Dosen FKG UMS / Praktisi Kesehatan Islam",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Kesehatan Jasmani dan Ruhani sebagai Amanah Dakwah Kedokteran Islam",
    imamName: "Ustadz Fathurrahman Al-Hafizh",
    imamRole: "Imam Masjid Ar-Razi",
    muadzinName: "Ilham Ramadhan, S.KG.",
    muadzinRole: "Muadzin Masjid Ar-Razi",
    time: "11:35 WIB",
    notes: "Disediakan tempat wudhu higienis di sayap timur dan barat. Jamaah diimbau membawa sajadah pribadi.",
    updatedAt: new Date().toISOString(),
  };

  const munajatShabran: FridayOfficerSchedule = {
    id: "fri-munajat-shabran",
    mosqueId: "munajat-shabran",
    mosqueName: "Masjid Munajat Shabran",
    mosqueLocation: "Makamhaji (Pondok Shabran)",
    date: primary?.date || "Jumat, 16 Oktober 2026",
    hijriDate: primary?.hijriDate || "5 Rabiul Akhir 1448 H",
    khatibName: "Nurul Huda, M.Ag.",
    khatibTitle: "Mudir Pondok Hajjah Nuriyah Shabran",
    khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
    khutbahTheme: "Menyiapkan Ulama Intelek dan Intelek Ulama untuk Kepemimpinan Umat",
    imamName: "Ustadz Saifuddin, M.Ag.",
    imamRole: "Imam Masjid Munajat Shabran",
    muadzinName: "Ibrahim Maulana",
    muadzinRole: "Muadzin Kader Shabran",
    time: "11:35 WIB",
    notes: "Shalat Jumat terbuka bagi santri, asatidz, dan masyarakat Makamhaji sekitarnya.",
    updatedAt: new Date().toISOString(),
  };

  return [sudalmiyah, fadhlurrahman, masMansur, mahadAbuBakar, arRazi, munajatShabran];
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

export function getDefaultPopupBanners(): PopupBanner[] {
  return [
    {
      id: "popup-patungan-air-01",
      title: "Patungan Air Minum Sehat & Gratis Masjid Hj. Sudalmiyah Rais",
      imageUrl: "/images/popup/patungan-air-minum.jpg",
      targetUrl: "/donasi",
      isActive: true,
      updatedAt: "2026-10-15T13:08:05.000Z",
    },
  ];
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync("AdminSudalmiyah2026!", 10);
  const studentPasswordHash = bcrypt.hashSync("MahasiswaUMS2026!", 10);
  const defaultSchedules = getDefaultFridaySchedules();
  const defaultPopups = getDefaultPopupBanners();

  return {
    users: [
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
      },
    ],
    fridaySchedule: defaultSchedules[0],
    fridaySchedules: defaultSchedules,
    qrisSettings: {
      id: "qris-01",
      imageUrl: "/images/qris-sudalmiyah.png",
      merchantName: "LAZ UMS-MSJD SUDALMIYAH",
      nmid: "ID2024353816125",
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
        facilityName: "Aula Utama Lt 1",
        eventTitle: "Darul Arqam Dasar (DAD) Calon Kader IMM",
        eventDate: "2026-10-24",
        startTime: "08:00",
        endTime: "16:00",
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
  };
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
    memoryDb = JSON.parse(content);
    lastDbMtimeMs = stat.mtimeMs;
    if (!memoryDb?.fridaySchedules || memoryDb.fridaySchedules.length < 6) {
      const defaults = getDefaultFridaySchedules(memoryDb?.fridaySchedule);
      if (!memoryDb?.fridaySchedules || memoryDb.fridaySchedules.length === 0) {
        memoryDb!.fridaySchedules = defaults;
      } else {
        const existingMap = new Map(memoryDb.fridaySchedules.map((s) => [s.mosqueId || s.id, s]));
        memoryDb!.fridaySchedules = defaults.map((d) => {
          const key = d.mosqueId || d.id;
          return existingMap.get(key) || d;
        });
      }
    }
    if (!memoryDb?.fridaySchedule) {
      memoryDb!.fridaySchedule = memoryDb!.fridaySchedules[0];
    }
    if (!memoryDb?.qrisSettings) {
      memoryDb!.qrisSettings = getInitialData().qrisSettings;
    }
    if (!memoryDb?.feedbacks) {
      memoryDb!.feedbacks = getInitialData().feedbacks || [];
    }
    if (!memoryDb?.documents || memoryDb.documents.length === 0) {
      memoryDb!.documents = getDefaultDocuments();
    }
    if (memoryDb?.agendas) {
      const initial = getInitialData();
      memoryDb.agendas.forEach((a) => {
        if (!a.bannerUrl) {
          const match = initial.agendas.find((ia) => ia.id === a.id);
          a.bannerUrl = match?.bannerUrl || "/uploads/agendas/agenda-jumat.jpg";
        }
      });
    }
    if (!memoryDb?.users || memoryDb.users.length === 0) {
      memoryDb!.users = getInitialData().users;
    }
    if (!Array.isArray(memoryDb?.popupBanners) || memoryDb.popupBanners.length === 0) {
      if (memoryDb?.popupBanner) {
        memoryDb!.popupBanners = [memoryDb.popupBanner];
      } else {
        const defaults = getDefaultPopupBanners();
        memoryDb!.popupBanners = defaults;
        memoryDb!.popupBanner = defaults[0] || null;
      }
    }
    return memoryDb as DatabaseSchema;
  } catch (err) {
    console.error("Database read error, falling back to initial data:", err);
    if (memoryDb) return memoryDb;
    const fallback = getInitialData();
    memoryDb = fallback;
    return fallback;
  }
}

export function saveDb(data: DatabaseSchema): void {
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
}

export function logSecurityEvent(
  action: string,
  actor: string,
  ip: string,
  status: "SUCCESS" | "WARNING" | "BLOCKED",
  details: string
): void {
  try {
    const db = getDb();
    if (!db.auditLogs) db.auditLogs = [];
    const log: SecurityAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      action,
      actor,
      status,
      details,
    };
    db.auditLogs.unshift(log);
    if (db.auditLogs.length > 200) {
      db.auditLogs = db.auditLogs.slice(0, 200);
    }
    saveDb(db);
  } catch (err) {
    console.warn("Security event logging error ignored:", err);
  }
}
