"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Quote,
  Share2,
  Copy,
  Check,
  X,
} from "lucide-react";
import { QrisSettings } from "@/lib/types";
import { getHijriDate } from "@/lib/prayer-times";

interface InfaqHadith {
  id: number;
  theme: string;
  arabic: string;
  translation: string;
  source: string;
  fadhilah: string;
}

const INFAQ_HADITHS: InfaqHadith[] = [
  {
    id: 1,
    theme: "Keberkahan & Harta yang Bertumbuh",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا",
    translation:
      "Sedekah itu tidak akan pernah mengurangi harta. Dan tidaklah Allah menambah bagi seorang hamba yang pemaaf melainkan kemuliaan, serta tidaklah seseorang merendahkan hati karena Allah melainkan Dia akan meninggikan derajatnya.",
    source: "HR. Muslim No. 2588",
    fadhilah: "Infaq mendatangkan keberkahan harta berlipat dan ketenangan batin.",
  },
  {
    id: 2,
    theme: "Doa Mustajab Malaikat Setiap Pagi",
    arabic:
      "مَا مِنْ يَوْمٍ يُصْبِحُ الْعِبَادُ فِيهِ إِلَّا مَلَكَانِ يَنْزِلَانِ، فَيَقُولُ أَحَدُهُمَا: اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا، وَيَقُولُ الْآخَرُ: اللَّهُمَّ أَعْطِ مُمْسِكًا تَلَفًا",
    translation:
      "Tiada suatu pagi pun saat seorang hamba bangun melainkan dua malaikat turun. Salah satunya berdoa: 'Ya Allah, berikanlah ganti keberkahan bagi orang yang berinfaq', sedangkan yang lain berkata: 'Ya Allah, berikanlah kebinasaan bagi orang yang menahan hartanya'.",
    source: "HR. Bukhari No. 1442 & Muslim No. 1010",
    fadhilah: "Setiap infaq yang dikeluarkan didoakan langsung oleh para malaikat Allah.",
  },
  {
    id: 3,
    theme: "Pahala Berlipat Ganda 700 Kali",
    arabic:
      "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ",
    translation:
      "Perumpamaan orang-orang yang menginfakkan hartanya di jalan Allah serupa dengan sebutir benih yang menumbuhkan tujuh butir, pada tiap-tiap butir ada seratus biji. Allah melipatgandakan pahala bagi siapa yang Dia kehendaki, dan Allah Maha Luas lagi Maha Mengetahui.",
    source: "QS. Al-Baqarah: 261",
    fadhilah: "Pahala infaq dilipatgandakan hingga ratusan kali lipat tanpa batas.",
  },
  {
    id: 4,
    theme: "Naungan Sejuk di Hari Kiamat",
    arabic:
      "إِنَّ الصَّدَقَةَ لَتُطْفِئُ عَنْ أَهْلِهَا حَرَّ الْقُبُورِ، وَإِنَّمَا يَسْتَظِلُّ الْمُؤْمِنُ يَوْمَ الْقِيَامَةِ فِي ظِلِّ صَدَقَتِهِ",
    translation:
      "Sesungguhnya sedekah itu benar-benar memadamkan panasnya alam kubur bagi pelakunya, dan sungguh seorang mukmin pada hari kiamat kelak akan bernaung di bawah keteduhan naungan sedekahnya.",
    source: "HR. Ath-Thabrani & Al-Baihaqi (Shahih At-Targhib)",
    fadhilah: "Sedekah menjadi perisai pelindung dari dahsyatnya panas terik hari kiamat.",
  },
  {
    id: 5,
    theme: "Amal Jariyah yang Abadi Melintasi Zaman",
    arabic:
      "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
    translation:
      "Apabila manusia meninggal dunia, maka terputuslah segala amal perbuatannya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, dan anak shalih yang mendoakannya.",
    source: "HR. Muslim No. 1631",
    fadhilah: "Pahala infaq untuk kemakmuran masjid mengalir selamanya melintasi alam kubur.",
  },
  {
    id: 6,
    theme: "Pembersih Dosa & Penawar Kegelisahan",
    arabic: "وَالصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",
    translation:
      "Dan sedekah itu dapat memadamkan dosa-dosa dan kesalahan sebagaimana air memadamkan bara api yang menyala.",
    source: "HR. At-Tirmidzi No. 614 & Ibnu Majah No. 3973",
    fadhilah: "Menghapuskan dosa-dosa kecil dan membentengi diri dari marabahaya.",
  },
  {
    id: 7,
    theme: "Kemuliaan Tangan di Atas",
    arabic:
      "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى، فَالْيَدُ الْعُلْيَا هِيَ الْمُنْفِقَةُ، وَالسُّفْلَى هِيَ السَّائِلَةُ",
    translation:
      "Tangan yang di atas lebih baik daripada tangan yang di bawah. Tangan yang di atas adalah tangan yang memberi (berinfaq), sedangkan tangan yang di bawah adalah yang meminta.",
    source: "HR. Bukhari No. 1429 & Muslim No. 1033",
    fadhilah: "Menjadi pribadi dermawan yang mulia di hadapan Allah dan sesama manusia.",
  },
  {
    id: 8,
    theme: "Perlindungan Diri Walau Sebutir Kurma",
    arabic:
      "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ، فَمَنْ لَمْ يَجِدْ فَبِكَلِمَةٍ طَيِّبَةٍ",
    translation:
      "Lindungilah diri kalian dari siksa api neraka walau hanya dengan menyedekahkan sebutir kurma. Jika tidak menemukannya, maka dengan bertutur kata yang baik.",
    source: "HR. Bukhari No. 1417 & Muslim No. 1016",
    fadhilah: "Sekecil apa pun nominal infaq yang disalurkan dengan ikhlas bernilai sangat agung di sisi-Nya.",
  },
];

const MARQUEE_QUOTES = [
  "Investasi Akhirat yang Abadi",
  "Harta yang Diinfaqkan Tidak Pernah Berkurang",
  "Setiap Rupiah Menjadi Saksi Kebaikan di Hari Akhir",
  "Sedekah Memadamkan Dosa & Menolak Bala",
  "Doa Malaikat Menyertai Setiap Langkah Orang yang Berinfaq",
  "Tangan di Atas Lebih Mulia daripada Tangan di Bawah",
  "Memakmurkan Masjid, Meraih Naungan Naungan Arsy",
];

const fallbackQris: QrisSettings = {
  id: "qris-01",
  imageUrl: "/images/qris-sudalmiyah.png",
  secondaryImageUrl: "/images/qris-bank-jateng.jpg",
  merchantName: "LAZ UMS-MSJD SUDALMIYAH",
  secondaryMerchantName: "MASJID UMS",
  nmid: "ID2024353816125",
  secondaryNmid: "-",
  institution: "Universitas Muhammadiyah Surakarta",
  updatedAt: new Date().toISOString(),
};

export default function DonationSection() {
  const [qris, setQris] = useState<QrisSettings>(fallbackQris);
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [isHadithPaused, setIsHadithPaused] = useState(false);

  const nextHadith = useCallback(() => {
    setCurrentHadithIndex((prev) => (prev + 1) % INFAQ_HADITHS.length);
  }, []);

  const prevHadith = useCallback(() => {
    setCurrentHadithIndex((prev) => (prev - 1 + INFAQ_HADITHS.length) % INFAQ_HADITHS.length);
  }, []);

  useEffect(() => {
    if (isHadithPaused) return;
    const interval = setInterval(() => {
      nextHadith();
    }, 6000);
    return () => clearInterval(interval);
  }, [isHadithPaused, nextHadith]);

  useEffect(() => {
    fetch(`/api/qris?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.qris) {
          setQris(data.qris);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownloadQRIS = () => {
    const link = document.createElement("a");
    link.download = `QRIS-LAZ-UMS-Sudalmiyah.png`;
    link.href = qris.imageUrl || "/images/qris-sudalmiyah.png";
    link.target = "_blank";
    link.click();
  };

  const handleDownloadSecondaryQRIS = () => {
    const link = document.createElement("a");
    link.download = `QRIS-Masjid-UMS-Bank-Jateng.jpg`;
    link.href = qris.secondaryImageUrl || "/images/qris-bank-jateng.jpg";
    link.target = "_blank";
    link.click();
  };

  const currentHadith = INFAQ_HADITHS[currentHadithIndex];

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedHadithId, setSelectedHadithId] = useState<number>(1);
  const [customShareText, setCustomShareText] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const formatHadithShareText = (hadith: InfaqHadith) => {
    const today = new Date();
    const hijriDate = getHijriDate(today);
    const masehiDate = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);

    return `*MUTIARA HADITS: ${hadith.theme}*
${hijriDate} (KHGT) / ${masehiDate}

${hadith.arabic}

"${hadith.translation}"

(${hadith.source} — ${hadith.fadhilah})

Disiarkan oleh Masjid Sudalmiyah Rais - Universitas Muhammadiyah Surakarta
Infaq Digital: https://sudalmiyah-rais.vercel.app`;
  };

  const handleOpenShare = (hadithIndex?: number) => {
    const targetIdx = typeof hadithIndex === "number" ? hadithIndex : currentHadithIndex;
    const targetHadith = INFAQ_HADITHS[targetIdx] || INFAQ_HADITHS[0];
    setSelectedHadithId(targetHadith.id);
    setCustomShareText(formatHadithShareText(targetHadith));
    setIsShareModalOpen(true);
    setIsHadithPaused(true);
  };

  const handleHadithSelectChange = (newId: number) => {
    setSelectedHadithId(newId);
    const targetHadith = INFAQ_HADITHS.find((h) => h.id === newId) || INFAQ_HADITHS[0];
    setCustomShareText(formatHadithShareText(targetHadith));
  };

  const handleResetText = () => {
    const targetHadith = INFAQ_HADITHS.find((h) => h.id === selectedHadithId) || INFAQ_HADITHS[0];
    setCustomShareText(formatHadithShareText(targetHadith));
  };

  const handleCopyText = async (platformName?: string) => {
    try {
      await navigator.clipboard.writeText(customShareText);
      const msg = platformName
        ? `Teks hadits disalin! Silakan tempel pada ${platformName}.`
        : "Teks hadits berhasil disalin ke clipboard!";
      setCopyFeedback(msg);
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch {
      setCopyFeedback("Gagal menyalin teks.");
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleShareWA = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(customShareText)}`;
    window.open(url, "_blank");
  };

  const handleShareFB = () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "https://sudalmiyah-rais.vercel.app";
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(customShareText)}`;
    window.open(url, "_blank");
  };

  const handleShareIG = async () => {
    await handleCopyText("Instagram Story / Feed");
    window.open("https://www.instagram.com/", "_blank");
  };

  const handleShareTikTok = async () => {
    await handleCopyText("TikTok Caption / Video");
    window.open("https://www.tiktok.com/", "_blank");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const targetHadith = INFAQ_HADITHS.find((h) => h.id === selectedHadithId) || INFAQ_HADITHS[0];
        await navigator.share({
          title: `Mutiara Hadits: ${targetHadith.theme}`,
          text: customShareText,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
      } catch {
        // User cancelled or aborted
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <section id="donasi" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Continuous Ticker Ribbon of Infaq Quotes */}
        <div className="overflow-hidden whitespace-nowrap mb-6 py-2.5 px-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center">
          <div className="animate-marquee-infinite text-xs font-semibold text-[#003B73] gap-8 items-center">
            {MARQUEE_QUOTES.concat(MARQUEE_QUOTES).map((quote, idx) => (
              <span key={idx} className="inline-flex items-center gap-3">
                <span>{quote}</span>
                <span className="text-amber-500 font-bold">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Auto-sliding Hadith & Quotes Card */}
        <div
          onMouseEnter={() => setIsHadithPaused(true)}
          onMouseLeave={() => setIsHadithPaused(false)}
          className="relative rounded-3xl bg-gradient-to-br from-[#002147] via-[#003B73] to-[#001833] text-white p-6 sm:p-9 shadow-xl border border-amber-400/30 overflow-hidden mb-12"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-amber-300" />
                Mutiara Hadits &amp; Keutamaan Infaq
              </span>
              <span className="hidden sm:inline-block text-xs text-blue-200/80">
                • {currentHadith.theme}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90">
              <button
                onClick={() => handleOpenShare(currentHadithIndex)}
                className="px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Bagikan Mutiara Hadits Ini"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Bagikan</span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                {currentHadithIndex + 1} / {INFAQ_HADITHS.length}
              </span>
            </div>
          </div>

          {/* Hadith Content */}
          <div className="min-h-[160px] sm:min-h-[140px] flex flex-col justify-center text-center space-y-4">
            {/* Arabic Text */}
            <p lang="ar" dir="rtl" className="font-quran text-xl sm:text-3xl text-amber-200 font-semibold leading-relaxed tracking-normal px-2 sm:px-6">
              {currentHadith.arabic}
            </p>

            {/* Translation */}
            <p className="text-xs sm:text-sm md:text-base text-stone-100 max-w-3xl mx-auto leading-relaxed italic px-2">
              &ldquo;{currentHadith.translation}&rdquo;
            </p>

            {/* Riwayat & Fadhilah */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                {currentHadith.source}
              </span>
              <span className="text-[11px] text-amber-300 font-medium hidden sm:inline-block">
                — {currentHadith.fadhilah}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Arrows and Share Button */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-5">
            <button
              onClick={prevHadith}
              aria-label="Hadits Sebelumnya"
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Bagikan Mutiara Hadits Button */}
            <button
              onClick={() => handleOpenShare(currentHadithIndex)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-stone-950" />
              <span>Bagikan Mutiara Hadits</span>
            </button>

            <button
              onClick={nextHadith}
              aria-label="Hadits Berikutnya"
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Infaq Digital <span className="text-[#003B73]">QRIS</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            Salurkan infaq dan sedekah jariyah secara mudah, amanah, dan berkah melalui pemindaian kode QRIS resmi Masjid Sudalmiyah Rais Kampus 2 UMS.
          </p>
        </div>

        {/* QRIS Feature Container */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.35fr_1fr] gap-6 lg:gap-8 items-stretch">
            
            {/* Left Column: Official QRIS 1 Stand Card (LAZ UMS Sudalmiyah) */}
            <div className="md:col-span-1 order-1 lg:order-1 flex flex-col h-full">
              <div className="w-full h-full rounded-3xl bg-white border border-stone-200 p-4 sm:p-5 shadow-lg text-center flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="mb-3 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#003B73]/10 text-[#003B73] text-[11px] font-bold shrink-0 self-center">
                    <span>LAZ UMS Sudalmiyah</span>
                  </div>

                  {/* Official QRIS Poster Image - Fills height */}
                  <div className="relative w-full flex-1 min-h-[400px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-inner flex items-center justify-center p-2">
                    <Image
                      src={qris.imageUrl || "/images/qris-sudalmiyah.png"}
                      alt={`QRIS ${qris.merchantName || "LAZ UMS-MSJD SUDALMIYAH"}`}
                      fill
                      unoptimized
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Download QRIS Button & Info */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadQRIS}
                    className="w-full text-center px-4 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-md shadow-[#003B73]/15 active:scale-[0.99] cursor-pointer"
                  >
                    Unduh Gambar QRIS
                  </button>

                  <div className="text-[10px] text-stone-500 leading-tight">
                    Mendukung BCA, Mandiri, BSI, BRI, BNI, GoPay, OVO, ShopeePay, DANA, LinkAja, &amp; seluruh aplikasi QRIS.
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: Panduan Scan QRIS & Amanah Penyaluran */}
            <div className="md:col-span-2 lg:col-span-1 order-3 lg:order-2 flex flex-col justify-between h-full space-y-5">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#003B73]">
                    Kemudahan Berinfaq Digital
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 mt-1 font-serif">
                    Panduan Pembayaran QRIS
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    Infaq dapat ditunaikan secara langsung tanpa perlu repot mencatat nomor rekening. Cukup scan salah satu kode QRIS di samping atau unduh barcode melalui ponsel pintar Anda kapan pun dan di mana pun.
                  </p>
                </div>

                {/* Steps List */}
                <div className="space-y-3">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        Buka Aplikasi Mobile Banking atau E-Wallet
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        Gunakan aplikasi perbankan (BSI Mobile, Livin Mandiri, BCA Mobile, BRImo, Bank Jateng) atau dompet digital (GoPay, OVO, DANA, ShopeePay, LinkAja).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        Pilih Menu Pindai (Scan) QRIS
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        Arahkan kamera ponsel Anda ke salah satu kode QRIS di samping, atau pilih gambar QRIS yang telah diunduh dari galeri ponsel.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        Pastikan Nama Penerima &amp; Masukkan Nominal
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        Periksa nama merchant: <strong className="text-stone-900">{qris.merchantName || "LAZ UMS-MSJD SUDALMIYAH"}</strong> atau <strong className="text-stone-900">{qris.secondaryMerchantName || "MASJID UMS"}</strong>, kemudian ketik nominal infaq sesuai keikhlasan hati Anda.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        Konfirmasi Pembayaran
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                        Masukkan PIN transaksi Anda. Bukti pembayaran akan langsung tampil di layar ponsel dan dana masuk ke rekening operasional masjid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amanah & Keamanan Card pinned to bottom */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#D4AF37]/50 shadow-sm flex items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#003B73]/10 text-[#003B73] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#003B73]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Amanah &amp; Standar Nasional Bank Indonesia
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Terdaftar resmi di bawah pengawasan Bank Indonesia dan ASPI.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-mono">
                  VERIFIED QRIS
                </span>
              </div>
            </div>

            {/* Right Column: Official QRIS 2 Stand Card (Bank Jateng - MASJID UMS) */}
            <div className="md:col-span-1 order-2 lg:order-3 flex flex-col h-full">
              <div className="w-full h-full rounded-3xl bg-white border border-stone-200 p-4 sm:p-5 shadow-lg text-center flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="mb-3 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 text-[11px] font-bold shrink-0 self-center">
                    <span>Bank Jateng (Masjid UMS)</span>
                  </div>

                  {/* Official QRIS Poster Image - Fills height */}
                  <div className="relative w-full flex-1 min-h-[400px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-inner flex items-center justify-center p-2">
                    <Image
                      src={qris.secondaryImageUrl || "/images/qris-bank-jateng.jpg"}
                      alt={`QRIS ${qris.secondaryMerchantName || "MASJID UMS - Bank Jateng"}`}
                      fill
                      unoptimized
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Download QRIS Button & Info */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadSecondaryQRIS}
                    className="w-full text-center px-4 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md shadow-stone-900/15 active:scale-[0.99] cursor-pointer"
                  >
                    Unduh Gambar QRIS
                  </button>

                  <div className="text-[10px] text-stone-500 leading-tight">
                    Mendukung Bank Jateng BIMA, Mobile Banking, E-Wallet, &amp; seluruh aplikasi QRIS.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Share Mutiara Hadits Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-7 overflow-hidden text-stone-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
                  Bagikan Mutiara Hadits
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pilih kata-kata atau sesuaikan pesan sebelum dibagikan ke media sosial
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              {/* Dropdown to pick which Hadith */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Pilih Mutiara Hadits yang Ingin Dibagikan:
                </label>
                <select
                  value={selectedHadithId}
                  onChange={(e) => handleHadithSelectChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-xs font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#003B73]/20"
                >
                  {INFAQ_HADITHS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.id}. {h.theme} ({h.source})
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable Textarea for Custom Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Teks Pesan / Kata-Kata Hadits:
                  </label>
                  <button
                    type="button"
                    onClick={handleResetText}
                    className="text-[11px] text-[#003B73] hover:underline font-semibold cursor-pointer"
                  >
                    Reset ke Teks Asli
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={customShareText}
                  onChange={(e) => setCustomShareText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-800 leading-relaxed font-sans focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#003B73]/20"
                  placeholder="Tulis atau sesuaikan kata-kata yang ingin dibagikan..."
                />
              </div>

              {/* Toast / Feedback Notice */}
              {copyFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{copyFeedback}</span>
                </div>
              )}

              {/* Share Buttons Grid */}
              <div>
                <span className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  Pilih Media Sosial Tujuan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={handleShareWA}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={handleShareIG}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={handleShareFB}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>

                  {/* TikTok */}
                  <button
                    type="button"
                    onClick={handleShareTikTok}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.99v9.19c.02 1.48-.41 2.97-1.25 4.19-1.07 1.56-2.77 2.61-4.64 2.89-1.87.28-3.82-.18-5.35-1.28-1.53-1.1-2.55-2.79-2.79-4.7-.24-1.91.27-3.85 1.42-5.35 1.15-1.5 2.87-2.48 4.74-2.69.45-.05.9-.04 1.35.03v4.06c-.49-.15-1.02-.17-1.52-.06-.82.17-1.54.72-1.91 1.46-.37.74-.35 1.63.05 2.36.4.73 1.15 1.22 1.98 1.29.83.07 1.65-.29 2.17-.95.42-.53.62-1.2.6-1.89V.02h.67z"/>
                    </svg>
                    <span>TikTok</span>
                  </button>
                </div>
              </div>

              {/* Copy & Native Share Row */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>Salin Teks Hadits</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span>Bagikan Menu HP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
