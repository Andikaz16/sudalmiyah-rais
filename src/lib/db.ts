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
  KhutbahItem,
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
  documentsLocked?: boolean;
  manualNews?: ManualNewsItem[];
  prayerAttendances?: PrayerAttendance[];
  khutbahList?: KhutbahItem[];
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
    imamRole: primary?.imamRole || "Dosen",
    muadzinName: primary?.muadzinName || "Dalam Konfirmasi",
    muadzinRole: primary?.muadzinRole || "Mahasiswa",
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
    imamRole: "Dosen",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Mahasiswa",
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
    imamRole: "Dosen",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Mahasiswa",
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
    imamRole: "Dosen",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Mahasiswa",
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
    imamRole: "Dosen",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Mahasiswa",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  const munajatShabran: FridayOfficerSchedule = {
    id: "fri-munajat-shabran",
    mosqueId: "munajat-shabran",
    mosqueName: "Masjid Al-Munajat",
    mosqueLocation: "Makamhaji (Pondok Shabran)",
    date: primary?.date || "Jumat Pekan Ini",
    hijriDate: getSafeHijri(primary?.hijriDate),
    khatibName: "Dalam Konfirmasi",
    khatibTitle: "Akan Diumumkan Takmir",
    khatibPhotoUrl: "",
    khutbahTheme: "Tema Khutbah Dalam Konfirmasi",
    imamName: "Dalam Konfirmasi",
    imamRole: "Dosen",
    muadzinName: "Dalam Konfirmasi",
    muadzinRole: "Mahasiswa",
    time: "11:35 WIB",
    notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
    updatedAt: new Date().toISOString(),
  };

  return [sudalmiyah, fadhlurrahman, masMansur, mahadAbuBakar, munajatShabran, arRazi];
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

export function getDefaultKhutbahList(): KhutbahItem[] {
  return [
    {
      id: "khutbah-sm-01",
      title: "Khutbah Jum'at: 5 Kezaliman yang Sering Dinormalkan di Era Digital",
      slug: "5-kezaliman-yang-sering-dinormalkan-di-era-digital",
      theme: "Akhlak & Muamalah Digital",
      source: "SUARA_MUHAMMADIYAH",
      author: "Dwi Arianto, S.Pd.I. (Sekretaris Majelis Tarjih & Tajdid PDM Kota Bandar Lampung)",
      date: "30 Oktober 2026",
      summary: "Mengulas fenomena kezaliman di era informasi modern yang sering dianggap wajar: ghibah online, penyebaran berita tanpa tabayyun, menunda bayar utang, memeras hak pekerja, hingga merusak fasilitas bersama.",
      firstKhutbah: `إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا، مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ، وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ.

أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا وَنَبِيَّنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ لَا نَبِيَّ بَعْدَهُ.

اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ، وَعَلَى آلِهِ وَأَصْحَابِهِ وَمَنْ تَبِعَهُمْ بِإِحْسَانٍ إِلَى يَوْمِ الدِّينِ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللَّهِ الْعَظِيمِ، فَقَدْ فَازَ الْمُتَّقُونَ. قَالَ اللَّهُ تَعَالَى فِي الْقُرْآنِ الْكَرِيمِ:
يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ.

Ma'asyiral Muslimin Jamaah Shalat Jumat yang Dirahmati Allah,

Marilah kita senantiasa memanjatkan puji dan syukur ke hadirat Allah Subhanahu wa Ta'ala atas limpahan nikmat iman, Islam, dan kesehatan sehingga kita dapat melangkahkan kaki ke rumah Allah dalam suasana persaudaraan yang tulus. Shalawat serta salam semoga senantiasa tercurah kepada baginda Rasulullah Muhammad Shallallahu 'Alaihi Wasallam, uswah hasanah sepanjang zaman.

Khatib berwasiat kepada diri sendiri dan kepada segenap jamaah sekalian, marilah kita memperkokoh ketakwaan kepada Allah dengan menunaikan segala syariat-Nya dan menjauhkan diri dari segala kemaksiatan serta kezaliman.

Jamaah Shalat Jumat Rahimakumullah,

Kezaliman adalah kegelapan gulita pada hari kiamat, sebagaimana sabda Rasulullah SAW:
الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ (HR. Al-Bukhari & Muslim).

Namun sungguh memprihatinkan, di zaman keterbukaan informasi dan kemudahan hidup saat ini, banyak tindakan zalim yang tanpa sadar justru dinormalkan dalam pergaulan sehari-hari. Setidaknya terdapat lima kezaliman yang wajib kita waspadai:

1. Ghibah dan Mencela di Ruang Maya
Menggunjing aib orang lain, sindir-menyindir di media sosial, dan merendahkan martabat sesama dianggap konten biasa. Padahal Allah Ta'ala berfirman dalam Surah Al-Hujurat ayat 12 mengumpamakannya seperti memakan bangkai saudara sendiri.

2. Menyebarkan Informasi Tanpa Tabayyun
Mudah meneruskan kabar viral tanpa verifikasi kebenaran. Rasulullah SAW mengingatkan: "Cukuplah seseorang dicap pendosa bila menceritakan segala yang ia dengar tanpa disaring" (HR. Muslim).

3. Menunda Pembayaran Utang Padahal Mampu
Rasulullah SAW bersabda: "مَطْلُ الْغَنِيِّ ظُلْمٌ" (Penundaan pembayaran utang oleh orang yang berkecukupan adalah perbuatan zalim - HR. Bukhari). Menunda hak orang lain demi gengsi konsumtif merusak keberkahan rezeki.

4. Mengurangi Hak dan Memeras Tenaga Orang Lain
Mengabaikan upah layak pekerja, menunda hak bawahan, atau membebankan tugas di luar batas tanpa penghargaan yang adil.

5. Merusak Fasilitas Umum dan Lingkungan Bersama
Membuang sampah seenaknya di area kampus, merusak fasilitas masjid, dan merampas hak kenyamanan orang banyak adalah kezaliman sosial yang pertanggungjawabannya sangat berat di hadapan Allah.

Marilah kita bersihkan hati, bertabayyun sebelum bertindak, dan segera menunaikan hak-hak sesama hamba sebelum ajal menjemput.

بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَنَفَعَنِي وَإِيَّاكُمْ بِمَا فِيهِ مِنَ الْآيَاتِ وَالذِّكْرِ الْحَكِيمِ. أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ الْعَظِيمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ مِنْ كُلِّ ذَنْبٍ، فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ.`,
      secondKhutbah: `الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا كَمَا أَمَرَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ الشَّفِيعُ فِي الْمَحْشَرِ.

اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ تَعَالَى فِيمَا أَمَرَ، وَانْتَهُوا عَمَّا نَهَى عَنْهُ وَزَجَرَ.

وَاعْلَمُوا أَنَّ اللَّهَ أَمَرَكُمْ بِأَمْرٍ عَظِيمٍ، أَمَرَكُمْ بِالصَّلَاةِ وَالسَّلَامِ عَلَى نَبِيِّهِ الْكَرِيمِ، فَقَالَ جَلَّ جَلَالُهُ:
إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا.

اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، وَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.

اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ.
اللَّهُمَّ أَعِزَّ الْإِسْلَامَ وَالْمُسْلِمِينَ، وَأَلِّفْ بَيْنَ قُلُوبِنَا، وَأَصْلِحْ ذَاتَ بَيْنِنَا، وَانْصُرْنَا عَلَى أَعْدَائِنَا.
اللَّهُمَّ احْفَظْ بِلَادَنَا إِنْدُونِيسِيَا وَاجْعَلْهَا بَلْدَةً طَيِّبَةً آمِنَةً مُطْمَئِنَّةً سَخَاءً رَخَاءً وَسَائِرَ بِلَادِ الْمُسْلِمِينَ.

رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.

عِبَادَ اللَّهِ، إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى وَيَنْهَى عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ وَالْبَغْيِ، يَعِظُكُمْ لَعَلَّكُمْ تَذَكَّرُونَ. فَاذْكُرُوا اللَّهَ الْعَظِيمَ يَذْكُرْكُمْ، وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ، وَلَذِكْرُ اللَّهِ أَكْبَرُ، وَاللَّهُ يَعْلَمُ مَا تَصْنَعُونَ.`,
      sourceUrl: "https://suaramuhammadiyah.id/read/khutbah-jum-at-5-kezaliman-yang-kita-normalkan",
      createdAt: "2026-10-30T10:00:00.000Z",
      isPublished: true,
    },
    {
      id: "khutbah-sm-02",
      title: "Khutbah Jum'at: Masa Muda, Kesempatan Emas yang Tak Kembali",
      slug: "masa-muda-kesempatan-emas-yang-tak-kembali",
      theme: "Generasi Muda & AIK",
      source: "SUARA_MUHAMMADIYAH",
      author: "Muhammad DN, M.H.I. (Ketua PDM Hulu Sungai Tengah, Kalimantan Selatan)",
      date: "23 Oktober 2026",
      summary: "Menyoroti peran strategis pemuda muslim dalam memanfaatkan masa emas usia muda untuk menuntut ilmu, berakhlak karimah, mengabdi pada persyarikatan, dan tidak terjerumus pada kesia-siaan zaman.",
      firstKhutbah: `إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَسَيِّئَاتِ أَعْمَالِنَا. مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ، وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ.

أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ نَبِيَّنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ الصَّادِقُ الْأَمِينُ.
اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى مُحَمَّدٍ وَعَلَى آلِهِ وَصَحَابَتِهِ أَجْمَعِينَ.

أَمَّا بَعْدُ، فَيَا أَيُّهَا الْحَاضِرُونَ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللَّهِ الْعَلِيِّ الْقَدِيرِ، فَقَدْ فَازَ مَنِ اتَّقَى.

Kaum Muslimin Sidang Shalat Jumat yang Berbahagia,

Masa muda adalah fase kehidupan yang paling berharga, penuh energi, semangat, dan daya cipta. Namun ia bagaikan embun pagi yang lekas menguap seiring bergulirnya waktu. Rasulullah Shallallahu 'Alaihi Wasallam telah mengingatkan kita dalam hadits masyhur riwayat Al-Hakim:
اِغْتَنِمْ خَمْسًا قَبْلَ خَمْسٍ: شَبَابَكَ قَبْلَ هَرَمِكَ، وَصِحَّتَكَ قَبْلَ سَقَمِكَ، وَغِنَاكَ قَبْلَ فَقْرِكَ، وَفَرَاغَكَ قَبْلَ شُغْلِكَ، وَحَيَاتَكَ قَبْلَ مَوْتِكَ.
"Manfaatkan lima perkara sebelum lima perkara: masa mudamu sebelum masa tuamu, sehatmu sebelum sakitmu, kayamu sebelum miskinmu, luangmu sebelum sibukmu, dan hidupmu sebelum matimu."

Bagi para mahasiswa dan generasi muda sivitas akademika, masa belajar di kampus bukanlah sekadar mengejar selembar ijazah, melainkan momentum pembentukan karakter ketakwaan, adab, dan keahlian yang membawa kemaslahatan bagi umat. Jadikan masa muda kita saksi pembelaan di hadapan Allah kelak di Padang Mahsyar.

بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ، فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ.`,
      secondKhutbah: `الْحَمْدُ لِلَّهِ وَكَفَى، وَالصَّلَاةُ وَالسَّلَامُ عَلَى النَّبِيِّ الْمُصْطَفَى، وَعَلَى آلِهِ وَصَحْبِهِ أَهْلِ الصِّدْقِ وَالْوَفَا.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ، وَاعْلَمُوا أَنَّ خَيْرَ الزَّادِ التَّقْوَى.

اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ.
اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ.
اللَّهُمَّ اجْعَلْ شَبَابَنَا شَبَابًا صَالِحًا، قَوِيَّ الْإِيمَانِ، صَاحِبَ هِمَّةٍ عَالِيَةٍ فِي خِدْمَةِ الدِّينِ وَالْوَطَنِ.
رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. عِبَادَ اللَّهِ، أَقِيمُوا الصَّلَاةَ.`,
      sourceUrl: "https://suaramuhammadiyah.id/read/khutbah-jum-at-masa-muda-kesempatan-yang-tak-kembali",
      createdAt: "2026-10-23T10:00:00.000Z",
      isPublished: true,
    },
    {
      id: "khutbah-takmir-01",
      title: "Khutbah Jum'at: Meneguhkan Sinergi & Akhlak Berkemajuan Sivitas Akademika",
      slug: "meneguhkan-sinergi-dan-akhlak-berkemajuan",
      theme: "Islam Berkemajuan & Kampus",
      source: "TAKMIR_MASJID",
      author: "Prof. Dr. Syamsul Hidayat, M.Ag. (Dewan Pembina Takmir Masjid Kampus UMS)",
      date: "17 Oktober 2026",
      summary: "Panduan khutbah resmi Masjid Hj. Sudalmiyah Rais tentang integrasi keilmuan, keadaban, dan nilai-nilai Al-Islam Kemuhammadiyahan (AIK) dalam membangun peradaban kampus yang unggul dan bermartabat.",
      firstKhutbah: `إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا.

أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.
اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللَّهِ الْعَظِيمِ، فَقَدْ فَازَ الْمُتَّقُونَ.

Jamaah Shalat Jumat yang Dimuliakan Allah,

Universitas Muhammadiyah Surakarta dengan enam masjid kampusnya mengemban amanah besar untuk melahirkan insan akademis yang berakhlak mulia, berkeunggulan intelektual, dan berjiwa pencerah. Masjid bukan hanya tempat shalat fardhu, tetapi jantung pembinaan moral, etika akademik, dan ukhuwah islamiyah.

Marilah kita jadikan kejujuran akademik, ketertiban saf berjamaah, dan kepedulian sosial sebagai cerminan nyata dari nilai-nilai Islam Berkemajuan.

بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ وَلِجَمِيعِ الْمُسْلِمِينَ.`,
      secondKhutbah: `الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ الْكَرِيمِ.

اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ.
اللَّهُمَّ اغْفِرْ لِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ وَالْمُسْلِمِينَ وَالْمُسْلِمَاتِ.
اللَّهُمَّ بَارِكْ فِي جَامِعَتِنَا، وَانْفَعْ بِهَا الْإِسْلَامَ وَالْمُسْلِمِينَ، وَاجْعَلْ طُلَّابَنَا وَأَسَاتِذَتَنَا قُدْوَةً فِي الْعِلْمِ وَالْعَمَلِ.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. عِبَادَ اللَّهِ، أَقِيمُوا الصَّلَاةَ.`,
      fileUrl: "/documents/khutbah-sinergi-akhlak-berkemajuan.pdf",
      fileName: "khutbah-sinergi-akhlak-berkemajuan.pdf",
      createdAt: "2026-10-17T10:00:00.000Z",
      isPublished: true,
    },
    {
      id: "khutbah-takmir-02",
      title: "Khutbah Jum'at: Memakmurkan Masjid Kampus dan Merawat Shalat Berjamaah",
      slug: "memakmurkan-masjid-kampus-dan-merawat-shalat-berjamaah",
      theme: "Ibadah & Taqwa",
      source: "TAKMIR_MASJID",
      author: "Drs. H. Dodi Afianto, M.Pd. (Takmir Pelaksana Masjid Kampus UMS)",
      date: "10 Oktober 2026",
      summary: "Tuntunan praktis mengenai keutamaan melangkahkan kaki ke masjid untuk shalat berjamaah, merapatkan shaf shalat, serta menjaga adab ketenangan di dalam rumah Allah.",
      firstKhutbah: `إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَسَيِّئَاتِ أَعْمَالِنَا.

أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.
اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ.

Ma'asyiral Muslimin Jamaah Shalat Jumat yang Berbahagia,

Kemakmuran sebuah masjid bukan dinilai dari kemegahan kubah dan menaranya, melainkan dari kepadatan saf-saf shalat berjamaah dan geliat majelis taklim di dalamnya. Allah Subhanahu wa Ta'ala berfirman dalam Surah At-Taubah ayat 18:
إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ وَلَمْ يَخْشَ إِلَّا اللَّهَ فَعَسَى أُولَئِكَ أَنْ يَكُونُوا مِنَ الْمُهْتَدِينَ.
"Hanyalah yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan hari kemudian, serta tetap mendirikan shalat, menunaikan zakat dan tidak takut melainkan kepada Allah."

Mari kita luangkan waktu di sela perkuliahan dan pekerjaan untuk senantiasa mendatangi panggilan adzan di masjid kampus.

بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَأَسْتَغْفِرُ اللَّهَ لِي وَلَكُمْ.`,
      secondKhutbah: `الْحَمْدُ لِلَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، وَعَلَى آلِهِ وَصَحْبِهِ وَمَنْ وَالَاهُ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ وَحَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَى وَقُومُوا لِلَّهِ قَانِتِينَ.
اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ.
اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَحَبِّبْ إِلَيْنَا الْإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ. عِبَادَ اللَّهِ، أَقِيمُوا الصَّلَاةَ.`,
      fileUrl: "/documents/khutbah-memakmurkan-masjid.pdf",
      fileName: "khutbah-memakmurkan-masjid.pdf",
      createdAt: "2026-10-10T10:00:00.000Z",
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
  return [];
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
    feedbacks: [],
    documents: getDefaultDocuments(),
    documentsLocked: true,
    manualNews: getDefaultManualNews(),
    prayerAttendances: getDefaultPrayerAttendances(),
    khutbahList: getDefaultKhutbahList(),
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
  if (data.fridaySchedules) {
    data.fridaySchedules.forEach((s) => {
      if (s.imamRole === "Imam Shalat Jumat" || !s.imamRole) s.imamRole = "Dosen";
      if (s.muadzinRole === "Muadzin Shalat Jumat" || !s.muadzinRole) s.muadzinRole = "Mahasiswa";
    });
  }
  if (!data.fridaySchedule && data.fridaySchedules && data.fridaySchedules[0]) {
    data.fridaySchedule = data.fridaySchedules[0];
  }
  if (data.fridaySchedule) {
    if (data.fridaySchedule.imamRole === "Imam Shalat Jumat" || !data.fridaySchedule.imamRole) {
      data.fridaySchedule.imamRole = "Dosen";
    }
    if (data.fridaySchedule.muadzinRole === "Muadzin Shalat Jumat" || !data.fridaySchedule.muadzinRole) {
      data.fridaySchedule.muadzinRole = "Mahasiswa";
    }
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
  if (data.documentsLocked === undefined) {
    data.documentsLocked = true;
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
  if (!Array.isArray(data.prayerAttendances)) {
    data.prayerAttendances = [];
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
  if (!Array.isArray(data.khutbahList) || data.khutbahList.length === 0) {
    data.khutbahList = getDefaultKhutbahList();
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

