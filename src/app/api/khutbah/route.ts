import { NextResponse, connection } from "next/server";
import { getDbAsync } from "@/lib/db";
import { KhutbahItem } from "@/lib/types";

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
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function scrapeSuaraMuhammadiyahKhutbah(): Promise<KhutbahItem[]> {
  const scraped: KhutbahItem[] = [];

  try {
    const res = await fetch("https://suaramuhammadiyah.id/category/khutbah", {
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

    // Match each <article> in the category feed to get exact article link and card timestamp
    const articleBlockRegex = /<article[\s\S]*?<\/article>/gi;
    const blocks = html.match(articleBlockRegex) || [];

    const articleLinks: {
      link: string;
      rawTitle: string;
      cardIso: string;
      cardTitle: string;
    }[] = [];
    const seen = new Set<string>();

    for (const block of blocks) {
      if (articleLinks.length >= 6) break;

      const hrefMatch = block.match(/href="([^"]*\/read\/khutbah-[^"]*)"/i);
      if (!hrefMatch) continue;

      const href = hrefMatch[1];
      const link = href.startsWith("http") ? href : `https://suaramuhammadiyah.id${href}`;
      if (seen.has(link)) continue;
      seen.add(link);

      const titleMatch =
        block.match(/<h2[^>]*class="story__title"[^>]*><a[^>]+href="[^"]*"[^>]*>([\s\S]*?)<\/a><\/h2>/i) ||
        block.match(/<a[^>]+href="[^"]*\/read\/khutbah-[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      const rawTitle = titleMatch ? cleanHtml(titleMatch[1]) : "";
      if (rawTitle.length < 10) continue;

      const timeMatch = block.match(/<time[^>]+datetime="([^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/time>/i);
      const cardIso = timeMatch ? timeMatch[1].trim() : "";
      const cardTitle = timeMatch ? cleanHtml(timeMatch[2]) : "";

      articleLinks.push({ link, rawTitle, cardIso, cardTitle });
    }

    // Fallback if <article> tags were not matched directly
    if (articleLinks.length === 0) {
      const cardRegex = /<a[^>]+href="([^"]*\/read\/khutbah-[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      let m;
      while ((m = cardRegex.exec(html)) !== null && articleLinks.length < 6) {
        const href = m[1];
        const link = href.startsWith("http") ? href : `https://suaramuhammadiyah.id${href}`;
        const cleanTitle = cleanHtml(m[2]);

        if (cleanTitle.length > 15 && !seen.has(link)) {
          seen.add(link);
          articleLinks.push({ link, rawTitle: cleanTitle, cardIso: "", cardTitle: "" });
        }
      }
    }

    // Fetch article full content in parallel
    const fetchedArticles = await Promise.all(
      articleLinks.map(async ({ link, rawTitle, cardIso, cardTitle }) => {
        try {
          const aRes = await fetch(link, {
            next: { revalidate: 3600 },
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: AbortSignal.timeout(5000),
          });

          if (!aRes.ok) return null;
          const aHtml = await aRes.text();

          // 1. Author
          const authorMatch = aHtml.match(/Oleh[:\s]+([^<,\n\r]+)/i);
          const author = authorMatch
            ? cleanHtml(authorMatch[1].trim())
            : "Redaksi Suara Muhammadiyah";

          // 2. Accurate Publication Date & Time from source
          const metaMatch =
            aHtml.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i) ||
            aHtml.match(/<meta[^>]+content="([^"]+)"[^>]+property="article:published_time"/i);
          const publishedIso = metaMatch ? metaMatch[1].trim() : cardIso;

          // Inside article page: <time datetime="...">Rabu, 4 November 2026 · 17:14 WIB</time>
          const timeTagMatch = aHtml.match(/<time[^>]+datetime="([^"]*)"[^>]*>([\s\S]*?)<\/time>/i);
          let dateText = "";
          if (timeTagMatch) {
            const innerTime = cleanHtml(timeTagMatch[2]);
            if (innerTime && innerTime.length > 5) {
              dateText = innerTime;
            }
          }
          if (!dateText && cardTitle) {
            dateText = cardTitle;
          }
          if (!dateText && publishedIso) {
            try {
              const d = new Date(publishedIso);
              dateText = d.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });
            } catch {
              dateText = "Edisi Terbaru";
            }
          }
          if (!dateText) {
            dateText = "Edisi Terbaru";
          }

          const pMatches = aHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
          const validP = pMatches
            .map((p) => cleanHtml(p))
            .filter(
              (p) =>
                p.length > 25 &&
                !p.includes("offline") &&
                !p.includes("Portal Islam") &&
                !p.includes("Unduh aplikasi")
            );

          if (validP.length === 0) return null;

          // Split Khutbah 1 and Khutbah 2
          const k1: string[] = [];
          const k2: string[] = [];
          let isSecond = false;

          for (let i = 0; i < validP.length; i++) {
            const p = validP[i];
            if (
              i > 3 &&
              (p.toLowerCase().includes("khutbah kedua") ||
                p.includes("الْحَمْدُ") ||
                p.includes("الحمد لله"))
            ) {
              isSecond = true;
            }
            if (isSecond) {
              k2.push(p);
            } else {
              k1.push(p);
            }
          }

          const summary =
            validP
              .filter((p) => !p.startsWith("Oleh:") && !p.startsWith("إِنَّ"))
              .slice(0, 2)
              .join(" ")
              .slice(0, 260) || `${rawTitle}. Naskah khutbah resmi Suara Muhammadiyah.`;

          const slug = link
            .replace("https://suaramuhammadiyah.id/read/", "")
            .replace(/\/$/, "");
          const id = `sm-live-${slug.slice(0, 36)}`;

          const title = rawTitle.startsWith("Khutbah")
            ? rawTitle
            : `Khutbah Jum'at: ${rawTitle}`;

          return {
            id,
            title,
            slug,
            theme: "Inspirasi Dakwah Suara Muhammadiyah",
            source: "SUARA_MUHAMMADIYAH" as const,
            author,
            date: dateText,
            summary: summary.endsWith(".") ? summary : `${summary}...`,
            firstKhutbah: k1.join("\n\n"),
            secondKhutbah:
              k2.length > 0 ? k2.join("\n\n") : validP.slice(-6).join("\n\n"),
            sourceUrl: link,
            createdAt: publishedIso || new Date().toISOString(),
            isPublished: true,
          };
        } catch (err) {
          console.warn("Failed to scrape individual SM khutbah:", link, err);
          return null;
        }
      })
    );

    for (const item of fetchedArticles) {
      if (item) scraped.push(item);
    }
  } catch (err) {
    console.warn("Notice: Suara Muhammadiyah khutbah scraper warning:", err);
  }

  return scraped;
}

export async function GET(request: Request) {
  await connection();
  try {
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
      // 1. Fetch DB khutbahs (Takmir Admin items, excluding stale dummy seeds)
      const db = await getDbAsync();
      const dbKhutbahs = (db.khutbahList || []).filter(
        (item) => item.isPublished !== false && item.id !== "khutbah-sm-01" && item.id !== "khutbah-sm-02"
      );

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
      const decoded = decodeURIComponent(slugParam).trim();
      const found = khutbahs.find(
        (k) =>
          k.slug === slugParam ||
          k.slug === decoded ||
          k.id === slugParam ||
          k.id === decoded ||
          k.slug.toLowerCase() === decoded.toLowerCase()
      );
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
