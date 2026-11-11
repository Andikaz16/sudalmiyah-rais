"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Award,
  BookOpen,
  Users,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  FileCheck,
  Eye,
  UserCheck,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { MosqueBankInfo } from "@/lib/types";

interface MosqueHistory {
  id: string;
  name: string;
  mapsUrl: string;
  location?: string;
  established: string;
  image: string;
  leadWord: string;
  tagline: string;
  historicalContext: string;
  keyFigures: string;
  facilities: string[];
  philosophicalMeaning: string;
}

interface DocumentSK {
  id: string;
  title: string;
  docNumber: string;
  issuer: string;
  date: string;
  fileName: string;
  category: string;
  description: string;
  structure?: {
    penasihat: { ketua: string; anggota: string[] };
    bpm: { ketua: string; anggota: string[] };
    bphm: { direktur: string; anggota: string[] };
  };
}

export default function SejarahPage() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentSK | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrisModal, setActiveQrisModal] = useState<MosqueBankInfo | null>(null);

  const [bankAccounts, setBankAccounts] = useState<Record<string, MosqueBankInfo>>({
    sudalmiyah: {
      mosqueId: "sudalmiyah",
      mosqueName: "Masjid Hj. Sudalmiyah Rais",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "6012275865",
      accountHolder: "LAZ UMS Sudalmiyah Rais",
      qrisImageUrl: "/images/qris-sudalmiyah.png",
      qrisMerchantName: "LAZ UMS-MSJD SUDALMIYAH",
      qrisNmid: "ID2024353816125",
      notes: "Infaq & Sedekah Operasional serta Kemakmuran Masjid Hj. Sudalmiyah Rais Kampus 2 UMS",
      isActive: true,
      updatedAt: "",
    },
    fadhlurrahman: {
      mosqueId: "fadhlurrahman",
      mosqueName: "Masjid Fadhlurrahman",
      bankName: "Bank Jateng Syariah",
      accountNumber: "5023001890",
      accountHolder: "Takmir Masjid Fadhlurrahman UMS",
      qrisImageUrl: "/images/qris-bank-jateng.jpg",
      qrisMerchantName: "MASJID FADHLURRAHMAN UMS",
      qrisNmid: "ID1020021189401",
      notes: "Infaq Pembangunan, Kajian, & Kemakmuran Masjid Fadhlurrahman Kampus 1 UMS",
      isActive: true,
      updatedAt: "",
    },
    "mas-mansur": {
      mosqueId: "mas-mansur",
      mosqueName: "Masjid KH. Mas Mansur",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7128904561",
      accountHolder: "PESMA KH Mas Mansur UMS",
      qrisImageUrl: "/images/qris-bank-jateng.jpg",
      qrisMerchantName: "MASJID KH MAS MANSUR PESMA",
      qrisNmid: "ID1020021189402",
      notes: "Infaq Pembinaan Santri Pesma & Kemakmuran Masjid KH. Mas Mansur Kampus 4 UMS",
      isActive: true,
      updatedAt: "",
    },
    "mahad-abu-bakar": {
      mosqueId: "mahad-abu-bakar",
      mosqueName: "Masjid Ma'had Abu Bakar",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7098451230",
      accountHolder: "Ma'had Abu Bakar Ash-Shiddiq UMS",
      qrisImageUrl: "/images/qris-bank-jateng.jpg",
      qrisMerchantName: "MAHAD ABU BAKAR UMS",
      qrisNmid: "ID1020021189403",
      notes: "Infaq Dakwah Bahasa Arab, Studi Syariah, & Operasional Masjid Ma'had Abu Bakar",
      isActive: true,
      updatedAt: "",
    },
    "munajat-shabran": {
      mosqueId: "munajat-shabran",
      mosqueName: "Masjid Al-Munajat",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7034567891",
      accountHolder: "Pondok Shabran UMS / Masjid Al-Munajat",
      qrisImageUrl: "/images/qris-bank-jateng.jpg",
      qrisMerchantName: "MASJID AL-MUNAJAT SHABRAN",
      qrisNmid: "ID1020021189404",
      notes: "Infaq Perkaderan Ulama Tarjih & Operasional Masjid Al-Munajat Pondok Shabran",
      isActive: true,
      updatedAt: "",
    },
    "ar-razi": {
      mosqueId: "ar-razi",
      mosqueName: "Masjid Ar-Razi FKG",
      bankName: "Bank Syariah Indonesia (BSI)",
      accountNumber: "7145678902",
      accountHolder: "Masjid Ar-Razi FKG UMS",
      qrisImageUrl: "/images/qris-bank-jateng.jpg",
      qrisMerchantName: "MASJID AR-RAZI FKG UMS",
      qrisNmid: "ID1020021189405",
      notes: "Infaq Integrasi Medis-Spiritualitas & Operasional Masjid Ar-Razi FKG Kampus 4 UMS",
      isActive: true,
      updatedAt: "",
    },
  });

  useEffect(() => {
    fetch(`/api/mosque-bank-accounts?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.accounts)) {
          const map: Record<string, MosqueBankInfo> = {};
          data.accounts.forEach((acc: MosqueBankInfo) => {
            map[acc.mosqueId] = acc;
          });
          setBankAccounts((prev) => ({ ...prev, ...map }));
        }
      })
      .catch((err) => console.error("Error loading mosque bank accounts:", err));
  }, []);

  const handleCopyAccount = (id: string, num: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const getVirtualBankUrl = (bank?: MosqueBankInfo) => {
    if (bank?.virtualBankUrl && bank.virtualBankUrl.trim()) {
      return bank.virtualBankUrl.trim();
    }
    const name = (bank?.bankName || "").toLowerCase();
    if (name.includes("jateng")) {
      return "https://ib.bankjateng.co.id";
    }
    if (name.includes("bsi") || name.includes("syariah indonesia")) {
      return "https://bsinet.bankbsi.co.id";
    }
    if (name.includes("muamalat")) {
      return "https://ib.muamalatbank.com";
    }
    if (name.includes("bca")) {
      return "https://klikbca.com";
    }
    return "https://bsinet.bankbsi.co.id";
  };

  const documents: DocumentSK[] = [
    {
      id: "sk-takmir-lpcr",
      title: "SK Penetapan Takmir Masjid Hj. Sudalmiyah Rais UMS Periode 2026-2031",
      docNumber: "SK LPCR-PM PP Muhammadiyah No. 198/KEP/I.15/A/2026",
      issuer: "LPCR-PM Pimpinan Pusat Muhammadiyah (Drs. H. A. Dahlan Rais, M.Hum & H. M. Jamaludin Ahmad, S.Psi)",
      date: "21 Safar 1448 H / 4 Agustus 2026 M",
      fileName: "198-Masjid Hj. Sudalmiyah Rais UMS-SK Takmir Masjid Percontohan.pdf",
      category: "Surat Keputusan Resmi LPCR-PM PP Muhammadiyah",
      description:
        "Surat Keputusan penetapan resmi susunan Dewan Penasihat, Badan Pembina Masjid (BPM), dan Badan Pelaksana Harian (Eksekutif) Masjid Hj. Sudalmiyah Rais UMS sebagai Masjid Percontohan Amal Usaha Muhammadiyah (AUM) tingkat PTMA.",
      structure: {
        penasihat: {
          ketua: "Drs. KH. Marpuji Ali, M.Si",
          anggota: [
            "Drs. H. A. Dahlan Rais, M.Hum",
            "Prof. Dr. Harun Joko Prayitno, M.Hum",
            "Prof. Ihwan Susila, S.E., M.Si., Ph.D",
            "Prof. Dr. apt. Muhammad Da'i, S.Si., M.Si",
            "Dr. Mutohharun Jinan, M.Ag",
            "Prof. Dr. dr. EM. Sutrisna, M.Kes",
            "Prof. Supriyono, S.T., M.T., Ph.D",
          ],
        },
        bpm: {
          ketua: "Dr. Muchamad Iksan, S.H., M.H",
          anggota: [
            "Dr. Bambang Sukoco, S.H., M.H",
            "Nurgiatna, S.T., M.Sc., Ph.D",
            "Dr. Mahasri Shobahiya, M.Ag",
            "Ahmad Mardalis, S.E., MBA",
            "Ridwan Nur Efendi, S.Kom",
          ],
        },
        bphm: {
          direktur: "Dodi Afianto, S.Ag., M.Pd.I",
          anggota: [
            "Cahyana Kumbul Widada, SIP",
            "Nur Muhammad Mufiid, S.T",
            "Asef Dwi Nugroho, S.I.Kom",
            "Abu Salim, S.Ak",
            "Hartono, S.Ag., M.Ag",
          ],
        },
      },
    },
    {
      id: "sk-penetapan-aum",
      title: "Penetapan Masjid Percontohan Amal Usaha Muhammadiyah (AUM) Tingkat PTMA",
      docNumber: "SK LPCR-PM PP Muhammadiyah No. 022/I.15/B/2026",
      issuer: "LPCR-PM Pimpinan Pusat Muhammadiyah",
      date: "1448 H / 2026 M",
      fileName: "sk-takmir-masjid-percontohan.pdf",
      category: "Standarisasi & Rekomendasi AUM",
      description:
        "Landasan pengukuhan Masjid Hj. Sudalmiyah Rais UMS sebagai model percontohan Amal Usaha Muhammadiyah (AUM) dalam tata kelola Idarah (manajerial modern), Imarah (kemakmuran ibadah & dakwah AIK), dan Ri'ayah (Eco-Mosque inklusif ramah difabel).",
    },
    {
      id: "pedoman-sop",
      title: "Buku Pedoman Tata Kelola & SOP Pemanfaatan Fasilitas Masjid",
      docNumber: "Pedoman Pimpinan Pusat Muhammadiyah No. 2/PED/I.0/B/2024",
      issuer: "Takmir & Biro Kerumahtanggaan UMS",
      date: "Edisi Mutakhir 2024",
      fileName: "pedoman-tata-kelola-masjid.pdf",
      category: "Pedoman Tata Tertib & Fasilitas",
      description:
        "Standar operasional prosedur pemanfaatan aula serbaguna, sayap kajian kemahasiswaan, transparansi infaq digital QRIS, serta kebersihan dan keamanan lingkungan masjid.",
    },
  ];

  const otherMosques: MosqueHistory[] = [
    {
      id: "fadhlurrahman",
      name: "Masjid Fadhlurrahman",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Fadhlurrahman+UMS",
      location: "Kampus 1 UMS, Pabelan, Kartasura",
      established: "Era Awal Perintisan Kampus UMS (1981)",
      image: "/images/hero-fadhlurrahman.jpg",
      leadWord: "Ghirah Berislam",
      tagline: "Masjid Pertama & Tonggak Sejarah Al-Islam Kemuhammadiyahan UMS",
      historicalContext:
        "Masjid Fadhlurrahman merupakan rumah ibadah pertama yang didirikan di area kampus Universitas Muhammadiyah Surakarta. Berdiri sejak era awal perintisan dan konsolidasi kampus di Pabelan pada tahun 1981, masjid bersejarah ini menjadi saksi bisu pembinaan angkatan-angkatan awal sarjana dan kader Muhammadiyah yang kini berkiprah luas di seluruh penjuru tanah air.\n\nSebagai episentrum spiritualitas Kampus 1, Masjid Fadhlurrahman senantiasa memelihara tradisi keilmuan dan halaqah Al-Islam Kemuhammadiyahan (AIK). Setiap harinya, masjid ini ramai makmur dengan shalat rawatib berjamaah sivitas akademika FKIP, FH, dan Fakultas Geografi, kajian intensif keislaman, serta pembinaan tilawah dan tahsin mahasiswa.",
      keyFigures: "Para tokoh pendiri UMS dan dewan guru besar perintis universitas",
      facilities: ["Ruang Shalat Utama", "Serambi Kajian"],
      philosophicalMeaning:
        "Dinamai Fadhlurrahman yang merefleksikan 'keutamaan dan karunia dari Allah Yang Maha Pengasih', sebagai wujud rasa syukur atas nikmat perkembangan pesat kampus UMS.",
    },
    {
      id: "mas-mansur",
      name: "Masjid KH. Mas Mansur",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+KH+Mas+Mansur+PESMA+UMS",
      location: "Kompleks Pesantren Mahasiswa (PESMA) Kampus 4 UMS",
      established: "2008 M / 1429 H",
      image: "/images/hero-mas-mansur.jpg",
      leadWord: "Kesejukan Ruhani",
      tagline: "Sentra Pembinaan Mahasiswa Interdisipliner & Internasional",
      historicalContext:
        "Didirikan menyatu dengan kompleks asrama Pesantren Mahasiswa (PESMA) KH. Mas Mansur di Kampus 4 UMS. Masjid ini difungsikan secara khusus sebagai kawah candradimuka bagi para mahasiswa penerima beasiswa unggulan, kader persyarikatan berprestasi, santri tahfidz, serta mahasiswa internasional dari berbagai belahan dunia.\n\nKehidupan ruhani di masjid ini berdenyut aktif 24 jam dengan lantunan halaqah tahfidzul Qur'an, kajian kitab turots, serta kultum dwi-bahasa (Arab dan Inggris) ba'da shalat maktubah. Masjid ini menjadi simbol integrasi antara kedisiplinan hidup pesantren modern dan keunggulan akademik perguruan tinggi bertaraf internasional.",
      keyFigures: "KH. Mas Mansur (Pahlawan Nasional & Ketua PB Muhammadiyah 1937-1942)",
      facilities: [
        "Ruang Shalat 2 Lantai",
        "Lapangan Luas",
        "Pesma Mart",
        "Guesthouse",
        "Asrama Putra & Putri",
        "Parkir Luas",
      ],
      philosophicalMeaning:
        "Mengabadikan keteladanan KH. Mas Mansur yang mencetuskan 'Langkah Dua Belas Muhammadiyah', memadukan intelektualisme progresif dan keteguhan akidah.",
    },
    {
      id: "mahad-abu-bakar",
      name: "Masjid Ma'had Abu Bakar Ash-Shiddiq",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Mahad+Abu+Bakar+Ash+Shiddiq+UMS",
      location: "Kampus 2 UMS (Sayap Timur)",
      established: "1994 M / 1415 H",
      image: "/images/hero-mahad-abu-bakar.jpg",
      leadWord: "Keluhuran Ilmu & Adab",
      tagline: "Pusat Dirasat Islamiyah & Penguatan Bahasa Arab (AUM UMS)",
      historicalContext:
        "Bermula dari inisiasi kerja sama keilmuan internasional dalam wadah Ma'had Abu Bakar Ash-Shiddiq UMS untuk pengajaran intensif bahasa Arab dan dirasat Islamiyah. Masjid ini berperan sebagai laboratorium hidup bagi para penuntut ilmu yang berikrar mendalami bahasa Arab sebagai kunci utama memahami wahyu Al-Qur'an, hadits Nabi, dan khazanah literatur turots para ulama salafus shalih.\n\nDalam perjalanannya, Ma'had Abu Bakar telah melahirkan ribuan asatidz, mubaligh, dan penerjemah yang menguasai kaidah syariat dan kefasihan lisan Arab. Setiap sudut masjid difungsikan untuk muhadharah, khutbah latihan, qira'atul kutub, serta pembinaan adab thalabul ilmi yang berakar kuat pada nilai-nilai sunnah shahihah.",
      keyFigures: "Sahabat Abu Bakar Ash-Shiddiq RA & Asatidzah Ma'had",
      facilities: ["Masjid", "Kelas", "Perpustakaan", "Parkir"],
      philosophicalMeaning:
        "Mewarisi kejujuran, komitmen, dan keteguhan ash-Shiddiq dalam mendalami ilmu-ilmu syar'i dan mendakwahkannya dengan hikmah.",
    },
    {
      id: "munajat-shabran",
      name: "Masjid Al-Munajat",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Munajat+Pondok+Shabran+Makamhaji",
      location: "Pondok Pesantren Mahasiswa H. Ahmad Dahlan (Shabran), Makamhaji",
      established: "1982 M / 1403 H",
      image: "/images/hero-munajat-shabran.jpg",
      leadWord: "Pusat Perkaderan",
      tagline: "Kawah Candradimuka Intelek Ulama & Ulama Intelek Persyarikatan",
      historicalContext:
        "Pondok Pesantren Mahasiswa H. Ahmad Dahlan (Shabran) didirikan atas wasiat mulia dan wakaf keluarga besar H. Ahmad Dahlan dan Hj. Nuriyah Shabran untuk mencetak kader intelek-ulama dan ulama-intelek persyarikatan. Masjid Al-Munajat menjadi sentra pembentukan spiritualitas dan ideologi bagi para mahasiswa utusan Pimpinan Wilayah Muhammadiyah (PWM) dari 38 provinsi se-Indonesia.\n\nDi masjid bersejarah ini, para kader ditempa melalui rutinitas qiyamul lail berjamaah, munajat tahajud, kajian mendalam Kitab Himpunan Putusan Tarjih (HPT), dan diskursus pemikiran tajdid Islam berkemajuan. Dari mihrab Masjid Al-Munajat inilah lahir para dai tangguh yang kini berdakwah membimbing umat di daerah 3T dan pusat-pusat peradaban nusantara.",
      keyFigures: "Keluarga Pewakaf Hj. Nuriyah Shabran & Pimpinan PP Muhammadiyah",
      facilities: [
        "Dukuh: Asrama Putra & Putri",
        "Saripan: Gedung 4 Lantai, Halaman/Tempat Parkir Luas, Shobron Bakery",
      ],
      philosophicalMeaning:
        "Kata 'Munajat' menyimbolkan doa tulus dan permohonan tiada putus kepada Allah SWT agar setiap kader senantiasa diberi keistiqamahan dalam memikul risalah dakwah Islam berkemajuan.",
    },
    {
      id: "ar-razi",
      name: "Masjid Ar-Razi FKG",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Ar-Razi+FKG+UMS",
      location: "Fakultas Kedokteran Gigi (FKG) Kampus 4 UMS",
      established: "2018 M / 1439 H",
      image: "/images/hero-ar-razi.jpg",
      leadWord: "Integrasi Keislaman & Keilmuan",
      tagline: "Integrasi Nilai Kedokteran, Sains, & Spiritualitas Tenaga Medis",
      historicalContext:
        "Berdiri megah di kawasan Fakultas Kedokteran Gigi (FKG) dan Rumah Sakit Gigi dan Mulut (RSGM) Soelastri UMS Kampus 4. Masjid ini didirikan sebagai sarana vital integrasi antara sains kedokteran modern, bioetika klinis, dan keluhuran spiritualitas islami bagi para calon dokter gigi dan tenaga medis Muhammadiyah.\n\nMengabadikan nama Abu Bakar Muhammad bin Zakariya ar-Razi—ilmuwan polimatik dan peletak dasar kedokteran eksperimental Islam—masjid ini menjadi tempat hening untuk berdoa, bertafakur, dan memohon kelancaran sebelum para mahasiswa menjalani ujian klinis serta praktik penanganan pasien. Menanamkan prinsip bahwa setiap keahlian medis adalah wasilah ibadah demi kemaslahatan umat.",
      keyFigures: "Abu Bakar Muhammad bin Zakariya al-Razi (865–925 M)",
      facilities: [
        "Gedung",
        "Ruang Seminar",
        "Kelas",
        "Tempat Ibadah Bersih",
        "Parkiran",
      ],
      philosophicalMeaning:
        "Terinspirasi dari Al-Razi, ilmuwan polimatik dan pelopor kedokteran klinis Islam yang meletakkan dasar farmakologi, etika medis, dan penanganan pasien tanpa diskriminasi.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-[#C59B27] selection:text-white">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section dengan Background Kolase 6 Masjid Kampus */}
        <section className="relative text-white pt-14 pb-20 sm:pb-28 overflow-hidden border-b-2 border-stone-300/80">
          {/* Background Image: Kolase 6 Masjid Kampus UMS */}
          <div className="absolute inset-0">
            <Image
              src="/images/banner-sejarah-6-masjid.jpg"
              alt="Kolase 6 Masjid Kampus Universitas Muhammadiyah Surakarta"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Penyamar biru elegan transparan agar foto 6 masjid tetap terlihat jelas */}
            <div className="absolute inset-0 bg-[#002855]/55" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001F3F]/80 via-[#002855]/45 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-[#FCD34D] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dokumentasi Sejarah &amp; Arsip Legalitas</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-tight drop-shadow-md">
                Sejarah Masjid Kampus UMS
              </h1>
              <p className="mt-4 text-stone-100 text-sm sm:text-base lg:text-lg leading-relaxed font-light max-w-2xl drop-shadow-sm">
                Menelusuri jejak perintisan dakwah, penetapan nama pejuang &amp; tokoh persyarikatan, 
                serta arsip Surat Keputusan (SK) resmi pengelolaan masjid percontohan di lingkungan 
                Universitas Muhammadiyah Surakarta.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 1: SEJARAH UTAMA - MASJID HJ. SUDALMIYAH RAIS */}
        <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-16">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl">
              {/* Badge & Title */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003B73]/10 text-[#003B73] text-xs font-bold uppercase tracking-wider mb-2">
                    <Award className="w-4 h-4 text-[#B58A1E]" />
                    <span>Masjid Utama & Pusat Percontohan LPCR-PM</span>
                  </div>
                  <div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Masjid+Hj.+Sudalmiyah+Rais+UMS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/title inline-flex items-center gap-2 hover:text-[#003B73] transition-colors"
                      title="Buka peta Google Maps untuk Masjid Hj. Sudalmiyah Rais"
                    >
                      <h2 className="text-2xl sm:text-4xl font-black font-serif text-stone-900 group-hover/title:text-[#003B73] tracking-tight transition-colors">
                        Masjid Hj. Sudalmiyah Rais
                      </h2>
                      <ExternalLink className="w-5 h-5 text-stone-400 group-hover/title:text-[#003B73] transition-colors shrink-0" />
                    </a>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Masjid+Hj.+Sudalmiyah+Rais+UMS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-stone-500 hover:text-[#003B73] mt-1 inline-flex items-center gap-1.5 transition-colors"
                    title="Buka lokasi di Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#B58A1E]" />
                    <span>Kampus 2 UMS, Jl. A. Yani, Pabelan, Kartasura, Sukoharjo</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300">
                    Standar LPCR-PM PP Muhammadiyah
                  </span>
                </div>
              </div>

              {/* Grid: Foto Utama & Profil Singkat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Visual Image */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Masjid+Hj.+Sudalmiyah+Rais+UMS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/img relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 block"
                    title="Buka lokasi Masjid Hj. Sudalmiyah Rais di Google Maps"
                  >
                    <Image
                      src="/images/masjid-sudalmiyah.jpg"
                      alt="Masjid Hj. Sudalmiyah Rais UMS"
                      fill
                      className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                      <div className="text-white text-xs">
                        <span className="font-bold text-[#FCD34D] block text-sm">Masjid Kampus 2 UMS</span>
                        Kapasitas 4.000+ Jamaah dengan Fasilitas Hall & Sayap Pembinaan
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 group-hover/img:bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <MapPin className="w-3 h-3 text-[#FCD34D]" />
                      <span>Buka Google Maps</span>
                    </div>
                  </a>

                  {/* Highlight Box Profil Tokoh */}
                  <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-5">
                    <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#B58A1E]" />
                      <span>Sosok Hj. Sudalmiyah Suhud Rais</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      Secara historis, nama masjid ini diabadikan dari figur perintis berdirinya UMS, yaitu 
                      <strong> Hj. Sudalmiyah Suhud Rais</strong> (istri dari Bapak Suhud Rais, aktivis Muhammadiyah Surakarta, 
                      serta ibunda dari tokoh nasional Prof. Dr. M. Amien Rais, M.A. dan Drs. H. A. Dahlan Rais, M.Hum.). 
                      Beliau adalah muballighah &lsquo;Aisyiyah yang gigih, pendidik berintegritas tinggi, dan teladan keikhlasan dakwah 
                      yang jasanya diabadikan sebagai nama masjid utama ini.
                    </p>
                  </div>

                  {/* Rekening & QRIS Resmi Masjid Hj. Sudalmiyah Rais (Gambar Diperbesar & No. Rekening di Bawahnya) */}
                  <div className="pt-3 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                    {/* Gambar QRIS Diperbesar Penuh */}
                    <div
                      onClick={() => bankAccounts.sudalmiyah && setActiveQrisModal(bankAccounts.sudalmiyah)}
                      className="relative aspect-[385/544] w-56 sm:w-64 md:w-72 lg:w-full lg:max-w-[320px] rounded-2xl overflow-hidden bg-white cursor-pointer group/qris hover:opacity-95 transition-all hover:scale-[1.02] shadow-sm"
                      title="Klik untuk memperbesar QRIS Masjid Sudalmiyah Rais"
                    >
                      <Image
                        src={bankAccounts.sudalmiyah?.qrisImageUrl || "/images/qris-sudalmiyah.png"}
                        alt="QRIS Masjid Hj. Sudalmiyah Rais"
                        fill
                        unoptimized
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qris:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1.5">
                        <Eye className="w-4 h-4 text-amber-300" />
                        <span>Perbesar QRIS</span>
                      </div>
                    </div>

                    {/* Rincian Rekening di Bawah Gambar */}
                    <div className="space-y-1.5 w-full max-w-[320px] text-center sm:text-left">
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        {bankAccounts.sudalmiyah?.bankName || "Bank Syariah Indonesia"}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <a
                          href={getVirtualBankUrl(bankAccounts.sudalmiyah)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/bank inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                          title="Klik untuk langsung menuju Bank Virtual (Internet Banking)"
                        >
                          <span className="font-mono font-black text-lg sm:text-xl text-[#003B73] hover:underline underline-offset-4 select-all">
                            {bankAccounts.sudalmiyah?.accountNumber || "6012275865"}
                          </span>
                          <ExternalLink className="w-4 h-4 text-stone-400 group-hover/bank:text-[#003B73] transition-colors" />
                        </a>

                        {bankAccounts.sudalmiyah?.accountNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyAccount("sudalmiyah", bankAccounts.sudalmiyah?.accountNumber || "6012275865")}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#003B73] hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Salin Nomor Rekening"
                          >
                            {copiedId === "sudalmiyah" ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      {copiedId === "sudalmiyah" && (
                        <div className="text-[10px] font-bold text-emerald-600">
                          Nomor rekening tersalin ke papan klip!
                        </div>
                      )}

                      <div className="text-xs text-stone-700">
                        a.n. <span className="font-semibold">{bankAccounts.sudalmiyah?.accountHolder || "LAZ UMS Sudalmiyah Rais"}</span>
                      </div>

                      <div className="pt-0.5">
                        <a
                          href={getVirtualBankUrl(bankAccounts.sudalmiyah)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B73] hover:underline"
                        >
                          <span>Buka Bank Virtual / e-Banking</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {bankAccounts.sudalmiyah?.notes && (
                        <p className="text-[10px] text-stone-500 italic pt-1 leading-relaxed">
                          *{bankAccounts.sudalmiyah.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deskripsi Sejarah Mendalam */}
                <div className="lg:col-span-7 space-y-5 text-stone-700 text-sm sm:text-base leading-relaxed">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl text-[#003B73]">
                      Latar Belakang & Tonggak Pendirian
                    </h3>
                    <p className="mt-2">
                      Nama <strong>Hj. Sudalmiyah Suhud Rais</strong> memiliki kedudukan yang sangat istimewa dalam sejarah 
                      Universitas Muhammadiyah Surakarta. Pada 18 September 1958, beliau tercatat sebagai salah satu dari lima 
                      tokoh perintis utama yang mendirikan IKIP Muhammadiyah Cabang Surakarta—yang kini telah bertransformasi 
                      menjadi universitas unggulan berkelas dunia (UMS).
                    </p>
                    <p className="mt-2">
                      Dalam penamaan resmi dan administrasi persyarikatan (sebagaimana tertuang dalam SK LPCR-PM PP Muhammadiyah), 
                      nama masjid umumnya diringkas menjadi <strong>Masjid Hj. Sudalmiyah Rais</strong> agar ringkas dan selaras 
                      dengan identitas keluarga besar Rais. Namun secara silsilah dan catatan sejarah pendiri kampus, nama lengkap 
                      beliau adalah <strong>Hj. Sudalmiyah Suhud Rais</strong>.
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl text-[#003B73]">
                      Mandat Resmi Masjid Percontohan Amal Usaha Muhammadiyah (AUM)
                    </h3>
                    <p className="mt-2">
                      Melalui <strong>Surat Keputusan LPCR-PM Pimpinan Pusat Muhammadiyah No. 198/KEP/I.15/A/2026</strong>, 
                      Masjid Hj. Sudalmiyah Rais ditetapkan secara resmi sebagai <strong>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</strong>. 
                      Tata kelola masjid dijalankan secara profesional dengan pembagian kepengurusan yang mencakup Dewan Penasihat, 
                      Badan Pembina Masjid (BPM) yang dipimpin oleh <strong>Dr. Muchamad Iksan, S.H., M.H</strong>, serta Badan Pelaksana 
                      Harian (Eksekutif) Masjid yang dipimpin oleh <strong>Dodi Afianto, S.Ag., M.Pd.I</strong> selaku Direktur.
                    </p>
                  </div>

                  {/* 3 Karakteristik Masjid Sudalmiyah */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                      <span className="text-xs font-bold text-[#003B73] block mb-1">
                        Ramah Aktivis
                      </span>
                      <p className="text-[11px] text-stone-600 leading-snug">
                        Menjadi markas dakwah terbuka bagi kader persyarikatan, IMM, Tapak Suci, HW, ORMAWA, UKM, dan pembinaan AIK.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-xs font-bold text-emerald-800 block mb-1">
                        Eco-Mosque
                      </span>
                      <p className="text-[11px] text-stone-600 leading-snug">
                        Pencahayaan alami hemat energi, daur ulang air wudhu berkelanjutan, serta ruang hijau asri.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                      <span className="text-xs font-bold text-amber-900 block mb-1">
                        Inklusif Difabel
                      </span>
                      <p className="text-[11px] text-stone-600 leading-snug">
                        Akses ramp kursi roda mandiri, toilet khusus disabilitas, serta kenyamanan bagi lansia dan anak.
                      </p>
                    </div>
                  </div>

                  {/* Fasilitas Terpadu & Layanan Idarah Masjid Sudalmiyah (Mengisi Ruang Bawah) */}
                  <div className="pt-3 border-t border-stone-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#B58A1E]" />
                        <span>Fasilitas Terpadu &amp; Layanan Idarah Masjid</span>
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-[#003B73] bg-[#003B73]/10 px-2.5 py-0.5 rounded-full">
                        Standar Idarah Unggul
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                        <strong className="text-stone-900 block text-xs">Kapasitas 4.000+ Jamaah &amp; Hall Serbaguna</strong>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Ruang shalat bertingkat berpendingin udara alami, hall utama untuk shalat rawatib &amp; Jumat, serta sayap pembinaan mahasiswa.
                        </p>
                      </div>

                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                        <strong className="text-stone-900 block text-xs">Aksesibilitas Difabel &amp; Lansia Mandiri</strong>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Jalur ramp landai mandiri, fasilitas wudhu dan toilet duduk khusus disabilitas, serta ruang transit prioritas lansia.
                        </p>
                      </div>

                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                        <strong className="text-stone-900 block text-xs">Daur Ulang Air Wudhu &amp; Ruang Hijau</strong>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Instalasi filtrasi daur ulang air wudhu terpadu untuk pengairan taman kampus dan konservasi sumber daya air berkelanjutan.
                        </p>
                      </div>

                      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200/80 space-y-1">
                        <strong className="text-stone-900 block text-xs">Layanan Keumatan &amp; Kantor Takmir Aktif</strong>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          Sekretariat harian takmir, penyaluran infaq resmi LAZ UMS, presensi shalat digital, dan pusat pengkaderan ortom Muhammadiyah.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <span className="text-stone-500 text-[11px]">
                        Lokasi: Sayap Barat Gedung Induk Siti Walidah Kampus 2 UMS
                      </span>
                      <div className="flex items-center gap-3">
                        <Link
                          href="/ibadah/presensi"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B73] hover:underline"
                        >
                          <span>Presensi Shalat</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                        <span className="text-stone-300">•</span>
                        <Link
                          href="/agenda"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003B73] hover:underline"
                        >
                          <span>Jadwal Agenda</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        {/* SECTION 2: SURAT KEPUTUSAN (SK) & DOKUMEN LEGALITAS RESMI */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003B73] text-white text-xs font-bold uppercase tracking-wider mb-2">
                    <FileCheck className="w-3.5 h-3.5 text-[#FCD34D]" />
                    <span>Arsip Legalitas & Dokumen Resmi</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
                    Surat Keputusan (SK) & Pedoman Kelembagaan
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                    Transparansi tata kelola Idarah Masjid Sudalmiyah dan Masjid Kampus UMS berlandaskan 
                    surat keputusan resmi LPCR-PM Pimpinan Pusat Muhammadiyah dan ketetapan universitas.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-600 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dokumen Terverifikasi &amp; Sah</span>
                </div>
              </div>

              {/* Kartu Khusus Highlight: SK Resmi LPCR-PM PP Muhammadiyah */}
              <div className="mt-8 bg-gradient-to-br from-white via-amber-50/20 to-blue-50/30 border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#003B73] text-white">
                        SK No. 198/KEP/I.15/A/2026
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                        Periode 2026 - 2031
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        Ditetapkan: 21 Safar 1448 H / 4 Agustus 2026 M
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-serif font-black text-stone-900 leading-snug">
                      Surat Keputusan LPCR-PM PP Muhammadiyah: Penetapan Takmir Masjid Hj. Sudalmiyah Rais UMS
                    </h4>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Dokumen hukum formal dari Pimpinan Pusat Muhammadiyah yang menetapkan struktur kepengurusan Takmir 
                      Masjid Hj. Sudalmiyah Rais Universitas Muhammadiyah Surakarta sebagai <strong>Masjid Percontohan Amal Usaha Muhammadiyah (AUM)</strong>. 
                      Ditandatangani oleh Ketua LPCR-PM H. M. Jamaludin Ahmad, S.Psi dan Sekretaris Isngadi Marwah Atmadja, M.H., 
                      serta diketahui oleh Ketua PP Muhammadiyah Drs. H. A. Dahlan Rais, M.Hum.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>Ketua Penasihat: <strong>Drs. KH. Marpuji Ali, M.Si</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#B58A1E] shrink-0" />
                        <span>Ketua Badan Pembina Masjid (BPM): <strong>Dr. Muchamad Iksan, S.H., M.H</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#003B73] shrink-0" />
                        <span>Direktur Badan Pelaksana Harian (Eksekutif) Masjid: <strong>Dodi Afianto, S.Ag., M.Pd.I</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                    <button
                      onClick={() => setSelectedDoc(documents[0])}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#003B73]/30 hover:border-[#003B73] text-[#003B73] font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Struktur Takmir</span>
                    </button>

                    <a
                      href={`/dokumen/${encodeURIComponent(documents[0].fileName)}`}
                      download
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#003B73] hover:bg-[#002855] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Berkas SK (PDF)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Dokumen Pendukung Lainnya */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                {documents.slice(1).map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-stone-200/90 hover:border-[#D4AF37] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#003B73] border border-blue-200">
                          {doc.category}
                        </span>
                        <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {doc.date}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg group-hover:text-[#003B73] transition-colors leading-snug">
                        {doc.title}
                      </h4>

                      <div className="text-xs font-semibold text-[#B58A1E] font-mono mt-1.5">
                        {doc.docNumber}
                      </div>

                      <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                        {doc.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                        <span>Penerbit: <strong>{doc.issuer}</strong></span>
                        <span className="font-mono text-stone-400">{doc.fileName}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2.5">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#003B73]/10 hover:bg-[#003B73]/20 text-[#003B73] text-xs font-bold transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Rincian Dokumen</span>
                      </button>

                      <a
                        href={`/dokumen/${encodeURIComponent(doc.fileName)}`}
                        download
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        {/* SECTION 3: SEJARAH JEJARING MASJID KAMPUS UMS LAINNYA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold text-[#B58A1E] uppercase tracking-wider">
                Jejaring Peribadatan Kampus
              </span>
              <h3 className="text-2xl sm:text-4xl font-black font-serif text-stone-900 tracking-tight mt-1">
                Koleksi Sejarah Masjid Kampus UMS
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2">
                Setiap masjid di lingkungan Universitas Muhammadiyah Surakarta memiliki riwayat perjuangan, 
                sosok inspiratif, dan peran strategis yang saling melengkapi dalam mengokohkan dakwah Islam berkemajuan.
              </p>
            </div>

            <div className="space-y-8">
              {otherMosques.map((mosque) => {
                const bank = bankAccounts[mosque.id];
                return (
                  <div
                    key={mosque.id}
                    className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                      {/* 1. Foto Masjid & Info Fasilitas Ringkas */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                        <a
                          href={mosque.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/img relative aspect-[16/11] w-full rounded-2xl overflow-hidden shadow-sm border border-stone-200 block"
                          title={`Buka lokasi ${mosque.name} di Google Maps`}
                        >
                          <Image
                            src={mosque.image}
                            alt={mosque.name}
                            fill
                            className="object-cover group-hover/img:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-[#003B73]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs">
                            {mosque.leadWord}
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/60 group-hover/img:bg-black/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <MapPin className="w-3 h-3 text-[#FCD34D]" />
                            <span>Buka Google Maps</span>
                          </div>
                        </a>

                        {/* Makna Filosofis & Fasilitas (Mengisi Kolom Kiri Bawah) */}
                        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/80 text-xs space-y-1.5 flex-1 flex flex-col justify-center">
                          <div>
                            <strong className="text-stone-800 font-semibold block text-[11px] text-[#003B73]">Makna &amp; Inspirasi:</strong>
                            <p className="text-stone-600 text-[11px] leading-relaxed">{mosque.philosophicalMeaning}</p>
                          </div>
                          <div className="pt-1 border-t border-stone-200/60">
                            <strong className="text-stone-800 font-semibold block text-[11px] text-[#003B73]">Fasilitas Umum:</strong>
                            <p className="text-stone-600 text-[11px] leading-relaxed">{mosque.facilities.join(" • ")}</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Konten Sejarah */}
                      <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                              {mosque.established}
                            </span>
                          </div>

                          <div>
                            <a
                              href={mosque.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/title inline-flex items-center gap-2 hover:text-[#003B73] transition-colors"
                              title={`Buka peta lokasi ${mosque.name} di Google Maps`}
                            >
                              <h4 className="text-xl sm:text-2xl font-serif font-black text-stone-900 group-hover/title:text-[#003B73] transition-colors">
                                {mosque.name}
                              </h4>
                              <ExternalLink className="w-4 h-4 text-stone-400 group-hover/title:text-[#003B73] transition-colors shrink-0" />
                            </a>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-[#003B73]">
                            {bank?.tagline || mosque.tagline}
                          </p>

                          <div className="text-xs sm:text-sm text-stone-600 leading-relaxed text-justify space-y-2.5">
                            {(bank?.description || mosque.historicalContext).split("\n\n").map((para, pIdx) => (
                              <p key={pIdx}>{para}</p>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                          <span>Tokoh Perintis / Penggagas:</span>
                          <strong className="text-stone-800 text-right max-w-[220px] truncate">{mosque.keyFigures}</strong>
                        </div>
                      </div>

                      {/* 3. Kolom Kanan: Gambar QRIS & No. Rekening (Tanpa Border) */}
                      <div className="lg:col-span-3 flex flex-col justify-between items-center sm:items-start text-center sm:text-left space-y-3 pt-1 lg:pt-0">
                        {/* Gambar QRIS Diperbesar Proporsional */}
                        <div
                          onClick={() => bank && setActiveQrisModal(bank)}
                          className="relative aspect-[385/544] w-56 sm:w-64 lg:w-full lg:max-w-[270px] rounded-2xl overflow-hidden bg-white cursor-pointer group/qris hover:opacity-95 transition-all hover:scale-[1.02] shadow-sm"
                          title="Klik untuk memperbesar QRIS"
                        >
                          <Image
                            src={bank?.qrisImageUrl || "/images/qris-bank-jateng.jpg"}
                            alt={`QRIS ${mosque.name}`}
                            fill
                            unoptimized
                            className="object-contain"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qris:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1.5">
                            <Eye className="w-4 h-4 text-amber-300" />
                            <span>Perbesar QRIS</span>
                          </div>
                        </div>

                        {/* Rincian Rekening */}
                        <div className="space-y-1.5 w-full max-w-[270px] text-center sm:text-left">
                          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                            {bank?.bankName || "Bank Penampung"}
                          </div>

                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <a
                              href={getVirtualBankUrl(bank)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/bank inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                              title="Klik untuk langsung menuju Bank Virtual (Internet Banking)"
                            >
                              <span className="font-mono font-black text-base sm:text-lg text-[#003B73] hover:underline underline-offset-4 select-all">
                                {bank?.accountNumber || "-"}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover/bank:text-[#003B73] transition-colors" />
                            </a>
                            {bank?.accountNumber && (
                              <button
                                type="button"
                                onClick={() => handleCopyAccount(mosque.id, bank.accountNumber)}
                                className="p-1 rounded text-stone-400 hover:text-[#003B73] hover:bg-stone-100 transition-colors cursor-pointer"
                                title="Salin Nomor Rekening"
                              >
                                {copiedId === mosque.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          {copiedId === mosque.id && (
                            <div className="text-[10px] font-bold text-emerald-600">
                              Nomor rekening tersalin ke papan klip!
                            </div>
                          )}

                          <div className="text-xs text-stone-700 leading-snug">
                            a.n. <span className="font-semibold">{bank?.accountHolder || "Takmir Masjid UMS"}</span>
                          </div>

                          <div className="pt-0.5">
                            <a
                              href={getVirtualBankUrl(bank)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003B73] hover:underline"
                            >
                              <span>Buka Bank Virtual / e-Banking</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {bank?.notes && (
                            <p className="text-[10px] text-stone-500 italic pt-1 leading-relaxed">
                              *{bank.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
      </main>

      {/* MODAL PRATINJAU DOKUMEN SK & STRUKTUR TAKMIR */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#003B73] border border-blue-200">
                {selectedDoc.category}
              </span>
              <span className="text-xs text-stone-400 font-mono">{selectedDoc.date}</span>
            </div>

            <h3 className="font-serif font-black text-stone-900 text-lg sm:text-xl leading-snug">
              {selectedDoc.title}
            </h3>

            <div className="text-xs font-mono font-bold text-[#B58A1E] mt-1.5">
              {selectedDoc.docNumber}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 text-xs text-stone-600 space-y-2 leading-relaxed">
              <p>{selectedDoc.description}</p>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                <span>Penerbit Dokumen:</span>
                <strong className="text-stone-800">{selectedDoc.issuer}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Nama Berkas:</span>
                <code className="font-mono text-stone-800">{selectedDoc.fileName}</code>
              </div>
            </div>

            {/* Rincian Struktur Takmir jika tersedia */}
            {selectedDoc.structure && (
              <div className="mt-4 space-y-3">
                <h4 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#003B73]" />
                  <span>Struktur Takmir Masjid Sudalmiyah Rais Periode 2026-2031:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Dewan Penasihat (Kotak Hijau - di Kiri / Pertama) */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col">
                    <strong className="text-emerald-900 block mb-1">Dewan Penasihat</strong>
                    <div className="font-semibold text-stone-800">
                      Ketua: {selectedDoc.structure.penasihat.ketua}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                      <span className="font-semibold text-stone-700">Anggota:</span>{" "}
                      {selectedDoc.structure.penasihat.anggota.join(", ")}
                    </div>
                  </div>

                  {/* Badan Pembina Masjid (BPM) (Kotak Kuning/Amber - di Tengah) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col">
                    <strong className="text-amber-900 block mb-1">Badan Pembina Masjid (BPM)</strong>
                    <div className="font-semibold text-stone-800">
                      Ketua: {selectedDoc.structure.bpm.ketua}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                      <span className="font-semibold text-stone-700">Anggota:</span>{" "}
                      {selectedDoc.structure.bpm.anggota.join(", ")}
                    </div>
                  </div>

                  {/* Badan Pelaksana Harian (Eksekutif) Masjid (Kotak Biru - di Kanan / Ketiga) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col">
                    <strong className="text-[#003B73] block mb-1">Badan Pelaksana Harian (Eksekutif) Masjid</strong>
                    <div className="font-semibold text-stone-800">
                      Direktur: {selectedDoc.structure.bphm.direktur}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                      <span className="font-semibold text-stone-700">Anggota:</span>{" "}
                      {selectedDoc.structure.bphm.anggota.join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Tutup
              </button>
              <a
                href={`/dokumen/${encodeURIComponent(selectedDoc.fileName)}`}
                download
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERBESAR KODE QRIS */}
      {activeQrisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-stone-200 my-8 text-center space-y-4">
            <button
              onClick={() => setActiveQrisModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>QRIS Standar Nasional (ASPI)</span>
              </span>
              <h3 className="font-serif font-black text-stone-900 text-lg sm:text-xl mt-2 leading-tight">
                {activeQrisModal.mosqueName}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Pindai dengan aplikasi m-Banking atau dompet digital (e-Wallet) apa pun
              </p>
            </div>

            {/* Gambar QRIS Utama */}
            <div className="relative aspect-[385/544] w-64 sm:w-72 mx-auto rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-white p-2 flex items-center justify-center">
              <Image
                src={activeQrisModal.qrisImageUrl || "/images/qris-bank-jateng.jpg"}
                alt={`QRIS ${activeQrisModal.mosqueName}`}
                fill
                unoptimized
                className="object-contain p-1"
              />
            </div>

            {/* Detail Rekening & Merchant */}
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
              {activeQrisModal.qrisMerchantName && (
                <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/80">
                  <span className="text-stone-500">Merchant QRIS:</span>
                  <strong className="text-stone-900">{activeQrisModal.qrisMerchantName}</strong>
                </div>
              )}
              <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/80">
                <span className="text-stone-500">Bank:</span>
                <strong className="text-stone-900">{activeQrisModal.bankName}</strong>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/80">
                <span className="text-stone-500">No. Rekening:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-[#003B73]">
                  <a
                    href={getVirtualBankUrl(activeQrisModal)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                    title="Buka Bank Virtual"
                  >
                    <span>{activeQrisModal.accountNumber}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 hover:text-[#003B73]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(activeQrisModal.mosqueId, activeQrisModal.accountNumber)}
                    className="p-1 rounded bg-white hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                    title="Salin No. Rekening"
                  >
                    {copiedId === activeQrisModal.mosqueId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-stone-200/80">
                <span className="text-stone-500">Atas Nama:</span>
                <strong className="text-stone-900">{activeQrisModal.accountHolder}</strong>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-stone-500">Layanan Bank:</span>
                <a
                  href={getVirtualBankUrl(activeQrisModal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#003B73] hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Bank Virtual / e-Banking</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Tombol Unduh & Tutup */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={activeQrisModal.qrisImageUrl}
                download={`QRIS-${activeQrisModal.mosqueId}.jpg`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar QRIS</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveQrisModal(null)}
                className="px-5 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
