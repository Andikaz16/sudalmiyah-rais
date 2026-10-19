import { NextResponse, connection } from "next/server";
import { getDbAsync } from "@/lib/db";

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
    "SURAKARTA - Menyemarakkan peringatan Hari Jadi ke-68 Universitas Muhammadiyah Surakarta (UMS), Lembaga Pengembangan Pondok, Al-Islam dan Kemuhammadiyahan (LPPIK) UMS menggelar Tabligh Akbar bertempat di Gedung Edutorium KH Ahmad Dahlan UMS pada Ahad, 18 Oktober 2026.",
    "Tabligh Akbar ini menghadirkan dai kondang nasional Ustadz Dr. H. Das'ad Latif, S.Sos., S.Ag., M.Si., Ph.D. dengan mengusung tema 'Meneguhkan Sinergi, Menebar Kebermanfaatan dan Menguatkan Peradaban'. Majelis ilmu ini dihadiri ribuan jamaah sivitas akademika UMS, warga persyarikatan se-Solo Raya, serta masyarakat luas.",
    "Bagi segenap jamaah dan warga persyarikatan yang berhalangan hadir langsung di Edutorium, siaran langsung dan rekaman lengkap pengajian dapat disaksikan secara daring melalui kanal siaran langsung resmi."
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
    excerpt: "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas pada Kamis-Jumat (15-16/10/2026). Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan, mengevaluasi hasil latihan tahunan, serta membangun karakter dan kedisiplinan peserta didik di alam terbuka.",
    content: [
      "ums.ac.id, SURAKARTA - SMP UMP menggelar Uji Syarat Kenaikan Tingkat (SKT) Pandu Hizbul Wathan Golongan Purwa di Germanggis, Cilongok, Kabupaten Banyumas pada Kamis-Jumat (15-16/10/2026). Kegiatan ini diikuti oleh 71 siswa kelas VIII sebagai sarana mengasah keterampilan kepanduan, mengevaluasi hasil latihan tahunan, serta membangun karakter dan kedisiplinan peserta didik di alam terbuka.",
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
    excerpt: "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT) pada Rabu (14/10/2026).",
    content: [
      "ums.ac.id, SURAKARTA - Lembaga Pengembangan Mata Kuliah dan Layanan Bahasa (LPMB) Universitas Muhammadiyah Surakarta (UMS) menerima kunjungan studi tiru dari Pusat Pengembangan Bahasa (PPB) Universitas Muhammadiyah Kalimantan Timur (UMKT) pada Rabu (14/10/2026). Momentum ini dimanfaatkan untuk memperkuat jejaring kebahasaan antarlembaga sekaligus berbagi pengalaman dalam pengelolaan layanan bahasa di lingkungan perguruan tinggi.",
      "Kunjungan benchmarking ini menjadi wujud sinergi dan kolaborasi antar Perguruan Tinggi Muhammadiyah dan 'Aisyiyah (PTMA) dalam meningkatkan standarisasi mutu uji bahasa asing dan kemahiran akademik civitas kampus."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/Perkuat-Layanan-Bahasa-PPB-UMKT-Pelajari-Tata-Kelola-LPMB-UMS-2.jpg",
  },
  {
    id: "ums-43404",
    source: "UMS",
    badge: "UMS NEWS",
    badgeClass: "bg-[#003B73] text-white",
    timeAgo: "18 jam lalu",
    publishedAt: "2026-10-16T18:34:18+07:00",
    sourceDomain: "news.ums.ac.id",
    sourceUrl: "https://news.ums.ac.id/id/berita/wakili-jawa-tengah-dua-mahasiswa-ums-borong-medali-kejurnas-panahan-senior/",
    title: "Wakili Jawa Tengah, Dua Mahasiswa UMS Borong Medali Kejurnas Panahan Senior",
    excerpt: "ums.ac.id, SURAKARTA - Dua mahasiswa Universitas Muhammadiyah Surakarta (UMS) berhasil memborong medali dalam Kejuaraan Nasional (Kejurnas) Panahan Senior di Stadion Ciracas, Jakarta, 7-13 Oktober 2026. Capaian tersebut semakin menambah deretan prestasi mahasiswa UMS di tingkat nasional.",
    content: [
      "ums.ac.id, SURAKARTA - Dua mahasiswa Universitas Muhammadiyah Surakarta (UMS) berhasil memborong medali dalam Kejuaraan Nasional (Kejurnas) Panahan Senior di Stadion Ciracas, Jakarta, 7-13 Oktober 2026. Capaian tersebut semakin menambah deretan prestasi mahasiswa UMS di tingkat nasional.",
      "Kedua mahasiswa tersebut ialah Hanun Nailal Husna, mahasiswi Pendidikan Jasmani, dan Dimas Maulana Dzaki Kusuma, mahasiswa Teknik Informatika."
    ],
    imageUrl: "https://news.ums.ac.id/id/wp-content/uploads/sites/2/2026/10/Wakili-Jawa-Tengah-Dua-Mahasiswa-UMS-Borong-Medali-Kejurnas-Panahan-Senior.jpeg",
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
    imageUrl: "/images/news/news-sm-1.jpg",
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
    imageUrl: "/images/news/news-lensamu-1.jpg",
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
    id: "solo-17942",
    source: "MUHAMMADIYAH_SOLO",
    badge: "MUHAMMADIYAH SOLO",
    badgeClass: "bg-[#1E5F3B] text-white",
    timeAgo: "2 jam lalu",
    publishedAt: "2026-10-18T14:18:07+07:00",
    sourceDomain: "muhammadiyahsolo.com",
    sourceUrl: "https://muhammadiyahsolo.com/20261018/tablig-akbar-hari-jadi-ke-68-ums-dasad-latif-ajak-jaga-akidah-dan-amalkan-nilai-islam-dalam-kehidupan-17942",
    title: "Tablig Akbar Hari Jadi ke-68 UMS, Das'ad Latif Ajak Jaga Akidah dan Amalkan Nilai Islam dalam Kehidupan",
    excerpt: "SOLO, MUHAMMADIYAHSOLO.COM - Semarak Hari Jadi ke-68 Universitas Muhammadiyah Surakarta (UMS) terus berlanjut melalui gelaran Tablig Akbar yang sarat pesan keagamaan dan kebangsaan oleh mubaligh nasional Ustaz Dr. H. Das'ad Latif.",
    content: [
      "SOLO, MUHAMMADIYAHSOLO.COM - Semarak Hari Jadi ke-68 Universitas Muhammadiyah Surakarta (UMS) terus berlanjut melalui gelaran Tablig Akbar yang sarat pesan keagamaan dan kebangsaan oleh mubaligh nasional Ustaz Dr. H. Das'ad Latif.",
      "Dalam tausiyahnya di hadapan ribuan hadirin, Ustaz Das'ad Latif mengingatkan pentingnya meneguhkan akidah, mempererat tali ukhuwah persyarikatan, serta membumikan nilai-nilai Islam berkemajuan dalam amal perbuatan nyata sehari-hari."
    ],
    imageUrl: "https://muhammadiyahsolo.com/files/2026/10/1810-UMS-2.jpg",
  },
];

function parseRssFeed(
  xml: string,
  source: "UMS" | "LPCR" | "MUHAMMADIYAH_SOLO" | "SUARA_MUHAMMADIYAH" | "LENSAMU"
): ApiNewsItem[] {
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
      const isLpcr = source === "LPCR";
      const isSolo = source === "MUHAMMADIYAH_SOLO";
      const isSm = source === "SUARA_MUHAMMADIYAH";

      items.push({
        id: `${source.toLowerCase().replace(/_/g, "-")}-rss-${items.length + 1}`,
        source,
        badge: isUms
          ? "UMS NEWS"
          : isLpcr
          ? "LPCR-PM"
          : isSolo
          ? "MUHAMMADIYAH SOLO"
          : isSm
          ? "SUARA MUHAMMADIYAH"
          : "LENSAMU",
        badgeClass: isUms
          ? "bg-[#003B73] text-white"
          : isLpcr
          ? "bg-[#D97706] text-white"
          : isSolo
          ? "bg-[#1E5F3B] text-white"
          : isSm
          ? "bg-[#800000] text-white"
          : "bg-[#005A36] text-white",
        timeAgo: calculateTimeAgo(pubDateIso),
        publishedAt: pubDateIso,
        sourceDomain: isUms
          ? "news.ums.ac.id"
          : isLpcr
          ? "lpcr.or.id"
          : isSolo
          ? "muhammadiyahsolo.com"
          : isSm
          ? "suaramuhammadiyah.id"
          : "lensamu.id",
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
          : isLpcr
          ? "/images/logo/logo-lpcr.png"
          : isSolo
          ? "/images/news/news-lensamu-1.jpg"
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
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
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
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/xml, application/rss+xml, */*",
      },
      signal: AbortSignal.timeout(8000),
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

// 2. Fetcher Khusus Berita LPCR-PM PP Muhammadiyah (lpcr.or.id)
async function fetchLpcrNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  // Strategi A: WordPress REST API resmi lpcr.or.id
  try {
    const res = await fetch("https://lpcr.or.id/wp-json/wp/v2/posts?_embed&per_page=6", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
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
  } catch (err) {
    console.warn("Notice: LPCR REST API failed, trying RSS:", err);
  }

  // Strategi B: RSS Feed lpcr.or.id/feed
  try {
    const resRss = await fetch("https://lpcr.or.id/feed", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/xml, application/rss+xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (resRss.ok) {
      const xml = await resRss.text();
      const parsed = parseRssFeed(xml, "LPCR");
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Notice: LPCR RSS failed:", err);
  }

  // Strategi C: Fallback Lokal LPCR
  return fallbackArticles.filter((a) => a.source === "LPCR");
}

// 3. Fetcher Khusus Berita Muhammadiyah Solo (muhammadiyahsolo.com)
async function fetchMuhammadiyahSoloNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  // Strategi A: WordPress REST API resmi muhammadiyahsolo.com
  try {
    const res = await fetch("https://muhammadiyahsolo.com/wp-json/wp/v2/posts?_embed&per_page=6", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
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
  } catch (err) {
    console.warn("Notice: Muhammadiyah Solo REST API failed, trying RSS:", err);
  }

  // Strategi B: RSS Feed muhammadiyahsolo.com/feed
  try {
    const resRss = await fetch("https://muhammadiyahsolo.com/feed", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/xml, application/rss+xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (resRss.ok) {
      const xml = await resRss.text();
      const parsed = parseRssFeed(xml, "MUHAMMADIYAH_SOLO");
      if (parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("Notice: Muhammadiyah Solo RSS failed:", err);
  }

  // Strategi C: Fallback Lokal
  return fallbackArticles.filter((a) => a.source === "MUHAMMADIYAH_SOLO");
}

// 3. Fetcher Lensamu (Muhammadiyah.or.id)
async function fetchLensamuNews(): Promise<ApiNewsItem[]> {
  const items: ApiNewsItem[] = [];

  try {
    const res = await fetch("https://muhammadiyah.or.id/wp-json/wp/v2/posts?_embed&per_page=3", {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
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
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
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

// Jadwal siaran Tabligh Akbar di Edutorium UMS selesai maksimal pukul 12:30 WIB (18 Okt 2026).
// Setelah batas waktu tersebut, status siaran otomatis bertransisi ke rekaman kajian (siaran ulang)
// meskipun sinyal live di YouTube Studio belum ditutup manual oleh operator.
const TABLIGH_AKBAR_END_TIMESTAMP = new Date("2026-10-18T12:30:00+07:00").getTime();

async function checkYouTubeLiveStatus(videoId: string): Promise<boolean> {
  // Jika waktu acara fisik sudah selesai, segera ubah status menjadi rekaman / siaran selesai
  if (Date.now() > TABLIGH_AKBAR_END_TIMESTAMP) {
    return false;
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const text = await res.text();
    return (
      text.includes('"isLiveNow":true') ||
      (text.includes('"isLive":true') &&
        !text.includes('Streamed live') &&
        !text.includes('Disiarkan langsung'))
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  await connection();
  // Ambil berita manual dari basis data dan semua sumber berita eksternal secara paralel
  const [db, umsArticles, lpcrArticles, soloArticles, lensamuArticles, smArticles, isLive] = await Promise.all([
    getDbAsync(),
    fetchUmsNews(),
    fetchLpcrNews(),
    fetchMuhammadiyahSoloNews(),
    fetchLensamuNews(),
    fetchSuaraMuhammadiyahNews(),
    checkYouTubeLiveStatus("KVGneiEldgo"),
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

  const liveArticleItem: ApiNewsItem = {
    ...tablighAkbarLiveArticle,
    isLive,
    badge: isLive ? "SIARAN LANGSUNG" : "REKAMAN KAJIAN",
    badgeClass: isLive ? "bg-red-600 text-white animate-pulse" : "bg-[#003B73] text-white",
    timeAgo: isLive ? "Sedang Berlangsung" : "Siaran Ulang",
  };

  // Urutan prioritas:
  // 1. Warta / Berita Manual Masjid (dibuat nomor pertama sebelum news ums)
  // 2. Siaran / Rekaman Tabligh Akbar
  // 3. Berita Kampus UMS & Berita LPCR-PM PP Muhammadiyah
  // 4. Liputan Persyarikatan Solo (muhammadiyahsolo.com)
  // 5. Suara Muhammadiyah & Lensamu
  const officialArticles = [
    ...manualArticles,
    liveArticleItem,
    ...umsArticles.filter((a) => a.id !== tablighAkbarLiveArticle.id),
    ...lpcrArticles,
    ...soloArticles,
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
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
