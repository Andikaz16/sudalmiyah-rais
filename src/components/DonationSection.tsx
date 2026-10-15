"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { QrisSettings } from "@/lib/types";

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
  merchantName: "MASJID SUDALMIYAH RAIS UMS",
  nmid: "ID1020260389100",
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
    fetch("/api/qris")
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
    link.download = `QRIS-Masjid-Sudalmiyah.png`;
    link.href = qris.imageUrl || "/images/qris-sudalmiyah.png";
    link.target = "_blank";
    link.click();
  };

  const currentHadith = INFAQ_HADITHS[currentHadithIndex];

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

          {/* Navigation Controls: Arrows and Dots */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-5">
            <button
              onClick={prevHadith}
              aria-label="Hadits Sebelumnya"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 8 Dots Pagination */}
            <div className="flex items-center gap-1.5">
              {INFAQ_HADITHS.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => setCurrentHadithIndex(idx)}
                  aria-label={`Pindah ke hadits ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentHadithIndex
                      ? "w-7 bg-gradient-to-r from-amber-300 to-amber-400 shadow-sm"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextHadith}
              aria-label="Hadits Berikutnya"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
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
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Official QRIS Stand Card (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm rounded-3xl bg-[#FAF8F5] border-2 border-stone-200 p-5 sm:p-6 shadow-inner text-center">
                {/* Official QRIS Header */}
                <div className="bg-rose-700 text-white rounded-xl py-2 px-4 shadow-sm mb-4">
                  <div className="font-extrabold text-xl tracking-wider">QRIS</div>
                  <div className="text-[9px] uppercase tracking-wider opacity-90">
                    Quick Response Code Indonesian Standard
                  </div>
                </div>

                {/* Merchant Name & NMID */}
                <div className="mb-4">
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    {qris.merchantName || "MASJID SUDALMIYAH RAIS UMS"}
                  </h3>
                  <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                    NMID: {qris.nmid || "ID1020260389100"}
                  </div>
                  <div className="text-[10px] text-stone-400">
                    {qris.institution || "Universitas Muhammadiyah Surakarta"}
                  </div>
                </div>

                {/* QRIS Image Container */}
                <div className="relative w-full aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm flex items-center justify-center p-2">
                  <Image
                    src={qris.imageUrl || "/images/qris-sudalmiyah.png"}
                    alt={`QRIS ${qris.merchantName}`}
                    fill
                    unoptimized
                    priority
                    className="object-contain p-2"
                  />
                </div>

                {/* Download QRIS Button - Pure Text */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadQRIS}
                    className="w-full text-center px-4 py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
                  >
                    Unduh Gambar QRIS
                  </button>
                </div>

                {/* Supported Apps List */}
                <div className="mt-4 pt-3 border-t border-stone-200/80 text-[10px] text-stone-500 leading-relaxed">
                  Mendukung BCA, Mandiri, BSI, BRI, BNI, GoPay, OVO, ShopeePay, DANA, LinkAja, dan seluruh aplikasi perbankan berstandar QRIS.
                </div>
              </div>
            </div>

            {/* Right Column: Panduan Scan QRIS & Amanah Penyaluran (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#003B73]">
                  Kemudahan Berinfaq Digital
                </span>
                <h3 className="text-xl sm:text-3xl font-bold text-stone-900 mt-1 font-serif">
                  Panduan Pembayaran QRIS
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                  Infaq dapat ditunaikan secara langsung tanpa perlu repot mencatat nomor rekening. Cukup scan kode QRIS melalui ponsel pintar Anda kapan pun dan di mana pun.
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Buka Aplikasi Mobile Banking atau E-Wallet
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Gunakan aplikasi perbankan favorit Anda (BSI Mobile, Livin Mandiri, BCA Mobile, BRImo) atau dompet digital (GoPay, OVO, DANA, ShopeePay, LinkAja).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Pilih Menu Pindai (Scan) QRIS
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Arahkan kamera ponsel Anda ke kode QRIS di samping, atau pilih gambar QRIS yang telah diunduh dari galeri ponsel.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Pastikan Nama Penerima &amp; Masukkan Nominal
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Periksa nama merchant: <strong className="text-stone-900">{qris.merchantName || "MASJID SUDALMIYAH RAIS UMS"}</strong>, kemudian ketik nominal infaq sesuai keikhlasan hati Anda.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
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

              {/* Amanah & Keamanan Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/50 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#003B73]/10 text-[#003B73] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#003B73]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      Amanah & Standar Nasional Bank Indonesia
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

          </div>
        </div>

      </div>
    </section>
  );
}
