"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
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
} from "@/lib/types";

const ADMIN_MOSQUES = [
  { id: "sudalmiyah", name: "Masjid Hj. Sudalmiyah Rais", location: "Kampus 2 UMS" },
  { id: "fadhlurrahman", name: "Masjid Fadhlurrahman", location: "Kampus 1 UMS" },
  { id: "mas-mansur", name: "Masjid KH. Mas Mansur", location: "Kampus 4 UMS (Pesma)" },
  { id: "mahad-abu-bakar", name: "Masjid Ma'had Abu Bakar", location: "Kampus 2 UMS" },
  { id: "ar-razi", name: "Masjid Ar-Razi FKG", location: "Kampus 4 UMS (FKG)" },
  { id: "munajat-shabran", name: "Masjid Munajat Shabran", location: "Makamhaji (Pondok Shabran)" },
];

const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "TARJIH_FIQIH", label: "Tarjih & Fiqih" },
  { value: "IDEOLOGI", label: "Ideologi & Akhlak" },
  { value: "KEMUHAMMADIYAHAN", label: "Kemuhammadiyahan" },
  { value: "DOKUMEN_MUKTAMAR", label: "Dokumen Muktamar" },
  { value: "PANDUAN_MASJID", label: "Panduan Takmir" },
  { value: "UMUM", label: "Lainnya / Umum" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "AGENDAS" | "PETUGAS_JUMAT" | "QRIS_INFAQ" | "REGISTRATIONS" | "FEEDBACK" | "POPUP_BANNER" | "DOCUMENTS"
  >("AGENDAS");
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
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>("sudalmiyah");
  const [savingFriday, setSavingFriday] = useState(false);
  const [uploadingKhatibPhoto, setUploadingKhatibPhoto] = useState(false);
  const [fridaySaveSuccess, setFridaySaveSuccess] = useState(false);
  const activeMosqueMeta = ADMIN_MOSQUES.find((m) => m.id === selectedMosqueId) || ADMIN_MOSQUES[0];

  // QRIS Infaq state
  const [qrisSettings, setQrisSettings] = useState<QrisSettings | null>(null);
  const [savingQris, setSavingQris] = useState(false);
  const [uploadingQrisImage, setUploadingQrisImage] = useState(false);
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

  // Pop-up Banner State
  const [popupBanner, setPopupBanner] = useState<PopupBanner | null>(null);
  const [popupBanners, setPopupBanners] = useState<PopupBanner[]>([]);
  const [uploadingPopup, setUploadingPopup] = useState(false);
  const [savingPopup, setSavingPopup] = useState(false);
  const [popupTargetUrl, setPopupTargetUrl] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [popupSaveSuccess, setPopupSaveSuccess] = useState(false);
  const [savedPopupId, setSavedPopupId] = useState<string | null>(null);

  // Document Management State
  const [documents, setDocuments] = useState<DownloadDocument[]>([]);
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

  const loadData = async () => {
    try {
      const [statsRes, agendaRes, fridayRes, qrisRes, popupRes, docRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/agendas"),
        fetch("/api/friday-schedule"),
        fetch("/api/qris"),
        fetch(`/api/popup?admin=1&t=${Date.now()}`, { cache: "no-store" }),
        fetch("/api/documents"),
      ]);

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
      setRegistrations(statsJson.recentRegistrations || []);
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
                // Silently re-seed cold serverless container with active popups
                fetch("/api/popup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ popups: resolvedList }),
                }).catch(() => {});
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
        khatibPhotoUrl: "/uploads/khatib/prof-sofyan-anif.jpg",
        khutbahTheme: "",
        imamName: "",
        imamRole: `Imam ${meta?.name || "Masjid"}`,
        muadzinName: "",
        muadzinRole: `Muadzin ${meta?.name || "Masjid"}`,
        time: "11:35 WIB",
        notes: "",
        updatedAt: new Date().toISOString(),
      };
      setFridaySchedule(newSchedule);
    }
  };

  // Upload Khatib Photo from Media file
  const handleKhatibPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKhatibPhoto(true);
    try {
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
    }
  };

  // Save Friday Schedule Changes
  const handleUpdateFridaySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridaySchedule) return;
    setSavingFriday(true);
    setFridaySaveSuccess(false);
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

      setFridaySaveSuccess(true);
      setTimeout(() => setFridaySaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan jadwal.");
    } finally {
      setSavingFriday(false);
    }
  };

  // Upload QRIS Image from Media file
  const handleQrisImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingQrisImage(true);
    try {
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
    }
  };

  // Save QRIS Settings Changes
  const handleUpdateQrisSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrisSettings) return;
    setSavingQris(true);
    setQrisSaveSuccess(false);
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
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan QRIS.");
    } finally {
      setSavingQris(false);
    }
  };

  // Upload Agenda Thumbnail from Media file
  const handleAgendaThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAgendaThumbnail(true);
    try {
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
    }
  };

  // Create New Agenda
  const handleCreateAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAgenda(true);
    try {
      const res = await fetch("/api/agendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgenda),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat agenda.");
      setIsNewAgendaOpen(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSavingAgenda(false);
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
      // Never attach automatic URLs when uploading a new poster.
      // Every new poster begins with targetUrl: "" (pure display poster).

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

  // Save popup settings (optional targetUrl)
  const handleSavePopupSettings = async (
    e?: React.FormEvent,
    id?: string,
    customUrl?: string
  ) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetId = id || popupBanner?.id;
    if (!targetId) return;
    const currentItem = popupBanners.find((p) => p.id === targetId) || popupBanner;
    setSavingPopup(true);
    setPopupSaveSuccess(false);
    try {
      const urlToSave = customUrl !== undefined ? customUrl : popupTargetUrl;
      const res = await fetch("/api/popup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          targetUrl: urlToSave.trim(),
          imageUrl: currentItem?.imageUrl,
          title: currentItem?.title,
          isActive: currentItem?.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan pengaturan.");
      let updatedList: PopupBanner[] =
        Array.isArray(data.popups) && data.popups.length > 0
          ? data.popups
          : popupBanners.map((p) =>
              p.id === targetId ? { ...p, targetUrl: urlToSave.trim() } : p
            );

      // Guard: ensure targetId is never dropped
      if (!updatedList.some((p) => p.id === targetId) && currentItem) {
        updatedList = [{ ...currentItem, targetUrl: urlToSave.trim() }, ...updatedList];
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
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengaturan pop-up banner.");
    } finally {
      setSavingPopup(false);
    }
  };

  // Delete popup banner
  const handleDeletePopup = async (id?: string) => {
    if (!confirm("Hapus pop-up banner ini?")) {
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
      loadData();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan dokumen.");
    } finally {
      setSavingDoc(false);
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans pb-16">
      {/* Top Admin Header */}
      <header className="bg-[#001F3F] border-b border-stone-800 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-11 h-11 flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
              <Image
                src="/images/logo/logo-masjid-white.png"
                alt="Logo Masjid UMS"
                width={44}
                height={44}
                className="w-full h-full object-contain"
              />
            </Link>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-white font-serif">
                Dashboard Manajemen Takmir
              </h1>
              <p className="text-[11px] text-stone-300">
                Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/agenda/presensi-live"
              target="_blank"
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 px-3.5 py-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 flex items-center gap-1.5 transition-colors"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Layar Proyektor (QR Dinamis)</span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-stone-300 hover:text-white px-3.5 py-1.5 rounded-full border border-stone-600 hidden sm:block transition-colors"
            >
              Lihat Portal Publik
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold transition-colors"
            >
              Keluar
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

        {/* Tab Controls - Pure Text with Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-stone-200 no-scrollbar">
          <button
            onClick={() => setActiveTab("AGENDAS")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "AGENDAS"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Kelola Agenda & Kajian
          </button>
          <button
            onClick={() => setActiveTab("PETUGAS_JUMAT")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "PETUGAS_JUMAT"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Petugas Shalat & Khatib Pekan Ini
          </button>
          <button
            onClick={() => setActiveTab("QRIS_INFAQ")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "QRIS_INFAQ"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Kelola QRIS Infaq
          </button>
          <button
            onClick={() => setActiveTab("REGISTRATIONS")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === "REGISTRATIONS"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            Presensi Kehadiran Jamaah
          </button>
          <button
            onClick={() => setActiveTab("FEEDBACK")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "FEEDBACK"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <span>Kotak Saran & Aspirasi</span>
            {feedbackCounts.baru > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                {feedbackCounts.baru}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("POPUP_BANNER")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "POPUP_BANNER"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pop-up Banner Beranda</span>
            {popupBanner && popupBanner.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("DOCUMENTS")}
            className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "DOCUMENTS"
                ? "bg-[#003B73] text-white font-bold shadow-md shadow-[#003B73]/15"
                : "bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Pustaka &amp; Dokumen</span>
            {documents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                {documents.length}
              </span>
            )}
          </button>
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
                onClick={() => setIsNewAgendaOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
              >
                Tambah Agenda Baru
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
                        {item.requiresRegistration === false ? (
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
                        {item.requiresRegistration === false ? (
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
                    <Link
                      href={`/agenda/presensi-live?agendaId=${item.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-[#003B73] bg-[#003B73]/10 hover:bg-[#003B73]/15 border border-[#003B73]/20 transition-all active:scale-[0.98]"
                    >
                      <Tv className="w-3.5 h-3.5 text-[#003B73]" />
                      <span>Mode Proyektor QR Acara Ini</span>
                      <ExternalLink className="w-3 h-3 text-[#003B73]/70" />
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
                Pengaturan Petugas Shalat & Khatib 6 Masjid Kampus UMS
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pilih salah satu dari 6 masjid kampus di bawah ini untuk melihat dan menyesuaikan jadwal petugas jumat, nama khatib, foto, tema khutbah, imam, dan muadzin.
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
                      className={`p-3 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#003B73] text-white border-[#003B73] shadow-md shadow-[#003B73]/20 ring-2 ring-[#003B73]/20"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected ? "bg-[#D4AF37]" : "bg-stone-300"
                          }`}
                        />
                        <span className="text-xs font-bold truncate leading-snug">
                          {m.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] truncate ${
                          isSelected ? "text-white/80" : "text-stone-400"
                        }`}
                      >
                        {m.location}
                      </span>
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
                  <span className="text-[11px] text-stone-500 font-medium">
                    Lokasi: {activeMosqueMeta.location}
                  </span>
                </div>

                {/* Photo & Khatib Highlight */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Photo Preview & Upload Button */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="relative w-36 h-44 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md bg-stone-100">
                      <Image
                        src={fridaySchedule.khatibPhotoUrl || "/uploads/khatib/prof-sofyan-anif.jpg"}
                        alt="Foto Khatib"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    {/* Media Upload Input */}
                    <label className="cursor-pointer px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-semibold text-center transition-colors shadow-sm">
                      {uploadingKhatibPhoto ? "Mengunggah..." : "Ganti Foto Khatib (Media)"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleKhatibPhotoUpload}
                        disabled={uploadingKhatibPhoto}
                      />
                    </label>
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
                        required
                        value={fridaySchedule.khatibName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-medium"
                        placeholder="Contoh: Prof. Dr. Sofyan Anif, M.Si."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Jabatan / Instansi Khatib
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.khatibTitle}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khatibTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                        placeholder="Contoh: Rektor Universitas Muhammadiyah Surakarta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Tema / Judul Khutbah Jumat
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.khutbahTheme}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, khutbahTheme: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                        placeholder="Contoh: Membangun Integritas Moral di Era Digital"
                      />
                    </div>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tanggal Masehi
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.date}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: Jumat, 16 Oktober 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tanggal Hijriyah
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.hijriDate}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, hijriDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: 5 Jumadilawal 1448 H"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Waktu Pelaksanaan
                    </label>
                    <input
                      type="text"
                      required
                      value={fridaySchedule.time}
                      onChange={(e) => setFridaySchedule({ ...fridaySchedule, time: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      placeholder="Contoh: 11:35 WIB"
                    />
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
                        required
                        value={fridaySchedule.imamName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Peran / Tugas
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.imamRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, imamRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
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
                        required
                        value={fridaySchedule.muadzinName}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Peran / Tugas
                      </label>
                      <input
                        type="text"
                        required
                        value={fridaySchedule.muadzinRole}
                        onChange={(e) => setFridaySchedule({ ...fridaySchedule, muadzinRole: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs"
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
                    placeholder="Contoh: Jamaah diimbau hadir lebih awal sebelum adzan berkumandang..."
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-500">
                    Menyimpan perubahan untuk <strong>{activeMosqueMeta.name}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={savingFriday}
                    className="px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50"
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
                
                {/* QRIS Image & Upload Row */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 space-y-4">
                  <span className="text-[11px] font-bold text-[#003B73] uppercase tracking-wider block">
                    Gambar Kode QRIS Resmi Masjid
                  </span>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Live Preview Frame */}
                    <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-md shrink-0 bg-white flex items-center justify-center p-2">
                      <Image
                        src={qrisSettings.imageUrl || "/images/qris-sudalmiyah.png"}
                        alt="Pratinjau QRIS Masjid"
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                      <div className="absolute inset-x-0 bottom-0 py-1 bg-gradient-to-t from-black/80 to-transparent text-center">
                        <span className="text-[10px] text-white font-semibold">Pratinjau QRIS</span>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1">
                          Unggah Berkas Gambar QRIS Baru (Media)
                        </label>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          Pilih berkas gambar barcode QRIS langsung dari perangkat komputer atau ponsel Anda tanpa perlu mengisi tautan URL manual. Format didukung: PNG, JPG, JPEG, WEBP (maksimal 5MB).
                        </p>
                      </div>

                      <div className="pt-2">
                        <label className="inline-block px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm active:scale-95">
                          {uploadingQrisImage ? "Mengunggah Berkas..." : "Pilih Berkas QRIS (Media)"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingQrisImage}
                            onChange={handleQrisImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Lokasi Berkas Aktif:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={qrisSettings.imageUrl}
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Merchant Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Merchant QRIS
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisSettings.merchantName}
                      onChange={(e) => setQrisSettings({ ...qrisSettings, merchantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold"
                      placeholder="Contoh: LAZ UMS-MSJD SUDALMIYAH"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kode NMID Nasional
                    </label>
                    <input
                      type="text"
                      required
                      value={qrisSettings.nmid}
                      onChange={(e) => setQrisSettings({ ...qrisSettings, nmid: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono"
                      placeholder="Contoh: ID2024353816125"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Institusi / Lokasi
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
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingQris}
                    className="px-8 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/20 disabled:opacity-50"
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

        {/* Tab 3: REGISTRATIONS */}
        {activeTab === "REGISTRATIONS" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">Data Jamaah Terdaftar (Presensi E-Ticket)</h2>
                <p className="text-xs text-stone-500 mt-0.5">Daftar mahasiswa dan jamaah yang memegang tiket barcode kegiatan</p>
              </div>
              <Link
                href="/agenda/presensi-live"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka Layar Proyektor Presensi</span>
                <ExternalLink className="w-3 h-3 text-stone-300" />
              </Link>
            </div>
            <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider bg-[#FAF8F5]">
                      <th className="py-3.5 px-4 font-semibold">Foto Presensi</th>
                      <th className="py-3.5 px-4 font-semibold">Nama Jamaah</th>
                      <th className="py-3.5 px-4 font-semibold">Status Sivitas</th>
                      <th className="py-3.5 px-4 font-semibold">Agenda Kegiatan</th>
                      <th className="py-3.5 px-4 font-semibold">Waktu Presensi</th>
                      <th className="py-3.5 px-4 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                          Belum ada data presensi jamaah yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
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
        )}

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

            {/* Filter Bar: Search, Mosque Filter, Category Filter */}
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
              <div className="w-full md:w-56 shrink-0">
                <select
                  value={feedbackFilterMosque}
                  onChange={(e) => setFeedbackFilterMosque(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                >
                  <option value="ALL">Semua Masjid Kampus</option>
                  <option value="Masjid Hj. Sudalmiyah Rais (Kampus 2)">Masjid Hj. Sudalmiyah Rais</option>
                  <option value="Masjid Fadhlurrahman (Kampus 1)">Masjid Fadhlurrahman</option>
                  <option value="Masjid KH. Mas Mansur (Kampus 4)">Masjid KH. Mas Mansur</option>
                  <option value="Masjid Ma'had Abu Bakar (Kampus 2)">Masjid Ma'had Abu Bakar</option>
                  <option value="Masjid Ar-Razi FKG (Kampus 4)">Masjid Ar-Razi FKG</option>
                  <option value="Masjid Munajat Shabran (Makamhaji)">Masjid Munajat Shabran</option>
                  <option value="Semua Masjid Kampus (Saran Umum)">Saran Umum Seluruh Masjid</option>
                </select>
              </div>

              {/* Filter Kategori */}
              <div className="w-full md:w-52 shrink-0">
                <select
                  value={feedbackFilterCategory}
                  onChange={(e) => setFeedbackFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                >
                  <option value="ALL">Semua Kategori</option>
                  <option value="RIAYAH">Ri'ayah (Fasilitas/Sarpras)</option>
                  <option value="IMARAH">Imarah (Ibadah/Kajian)</option>
                  <option value="IDARAH">Idarah (Pelayanan)</option>
                  <option value="RAMAH_DIFABEL">Ramah Difabel &amp; Lansia</option>
                  <option value="ECO_MOSQUE">Eco-Mosque (Lingkungan)</option>
                  <option value="KEAMANAN">Keamanan &amp; Parkir</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
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
                    {/* Top Row: Mosque, Category, Rating & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#003B73]/10 text-[#003B73]">
                          <Building2 className="w-3.5 h-3.5 text-[#003B73]" />
                          <span>{fb.targetMosque}</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {fb.category}
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

                  <button
                    type="button"
                    onClick={() => handleDeletePopup()}
                    className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Pop-up</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Upload New Banner */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 font-serif">
                    Unggah Poster / Banner Baru
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Pilih berkas gambar poster pengumuman yang ingin ditampilkan pada pop-up beranda. Setelah diunggah, pop-up akan langsung tayang dan Anda dapat mengatur URL tujuan (opsional) di sebelah kanan.
                  </p>

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
                      Jika admin tidak mengunggah gambar pop-up atau menonaktifkannya, maka tidak ada pop-up pengumuman yang muncul di halaman beranda. Tautan URL bersifat opsional (tidak wajib).
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Active Banners Preview & Settings */}
              <div className="lg:col-span-7 space-y-6">
                {popupBanners.length > 0 ? (
                  popupBanners.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#003B73] text-white flex items-center justify-center text-xs font-bold font-mono">
                            {idx + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-stone-900 font-serif">
                              Pop-up #{idx + 1}{" "}
                              <span className="text-xs font-normal text-stone-500">
                                {idx === 0
                                  ? "(Tampil Paling Depan)"
                                  : "(Lapisan Kedua - Tampil Setelah Pop-up 1 Ditutup)"}
                              </span>
                            </h3>
                            <p className="text-[11px] text-stone-400">
                              Diperbarui pada {new Date(item.updatedAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
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

                          <button
                            type="button"
                            onClick={() => handleDeletePopup(item.id)}
                            className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Pop-up ini"
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

                      {/* Settings Form for Optional Target Link */}
                      <form
                        key={`popup-form-${item.id}-${item.targetUrl || "none"}`}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const inputEl = e.currentTarget.elements.namedItem(
                            `url-${item.id}`
                          ) as HTMLInputElement;
                          handleSavePopupSettings(e, item.id, inputEl?.value || "");
                        }}
                        className="space-y-3 pt-2 border-t border-stone-100"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <label className="block text-xs font-semibold text-stone-700">
                              Tautan / URL Tujuan Pop-up #{idx + 1}{" "}
                              <span className="text-stone-400 font-normal">(Opsional / Tidak Wajib)</span>
                            </label>
                            {item.targetUrl ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate max-w-[200px]" title={item.targetUrl}>
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
                            Biarkan kosong agar pop-up hanya berupa gambar poster tanpa link. Jika ingin mengarahkan ke link luar, isi contoh: <span className="font-mono text-stone-700">https://wa.me/...</span> atau link lainnya.
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
                                onClick={(e) => handleSavePopupSettings(e, item.id, "")}
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
                              {savingPopup ? "Menyimpan..." : "Simpan Tautan Pop-up"}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  ))
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">
                    Pusat Unduhan & Pustaka Dokumen
                  </h3>
                  <p className="text-xs text-stone-500">
                    Kelola berkas PDF resmi, HPT, PHIWM, Fatwa Tarjih, Risalah Islam Berkemajuan, Panduan Masjid, dan literatur dakwah lainnya.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/layanan/unduhan"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Lihat Halaman Publik</span>
                </Link>
                <button
                  onClick={handleOpenNewDocModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Dokumen Baru</span>
                </button>
              </div>
            </div>

            {/* Document list table */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between">
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
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 font-serif">Belum Ada Dokumen</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Belum ada berkas PDF pustaka yang terdaftar. Silakan klik tombol &quot;Tambah Dokumen Baru&quot; untuk menambahkan dokumen pertama.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                                onClick={() => handleOpenEditDocModal(doc)}
                                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003B73] transition-colors"
                                title="Edit Data Dokumen"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
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
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Responding to Feedback */}
      {respondingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-serif">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-4 font-serif">Tambah Agenda Masjid Baru</h3>
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
                    required
                    value={newAgenda.quota}
                    onChange={(e) => setNewAgenda({ ...newAgenda, quota: Number(e.target.value) })}
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

      {/* Modal Dokumen (Tambah / Edit) */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-stone-900 mb-1 font-serif">
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
    </div>
  );
}
