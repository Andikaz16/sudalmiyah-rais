import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Masjid Sudalmiyah Rais | Universitas Muhammadiyah Surakarta",
  description:
    "Sistem Informasi Terpadu Pengelolaan Masjid Sudalmiyah Rais Kampus 2 UMS. Informasi jadwal shalat real-time, manajemen kajian mahasiswa, presensi tiket QR, dan transparansi kas digital.",
  authors: [{ name: "Takmir Masjid Sudalmiyah Rais UMS" }],
  keywords: [
    "Masjid Sudalmiyah Rais",
    "UMS",
    "Universitas Muhammadiyah Surakarta",
    "Jadwal Shalat Surakarta",
    "Kajian Mahasiswa UMS",
    "Infaq Digital Masjid",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/images/logo/logo-masjid.png",
    shortcut: "/images/logo/logo-masjid.png",
    apple: "/images/logo/logo-masjid.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Masjid Sudalmiyah",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-slate-800 font-sans selection:bg-[#C59B27] selection:text-white">
        {children}
      </body>
    </html>
  );
}
