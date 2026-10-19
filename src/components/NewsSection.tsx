"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink, Play } from "lucide-react";

interface NewsItem {
  id: string;
  source: "MASJIDMU" | "UMS" | "LPCR" | "MUHAMMADIYAH_SOLO" | "SUARA_MUHAMMADIYAH" | "LENSAMU";
  badge: string;
  badgeClass: string;
  timeAgo: string;
  publishedAt?: string;
  sourceDomain: string;
  sourceUrl: string;
  title: string;
  excerpt: string;
  content: string[];
  imageUrl: string;
  isLive?: boolean;
  youtubeId?: string;
}

export function formatClientTimeAgo(
  dateString?: string,
  fallback: string = "Baru saja",
  now: number | null = null
): string {
  if (!dateString || !now) return fallback;
  try {
    const pubDate = new Date(dateString);
    if (isNaN(pubDate.getTime())) return fallback;
    const diffMs = now - pubDate.getTime();

    if (diffMs < 0 && diffMs > -60000) {
      return "Baru saja";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) {
      return "Baru saja";
    }
    if (diffMinutes === 1) {
      return "1 menit lalu";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} menit lalu`;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 1) {
      return "1 jam lalu";
    }
    if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "1 hari lalu";
    }
    if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} minggu lalu`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} bulan lalu`;
    }

    return `${Math.floor(diffDays / 365)} tahun lalu`;
  } catch {
    return fallback;
  }
}

export const initialSilaturahmiBphArticle: NewsItem = {
  id: "news-manual-silaturahmi-bph-2026",
  source: "MASJIDMU",
  badge: "WARTA MASJID",
  badgeClass: "bg-[#003B73] text-white",
  timeAgo: "13 Oktober 2026",
  publishedAt: "2026-10-13T10:00:00+07:00",
  sourceDomain: "masjid.ums.ac.id",
  sourceUrl: "#",
  title: "Silaturrahmi Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais dengan BPH UMS",
  excerpt: "SURAKARTA — Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais menggelar silaturrahmi koordinasi bersama Badan Pembina Harian (BPH) Universitas Muhammadiyah Surakarta di Ruang Sidang BPH UMS pada Selasa, 13 Oktober 2026.",
  content: [
    "SURAKARTA — Dalam rangka mempererat ukhuwah serta menyelaraskan arah pembinaan kemakmuran masjid kampus, jajaran Badan Pembina dan Pelaksana Masjid Hj. Sudalmiyah Rais menggelar pertemuan silaturrahmi bersama jajaran Badan Pembina Harian (BPH) Universitas Muhammadiyah Surakarta pada Selasa, 13 Oktober 2026.",
    "Pertemuan yang bertempat di Ruang Sidang BPH UMS ini dihadiri oleh pimpinan BPH UMS, jajaran pembina, serta takmir pelaksana Masjid Hj. Sudalmiyah Rais. Agenda pertemuan membahas koordinasi kelembagaan, penguatan program ibadah, pembinaan dakwah kemahasiswaan, serta peningkatan sarana prasarana penunjang kegiatan jamaah.",
    "Melalui silaturrahmi ini, sinergi antara BPH UMS dan pengelola Masjid Hj. Sudalmiyah Rais diharapkan semakin kokoh dalam mewujudkan masjid kampus sebagai pusat peradaban, pembinaan karakter Islami, dan pusat syiar persyarikatan di lingkungan civitas akademika."
  ],
  imageUrl: "/images/news/silaturahmi-bph-1.jpg",
};

export const tablighAkbarLiveItem: NewsItem = {
  id: "ums-live-tabligh-akbar-68",
  source: "UMS",
  badge: "REKAMAN KAJIAN",
  badgeClass: "bg-[#003B73] text-white",
  timeAgo: "Siaran Ulang",
  publishedAt: "2026-10-18T08:30:00+07:00",
  sourceDomain: "youtube.com",
  sourceUrl: "https://www.youtube.com/live/KVGneiEldgo",
  title: "Tabligh Akbar Harijadi ke-68 UMS bersama Ustadz Dr. H. Das'ad Latif",
  excerpt: "ums.ac.id, SURAKARTA - Siaran dan rekaman Tabligh Akbar Milad ke-68 Universitas Muhammadiyah Surakarta menghadirkan mubaligh kondang Ustadz Dr. H. Das'ad Latif, S.Sos., S.Ag., M.Si., Ph.D. langsung dari Edutorium KH Ahmad Dahlan UMS.",
  content: [
    "SURAKARTA - Menyemarakkan peringatan Hari Jadi ke-68 Universitas Muhammadiyah Surakarta (UMS), Lembaga Pengembangan Pondok, Al-Islam dan Kemuhammadiyahan (LPPIK) UMS menggelar Tabligh Akbar bertempat di Gedung Edutorium KH Ahmad Dahlan UMS pada Ahad, 18 Oktober 2026.",
    "Tabligh Akbar ini menghadirkan dai kondang nasional Ustadz Dr. H. Das'ad Latif, S.Sos., S.Ag., M.Si., Ph.D. dengan mengusung tema 'Meneguhkan Sinergi, Menebar Kebermanfaatan dan Menguatkan Peradaban'. Majelis ilmu ini dihadiri ribuan jamaah sivitas akademika UMS, warga persyarikatan se-Solo Raya, serta masyarakat luas.",
    "Bagi segenap jamaah dan warga persyarikatan yang berhalangan hadir langsung di Edutorium, siaran langsung dan rekaman lengkap pengajian dapat disaksikan secara daring melalui pemutar video di bawah ini atau melalui kanal YouTube resmi."
  ],
  imageUrl: "/images/news/tabligh-akbar-poster.jpg",
  isLive: false,
  youtubeId: "KVGneiEldgo",
};

export const initialLpcrArticle: NewsItem = {
  id: "lpcr-13692",
  source: "LPCR",
  badge: "LPCR-PM",
  badgeClass: "bg-[#D97706] text-white",
  timeAgo: "Baru saja",
  publishedAt: "2026-10-18T10:00:00+07:00",
  sourceDomain: "lpcr.or.id",
  sourceUrl: "https://lpcr.or.id/prm-jepara-gelar-pengajian-lesehan-rutin-dakwah-inklusif-ukhuwah-dan-kepedulian-sosial/",
  title: "PRM Jepara Gelar Pengajian Lesehan Rutin: Dakwah Inklusif, Ukhuwah, dan Kepedulian Sosial",
  excerpt: "lpcr.or.id — Pengajian lesehan rutin yang digagas PRM Jepara menjadi inspirasi dakwah inklusif akar rumput dalam mempererat ukhuwah serta kepedulian sosial warga persyarikatan.",
  content: [
    "lpcr.or.id — Pengajian lesehan rutin yang digagas PRM Jepara menjadi inspirasi dakwah inklusif akar rumput dalam mempererat ukhuwah serta kepedulian sosial warga persyarikatan.",
    "Lembaga Pengembangan Cabang Ranting dan Pembinaan Masjid (LPCR-PM) PP Muhammadiyah terus mendorong akselerasi cabang, ranting, dan masjid unggulan di seluruh Indonesia sebagai pilar kemajuan dakwah umat.",
  ],
  imageUrl: "https://lpcr.or.id/wp-content/uploads/2026/10/prm-jepara-unggulan-Pengajian-Lesehan.webp",
};

const initialNewsData: NewsItem[] = [
  initialSilaturahmiBphArticle,
  tablighAkbarLiveItem,
  initialLpcrArticle,
  {
    id: "ums-43448",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "Baru saja",
    publishedAt: "2026-10-17T12:51:29+07:00",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/kabar-persyarikatan/71-siswa-smp-ump-ikuti-uji-skt-pandu-hizbul-wathan-di-alam-terbuka/",
    title: "71 Siswa SMP UMP Ikuti Uji SKT Pandu Hizbul Wathan di Alam Terbuka",
    excerpt: "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas pada Kamis-Jumat (15-16/10/2026). Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan, mengevaluasi hasil latihan tahunan, serta membangun karakter dan kedisiplinan peserta didik di alam terbuka.",
    content: [
      "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas pada Kamis-Jumat (15-16/10/2026). Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan, mengevaluasi hasil latihan tahunan, serta membangun karakter dan kedisiplinan peserta didik di alam terbuka.",
      "Sebanyak 71 peserta tersebut mengikuti serangkaian uji kecakapan fisik, ketangkasan berkemah, serta pemahaman nilai-nilai kepanduan Hizbul Wathan yang berjiwa mandiri dan berakhlak mulia."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/71-Siswa-SMP-UMP-Ikuti-Uji-SKT-Pandu-Hizbul-Wathan-di-Alam-Terbuka-2.jpg",
  },
  {
    id: "solo-17939",
    source: "MUHAMMADIYAH_SOLO",
    badge: "MUHAMMADIYAH SOLO",
    badgeClass: "bg-[#1E5F3B] text-white",
    timeAgo: "Baru saja",
    publishedAt: "2026-10-18T13:54:19+07:00",
    sourceDomain: "muhammadiyahsolo.com",
    sourceUrl: "https://muhammadiyahsolo.com/20261018/ribuan-anggota-jemaah-hadiri-tabligh-akbar-hari-jadi-ke-68-ums-17939",
    title: "Ribuan Anggota Jemaah Hadiri Tabligh Akbar Hari Jadi ke-68 UMS",
    excerpt: "SOLO, MUHAMMADIYAHSOLO.COM - Universitas Muhammadiyah Surakarta (UMS) memperkuat komitmen dalam membangun generasi berlandaskan nilai-nilai Islam melalui Tablig Akbar dalam rangka Hari Jadi ke-68 UMS. Kegiatan yang menghadirkan Ustaz Das'ad Latif tersebut berlangsung di Gedung Edutorium KH Ahmad Dahlan UMS.",
    content: [
      "SOLO, MUHAMMADIYAHSOLO.COM - Universitas Muhammadiyah Surakarta (UMS) memperkuat komitmen dalam membangun generasi berlandaskan nilai-nilai Islam melalui Tablig Akbar dalam rangka Hari Jadi ke-68 UMS. Kegiatan yang menghadirkan Ustaz Das'ad Latif tersebut berlangsung di Gedung Edutorium KH Ahmad Dahlan UMS pada Ahad (18/10/2026).",
      "Ribuan jemaah dari berbagai elemen civitas akademika, warga persyarikatan se-Solo Raya, serta masyarakat umum memadati lokasi dengan penuh antusias mendengarkan tausiyah kebangsaan dan keagamaan yang mencerahkan."
    ],
    imageUrl: "https://muhammadiyahsolo.com/files/2026/10/1810-UMS-1.jpeg",
  },
  {
    id: "ums-43445",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "1 jam lalu",
    publishedAt: "2026-10-17T12:46:23+07:00",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/kabar-persyarikatan/smp-ump-purwokerto-gelar-pertukaran-pelajar-dengan-sekolah-jepang/",
    title: "SMP UMP Purwokerto Gelar Pertukaran Pelajar dengan Sekolah Jepang",
    excerpt: "ums.ac.id, SURAKARTA - SMP Unggulan Muhammadiyah Purwokerto terpilih mengikuti program pertukaran pelajar internasional bersama Nishinooka Junior High School dari Kota Muko, Prefektur Kyoto, Jepang, pada Jumat (16/10/2026). Program yang difasilitasi oleh Coding First ini melibatkan delapan siswa kelas VII dan VIII.",
    content: [
      "ums.ac.id, SURAKARTA - SMP Unggulan Muhammadiyah Purwokerto terpilih mengikuti program pertukaran pelajar internasional bersama Nishinooka Junior High School dari Kota Muko, Prefektur Kyoto, Jepang, pada Jumat (16/10/2026). Program yang difasilitasi oleh Coding First ini melibatkan delapan siswa kelas VII dan VIII.",
      "Program pertukaran ini membuka cakrawala global bagi para santri dan siswa untuk memperkenalkan budaya nusantara sekaligus mempelajari inovasi dan etos disiplin dari sekolah mitra di Jepang."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/SMP-UMP-Purwokerto-Gelar-Pertukaran-Pelajar-dengan-Sekolah-Jepang.jpg",
  },
  {
    id: "ums-43439",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "2 jam lalu",
    publishedAt: "2026-10-17T12:29:53+07:00",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/berita/perkuat-layanan-bahasa-ppb-umkt-pelajari-tata-kelola-lpmb-ums/",
    title: "Perkuat Layanan Bahasa, PPB UMKT Pelajari Tata Kelola LPMB UMS",
    excerpt: "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT) pada Rabu (14/10/2026). Momentum ini dimanfaatkan untuk memperkuat jejaring kebahasaan antarlembaga.",
    content: [
      "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT) pada Rabu (14/10/2026). Momentum ini dimanfaatkan untuk memperkuat jejaring kebahasaan antarlembaga sekaligus berbagi pengalaman dalam pengelolaan layanan bahasa di lingkungan perguruan tinggi.",
      "Kunjungan benchmarking ini menjadi wujud sinergi dan kolaborasi antar Perguruan Tinggi Muhammadiyah dan 'Aisyiyah (PTMA) dalam meningkatkan standarisasi mutu uji bahasa asing dan kemahiran akademik civitas kampus."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/Perkuat-Layanan-Bahasa-PPB-UMKT-Pelajari-Tata-Kelola-LPMB-UMS-2.jpg",
  },
  {
    id: "sm-init-1",
    source: "SUARA_MUHAMMADIYAH",
    badge: "SUARA MUHAMMADIYAH",
    badgeClass: "bg-[#800000] text-white",
    timeAgo: "1 jam lalu",
    publishedAt: "2026-10-17T08:00:00Z",
    sourceDomain: "suaramuhammadiyah.id",
    sourceUrl: "https://suaramuhammadiyah.id/read/seluruh-amal-usaha-muhammadiyah-harus-terus-naik-kelas-dan-jadi-center-of-excellence",
    title: "Seluruh Amal Usaha Muhammadiyah Harus Terus Naik Kelas dan Jadi Center of Excellence",
    excerpt: "suaramuhammadiyah.id, YOGYAKARTA — Seluruh Amal Usaha Muhammadiyah Harus Terus Naik Kelas dan Jadi Center of Excellence dalam memajukan peradaban umat dan bangsa.",
    content: [
      "suaramuhammadiyah.id, YOGYAKARTA — Pimpinan Pusat Muhammadiyah mengajak seluruh pengelola amal usaha persyarikatan di bidang pendidikan, kesehatan, dan sosial untuk terus menguatkan mutu layanan.",
      "AUM diharapkan tidak hanya unggul secara manajerial, melainkan menjadi pusat keteladanan yang memberikan kemaslahatan nyata bagi masyarakat."
    ],
    imageUrl: "https://cdn.suaramuhammadiyah.id/posts/2026/10/agus-taufiqurrahman-11-20261010181939.jpeg",
  },
  {
    id: "lensamu-init-1",
    source: "LENSAMU",
    badge: "LENSAMU",
    badgeClass: "bg-[#005A36] text-white",
    timeAgo: "3 jam lalu",
    publishedAt: "2026-10-17T06:00:00Z",
    sourceDomain: "lensamu.id",
    sourceUrl: "https://muhammadiyah.or.id/2026/10/haedar-nashir-pendidikan-kunci-membangun-persatuan-dan-peradaban-bangsa/",
    title: "Haedar Nashir: Pendidikan Kunci Membangun Persatuan dan Peradaban Bangsa",
    excerpt: "MUHAMMADIYAH.OR.ID, SIDOARJO – Ketua Umum Pimpinan Pusat (PP) Muhammadiyah, Haedar Nashir, menegaskan bahwa pendidikan merupakan kunci membangun kemajuan, persatuan, dan peradaban bangsa.",
    content: [
      "MUHAMMADIYAH.OR.ID, SIDOARJO – Ketua Umum Pimpinan Pusat (PP) Muhammadiyah, Haedar Nashir, menegaskan bahwa pendidikan merupakan kunci membangun kemajuan, persatuan, dan peradaban bangsa.",
      "Pendidikan merupakan ikhtiar jangka panjang untuk membangun sumber daya manusia yang berkarakter mulia dan berwawasan luas."
    ],
    imageUrl: "https://muhammadiyah.or.id/wp-content/uploads/2026/10/haedar-nashir-pendidikan-kunci-membangun-persatuan-dan-peradaban-bangsa.jpeg",
  },
];

export default function NewsSection() {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNewsData);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Mark client mounted for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedArticle]);

  // Handle escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedArticle(null);
      }
    };
    if (selectedArticle) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArticle]);

  // Defer Date.now() read into useEffect so it does NOT run during static prerender
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live articles from API route and direct UMS feed on mount and periodically every 5 minutes
  useEffect(() => {
    let isMounted = true;

    const fetchLiveNews = async () => {
      // 1. Ambil dari API route internal yang mengagregasi warta manual + 3 portal
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
            setNewsList(data.articles);
          }
        }
      } catch (err) {
        console.warn("API route fetch notice:", err);
      }

      // 2. Ambil langsung dari WordPress REST API UMS dari browser pengguna (mendukung CORS)
      // Ini memastikan warta kampus UMS selalu terupdate ke menit terakhir
      try {
        const umsRes = await fetch("https://news.ums.ac.id/id/wp-json/wp/v2/posts?_embed&per_page=6");
        if (umsRes.ok) {
          const umsData = await umsRes.json();
          if (Array.isArray(umsData) && umsData.length > 0 && isMounted) {
            const clientUmsArticles: NewsItem[] = umsData.map((p: any) => {
              const rawExcerpt = (p.excerpt?.rendered || "")
                .replace(/<[^>]+>/g, "")
                .replace(/\[&hellip;\]/g, "...")
                .replace(/&#8211;/g, "-")
                .replace(/&#8217;/g, "'")
                .trim();
              const imgUrl =
                p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                "/images/news/ums-pemilu.jpg";
              const pubDateIso = p.date_gmt
                ? `${p.date_gmt}Z`
                : p.date
                ? `${p.date}+07:00`
                : new Date().toISOString();

              const cleanTitle = (p.title?.rendered || "")
                .replace(/&amp;/g, "&")
                .replace(/&#8211;/g, "-")
                .replace(/&#8212;/g, "-")
                .replace(/&#8217;/g, "'")
                .replace(/&#8220;/g, '"')
                .replace(/&#8221;/g, '"')
                .replace(/<[^>]+>/g, "")
                .trim();

              return {
                id: `ums-${p.id}`,
                source: "UMS",
                badge: "UMS NEWS",
                badgeClass: "bg-[#003B73] text-white",
                timeAgo: formatClientTimeAgo(pubDateIso, "Baru saja", Date.now()),
                publishedAt: pubDateIso,
                sourceDomain: "news.ums.ac.id",
                sourceUrl: p.link,
                title: cleanTitle,
                excerpt: rawExcerpt.slice(0, 220) + (rawExcerpt.length > 220 ? "..." : ""),
                content: [
                  rawExcerpt,
                  "Informasi selengkapnya mengenai warta ini dapat dibaca langsung pada portal resmi Berita UMS melalui tautan rujukan resmi di bawah ini.",
                ],
                imageUrl: imgUrl,
              };
            });

            setNewsList((prev) => {
              const manualItems = prev.filter((item) => item.source === "MASJIDMU");
              const currentLive = prev.find((item) => item.id === tablighAkbarLiveItem.id) || tablighAkbarLiveItem;
              const nonUms = prev.filter(
                (item) => item.source !== "UMS" && item.source !== "MASJIDMU" && item.id !== tablighAkbarLiveItem.id
              );
              const filteredClient = clientUmsArticles.filter((item) => item.id !== tablighAkbarLiveItem.id);
              return [...manualItems, currentLive, ...filteredClient, ...nonUms];
            });
          }
        }
      } catch (clientErr) {
        console.warn("Direct browser UMS fetch notice:", clientErr);
      }

      // 3. Ambil langsung dari WordPress REST API Muhammadiyah Solo dari browser pengguna (mendukung CORS)
      try {
        const soloRes = await fetch("https://muhammadiyahsolo.com/wp-json/wp/v2/posts?_embed&per_page=6");
        if (soloRes.ok) {
          const soloData = await soloRes.json();
          if (Array.isArray(soloData) && soloData.length > 0 && isMounted) {
            const clientSoloArticles: NewsItem[] = soloData.map((p: any) => {
              const rawExcerpt = (p.excerpt?.rendered || "")
                .replace(/<[^>]+>/g, "")
                .replace(/\[&hellip;\]/g, "...")
                .replace(/&#8211;/g, "-")
                .replace(/&#8217;/g, "'")
                .trim();
              const imgUrl =
                p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                "/images/news/news-lensamu-1.jpg";
              const pubDateIso = p.date_gmt
                ? `${p.date_gmt}Z`
                : p.date
                ? `${p.date}+07:00`
                : new Date().toISOString();

              const cleanTitle = (p.title?.rendered || "")
                .replace(/&amp;/g, "&")
                .replace(/&#8211;/g, "-")
                .replace(/&#8212;/g, "-")
                .replace(/&#8217;/g, "'")
                .replace(/&#8220;/g, '"')
                .replace(/&#8221;/g, '"')
                .replace(/<[^>]+>/g, "")
                .trim();

              return {
                id: `solo-${p.id}`,
                source: "MUHAMMADIYAH_SOLO",
                badge: "MUHAMMADIYAH SOLO",
                badgeClass: "bg-[#1E5F3B] text-white",
                timeAgo: formatClientTimeAgo(pubDateIso, "Baru saja", Date.now()),
                publishedAt: pubDateIso,
                sourceDomain: "muhammadiyahsolo.com",
                sourceUrl: p.link,
                title: cleanTitle,
                excerpt: rawExcerpt.slice(0, 220) + (rawExcerpt.length > 220 ? "..." : ""),
                content: [
                  rawExcerpt,
                  "Warta resmi persyarikatan dan kegiatan civitas se-Solo Raya ini diliput langsung oleh portal Pimpinan Daerah Muhammadiyah Kota Surakarta.",
                ],
                imageUrl: imgUrl,
              };
            });

            setNewsList((prev) => {
              const manualItems = prev.filter((item) => item.source === "MASJIDMU");
              const currentLive = prev.find((item) => item.id === tablighAkbarLiveItem.id) || tablighAkbarLiveItem;
              const nonSolo = prev.filter(
                (item) => item.source !== "MUHAMMADIYAH_SOLO" && item.source !== "MASJIDMU" && item.id !== tablighAkbarLiveItem.id
              );
              const umsItems = nonSolo.filter((item) => item.source === "UMS");
              const otherItems = nonSolo.filter((item) => item.source !== "UMS");
              return [...manualItems, currentLive, ...umsItems, ...clientSoloArticles, ...otherItems];
            });
          }
        }
      } catch (clientSoloErr) {
        console.warn("Direct browser Solo fetch notice:", clientSoloErr);
      }

      // 4. Ambil langsung dari WordPress REST API LPCR-PM PP Muhammadiyah (lpcr.or.id)
      try {
        const lpcrRes = await fetch("https://lpcr.or.id/wp-json/wp/v2/posts?_embed&per_page=6");
        if (lpcrRes.ok) {
          const lpcrData = await lpcrRes.json();
          if (Array.isArray(lpcrData) && lpcrData.length > 0 && isMounted) {
            const clientLpcrArticles: NewsItem[] = lpcrData.map((p: any) => {
              const rawExcerpt = (p.excerpt?.rendered || "")
                .replace(/<[^>]+>/g, "")
                .replace(/\[&hellip;\]/g, "...")
                .replace(/&#8211;/g, "-")
                .replace(/&#8217;/g, "'")
                .trim();
              const imgUrl =
                p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
                "/images/logo/logo-lpcr.png";
              const pubDateIso = p.date_gmt
                ? `${p.date_gmt}Z`
                : p.date
                ? `${p.date}+07:00`
                : new Date().toISOString();

              const cleanTitle = (p.title?.rendered || "")
                .replace(/&amp;/g, "&")
                .replace(/&#8211;/g, "-")
                .replace(/&#8212;/g, "-")
                .replace(/&#8217;/g, "'")
                .replace(/&#8220;/g, '"')
                .replace(/&#8221;/g, '"')
                .replace(/<[^>]+>/g, "")
                .trim();

              return {
                id: `lpcr-${p.id}`,
                source: "LPCR",
                badge: "LPCR-PM",
                badgeClass: "bg-[#D97706] text-white",
                timeAgo: formatClientTimeAgo(pubDateIso, "Baru saja", Date.now()),
                publishedAt: pubDateIso,
                sourceDomain: "lpcr.or.id",
                sourceUrl: p.link,
                title: cleanTitle,
                excerpt: rawExcerpt.slice(0, 220) + (rawExcerpt.length > 220 ? "..." : ""),
                content: [
                  rawExcerpt,
                  "Informasi dan liputan program pembinaan masjid serta cabang-ranting ini disiarkan langsung oleh Lembaga Pengembangan Cabang Ranting dan Pembinaan Masjid (LPCR-PM) PP Muhammadiyah.",
                ],
                imageUrl: imgUrl,
              };
            });

            setNewsList((prev) => {
              const manualItems = prev.filter((item) => item.source === "MASJIDMU");
              const currentLive = prev.find((item) => item.id === tablighAkbarLiveItem.id) || tablighAkbarLiveItem;
              const nonLpcr = prev.filter(
                (item) => item.source !== "LPCR" && item.source !== "MASJIDMU" && item.id !== tablighAkbarLiveItem.id
              );
              const umsItems = nonLpcr.filter((item) => item.source === "UMS");
              const otherItems = nonLpcr.filter((item) => item.source !== "UMS");
              return [...manualItems, currentLive, ...umsItems, ...clientLpcrArticles, ...otherItems];
            });
          }
        }
      } catch (clientLpcrErr) {
        console.warn("Direct browser LPCR fetch notice:", clientLpcrErr);
      }
    };

    fetchLiveNews();
    const pollInterval = setInterval(fetchLiveNews, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveNews();
      }
    };
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", fetchLiveNews);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", fetchLiveNews);
    };
  }, []);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayNews = newsList;

  const checkScrollPosition = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const firstCard = container.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.offsetWidth || 380;
    const gap = 24;
    const scrollAmount = cardWidth + gap;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [checkScrollPosition, displayNews.length]);

  return (
    <section id="berita" className="py-12 sm:py-18 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading - Centered to match other sections */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
            Warta Kampus UMS &amp; <span className="text-[#003B73]">Kabar Persyarikatan</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Warta aktual civitas akademika UMS, kabar pembinaan masjid &amp; cabang-ranting LPCR-PM PP Muhammadiyah, liputan resmi persyarikatan Solo Raya, serta rilis berita Suara Muhammadiyah dan Lensamu.
          </p>
        </div>

        {/* News Cards Horizontal Slider */}
        {displayNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-xl mx-auto shadow-xs">
            <p className="text-stone-500 text-sm">Belum ada warta untuk kategori ini saat ini.</p>
          </div>
        ) : (
          <div className="relative group">
            {/* Floating Navigation Arrows (Desktop & Tablet) */}
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Geser warta sebelumnya"
              className="hidden sm:flex absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 hover:bg-white border border-stone-200 text-stone-700 hover:text-[#003B73] hover:border-[#003B73] shadow-lg disabled:opacity-0 disabled:pointer-events-none items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Geser warta berikutnya"
              className="hidden sm:flex absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#003B73] hover:bg-[#002855] text-white shadow-lg disabled:opacity-0 disabled:pointer-events-none items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {/* Scrollable Container with Snap & Touch Gesture */}
            <div
              ref={sliderRef}
              onScroll={checkScrollPosition}
              className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-4 pt-1 -mx-4 sm:mx-0 px-4 sm:px-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayNews.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedArticle(item)}
                  className={`w-[84vw] sm:w-[360px] md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] shrink-0 snap-start bg-white border ${
                    item.isLive ? "border-red-300 ring-2 ring-red-500/20 shadow-md" : "border-stone-200/90 shadow-xs"
                  } rounded-3xl overflow-hidden hover:shadow-xl hover:border-[#003B73]/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer`}
                >
                  <div>
                    {/* Thumbnail Image Container */}
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-900 group-hover:opacity-95 transition-opacity">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 84vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.isLive ? (
                        <>
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] sm:text-[11px] font-bold shadow-lg tracking-wider uppercase">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span>SIARAN LANGSUNG</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-xs group-hover:scale-110 group-hover:bg-red-600 transition-all">
                              <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                            </div>
                          </div>
                        </>
                      ) : item.youtubeId ? (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center shadow-lg backdrop-blur-xs group-hover:scale-110 group-hover:bg-[#003B73] transition-all">
                            <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6">
                      {/* Meta Row: Badge on Left, Time on Right */}
                      <div className="flex items-center justify-between mb-3.5">
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs ${item.badgeClass}`}
                        >
                          {item.badge}
                        </span>
                        <span
                          className={`${
                            item.isLive ? "text-red-600 font-bold" : "text-stone-400 font-normal"
                          } text-xs`}
                        >
                          {item.isLive ? item.timeAgo : formatClientTimeAgo(item.publishedAt, item.timeAgo, now)}
                        </span>
                      </div>

                      {/* News Title */}
                      <h3 className="text-stone-900 font-bold text-base sm:text-lg leading-snug line-clamp-2 mb-2.5 font-sans group-hover:text-[#003B73] transition-colors min-h-[3rem]">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3 min-h-[4rem]">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: BACA SELENGKAPNYA -> and Direct Source Link */}
                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArticle(item);
                      }}
                      className={`${
                        item.isLive
                          ? "text-red-600 group-hover:text-red-700"
                          : "text-stone-600 group-hover:text-[#003B73]"
                      } transition-colors text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 focus:outline-none cursor-pointer group/btn`}
                    >
                      <span>{item.isLive ? "TONTON SIARAN" : item.youtubeId ? "TONTON REKAMAN" : "BACA SELENGKAPNYA"}</span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 ${
                          item.isLive
                            ? "text-red-500 group-hover:text-red-700"
                            : "text-stone-400 group-hover:text-[#003B73]"
                        } group-hover/btn:translate-x-1 transition-all`}
                      />
                    </button>
                    {item.sourceUrl && item.sourceUrl !== "#" ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title={item.isLive ? "Buka YouTube di tab baru" : "Buka sumber resmi di tab baru"}
                        className={`p-1.5 rounded-full hover:bg-stone-100 ${
                          item.isLive
                            ? "text-red-500 hover:text-red-700"
                            : "text-stone-400 hover:text-[#003B73]"
                        } transition-colors`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile Navigation Arrows */}
            <div className="flex sm:hidden items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Geser warta sebelumnya"
                className="w-10 h-10 rounded-full bg-white border border-stone-300 text-stone-700 hover:text-[#003B73] shadow-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Geser warta berikutnya"
                className="w-10 h-10 rounded-full bg-[#003B73] text-white shadow-xs disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Article Detail Modal Dialog via React Portal */}
      {mounted && selectedArticle && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${selectedArticle.badgeClass}`}
                >
                  {selectedArticle.badge}
                </span>
                <span
                  className={`${
                    selectedArticle.isLive ? "text-red-600 font-bold" : "text-stone-500 font-normal"
                  } text-xs`}
                >
                  {selectedArticle.isLive
                    ? selectedArticle.timeAgo
                    : formatClientTimeAgo(selectedArticle.publishedAt, selectedArticle.timeAgo, now)}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              {/* Media Container: Responsive YouTube Player or Static Image */}
              {selectedArticle.youtubeId ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-stone-200">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedArticle.youtubeId}?autoplay=1&rel=0`}
                    title={selectedArticle.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-stone-100 shadow-inner">
                  <Image
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-sans leading-snug">
                {selectedArticle.title}
              </h2>

              {/* Paragraphs */}
              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed pt-2">
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Source Link */}
              <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded-xl">
                <div className="text-xs text-stone-600">
                  {selectedArticle.isLive ? (
                    <span>Siaran Resmi: <strong className="text-stone-900">YouTube Official UMS</strong></span>
                  ) : selectedArticle.source === "MASJIDMU" ? (
                    <span>Diterbitkan oleh: <strong className="text-stone-900">Takmir Masjid Hj. Sudalmiyah Rais</strong></span>
                  ) : selectedArticle.source === "LPCR" ? (
                    <span>Portal Resmi: <strong className="text-stone-900">LPCR-PM PP Muhammadiyah (lpcr.or.id)</strong></span>
                  ) : (
                    <span>Portal Resmi: <strong className="text-stone-900">{selectedArticle.sourceDomain}</strong></span>
                  )}
                </div>
                {selectedArticle.sourceUrl && selectedArticle.sourceUrl !== "#" ? (
                  <a
                    href={selectedArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-5 py-2.5 rounded-full ${
                      selectedArticle.isLive
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-[#003B73] hover:bg-[#002855] text-white"
                    } text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs`}
                  >
                    {selectedArticle.isLive ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Buka Siaran di YouTube</span>
                      </>
                    ) : selectedArticle.youtubeId ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Tonton di YouTube</span>
                      </>
                    ) : (
                      <span>Kunjungi Sumber Resmi</span>
                    )}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-[#003B73]">
                    Dokumentasi &amp; Warta Resmi Masjid
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
