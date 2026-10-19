"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { QrisSettings } from "@/lib/types";

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

  return (
    <section id="donasi" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </section>
  );
}
