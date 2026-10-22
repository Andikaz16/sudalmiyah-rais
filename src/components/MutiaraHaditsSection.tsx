"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Share2,
  Copy,
  Check,
  X,
  Download,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { getHijriDate } from "@/lib/prayer-times";
import { useLanguage } from "@/context/LanguageContext";
import { generateHadithPosterBlob } from "@/lib/hadith-card-canvas";

export interface InfaqHadith {
  id: number;
  theme: string;
  themeEn?: string;
  arabic: string;
  translation: string;
  translationEn?: string;
  source: string;
  fadhilah: string;
  fadhilahEn?: string;
}

export const INFAQ_HADITHS: InfaqHadith[] = [
  {
    id: 1,
    theme: "Keberkahan & Harta yang Bertumbuh",
    themeEn: "Blessings & Growing Wealth",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا",
    translation:
      "Sedekah itu tidak akan pernah mengurangi harta. Dan tidaklah Allah menambah bagi seorang hamba yang pemaaf melainkan kemuliaan, serta tidaklah seseorang merendahkan hati karena Allah melainkan Dia akan meninggikan derajatnya.",
    translationEn:
      "Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.",
    source: "HR. Muslim No. 2588",
    fadhilah: "Infaq mendatangkan keberkahan harta berlipat dan ketenangan batin.",
    fadhilahEn: "Infaq brings multiplied wealth blessings and inner serenity.",
  },
  {
    id: 2,
    theme: "Doa Mustajab Malaikat Setiap Pagi",
    themeEn: "Angels' Daily Answered Prayers",
    arabic:
      "مَا مِنْ يَوْمٍ يُصْبِحُ الْعِبَادُ فِيهِ إِلَّا مَلَكَانِ يَنْزِلَانِ، فَيَقُولُ أَحَدُهُمَا: اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا، وَيَقُولُ الْآخَرُ: اللَّهُمَّ أَعْطِ مُمْسِكًا تَلَفًا",
    translation:
      "Tiada suatu pagi pun saat seorang hamba bangun melainkan dua malaikat turun. Salah satunya berdoa: 'Ya Allah, berikanlah ganti keberkahan bagi orang yang berinfaq', sedangkan yang lain berkata: 'Ya Allah, berikanlah kebinasaan bagi orang yang menahan hartanya'.",
    translationEn:
      "Never does a day dawn upon the servants of Allah but two angels descend. One says: 'O Allah, give to the one who spends in charity a recompense', and the other says: 'O Allah, give to the one who withholds ruin'.",
    source: "HR. Bukhari No. 1442 & Muslim No. 1010",
    fadhilah: "Setiap infaq yang dikeluarkan didoakan langsung oleh para malaikat Allah.",
    fadhilahEn: "Every spending in charity is directly prayed for by Allah's angels.",
  },
  {
    id: 3,
    theme: "Pahala Berlipat Ganda 700 Kali",
    themeEn: "700-Fold Multiplied Reward",
    arabic:
      "مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ فِي كُلِّ سُنبُلَةٍ مِّائَةُ حَبَّةٍ ۗ وَاللَّهُ يُضَاعِفُ لِمَن يَشَاءُ",
    translation:
      "Perumpamaan orang-orang yang menginfakkan hartanya di jalan Allah serupa dengan sebutir benih yang menumbuhkan tujuh butir, pada tiap-tiap butir ada seratus biji. Allah melipatgandakan pahala bagi siapa yang Dia kehendaki, dan Allah Maha Luas lagi Maha Mengetahui.",
    translationEn:
      "The example of those who spend their wealth in the cause of Allah is like a seed of grain that produces seven ears; in each ear is a hundred grains. And Allah multiplies for whom He wills, and Allah is all-Encompassing and Knowing.",
    source: "QS. Al-Baqarah: 261",
    fadhilah: "Pahala infaq dilipatgandakan hingga ratusan kali lipat tanpa batas.",
    fadhilahEn: "The reward for infaq is multiplied up to hundreds of times without limit.",
  },
  {
    id: 4,
    theme: "Naungan Sejuk di Hari Kiamat",
    themeEn: "Cool Shade on the Day of Resurrection",
    arabic:
      "إِنَّ الصَّدَقَةَ لَتُطْفِئُ عَنْ أَهْلِهَا حَرَّ الْقُبُورِ، وَإِنَّمَا يَسْتَظِلُّ الْمُؤْمِنُ يَوْمَ الْقِيَامَةِ فِي ظِلِّ صَدَقَتِهِ",
    translation:
      "Sesungguhnya sedekah itu benar-benar memadamkan panasnya alam kubur bagi pelakunya, dan sungguh seorang mukmin pada hari kiamat kelak akan bernaung di bawah keteduhan naungan sedekahnya.",
    translationEn:
      "Indeed, charity extinguishes the heat of the grave for its people, and the believer will take shade on the Day of Resurrection beneath the shade of his charity.",
    source: "HR. Ath-Thabrani & Al-Baihaqi (Shahih At-Targhib)",
    fadhilah: "Sedekah menjadi perisai pelindung dari dahsyatnya panas terik hari kiamat.",
    fadhilahEn: "Charity becomes a protective shield from the intense heat of the Day of Judgment.",
  },
  {
    id: 5,
    theme: "Amal Jariyah yang Abadi Melintasi Zaman",
    themeEn: "Eternal Continuous Charity Across Time",
    arabic:
      "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
    translation:
      "Apabila manusia meninggal dunia, maka terputuslah segala amal perbuatannya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, dan anak shalih yang mendoakannya.",
    translationEn:
      "When a human being dies, their deeds come to an end except for three: continuous charity (sadaqah jariyah), beneficial knowledge, or a righteous child who prays for them.",
    source: "HR. Muslim No. 1631",
    fadhilah: "Pahala infaq untuk kemakmuran masjid mengalir selamanya melintasi alam kubur.",
    fadhilahEn: "The reward of infaq for the prosperity of the mosque flows eternally even in the grave.",
  },
  {
    id: 6,
    theme: "Pembersih Dosa & Penawar Kegelisahan",
    themeEn: "Cleanser of Sins & Soother of Anxiety",
    arabic: "وَالصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",
    translation:
      "Dan sedekah itu dapat memadamkan dosa-dosa dan kesalahan sebagaimana air memadamkan bara api yang menyala.",
    translationEn:
      "And charity extinguishes sins just as water extinguishes fire.",
    source: "HR. At-Tirmidzi No. 614 & Ibnu Majah No. 3973",
    fadhilah: "Menghapuskan dosa-dosa kecil dan membentengi diri dari marabahaya.",
    fadhilahEn: "Cleanses minor sins and shields the soul from tribulations.",
  },
  {
    id: 7,
    theme: "Kemuliaan Tangan di Atas",
    themeEn: "The Nobility of the Upper Hand",
    arabic:
      "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى، فَالْيَدُ الْعُلْيَا هِيَ الْمُنْفِقَةُ، وَالسُّفْلَى هِيَ السَّائِلَةُ",
    translation:
      "Tangan yang di atas lebih baik daripada tangan yang di bawah. Tangan yang di atas adalah tangan yang memberi (berinfaq), sedangkan tangan yang di bawah adalah yang meminta.",
    translationEn:
      "The upper hand is better than the lower hand. The upper hand is the one that gives (spends in charity), and the lower hand is the one that begs.",
    source: "HR. Bukhari No. 1429 & Muslim No. 1033",
    fadhilah: "Menjadi pribadi dermawan yang mulia di hadapan Allah dan sesama manusia.",
    fadhilahEn: "Fosters a noble, generous character honored before Allah and fellow humanity.",
  },
  {
    id: 8,
    theme: "Perlindungan Diri Walau Sebutir Kurma",
    themeEn: "Self-Protection Even with Half a Date",
    arabic:
      "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ، فَمَنْ لَمْ يَجِدْ فَبِكَلِمَةٍ طَيِّبَةٍ",
    translation:
      "Lindungilah diri kalian dari siksa api neraka walau hanya dengan menyedekahkan sebutir kurma. Jika tidak menemukannya, maka dengan bertutur kata yang baik.",
    translationEn:
      "Protect yourselves from the Fire even with half a date in charity. And whoever cannot find that, then with a good word.",
    source: "HR. Bukhari No. 1417 & Muslim No. 1016",
    fadhilah: "Sekecil apa pun nominal infaq yang disalurkan dengan ikhlas bernilai sangat agung di sisi-Nya.",
    fadhilahEn: "No matter how small the charity given with sincerity, it holds immense value in the sight of Allah.",
  },
];

export const MARQUEE_QUOTES = [
  "Investasi Akhirat yang Abadi",
  "Harta yang Diinfaqkan Tidak Pernah Berkurang",
  "Setiap Rupiah Menjadi Saksi Kebaikan di Hari Akhir",
  "Sedekah Memadamkan Dosa & Menolak Bala",
  "Doa Malaikat Menyertai Setiap Langkah Orang yang Berinfaq",
  "Tangan di Atas Lebih Mulia daripada Tangan di Bawah",
  "Memakmurkan Masjid, Meraih Naungan Naungan Arsy",
];

export const MARQUEE_QUOTES_EN = [
  "Eternal Investment for the Hereafter",
  "Wealth Given in Infaq Never Decreases",
  "Every Rupiah Becomes a Witness of Goodness on the Final Day",
  "Charity Extinguishes Sins & Repels Calamities",
  "Angels' Prayers Accompany Every Step of the Generous",
  "The Upper Hand is Nobler than the Lower Hand",
  "Prospering the Mosque, Gaining the Shade of the Throne",
];

export default function MutiaraHaditsSection() {
  const { language } = useLanguage();
  const isEn = language === "en";
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

  const currentHadith = INFAQ_HADITHS[currentHadithIndex];

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedHadithId, setSelectedHadithId] = useState<number>(1);
  const [customShareText, setCustomShareText] = useState<string>("");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  const formatHadithShareText = useCallback((hadith: InfaqHadith) => {
    const today = new Date();
    const hijriDate = getHijriDate(today, true, language);
    const masehiDate = new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);

    const title = isEn
      ? `*HADITH PEARL & WISDOM: ${hadith.themeEn || hadith.theme}*`
      : `*MUTIARA HADITS & HIKMAH: ${hadith.theme}*`;
    const translation = isEn ? (hadith.translationEn || hadith.translation) : hadith.translation;
    const fadhilah = isEn ? (hadith.fadhilahEn || hadith.fadhilah) : hadith.fadhilah;
    const footer = isEn
      ? "Broadcasted by Hj. Sudalmiyah Rais Mosque - Universitas Muhammadiyah Surakarta\nOfficial Portal: https://sudalmiyah-rais.vercel.app"
      : "Disiarkan oleh Masjid Hj. Sudalmiyah Rais - Universitas Muhammadiyah Surakarta\nPortal Resmi: https://sudalmiyah-rais.vercel.app";

    return `${title}
${hijriDate} (${isEn ? "KHGT" : "KHGT"}) / ${masehiDate}

${hadith.arabic}

"${translation}"

(${hadith.source} — ${fadhilah})

${footer}`;
  }, [isEn, language]);

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
      const msg = isEn
        ? (platformName ? `Hadith text copied! Please paste on ${platformName}.` : "Hadith text copied to clipboard successfully!")
        : (platformName ? `Teks hadits disalin! Silakan tempel pada ${platformName}.` : "Teks hadits berhasil disalin ke clipboard!");
      setCopyFeedback(msg);
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch {
      setCopyFeedback(isEn ? "Failed to copy text." : "Gagal menyalin teks.");
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

  const getTargetHadith = () => {
    return INFAQ_HADITHS.find((h) => h.id === selectedHadithId) || INFAQ_HADITHS[0];
  };

  const handleDownloadPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const targetHadith = getTargetHadith();
      const today = new Date();
      const hijriDate = getHijriDate(today, true, language);
      const masehiDate = new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(today);

      const blob = await generateHadithPosterBlob(targetHadith, hijriDate, masehiDate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Poster_Hadits_${targetHadith.theme.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setCopyFeedback(isEn ? "Poster image downloaded successfully!" : "Gambar poster hadits berlogo UMS berhasil diunduh!");
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setCopyFeedback(isEn ? "Failed to generate poster." : "Gagal membuat gambar poster.");
      setTimeout(() => setCopyFeedback(null), 3000);
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleSharePosterWithCaption = async () => {
    setIsGeneratingPoster(true);
    try {
      const targetHadith = getTargetHadith();
      const today = new Date();
      const hijriDate = getHijriDate(today, true, language);
      const masehiDate = new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(today);

      const blob = await generateHadithPosterBlob(targetHadith, hijriDate, masehiDate);
      const file = new File(
        [blob],
        `Poster_Hadits_${targetHadith.theme.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`,
        { type: "image/jpeg" }
      );

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Mutiara Hadits: ${targetHadith.theme}`,
          text: customShareText,
        });
      } else {
        // Fallback for Desktop: trigger image download, copy text caption, and open WhatsApp Web
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Poster_Hadits_${targetHadith.theme.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await navigator.clipboard.writeText(customShareText);
        setCopyFeedback(
          isEn
            ? "Poster downloaded & caption copied! Please paste image on WhatsApp."
            : "Gambar poster diunduh & teks disalin! Tempelkan gambar dan teks ke WhatsApp."
        );
        setTimeout(() => setCopyFeedback(null), 4500);

        setTimeout(() => {
          window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(customShareText)}`,
            "_blank"
          );
        }, 600);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const targetHadith = INFAQ_HADITHS.find((h) => h.id === selectedHadithId) || INFAQ_HADITHS[0];
        await navigator.share({
          title: isEn
            ? `Hadith Pearl: ${targetHadith.themeEn || targetHadith.theme}`
            : `Mutiara Hadits: ${targetHadith.theme}`,
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

  const marqueeQuotes = isEn ? MARQUEE_QUOTES_EN : MARQUEE_QUOTES;

  return (
    <section id="mutiara-hadits" className="pt-10 sm:pt-14 pb-4 bg-[#FAF8F5] text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Continuous Ticker Ribbon of Wisdom Quotes */}
        <div className="overflow-hidden whitespace-nowrap mb-6 py-2.5 px-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center">
          <div className="animate-marquee-infinite text-xs font-semibold text-[#003B73] gap-8 items-center">
            {marqueeQuotes.concat(marqueeQuotes).map((quote, idx) => (
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
          className="relative rounded-3xl bg-gradient-to-br from-[#002147] via-[#003B73] to-[#001833] text-white p-6 sm:p-9 shadow-xl border border-amber-400/30 overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-amber-300" />
                {isEn ? "Hadith Pearls & Infaq Virtues" : "Mutiara Hadits & Keutamaan Infaq"}
              </span>
              <span className="hidden sm:inline-block text-xs text-blue-200/80">
                • {isEn ? (currentHadith.themeEn || currentHadith.theme) : currentHadith.theme}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90">
              <button
                onClick={() => handleOpenShare(currentHadithIndex)}
                className="px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isEn ? "Share this Hadith Pearl" : "Bagikan Mutiara Hadits Ini"}
              >
                <Share2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">{isEn ? "Share" : "Bagikan"}</span>
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
              &ldquo;{isEn ? (currentHadith.translationEn || currentHadith.translation) : currentHadith.translation}&rdquo;
            </p>

            {/* Riwayat & Fadhilah */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                {currentHadith.source}
              </span>
              <span className="text-[11px] text-amber-300 font-medium hidden sm:inline-block">
                — {isEn ? (currentHadith.fadhilahEn || currentHadith.fadhilah) : currentHadith.fadhilah}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Arrows and Share Button */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-5">
            <button
              onClick={prevHadith}
              aria-label={isEn ? "Previous Hadith" : "Hadits Sebelumnya"}
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{isEn ? "Previous" : "Sebelumnya"}</span>
            </button>

            {/* Bagikan Mutiara Hadits Button */}
            <button
              onClick={() => handleOpenShare(currentHadithIndex)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-stone-950" />
              <span>{isEn ? "Share Hadith Pearl" : "Bagikan Mutiara Hadits"}</span>
            </button>

            <button
              onClick={nextHadith}
              aria-label={isEn ? "Next Hadith" : "Hadits Berikutnya"}
              className="p-2 sm:px-3.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <span className="hidden sm:inline">{isEn ? "Next" : "Berikutnya"}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
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
                  {isEn ? "Share Hadith Pearl" : "Bagikan Mutiara Hadits"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isEn
                    ? "Select words or customize the message before sharing to social media"
                    : "Pilih kata-kata atau sesuaikan pesan sebelum dibagikan ke media sosial"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
                aria-label={isEn ? "Close" : "Tutup"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hadith Selector */}
            <div className="mt-4">
              <label htmlFor="hadith-select" className="block text-xs font-semibold text-stone-700 mb-1.5">
                {isEn ? "Select Hadith Theme:" : "Pilih Tema Hadits:"}
              </label>
              <select
                id="hadith-select"
                value={selectedHadithId}
                onChange={(e) => handleHadithSelectChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-800 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]/30 focus:border-[#003B73]"
              >
                {INFAQ_HADITHS.map((h) => (
                  <option key={h.id} value={h.id}>
                    #{h.id} - {isEn ? (h.themeEn || h.theme) : h.theme} ({h.source})
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Share Text Box */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="share-textarea" className="text-xs font-semibold text-stone-700">
                  {isEn ? "Preview / Customize Message:" : "Pratinjau / Sesuaikan Kata-Kata:"}
                </label>
                <button
                  type="button"
                  onClick={handleResetText}
                  className="text-[11px] text-[#003B73] hover:underline font-medium cursor-pointer"
                >
                  {isEn ? "Reset to Original Text" : "Reset ke Teks Asli"}
                </button>
              </div>
              <textarea
                id="share-textarea"
                rows={5}
                value={customShareText}
                onChange={(e) => setCustomShareText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-stone-300 text-xs text-stone-800 font-mono leading-relaxed bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]/30 focus:border-[#003B73] resize-none"
              />
            </div>

            {/* Poster Generator Banner / Highlight Action */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#002855] to-[#003B73] text-white border border-[#D4AF37]/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? "Share as Picture / Poster" : "Bagikan Berupa Gambar Poster Berlogo UMS"}</span>
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-stone-200">
                  {isEn ? "WA & Instagram Ready" : "Sesuai Permintaan Pak Dodi"}
                </span>
              </div>
              <p className="text-[11px] text-stone-200 leading-relaxed">
                {isEn
                  ? "Share an elegant Islamic poster featuring the official UMS & Sudalmiyah Mosque logo placed right above the text."
                  : "Kirimkan kartu poster hadits berlogo resmi UMS & Masjid Sudalmiyah di atas tulisan (gambar poster + teks caption)."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSharePosterWithCaption}
                  disabled={isGeneratingPoster}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Kirim gambar poster hadits ke WhatsApp beserta caption teksnya"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-100" />
                  <span>{isGeneratingPoster ? (isEn ? "Creating..." : "Membuat...") : (isEn ? "Kirim Poster + Teks ke WA" : "Kirim Poster + Teks ke WA")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  disabled={isGeneratingPoster}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Unduh file gambar poster hadits untuk disimpan ke galeri"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{isGeneratingPoster ? (isEn ? "Creating..." : "Membuat...") : (isEn ? "Unduh Gambar Poster (JPG)" : "Unduh Gambar Poster (JPG)")}</span>
                </button>
              </div>
            </div>

            {/* Copy Feedback Toast */}
            {copyFeedback && (
              <div className="mt-3 py-2 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{copyFeedback}</span>
              </div>
            )}

            {/* Action Buttons: Social Media & Copy */}
            <div className="mt-5 pt-4 border-t border-stone-100 space-y-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWA}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleShareFB}
                  className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Facebook</span>
                </button>

                {/* Instagram */}
                <button
                  type="button"
                  onClick={handleShareIG}
                  className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-90 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Instagram</span>
                </button>

                {/* TikTok */}
                <button
                  type="button"
                  onClick={handleShareTikTok}
                  className="px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-black active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>TikTok</span>
                </button>
              </div>

              {/* Copy & Native Share Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyText()}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-stone-600" />
                  <span>{isEn ? "Copy Full Text" : "Salin Seluruh Teks"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#003B73] hover:bg-[#002855] active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>{isEn ? "Share Directly" : "Bagikan Langsung"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
