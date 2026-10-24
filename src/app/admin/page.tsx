"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  User,
  QrCode,
  Tv,
  ExternalLink,
  MessageSquare,
  Star,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Check,
  Reply,
  Building2,
  AlertCircle,
  Phone,
  MessageCircle,
  Sparkles,
  FileText,
  BookOpen,
  Download,
  Plus,
  Edit2,
  Hourglass,
  Timer,
  RotateCcw,
  Camera,
  X,
  Database,
  Copy,
  Newspaper,
  History,
  Coins,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  LogOut,
  Lock,
  Unlock,
  ShieldAlert,
} from "lucide-react";
import {
  Agenda,
  FridayOfficerSchedule,
  QrisSettings,
  Registration,
  MosqueFeedback,
  FeedbackCategory,
  FeedbackStatus,
  PopupBanner,
  DownloadDocument,
  DocumentCategory,
  isPopupExpired,
  getPopupRemainingTime,
  ManualNewsItem,
  PrayerAttendance,
  PrayerName,
} from "@/lib/types";
import { normalizeImageUrl } from "@/lib/utils";
import { getHijriDate } from "@/lib/prayer-times";

function calculateFridayInfo(weeksOffset: number = 0) {
  const now = new Date();
  const day = now.getDay(); // 0 = Minggu, 5 = Jumat
  const daysUntilFriday = (5 - day + 7) % 7;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilFriday + weeksOffset * 7);

  const masehi = target.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hijri = getHijriDate(target, false, "id");
  return { masehi, hijri, target };
}

const ADMIN_MOSQUES = [
  { id: "sudalmiyah", name: "Masjid Hj. Sudalmiyah Rais", location: "Kampus 2 UMS" },
  { id: "fadhlurrahman", name: "Masjid Fadhlurrahman", location: "Kampus 1 UMS" },
  { id: "mas-mansur", name: "Masjid KH. Mas Mansur", location: "Kampus 4 UMS (Pesma)" },
  { id: "mahad-abu-bakar", name: "Masjid Ma'had Abu Bakar", location: "Kampus 2 UMS" },
  { id: "munajat-shabran", name: "Masjid Al-Munajat", location: "Makamhaji (Pondok Shabran)" },
  { id: "ar-razi", name: "Masjid Ar-Razi FKG", location: "Kampus 4 UMS (FKG)" },
];

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "TARJIH_FIQIH", label: "Tarjih & Fiqih" },
  { value: "IDEOLOGI", label: "Ideologi & Akhlak" },
  { value: "KEMUHAMMADIYAHAN", label: "Kemuhammadiyahan" },
  { value: "DOKUMEN_MUKTAMAR", label: "Dokumen Muktamar" },
  { value: "PANDUAN_MASJID", label: "Panduan Takmir" },
  { value: "UMUM", label: "Lainnya / Umum" },
];

const ADMIN_TABS = [
  { id: "AGENDAS", label: "Kelola Agenda & Kajian", shortLabel: "Agenda & Kajian", icon: Calendar },
  { id: "PETUGAS_JUMAT", label: "Petugas Shalat Jumat", shortLabel: "Petugas Jumat", icon: Clock },
  { id: "QRIS_INFAQ", label: "Kelola QRIS Infaq", shortLabel: "QRIS Infaq", icon: QrCode },
  { id: "REGISTRATIONS", label: "Presensi Kehadiran Agenda", shortLabel: "Presensi Agenda", icon: Users },
  { id: "ABSENSI_SHALAT", label: "Absensi Shalat Berjamaah", shortLabel: "Absensi Shalat", icon: CheckCircle2 },
  { id: "FEEDBACK", label: "Kotak Saran & Aspirasi", shortLabel: "Kotak Saran", icon: MessageSquare },
  { id: "POPUP_BANNER", label: "Pop-up Banner Beranda", shortLabel: "Pop-up Banner", icon: Sparkles },
  { id: "DOCUMENTS", label: "Pustaka & Dokumen", shortLabel: "Pustaka Dokumen", icon: BookOpen },
  { id: "BERITA_MASJID", label: "Warta & Berita Masjid", shortLabel: "Warta Berita", icon: Newspaper },
] as const;

// Client-side image compressor: optimizes uploads for fast transfer & avoids serverless payload limits
async function compressImageForUpload(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
            } else {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, ".jpg"),
                {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                }
              );
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "AGENDAS" | "PETUGAS_JUMAT" | "QRIS_INFAQ" | "REGISTRATIONS" | "ABSENSI_SHALAT" | "FEEDBACK" | "POPUP_BANNER" | "DOCUMENTS" | "BERITA_MASJID"
  >("AGENDAS");

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabScroll = () => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = direction === "left" ? -280 : 280;
    tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkTabScroll, 320);
  };

  useEffect(() => {
    checkTabScroll();
    const el = tabsContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkTabScroll);
      window.addEventListener("resize", checkTabScroll);
      return () => {
        el.removeEventListener("scroll", checkTabScroll);
        window.removeEventListener("resize", checkTabScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeEl = tabsContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
    setTimeout(checkTabScroll, 350);
  }, [activeTab]);
  const [stats, setStats] = useState<{
    totalAgendas: number;
    totalRegistrations: number;
    pendingBookings: number;
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    totalFeedbacks?: number;
    pendingFeedbacks?: number;
  } | null>(null);

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationAgendaFilter, setRegistrationAgendaFilter] = useState<string>("ALL");

  const exportPresensiCsv = () => {
    const listToExport =
      registrationAgendaFilter === "ALL"
        ? registrations
        : registrations.filter((r) => r.agendaId === registrationAgendaFilter);

    if (listToExport.length === 0) {
      alert("Tidak ada data presensi agenda untuk diunduh.");
      return;
    }

    const headers = [
      "No",
      "Kode Tiket",
      "Nama Lengkap",
      "Peran Jamaah",
      "NIM",
      "Fakultas",
      "Email",
      "No WhatsApp",
      "Agenda Kegiatan",
      "Tanggal Presensi",
      "Waktu Presensi",
      "Verifikasi Lokasi GPS",
      "Status",
      "URL Foto Bukti",
    ];

    const rows = listToExport.map((reg, idx) => {
      const dateStr = reg.attendedAt
        ? new Date(reg.attendedAt).toLocaleDateString("id-ID")
        : reg.registeredAt
        ? new Date(reg.registeredAt).toLocaleDateString("id-ID")
        : "-";
      const timeStr = reg.attendedAt
        ? new Date(reg.attendedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "-";

      return [
        idx + 1,
        `"${reg.ticketCode || "-"}"`,
        `"${(reg.fullName || "").replace(/"/g, '""')}"`,
        `"${reg.participantRole || (reg.isUmsStudent ? "MAHASISWA" : "UMUM")}"`,
        `"${reg.nim || "-"}"`,
        `"${(reg.faculty || "-").replace(/"/g, '""')}"`,
        `"${reg.email || "-"}"`,
        `"${reg.phone || "-"}"`,
        `"${(reg.agendaTitle || "-").replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${reg.locationVerified ? "Terverifikasi di Kawasan Masjid UMS" : "Manual"}"`,
        `"${reg.status}"`,
        `"${reg.photoUrl || "-"}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const agendaTitle =
      registrationAgendaFilter === "ALL"
        ? "Semua_Agenda"
        : (agendas.find((a) => a.id === registrationAgendaFilter)?.title || "Agenda").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `Rekap_Presensi_${agendaTitle}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Absensi Shalat Berjamaah State & Export
  const [prayerAttendances, setPrayerAttendances] = useState<PrayerAttendance[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<string>("ALL");
  const [prayerMosqueFilter, setPrayerMosqueFilter] = useState<string>("ALL");
  const [prayerDateFilter, setPrayerDateFilter] = useState<string>("");

  const exportPrayerCsv = () => {
    let list = prayerAttendances;
    if (prayerFilter !== "ALL") {
      list = list.filter((p) => p.prayerName.toUpperCase() === prayerFilter.toUpperCase());
    }
    if (prayerMosqueFilter !== "ALL") {
      list = list.filter((p) => p.mosqueId === prayerMosqueFilter);
    }
    if (prayerDateFilter) {
      list = list.filter((p) => p.date === prayerDateFilter);
    }

    if (list.length === 0) {
      alert("Tidak ada data absensi shalat untuk diunduh.");
      return;
    }

    const headers = [
      "No",
      "Kode Tiket",
      "Waktu Shalat",
      "Masjid Kampus",
      "Lokasi Kampus",
      "Nama Jamaah",
      "Kategori Jamaah",
      "NIM",
      "Fakultas",
      "No WhatsApp",
      "Tanggal",
      "Waktu Presensi",
      "Verifikasi GPS",
      "Jarak (Meter)",
      "URL Foto Bukti",
    ];

    const rows = list.map((item, idx) => {
      const timeStr = item.attendedAt
        ? new Date(item.attendedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
        : "-";

      return [
        idx + 1,
        `"${item.ticketCode || "-"}"`,
        `"${item.prayerName}"`,
        `"${(item.mosqueName || "-").replace(/"/g, '""')}"`,
        `"${(item.mosqueLocation || "-").replace(/"/g, '""')}"`,
        `"${(item.fullName || "").replace(/"/g, '""')}"`,
        `"${item.participantRole}"`,
        `"${item.nim || "-"}"`,
        `"${(item.faculty || "-").replace(/"/g, '""')}"`,
        `"${item.phone || "-"}"`,
        `"${item.date || "-"}"`,
        `"${timeStr}"`,
        `"${item.locationVerified ? "Terverifikasi di Kawasan Masjid UMS" : "Manual"}"`,
        `"${item.distanceMeters || 0}"`,
        `"${item.photoUrl || "-"}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `Rekap_Absensi_Shalat_Berjamaah_${prayerFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [systemStatus, setSystemStatus] = useState<{ firebaseConfigured: boolean; imgbbConfigured?: boolean; blobConfigured?: boolean } | null>(null);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [publishToast, setPublishToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [isPublishingProcessing, setIsPublishingProcessing] = useState<string | null>(null);

  const triggerPublishNotification = (title: string, message: string) => {
    setPublishToast({
      show: true,
      title,
      message,
      timestamp:
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB",
    });
    setTimeout(() => {
      setPublishToast(null);
    }, 6000);
  };

  // Feedback & Saran Jamaah State
  const [feedbacks, setFeedbacks] = useState<MosqueFeedback[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackCounts, setFeedbackCounts] = useState({
    total: 0,
    baru: 0,
    ditinjau: 0,
    ditindaklanjuti: 0,
    diarsipkan: 0,
  });
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackFilterMosque, setFeedbackFilterMosque] = useState("ALL");
  const [feedbackFilterCategory, setFeedbackFilterCategory] = useState("ALL");
  const [feedbackFilterStatus, setFeedbackFilterStatus] = useState("ALL");

  // Responding feedback modal state
  const [respondingFeedback, setRespondingFeedback] = useState<MosqueFeedback | null>(null);
  const [adminResponseText, setAdminResponseText] = useState("");
  const [adminResponseStatus, setAdminResponseStatus] = useState<FeedbackStatus>("DITINDAKLANJUTI");
  const [savingFeedbackResponse, setSavingFeedbackResponse] = useState(false);

  // Friday officer schedule state (6 Mosques)
  const [fridaySchedule, setFridaySchedule] = useState<FridayOfficerSchedule | null>(null);
  const [fridaySchedules, setFridaySchedules] = useState<FridayOfficerSchedule[]>([]);
  const [fridayHistory, setFridayHistory] = useState<FridayOfficerSchedule[]>([]);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>("sudalmiyah");
  const [savingFriday, setSavingFriday] = useState(false);
  const [uploadingKhatibPhoto, setUploadingKhatibPhoto] = useState(false);
  const [fridaySaveSuccess, setFridaySaveSuccess] = useState(false);
  const activeMosqueMeta = ADMIN_MOSQUES.find((m) => m.id === selectedMosqueId) || ADMIN_MOSQUES[0];

  // QRIS Infaq state
  const [qrisSettings, setQrisSettings] = useState<QrisSettings | null>(null);
  const [savingQris, setSavingQris] = useState(false);
  const [uploadingQrisImage, setUploadingQrisImage] = useState(false);
  const [uploadingSecondaryQrisImage, setUploadingSecondaryQrisImage] = useState(false);
  const [qrisSaveSuccess, setQrisSaveSuccess] = useState(false);

  // Modal new agenda state
  const [isNewAgendaOpen, setIsNewAgendaOpen] = useState(false);
  const [newAgenda, setNewAgenda] = useState({
    title: "",
    category: "KAJIAN_MAHASISWA" as Agenda["category"],
    speaker: "",
    speakerRole: "",
    date: "2026-10-15",
    time: "16:00 - 17:30 WIB",
    location: "Aula Serbaguna Lantai 1, Masjid Sudalmiyah Rais",
    description: "",
    quota: 1000,
    requiresRegistration: false,
    targetAudience: "",
    bannerUrl: "/uploads/agendas/agenda-jumat.jpg",
  });
  const [uploadingAgendaThumbnail, setUploadingAgendaThumbnail] = useState(false);
  const [savingAgenda, setSavingAgenda] = useState(false);

  // Agenda Documentation & Results State
  const [editingAgendaDoc, setEditingAgendaDoc] = useState<Agenda | null>(null);
  const [docIsCompleted, setDocIsCompleted] = useState<boolean>(false);
  const [docAttendees, setDocAttendees] = useState<string>("");
  const [docPhotos, setDocPhotos] = useState<string[]>([]);
  const [docSummary, setDocSummary] = useState<string>("");
  const [uploadingDocPhoto, setUploadingDocPhoto] = useState<boolean>(false);
  const [docPhotoUrlInput, setDocPhotoUrlInput] = useState<string>("");
  const [savingAgendaDoc, setSavingAgendaDoc] = useState<boolean>(false);

  // Pop-up Banner State
  const [popupBanner, setPopupBanner] = useState<PopupBanner | null>(null);
  const [popupBanners, setPopupBanners] = useState<PopupBanner[]>([]);
  const [uploadingPopup, setUploadingPopup] = useState(false);
  const [savingPopup, setSavingPopup] = useState(false);
  const [popupTargetUrl, setPopupTargetUrl] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupSaveSuccess, setPopupSaveSuccess] = useState(false);
  const [savedPopupId, setSavedPopupId] = useState<string | null>(null);

  // Pop-up Duration Settings for New Upload
  const [uploadDurationType, setUploadDurationType] = useState<
    "UNLIMITED" | "1_DAY" | "3_DAYS" | "7_DAYS" | "14_DAYS" | "30_DAYS" | "AGENDA" | "CUSTOM"
  >("UNLIMITED");
  const [uploadCustomDate, setUploadCustomDate] = useState<string>("");
  const [uploadAgendaId, setUploadAgendaId] = useState<string>("");

  const formatIndoDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return (
      d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const toDatetimeLocal = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const calculateExpiresAt = (
    type: string,
    customDateTime?: string,
    agendaId?: string
  ): {
    expiresAt: string | null;
    durationDays: number | null;
    linkedAgendaId?: string;
    linkedAgendaTitle?: string;
  } => {
    const now = Date.now();
    if (type === "UNLIMITED") {
      return { expiresAt: null, durationDays: null };
    }
    if (type === "1_DAY") {
      return { expiresAt: new Date(now + 1 * 86400000).toISOString(), durationDays: 1 };
    }
    if (type === "3_DAYS") {
      return { expiresAt: new Date(now + 3 * 86400000).toISOString(), durationDays: 3 };
    }
    if (type === "7_DAYS") {
      return { expiresAt: new Date(now + 7 * 86400000).toISOString(), durationDays: 7 };
    }
    if (type === "14_DAYS") {
      return { expiresAt: new Date(now + 14 * 86400000).toISOString(), durationDays: 14 };
    }
    if (type === "30_DAYS") {
      return { expiresAt: new Date(now + 30 * 86400000).toISOString(), durationDays: 30 };
    }
    if (type === "AGENDA" && agendaId) {
      const selected = agendas.find((a) => a.id === agendaId);
      if (selected && selected.date) {
        let targetIso = "";
        try {
          const parts = selected.date.split("-");
          if (parts.length === 3) {
            const endOfDay = new Date(
              Number(parts[0]),
              Number(parts[1]) - 1,
              Number(parts[2]),
              23,
              59,
              59
            );
            targetIso = endOfDay.toISOString();
          } else {
            const parsed = new Date(selected.date);
            parsed.setHours(23, 59, 59);
            targetIso = parsed.toISOString();
          }
        } catch {
          targetIso = new Date(now + 3 * 86400000).toISOString();
        }
        return {
          expiresAt: targetIso,
          durationDays: null,
          linkedAgendaId: selected.id,
          linkedAgendaTitle: selected.title,
        };
      }
    }
    if (type === "CUSTOM" && customDateTime) {
      const parsed = new Date(customDateTime);
      if (!isNaN(parsed.getTime())) {
        return { expiresAt: parsed.toISOString(), durationDays: null };
      }
    }
    return { expiresAt: null, durationDays: null };
  };

  // Document Management State
  const [documents, setDocuments] = useState<DownloadDocument[]>([]);
  const [documentsLocked, setDocumentsLocked] = useState<boolean>(true);
  const [togglingDocLock, setTogglingDocLock] = useState<boolean>(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [uploadingDocFile, setUploadingDocFile] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    title: "",
    category: "TARJIH_FIQIH" as DocumentCategory,
    categoryLabel: "Tarjih & Fiqih",
    description: "",
    author: "",
    fileUrl: "",
    fileName: "",
    fileSize: "1.9 MB",
    fileFormat: "PDF",
    publishedYear: "",
  });

  // Manual News Management State
  const [manualNewsList, setManualNewsList] = useState<ManualNewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [newsForm, setNewsForm] = useState({
    title: "",
    badge: "WARTA MASJID",
    badgeClass: "bg-[#003B73] text-white",
    publishedAt: "",
    sourceDomain: "masjid.ums.ac.id",
    sourceUrl: "",
    imageUrl: "/images/news/silaturahmi-bph-1.jpg",
    excerpt: "",
    contentRaw: "",
    isPublished: true,
  });

  const loadData = async () => {
    try {
      const [statsRes, agendaRes, fridayRes, qrisRes, popupRes, docRes, statusRes, newsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/agendas?t=${Date.now()}`, { cache: "no-store" }),
        fetch("/api/friday-schedule"),
        fetch("/api/qris"),
        fetch(`/api/popup?admin=1&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/admin/documents?t=${Date.now()}`, { cache: "no-store" }),
        fetch("/api/admin/system-status"),
        fetch(`/api/admin/news?t=${Date.now()}`, { cache: "no-store" }),
      ]);

      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        setSystemStatus(statusJson);
      }

      if (statsRes.status === 401 || statsRes.status === 403) {
        router.push("/auth/login");
        return;
      }

      const statsJson = await statsRes.json();
      const agendaJson = await agendaRes.json();
      const fridayJson = await fridayRes.json();
      const qrisJson = await qrisRes.json();

      setStats(statsJson.stats);
      setAgendas(agendaJson.agendas || []);
      setRegistrations(statsJson.registrations || statsJson.recentRegistrations || []);
      setPrayerAttendances(statsJson.prayerAttendances || []);
      if (fridayJson.success) {
        if (Array.isArray(fridayJson.schedules) && fridayJson.schedules.length > 0) {
          const sanitizedSchedules = fridayJson.schedules.map((s: FridayOfficerSchedule) => ({
            ...s,
            hijriDate: s.hijriDate?.replace(/Rabiul Akhir/gi, "Jumadilawal") || "5 Jumadilawal 1448 H",
          }));
          setFridaySchedules(sanitizedSchedules);
          const current =
            sanitizedSchedules.find(
              (s: FridayOfficerSchedule) => (s.mosqueId || s.id) === selectedMosqueId
            ) || sanitizedSchedules[0];
          setFridaySchedule(current);
        } else if (fridayJson.schedule) {
          const sanitizedCurrent = {
            ...fridayJson.schedule,
            hijriDate: fridayJson.schedule.hijriDate?.replace(/Rabiul Akhir/gi, "Jumadilawal") || "5 Jumadilawal 1448 H",
          };
          setFridaySchedule(sanitizedCurrent);
          setFridaySchedules([sanitizedCurrent]);
        }
        if (fridayJson.history && Array.isArray(fridayJson.history)) {
          setFridayHistory(fridayJson.history);
        }
      }
      if (qrisJson.success && qrisJson.qris) {
        setQrisSettings(qrisJson.qris);
      }
      if (popupRes.ok) {
        const popupJson = await popupRes.json();
        let resolvedPopup: PopupBanner | null = popupJson.popup || null;
        let resolvedList: PopupBanner[] = Array.isArray(popupJson.popups)
          ? popupJson.popups
          : popupJson.popup
          ? [popupJson.popup]
          : [];

        try {
          const rawCache = localStorage.getItem("sudalmiyah_popup_cache");
          if (rawCache) {
            const parsedCache = JSON.parse(rawCache) as {
              popup?: PopupBanner | null;
              popups?: PopupBanner[];
              explicitlyDeleted?: boolean;
              updatedAt?: string;
            };
            if (!parsedCache.explicitlyDeleted) {
              if (resolvedList.length === 0 && Array.isArray(parsedCache.popups) && parsedCache.popups.length > 0) {
                resolvedList = parsedCache.popups;
                resolvedPopup = resolvedList[0] || null;
              } else if (Array.isArray(parsedCache.popups) && parsedCache.popups.length > resolvedList.length) {
                // If local cache has more banners than server (e.g. cold container had older seed)
                resolvedList = parsedCache.popups;
                resolvedPopup = resolvedList[0] || null;
              }
            }
          }
        } catch {
          // ignore storage errors
        }

        setPopupBanner(resolvedPopup);
        setPopupBanners(resolvedList);
        if (resolvedPopup) {
          setPopupTargetUrl(resolvedPopup.targetUrl || "");
          setPopupTitle(resolvedPopup.title || "");
        }
      }
      if (docRes.ok) {
        const docJson = await docRes.json();
        setDocuments(docJson.documents || []);
        if (docJson.isLocked !== undefined) {
          setDocumentsLocked(docJson.isLocked);
        }
      }
      if (newsRes.ok) {
        const newsJson = await newsRes.json();
        setManualNewsList(newsJson.news || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAdminFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const params = new URLSearchParams();
      if (feedbackFilterStatus !== "ALL") params.append("status", feedbackFilterStatus);
      if (feedbackFilterMosque !== "ALL") params.append("mosque", feedbackFilterMosque);
      if (feedbackFilterCategory !== "ALL") params.append("category", feedbackFilterCategory);
      if (feedbackSearch.trim()) params.append("search", feedbackSearch.trim());

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        if (data.counts) setFeedbackCounts(data.counts);
      }
    } catch (e) {
      console.error("Error loading feedbacks:", e);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    loadData();
    loadAdminFeedbacks();
  }, []);

  useEffect(() => {
    loadAdminFeedbacks();
  }, [feedbackFilterStatus, feedbackFilterMosque, feedbackFilterCategory]);

  const handleSearchFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAdminFeedbacks();
  };

  const handleUpdateFeedbackStatus = async (id: string, newStatus: FeedbackStatus) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui status.");
      }
      loadAdminFeedbacks();
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memperbarui status.");
    }
  };

  const handleOpenResponseModal = (fb: MosqueFeedback) => {
    setRespondingFeedback(fb);
    setAdminResponseText(fb.adminResponse || "");
    setAdminResponseStatus(fb.status === "BARU" ? "DITINDAKLANJUTI" : fb.status);
  };

  const handleSaveFeedbackResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingFeedback) return;
    setSavingFeedbackResponse(true);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: respondingFeedback.id,
          status: adminResponseStatus,
          adminResponse: adminResponseText,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan respon.");
      }
      setRespondingFeedback(null);
      loadAdminFeedbacks();
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan respon.");
    } finally {
      setSavingFeedbackResponse(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus masukan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus masukan.");
      }
      loadAdminFeedbacks();
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus masukan.");
    }
  };

  const handleClearAllFeedbacks = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengosongkan SEMUA data masukan jamaah? Tindakan ini akan menghapus seluruh data aspirasi yang tersimpan."
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/admin/feedback?action=clear-all", {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengosongkan data masukan.");
      }
      loadAdminFeedbacks();
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengosongkan data masukan.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const handleSelectMosque = (mosqueId: string) => {
    setSelectedMosqueId(mosqueId);
    const found = fridaySchedules.find((s) => (s.mosqueId || s.id) === mosqueId);
    if (found) {
      setFridaySchedule(found);
    } else {
      const meta = ADMIN_MOSQUES.find((m) => m.id === mosqueId);
      const newSchedule: FridayOfficerSchedule = {
        id: `fri-${mosqueId}`,
        mosqueId: mosqueId,
        mosqueName: meta?.name || "Masjid Kampus UMS",
        mosqueLocation: meta?.location,
        date: "Jumat, 16 Oktober 2026",
        hijriDate: "5 Jumadilawal 1448 H",
        khatibName: "",
        khatibTitle: "",
        khatibPhotoUrl: "",
        khutbahTheme: "",
        imamName: "",
        imamRole: `Imam ${meta?.name || "Masjid"}`,
        muadzinName: "",
        muadzinRole: `Muadzin ${meta?.name || "Masjid"}`,
        time: "11:35 WIB",
        notes: "Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid.",
        updatedAt: new Date().toISOString(),
      };
      setFridaySchedule(newSchedule);
    }
  };

  const handleAutoSetFriday = (weeksOffset: number = 0, applyToAll: boolean = false) => {
    if (!fridaySchedule) return;
    const info = calculateFridayInfo(weeksOffset);
    const updated: FridayOfficerSchedule = {
      ...fridaySchedule,
      date: info.masehi,
      hijriDate: info.hijri,
    };
    setFridaySchedule(updated);

    if (applyToAll) {
      setFridaySchedules((prev) =>
        prev.map((s) => ({
          ...s,
          date: info.masehi,
          hijriDate: info.hijri,
        }))
      );
      alert(`Berhasil mengatur tanggal (${info.masehi} / ${info.hijri}) untuk seluruh 6 masjid.`);
    } else {
      setFridaySchedules((prev) =>
        prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? updated : s))
      );
    }
  };

  const handleClearAllPrayerAttendances = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin mengosongkan SELURUH data presensi shalat? Tindakan ini akan menghapus semua riwayat presensi agar dapat dioperasikan dengan data asli."
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/presensi/shalat?action=clear-all", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrayerAttendances([]);
        alert("Seluruh data absensi shalat berhasil dikosongkan.");
      } else {
        alert(data.error || "Gagal mengosongkan data absensi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  const handleDeletePrayerAttendance = async (id: string, name: string) => {
    if (!confirm(`Hapus data presensi jamaah ${name}?`)) return;
    try {
      const res = await fetch(`/api/presensi/shalat?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPrayerAttendances((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Gagal menghapus data presensi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // Upload Khatib Photo from Media file
  const handleKhatibPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingKhatibPhoto(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "khatib");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto khatib.");

      if (fridaySchedule) {
        const updated = { ...fridaySchedule, khatibPhotoUrl: data.url };
        setFridaySchedule(updated);
        setFridaySchedules((prev) =>
          prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? updated : s))
        );
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto khatib.");
    } finally {
      setUploadingKhatibPhoto(false);
      e.target.value = "";
    }
  };

  // Save Friday Schedule Changes
  const handleUpdateFridaySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridaySchedule) return;
    setSavingFriday(true);
    setFridaySaveSuccess(false);
    setIsPublishingProcessing("Menyimpan jadwal Jumat & memublikasikan ke publik");
    try {
      const currentMeta = ADMIN_MOSQUES.find((m) => m.id === selectedMosqueId);
      const payload: FridayOfficerSchedule = {
        ...fridaySchedule,
        mosqueId: selectedMosqueId,
        mosqueName: fridaySchedule.mosqueName || currentMeta?.name || "Masjid Kampus UMS",
        mosqueLocation: fridaySchedule.mosqueLocation || currentMeta?.location,
      };

      const res = await fetch("/api/friday-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jadwal jumat.");

      if (data.schedule) {
        setFridaySchedule(data.schedule);
      }
      if (Array.isArray(data.schedules) && data.schedules.length > 0) {
        setFridaySchedules(data.schedules);
      } else {
        setFridaySchedules((prev) =>
          prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? data.schedule || payload : s))
        );
      }

      if (Array.isArray(data.history)) {
        setFridayHistory(data.history);
      }

      setFridaySaveSuccess(true);
      setTimeout(() => setFridaySaveSuccess(false), 3000);
      triggerPublishNotification(
        "Jadwal Jumat Berhasil Dipublikasikan!",
        `Jadwal petugas shalat Jumat untuk ${payload.mosqueName} telah tersimpan ke Firebase dan langsung aktif di portal publik.`
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan jadwal.");
    } finally {
      setSavingFriday(false);
      setIsPublishingProcessing(null);
    }
  };

  // Upload QRIS Image from Media file
  const handleQrisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingQrisImage(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "qris");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar QRIS.");

      if (qrisSettings) {
        setQrisSettings({ ...qrisSettings, imageUrl: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar QRIS.");
    } finally {
      setUploadingQrisImage(false);
      e.target.value = "";
    }
  };

  // Upload Secondary QRIS Image (Bank Jateng / QRIS Kanan)
  const handleSecondaryQrisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingSecondaryQrisImage(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "qris");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar QRIS kedua.");

      if (qrisSettings) {
        setQrisSettings({ ...qrisSettings, secondaryImageUrl: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar QRIS kedua.");
    } finally {
      setUploadingSecondaryQrisImage(false);
      e.target.value = "";
    }
  };

  // Save QRIS Settings Changes
  const handleUpdateQrisSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrisSettings) return;
    setSavingQris(true);
    setQrisSaveSuccess(false);
    setIsPublishingProcessing("Menyimpan pengaturan QRIS & memublikasikan ke publik");
    try {
      const res = await fetch("/api/qris", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(qrisSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan QRIS.");

      setQrisSaveSuccess(true);
      setTimeout(() => setQrisSaveSuccess(false), 3000);
      triggerPublishNotification(
        "Pengaturan QRIS Berhasil Dipublikasikan!",
        `Informasi QRIS (${qrisSettings.merchantName}) telah tersimpan ke Firebase dan langsung aktif di halaman Donasi publik.`
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan QRIS.");
    } finally {
      setSavingQris(false);
      setIsPublishingProcessing(null);
    }
  };

  // Upload Agenda Thumbnail from Media file
  const handleAgendaThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingAgendaThumbnail(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "agendas");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah thumbnail.");

      setNewAgenda((prev) => ({ ...prev, bannerUrl: data.url }));
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah thumbnail agenda.");
    } finally {
      setUploadingAgendaThumbnail(false);
      e.target.value = "";
    }
  };

  // Create New Agenda
  const handleCreateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAgenda(true);
    setIsPublishingProcessing("Menyimpan agenda baru & memublikasikan ke publik");
    try {
      const payload = {
        ...newAgenda,
        quota: !newAgenda.quota || Number(newAgenda.quota) <= 0 ? 1000 : Number(newAgenda.quota),
      };
      const res = await fetch("/api/agendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        let errorMsg = data.error || "Gagal membuat agenda.";
        if (data.details && typeof data.details === "object") {
          const detailLines = Object.entries(data.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("\n");
          if (detailLines) {
            errorMsg = `${errorMsg}\n\nDetail:\n${detailLines}`;
          }
        }
        throw new Error(errorMsg);
      }
      setIsNewAgendaOpen(false);
      await loadData();
      triggerPublishNotification(
        "Agenda Baru Berhasil Dipublikasikan!",
        `Agenda "${newAgenda.title}" telah tersimpan ke Firebase dan langsung aktif di beranda publik.`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingAgenda(false);
      setIsPublishingProcessing(null);
    }
  };

  // Open Agenda Documentation Modal
  const handleOpenAgendaDoc = (agenda: Agenda) => {
    setEditingAgendaDoc(agenda);
    setDocIsCompleted(Boolean(agenda.isCompleted));
    setDocAttendees(
      agenda.actualAttendees !== undefined && agenda.actualAttendees !== null
        ? String(agenda.actualAttendees)
        : ""
    );
    setDocPhotos(Array.isArray(agenda.documentationPhotos) ? [...agenda.documentationPhotos] : []);
    setDocSummary(agenda.summaryNote || "");
    setDocPhotoUrlInput("");
  };

  // Quick Toggle Agenda Completion
  const handleToggleQuickComplete = async (agenda: Agenda) => {
    const nextStatus = !agenda.isCompleted;
    setIsPublishingProcessing(nextStatus ? "Menandai agenda selesai & memublikasikan" : "Mengubah status agenda & memublikasikan");

    // Optimistic local state update
    setAgendas((prev) =>
      prev.map((a) =>
        a.id === agenda.id
          ? {
              ...a,
              isCompleted: nextStatus,
              completedAt: nextStatus ? (a.completedAt || new Date().toISOString()) : undefined,
            }
          : a
      )
    );

    try {
      const res = await fetch("/api/agendas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agenda.id,
          isCompleted: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status agenda.");

      if (data.agenda) {
        setAgendas((prev) =>
          prev.map((a) => (a.id === data.agenda.id ? data.agenda : a))
        );
      }

      await loadData();
      triggerPublishNotification(
        nextStatus ? "Agenda Ditandai Selesai & Dipublikasikan!" : "Status Agenda Diperbarui!",
        `Agenda "${agenda.title}" telah ${nextStatus ? "ditandai terlaksana" : "diubah kembali menjadi jadwal aktif"} dan langsung terupdate di portal publik.`
      );
    } catch (err: any) {
      // Rollback on error
      setAgendas((prev) =>
        prev.map((a) => (a.id === agenda.id ? agenda : a))
      );
      alert(err.message || "Gagal memperbarui status agenda.");
    } finally {
      setIsPublishingProcessing(null);
    }
  };

  // Upload Photo for Agenda Documentation
  const handleUploadDocPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingDocPhoto(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "agendas");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto dokumentasi.");
      setDocPhotos((prev) => [data.url, ...prev]);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah foto.");
    } finally {
      setUploadingDocPhoto(false);
      e.target.value = "";
    }
  };

  // Remove Photo from Agenda Documentation
  const handleRemoveDocPhoto = (idx: number) => {
    setDocPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Save Agenda Documentation & Results
  const handleSaveAgendaDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgendaDoc) return;
    setSavingAgendaDoc(true);
    setIsPublishingProcessing("Menyimpan foto dokumentasi & memublikasikan ke publik");
    try {
      const res = await fetch("/api/agendas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAgendaDoc.id,
          isCompleted: docIsCompleted,
          actualAttendees: docAttendees ? parseInt(docAttendees, 10) : null,
          documentationPhotos: docPhotos,
          summaryNote: docSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan hasil dokumentasi agenda.");
      const savedTitle = editingAgendaDoc.title;
      const updatedAgenda = data.agenda;

      if (updatedAgenda) {
        setAgendas((prev) =>
          prev.map((a) => (a.id === updatedAgenda.id ? updatedAgenda : a))
        );
      }

      setEditingAgendaDoc(null);
      await loadData();
      triggerPublishNotification(
        "Hasil Dokumentasi Berhasil Dipublikasikan!",
        `Dokumentasi ${docPhotos.length} foto dan ${docAttendees ? `${Number(docAttendees).toLocaleString("id-ID")} peserta` : "kegiatan"} untuk "${savedTitle}" telah tersimpan dan langsung tampil di beranda publik.`
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan hasil agenda.");
    } finally {
      setSavingAgendaDoc(false);
      setIsPublishingProcessing(null);
    }
  };

  const syncPopupLocalCache = (popup: PopupBanner | null, list?: PopupBanner[]) => {
    try {
      const fullList = list !== undefined ? list : popup ? [popup] : [];
      localStorage.setItem(
        "sudalmiyah_popup_cache",
        JSON.stringify({
          popup,
          popups: fullList,
          explicitlyDeleted: fullList.length === 0,
          updatedAt: new Date().toISOString(),
        })
      );
      sessionStorage.removeItem("sudalmiyah_popup_dismissed");
    } catch {
      // ignore storage errors
    }
  };

  // Upload popup banner image (supports adding or replacing)
  const handlePopupUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    replaceId?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPopup(true);
    setPopupSaveSuccess(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (replaceId) {
        fd.append("replaceId", replaceId);
      }

      const durationConfig = calculateExpiresAt(
        uploadDurationType,
        uploadCustomDate,
        uploadAgendaId
      );

      if (durationConfig.expiresAt) {
        fd.append("expiresAt", durationConfig.expiresAt);
      }
      if (durationConfig.durationDays !== null && durationConfig.durationDays !== undefined) {
        fd.append("durationDays", String(durationConfig.durationDays));
      }
      if (durationConfig.linkedAgendaId) {
        fd.append("linkedAgendaId", durationConfig.linkedAgendaId);
      }
      if (durationConfig.linkedAgendaTitle) {
        fd.append("linkedAgendaTitle", durationConfig.linkedAgendaTitle);
      }
      fd.append("startDate", new Date().toISOString());

      const res = await fetch("/api/popup", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah pop-up banner.");

      const updatedList: PopupBanner[] = Array.isArray(data.popups)
        ? data.popups
        : data.popup
        ? [data.popup]
        : [];
      setPopupBanner(data.popup || updatedList[0] || null);
      setPopupBanners(updatedList);
      setPopupTargetUrl("");
      syncPopupLocalCache(data.popup || updatedList[0] || null, updatedList);
      setPopupSaveSuccess(true);
      setTimeout(() => setPopupSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah gambar pop-up.");
    } finally {
      setUploadingPopup(false);
      e.target.value = "";
    }
  };

  // Toggle active status of popup banner
  const handleTogglePopupActive = async (id?: string) => {
    const targetId = id || popupBanner?.id;
    if (!targetId) return;
    const target = popupBanners.find((p) => p.id === targetId) || popupBanner;
    if (!target) return;

    try {
      const res = await fetch("/api/popup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          isActive: !target.isActive,
          imageUrl: target.imageUrl,
          title: target.title,
          targetUrl: target.targetUrl,
          expiresAt: target.expiresAt,
          startDate: target.startDate,
          durationDays: target.durationDays,
          linkedAgendaId: target.linkedAgendaId,
          linkedAgendaTitle: target.linkedAgendaTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status tayang.");
      let updatedList: PopupBanner[] =
        Array.isArray(data.popups) && data.popups.length > 0
          ? data.popups
          : popupBanners.map((p) => (p.id === targetId ? { ...p, isActive: !target.isActive } : p));
      const primary = updatedList[0] || null;
      setPopupBanner(primary);
      setPopupBanners(updatedList);
      syncPopupLocalCache(primary, updatedList);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status pop-up banner.");
    }
  };

  // Save popup settings (targetUrl, duration, expiresAt, etc.)
  const handleSavePopupSettings = async (
    e?: React.FormEvent,
    id?: string,
    updates?: {
      targetUrl?: string;
      expiresAt?: string | null;
      startDate?: string;
      durationDays?: number | null;
      linkedAgendaId?: string;
      linkedAgendaTitle?: string;
      isActive?: boolean;
    }
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = id || popupBanner?.id;
    if (!targetId) return;
    const currentItem = popupBanners.find((p) => p.id === targetId) || popupBanner;
    setSavingPopup(true);
    setPopupSaveSuccess(false);
    try {
      const urlToSave =
        updates?.targetUrl !== undefined
          ? updates.targetUrl
          : popupTargetUrl !== undefined && popupTargetUrl !== ""
          ? popupTargetUrl
          : currentItem?.targetUrl || "";

      const expiresAtToSave =
        updates !== undefined && "expiresAt" in updates
          ? updates.expiresAt
          : currentItem?.expiresAt;

      const isActiveToSave =
        updates?.isActive !== undefined ? updates.isActive : currentItem?.isActive;

      const res = await fetch("/api/popup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          targetUrl: typeof urlToSave === "string" ? urlToSave.trim() : "",
          imageUrl: currentItem?.imageUrl,
          title: currentItem?.title,
          isActive: isActiveToSave,
          expiresAt: expiresAtToSave,
          startDate: updates?.startDate !== undefined ? updates.startDate : currentItem?.startDate,
          durationDays: updates?.durationDays !== undefined ? updates.durationDays : currentItem?.durationDays,
          linkedAgendaId: updates?.linkedAgendaId !== undefined ? updates.linkedAgendaId : currentItem?.linkedAgendaId,
          linkedAgendaTitle: updates?.linkedAgendaTitle !== undefined ? updates.linkedAgendaTitle : currentItem?.linkedAgendaTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan.");
      let updatedList: PopupBanner[] =
        Array.isArray(data.popups) && data.popups.length > 0
          ? data.popups
          : popupBanners.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    targetUrl: typeof urlToSave === "string" ? urlToSave.trim() : p.targetUrl,
                    expiresAt: expiresAtToSave,
                    isActive: isActiveToSave !== undefined ? isActiveToSave : p.isActive,
                  }
                : p
            );

      // Guard: ensure targetId is never dropped
      if (!updatedList.some((p) => p.id === targetId) && currentItem) {
        updatedList = [
          {
            ...currentItem,
            targetUrl: typeof urlToSave === "string" ? urlToSave.trim() : currentItem.targetUrl,
            expiresAt: expiresAtToSave,
            isActive: isActiveToSave !== undefined ? isActiveToSave : currentItem.isActive,
          },
          ...updatedList,
        ];
      }

      const primary = updatedList[0] || null;
      setPopupBanner(primary);
      setPopupBanners(updatedList);
      syncPopupLocalCache(primary, updatedList);
      setPopupSaveSuccess(true);
      setSavedPopupId(targetId);
      setTimeout(() => {
        setPopupSaveSuccess(false);
        setSavedPopupId(null);
      }, 3000);
      triggerPublishNotification(
        "Pop-up Banner Berhasil Dipublikasikan!",
        "Pengaturan pop-up pengumuman masjid telah tersimpan ke Firebase dan langsung aktif di beranda publik."
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan pop-up banner.");
    } finally {
      setSavingPopup(false);
    }
  };

  // Quick extend duration (adds days to current expiry or from now if already expired)
  const handleQuickExtend = async (id: string, additionalDays: number) => {
    const item = popupBanners.find((p) => p.id === id) || popupBanner;
    if (!item) return;
    const now = Date.now();
    let baseTime = now;
    if (item.expiresAt) {
      const currentExpiry = new Date(item.expiresAt).getTime();
      if (!isNaN(currentExpiry) && currentExpiry > now) {
        baseTime = currentExpiry;
      }
    }
    const newExpiresAt = new Date(baseTime + additionalDays * 86400000).toISOString();
    await handleSavePopupSettings(undefined, id, {
      expiresAt: newExpiresAt,
      isActive: true,
      durationDays: additionalDays,
      linkedAgendaId: undefined,
      linkedAgendaTitle: undefined,
    });
  };

  // Quick set duration preset or clear expiry
  const handleQuickSetDuration = async (
    id: string,
    type: string,
    customDate?: string,
    agendaId?: string
  ) => {
    const config = calculateExpiresAt(type, customDate, agendaId);
    await handleSavePopupSettings(undefined, id, {
      expiresAt: config.expiresAt,
      isActive: true,
      durationDays: config.durationDays,
      linkedAgendaId: config.linkedAgendaId,
      linkedAgendaTitle: config.linkedAgendaTitle,
    });
  };

  // Reorder popup banners
  const handleReorderPopup = async (fromIdx: number, toIdx: number) => {
    if (fromIdx < 0 || toIdx < 0 || fromIdx >= popupBanners.length || toIdx >= popupBanners.length) return;
    const reordered = [...popupBanners];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setPopupBanners(reordered);
    setPopupBanner(reordered[0] || null);
    try {
      const res = await fetch("/api/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ popups: reordered }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan urutan pop-up.");
      syncPopupLocalCache(reordered[0] || null, reordered);
    } catch (err: any) {
      alert(err.message || "Gagal mengubah urutan pop-up banner.");
      setPopupBanners(popupBanners);
    }
  };

  // Delete popup banner
  const handleDeletePopup = async (id?: string) => {
    const confirmMessage = id
      ? "Hapus poster pop-up ini? Poster lain akan tetap aktif."
      : "Apakah Anda yakin ingin menghapus SEMUA poster pop-up banner?";
    if (!confirm(confirmMessage)) {
      return;
    }
    try {
      const url = id ? `/api/popup?id=${encodeURIComponent(id)}` : "/api/popup";
      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus pop-up.");
      const updatedList: PopupBanner[] = Array.isArray(data.popups)
        ? data.popups
        : data.popup
        ? [data.popup]
        : [];
      const primary = updatedList[0] || null;
      setPopupBanner(primary);
      setPopupBanners(updatedList);
      setPopupTargetUrl(primary?.targetUrl || "");
      syncPopupLocalCache(primary, updatedList);
      alert("Pop-up banner berhasil dihapus.");
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pop-up banner.");
    }
  };

  // Document Management Handlers
  const handleOpenNewDocModal = () => {
    setEditingDocId(null);
    setDocForm({
      title: "",
      category: "TARJIH_FIQIH",
      categoryLabel: "Tarjih & Fiqih",
      description: "",
      author: "Pimpinan Pusat Muhammadiyah",
      fileUrl: "",
      fileName: "",
      fileSize: "1.9 MB",
      fileFormat: "PDF",
      publishedYear: "",
    });
    setIsDocModalOpen(true);
  };

  const handleOpenEditDocModal = (doc: DownloadDocument) => {
    setEditingDocId(doc.id);
    setDocForm({
      title: doc.title,
      category: doc.category,
      categoryLabel: doc.categoryLabel || "",
      description: doc.description,
      author: doc.author,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize || "1.9 MB",
      fileFormat: doc.fileFormat || "PDF",
      publishedYear: doc.publishedYear || "",
    });
    setIsDocModalOpen(true);
  };

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "documents");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah berkas dokumen.");

      const sizeKb = file.size / 1024;
      const sizeStr = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

      setDocForm((prev) => ({
        ...prev,
        fileUrl: data.url,
        fileName: file.name,
        fileSize: sizeStr,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      }));
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah berkas dokumen.");
    } finally {
      setUploadingDocFile(false);
    }
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.fileUrl) {
      alert("Harap pilih atau unggah berkas dokumen PDF terlebih dahulu.");
      return;
    }
    setSavingDoc(true);
    setIsPublishingProcessing("Menyimpan dokumen & memublikasikan ke publik");
    try {
      const method = editingDocId ? "PUT" : "POST";
      const payload = editingDocId ? { id: editingDocId, ...docForm } : docForm;

      const res = await fetch("/api/admin/documents", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan dokumen.");

      setIsDocModalOpen(false);
      await loadData();
      triggerPublishNotification(
        editingDocId ? "Dokumen Berhasil Diperbarui!" : "Dokumen Baru Berhasil Dipublikasikan!",
        `Dokumen "${docForm.title}" telah tersimpan ke Firebase dan aktif di portal unduhan publik.`
      );
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan dokumen.");
    } finally {
      setSavingDoc(false);
      setIsPublishingProcessing(null);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/documents?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus dokumen.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus dokumen.");
    }
  };

  const handleToggleDocumentsLock = async () => {
    setTogglingDocLock(true);
    const newLocked = !documentsLocked;
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: newLocked }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocumentsLocked(data.isLocked);
        alert(
          `Akses publik Pusat Unduhan Dokumen (/layanan/unduhan) berhasil ${
            data.isLocked ? "DIKUNCI" : "DIBUKA"
          }.`
        );
      } else {
        alert(data.error || "Gagal mengubah status akses dokumen.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setTogglingDocLock(false);
    }
  };

  // Manual News Management Handlers
  const loadManualNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch(`/api/admin/news?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setManualNewsList(data.news || []);
      }
    } catch (e) {
      console.error("Error loading manual news:", e);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleOpenAddNews = () => {
    setEditingNewsId(null);
    setNewsForm({
      title: "",
      badge: "WARTA MASJID",
      badgeClass: "bg-[#003B73] text-white",
      publishedAt: new Date().toISOString().slice(0, 16),
      sourceDomain: "masjid.ums.ac.id",
      sourceUrl: "",
      imageUrl: "/images/news/silaturahmi-bph-1.jpg",
      excerpt: "",
      contentRaw: "",
      isPublished: true,
    });
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (item: ManualNewsItem) => {
    setEditingNewsId(item.id);
    let dateStr = "";
    try {
      dateStr = new Date(item.publishedAt).toISOString().slice(0, 16);
    } catch {
      dateStr = new Date().toISOString().slice(0, 16);
    }
    setNewsForm({
      title: item.title,
      badge: item.badge || "WARTA MASJID",
      badgeClass: item.badgeClass || "bg-[#003B73] text-white",
      publishedAt: dateStr,
      sourceDomain: item.sourceDomain || "masjid.ums.ac.id",
      sourceUrl: item.sourceUrl === "#" ? "" : (item.sourceUrl || ""),
      imageUrl: item.imageUrl || "/images/news/silaturahmi-bph-1.jpg",
      excerpt: item.excerpt,
      contentRaw: Array.isArray(item.content) ? item.content.join("\n\n") : "",
      isPublished: item.isPublished !== false,
    });
    setIsNewsModalOpen(true);
  };

  const handleNewsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingNewsImage(true);
    try {
      const file = await compressImageForUpload(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "news");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah foto warta.");
      setNewsForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto warta.");
    } finally {
      setUploadingNewsImage(false);
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      alert("Judul warta wajib diisi.");
      return;
    }
    if (!newsForm.excerpt.trim()) {
      alert("Ringkasan warta wajib diisi.");
      return;
    }

    setSavingNews(true);
    setIsPublishingProcessing("Menyimpan & Menerbitkan Warta Masjid");
    try {
      const contentArray = newsForm.contentRaw
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        title: newsForm.title.trim(),
        badge: newsForm.badge.trim() || "WARTA MASJID",
        badgeClass: newsForm.badgeClass.trim() || "bg-[#003B73] text-white",
        publishedAt: newsForm.publishedAt
          ? new Date(newsForm.publishedAt).toISOString()
          : new Date().toISOString(),
        sourceDomain: newsForm.sourceDomain.trim() || "masjid.ums.ac.id",
        sourceUrl: newsForm.sourceUrl.trim() || "#",
        imageUrl: newsForm.imageUrl.trim() || "/images/news/silaturahmi-bph-1.jpg",
        excerpt: newsForm.excerpt.trim(),
        content: contentArray.length > 0 ? contentArray : [newsForm.excerpt.trim()],
        isPublished: newsForm.isPublished,
      };

      const res = await fetch("/api/admin/news", {
        method: editingNewsId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingNewsId ? { id: editingNewsId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan warta.");

      setIsNewsModalOpen(false);
      triggerPublishNotification(
        editingNewsId ? "Warta Berhasil Diperbarui" : "Warta Baru Diterbitkan",
        `Warta "${newsForm.title.slice(0, 45)}..." telah disimpan dan langsung aktif di baris pertama beranda.`
      );
      await loadManualNews();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan warta.");
    } finally {
      setSavingNews(false);
      setIsPublishingProcessing(null);
    }
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus warta "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/admin/news?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus warta.");
      triggerPublishNotification("Warta Dihapus", `Warta "${title.slice(0, 40)}..." telah dihapus.`);
      await loadManualNews();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus warta.");
    }
  };

  const handleTogglePublishNews = async (item: ManualNewsItem) => {
    const nextStatus = item.isPublished === false ? true : false;
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isPublished: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengubah status publikasi.");
      }
      triggerPublishNotification(
        nextStatus ? "Warta Ditayangkan" : "Warta Disembunyikan",
        `Status warta "${item.title.slice(0, 40)}..." telah diperbarui.`
      );
      await loadManualNews();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status publikasi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans pb-16">
      {/* Floating Processing Indicator */}
      {isPublishingProcessing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#001F3F]/95 text-white px-5 py-2.5 rounded-full shadow-2xl border border-amber-400/50 flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md animate-fade-in">
          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-amber-200">{isPublishingProcessing}...</span>
        </div>
      )}

      {/* Floating Success Toast: Berhasil Dipublikasikan ke Publik */}
      {publishToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] sm:w-full bg-[#001F3F] text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 animate-fade-in flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-bold text-sm text-emerald-300 font-serif truncate">
                {publishToast.title}
              </h4>
              <span className="text-[10px] text-stone-400 shrink-0">{publishToast.timestamp}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-3">
              {publishToast.message}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors shadow-xs"
              >
                <span>Lihat di Beranda Publik</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={() => setPublishToast(null)}
                className="px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPublishToast(null)}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-[#001F3F] border-b border-stone-800/80 text-white sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Logo & Mosque Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link href="/" className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 hover:scale-105 transition-transform" title="Beranda Publik">
              <Image
                src="/images/logo/logo-masjid-white.png"
                alt="Logo Masjid UMS"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-xs sm:text-base text-white font-serif truncate">
                  <span className="sm:hidden">Admin Takmir UMS</span>
                  <span className="hidden sm:inline">Dashboard Manajemen Takmir</span>
                </h1>
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Panel
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-300 truncate">
                <span className="sm:hidden">Masjid Hj. Sudalmiyah Rais</span>
                <span className="hidden sm:inline">Masjid Hj. Sudalmiyah Rais Universitas Muhammadiyah Surakarta</span>
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/agenda/presensi-live"
              target="_blank"
              className="text-[11px] sm:text-xs font-semibold text-amber-300 hover:text-amber-200 px-2.5 sm:px-3.5 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 flex items-center gap-1 sm:gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-95"
              title="Buka Layar Proyektor Presensi QR Dinamis"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Layar Proyektor (QR Dinamis)</span>
              <span className="hidden sm:inline md:hidden">Proyektor QR</span>
              <span className="sm:hidden text-[10px]">Proyektor</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-stone-300 hover:text-white px-3 py-1.5 rounded-full border border-stone-700 hidden lg:flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-stone-400" />
              <span>Portal Publik</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-rose-900/70 hover:bg-rose-800 text-rose-200 text-[11px] sm:text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Cards Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Total Agenda */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Total Agenda
                </span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono">
                  {stats.totalAgendas}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Kegiatan aktif
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#003B73]/10 text-[#003B73]">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Total Registrations */}
            <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Jamaah Terdaftar
                </span>
                <div className="text-2xl font-black text-[#003B73] mt-1 font-mono">
                  {stats.totalRegistrations}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Presensi terverifikasi
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#003B73]/10 text-[#003B73]">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Total Feedbacks & Suggestions */}
            <div
              onClick={() => setActiveTab("FEEDBACK")}
              className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#003B73]/40 transition-colors"
            >
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Aspirasi &amp; Saran
                </span>
                <div className="text-2xl font-black text-stone-900 mt-1 font-mono flex items-center gap-2">
                  <span>{feedbackCounts.total || stats.totalFeedbacks || 0}</span>
                  {feedbackCounts.baru > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 font-sans">
                      {feedbackCounts.baru} Baru
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  {feedbackCounts.ditindaklanjuti} telah ditindaklanjuti
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {/* Beginner Admin Guide Card */}
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#003B73]/5 via-[#FAF8F5] to-amber-500/5 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#003B73] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                Pusat Pengelolaan Konten Masjid
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Pilih menu tab di bawah untuk mengelola data masjid. Setiap perubahan yang disimpan akan langsung terbit secara otomatis di website publik jamaah.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#003B73] bg-[#003B73]/10 hover:bg-[#003B73]/20 border border-[#003B73]/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Cek Tampilan Web</span>
            </Link>
          </div>
        </div>

        {/* Mobile Tab Selector (Compact, touch-friendly dropdown for iOS & Android) */}
        <div className="block md:hidden mb-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-xs">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Menu Admin (8 Menu):
              </span>
              <span className="text-[10px] font-semibold text-[#003B73]">
                {activeTab === "FEEDBACK" && feedbackCounts.baru > 0
                  ? `${feedbackCounts.baru} Masukan Baru`
                  : activeTab === "BERITA_MASJID"
                  ? `${manualNewsList.length} Warta`
                  : activeTab === "DOCUMENTS"
                  ? `${documents.length} Dokumen`
                  : activeTab === "REGISTRATIONS"
                  ? `${registrations.length} Presensi`
                  : "Aktif"}
              </span>
            </div>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-bold text-xs focus:ring-2 focus:ring-[#003B73] focus:border-[#003B73] appearance-none cursor-pointer"
              >
                {ADMIN_TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label} {tab.id === "FEEDBACK" && feedbackCounts.baru > 0 ? `(${feedbackCounts.baru} Baru)` : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls - Smooth Horizontal Scrollable Pills with Floating Navigation Arrows */}
        <div className="relative mb-6">
          {/* Left Floating Arrow Button with Gradient Fade */}
          {canScrollLeft && (
            <div className="absolute left-0 inset-y-0 z-20 flex items-center pb-4 pr-6 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs("left")}
                className="w-8 h-8 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:bg-[#003B73] hover:text-white hover:border-[#003B73] transition-all cursor-pointer active:scale-90 pointer-events-auto"
                title="Geser menu ke kiri"
                aria-label="Geser menu ke kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scrollable Pills Container */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-stone-200 no-scrollbar scroll-smooth px-0.5"
          >
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-active={isActive ? "true" : "false"}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 ${
                    isActive
                      ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/20 ring-2 ring-[#003B73]/20"
                      : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-stone-500"}`} />
                  <span>{tab.label}</span>
                  {tab.id === "FEEDBACK" && feedbackCounts.baru > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                      {feedbackCounts.baru}
                    </span>
                  )}
                  {tab.id === "POPUP_BANNER" && popupBanner && popupBanner.isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                  {tab.id === "DOCUMENTS" && documents.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                      {documents.length}
                    </span>
                  )}
                  {tab.id === "BERITA_MASJID" && manualNewsList.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                      {manualNewsList.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Floating Arrow Button with Gradient Fade */}
          {canScrollRight && (
            <div className="absolute right-0 inset-y-0 z-20 flex items-center pb-4 pl-6 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollTabs("right")}
                className="w-8 h-8 rounded-full bg-white border border-stone-300 shadow-md flex items-center justify-center text-stone-700 hover:bg-[#003B73] hover:text-white hover:border-[#003B73] transition-all cursor-pointer active:scale-90 pointer-events-auto"
                title="Geser menu ke kanan"
                aria-label="Geser menu ke kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: AGENDAS */}
        {activeTab === "AGENDAS" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">Daftar Agenda Masjid</h2>
                <p className="text-xs text-stone-500 mt-0.5">Kelola jadwal kajian, bimbingan tahsin, dan kegiatan kemahasiswaan dengan thumbnail media</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewAgendaOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Agenda Baru</span>
              </button>
            </div>

            {/* Layar Proyektor Presensi Live (Anti-Joki QR Dinamis 10 Detik) */}
            <div className="rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#002855] to-[#003B73] text-white p-5 sm:p-6 border border-amber-400/30 shadow-lg relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Tv className="w-3 h-3 text-amber-300" />
                    <span>Layar Proyektor Takmir</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                    Layar Presensi Live Proyektor (QR Dinamis 10 Detik)
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Tampilkan kode QR di layar proyektor aula atau TV masjid untuk acara seperti Cinta Subuh (Cinsub), Tabligh Akbar, dan Kajian Rutin. Kode QR berganti otomatis setiap 10 detik dengan token terenkripsi untuk mencegah joki / titip absen.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    href="/agenda/presensi-live"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Tv className="w-3.5 h-3.5 text-stone-950" />
                    <span>Buka Layar Proyektor</span>
                    <ExternalLink className="w-3 h-3 text-stone-900" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agendas.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Thumbnail Preview */}
                    <div className="relative h-36 w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={item.bannerUrl || "/uploads/agendas/agenda-jumat.jpg"}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="320px"
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[#003B73] border border-stone-200">
                          {item.category.replace(/_/g, " ")}
                        </span>
                        {item.isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                            <span>Selesai</span>
                          </span>
                        ) : item.requiresRegistration === false ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/95 text-white">
                            Hadir Langsung
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/95 text-white">
                            Pendaftaran Online
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-center text-xs text-stone-500">
                        <span className="font-mono">{item.date}</span>
                        {item.isCompleted ? (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            {item.actualAttendees ? `${item.actualAttendees} Jamaah Hadir` : "Selesai Terlaksana"}
                          </span>
                        ) : item.requiresRegistration === false ? (
                          <span className="text-amber-700 font-semibold text-[11px]">Hadir Langsung di Lokasi</span>
                        ) : (
                          <span>{item.registeredCount} / {item.quota} Jamaah</span>
                        )}
                      </div>
                      <h3 className="font-bold text-stone-900 text-sm line-clamp-2 font-serif">{item.title}</h3>
                      {item.targetAudience && (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900 leading-snug">
                          {item.targetAudience}
                        </div>
                      )}

                      {/* Laporan Hasil jika selesai */}
                      {item.isCompleted && (
                        <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1 text-[11px] text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Kegiatan Telah Terlaksana</span>
                            </span>
                            {item.documentationPhotos && item.documentationPhotos.length > 0 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                                {item.documentationPhotos.length} Foto
                              </span>
                            )}
                          </div>
                          {item.actualAttendees && (
                            <div className="text-[11px] font-medium text-emerald-900">
                              Jumlah Peserta: <strong>{item.actualAttendees.toLocaleString("id-ID")} Jamaah</strong>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-xs text-stone-700 pt-1">
                        <div><strong>Pemateri:</strong> {item.speaker}</div>
                        <div className="text-[11px] text-stone-500">{item.speakerRole}</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 text-[11px] text-stone-500 border-t border-stone-100 flex flex-col gap-2.5">
                    <div className="text-stone-400">
                      {item.time} • {item.location}
                    </div>

                    {/* Action Buttons: Status Selesai & Kelola Dokumentasi */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleQuickComplete(item)}
                        className={`w-full min-h-[42px] py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-2xs active:scale-95 ${
                          item.isCompleted
                            ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                        }`}
                        title={item.isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.isCompleted ? "Batal Selesai" : "Tandai Selesai"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAgendaDoc(item)}
                        className="w-full min-h-[42px] py-2 px-2 rounded-xl text-[11px] font-bold bg-[#003B73] hover:bg-[#002855] text-white border border-[#003B73] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                        title="Atur foto dokumentasi dan jumlah peserta"
                      >
                        <Camera className="w-3.5 h-3.5 shrink-0" />
                        <span>Dokumentasi</span>
                      </button>
                    </div>

                    <Link
                      href={`/agenda/presensi-live?agendaId=${item.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 w-full min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold text-[#003B73] bg-[#003B73]/10 hover:bg-[#003B73]/15 border border-[#003B73]/20 transition-all active:scale-[0.98]"
                    >
                      <Tv className="w-3.5 h-3.5 text-[#003B73] shrink-0" />
                      <span>Mode Proyektor QR Acara Ini</span>
                      <ExternalLink className="w-3 h-3 text-[#003B73]/70 shrink-0" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: PETUGAS SHALAT & KHATIB JUMAT (6 MASJID KAMPUS UMS) */}
        {activeTab === "PETUGAS_JUMAT" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Pengaturan Petugas Imam &amp; Khatib 6 Masjid Kampus UMS
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pilih salah satu dari 6 masjid kampus di bawah ini untuk melihat dan menyesuaikan jadwal petugas jumat, nama khatib, foto, tema khutbah, imam, dan muadzin. Jadwal sebelumnya otomatis tersimpan di arsip riwayat.
              </p>
            </div>

            {/* Mosque Selector Grid */}
            <div className="bg-stone-50 p-4 rounded-3xl border border-stone-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Pilih Masjid yang Dikelola:
                </span>
                <span className="text-[11px] font-semibold text-[#003B73]">
                  Sedang Mengedit: <strong>{activeMosqueMeta.name}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {ADMIN_MOSQUES.map((m) => {
                  const isSelected = m.id === selectedMosqueId;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMosque(m.id)}
                      className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between active:scale-95 cursor-pointer ${
                        isSelected
                          ? "bg-[#003B73] text-white border-[#003B73] shadow-md shadow-[#003B73]/20 ring-2 ring-[#003B73]/20"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-start gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                            isSelected ? "bg-[#D4AF37]" : "bg-stone-300"
                          }`}
                        />
                        <span className="text-[11px] sm:text-xs font-bold leading-snug line-clamp-2">
                          {m.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {fridaySaveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Perubahan jadwal petugas shalat dan khatib untuk {activeMosqueMeta.name} berhasil disimpan dan langsung tayang di beranda.
              </div>
            )}

            {fridaySchedule ? (
              <form onSubmit={handleUpdateFridaySchedule} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Active Mosque Badge Banner */}
                <div className="px-4 py-3 rounded-2xl bg-[#003B73]/5 border border-[#003B73]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#003B73]" />
                    <span className="text-xs font-bold text-[#003B73]">
                      Form Jadwal: {activeMosqueMeta.name}
                    </span>
                  </div>
                </div>

                {/* Photo & Khatib Highlight */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Photo Preview & Upload Button */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative w-36 h-44 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-sm bg-stone-100 flex flex-col items-center justify-center">
                      {fridaySchedule.khatibPhotoUrl ? (
                        <Image
                          src={fridaySchedule.khatibPhotoUrl}
                          alt="Foto Khatib"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-stone-400">
                          <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center mb-1.5 text-stone-500">
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-stone-600">Belum Ada Foto</span>
                          <span className="text-[9px] text-stone-400">Klik tombol di bawah</span>
                        </div>
                      )}
                    </div>
                    {/* Media Upload & Remove Buttons */}
                    <div className="flex flex-col items-center gap-1.5">
                      <label className="cursor-pointer px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold text-center transition-colors shadow-xs">
                        {uploadingKhatibPhoto
                          ? "Mengunggah..."
                          : fridaySchedule.khatibPhotoUrl
                          ? "Ganti Foto Khatib"
                          : "+ Unggah Foto Khatib"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleKhatibPhotoUpload}
                          disabled={uploadingKhatibPhoto}
                        />
                      </label>
                      {fridaySchedule.khatibPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...fridaySchedule, khatibPhotoUrl: "" };
                            setFridaySchedule(updated);
                            setFridaySchedules((prev) =>
                              prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? updated : s))
                            );
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 text-center">Format JPG, PNG, atau WEBP</span>
                  </div>

                  {/* Khatib Fields */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Lengkap Khatib Beserta Gelar
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.khatibName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Nama lengkap khatib (contoh: Dalam Konfirmasi)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jabatan / Instansi Khatib
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.khatibTitle}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                        placeholder="Jabatan atau instansi khatib"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tema / Judul Khutbah Jumat
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.khutbahTheme}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khutbahTheme: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                        placeholder="Tema khutbah Jumat"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time Row with Automatic Friday Helpers */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-amber-950">
                        Otomatis Tanggal Setiap Jumat (Hisab KHGT Muhammadiyah)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAutoSetFriday(0, false)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Setel tanggal ke Jumat pekan ini / terdekat"
                      >
                        Jumat Ini ({calculateFridayInfo(0).masehi})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSetFriday(1, false)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/70 text-amber-900 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Setel tanggal ke Jumat pekan depan"
                      >
                        Jumat Depan ({calculateFridayInfo(1).masehi})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoSetFriday(0, true)}
                        className="px-2.5 py-1 rounded-lg bg-[#003B73] hover:bg-[#002855] text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Terapkan tanggal Jumat pekan ini ke 6 masjid sekaligus"
                      >
                        Terapkan ke 6 Masjid
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tanggal Masehi
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.date}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Contoh: 23 Oktober 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tanggal Hijriyah
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.hijriDate}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, hijriDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Contoh: 12 Jumadilawal 1448 H"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Waktu Pelaksanaan
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.time}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, time: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Contoh: 11:35 WIB"
                      />
                    </div>
                  </div>
                </div>

                {/* Imam & Muadzin Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-[#003B73] uppercase tracking-wider block">
                      Petugas Imam Shalat Jumat
                    </span>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Imam
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.imamName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Nama imam (contoh: Dalam Konfirmasi)"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700">
                          Status Civitas (Dosen / Tendik / Mahasiswa)
                        </label>
                        <span className="text-[10px] text-stone-400">Pilih cepat:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {["Dosen", "Tendik", "Mahasiswa", "Umum"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              const updated = { ...fridaySchedule, imamRole: role };
                              setFridaySchedule(updated);
                              setFridaySchedules((prev) =>
                                prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? updated : s))
                              );
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                              fridaySchedule.imamRole === role
                                ? "bg-[#003B73] text-white border-[#003B73]"
                                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={fridaySchedule.imamRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                        placeholder="Pilih atau ketik status (contoh: Dosen, Tendik, Mahasiswa)"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                    <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider block">
                      Petugas Muadzin Shalat Jumat
                    </span>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Muadzin
                      </label>
                      <input
                        type="text"
                        value={fridaySchedule.muadzinName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Nama muadzin (contoh: Dalam Konfirmasi)"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-stone-700">
                          Status Civitas (Mahasiswa / Tendik / Dosen)
                        </label>
                        <span className="text-[10px] text-stone-400">Pilih cepat:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {["Mahasiswa", "Tendik", "Dosen", "Umum"].map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              const updated = { ...fridaySchedule, muadzinRole: role };
                              setFridaySchedule(updated);
                              setFridaySchedules((prev) =>
                                prev.map((s) => ((s.mosqueId || s.id) === selectedMosqueId ? updated : s))
                              );
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                              fridaySchedule.muadzinRole === role
                                ? "bg-stone-800 text-white border-stone-800"
                                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={fridaySchedule.muadzinRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                        placeholder="Pilih atau ketik status (contoh: Mahasiswa, Tendik, Dosen)"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes for Jamaah */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catatan / Himbauan Jamaah
                  </label>
                  <textarea
                    rows={2}
                    value={fridaySchedule.notes || ""}
                    onChange={(e) => setFridaySchedule({ ...fridaySchedule, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                    placeholder="Contoh: Jamaah diimbau hadir lebih awal sebelum adzan berkumandang, menjaga kekhusyukan dan kebersihan masjid."
                  />
                </div>

                {/* Info Perolehan Infaq Shalat Jumat */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Informasi Hasil Perolehan Infaq Shalat Jumat
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Tampil Aktif di Bawah Jadwal Jumat ({activeMosqueMeta.name})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Perolehan Infaq Shalat Jumat (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-stone-500">
                          Rp
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="Contoh: 8750000"
                          value={
                            fridaySchedule.infaqAmount !== undefined && fridaySchedule.infaqAmount !== null
                              ? fridaySchedule.infaqAmount
                              : ""
                          }
                          onChange={(e) =>
                            setFridaySchedule({
                              ...fridaySchedule,
                              infaqAmount: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Kosongkan atau biarkan 0 jika belum selesai dihitung oleh takmir.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Periode / Tanggal Pelaksanaan Infaq
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jumat, 17 Oktober 2026 (atau Pekan Ke-2)"
                        value={fridaySchedule.infaqPeriod || ""}
                        onChange={(e) =>
                          setFridaySchedule({
                            ...fridaySchedule,
                            infaqPeriod: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        Keterangan waktu pelaksanaan perolehan infaq Jumat ini.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Catatan / Keterangan Penyaluran Infaq (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Infaq kotak keliling telah dihitung bersama panitia dan marbot masjid serta disalurkan untuk operasional ibadah & kebersihan."
                      value={fridaySchedule.infaqNotes || ""}
                      onChange={(e) =>
                        setFridaySchedule({
                          ...fridaySchedule,
                          infaqNotes: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-stone-500 text-center sm:text-left">
                    Menyimpan perubahan untuk <strong>{activeMosqueMeta.name}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={savingFriday}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {savingFriday ? "Menyimpan Perubahan..." : `Simpan Jadwal (${activeMosqueMeta.name})`}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200">
                Memuat data jadwal jumat...
              </div>
            )}

            {/* Arsip Riwayat Petugas Jumat Sebelumnya (Tersimpan Otomatis) */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                    <History className="w-4 h-4 text-[#003B73]" />
                    <span>Arsip Riwayat Petugas Sebelumnya (Tersimpan Otomatis)</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Setiap kali jadwal Jumat diperbarui dengan nama petugas baru, jadwal sebelumnya otomatis diarsipkan ke sistem ini.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                  {fridayHistory.length} Arsip
                </span>
              </div>

              {fridayHistory.length === 0 ? (
                <div className="p-6 rounded-2xl bg-stone-50 text-center text-xs text-stone-400">
                  Belum ada riwayat petugas tersimpan.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {fridayHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-2 hover:border-[#003B73]/30 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#003B73]">{h.mosqueName}</span>
                        <span className="font-mono text-stone-500 font-semibold">{h.date}</span>
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">
                          Khatib: {h.khatibName}
                        </div>
                        {h.khatibTitle && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {h.khatibTitle}
                          </div>
                        )}
                      </div>
                      {h.khutbahTheme && (
                        <div className="text-stone-600 italic text-[11px] pt-1 border-t border-stone-200/60">
                          &ldquo;{h.khutbahTheme}&rdquo;
                        </div>
                      )}
                      <div className="text-stone-500 text-[11px] pt-1.5 border-t border-stone-200/70 flex items-center justify-between">
                        <span>Imam: <strong>{h.imamName || "-"}</strong></span>
                        <span>{h.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: QRIS_INFAQ */}
        {activeTab === "QRIS_INFAQ" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">
                Kelola Gambar & Pengaturan QRIS Infaq
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Unggah gambar QRIS resmi masjid dan sesuaikan informasi penerima merchant untuk jamaah
              </p>
            </div>

            {qrisSaveSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
                Pengaturan dan gambar QRIS berhasil diperbarui serta langsung aktif pada tampilan situs.
              </div>
            )}

            {qrisSettings ? (
              <form onSubmit={handleUpdateQrisSettings} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QRIS 1 (Kiri) - LAZ UMS Sudalmiyah */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#003B73] uppercase tracking-wider block">
                          QRIS 1: LAZ UMS Sudalmiyah (Sisi Kiri)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#003B73]/10 text-[#003B73]">
                          Utama
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-3">
                        {/* Live Preview Frame */}
                        <div className="relative w-36 h-48 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-md shrink-0 bg-white flex items-center justify-center p-2">
                          <Image
                            src={qrisSettings.imageUrl || "/images/qris-sudalmiyah.png"}
                            alt="Pratinjau QRIS 1"
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                          <div>
                            <label className="block text-xs font-bold text-stone-800 mb-1">
                              Unggah Gambar QRIS 1
                            </label>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Format: PNG, JPG, WEBP.
                            </p>
                          </div>

                          <div>
                            <label className="inline-block px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95">
                              {uploadingQrisImage ? "Mengunggah..." : "Pilih Berkas QRIS 1"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingQrisImage}
                                onChange={handleQrisImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">
                              Lokasi Berkas:
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={qrisSettings.imageUrl}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Nama Merchant QRIS 1
                        </label>
                        <input
                          type="text"
                          required
                          value={qrisSettings.merchantName}
                          onChange={(e) => setQrisSettings({ ...qrisSettings, merchantName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                          placeholder="Contoh: LAZ UMS-MSJD SUDALMIYAH"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          NMID QRIS 1
                        </label>
                        <input
                          type="text"
                          required
                          value={qrisSettings.nmid}
                          onChange={(e) => setQrisSettings({ ...qrisSettings, nmid: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono"
                          placeholder="Contoh: ID2024353816125"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QRIS 2 (Kanan) - Bank Jateng / MASJID UMS */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                          QRIS 2: Bank Jateng (Sisi Kanan)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-900">
                          Kedua
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-3">
                        {/* Live Preview Frame */}
                        <div className="relative w-36 h-48 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md shrink-0 bg-white flex items-center justify-center p-2">
                          <Image
                            src={qrisSettings.secondaryImageUrl || "/images/qris-bank-jateng.jpg"}
                            alt="Pratinjau QRIS 2"
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                          <div>
                            <label className="block text-xs font-bold text-stone-800 mb-1">
                              Unggah Gambar QRIS 2
                            </label>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Format: PNG, JPG, WEBP.
                            </p>
                          </div>

                          <div>
                            <label className="inline-block px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95">
                              {uploadingSecondaryQrisImage ? "Mengunggah..." : "Pilih Berkas QRIS 2"}
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingSecondaryQrisImage}
                                onChange={handleSecondaryQrisImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">
                              Lokasi Berkas:
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={qrisSettings.secondaryImageUrl || "/images/qris-bank-jateng.jpg"}
                              className="w-full px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Nama Merchant QRIS 2
                        </label>
                        <input
                          type="text"
                          value={qrisSettings.secondaryMerchantName || "MASJID UMS"}
                          onChange={(e) => setQrisSettings({ ...qrisSettings, secondaryMerchantName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                          placeholder="Contoh: MASJID UMS"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          NMID / Keterangan QRIS 2
                        </label>
                        <input
                          type="text"
                          value={qrisSettings.secondaryNmid || "-"}
                          onChange={(e) => setQrisSettings({ ...qrisSettings, secondaryNmid: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono"
                          placeholder="Contoh: Bank Jateng Pedagang BIMA"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Institution Row */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Institusi / Universitas Pengelola
                  </label>
                  <input
                    type="text"
                    required
                    value={qrisSettings.institution}
                    onChange={(e) => setQrisSettings({ ...qrisSettings, institution: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                    placeholder="Contoh: Universitas Muhammadiyah Surakarta"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingQris}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {savingQris ? "Menyimpan Pengaturan..." : "Simpan Pengaturan QRIS"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-3xl border border-stone-200">
                Memuat data pengaturan QRIS...
              </div>
            )}
          </div>
        )}

        {/* Tab 4: REGISTRATIONS (Presensi Kehadiran Agenda Terpisah Per Kegiatan + Download Excel) */}
        {activeTab === "REGISTRATIONS" && (() => {
          const filteredRegistrations = registrationAgendaFilter === "ALL"
            ? registrations
            : registrations.filter((r) => r.agendaId === registrationAgendaFilter);
          
          const regTotal = filteredRegistrations.length;
          const regMahasiswa = filteredRegistrations.filter((r) => r.isUmsStudent || r.participantRole === "MAHASISWA").length;
          const regUmum = regTotal - regMahasiswa;
          const regGps = filteredRegistrations.filter((r) => r.locationVerified).length;

          return (
            <div className="space-y-5">
              {/* Header & Main Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-serif">Data Presensi Kehadiran Agenda & Kajian</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Data kehadiran jamaah dipisahkan per agenda kegiatan untuk mempermudah rekapitulasi takmir
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  <Link
                    href="/agenda/presensi-live"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Tv className="w-3.5 h-3.5 text-amber-400" />
                    <span>Layar Proyektor Presensi</span>
                    <ExternalLink className="w-3 h-3 text-stone-300" />
                  </Link>
                  <button
                    type="button"
                    onClick={exportPresensiCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Download Spreadsheet / Excel (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Filter Agenda Dropdown Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Pilih Agenda Kegiatan (Rekap Per Agenda)
                  </label>
                  <select
                    value={registrationAgendaFilter}
                    onChange={(e) => setRegistrationAgendaFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#003B73]"
                  >
                    <option value="ALL">Semua Agenda Kegiatan ({registrations.length} Total Jamaah)</option>
                    {agendas.map((ag) => {
                      const count = registrations.filter((r) => r.agendaId === ag.id).length;
                      return (
                        <option key={ag.id} value={ag.id}>
                          {ag.title} ({count} Hadir) - {ag.date}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Summary Metrics for Selected Agenda */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-stone-500 font-medium block">Total Hadir</span>
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono mt-0.5 block">{regTotal}</span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Jamaah terdaftar</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-sky-700 font-medium block">Mahasiswa UMS</span>
                  <span className="text-xl sm:text-2xl font-black text-sky-900 font-mono mt-0.5 block">{regMahasiswa}</span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Dengan NIM terverifikasi</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-amber-700 font-medium block">Dosen & Umum</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900 font-mono mt-0.5 block">{regUmum}</span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Civitas & Tamu luar</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-emerald-700 font-medium block">Verifikasi Lokasi GPS</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-900 font-mono mt-0.5 block">{regGps}</span>
                  <span className="text-[10px] text-emerald-600 mt-1 block">Hadir langsung di masjid</span>
                </div>
              </div>

              {/* List Container */}
              <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                {/* Mobile Card View (Phone screens: Android & iOS) */}
                <div className="block md:hidden divide-y divide-stone-100">
                  {filteredRegistrations.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      Belum ada data presensi jamaah untuk agenda ini.
                    </div>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <div key={reg.id} className="p-4 flex items-start gap-3 bg-white hover:bg-stone-50/60 transition-colors">
                        {reg.photoUrl ? (
                          <a
                            href={reg.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-2xs shrink-0 bg-stone-100"
                            title="Lihat foto presensi ukuran penuh"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={reg.photoUrl} alt={reg.fullName} className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs text-stone-400 font-medium shrink-0">
                            -
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{reg.fullName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0">
                              Hadir
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            {reg.isUmsStudent ? (
                              <span className="text-sky-700 font-semibold">Mahasiswa ({reg.nim})</span>
                            ) : (
                              <span className="text-stone-500">Jamaah Umum</span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5 font-sans">
                            {reg.agendaTitle}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1">
                            <span>
                              {reg.attendedAt
                                ? new Date(reg.attendedAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Asia/Jakarta",
                                  }) + " WIB"
                                : "-"}
                            </span>
                            {reg.locationVerified && (
                              <span className="text-emerald-700 font-bold">GPS Terverifikasi</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider bg-[#FAF8F5]">
                        <th className="py-3.5 px-4 font-semibold">Foto Presensi</th>
                        <th className="py-3.5 px-4 font-semibold">Nama Jamaah</th>
                        <th className="py-3.5 px-4 font-semibold">Status Sivitas</th>
                        <th className="py-3.5 px-4 font-semibold">Agenda Kegiatan</th>
                        <th className="py-3.5 px-4 font-semibold">Waktu Presensi</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Verifikasi Lokasi</th>
                        <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                            Belum ada data presensi jamaah untuk agenda ini.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-stone-50">
                            <td className="py-3 px-4">
                              {reg.photoUrl ? (
                                <a
                                  href={reg.photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shadow-2xs hover:scale-105 transition-transform bg-stone-100 shrink-0"
                                  title="Lihat foto presensi ukuran penuh"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={reg.photoUrl} alt={reg.fullName} className="w-full h-full object-cover" />
                                </a>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-medium">
                                  -
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-900 font-semibold">{reg.fullName}</td>
                            <td className="py-3.5 px-4 text-stone-700">
                              {reg.isUmsStudent ? (
                                <span className="text-sky-700 font-semibold">
                                  Mahasiswa ({reg.nim})
                                </span>
                              ) : (
                                <span className="text-stone-500">Jamaah Umum</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                              {reg.agendaTitle}
                            </td>
                            <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                              {reg.attendedAt
                                ? new Date(reg.attendedAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Asia/Jakarta",
                                  }) + " WIB"
                                : reg.registeredAt
                                ? new Date(reg.registeredAt).toLocaleDateString("id-ID")
                                : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {reg.locationVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Masjid UMS</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400">Manual</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                Hadir
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab 5: ABSENSI_SHALAT (Absensi Shalat Berjamaah Subuh s.d. Isya) */}
        {activeTab === "ABSENSI_SHALAT" && (() => {
          let filtered = prayerAttendances;
          if (prayerFilter !== "ALL") {
            filtered = filtered.filter((p) => p.prayerName.toUpperCase() === prayerFilter.toUpperCase());
          }
          if (prayerMosqueFilter !== "ALL") {
            filtered = filtered.filter((p) => p.mosqueId === prayerMosqueFilter);
          }
          if (prayerDateFilter) {
            filtered = filtered.filter((p) => p.date === prayerDateFilter);
          }

          const countSubuh = prayerAttendances.filter((p) => p.prayerName === "SUBUH").length;
          const countDzuhur = prayerAttendances.filter((p) => p.prayerName === "DZUHUR").length;
          const countAshar = prayerAttendances.filter((p) => p.prayerName === "ASHAR").length;
          const countMaghrib = prayerAttendances.filter((p) => p.prayerName === "MAGHRIB").length;
          const countIsya = prayerAttendances.filter((p) => p.prayerName === "ISYA").length;

          return (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900 font-serif">Absensi Shalat Berjamaah (Subuh s.d. Isya)</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Rekapitulasi kehadiran jamaah shalat fardhu 5 waktu dengan verifikasi lokasi GPS resmi di 6 masjid kampus UMS
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  <Link
                    href="/ibadah/presensi"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Buka Form Presensi</span>
                  </Link>
                  <button
                    type="button"
                    onClick={exportPrayerCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Download Spreadsheet / Excel (.csv)</span>
                  </button>
                  {prayerAttendances.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllPrayerAttendances}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
                      title="Kosongkan semua data presensi shalat untuk memulai dengan data riil"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Kosongkan Data Presensi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Shalat Pills Filter (Subuh, Dzuhur, Ashar, Maghrib, Isya) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setPrayerFilter("ALL")}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    prayerFilter === "ALL"
                      ? "bg-[#003B73] text-white shadow-sm"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  Semua Shalat ({prayerAttendances.length})
                </button>
                {[
                  { key: "SUBUH", label: "Subuh", count: countSubuh },
                  { key: "DZUHUR", label: "Dzuhur", count: countDzuhur },
                  { key: "ASHAR", label: "Ashar", count: countAshar },
                  { key: "MAGHRIB", label: "Maghrib", count: countMaghrib },
                  { key: "ISYA", label: "Isya", count: countIsya },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPrayerFilter(item.key)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      prayerFilter === item.key
                        ? "bg-amber-400 text-stone-950 shadow-sm font-extrabold"
                        : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>

              {/* Dropdown Filters for Mosque & Date */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Filter Masjid UMS
                  </label>
                  <select
                    value={prayerMosqueFilter}
                    onChange={(e) => setPrayerMosqueFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#003B73]"
                  >
                    <option value="ALL">Semua Masjid (6 Masjid)</option>
                    {ADMIN_MOSQUES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Filter Tanggal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={prayerDateFilter}
                      onChange={(e) => setPrayerDateFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#003B73]"
                    />
                    {prayerDateFilter && (
                      <button
                        type="button"
                        onClick={() => setPrayerDateFilter("")}
                        className="px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold whitespace-nowrap cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-stone-500 font-medium block">Total Hadir Shalat</span>
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-mono mt-0.5 block">{filtered.length}</span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Jamaah terabsen</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-sky-700 font-medium block">Mahasiswa</span>
                  <span className="text-xl sm:text-2xl font-black text-sky-900 font-mono mt-0.5 block">
                    {filtered.filter((p) => p.participantRole === "MAHASISWA").length}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Civitas mahasiswa</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-amber-700 font-medium block">Dosen / Tendik / Umum</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900 font-mono mt-0.5 block">
                    {filtered.filter((p) => p.participantRole !== "MAHASISWA").length}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 block">Jamaah umum & staf</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-emerald-700 font-medium block">Verifikasi Lokasi GPS</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                    {filtered.filter((p) => p.locationVerified).length}
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1 block">100% Valid di masjid</span>
                </div>
              </div>

              {/* Data List Container */}
              <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                {/* Mobile View */}
                <div className="block md:hidden divide-y divide-stone-100">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      Belum ada data absensi shalat untuk filter ini.
                    </div>
                  ) : (
                    filtered.map((item) => (
                      <div key={item.id} className="p-4 flex items-start gap-3 bg-white hover:bg-stone-50/60 transition-colors">
                        {item.photoUrl ? (
                          <a
                            href={item.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shadow-2xs shrink-0 bg-stone-100"
                            title="Lihat foto presensi shalat"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs text-stone-400 font-medium shrink-0">
                            -
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">{item.fullName}</h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold">
                                {item.prayerName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeletePrayerAttendance(item.id, item.fullName)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                                title="Hapus presensi"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5">
                            {item.participantRole === "MAHASISWA" ? (
                              <span className="text-sky-700 font-semibold">Mahasiswa ({item.nim || "-"})</span>
                            ) : (
                              <span className="text-stone-500">{item.participantRole}</span>
                            )}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {item.mosqueName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono mt-1">
                            <span>
                              {new Date(item.attendedAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Jakarta",
                              })}{" "}
                              WIB • {item.date}
                            </span>
                            <span className="text-emerald-700 font-bold">GPS: {item.distanceMeters || 0}m</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider bg-[#FAF8F5]">
                        <th className="py-3.5 px-4 font-semibold">Foto</th>
                        <th className="py-3.5 px-4 font-semibold">Nama Jamaah</th>
                        <th className="py-3.5 px-4 font-semibold">Kategori</th>
                        <th className="py-3.5 px-4 font-semibold text-center">Waktu Shalat</th>
                        <th className="py-3.5 px-4 font-semibold">Masjid Kampus</th>
                        <th className="py-3.5 px-4 font-semibold">Waktu Presensi</th>
                        <th className="py-3.5 px-4 font-semibold text-center">GPS Valid</th>
                        <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-center font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-stone-400 text-xs">
                            Belum ada data absensi shalat untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr key={item.id} className="hover:bg-stone-50">
                            <td className="py-3 px-4">
                              {item.photoUrl ? (
                                <a
                                  href={item.photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shadow-2xs hover:scale-105 transition-transform bg-stone-100 shrink-0"
                                  title="Lihat foto presensi shalat"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" />
                                </a>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-medium">
                                  -
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-stone-900 font-semibold">{item.fullName}</td>
                            <td className="py-3.5 px-4 text-stone-700">
                              {item.participantRole === "MAHASISWA" ? (
                                <span className="text-sky-700 font-semibold">
                                  Mahasiswa ({item.nim || "-"})
                                </span>
                              ) : (
                                <span className="text-stone-500">{item.participantRole}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold">
                                {item.prayerName}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-stone-700 font-medium">
                              {item.mosqueName}
                            </td>
                            <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                              {new Date(item.attendedAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Jakarta",
                              })}{" "}
                              WIB • {item.date}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{item.distanceMeters || 0}m</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                                Hadir
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeletePrayerAttendance(item.id, item.fullName)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus presensi ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab 5: FEEDBACK (Kotak Saran & Aspirasi Jamaah) */}
        {activeTab === "FEEDBACK" && (
          <div className="space-y-6">
            {/* Header & Status Filter Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  Kotak Saran &amp; Aspirasi Jamaah Masjid
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tinjau masukan konstruktif, beri respon resmi takmir, dan kelola status perbaikan 6 masjid kampus UMS
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200">
                {[
                  { key: "ALL", label: "Semua", count: feedbackCounts.total },
                  { key: "BARU", label: "Baru", count: feedbackCounts.baru, highlight: true },
                  { key: "DITINJAU", label: "Ditinjau", count: feedbackCounts.ditinjau },
                  { key: "DITINDAKLANJUTI", label: "Ditindaklanjuti", count: feedbackCounts.ditindaklanjuti },
                  { key: "DIARSIPKAN", label: "Arsip", count: feedbackCounts.diarsipkan },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setFeedbackFilterStatus(s.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      feedbackFilterStatus === s.key
                        ? "bg-[#003B73] text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        feedbackFilterStatus === s.key
                          ? "bg-white/20 text-white"
                          : s.highlight && s.count > 0
                          ? "bg-rose-100 text-rose-700 font-bold"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {s.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar: Search & Mosque Filter */}
            <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Box */}
              <form onSubmit={handleSearchFeedbackSubmit} className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Cari kata kunci, nama jamaah, kontak, atau masjid..."
                  className="w-full pl-10 pr-20 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-3 py-1 rounded-lg bg-[#003B73] text-white text-[11px] font-semibold hover:bg-[#002855]"
                >
                  Cari
                </button>
              </form>

              {/* Filter Masjid */}
              <div className="w-full md:w-64 shrink-0">
                <select
                  value={feedbackFilterMosque}
                  onChange={(e) => setFeedbackFilterMosque(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                >
                  <option value="ALL">Semua Masjid Kampus</option>
                  <option value="Masjid Hj. Sudalmiyah Rais">Masjid Hj. Sudalmiyah Rais</option>
                  <option value="Masjid Fadhlurrahman">Masjid Fadhlurrahman</option>
                  <option value="Masjid KH. Mas Mansur">Masjid KH. Mas Mansur</option>
                  <option value="Masjid Ma'had Abu Bakar">Masjid Ma'had Abu Bakar</option>
                  <option value="Masjid Al-Munajat">Masjid Al-Munajat</option>
                  <option value="Masjid Ar-Razi FKG">Masjid Ar-Razi FKG</option>
                  <option value="Semua Masjid Kampus">Saran Umum Seluruh Masjid</option>
                </select>
              </div>

              {feedbacks.length > 0 && (
                <button
                  onClick={handleClearAllFeedbacks}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="Kosongkan Semua Data Masukan"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Kosongkan Data</span>
                </button>
              )}
            </div>

            {/* Feedbacks Content List */}
            {loadingFeedbacks ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
                <div className="w-8 h-8 border-3 border-[#003B73]/20 border-t-[#003B73] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-stone-500">Memuat data masukan jamaah...</p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 max-w-lg mx-auto">
                <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-stone-800 font-serif">Tidak Ada Data Masukan</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Belum ada aspirasi jamaah yang cocok dengan filter yang dipilih.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-[#003B73]/30 transition-all space-y-4"
                  >
                    {/* Top Row: Mosque, Rating & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003B73]/10 text-[#003B73]">
                          <Building2 className="w-3.5 h-3.5 text-[#003B73]" />
                          <span>{fb.targetMosque}</span>
                        </span>
                        <div className="flex items-center gap-0.5 ml-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= fb.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {fb.status === "BARU" && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Masukan Baru
                          </span>
                        )}
                        {fb.status === "DITINJAU" && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Sedang Ditinjau
                          </span>
                        )}
                        {fb.status === "DITINDAKLANJUTI" && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Telah Ditindaklanjuti
                          </span>
                        )}
                        {fb.status === "DIARSIPKAN" && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            Diarsipkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sender Info Row */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-700 font-mono text-xs">
                          {fb.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900">{fb.name}</span>
                          {fb.isAnonymous && (
                            <span className="ml-2 text-[10px] text-stone-400">(Anonim)</span>
                          )}
                        </div>
                        {fb.contact && (
                          <div className="ml-3 pl-3 border-l border-stone-200 flex items-center gap-2">
                            <span className="text-stone-600 font-mono">{fb.contact}</span>
                            {/^[0-9+]+$/.test(fb.contact.replace(/\s+/g, "")) && (
                              <a
                                href={`https://wa.me/${fb.contact.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[10px] transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>Hubungi WA</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400">
                        {new Date(fb.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-stone-800 text-xs sm:text-sm leading-relaxed">
                      &ldquo;{fb.message}&rdquo;
                    </div>

                    {/* Takmir Response if any */}
                    {fb.adminResponse && (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Tanggapan Resmi Takmir ({fb.respondedBy || "Takmir"})
                          </span>
                          {fb.respondedAt && (
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {new Date(fb.respondedAt).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-700 leading-relaxed italic">
                          {fb.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleOpenResponseModal(fb)}
                          className="px-4 py-1.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>{fb.adminResponse ? "Edit Tanggapan" : "Beri Tanggapan Takmir"}</span>
                        </button>

                        {fb.status !== "DITINDAKLANJUTI" && (
                          <button
                            onClick={() => handleUpdateFeedbackStatus(fb.id, "DITINDAKLANJUTI")}
                            className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Tandai Ditindaklanjuti</span>
                          </button>
                        )}

                        {fb.status !== "DIARSIPKAN" && (
                          <button
                            onClick={() => handleUpdateFeedbackStatus(fb.id, "DIARSIPKAN")}
                            className="px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                          >
                            <span>Arsipkan</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => handleDeleteFeedback(fb.id)}
                          className="px-3 py-1.5 rounded-full hover:bg-rose-50 text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Hapus masukan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: POPUP BANNER (Banner Pop-up Pengumuman Beranda) */}
        {activeTab === "POPUP_BANNER" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  Kelola Pop-up Banner Pengumuman Beranda
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Unggah poster pengumuman untuk ditampilkan sebagai pop-up saat pengunjung membuka beranda website. Tautan URL tujuan bersifat opsional (tidak wajib diisi).
                </p>
              </div>

              {popupBanner && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleTogglePopupActive()}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      popupBanner.isActive
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-stone-300 hover:bg-stone-400 text-stone-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${popupBanner.isActive ? "bg-white animate-pulse" : "bg-stone-500"}`} />
                    <span>{popupBanner.isActive ? "Status: Tayang (Aktif)" : "Status: Dinonaktifkan"}</span>
                  </button>

                  {popupBanners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePopup()}
                      className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Hapus semua poster yang ada sekaligus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Semua Poster</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Upload New Banner with Duration */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 font-serif">
                    Unggah Poster / Banner Baru
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Pilih poster pengumuman yang ingin ditampilkan sebagai pop-up di beranda. Anda dapat menentukan masa tayang otomatis (misal: 1 hari, hingga agenda selesai, atau tanggal kustom).
                  </p>

                  {/* Pengaturan Durasi Sebelum Unggah */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-[#003B73]" />
                        Atur Durasi Tayang:
                      </span>
                      <span className="text-[10px] font-semibold text-[#003B73] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {uploadDurationType === "UNLIMITED" && "Tanpa Batas"}
                        {uploadDurationType === "1_DAY" && "1 Hari (24 Jam)"}
                        {uploadDurationType === "3_DAYS" && "3 Hari"}
                        {uploadDurationType === "7_DAYS" && "7 Hari (1 Pekan)"}
                        {uploadDurationType === "AGENDA" && "Selesai Ikut Agenda"}
                        {uploadDurationType === "CUSTOM" && "Kustom Tanggal"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("UNLIMITED")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "UNLIMITED"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        Tanpa Batas
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("1_DAY")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "1_DAY"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        1 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("3_DAYS")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "3_DAYS"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        3 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("7_DAYS")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "7_DAYS"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        7 Hari
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("AGENDA")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "AGENDA"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        Ikut Agenda
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadDurationType("CUSTOM")}
                        className={`px-2 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer border text-center ${
                          uploadDurationType === "CUSTOM"
                            ? "bg-[#003B73] text-white border-[#003B73] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        Kustom
                      </button>
                    </div>

                    {uploadDurationType === "AGENDA" && (
                      <div className="space-y-1.5 pt-1 animate-fade-in">
                        <label className="block text-[11px] font-semibold text-stone-700">
                          Pilih Agenda Masjid yang Bersangkutan:
                        </label>
                        <select
                          value={uploadAgendaId}
                          onChange={(e) => setUploadAgendaId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#003B73]"
                        >
                          <option value="">-- Pilih Agenda --</option>
                          {agendas.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.title} ({ag.date})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-stone-500 leading-snug">
                          Pop-up akan otomatis berhenti tayang pada pukul 23:59 WIB di hari agenda tersebut selesai.
                        </p>
                      </div>
                    )}

                    {uploadDurationType === "CUSTOM" && (
                      <div className="space-y-3 pt-1 animate-fade-in">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Opsi A: Masukkan Durasi (Berapa Hari):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              placeholder="Misal: 1, 2, 5, 10"
                              onChange={(e) => {
                                const days = parseInt(e.target.value, 10);
                                if (!isNaN(days) && days > 0) {
                                  const targetDate = new Date(Date.now() + days * 86400000);
                                  setUploadCustomDate(toDatetimeLocal(targetDate.toISOString()));
                                }
                              }}
                              className="w-36 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#003B73]"
                            />
                            <span className="text-xs text-stone-600 font-medium">Hari dari sekarang</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                            Opsi B: Atau Tentukan Tanggal &amp; Jam Berakhir:
                          </label>
                          <input
                            type="datetime-local"
                            value={uploadCustomDate}
                            onChange={(e) => setUploadCustomDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-mono focus:ring-2 focus:ring-[#003B73]"
                          />
                        </div>
                        <p className="text-[10px] text-stone-500 leading-snug">
                          Pop-up akan otomatis ditutup dan berhenti tayang di beranda saat batas waktu tersebut tiba.
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="relative border-2 border-dashed border-stone-300 hover:border-[#003B73] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-stone-50/60 hover:bg-stone-50 group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003B73] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Plus className="w-6 h-6 text-[#003B73]" />
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      {uploadingPopup ? "Mengunggah Gambar Pop-up..." : "Pilih Berkas Poster / Banner"}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1 max-w-xs">
                      Format JPG, PNG, atau WEBP (Maksimal 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handlePopupUpload}
                      disabled={uploadingPopup}
                      className="sr-only"
                    />
                  </label>

                  {uploadingPopup && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                      <span>Sedang mengunggah gambar poster pop-up ke server...</span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-1">
                    <span className="font-bold block">Ketentuan Pop-up:</span>
                    <p className="text-[11px] text-stone-600">
                      Jika admin tidak mengunggah gambar pop-up, menonaktifkannya, atau durasinya telah habis (kedaluwarsa), maka pop-up pengumuman otomatis tidak muncul di halaman beranda publik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Active Banners Preview, Expiration Status & Settings */}
              <div className="lg:col-span-7 space-y-6">
                {popupBanners.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-[#003B73] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#003B73] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                        {popupBanners.length}
                      </span>
                      <div>
                        <span className="font-bold block">Total {popupBanners.length} Poster Pop-up Terpasang</span>
                        <span className="text-[11px] text-stone-600 block mt-0.5">
                          Semua poster aktif akan bergantian tayang dalam format slider otomatis di beranda. Pengunjung website dapat menggeser (carousel) menggunakan tombol panah.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {popupBanners.length > 0 ? (
                  popupBanners.map((item, idx) => {
                    const remaining = getPopupRemainingTime(item);
                    const isExpired = isPopupExpired(item);

                    return (
                      <div
                        key={item.id}
                        className={`p-6 rounded-3xl bg-white border shadow-sm space-y-5 transition-all ${
                          isExpired ? "border-rose-200 bg-rose-50/10" : "border-stone-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#003B73] text-white flex items-center justify-center text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-stone-900 font-serif">
                                Poster #{idx + 1}{" "}
                                <span className="text-xs font-normal text-stone-500">
                                  {idx === 0
                                    ? "(Slide Pertama - Tampil Pertama di Slider)"
                                    : `(Slide #${idx + 1} - Dapat Digeser Pengunjung)`}
                                </span>
                              </h3>
                              <p className="text-[11px] text-stone-400">
                                Diperbarui pada {new Date(item.updatedAt).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                            {/* Tombol Geser Urutan (Naik / Turun) */}
                            {popupBanners.length > 1 && (
                              <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleReorderPopup(idx, idx - 1)}
                                  className="p-1 rounded text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                                  title="Geser ke Atas (Tampil lebih dulu)"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === popupBanners.length - 1}
                                  onClick={() => handleReorderPopup(idx, idx + 1)}
                                  className="p-1 rounded text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                                  title="Geser ke Bawah (Tampil setelahnya)"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* Tombol Ganti Poster */}
                            <label
                              className="px-2.5 py-1.5 rounded-full border border-stone-300 hover:bg-stone-50 text-stone-700 text-[11px] font-semibold cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                              title="Ganti berkas gambar poster ini"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#003B73]" />
                              <span>Ganti Gambar</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={(e) => handlePopupUpload(e, item.id)}
                                disabled={uploadingPopup}
                                className="sr-only"
                              />
                            </label>

                            {isExpired ? (
                              <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shadow-xs">
                                <Hourglass className="w-3.5 h-3.5 text-rose-600" />
                                <span>Kedaluwarsa (Selesai Otomatis)</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTogglePopupActive(item.id)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                  item.isActive
                                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                    : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isActive ? "bg-emerald-600 animate-pulse" : "bg-stone-400"
                                  }`}
                                />
                                <span>{item.isActive ? "Tayang di Beranda" : "Dinonaktifkan"}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePopup(item.id)}
                              className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                              title="Hapus poster ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Banner Image Preview Container */}
                        <div className="relative rounded-2xl overflow-hidden bg-stone-900/10 border border-stone-200 shadow-inner flex items-center justify-center p-4">
                          <div className="relative inline-block rounded-2xl overflow-hidden shadow-xl bg-white border border-stone-200">
                            <span className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/95 text-stone-900 border border-stone-800 flex items-center justify-center text-xs font-bold shadow-xs rounded-sm">
                              &times;
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={`Poster Pop-up #${idx + 1}`}
                              className="block w-auto h-auto max-h-72 object-contain"
                            />
                          </div>
                        </div>

                        {/* Alert jika sudah kedaluwarsa */}
                        {isExpired && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                Masa tayang pop-up ini telah habis pada <strong>{formatIndoDateTime(item.expiresAt)}</strong>. Pop-up otomatis tidak tampil di beranda.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQuickExtend(item.id, 1)}
                              className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap shadow-xs cursor-pointer flex items-center justify-center gap-1 self-start sm:self-auto"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Perpanjang +1 Hari</span>
                            </button>
                          </div>
                        )}

                        {/* Box Informasi Masa Tayang & Countdown */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                            <span className="font-bold text-stone-800 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#003B73]" />
                              Status Masa Tayang:
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${
                                isExpired
                                  ? "bg-rose-100 text-rose-800"
                                  : remaining.isUnlimited
                                  ? "bg-stone-200 text-stone-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {remaining.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                            <div>
                              <span className="text-stone-400 block">Waktu Mulai Tayang:</span>
                              <span className="font-semibold text-stone-800">
                                {formatIndoDateTime(item.startDate || item.updatedAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-400 block">Waktu Berakhir (Selesai):</span>
                              <span className="font-semibold text-stone-800">
                                {item.expiresAt ? formatIndoDateTime(item.expiresAt) : "Tanpa batas waktu (selamanya)"}
                              </span>
                            </div>
                          </div>

                          {item.linkedAgendaTitle && (
                            <div className="text-[11px] text-[#003B73] bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
                              <strong>Terkait Agenda:</strong> {item.linkedAgendaTitle}
                            </div>
                          )}
                        </div>

                        {/* Form Pengaturan Durasi & Tautan */}
                        <form
                          key={`popup-form-${item.id}-${item.targetUrl || "none"}-${item.expiresAt || "none"}`}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const urlInput = form.elements.namedItem(`url-${item.id}`) as HTMLInputElement;
                            const expiresInput = form.elements.namedItem(`expires-${item.id}`) as HTMLInputElement;
                            const agendaSelect = form.elements.namedItem(`agenda-${item.id}`) as HTMLSelectElement;

                            let newExpiresAt: string | null = item.expiresAt || null;
                            let newAgendaId: string | undefined = item.linkedAgendaId;
                            let newAgendaTitle: string | undefined = item.linkedAgendaTitle;

                            if (agendaSelect && agendaSelect.value) {
                              const config = calculateExpiresAt("AGENDA", undefined, agendaSelect.value);
                              newExpiresAt = config.expiresAt;
                              newAgendaId = config.linkedAgendaId;
                              newAgendaTitle = config.linkedAgendaTitle;
                            } else if (expiresInput && expiresInput.value) {
                              const parsed = new Date(expiresInput.value);
                              if (!isNaN(parsed.getTime())) {
                                newExpiresAt = parsed.toISOString();
                                newAgendaId = undefined;
                                newAgendaTitle = undefined;
                              }
                            }

                            handleSavePopupSettings(e, item.id, {
                              targetUrl: urlInput?.value || "",
                              expiresAt: newExpiresAt,
                              linkedAgendaId: newAgendaId,
                              linkedAgendaTitle: newAgendaTitle,
                              isActive: true, // auto-reactivate if admin saves
                            });
                          }}
                          className="space-y-4 pt-2 border-t border-stone-100"
                        >
                          {/* Pilihan Cepat Durasi / Perpanjang */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                              Pilihan Cepat Ubah / Perpanjang Durasi Tayang:
                            </label>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickExtend(item.id, 1)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                                title="Perpanjang 1 hari lagi"
                              >
                                +1 Hari
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickExtend(item.id, 3)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                                title="Perpanjang 3 hari lagi"
                              >
                                +3 Hari
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickExtend(item.id, 7)}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                                title="Perpanjang 7 hari (1 pekan) lagi"
                              >
                                +7 Hari
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickSetDuration(item.id, "UNLIMITED")}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                                title="Jadikan tayang tanpa batas waktu"
                              >
                                Set Tanpa Batas
                              </button>
                              <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                                <input
                                  type="number"
                                  min="1"
                                  max="365"
                                  id={`custom-extend-${item.id}`}
                                  placeholder="Hari..."
                                  className="w-16 px-2 py-1 rounded-lg bg-white border border-stone-300 text-[11px] text-stone-900 focus:ring-1 focus:ring-[#003B73]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`custom-extend-${item.id}`) as HTMLInputElement;
                                    const days = parseInt(input?.value, 10);
                                    if (!isNaN(days) && days > 0) {
                                      handleQuickExtend(item.id, days);
                                      if (input) input.value = "";
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#003B73] hover:bg-[#002855] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                                  title="Tambah durasi kustom hari"
                                >
                                  + Tambah Hari
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Sesuaikan Agenda & Custom Date */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Sesuaikan Selesai Agenda:
                              </label>
                              <select
                                name={`agenda-${item.id}`}
                                defaultValue={item.linkedAgendaId || ""}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleQuickSetDuration(item.id, "AGENDA", undefined, e.target.value);
                                  }
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-[#003B73]"
                              >
                                <option value="">-- Tidak Terkait Agenda --</option>
                                {agendas.map((ag) => (
                                  <option key={ag.id} value={ag.id}>
                                    {ag.title} ({ag.date})
                                  </option>
                                ))}
                              </select>
                              <span className="text-[10px] text-stone-400 mt-0.5 block">
                                Selesai jam 23:59 WIB pada hari agenda.
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-stone-700 mb-1">
                                Kustom Tanggal &amp; Jam Berakhir:
                              </label>
                              <input
                                type="datetime-local"
                                name={`expires-${item.id}`}
                                defaultValue={toDatetimeLocal(item.expiresAt)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 font-mono focus:ring-2 focus:ring-[#003B73]"
                              />
                              <span className="text-[10px] text-stone-400 mt-0.5 block">
                                Kosongkan jika ingin tanpa batas.
                              </span>
                            </div>
                          </div>

                          {/* URL Tujuan */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <label className="block text-xs font-semibold text-stone-700">
                                Tautan / URL Tujuan Pop-up #{idx + 1}{" "}
                                <span className="text-stone-400 font-normal">(Opsional / Tidak Wajib)</span>
                              </label>
                              {item.targetUrl ? (
                                <span
                                  className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-[200px]"
                                  title={item.targetUrl}
                                >
                                  Link: {item.targetUrl}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                                  Tanpa Link (Hanya Gambar)
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              name={`url-${item.id}`}
                              defaultValue={item.targetUrl || ""}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono focus:ring-2 focus:ring-[#003B73]"
                              placeholder="Biarkan kosong jika hanya gambar poster (tidak mengarah ke web)"
                            />
                            <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                              Biarkan kosong agar pop-up hanya berupa poster. Jika ingin mengarahkan link luar: <span className="font-mono text-stone-700">https://wa.me/...</span> atau link lainnya.
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              {(popupSaveSuccess || savedPopupId === item.id) && (
                                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Pengaturan tersimpan!</span>
                                </span>
                              )}
                              {item.targetUrl && (
                                <button
                                  type="button"
                                  disabled={savingPopup}
                                  onClick={(e) => handleSavePopupSettings(e, item.id, { targetUrl: "" })}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer"
                                  title="Hapus tautan dari pop-up ini agar murni hanya gambar"
                                >
                                  Kosongkan Tautan
                                </button>
                              )}
                            </div>
                            <div className="ml-auto">
                              <button
                                type="submit"
                                disabled={savingPopup}
                                className="px-5 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                              >
                                {savingPopup ? "Menyimpan..." : "Simpan Pengaturan Pop-up"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
                    <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-stone-800 font-serif">
                      Belum Ada Pop-up Banner yang Aktif
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      Saat ini tidak ada banner pop-up pengumuman yang tampil pada beranda website. Silakan unggah gambar poster baru melalui form di sebelah kiri.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: DOCUMENTS */}
        {activeTab === "DOCUMENTS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                    Pusat Unduhan &amp; Pustaka Dokumen
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kelola berkas PDF resmi, HPT, PHIWM, Fatwa Tarjih, Risalah Islam Berkemajuan, Panduan Masjid, dan literatur dakwah lainnya.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                <Link
                  href="/layanan/unduhan"
                  target="_blank"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Halaman Publik</span>
                </Link>
                <button
                  type="button"
                  onClick={handleOpenNewDocModal}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Dokumen Baru</span>
                </button>
              </div>
            </div>

            {/* Lock / Unlock Control Card */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                documentsLocked
                  ? "bg-amber-50/80 border-amber-300"
                  : "bg-emerald-50/80 border-emerald-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      documentsLocked
                        ? "bg-amber-200 text-amber-900 border border-amber-300"
                        : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {documentsLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 text-xs sm:text-sm">
                        Status Akses Publik Halaman Unduhan (/layanan/unduhan)
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          documentsLocked
                            ? "bg-amber-200 text-amber-900 border border-amber-300"
                            : "bg-emerald-200 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {documentsLocked ? "TERKUNCI SEMENTARA" : "TERBUKA UNTUK UMUM"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      {documentsLocked
                        ? "Halaman publik saat ini dikunci. Pengunjung umum tidak bisa mengakses atau mengunduh data dummy, melainkan akan melihat pesan bahwa dokumen resmi sedang disiapkan oleh takmir."
                        : "Halaman publik saat ini terbuka. Seluruh jamaah dan pengunjung dapat melihat daftar dokumen dan mengunduh berkas PDF resmi."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDocumentsLock}
                  disabled={togglingDocLock}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
                    documentsLocked
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                >
                  {togglingDocLock ? (
                    <span>Memproses...</span>
                  ) : documentsLocked ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-200" />
                      <span>Buka Kunci Akses Publik</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-200" />
                      <span>Kunci Akses Publik</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document list table & mobile cards */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">
                    Daftar Dokumen Digital ({documents.length})
                  </h4>
                  <p className="text-xs text-stone-500">
                    Dokumen ini dapat diunduh langsung oleh jamaah, mahasiswa, dan masyarakat umum di menu Layanan.
                  </p>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-10 sm:p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 font-serif">Belum Ada Dokumen</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Belum ada berkas PDF pustaka yang terdaftar. Silakan klik tombol &quot;Tambah Dokumen Baru&quot; untuk menambahkan dokumen pertama.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card List for Smartphones */}
                  <div className="block md:hidden divide-y divide-stone-100">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4 space-y-3 bg-white hover:bg-stone-50/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                              {doc.categoryLabel || doc.category}
                            </span>
                            <h5 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug">
                              {doc.title}
                            </h5>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {doc.description}
                            </p>
                            <p className="text-[11px] text-stone-600 font-medium mt-1">
                              Penulis: {doc.author} {doc.publishedYear ? `(${doc.publishedYear})` : ""}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono mt-1">
                              <span>Ukuran: {doc.fileSize || "PDF"}</span>
                              <span className="text-emerald-700 font-bold">{doc.downloadCount || 0}x diunduh</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on mobile */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                            title="Buka Berkas PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEditDocModal(doc)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B73] text-xs font-semibold transition-colors"
                            title="Edit Data Dokumen"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-600">
                      <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3.5 px-4">Dokumen</th>
                          <th className="py-3.5 px-4">Kategori</th>
                          <th className="py-3.5 px-4">Penerbit / Penulis</th>
                          <th className="py-3.5 px-4 text-center">Ukuran / Format</th>
                          <th className="py-3.5 px-4 text-center">Total Unduhan</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-3 max-w-md">
                                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-stone-900 text-sm leading-snug">
                                    {doc.title}
                                  </p>
                                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                    {doc.description}
                                  </p>
                                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                                    Berkas: {doc.fileName || doc.fileUrl}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {doc.categoryLabel || doc.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-stone-800">{doc.author}</p>
                              {doc.publishedYear && (
                                <p className="text-[11px] text-stone-400 font-sans">Tahun: {doc.publishedYear}</p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span className="font-bold text-stone-800">{doc.fileSize || "1.9 MB"}</span>
                              <span className="text-stone-400 ml-1">({doc.fileFormat || "PDF"})</span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap font-bold text-emerald-700">
                              {doc.downloadCount || 0}x
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                  title="Buka Berkas PDF"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditDocModal(doc)}
                                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003B73] transition-colors"
                                  title="Edit Data Dokumen"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                  className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Hapus Dokumen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 8: BERITA_MASJID */}
        {activeTab === "BERITA_MASJID" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#003B73] flex items-center justify-center">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">
                    Warta &amp; Berita Masjid
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kelola warta internal, silaturahmi, dan liputan kegiatan resmi masjid. Berita ini otomatis tampil di urutan nomor pertama pada slider Beranda sebelum warta UMS.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
                <Link
                  href="/#berita"
                  target="_blank"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat di Beranda</span>
                </Link>
                <button
                  type="button"
                  onClick={handleOpenAddNews}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md shadow-[#003B73]/20 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Warta Baru</span>
                </button>
              </div>
            </div>

            {/* News Cards / List */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">
                    Daftar Warta Masjid ({manualNewsList.length})
                  </h4>
                  <p className="text-xs text-stone-500">
                    Warta yang aktif bertanda Tayang dan langsung dapat dibaca oleh jamaah.
                  </p>
                </div>
                {loadingNews && (
                  <span className="text-xs text-stone-400">Memuat warta...</span>
                )}
              </div>

              {manualNewsList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-stone-800 font-serif">
                    Belum Ada Warta Masjid
                  </h5>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Klik tombol &ldquo;Tambah Warta Baru&rdquo; di atas untuk mempublikasikan warta atau liputan kegiatan masjid pertama Anda.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {manualNewsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 sm:p-6 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Thumbnail Image */}
                        <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <Image
                            src={item.imageUrl || "/images/news/silaturahmi-bph-1.jpg"}
                            alt={item.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* News Info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${item.badgeClass || "bg-[#003B73] text-white"}`}>
                              {item.badge || "WARTA MASJID"}
                            </span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.isPublished !== false
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-stone-100 text-stone-500 border border-stone-200"
                              }`}
                            >
                              {item.isPublished !== false ? "Tayang di Beranda" : "Draf (Sembunyi)"}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-stone-900 leading-snug line-clamp-2 font-sans">
                            {item.title}
                          </h4>

                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-stone-100 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleTogglePublishNews(item)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer active:scale-95 ${
                            item.isPublished !== false
                              ? "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                              : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                          }`}
                          title={item.isPublished !== false ? "Sembunyikan dari beranda" : "Tayangkan ke beranda"}
                        >
                          {item.isPublished !== false ? "Sembunyikan" : "Tayangkan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditNews(item)}
                          className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003B73] transition-colors cursor-pointer active:scale-95"
                          title="Edit warta"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(item.id, item.title)}
                          className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer active:scale-95"
                          title="Hapus warta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Responding to Feedback */}
      {respondingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setRespondingFeedback(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif pr-8">
              Tanggapan Resmi Takmir Masjid
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Respon ini akan disimpan dan dapat ditampilkan pada daftar transparansi aspirasi jamaah.
            </p>

            {/* Original Feedback Quote */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 mb-4 text-xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="font-bold text-stone-800">{respondingFeedback.targetMosque}</span>
                <span>{respondingFeedback.name}</span>
              </div>
              <p className="text-stone-700 italic">&ldquo;{respondingFeedback.message}&rdquo;</p>
            </div>

            <form onSubmit={handleSaveFeedbackResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Status Penanganan
                </label>
                <select
                  value={adminResponseStatus}
                  onChange={(e) => setAdminResponseStatus(e.target.value as FeedbackStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                >
                  <option value="DITINDAKLANJUTI">Telah Ditindaklanjuti (Selesai)</option>
                  <option value="DITINJAU">Sedang Ditinjau / Dalam Proses Pembahasan</option>
                  <option value="BARU">Tetap Status Masukan Baru</option>
                  <option value="DIARSIPKAN">Arsipkan Masukan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Pesan Tanggapan Resmi Takmir
                </label>
                <textarea
                  rows={4}
                  required
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Tuliskan apresiasi, penjelasan takmir, atau langkah konkret yang telah/akan dilakukan (contoh: Jazakallahu khair, takmir telah berkoordinasi dengan bagian sarpras untuk perbaikan kran tersebut per tanggal 16 Oktober 2026)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRespondingFeedback(null)}
                  className="px-5 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingFeedbackResponse}
                  className="px-6 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {savingFeedbackResponse ? "Menyimpan..." : "Kirim & Simpan Tanggapan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add New Agenda */}
      {isNewAgendaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setIsNewAgendaOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-stone-900 mb-1 font-serif pr-8">Tambah Agenda Masjid Baru</h3>
            <p className="text-xs text-stone-500 mb-4">Lengkapi informasi kegiatan dan jadwal kajian masjid</p>
            <form onSubmit={handleCreateAgenda} className="space-y-4">
              
              {/* Media Upload for Agenda Thumbnail */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Thumbnail Gambar Agenda (Upload dari Media)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                    <Image
                      src={newAgenda.bannerUrl || "/uploads/agendas/agenda-jumat.jpg"}
                      alt="Pratinjau Thumbnail"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-block px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold transition-colors">
                      {uploadingAgendaThumbnail ? "Mengunggah..." : "Pilih Berkas Media"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAgendaThumbnailUpload}
                        disabled={uploadingAgendaThumbnail}
                      />
                    </label>
                    <p className="text-[10px] text-stone-400">Pilih berkas JPG, PNG, atau WEBP dari perangkat</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  value={newAgenda.title}
                  onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Model Pendaftaran &amp; Kehadiran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewAgenda({ ...newAgenda, requiresRegistration: false })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !newAgenda.requiresRegistration
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-stone-900">Wajib Hadir / Langsung</span>
                      {!newAgenda.requiresRegistration && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      Tanpa tombol daftar online. Cocok untuk kajian wajib mahasiswa/umum yang hadir langsung di masjid.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAgenda({ ...newAgenda, requiresRegistration: true })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newAgenda.requiresRegistration
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-stone-900">Pendaftaran Online Mandiri</span>
                      {newAgenda.requiresRegistration && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      Menampilkan tombol pendaftaran online mandiri dan penghitung kuota peserta di halaman web.
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newAgenda.category}
                    onChange={(e) => setNewAgenda({ ...newAgenda, category: e.target.value as Agenda["category"] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  >
                    <option value="SHALAT_JUMAT">Shalat Jumat</option>
                    <option value="KAJIAN_MAHASISWA">Kajian Mahasiswa</option>
                    <option value="TABLIGH_AKBAR">Tabligh Akbar</option>
                    <option value="TAHSIN">Tahsin Al-Qur&apos;an</option>
                    <option value="SOSIAL">Sosial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {newAgenda.requiresRegistration ? "Kapasitas Kuota Pendaftar" : "Estimasi Kapasitas Jamaah"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Contoh: 1000"
                    value={newAgenda.quota === 0 ? "" : newAgenda.quota}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value);
                      setNewAgenda({ ...newAgenda, quota: val });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {newAgenda.requiresRegistration
                      ? "Batas maksimal peserta yang dapat mendaftar tiket online."
                      : "Kapasitas ruangan masjid untuk presensi langsung."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Fakultas / Peserta Terjadwal (Opsional)
                </label>
                <input
                  type="text"
                  value={newAgenda.targetAudience}
                  onChange={(e) => setNewAgenda({ ...newAgenda, targetAudience: e.target.value })}
                  placeholder="Contoh: Fakultas Terjadwal: FIK, FK, FKG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  Cantumkan fakultas atau kelompok mahasiswa yang diwajibkan / dijadwalkan hadir.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    "Fakultas Terjadwal: FIK, FK, FKG",
                    "Fakultas Terjadwal: FHIP, FKI, FPSI",
                    "Fakultas Terjadwal: FT, FEB, FAI",
                    "Fakultas Terjadwal: FKIP, FF, Geografi",
                    "Terbuka untuk Seluruh Mahasiswa UMS",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewAgenda({ ...newAgenda, targetAudience: preset })}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Pemateri</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.speaker}
                    onChange={(e) => setNewAgenda({ ...newAgenda, speaker: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Jabatan / Lembaga</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.speakerRole}
                    onChange={(e) => setNewAgenda({ ...newAgenda, speakerRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newAgenda.date}
                    onChange={(e) => setNewAgenda({ ...newAgenda, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    required
                    value={newAgenda.time}
                    onChange={(e) => setNewAgenda({ ...newAgenda, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Ruang</label>
                <input
                  type="text"
                  required
                  value={newAgenda.location}
                  onChange={(e) => setNewAgenda({ ...newAgenda, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  required
                  value={newAgenda.description}
                  onChange={(e) => setNewAgenda({ ...newAgenda, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAgendaOpen(false)}
                  className="px-5 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAgenda || uploadingAgendaThumbnail}
                  className="px-6 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {savingAgenda ? "Menyimpan..." : "Simpan Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Hasil & Dokumentasi Agenda */}
      {editingAgendaDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-7 my-auto overflow-y-auto max-h-[90vh] space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                  Hasil &amp; Dokumentasi Agenda
                </h3>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                  {editingAgendaDoc.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAgendaDoc(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgendaDoc} className="space-y-4">
              {/* Status Selesai / Terlaksana */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-bold text-stone-900">
                    Status Pelaksanaan Acara
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Tandai apakah kegiatan ini telah selesai dilaksanakan di masjid.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocIsCompleted(!docIsCompleted)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                    docIsCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{docIsCompleted ? "Selesai Terlaksana" : "Belum Selesai"}</span>
                </button>
              </div>

              {/* Jumlah Peserta / Jamaah Hadir */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jumlah Peserta / Jamaah Hadir (Aktual)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 875"
                    value={docAttendees}
                    onChange={(e) => setDocAttendees(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-[#003B73]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                    Jamaah / Mahasiswa
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Masukkan total peserta atau jamaah yang hadir di masjid saat acara berlangsung.
                </p>
              </div>

              {/* Ringkasan / Resume Hasil Acara */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ringkasan / Resume Hasil Acara
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan pelaksanaan, antusiasme jamaah, atau ringkasan kajian..."
                  value={docSummary}
                  onChange={(e) => setDocSummary(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              {/* Foto-foto Dokumentasi Kegiatan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    Foto-foto Dokumentasi Kegiatan ({docPhotos.length})
                  </label>
                  <label className="cursor-pointer px-3 py-1 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{uploadingDocPhoto ? "Mengunggah..." : "+ Unggah Foto"}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleUploadDocPhoto}
                      disabled={uploadingDocPhoto}
                    />
                  </label>
                </div>

                {/* Alternatif Tambah URL Foto */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="Atau tempel link / URL foto online (https://...)..."
                    value={docPhotoUrlInput}
                    onChange={(e) => setDocPhotoUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (docPhotoUrlInput.trim()) {
                          setDocPhotos((prev) => [...prev, docPhotoUrlInput.trim()]);
                          setDocPhotoUrlInput("");
                        }
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (docPhotoUrlInput.trim()) {
                        setDocPhotos((prev) => [...prev, docPhotoUrlInput.trim()]);
                        setDocPhotoUrlInput("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    + Tambah URL
                  </button>
                </div>

                {docPhotos.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center text-xs text-stone-400">
                    Belum ada foto dokumentasi. Klik &quot;+ Tambah Foto&quot; di atas untuk mengunggah dokumentasi kegiatan.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    {docPhotos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative h-20 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={normalizeImageUrl(photo)} alt={`Dokumentasi ${pIdx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveDocPhoto(pIdx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Hapus foto ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingAgendaDoc(null)}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingAgendaDoc || uploadingDocPhoto}
                  className="px-5 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingAgendaDoc ? "Menyimpan..." : "Simpan Hasil Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dokumen (Tambah / Edit) */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-y-auto max-h-[90vh]">
            <button
              type="button"
              onClick={() => setIsDocModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              title="Tutup Modal"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-stone-900 mb-1 font-serif pr-8">
              {editingDocId ? "Edit Dokumen & Risalah" : "Tambah Dokumen / Risalah Baru"}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Kelola berkas publikasi PDF, fatwa, dan panduan resmi yang dapat diunduh oleh jamaah.
            </p>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Judul Dokumen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Himpunan Putusan Tarjih (HPT)"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Kategori Dokumen *
                  </label>
                  <select
                    value={docForm.category}
                    onChange={(e) => {
                      const val = e.target.value as DocumentCategory;
                      const cat = DOCUMENT_CATEGORIES.find((c) => c.value === val);
                      setDocForm({
                        ...docForm,
                        category: val,
                        categoryLabel: cat?.label || "Lainnya",
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Tahun Terbit / Edisi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024"
                    value={docForm.publishedYear || ""}
                    onChange={(e) => setDocForm({ ...docForm, publishedYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Penulis / Penerbit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Majelis Tarjih dan Tajdid PP Muhammadiyah"
                  value={docForm.author}
                  onChange={(e) => setDocForm({ ...docForm, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Deskripsi / Ringkasan Dokumen *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan secara singkat isi dan kegunaan dokumen ini bagi jamaah..."
                  value={docForm.description}
                  onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Berkas Dokumen PDF *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleDocFileUpload}
                    disabled={uploadingDocFile}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                  />
                  {uploadingDocFile && (
                    <p className="text-xs text-blue-600 font-semibold animate-pulse">
                      Mengunggah berkas PDF ke server...
                    </p>
                  )}
                  {docForm.fileUrl ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="font-semibold text-stone-800 truncate">
                          {docForm.fileName || docForm.fileUrl}
                        </span>
                        <span className="text-stone-400 text-[11px] shrink-0">
                          ({docForm.fileSize || "PDF"})
                        </span>
                      </div>
                      <a
                        href={docForm.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#003B73] hover:underline shrink-0 text-xs font-semibold ml-2 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Silakan unggah berkas PDF baru atau isi URL berkas jika sudah tersedia di server.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingDoc || uploadingDocFile}
                  className="px-6 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingDoc ? "Menyimpan..." : editingDocId ? "Simpan Perubahan" : "Tambahkan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Manual News */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 sm:p-8 my-auto overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  {editingNewsId ? "Edit Warta Masjid" : "Tambah Warta Masjid Baru"}
                </h3>
                <p className="text-xs text-stone-500">
                  Warta akan langsung tampil sebagai nomor pertama pada kartu berita beranda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Judul Warta / Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Contoh: Silaturrahmi Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais dengan BPH UMS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Label Kategori / Badge
                  </label>
                  <select
                    value={newsForm.badge}
                    onChange={(e) => {
                      const badge = e.target.value;
                      let badgeClass = "bg-[#003B73] text-white";
                      if (badge === "SILATURAHMI") badgeClass = "bg-[#1E5F3B] text-white";
                      if (badge === "PENGUMUMAN") badgeClass = "bg-amber-600 text-white";
                      if (badge === "DAKWAH") badgeClass = "bg-purple-700 text-white";
                      setNewsForm({ ...newsForm, badge, badgeClass });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  >
                    <option value="WARTA MASJID">WARTA MASJID</option>
                    <option value="SILATURAHMI">SILATURAHMI</option>
                    <option value="PENGUMUMAN">PENGUMUMAN</option>
                    <option value="DAKWAH">DAKWAH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="datetime-local"
                    value={newsForm.publishedAt}
                    onChange={(e) => setNewsForm({ ...newsForm, publishedAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  />
                </div>
              </div>

              {/* Foto Dokumentasi / Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Foto Dokumentasi Warta
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                    <Image
                      src={newsForm.imageUrl || "/images/news/silaturahmi-bph-1.jpg"}
                      alt="Pratinjau Foto"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                      <Camera className="w-4 h-4 text-[#003B73]" />
                      <span>{uploadingNewsImage ? "Mengunggah..." : "Pilih Berkas Foto Baru"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingNewsImage}
                        onChange={handleNewsImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Format JPG, PNG, atau WebP. Gambar dikompresi otomatis untuk efisiensi loading.
                    </p>
                    <input
                      type="text"
                      value={newsForm.imageUrl}
                      onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      placeholder="Atau tempel URL gambar (/images/news/...)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ringkasan Singkat (Muncul di Kartu Beranda) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu berita di beranda..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs leading-relaxed focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Isi Lengkap Warta (Pisahkan paragraf dengan baris baru / Enter)
                </label>
                <textarea
                  rows={5}
                  value={newsForm.contentRaw}
                  onChange={(e) => setNewsForm({ ...newsForm, contentRaw: e.target.value })}
                  placeholder="Tuliskan isi berita lengkap di sini. Tiap paragraf dipisahkan dengan menekan Enter dua kali..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs leading-relaxed focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              {/* External Source Link (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Penerbit / Domain
                  </label>
                  <input
                    type="text"
                    value={newsForm.sourceDomain}
                    onChange={(e) => setNewsForm({ ...newsForm, sourceDomain: e.target.value })}
                    placeholder="masjid.ums.ac.id"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tautan Luar / Berita Asli (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newsForm.sourceUrl}
                    onChange={(e) => setNewsForm({ ...newsForm, sourceUrl: e.target.value })}
                    placeholder="Kosongkan jika warta internal masjid"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:ring-2 focus:ring-[#003B73]"
                  />
                </div>
              </div>

              {/* Status Publish Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newsIsPublished"
                  checked={newsForm.isPublished}
                  onChange={(e) => setNewsForm({ ...newsForm, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-[#003B73] focus:ring-[#003B73] border-stone-300"
                />
                <label htmlFor="newsIsPublished" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Langsung tayangkan warta ini di halaman beranda (urutan pertama sebelum warta UMS)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNews || uploadingNewsImage}
                  className="px-6 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingNews ? "Menyimpan..." : editingNewsId ? "Perbarui Warta" : "Terbitkan Warta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Panduan Koneksi Firebase Cloud Firestore */}
      {showFirebaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-stone-200 relative my-auto">
            <button
              onClick={() => setShowFirebaseModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  Aktivasi Firebase Cloud Firestore
                </h3>
                <p className="text-xs text-stone-500">
                  Sinkronisasi Data Real-time & Stabil di Seluruh Perangkat
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-stone-700 leading-relaxed max-h-[65vh] overflow-y-auto pr-2">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-800">
                <p className="font-semibold text-amber-900 mb-1">
                  Mengapa Menghubungkan ke Firebase?
                </p>
                <p>
                  Vercel Serverless bersifat stateless (kontainer berganti-ganti). Dengan mengaktifkan Firebase Firestore (100% gratis), setiap kali Anda mengubah agenda, jadwal petugas Jumat, dokumentasi, atau QRIS di admin, perubahannya langsung tersimpan di cloud Google dan seketika langsung tampil di HP seluruh jamaah tanpa menunggu sinkronisasi berkas.
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-900 text-sm mb-2">
                  Langkah-Langkah Setup (Hanya 2 Menit):
                </p>
                <ol className="list-decimal list-inside space-y-2 text-stone-600 pl-1">
                  <li>
                    Buka{" "}
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#003B73] font-semibold underline inline-flex items-center gap-1"
                    >
                      console.firebase.google.com
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>{" "}
                    dan login dengan akun Google.
                  </li>
                  <li>
                    Klik <strong>Add project</strong> (Tambahkan project), beri nama (misal: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">masjid-sudalmiyah-ums</code>), lalu ikuti panduan hingga selesai.
                  </li>
                  <li>
                    Di bilah menu kiri, pilih <strong>Build &gt; Firestore Database</strong>, lalu klik <strong>Create database</strong>. Pilih lokasi terdekat (misal <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">asia-southeast2</code> Jakarta) dan pilih <strong>Start in test mode</strong>.
                  </li>
                  <li>
                    Di halaman Project Overview (ikon gerigi Pengaturan &gt; Project settings), pada bagian <strong>Your apps</strong>, klik ikon Web (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">&lt;/&gt;</code>) untuk mendaftarkan web app.
                  </li>
                  <li>
                    Salin nilai <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">firebaseConfig</code> yang muncul ke file <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.env.local</code> atau ke menu <strong>Settings &gt; Environment Variables</strong> di dashboard Vercel.
                  </li>
                </ol>
              </div>

              <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl relative font-mono text-[11px] leading-relaxed">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
                  <span className="text-stone-400 font-sans text-xs">Variabel Lingkungan (.env)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `NEXT_PUBLIC_FIREBASE_API_KEY=\nNEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=\nNEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=\nNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=\nNEXT_PUBLIC_FIREBASE_APP_ID=`;
                      navigator.clipboard.writeText(text);
                      setCopiedEnv(true);
                      setTimeout(() => setCopiedEnv(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors text-xs font-sans cursor-pointer"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-medium">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-400" />
                        <span>Salin Format</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=masjid-sudalmiyah-ums.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=masjid-sudalmiyah-ums
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=masjid-sudalmiyah-ums.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...`}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <p className="font-semibold text-emerald-900 mb-0.5">
                  Migrasi Data Otomatis:
                </p>
                <p>
                  Sistem telah dilengkapi fungsi <em>Auto-Seeding</em>. Begitu Firebase terhubung untuk pertama kali, seluruh agenda, jadwal khatib Jumat, nomor rekening, QRIS, dan data masjid yang ada saat ini akan otomatis disalin ke Firestore tanpa perlu input manual ulang.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowFirebaseModal(false)}
                className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
