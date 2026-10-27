"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk. Periksa kembali email dan password.");
      }

      router.push(redirectTarget);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Alamat Email Terdaftar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="masjidums@ums.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#003B73]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-[#003B73]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-center px-6 py-3.5 rounded-full bg-[#003B73] hover:bg-[#002855] disabled:bg-stone-300 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
        >
          {loading ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-[#003B73] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-18 h-18 flex items-center justify-center">
            <Image
              src="/images/logo/logo-masjid.png"
              alt="Logo Masjid UMS"
              width={72}
              height={72}
              className="w-full h-full object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
          Portal Keamanan Takmir
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-stone-500">
          Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <Suspense fallback={<div className="h-64 rounded-3xl bg-white border border-stone-200 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
