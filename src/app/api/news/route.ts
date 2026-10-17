import { NextResponse } from "next/server";

export interface ApiNewsItem {
  id: string;
  source: "MASJIDMU" | "UMS" | "SUARA_MUHAMMADIYAH" | "LENSAMU";
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

// Fallback articles in case any external site is down or slow (3 official sources: UMS, Suara Muhammadiyah, Lensamu)
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

function parseRssFeed(xml: string, source: "UMS" | "SUARA_MUHAMMADIYAH" | "LENSAMU"): ApiNewsItem[] {
  const items: ApiNewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 6) {
    const itemBlock = match[1];

    const titleMatch = itemBlock.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkMatch = itemBlock.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
    const pubDateMatch = itemBlock.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = itemBlock.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const contentMatch = itemBlock.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/);

    const fullText = (contentMatch ? contentMatch[1] : "") + (descMatch ? descMatch[1] : "");
    const imgMatch = fullText.match(/<img[^>]+src=["']([^"']+)["']/i);

    const rawTitle = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";
    const rawLink = linkMatch ? linkMatch[1].trim() : "";
    const rawDesc = descMatch ? decodeHtmlEntities(descMatch[1].trim()) : "";
    const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";

    let pubDateIso = new Date().toISOString();
    if (pubDateStr) {
      const parsedD = new Date(pubDateStr);
      if (!isNaN(parsedD.getTime())) {
        pubDateIso = parsedD.toISOString();
      }
    }

    if (rawTitle && rawLink) {
      const isUms = source === "UMS";
      const isSm = source === "SUARA_MUHAMMADIYAH";

      items.push({
        id: `${source.toLowerCase()}-rss-${items.length + 1}`,
        source,
        badge: isUms ? "UMS NEWS" : isSm ? "SUARA MUHAMMADIYAH" : "LENSAMU",
        badgeClass: isUms
          ? "bg-[#003B73] text-white"
          : isSm
          ? "bg-[#800000] text-white"
          : "bg-[#005A36] text-white",
        timeAgo: calculateTimeAgo(pubDateIso),
        publishedAt: pubDateIso,
        sourceDomain: isUms ? "news.ums.ac.id" : isSm ? "suaramuhammadiyah.id" : "lensamu.id",
        sourceUrl: rawLink,
        title: rawTitle,
        excerpt: rawDesc.slice(0, 240) + (rawDesc.length > 240 ? "..." : ""),
        content: [
          rawDesc,
          "Warta resmi civitas akademika dan persyarikatan ini dirilis langsung melalui portal berita resmi.",
        ],
        imageUrl: imgMatch
          ? imgMatch[1]
          : isUms
          ? "/images/news/ums-pemilu.jpg"
          : isSm
          ? "/images/news/news-sm-1.jpg"
          : "/images/news/news-lensamu-1.jpg",
      });
    }
  }

  return items;
}

// 1. Fetcher Khusus Berita Kampus UMS (Prioritas Utama)
async function fetchUmsNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  // Strategi A: WordPress REST API resmi
  try {
    const res = await fetch("https://news.ums.ac.id/id/wp-json/wp/v2/posts?_embed&per_page=6", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
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
  } catch (err) {
    console.warn("Notice: UMS REST API failed, trying RSS:", err);
  }

  // Strategi B: RSS Feed Berita UMS
  try {
    const resRss = await fetch("https://news.ums.ac.id/id/feed/", {
      next: { revalidate: 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/xml, application/rss+xml, */*",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (resRss.ok) {
      const xml = await resRss.text();
      const parsed = parseRssFeed(xml, "UMS");
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Notice: UMS RSS failed:", err);
  }

  // Strategi C: Fallback Lokal UMS
  return fallbackArticles.filter((a) => a.source === "UMS");
}

// 2. Fetcher Lensamu (Muhammadiyah.or.id)
async function fetchLensamuNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  try {
    const res = await fetch("https://muhammadiyah.or.id/wp-json/wp/v2/posts?_embed&per_page=3", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
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

        if (items.length > 0) return items;
      }
    }
  } catch (err) {
    console.warn("Notice: Lensamu fetch error:", err);
  }

  return fallbackArticles.filter((a) => a.source === "LENSAMU");
}

// 3. Fetcher Suara Muhammadiyah
async function fetchSuaraMuhammadiyahNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  try {
    const res = await fetch("https://suaramuhammadiyah.id", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const html = await res.text();
      const cardRegex = /<img[^>]+src="([^"]+)"[^>]*class="[^"]*w-100[^"]*"[\s\S]*?<a[^>]+href="(\/read\/[^"]+)"[^>]*>[\s\S]*?<h5>([\s\S]*?)<\/h5>/g;
      let m;
      let count = 0;
      while ((m = cardRegex.exec(html)) !== null && count < 3) {
        const rawTitle = decodeHtmlEntities(m[3]);
        const imgUrl = m[1];
        const link = `https://suaramuhammadiyah.id${m[2]}`;

        const dateMatch = imgUrl.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
        let pubDateIso = new Date().toISOString();
        if (dateMatch) {
          const [, y, mo, d, h, mi, s] = dateMatch;
          pubDateIso = `${y}-${mo}-${d}T${h}:${mi}:${s}+07:00`;
        }

        items.push({
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

      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn("Notice: Suara Muhammadiyah fetch error:", err);
  }

  return fallbackArticles.filter((a) => a.source === "SUARA_MUHAMMADIYAH");
}

export async function GET() {
  // Ambil ketiga sumber secara paralel untuk efisiensi
  const [umsArticles, lensamuArticles, smArticles] = await Promise.all([
    fetchUmsNews(),
    fetchLensamuNews(),
    fetchSuaraMuhammadiyahNews(),
  ]);

  // UTAMAKAN BERITA KAMPUS UMS DI URUTAN TERDEPAN (Posisi 0, 1, 2, dst.)
  const officialArticles = [
    ...umsArticles,
    ...smArticles,
    ...lensamuArticles,
  ];

  return NextResponse.json(
    {
      success: true,
      updatedAt: new Date().toISOString(),
      articles: officialArticles,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
