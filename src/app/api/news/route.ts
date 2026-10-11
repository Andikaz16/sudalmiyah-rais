import { NextResponse } from "next/server";

export interface ApiNewsItem {
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
    return "Baru saja";
  }
}

// Fallback articles in case any external site is down or slow
const fallbackArticles: ApiNewsItem[] = [
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
      "Ketua Tim Task Force Program Hackathon 2026 UMS, Prof. Dr. Ir. Suranto, S.T., M.M., M.Si., IPU., menjelaskan bahwa program tersebut terbuka bagi masyarakat dari berbagai latar belakang keahlian (multidisiplin)."
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
      "Kegiatan yang dipimpin oleh Ir. Dinda Safitri, S.T., M.Eng., Asisten Ahli Program Studi Teknik Industri, Fakultas Teknik (FT) UMS ini bertujuan mengenalkan berbagai jenis tanaman obat keluarga serta khasiatnya bagi imunitas tubuh."
    ],
    imageUrl: "/images/news/ums-toga.jpg",
  },
  {
    id: "sm-fallback-1",
    source: "SUARA_MUHAMMADIYAH",
    badge: "SUARA MUHAMMADIYAH",
    badgeClass: "bg-[#800000] text-white",
    timeAgo: "1 jam lalu",
    publishedAt: "2026-10-11T08:00:00Z",
    sourceDomain: "suaramuhammadiyah.id",
    sourceUrl: "https://suaramuhammadiyah.id/read/seluruh-amal-usaha-muhammadiyah-harus-terus-naik-kelas-dan-jadi-center-of-excellence",
    title: "Seluruh Amal Usaha Muhammadiyah Harus Terus Naik Kelas dan Jadi Center of Excellence",
    excerpt: "suaramuhammadiyah.id, YOGYAKARTA — Seluruh Amal Usaha Muhammadiyah (AUM) di seluruh penjuru negeri didorong untuk terus meningkatkan mutu dan menjadi rujukan keunggulan peradaban bangsa.",
    content: [
      "Pimpinan Pusat Muhammadiyah menegaskan pentingnya konsolidasi dan akselerasi keunggulan amal usaha persyarikatan dalam menghadapi tantangan zaman yang kian dinamis.",
      "Setiap institusi pendidikan dan kesehatan Muhammadiyah diharapkan menjadi pusat keunggulan yang tidak hanya mandiri secara tata kelola, tetapi juga melahirkan kemanfaatan nyata yang dirasakan luas oleh umat dan bangsa."
    ],
    imageUrl: "/images/news/news-sm-1.jpg",
  },
  {
    id: "lensamu-fallback-1",
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
      "Ketua Umum Pimpinan Pusat (PP) Muhammadiyah, Haedar Nashir, menegaskan bahwa pendidikan merupakan kunci membangun kemajuan, persatuan, dan peradaban bangsa.",
      "Pendidikan merupakan ikhtiar jangka panjang untuk membangun sumber daya manusia yang berakhlak mulia, cerdas, berdaya saing, dan berjiwa pencerah bagi kemajuan persyarikatan dan tanah air."
    ],
    imageUrl: "/images/news/news-lensamu-1.jpg",
  },
];

export async function GET() {
  const articles: ApiNewsItem[] = [];

  // 1. Fetch UMS News
  try {
    const resUms = await fetch("https://news.ums.ac.id/id/wp-json/wp/v2/posts?_embed&per_page=3", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (resUms.ok) {
      const data = await resUms.json();
      if (Array.isArray(data)) {
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

          articles.push({
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
      }
    }
  } catch (err) {
    console.error("Error fetching UMS news:", err);
  }

  // 2. Fetch Lensamu (Muhammadiyah.or.id)
  try {
    const resMu = await fetch("https://muhammadiyah.or.id/wp-json/wp/v2/posts?_embed&per_page=3", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (resMu.ok) {
      const data = await resMu.json();
      if (Array.isArray(data)) {
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

          articles.push({
            id: `lensamu-${p.id}`,
            source: "LENSAMU",
            badge: "LENSAMU",
            badgeClass: "bg-[#005A36] text-white",
            timeAgo: calculateTimeAgo(pubDateIso),
            publishedAt: pubDateIso,
            sourceDomain: "lensamu.id",
            sourceUrl: p.link,
            title: decodeHtmlEntities(p.title?.rendered || ""),
            excerpt: decodeHtmlEntities(rawExcerpt),
            content: [
              decodeHtmlEntities(rawExcerpt),
              "Liputan resmi dan syiar Islam berkemajuan ini disiarkan secara terpadu melalui kanal informasi Pimpinan Pusat Muhammadiyah.",
            ],
            imageUrl: imgUrl,
          });
        });
      }
    }
  } catch (err) {
    console.error("Error fetching Lensamu news:", err);
  }

  // 3. Fetch Suara Muhammadiyah
  try {
    const resSm = await fetch("https://suaramuhammadiyah.id", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (resSm.ok) {
      const html = await resSm.text();
      const cardRegex = /<img[^>]+src="([^"]+)"[^>]*class="[^"]*w-100[^"]*"[\s\S]*?<a[^>]+href="(\/read\/[^"]+)"[^>]*>[\s\S]*?<h5>([\s\S]*?)<\/h5>/g;
      let m;
      let count = 0;
      while ((m = cardRegex.exec(html)) !== null && count < 3) {
        const rawTitle = decodeHtmlEntities(m[3]);
        const imgUrl = m[1];
        const link = `https://suaramuhammadiyah.id${m[2]}`;

        // Extract timestamp from image URL format: YYYYMMDDHHmmss
        const dateMatch = imgUrl.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
        let pubDateIso = new Date().toISOString();
        if (dateMatch) {
          const [, y, mo, d, h, mi, s] = dateMatch;
          pubDateIso = `${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`;
        }

        articles.push({
          id: `sm-live-${count + 1}`,
          source: "SUARA_MUHAMMADIYAH",
          badge: "SUARA MUHAMMADIYAH",
          badgeClass: "bg-[#800000] text-white",
          timeAgo: calculateTimeAgo(pubDateIso),
          publishedAt: pubDateIso,
          sourceDomain: "suaramuhammadiyah.id",
          sourceUrl: link,
          title: rawTitle,
          excerpt: `suaramuhammadiyah.id, YOGYAKARTA — ${rawTitle}. Warta persyarikatan dan inspirasi dakwah berkemajuan dari majalah dan portal Suara Muhammadiyah.`,
          content: [
            `suaramuhammadiyah.id, YOGYAKARTA — ${rawTitle}`,
            "Liputan lengkap warta dan kajian mencerahkan dari Suara Muhammadiyah dapat diakses melalui portal resmi.",
          ],
          imageUrl: imgUrl,
        });
        count++;
      }
    }
  } catch (err) {
    console.error("Error fetching Suara Muhammadiyah news:", err);
  }

  // Merge with fallbacks if any category is empty
  const hasUms = articles.some((a) => a.source === "UMS");
  const hasLensamu = articles.some((a) => a.source === "LENSAMU");
  const hasSm = articles.some((a) => a.source === "SUARA_MUHAMMADIYAH");

  let finalArticles = [...articles];

  if (!hasUms) {
    finalArticles = [
      ...finalArticles,
      ...fallbackArticles.filter((a) => a.source === "UMS"),
    ];
  }
  if (!hasLensamu) {
    finalArticles = [
      ...finalArticles,
      ...fallbackArticles.filter((a) => a.source === "LENSAMU"),
    ];
  }
  if (!hasSm) {
    finalArticles = [
      ...finalArticles,
      ...fallbackArticles.filter((a) => a.source === "SUARA_MUHAMMADIYAH"),
    ];
  }

  // If external fetch didn't return any, return full fallback list
  if (finalArticles.length === 0) {
    finalArticles = fallbackArticles;
  }

  return NextResponse.json(
    {
      success: true,
      updatedAt: new Date().toISOString(),
      articles: finalArticles,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
