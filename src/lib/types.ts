export type UserRole = "ADMIN_TAKMIR" | "PENGURUS_AGENDA" | "JAMAAH_MAHASISWA" | "JAMAAH_UMUM";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  nim?: string;
  faculty?: string;
  phone?: string;
  createdAt: string;
}

export interface PrayerTime {
  name: "Subuh" | "Terbit" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya";
  time: string;
  isNext?: boolean;
}

export interface DailySchedule {
  date: string;
  hijri: string;
  times: {
    Imsak: string;
    Subuh: string;
    Terbit: string;
    Dhuha: string;
    Dzuhur: string;
    Ashar: string;
    Maghrib: string;
    Isya: string;
  };
}

export type AgendaCategory = "SHALAT_JUMAT" | "KAJIAN_MAHASISWA" | "TABLIGH_AKBAR" | "TAHSIN" | "SOSIAL";

export interface Agenda {
  id: string;
  title: string;
  category: AgendaCategory;
  speaker: string;
  speakerRole: string;
  date: string;
  time: string;
  location: string;
  description: string;
  quota: number;
  registeredCount: number;
  isOpen: boolean;
  requiresRegistration: boolean;
  bannerUrl?: string;
  createdAt: string;
}

export interface FridayOfficerSchedule {
  id: string;
  mosqueId?: string;
  mosqueName?: string;
  mosqueLocation?: string;
  date: string;
  hijriDate: string;
  khatibName: string;
  khatibTitle: string;
  khatibPhotoUrl: string;
  khutbahTheme: string;
  imamName: string;
  imamRole: string;
  muadzinName: string;
  muadzinRole: string;
  time: string;
  notes?: string;
  updatedAt: string;
}


export interface Registration {
  id: string;
  agendaId: string;
  agendaTitle: string;
  fullName: string;
  email: string;
  phone: string;
  isUmsStudent: boolean;
  nim?: string;
  faculty?: string;
  ticketCode?: string;
  status: "CONFIRMED" | "ATTENDED" | "CANCELLED";
  registeredAt: string;
  attendedAt?: string;
  checkInMethod?: "QR_DYNAMIC" | "MANUAL_ADMIN" | "PRE_REGISTER";
  participantRole?: "MAHASISWA" | "DOSEN_KARYAWAN" | "UMUM";
  locationVerified?: boolean;
  photoUrl?: string;
}

export interface PopupBanner {
  id: string;
  imageUrl: string;
  title: string;
  targetUrl: string;
  detectedCategory?: string;
  aiReasoning?: string;
  isActive: boolean;
  updatedAt: string;
}

export type TransactionType = "INCOME" | "EXPENSE";

export interface FinancialRecord {
  id: string;
  title: string;
  type: TransactionType;
  category: "INFAQ_JUMAT" | "SEDEKAH_SUBUH" | "WAKAF_RENOVASI" | "OPERASIONAL" | "HONORARIUM" | "KEGIATAN_SOSIAL";
  amount: number;
  date: string;
  donorName?: string;
  proofUrl?: string;
  description: string;
  isVerified: boolean;
  verifiedBy?: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  deadline: string;
  description: string;
  isActive: boolean;
}

export interface FacilityBooking {
  id: string;
  applicantName: string;
  organization: string;
  applicantPhone: string;
  nim: string;
  facilityName: "Aula Utama Lt 1" | "Ruang Rapat Takmir" | "Serambi Timur" | "Sound & Multimedia";
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  action: string;
  actor: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
  details: string;
}

export interface QrisSettings {
  id: string;
  imageUrl: string;
  merchantName: string;
  nmid: string;
  institution: string;
  updatedAt: string;
}

export type FeedbackCategory =
  | "IDARAH"
  | "IMARAH"
  | "RIAYAH"
  | "RAMAH_DIFABEL"
  | "ECO_MOSQUE"
  | "KEAMANAN"
  | "LAINNYA";

export type FeedbackStatus = "BARU" | "DITINJAU" | "DITINDAKLANJUTI" | "DIARSIPKAN";

export interface MosqueFeedback {
  id: string;
  name: string;
  isAnonymous: boolean;
  contact?: string;
  targetMosque: string;
  category: FeedbackCategory;
  rating: number;
  message: string;
  status: FeedbackStatus;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
}
