"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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
        "Surat Keputusan penetapan resmi susunan Dewan Penasihat, Badan Pembina Masjid (BPM), dan Badan Pelaksana Harian Masjid (BPHM) Masjid Hj. Sudalmiyah Rais UMS sebagai Masjid Percontohan Nasional Muhammadiyah tingkat PTMA.",
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
      title: "Penetapan Masjid Percontohan Nasional Muhammadiyah Tingkat PTMA",
      docNumber: "SK LPCR-PM PP Muhammadiyah No. 022/I.15/B/2026",
      issuer: "LPCR-PM Pimpinan Pusat Muhammadiyah",
      date: "1448 H / 2026 M",
      fileName: "sk-takmir-masjid-percontohan.pdf",
      category: "Standarisasi & Rekomendasi Nasional",
      description:
        "Landasan pengukuhan Masjid Hj. Sudalmiyah Rais UMS sebagai model percontohan nasional dalam tata kelola Idarah (manajerial modern), Imarah (kemakmuran ibadah & dakwah AIK), dan Ri'ayah (Eco-Mosque inklusif ramah difabel).",
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
        "Masjid Fadhlurrahman merupakan rumah ibadah pertama yang didirikan di area kampus Universitas Muhammadiyah Surakarta. Berdiri sejak era awal pemindahan dan konsolidasi kampus di Pabelan, masjid ini menjadi saksi bisu pembinaan angkatan-angkatan awal sarjana dan kader Muhammadiyah. Masjid ini senantiasa mempertahankan nilai historis sebagai episentrum kajian keislaman dasar dan shalat berjamaah sivitas akademika Fakultas Keguruan dan Ilmu Pendidikan (FKIP) serta fakultas di Kampus 1.",
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
        "Didirikan menyatu dengan asrama Pesantren Mahasiswa (PESMA) KH. Mas Mansur. Masjid ini difungsikan khusus sebagai kawah candradimuka bagi para mahasiswa penerima beasiswa unggulan, santri berprestasi, dan mahasiswa internasional. Setiap hari masjid ini aktif dengan lantunan halaqah tahfidz Al-Qur'an, kultum bahasa Arab dan Inggris, serta kajian pemikiran Islam kontemporer.",
      keyFigures: "KH. Mas Mansur (Pahlawan Nasional & Ketua PB Muhammadiyah 1937-1942)",
      facilities: [
        "Ruang Shalat 2 Lantai",
        "Lapangan Luas",
        "Pesmart",
        "Guesthouse",
        "Asrama",
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
        "Bermula dari kerja sama keilmuan internasional dalam wadah Ma'had Abu Bakar Ash-Shiddiq UMS untuk pengajaran bahasa Arab dan studi syariah. Masjid ini menjadi laboratorium hidup bagi para penuntut ilmu yang berikrar memelihara bahasa Arab sebagai bahasa Al-Qur'an dan khazanah literatur turots Islam. Kini, Ma'had Abu Bakar telah berkembang kokoh menjadi salah satu AUM unggulan di bawah naungan UMS.",
      keyFigures: "Sahabat Abu Bakar Ash-Shiddiq RA & Asatidzah Ma'had",
      facilities: ["Masjid", "Kelas", "Perpustakaan", "Parkir"],
      philosophicalMeaning:
        "Mewarisi kejujuran, komitmen, dan keteguhan ash-Shiddiq dalam mendalami ilmu-ilmu syar'i dan mendakwahkannya dengan hikmah.",
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
        "Hadir di lingkungan Fakultas Kedokteran Gigi dan Rumah Sakit Gigi dan Mulut (RSGM) UMS. Masjid ini dibangun sebagai sarana pembentukan etika dan spiritualitas dokter gigi muslim yang berjiwa pengabdi. Suasana hening dan bersih mendukung para calon dokter untuk merefleksikan sumpah profesi dan nilai-nilai kemanusiaan dalam bingkai ibadah lillahi ta'ala.",
      keyFigures: "Abu Bakar Muhammad bin Zakariya al-Razi (865–925 M)",
      facilities: ["Ruang Ibadah Bersih", "Parkir", "Satpam"],
      philosophicalMeaning:
        "Terinspirasi dari Al-Razi, ilmuwan polimatik dan pelopor kedokteran klinis Islam yang meletakkan dasar farmakologi, etika medis, dan penanganan pasien tanpa diskriminasi.",
    },
    {
      id: "munajat-shabran",
      name: "Masjid Al-Munajat Pondok Shabran",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Masjid+Munajat+Pondok+Shabran+Makamhaji",
      location: "Pondok Pesantren Mahasiswa H. Ahmad Dahlan (Shabran), Makamhaji",
      established: "1982 M / 1403 H",
      image: "/images/hero-munajat-shabran.jpg",
      leadWord: "Pusat Perkaderan",
      tagline: "Kawah Candradimuka Intelek Ulama & Ulama Intelek Persyarikatan",
      historicalContext:
        "Pondok Shabran didirikan atas wasiat dan wakaf keluarga H. Ahmad Dahlan dan H. Nuriyah Shabran untuk mencetak kader ulama tarjih Muhammadiyah. Masjid Al-Munajat Pondok Shabran menjadi pusat peribadatan malam, qiyamul lail berjamaah, munajat, serta gemblengan ideologis kader-kader utusan Pimpinan Wilayah Muhammadiyah (PWM) dari 38 provinsi di Indonesia yang kelak diterjunkan berdakwah ke pelosok nusantara.",
      keyFigures: "Keluarga Pewakaf Hj. Nuriyah Shabran & Pimpinan PP Muhammadiyah",
      facilities: ["Gedung Lantai 4", "Asrama Kader Putra & Putri"],
      philosophicalMeaning:
        "Kata 'Munajat' menyimbolkan doa tulus dan permohonan tiada putus kepada Allah SWT agar setiap kader senantiasa diberi keistiqamahan dalam memikul risalah dakwah Islam berkemajuan.",
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
                      Mandat Resmi Masjid Percontohan Nasional LPCR-PM
                    </h3>
                    <p className="mt-2">
                      Melalui <strong>Surat Keputusan LPCR-PM Pimpinan Pusat Muhammadiyah No. 198/KEP/I.15/A/2026</strong>, 
                      Masjid Hj. Sudalmiyah Rais ditetapkan secara resmi sebagai <strong>Masjid Percontohan Nasional Muhammadiyah</strong>. 
                      Tata kelola masjid dijalankan secara profesional dengan pembagian kepengurusan yang mencakup Dewan Penasihat, 
                      Badan Pembina Masjid (BPM) yang dipimpin oleh Dr. Muchamad Iksan, S.H., M.H, serta Badan Pelaksana Harian 
                      Masjid (BPHM) yang dipimpin oleh <strong>Dodi Afianto, S.Ag., M.Pd.I</strong> selaku Direktur.
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
                      Masjid Hj. Sudalmiyah Rais Universitas Muhammadiyah Surakarta sebagai <strong>Masjid Percontohan Nasional</strong>. 
                      Ditandatangani oleh Ketua LPCR-PM H. M. Jamaludin Ahmad, S.Psi dan Sekretaris Isngadi Marwah Atmadja, M.H., 
                      serta diketahui oleh Ketua PP Muhammadiyah Drs. H. A. Dahlan Rais, M.Hum.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span>Ketua Penasihat: <strong>Drs. KH. Marpuji Ali, M.Si</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#B58A1E]" />
                        <span>Ketua BPM: <strong>Dr. Muchamad Iksan, S.H., M.H</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#003B73]" />
                        <span>Direktur BPHM: <strong>Dodi Afianto, S.Ag., M.Pd.I</strong></span>
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
              {otherMosques.map((mosque) => (
                <div
                  key={mosque.id}
                  className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                    {/* Gambar Masjid - Klik untuk membuka Google Maps */}
                    <div className="lg:col-span-5">
                      <a
                        href={mosque.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/img relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-sm border border-stone-200 block"
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
                    </div>

                    {/* Konten Sejarah */}
                    <div className="lg:col-span-7 space-y-3">
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
                        {mosque.tagline}
                      </p>

                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed text-justify">
                        {mosque.historicalContext}
                      </p>

                      <div className="pt-2 text-xs text-stone-500 border-t border-stone-100 space-y-1">
                        <div>
                          <strong>Makna &amp; Inspirasi:</strong> {mosque.philosophicalMeaning}
                        </div>
                        <div>
                          <strong>Fasilitas Umum:</strong>{" "}
                          {mosque.facilities.join(" • ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

                  {/* Badan Pembina (BPM) (Kotak Kuning/Amber - di Tengah) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col">
                    <strong className="text-amber-900 block mb-1">Badan Pembina (BPM)</strong>
                    <div className="font-semibold text-stone-800">
                      Ketua: {selectedDoc.structure.bpm.ketua}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                      <span className="font-semibold text-stone-700">Anggota:</span>{" "}
                      {selectedDoc.structure.bpm.anggota.join(", ")}
                    </div>
                  </div>

                  {/* Badan Pelaksana (BPHM) (Kotak Biru - di Kanan / Ketiga) */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col">
                    <strong className="text-[#003B73] block mb-1">Badan Pelaksana (BPHM)</strong>
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

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
