"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface NewsItem {
  id: string;
  source: "UMS" | "SUARA_MUHAMMADIYAH" | "LENSAMU";
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

const initialNewsData: NewsItem[] = [
  {
    id: "ums-1",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "2 jam lalu",
    publishedAt: "2026-10-11T07:00:00Z",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/berita/dosen-ums-bahas-desain-ideal-sistem-pemilu-untuk-perkuat-kualitas-demokrasi/",
    title: "Dosen UMS Bahas Desain Ideal Sistem Pemilu untuk Perkuat Kualitas Demokrasi",
    excerpt: "ums.ac.id, SURAKARTA – Desain sistem pemilihan umum (pemilu) berperan penting dalam menentukan kualitas demokrasi, keterwakilan politik, dan efektivitas pemerintahan.... Karena itu, pembaruan siste",
    content: [
      "ums.ac.id, SURAKARTA – Desain sistem pemilihan umum (pemilu) berperan penting dalam menentukan kualitas demokrasi, keterwakilan politik, dan efektivitas pemerintahan. Karena itu, pembaruan sistem pemilu perlu mempertimbangkan keadilan representasi, stabilitas politik, serta perlindungan hak konstitusional warga negara.",
      "Hal tersebut menjadi salah satu pokok bahasan yang disampaikan Muhammad RM Fayasy Failaq, S.H., M.H., dari Fakultas Hukum dan Ilmu Politik (FHIP) Universitas Muhammadiyah Surakarta (UMS) dalam Seminar Konstitusi yang diselenggarakan Komunitas Pemerhati Konstitusi (KPK), Fakultas Syariah dan Hukum UIN Sunan Kalijaga Yogyakarta.",
      "Tiga variabel utama dalam desain sistem pemilu yakni rumusan pemilu, struktur pemungutan suara yang mengatur teknis surat suara, serta besaran daerah pemilihan berdasarkan jumlah kursi yang diperebutkan."
    ],
    imageUrl: "/images/news/ums-pemilu.jpg",
  },
  {
    id: "ums-2",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "5 jam lalu",
    publishedAt: "2026-10-11T04:00:00Z",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/berita/health-innovation-hackathon-2026-ums-buka-peluang-bagi-peserta-multidisiplin/",
    title: "Health Innovation Hackathon 2026, UMS Buka Peluang bagi Peserta Multidisiplin",
    excerpt: "ums.ac.id, SURAKARTA – Universitas Muhammadiyah Surakarta (UMS) untuk pertama kalinya menjadi penyelenggara program Hackathon 2026 yang diluncurkan Kementerian... Pendidikan Tinggi, Sains, dan Tek",
    content: [
      "ums.ac.id, SURAKARTA – Universitas Muhammadiyah Surakarta (UMS) untuk pertama kalinya menjadi penyelenggara program Hackathon 2026 yang diluncurkan Kementerian Pendidikan Tinggi, Sains, dan Teknologi (Kemdiktisaintek). Melalui program bertajuk Health Innovation Hackathon 2026, UMS mendorong pengembangan solusi inovatif berbasis teknologi untuk menjawab permasalahan nyata di bidang kesehatan, obat, dan industri.",
      "Ketua Tim Task Force Program Hackathon 2026 UMS, Prof. Dr. Ir. Suranto, S.T., M.M., M.Si., IPU., menjelaskan bahwa program tersebut terbuka bagi masyarakat dari berbagai latar belakang keahlian, mencakup dosen, mahasiswa, praktisi, dan profesional lintas ilmu."
    ],
    imageUrl: "/images/news/ums-hackathon.jpg",
  },
  {
    id: "ums-3",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "8 jam lalu",
    publishedAt: "2026-10-11T01:00:00Z",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/berita/belajar-toga-secara-langsung-siswa-mim-tawangsari-antusias-praktek-membuat-minuman-bunga-telang/",
    title: "Belajar TOGA secara Langsung, Siswa MIM Tawangsari Antusias Praktek Membuat Minuman Bunga Telang",
    excerpt: "ums.ac.id, SURAKARTA — Mengenalkan manfaat tanaman obat keluarga (TOGA) kepada anak usia sekolah dapat dilakukan melalui pembelajaran yang menyenangkan dan praktik secara...",
    content: [
      "ums.ac.id, SURAKARTA — Mengenalkan manfaat tanaman obat keluarga (TOGA) kepada anak usia sekolah dapat dilakukan melalui pembelajaran yang menyenangkan dan praktik secara langsung. Pendekatan tersebut diterapkan dalam kegiatan Pengabdian kepada Masyarakat (PkM) di Madrasah Ibtidaiyah Muhammadiyah (MIM) Tawangsari, Teras, Boyolali.",
      "Kegiatan yang dipimpin oleh Ir. Dinda Safitri, S.T., M.Eng., Asisten Ahli Program Studi Teknik Industri, Fakultas Teknik (FT) UMS ini bertujuan mengedukasi anak-anak tentang ragam tanaman herbal pekarangan serta khasiatnya bagi imunitas tubuh."
    ],
    imageUrl: "/images/news/ums-toga.jpg",
  },
  {
    id: "sm-init-1",
    source: "SUARA_MUHAMMADIYAH",
    badge: "SUARA MUHAMMADIYAH",
    badgeClass: "bg-[#800000] text-white",
    timeAgo: "1 jam lalu",
    publishedAt: "2026-10-11T08:00:00Z",
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
    publishedAt: "2026-10-11T06:00:00Z",
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
  const [activeSource, setActiveSource] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [now, setNow] = useState<number | null>(null);

  // Defer Date.now() read into useEffect so it does NOT run during static prerender
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live articles from API route on mount and periodically every 5 minutes
  useEffect(() => {
    let isMounted = true;
    const fetchLiveNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setNewsList(data.articles);
        }
      } catch (err) {
        console.error("Gagal memperbarui warta otomatis:", err);
      }
    };

    fetchLiveNews();
    const pollInterval = setInterval(fetchLiveNews, 300000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setNewsList(data.articles);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sources = [
    { id: "ALL", label: "Semua Warta" },
    { id: "UMS", label: "UMS News" },
    { id: "SUARA_MUHAMMADIYAH", label: "Suara Muhammadiyah" },
    { id: "LENSAMU", label: "Lensamu" },
  ];

  const filteredNews =
    activeSource === "ALL"
      ? newsList
      : newsList.filter((item) => item.source === activeSource);

  return (
    <section id="berita" className="py-12 sm:py-18 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Kabar Persyarikatan & <span className="text-[#0D5C58]">Warta Kampus</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Warta aktual terintegrasi langsung dari portal resmi Berita UMS, Suara Muhammadiyah, dan Lensamu.
          </p>
        </div>

        {/* Source Filter Tabs & Auto-Refresh Indicator (Flex-wrap responsif tanpa scrollbar) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start w-full sm:w-auto">
            {sources.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSource(s.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeSource === s.id
                    ? "bg-[#0D5C58] text-white shadow-md shadow-[#0D5C58]/20"
                    : "bg-white text-stone-600 border border-stone-200 hover:text-stone-900 hover:bg-stone-100/70 shadow-2xs"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Text-only manual sync trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-stone-200 text-stone-600 hover:text-[#0D5C58] hover:border-[#0D5C58]/30 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {isRefreshing ? "Memperbarui Warta..." : "Segarkan Warta"}
            </button>
          </div>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Image Container */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6">
                  {/* Meta Row: Badge on Left, Time on Right */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${item.badgeClass}`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-stone-400 text-xs font-normal">
                      {formatClientTimeAgo(item.publishedAt, item.timeAgo, now)}
                    </span>
                  </div>

                  {/* News Title */}
                  <h3 className="text-stone-900 font-bold text-base sm:text-lg leading-snug line-clamp-2 mb-2.5 font-sans group-hover:text-[#0D5C58] transition-colors">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer: BACA SELENGKAPNYA -> */}
              <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100">
                <button
                  onClick={() => setSelectedArticle(item)}
                  className="text-stone-500 hover:text-[#0D5C58] transition-colors text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 focus:outline-none"
                >
                  <span>BACA SELENGKAPNYA</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Detail Modal Dialog */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-stone-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${selectedArticle.badgeClass}`}
                >
                  {selectedArticle.badge}
                </span>
                <span className="text-xs text-stone-500">
                  {formatClientTimeAgo(selectedArticle.publishedAt, selectedArticle.timeAgo, now)}
                </span>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              {/* Image */}
              <div className="relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-stone-100 shadow-inner">
                <Image
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

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
                  Portal Resmi: <strong className="text-stone-900">{selectedArticle.sourceDomain}</strong>
                </div>
                <a
                  href={selectedArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-[#0D5C58] hover:bg-[#0A4D4A] text-white text-xs font-bold text-center transition-colors"
                >
                  Kunjungi Sumber Resmi
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
