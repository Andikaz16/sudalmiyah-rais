import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TanyaTarjihWidget from "@/components/TanyaTarjihWidget";
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
  title: "Masjid UMS | Masjid Sudalmiyah Rais Kampus 2",
  description:
    "Portal Resmi Masjid UMS (Masjid Sudalmiyah Rais Kampus 2 UMS) - Model MasjidMu Percontohan Muhammadiyah. Jadwal shalat standar MASA Tarjih, ruang ibadah digital, warta persyarikatan, dan transparansi infaq.",
  authors: [{ name: "Takmir Masjid UMS" }],
  keywords: [
    "Masjid UMS",
    "Masjid Sudalmiyah Rais",
    "MasjidMu Percontohan",
    "Masjid Percontohan Muhammadiyah",
    "UMS",
    "Universitas Muhammadiyah Surakarta",
    "Jadwal Shalat MASA",
    "Jadwal Shalat Surakarta",
    "Kajian Mahasiswa UMS",
    "Infaq Digital Masjid",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/logo/logo-masjid.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/images/logo/logo-masjid.png",
    apple: "/images/logo/logo-masjid.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Masjid UMS",
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
        <TanyaTarjihWidget />
      </body>
    </html>
  );
}
