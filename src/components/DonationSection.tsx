"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { QrisSettings } from "@/lib/types";

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

  return (
    <section id="donasi" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight font-serif">
            Infaq Digital <span className="text-[#0D5C58]">QRIS</span>
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
                    className="w-full text-center px-4 py-3 rounded-full bg-[#0D5C58] hover:bg-[#094744] text-white text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#0D5C58]">
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
                  <div className="w-7 h-7 rounded-xl bg-[#0D5C58] text-white text-xs font-bold flex items-center justify-center shrink-0">
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
                  <div className="w-7 h-7 rounded-xl bg-[#0D5C58] text-white text-xs font-bold flex items-center justify-center shrink-0">
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
                  <div className="w-7 h-7 rounded-xl bg-[#0D5C58] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                      Pastikan Nama Penerima & Masukkan Nominal
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                      Periksa nama merchant: <strong className="text-stone-900">{qris.merchantName || "MASJID SUDALMIYAH RAIS UMS"}</strong>, kemudian ketik nominal infaq sesuai keikhlasan hati Anda.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#0D5C58] text-white text-xs font-bold flex items-center justify-center shrink-0">
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
                  <div className="w-9 h-9 rounded-xl bg-[#0D5C58]/10 text-[#0D5C58] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#0D5C58]" />
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
