import { NextResponse } from "next/server";
import { getDbAsync } from "@/lib/db";

// Seluruh permintaan pengunjung dilayani cepat dengan cache memori dan Edge CDN Vercel
// TANPA memicu eksekusi Serverless Function berulang yang menghabiskan kuota CPU/GB-hours.

export interface ApiNewsItem {
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

// Rekaman Tabligh Akbar Hari Jadi ke-68 UMS (Disimpan statis tanpa ping jaringan ke YouTube)
export const tablighAkbarLiveArticle: ApiNewsItem = {
  id: "ums-live-tabligh-akbar-68",
  source: "UMS",
  badge: "REKAMAN KAJIAN",
  badgeClass: "bg-[#003B73] text-white",
  timeAgo: "Siaran Ulang",
  publishedAt: "2026-10-18T08:30:00+07:00",
  sourceDomain: "youtube.com",
  sourceUrl: "https://www.youtube.com/live/KVGneiEldgo",
  title: "Tabligh Akbar Harijadi ke-68 UMS bersama Ustadz Dr. H. Das'ad Latif",
  excerpt: "ums.ac.id, SURAKARTA - Siaran dan rekaman Tabligh Akbar dalam rangka peringatan Hari Jadi (Milad) ke-68 Universitas Muhammadiyah Surakarta menghadirkan mubaligh nasional Ustadz Dr. H. Das'ad Latif, S.Sos., S.Ag., M.Si., Ph.D. langsung dari Gedung Edutorium KH Ahmad Dahlan UMS.",
  content: [
    "SURAKARTA - Menyemarakkan peringatan Hari Jadi ke-68 Universitas Muhammadiyah Surakarta (UMS), Lembaga Pengembangan Pondok, Al-Islam dan Kemuhammadiyahan (LPPIK) UMS menggelar Tabligh Akbar bertempat di Gedung Edutorium KH Ahmad Dahlan UMS.",
    "Tabligh Akbar ini menghadirkan dai kondang nasional Ustadz Dr. H. Das'ad Latif, S.Sos., S.Ag., M.Si., Ph.D. dengan mengusung tema 'Meneguhkan Sinergi, Menebar Kebermanfaatan dan Menguatkan Peradaban'. Majelis ilmu ini dihadiri ribuan jamaah sivitas akademika UMS, warga persyarikatan se-Solo Raya, serta masyarakat luas.",
    "Bagi segenap jamaah dan warga persyarikatan yang berhalangan hadir langsung di Edutorium, siaran dan rekaman lengkap pengajian dapat disaksikan secara daring melalui kanal siaran resmi."
  ],
  imageUrl: "/images/news/tabligh-akbar-poster.jpg",
  isLive: false,
  youtubeId: "KVGneiEldgo",
};

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\?\?/g, "'")
    .replace(/\uFFFD/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&#8230;/g, "...")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\[&hellip;\]/g, "...")
    .replace(/\[\.\.\.\]/g, "...")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function calculateTimeAgo(dateString: string): string {
  try {
    const pubDate = new Date(dateString);
    if (isNaN(pubDate.getTime())) return "Baru saja";
    const now = Date.now();
    const diffMs = now - pubDate.getTime();

    if (diffMs < 0 && diffMs > -60000) {
      return "Baru saja";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes === 1) return "1 menit lalu";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 1) return "1 jam lalu";
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 hari lalu";
    if (diffDays < 7) return `${diffDays} hari lalu`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} minggu lalu`;

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} bulan lalu`;

    return `${Math.floor(diffDays / 365)} tahun lalu`;
  } catch {
    return "Baru saja";
  }
}

// Koleksi artikel terverifikasi dan aman sebagai basis statis berkecepatan tinggi
const fallbackArticles: ApiNewsItem[] = [
  tablighAkbarLiveArticle,
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
    excerpt: "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas pada Kamis-Jumat. Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan.",
    content: [
      "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas. Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan, mengevaluasi hasil latihan tahunan, serta membangun karakter dan kedisiplinan peserta didik di alam terbuka.",
      "Sebanyak 71 peserta tersebut mengikuti serangkaian uji kecakapan fisik, ketangkasan berkemah, serta pemahaman nilai-nilai kepanduan Hizbul Wathan yang berjiwa mandiri dan berakhlak mulia."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/71-Siswa-SMP-UMP-Ikuti-Uji-SKT-Pandu-Hizbul-Wathan-di-Alam-Terbuka-2.jpg",
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
    excerpt: "ums.ac.id, SURAKARTA - SMP Unggulan Muhammadiyah Purwokerto terpilih mengikuti program pertukaran pelajar internasional bersama Nishinooka Junior High School dari Kota Muko, Prefektur Kyoto, Jepang.",
    content: [
      "ums.ac.id, SURAKARTA - SMP Unggulan Muhammadiyah Purwokerto terpilih mengikuti program pertukaran pelajar internasional bersama Nishinooka Junior High School dari Kota Muko, Prefektur Kyoto, Jepang. Program ini melibatkan delapan siswa kelas VII dan VIII.",
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
    excerpt: "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT).",
    content: [
      "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT). Momentum ini dimanfaatkan untuk memperkuat jejaring kebahasaan antarlembaga sekaligus berbagi pengalaman dalam pengelolaan layanan bahasa di lingkungan perguruan tinggi.",
      "Kunjungan benchmarking ini menjadi wujud sinergi dan kolaborasi antar Perguruan Tinggi Muhammadiyah dan 'Aisyiyah (PTMA) dalam meningkatkan standarisasi mutu uji bahasa asing dan kemahiran akademik civitas kampus."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/Perkuat-Layanan-Bahasa-PPB-UMKT-Pelajari-Tata-Kelola-LPMB-UMS-2.jpg",
  },
  {
    id: "lpcr-13692",
    source: "LPCR",
    badge: "LPCR-PM",
    badgeClass: "bg-[#D97706] text-white",
    timeAgo: "Baru saja",
    publishedAt: "2026-10-18T10:00:00+07:00",
    sourceDomain: "lpcr.or.id",
    sourceUrl: "https://lpcr.or.id/prm-jepara-gelar-pengajian-lesehan-rutin-dakwah-inklusif-ukhuwah-dan-kepedulian-sosial/",
    title: "PRM Jepara Gelar Pengajian Lesehan Rutin: Dakwah Inklusif, Ukhuwah, dan Kepedulian Sosial",
    excerpt: "lpcr.or.id, JEPARA — PRM Jepara menggelar pengajian lesehan rutin sebagai wujud dakwah inklusif dan penguatan ukhuwah serta kepedulian sosial di akar rumput persyarikatan.",
    content: [
      "lpcr.or.id, JEPARA — PRM Jepara menggelar pengajian lesehan rutin sebagai wujud dakwah inklusif dan penguatan ukhuwah serta kepedulian sosial di akar rumput persyarikatan.",
      "Lembaga Pengembangan Cabang Ranting dan Pembinaan Masjid (LPCR-PM) PP Muhammadiyah terus mendorong akselerasi cabang, ranting, dan masjid unggulan di seluruh Indonesia sebagai pilar kemajuan dakwah umat.",
    ],
    imageUrl: "https://lpcr.or.id/wp-content/uploads/2026/10/prm-jepara-unggulan-Pengajian-Lesehan.webp",
  },
  {
    id: "lpcr-13688",
    source: "LPCR",
    badge: "LPCR-PM",
    badgeClass: "bg-[#D97706] text-white",
    timeAgo: "2 jam lalu",
    publishedAt: "2026-10-18T08:30:00+07:00",
    sourceDomain: "lpcr.or.id",
    sourceUrl: "https://lpcr.or.id/prm-jepara-kembangkan-dakwah-amal-usaha-dan-pemberdayaan-ekonomi-umat/",
    title: "PRM Jepara Kembangkan Dakwah, Amal Usaha, dan Pemberdayaan Ekonomi Umat",
    excerpt: "lpcr.or.id, JEPARA — Pimpinan Ranting Muhammadiyah (PRM) Jepara menggerakkan kemandirian persyarikatan melalui integrasi dakwah jamaah, optimalisasi AUM, dan pemberdayaan ekonomi umat.",
    content: [
      "lpcr.or.id, JEPARA — Pimpinan Ranting Muhammadiyah (PRM) Jepara menggerakkan kemandirian persyarikatan melalui integrasi dakwah jamaah, optimalisasi AUM, dan pemberdayaan ekonomi umat.",
      "Melalui pendampingan LPCR-PM PP Muhammadiyah, pengelolaan masjid dan ranting diarahkan menjadi sentra pembinaan spiritual dan kemandirian finansial berbasis jamaah.",
    ],
    imageUrl: "https://lpcr.or.id/wp-content/uploads/2026/10/PRM-Jepara-Unggulan-Ekonomi-Umat.webp",
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
    excerpt: "SOLO, MUHAMMADIYAHSOLO.COM - Universitas Muhammadiyah Surakarta (UMS) memperkuat komitmen dalam membangun generasi berlandaskan nilai-nilai Islam melalui Tablig Akbar dalam rangka Hari Jadi ke-68 UMS.",
    content: [
      "SOLO, MUHAMMADIYAHSOLO.COM - Universitas Muhammadiyah Surakarta (UMS) memperkuat komitmen dalam membangun generasi berlandaskan nilai-nilai Islam melalui Tablig Akbar dalam rangka Hari Jadi ke-68 UMS. Kegiatan yang menghadirkan Ustaz Das'ad Latif tersebut berlangsung di Gedung Edutorium KH Ahmad Dahlan UMS.",
      "Ribuan jemaah dari berbagai elemen civitas akademika, warga persyarikatan se-Solo Raya, serta masyarakat umum memadati lokasi dengan penuh antusias mendengarkan tausiyah kebangsaan dan keagamaan yang mencerahkan."
    ],
    imageUrl: "https://muhammadiyahsolo.com/files/2026/10/1810-UMS-1.jpeg",
  },
  {
    id: "sm-fallback-1",
    source: "SUARA_MUHAMMADIYAH",
    badge: "SUARA MUHAMMADIYAH",
    badgeClass: "bg-[#800000] text-white",
    timeAgo: "1 jam lalu",
    publishedAt: "2026-10-17T08:00:00Z",
    sourceDomain: "suaramuhammadiyah.id",
    sourceUrl: "https://suaramuhammadiyah.id/read/seluruh-amal-usaha-muhammadiyah-harus-terus-naik-kelas-dan-jadi-center-of-excellence",
    title: "Seluruh Amal Usaha Muhammadiyah Harus Terus Naik Kelas dan Jadi Center of Excellence",
    excerpt: "suaramuhammadiyah.id, YOGYAKARTA — Seluruh Amal Usaha Muhammadiyah (AUM) di seluruh penjuru negeri didorong untuk terus meningkatkan mutu dan menjadi rujukan keunggulan peradaban bangsa.",
    content: [
      "Pimpinan Pusat Muhammadiyah menegaskan pentingnya konsolidasi dan akselerasi keunggulan amal usaha persyarikatan dalam menghadapi tantangan zaman yang kian dinamis.",
      "Setiap institusi pendidikan dan kesehatan Muhammadiyah diharapkan menjadi pusat keunggulan yang tidak hanya mandiri secara tata kelola, tetapi juga melahirkan kemanfaatan nyata yang dirasakan luas oleh umat dan bangsa."
    ],
    imageUrl: "https://cdn.suaramuhammadiyah.id/posts/2026/10/agus-taufiqurrahman-11-20261010181939.jpeg",
  },
  {
    id: "lensamu-fallback-1",
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
      "Ketua Umum Pimpinan Pusat (PP) Muhammadiyah, Haedar Nashir, menegaskan bahwa pendidikan merupakan kunci membangun kemajuan, persatuan, dan peradaban bangsa.",
      "Pendidikan merupakan ikhtiar jangka panjang untuk membangun sumber daya manusia yang berakhlak mulia, cerdas, berdaya saing, dan berjiwa pencerah bagi kemajuan persyarikatan dan tanah air."
    ],
    imageUrl: "https://muhammadiyah.or.id/wp-content/uploads/2026/10/haedar-nashir-pendidikan-kunci-membangun-persatuan-dan-peradaban-bangsa.jpeg",
  },
];

// Fetcher cepat UMS (maksimal 2.5 detik timeout)
async function fetchUmsNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];
  try {
    const res = await fetch("https://news.ums.ac.id/id/wp-json/wp/v2/posts?_embed&per_page=6", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((p) => {
          const rawExcerpt = p.excerpt?.rendered || "";
          const imgUrl =
            p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/news/ums-pemilu.jpg";
          const pubDateIso = p.date_gmt
            ? `${p.date_gmt}Z`
            : p.date
            ? `${p.date}+07:00`
            : new Date().toISOString();

          items.push({
            id: `ums-${p.id}`,
            source: "UMS",
            badge: "UMS NEWS",
            badgeClass: "bg-[#003B73] text-white",
            timeAgo: calculateTimeAgo(pubDateIso),
            publishedAt: pubDateIso,
            sourceDomain: "news.ums.ac.id",
            sourceUrl: p.link,
            title: decodeHtmlEntities(p.title?.rendered || ""),
            excerpt: decodeHtmlEntities(rawExcerpt),
            content: [
              decodeHtmlEntities(rawExcerpt),
              "Informasi selengkapnya dan ulasan mendalam mengenai warta ini dapat dibaca langsung pada portal resmi Berita UMS melalui tautan rujukan resmi di bawah ini.",
            ],
            imageUrl: imgUrl,
          });
        });

        if (items.length > 0) return items;
      }
    }
  } catch {
    // Jika timeout atau offline, segera gunakan fallback tanpa blocking
  }

  return fallbackArticles.filter((a) => a.source === "UMS");
}

// Fetcher cepat LPCR (maksimal 2.5 detik timeout)
async function fetchLpcrNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];
  try {
    const res = await fetch("https://lpcr.or.id/wp-json/wp/v2/posts?_embed&per_page=4", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((p) => {
          const rawExcerpt = p.excerpt?.rendered || "";
          const imgUrl =
            p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/logo/logo-lpcr.png";
          const pubDateIso = p.date_gmt
            ? `${p.date_gmt}Z`
            : p.date
            ? `${p.date}+07:00`
            : new Date().toISOString();

          items.push({
            id: `lpcr-${p.id}`,
            source: "LPCR",
            badge: "LPCR-PM",
            badgeClass: "bg-[#D97706] text-white",
            timeAgo: calculateTimeAgo(pubDateIso),
            publishedAt: pubDateIso,
            sourceDomain: "lpcr.or.id",
            sourceUrl: p.link,
            title: decodeHtmlEntities(p.title?.rendered || ""),
            excerpt: decodeHtmlEntities(rawExcerpt),
            content: [
              decodeHtmlEntities(rawExcerpt),
              "Informasi dan liputan program pembinaan masjid serta cabang-ranting ini disiarkan langsung oleh Lembaga Pengembangan Cabang Ranting dan Pembinaan Masjid (LPCR-PM) PP Muhammadiyah.",
            ],
            imageUrl: imgUrl,
          });
        });

        if (items.length > 0) return items;
      }
    }
  } catch {
    // Fallback instan
  }

  return fallbackArticles.filter((a) => a.source === "LPCR");
}

// Fetcher cepat Muhammadiyah Solo (maksimal 2.5 detik timeout)
async function fetchMuhammadiyahSoloNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];
  try {
    const res = await fetch("https://muhammadiyahsolo.com/wp-json/wp/v2/posts?_embed&per_page=4", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((p) => {
          const rawExcerpt = p.excerpt?.rendered || "";
          const imgUrl =
            p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "/images/news/news-lensamu-1.jpg";
          const pubDateIso = p.date_gmt
            ? `${p.date_gmt}Z`
            : p.date
            ? `${p.date}+07:00`
            : new Date().toISOString();

          items.push({
            id: `solo-${p.id}`,
            source: "MUHAMMADIYAH_SOLO",
            badge: "MUHAMMADIYAH SOLO",
            badgeClass: "bg-[#1E5F3B] text-white",
            timeAgo: calculateTimeAgo(pubDateIso),
            publishedAt: pubDateIso,
            sourceDomain: "muhammadiyahsolo.com",
            sourceUrl: p.link,
            title: decodeHtmlEntities(p.title?.rendered || ""),
            excerpt: decodeHtmlEntities(rawExcerpt),
            content: [
              decodeHtmlEntities(rawExcerpt),
              "Warta resmi persyarikatan dan kegiatan civitas se-Solo Raya ini diliput langsung oleh portal Pimpinan Daerah Muhammadiyah Kota Surakarta.",
            ],
            imageUrl: imgUrl,
          });
        });

        if (items.length > 0) return items;
      }
    }
  } catch {
    // Fallback instan
  }

  return fallbackArticles.filter((a) => a.source === "MUHAMMADIYAH_SOLO");
}

// In-Memory Cache untuk memangkas respon berulang
interface NewsMemoryCache {
  data: {
    success: boolean;
    updatedAt: string;
    articles: ApiNewsItem[];
  };
  cachedAt: number;
}

let newsMemoryCache: NewsMemoryCache | null = null;
const NEWS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 menit

export function invalidateNewsCache() {
  newsMemoryCache = null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isForceRefresh = url.searchParams.get("refresh") === "1";
  const now = Date.now();

  // Jika cache memori masih valid dan tidak dipaksa refresh, langsung kembalikan dalam 0.1ms tanpa fetch eksternal
  if (!isForceRefresh && newsMemoryCache && now - newsMemoryCache.cachedAt < NEWS_CACHE_TTL_MS) {
    return NextResponse.json(newsMemoryCache.data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "Vercel-CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        "X-News-Cache": "HIT",
      },
    });
  }

  // Ambil berita manual dari basis data lokal Takmir dan sumber resmi secara paralel
  const [db, umsArticles, lpcrArticles, soloArticles] = await Promise.all([
    getDbAsync(),
    fetchUmsNews(),
    fetchLpcrNews(),
    fetchMuhammadiyahSoloNews(),
  ]);

  // Berita Manual Warta Masjid (dikelola melalui panel admin)
  const manualArticles: ApiNewsItem[] = (db.manualNews || [])
    .filter((n) => n.isPublished !== false)
    .map((item) => ({
      id: item.id,
      source: "MASJIDMU",
      badge: item.badge || "WARTA MASJID",
      badgeClass: item.badgeClass || "bg-[#003B73] text-white",
      timeAgo: calculateTimeAgo(item.publishedAt),
      publishedAt: item.publishedAt,
      sourceDomain: item.sourceDomain || "masjid.ums.ac.id",
      sourceUrl: item.sourceUrl || "#",
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      imageUrl: item.imageUrl,
    }));

  const smArticles = fallbackArticles.filter((a) => a.source === "SUARA_MUHAMMADIYAH");
  const lensamuArticles = fallbackArticles.filter((a) => a.source === "LENSAMU");

  // Urutan prioritas:
  // 1. Warta / Berita Manual Masjid (dibuat pertama sebelum warta lain)
  // 2. Rekaman Tabligh Akbar
  // 3. Berita Kampus UMS & LPCR-PM PP Muhammadiyah
  // 4. Liputan Solo (muhammadiyahsolo.com)
  // 5. Suara Muhammadiyah & Lensamu
  const officialArticles = [
    ...manualArticles,
    tablighAkbarLiveArticle,
    ...umsArticles.filter((a) => a.id !== tablighAkbarLiveArticle.id),
    ...lpcrArticles,
    ...soloArticles,
    ...smArticles,
    ...lensamuArticles,
  ];

  const payload = {
    success: true,
    updatedAt: new Date().toISOString(),
    articles: officialArticles,
  };

  // Simpan ke cache memori
  newsMemoryCache = {
    data: payload,
    cachedAt: now,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      "CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      "X-News-Cache": "MISS",
    },
  });
}
