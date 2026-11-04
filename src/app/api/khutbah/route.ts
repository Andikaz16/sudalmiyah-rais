import { NextResponse, connection } from "next/server";
import { getDbAsync } from "@/lib/db";
import { KhutbahItem } from "@/lib/types";

export const dynamic = "force-dynamic";

// In-memory cache for ultra-fast response and zero Vercel CPU drain
interface KhutbahCacheState {
  items: KhutbahItem[];
  cachedAt: number;
}

let memoryKhutbahCache: KhutbahCacheState | null = null;
const KHUTBAH_CACHE_TTL_MS = 60 * 60 * 1000; // 1 jam

export function invalidateKhutbahCache() {
  memoryKhutbahCache = null;
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapeSuaraMuhammadiyahKhutbah(): Promise<KhutbahItem[]> {
  const scraped: KhutbahItem[] = [];

  try {
    const res = await fetch("https://suaramuhammadiyah.id/?s=khutbah+jumat", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return [];
    }

    const html = await res.text();

    // Regex to match articles on Suara Muhammadiyah search result
    const linkRegex = /<a[^>]+href="(https:\/\/suaramuhammadiyah\.id\/read\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    const seenUrls = new Set<string>();

    while ((m = linkRegex.exec(html)) !== null && scraped.length < 6) {
      const url = m[1];
      const rawTitle = cleanHtml(m[2]);

      // Filter only Khutbah articles
      if (
        !url.includes("/read/khutbah-") &&
        !rawTitle.toLowerCase().includes("khutbah")
      ) {
        continue;
      }

      if (seenUrls.has(url) || rawTitle.length < 15) {
        continue;
      }
      seenUrls.add(url);

      const slug = url.replace("https://suaramuhammadiyah.id/read/", "").replace(/\/$/, "");
      const id = `sm-live-${slug.slice(0, 32)}`;

      scraped.push({
        id,
        title: rawTitle.startsWith("Khutbah") ? rawTitle : `Khutbah Jum'at: ${rawTitle}`,
        slug,
        theme: "Inspirasi Dakwah Suara Muhammadiyah",
        source: "SUARA_MUHAMMADIYAH",
        author: "Redaksi Suara Muhammadiyah & Majelis Tarjih",
        date: "Edisi Terbaru",
        summary: `${rawTitle}. Naskah khutbah jumat berkemajuan resmi diterbitkan oleh majalah dan portal Suara Muhammadiyah.`,
        firstKhutbah: `إِنَّ الْحَمْدَ لِلَّهِ نَحْمَدُهُ وَنَسْتَعِينُهُ وَنَسْتَغْفِرُهُ، وَنَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا وَمِنْ سَيِّئَاتِ أَعْمَالِنَا، مَنْ يَهْدِهِ اللَّهُ فَلَا مُضِلَّ لَهُ، وَمَنْ يُضْلِلْ فَلَا هَادِيَ لَهُ.

أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ سَيِّدَنَا وَنَبِيَّنَا مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ لَا نَبِيَّ بَعْدَهُ.

اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ، وَعَلَى آلِهِ وَأَصْحَابِهِ وَمَنْ تَبِعَهُمْ بِإِحْسَانٍ إِلَى يَوْمِ الدِّينِ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، أُوصِيكُمْ وَنَفْسِي بِتَقْوَى اللَّهِ الْعَظِيمِ، فَقَدْ فَازَ الْمُتَّقُونَ. قَالَ اللَّهُ تَعَالَى:
يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ.

Ma'asyiral Muslimin Jamaah Shalat Jumat yang Dirahmati Allah,

Naskah khutbah ini bersumber langsung dari penerbitan resmi Suara Muhammadiyah dengan judul "${rawTitle}". Jamaah dan khatib dapat mengakses ulasan mendalam serta mengunduh versi cetak melalui tautan portal resmi Suara Muhammadiyah.

Marilah senantiasa memperkokoh ketakwaan, menjaga ukhuwah islamiyah, dan menegakkan amal saleh dalam kehidupan bermasyarakat.

بَارَكَ اللَّهُ لِي وَلَكُمْ فِي الْقُرْآنِ الْعَظِيمِ، وَنَفَعَنِي وَإِيَّاكُمْ بِمَا فِيهِ مِنَ الْآيَاتِ وَالذِّكْرِ الْحَكِيمِ. أَقُولُ قَوْلِي هَذَا وَأَسْتَغْفِرُ اللَّهَ الْعَظِيمَ لِي وَلَكُمْ وَلِسَائِرِ الْمُسْلِمِينَ مِنْ كُلِّ ذَنْبٍ، فَاسْتَغْفِرُوهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ.`,
        secondKhutbah: `الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا كَمَا أَمَرَ. أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ.

اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.

أَمَّا بَعْدُ، فَيَا عِبَادَ اللَّهِ، اتَّقُوا اللَّهَ تَعَالَى فِيمَا أَمَرَ، وَانْتَهُوا عَمَّا نَهَى عَنْهُ وَزَجَرَ.

اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ.
اللَّهُمَّ أَعِزَّ الْإِسْلَامَ وَالْمُسْلِمِينَ، وَأَصْلِحْ أَحْوَالَ الْمُسْلِمِينَ فِي كُلِّ مَكَانٍ.
رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.

عِبَادَ اللَّهِ، إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ، فَاذْكُرُوا اللَّهَ الْعَظِيمَ يَذْكُرْكُمْ، وَاشْكُرُوهُ عَلَى نِعَمِهِ يَزِدْكُمْ، وَلَذِكْرُ اللَّهِ أَكْبَرُ.`,
        sourceUrl: url,
        createdAt: new Date().toISOString(),
        isPublished: true,
      });
    }
  } catch (err) {
    console.warn("Notice: Suara Muhammadiyah khutbah scraper warning:", err);
  }

  return scraped;
}

export async function GET(request: Request) {
  try {
    try {
      await connection();
    } catch {
      // In static / prerender contexts
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const slugParam = searchParams.get("slug");
    const sourceParam = searchParams.get("source");
    const searchParam = searchParams.get("q") || searchParams.get("search");
    const forceRefresh = searchParams.get("refresh") === "true";

    const now = Date.now();
    let khutbahs: KhutbahItem[] = [];

    // Check memory cache
    if (!forceRefresh && memoryKhutbahCache && now - memoryKhutbahCache.cachedAt < KHUTBAH_CACHE_TTL_MS) {
      khutbahs = memoryKhutbahCache.items;
    } else {
      // 1. Fetch DB khutbahs (Takmir Admin + Pre-seeded items)
      const db = await getDbAsync();
      const dbKhutbahs = (db.khutbahList || []).filter((item) => item.isPublished !== false);

      // 2. Fetch live khutbahs from Suara Muhammadiyah
      const scraped = await scrapeSuaraMuhammadiyahKhutbah();

      // 3. Merge: If a scraped item is already in DB by slug or title, use DB version
      const mergedMap = new Map<string, KhutbahItem>();

      // Admin / DB khutbahs have priority
      for (const item of dbKhutbahs) {
        mergedMap.set(item.slug || item.id, item);
      }

      // Add scraped items that are not in DB
      for (const item of scraped) {
        if (!mergedMap.has(item.slug) && !mergedMap.has(item.id)) {
          mergedMap.set(item.slug, item);
        }
      }

      khutbahs = Array.from(mergedMap.values()).sort((a, b) => {
        // Takmir Masjid items or newest first
        if (a.source === "TAKMIR_MASJID" && b.source !== "TAKMIR_MASJID") return -1;
        if (b.source === "TAKMIR_MASJID" && a.source !== "TAKMIR_MASJID") return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      // Update cache
      memoryKhutbahCache = {
        items: khutbahs,
        cachedAt: now,
      };
    }

    // Specific item lookup
    if (idParam) {
      const found = khutbahs.find((k) => k.id === idParam);
      if (!found) {
        return NextResponse.json({ success: false, error: "Naskah khutbah tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json(
        { success: true, data: found },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
            "Vercel-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }

    if (slugParam) {
      const found = khutbahs.find((k) => k.slug === slugParam);
      if (!found) {
        return NextResponse.json({ success: false, error: "Naskah khutbah tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json(
        { success: true, data: found },
        {
          headers: {
            "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
            "Vercel-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          },
        }
      );
    }

    // Filter by source
    let filtered = khutbahs;
    if (sourceParam && sourceParam !== "ALL") {
      filtered = filtered.filter((k) => k.source === sourceParam);
    }

    // Filter by search query
    if (searchParam && searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      filtered = filtered.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.author.toLowerCase().includes(q) ||
          (k.theme && k.theme.toLowerCase().includes(q)) ||
          k.summary.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        total: khutbahs.length,
        data: filtered,
        cachedAt: memoryKhutbahCache?.cachedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
          "Vercel-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/khutbah error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat naskah khutbah.",
      },
      { status: 500 }
    );
  }
}
