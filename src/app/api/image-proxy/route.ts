import { NextRequest, NextResponse, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  // Only allow HTTP/HTTPS
  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return new NextResponse("Invalid protocol", { status: 400 });
  }

  // SSRF Protection: Deny private/internal networks
  const hostname = targetUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("172.16.") ||
    hostname.startsWith("169.254.")
  ) {
    return new NextResponse("Access to internal host is forbidden", { status: 403 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

  try {
    const upstreamRes = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      return new NextResponse(`Upstream returned ${upstreamRes.status}`, {
        status: upstreamRes.status,
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "image/jpeg";
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.error("Image proxy error fetching:", targetUrl.toString(), err);
    // Return a neat SVG fallback icon so the client UI renders gracefully
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="#f5f5f4">
      <rect width="400" height="300" fill="#f5f5f4"/>
      <path d="M175 140 L195 110 L225 150 L205 150 Z" fill="#d6d3d1"/>
      <text x="200" y="190" font-family="sans-serif" font-size="12" fill="#a8a29e" text-anchor="middle">Foto Tidak Dapat Dimuat</text>
    </svg>`;
    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
