import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import TanyaTarjihWidget from "@/components/TanyaTarjihWidget";
import { LanguageProvider } from "@/context/LanguageContext";
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

const jsonLdPayload = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://masjid.ums.ac.id/#website",
      "url": "https://masjid.ums.ac.id",
      "name": "Masjid Kampus UMS",
      "alternateName": [
        "Kampus Masjid UMS",
        "Masjid Kampus",
        "Kampus Masjid",
        "Portal Resmi Masjid Kampus UMS",
        "Masjid Hj. Sudalmiyah Rais"
      ],
      "description":
        "Portal Resmi Informasi & Peribadatan Masjid Kampus UMS (Universitas Muhammadiyah Surakarta) - Melayani 6 Masjid Kampus Percontohan.",
      "inLanguage": "id-ID"
    },
    {
      "@type": "Mosque",
      "@id": "https://masjid.ums.ac.id/#mosque",
      "name": "Masjid Hj. Sudalmiyah Rais - Masjid Kampus UMS",
      "alternateName": [
        "Masjid Kampus UMS",
        "Kampus Masjid UMS",
        "Masjid Kampus 2 UMS",
        "Masjid Sudalmiyah Rais"
      ],
      "url": "https://masjid.ums.ac.id",
      "logo": "https://masjid.ums.ac.id/images/logo/logo-masjid.png",
      "image": "https://masjid.ums.ac.id/images/hero/hero-sudalmiyah.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. A. Yani, Pabelan, Kartasura",
        "addressLocality": "Sukoharjo",
        "addressRegion": "Jawa Tengah",
        "postalCode": "57169",
        "addressCountry": "ID"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": -7.5583,
        "longitude": 110.7719
      },
      "parentOrganization": {
        "@type": "EducationalOrganization",
        "name": "Universitas Muhammadiyah Surakarta",
        "url": "https://www.ums.ac.id"
      },
      "department": [
        {
          "@type": "Mosque",
          "name": "Masjid Fadhlurrahman",
          "description": "Masjid Kampus 1 UMS"
        },
        {
          "@type": "Mosque",
          "name": "Masjid KH. Mas Mansur",
          "description": "Masjid Kampus 4 UMS (Pesma)"
        },
        {
          "@type": "Mosque",
          "name": "Masjid Ma'had Abu Bakar",
          "description": "Masjid Kampus 2 UMS"
        },
        {
          "@type": "Mosque",
          "name": "Masjid Al-Munajat",
          "description": "Masjid Pondok Shabran UMS"
        },
        {
          "@type": "Mosque",
          "name": "Masjid Ar-Razi FKG",
          "description": "Masjid Kampus 4 UMS (FKG)"
        }
      ]
    }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL("https://masjid.ums.ac.id"),
  title: {
    default: "Masjid Kampus UMS | Portal Resmi Masjid Sudalmiyah Rais & 6 Masjid Kampus",
    template: "%s | Masjid Kampus UMS",
  },
  description:
    "Portal resmi informasi dan peribadatan Masjid Kampus UMS (Universitas Muhammadiyah Surakarta). Layanan 6 masjid kampus: Masjid Hj. Sudalmiyah Rais, Fadhlurrahman, KH. Mas Mansur, Ma'had Abu Bakar, Al-Munajat, dan Ar-Razi FKG. Jadwal Shalat Jumat, kajian, presensi jamaah, dan transparansi infaq.",
  authors: [{ name: "Takmir Masjid Kampus UMS" }],
  keywords: [
    "Masjid Kampus",
    "Kampus Masjid",
    "Masjid Kampus UMS",
    "Kampus Masjid UMS",
    "Masjid Kampus Universitas Muhammadiyah Surakarta",
    "Masjid Sudalmiyah Rais",
    "Masjid Hj. Sudalmiyah Rais",
    "Masjid Fadhlurrahman",
    "Masjid KH. Mas Mansur",
    "Masjid Ma'had Abu Bakar",
    "Masjid Al-Munajat",
    "Masjid Ar-Razi FKG",
    "Jadwal Shalat Masjid Kampus",
    "Jadwal Jumat Masjid UMS",
    "Presensi Shalat Masjid Kampus",
    "Kajian Masjid Kampus UMS",
    "Infaq Masjid Kampus",
    "LPCR-PM",
    "Universitas Muhammadiyah Surakarta",
  ],
  alternates: {
    canonical: "/",
  },
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
    title: "Masjid Kampus UMS - Portal Resmi 6 Masjid Kampus",
    description:
      "Portal resmi informasi dan peribadatan Masjid Kampus UMS. Jadwal Shalat Jumat, kajian, ruang ibadah digital & presensi berjamaah.",
    url: "https://masjid.ums.ac.id",
    siteName: "Masjid Kampus UMS",
    images: [
      {
        url: "https://masjid.ums.ac.id/images/logo/logo-masjid.png",
        width: 512,
        height: 512,
        alt: "Logo Resmi Masjid Kampus UMS",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Masjid Kampus UMS - Portal Resmi 6 Masjid Kampus",
    description:
      "Portal resmi informasi dan peribadatan Masjid Kampus UMS. Jadwal Shalat Jumat, kajian, dan presensi jamaah.",
    images: ["https://masjid.ums.ac.id/images/logo/logo-masjid.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "googlead78a0e6b0494c64",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Masjid Kampus UMS",
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
        <meta property="og:image" content="https://masjid.ums.ac.id/images/logo/logo-masjid.png" />
        <meta property="og:image:secure_url" content="https://masjid.ums.ac.id/images/logo/logo-masjid.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Logo Resmi Masjid Kampus UMS" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdPayload),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-slate-800 font-sans selection:bg-[#C59B27] selection:text-white">
        <LanguageProvider>
          {children}
          <TanyaTarjihWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
