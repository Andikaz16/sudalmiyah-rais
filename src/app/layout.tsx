import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
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

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sudalmiyah-rais.vercel.app"),
  title: "Masjid UMS | Masjid Sudalmiyah Rais Kampus 2",
  description:
    "Portal Resmi Masjid UMS - Model Masjid Percontohan LPCR-PM & PTMA. Jadwal shalat standar MASA, ruang ibadah digital, warta persyarikatan, dan transparansi infaq.",
  authors: [{ name: "Takmir Masjid UMS" }],
  keywords: [
    "Masjid UMS",
    "Masjid Percontohan LPCR-PM",
    "Masjid Sudalmiyah Rais",
    "Amal Usaha Muhammadiyah",
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
  openGraph: {
    title: "Masjid Hj. Sudalmiyah Rais - Universitas Muhammadiyah Surakarta",
    description:
      "Portal Resmi Masjid Kampus Universitas Muhammadiyah Surakarta - Model Masjid Percontohan LPCR-PM PP Muhammadiyah.",
    url: "https://sudalmiyah-rais.vercel.app",
    siteName: "Masjid Sudalmiyah Rais UMS",
    images: [
      {
        url: "/images/logo/logo-masjid.png",
        width: 800,
        height: 800,
        alt: "Logo Resmi Masjid Hj. Sudalmiyah Rais UMS",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Masjid Hj. Sudalmiyah Rais - Universitas Muhammadiyah Surakarta",
    description:
      "Portal Resmi Masjid Kampus Universitas Muhammadiyah Surakarta - Model Masjid Percontohan LPCR-PM PP Muhammadiyah.",
    images: ["/images/logo/logo-masjid.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Scheherazade+New:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-slate-800 font-sans selection:bg-[#C59B27] selection:text-white">
        {children}
        <TanyaTarjihWidget />
      </body>
    </html>
  );
}
