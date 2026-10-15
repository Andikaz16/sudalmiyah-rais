import fs from "fs";
import path from "path";
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
} from "./types";

interface DatabaseSchema {
  users: User[];
  agendas: Agenda[];
  fridaySchedule: FridayOfficerSchedule;
  qrisSettings: QrisSettings;
  registrations: Registration[];
  finances: FinancialRecord[];
  campaigns: DonationCampaign[];
  facilityBookings: FacilityBooking[];
  auditLogs: SecurityAuditLog[];
  feedbacks: MosqueFeedback[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "masjid_store.json");

// In-memory cache for fast reads
let memoryDb: DatabaseSchema | null = null;

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync("AdminSudalmiyah2026!", 10);
  const studentPasswordHash = bcrypt.hashSync("MahasiswaUMS2026!", 10);

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
        id: "agn-01",
        title: "Shalat Jumat Berjamaah & Khutbah Khidmat",
        category: "SHALAT_JUMAT",
        speaker: "Prof. Dr. Sofyan Anif, M.Si.",
        speakerRole: "Rektor Universitas Muhammadiyah Surakarta",
        date: "2026-10-16",
        time: "11:30 - 12:45 WIB",
        location: "Ruang Utama Lantai 2, Masjid Sudalmiyah Rais",
        description:
          "Pelaksanaan Shalat Jumat berjamaah sivitas akademika UMS dan masyarakat umum dengan tema Membangun Integritas Mahasiswa Muslim Berkemajuan.",
        quota: 1500,
        registeredCount: 840,
        isOpen: true,
        requiresRegistration: false,
        bannerUrl: "/uploads/agendas/agenda-jumat.jpg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "agn-02",
        title: "Kajian Tematik Mahasiswa: Fiqih Muamalah Digital & Fintech Syariah",
        category: "KAJIAN_MAHASISWA",
        speaker: "Dr. Syamsul Hidayat, M.Ag.",
        speakerRole: "Ketua Majelis Tarjih & Dosen FAI UMS",
        date: "2026-10-18",
        time: "15:45 - 17:30 WIB",
        location: "Aula Serbaguna Lantai 1, Masjid Sudalmiyah Rais",
        description:
          "Membahas batasan syariah transaksi kripto, paylater, dan pinjaman online dari perspektif fatwa Tarjih Muhammadiyah. Disediakan e-sertifikat kegiatan kampus.",
        quota: 250,
        registeredCount: 182,
        isOpen: true,
        requiresRegistration: true,
        bannerUrl: "/uploads/agendas/agenda-muamalah.jpg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "agn-03",
        title: "Bimbingan Tahsin & Tahfidz Al-Qur'an Mahasiswa",
        category: "TAHSIN",
        speaker: "Ustadz Muhammad Ridwan, Al-Hafizh",
        speakerRole: "Imam Rawatib Masjid Sudalmiyah Rais",
        date: "2026-10-20",
        time: "05:30 - 06:45 WIB (Ba'da Subuh)",
        location: "Serambi Sayap Timur Lantai 2",
        description:
          "Program rutin perbaikan makharijul huruf dan tajwid khusus mahasiswa semester awal hingga akhir. Terbuka untuk ikhwan dan akhwat.",
        quota: 60,
        registeredCount: 48,
        isOpen: true,
        requiresRegistration: true,
        bannerUrl: "/uploads/agendas/agenda-tahsin.jpg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "agn-04",
        title: "Tabligh Akbar: Meneguhkan Nilai Al-Islam & Kemuhammadiyahan di Era AI",
        category: "TABLIGH_AKBAR",
        speaker: "Prof. Dr. Haedar Nashir, M.Si.",
        speakerRole: "Pimpinan Pusat Muhammadiyah",
        date: "2026-10-25",
        time: "08:30 - 11:30 WIB",
        location: "Kawasan Utama & Plaza Masjid Sudalmiyah Rais",
        description:
          "Kuliah umum keislaman akbar dalam rangka milad universitas. Terbuka untuk seluruh dosen, tenaga kependidikan, mahasiswa, dan jamaah umum se-Soloraya.",
        quota: 2000,
        registeredCount: 1420,
        isOpen: true,
        requiresRegistration: true,
        bannerUrl: "/uploads/agendas/agenda-tabligh.jpg",
        createdAt: new Date().toISOString(),
      },
      {
        id: "agn-05",
        title: "Subuh Akbar & Sarapan Berkah Bersama Jamaah",
        category: "SOSIAL",
        speaker: "Ustadz H. Anhar Ahmad, S.Ag.",
        speakerRole: "Korps Muballigh Muhammadiyah Surakarta",
        date: "2026-10-22",
        time: "04:15 - 06:00 WIB",
        location: "Masjid Sudalmiyah Rais Kampus 2 UMS",
        description:
          "Kajian subuh dilanjutkan sarapan bersama gratis bagi mahasiswa dan musafir yang didanai melalui donasi sedekah subuh.",
        quota: 500,
        registeredCount: 310,
        isOpen: true,
        requiresRegistration: false,
        bannerUrl: "/uploads/agendas/agenda-subuh.jpg",
        createdAt: new Date().toISOString(),
      },
    ],
    fridaySchedule: {
      id: "fri-01",
      date: "Jumat, 16 Oktober 2026",
      hijriDate: "5 Rabiul Akhir 1448 H",
      khatibName: "Prof. Dr. Sofyan Anif, M.Si.",
      khatibTitle: "Rektor Universitas Muhammadiyah Surakarta",
      khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
      khutbahTheme: "Membangun Integritas Moral & Karakter Mahasiswa Muslim Berkemajuan di Era AI",
      imamName: "Ustadz Muhammad Ridwan, Al-Hafizh",
      imamRole: "Imam Rawatib Masjid Sudalmiyah Rais",
      muadzinName: "Bilal Ramadhan, S.Kom.",
      muadzinRole: "Muadzin Masjid Sudalmiyah Rais",
      time: "11:35 WIB",
      notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid, serta menata alas kaki dengan rapi di loker yang disediakan.",
      updatedAt: new Date().toISOString(),
    },
    qrisSettings: {
      id: "qris-01",
      imageUrl: "/images/qris-sudalmiyah.png",
      merchantName: "LAZ UMS-MSJD SUDALMIYAH",
      nmid: "ID2024353816125",
      institution: "Universitas Muhammadiyah Surakarta",
      updatedAt: new Date().toISOString(),
    },
    registrations: [
      {
        id: "reg-001",
        agendaId: "agn-02",
        agendaTitle: "Kajian Tematik Mahasiswa: Fiqih Muamalah Digital & Fintech Syariah",
        fullName: "Ahmad Fauzi",
        email: "l200210001@student.ums.ac.id",
        phone: "089876543210",
        isUmsStudent: true,
        nim: "L200210001",
        faculty: "Fakultas Komunikasi dan Informatika",
        ticketCode: "SUDALMIYAH-TKT-9921",
        status: "CONFIRMED",
        registeredAt: new Date().toISOString(),
      },
    ],
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
  };
}

export function getDb(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  ensureDbDirectory();

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    memoryDb = initial;
    return initial;
  }

  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    memoryDb = JSON.parse(content);
    if (!memoryDb?.fridaySchedule) {
      memoryDb!.fridaySchedule = getInitialData().fridaySchedule;
      saveDb(memoryDb!);
    }
    if (!memoryDb?.qrisSettings) {
      memoryDb!.qrisSettings = getInitialData().qrisSettings;
      saveDb(memoryDb!);
    }
    if (!memoryDb?.feedbacks) {
      memoryDb!.feedbacks = getInitialData().feedbacks || [];
      saveDb(memoryDb!);
    }
    if (memoryDb?.agendas) {
      let modified = false;
      const initial = getInitialData();
      memoryDb.agendas.forEach((a) => {
        if (!a.bannerUrl) {
          const match = initial.agendas.find((ia) => ia.id === a.id);
          a.bannerUrl = match?.bannerUrl || "/uploads/agendas/agenda-jumat.jpg";
          modified = true;
        }
      });
      if (modified) saveDb(memoryDb);
    }
    return memoryDb as DatabaseSchema;
  } catch {
    const fallback = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), "utf-8");
    memoryDb = fallback;
    return fallback;
  }
}

export function saveDb(data: DatabaseSchema): void {
  ensureDbDirectory();
  memoryDb = data;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function logSecurityEvent(
  action: string,
  actor: string,
  ip: string,
  status: "SUCCESS" | "WARNING" | "BLOCKED",
  details: string
): void {
  const db = getDb();
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
}
