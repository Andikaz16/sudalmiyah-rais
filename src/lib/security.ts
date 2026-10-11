import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "sudalmiyah-rais-ums-secure-production-key-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

// In-Memory Rate Limiter for brute force defense
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

// Clean up old rate limit records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// Password Hashing
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

// Session JWT
export interface SessionPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  nim?: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Input Sanitization for anti-XSS
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, "") // remove HTML brackets
    .slice(0, 500); // enforce maximum length
}

// Safe Ticket Code Generator (Alphanumeric cryptographically sound)
export function generateTicketCode(prefix: string = "SUDALMIYAH"): string {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).substring(4, 7).toUpperCase();
  return `${prefix}-${timestamp}${randomChars}`;
}
