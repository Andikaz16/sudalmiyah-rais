import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb, logSecurityEvent } from "@/lib/db";
import { checkRateLimit, createSessionToken, verifyPassword } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").max(100),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate Limiting: 5 attempts per 1 minute
  const rateLimitResult = checkRateLimit(`login-${ip}`, 5, 60 * 1000);
  if (!rateLimitResult.allowed) {
    logSecurityEvent(
      "AUTH_BRUTE_FORCE_BLOCKED",
      "ANONYMOUS",
      ip,
      "BLOCKED",
      `Upaya login berulang terdeteksi dan diblokir sementara.`
    );
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login. Silakan tunggu ${rateLimitResult.retryAfterSeconds} detik lagi.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Data masukan tidak valid", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const db = getDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      logSecurityEvent("LOGIN_FAILED", email, ip, "WARNING", "Pengguna tidak ditemukan.");
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      logSecurityEvent("LOGIN_FAILED", email, ip, "WARNING", "Kata sandi salah.");
      return NextResponse.json(
        { error: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    // Generate JWT Session Token
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      nim: user.nim,
    });

    logSecurityEvent("LOGIN_SUCCESS", user.email, ip, "SUCCESS", `Login berhasil sebagai ${user.role}.`);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nim: user.nim,
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set("sudalmiyah_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
