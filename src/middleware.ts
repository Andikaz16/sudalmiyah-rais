import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "sudalmiyah-rais-ums-secure-production-key-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add Security Headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );

  // Protected Admin Routes Guard
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const sessionCookie = request.cookies.get("sudalmiyah_session")?.value;

    if (!sessionCookie) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload.role !== "ADMIN_TAKMIR" && payload.role !== "PENGURUS_AGENDA") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Akses ditolak. Anda tidak memiliki izin admin." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Invalid/expired token
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Token otentikasi tidak sah." },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
