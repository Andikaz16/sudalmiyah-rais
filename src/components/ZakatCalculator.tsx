"use client";

import React, { useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Info,
  TrendingUp,
  Coins,
  Wheat,
  Scale,
  Users,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// -------------------------------------------------------------
// KONSTANTA RESMI BAZNAS RI TAHUN 2026 M / 1447 H
// Berdasarkan Keputusan Ketua BAZNAS RI No. 14/2026 & No. 15/2026
// -------------------------------------------------------------
const BAZNAS_2026 = {
  // 1. Zakat Penghasilan & Jasa (SK BAZNAS No. 15/2026)
  nisabPenghasilanBulan: 7640144, // Rp7.640.144 / bulan
  nisabPenghasilanTahun: 91681728, // Rp91.681.728 / tahun
  kadarPenghasilan: 0.025, // 2.5%

  // 2. Zakat Maal (Emas & Tabungan)
  nisabEmasGram: 85, // 85 gram emas
  nisabMaalTahun: 91681728, // Rp91.681.728 (setara 85 gram emas 2026)
  nisabPerakGram: 595, // 595 gram perak
  kadarMaal: 0.025, // 2.5%

  // 3. Zakat Fitrah (SK BAZNAS No. 14/2026)
  fitrahNominalDefault: 50000, // Rp50.000 / jiwa secara nasional
  fitrahBerasKgPerJiwa: 2.5, // 2.5 kg beras per jiwa
  fitrahBerasLiterPerJiwa: 3.5, // 3.5 liter beras per jiwa

  // 4. Fidyah Puasa (SK BAZNAS RI 2026)
  fidyahPerHari: 65000, // Rp65.000 / jiwa / hari

  // 5. Zakat Pertanian (BAZNAS)
  nisabPertanianKgBeras: 653, // 653 kg beras
  nisabPertanianGabahBasahKg: 1000, // 1 ton gabah basah
  kadarPertanianIrigasi: 0.05, // 5% irigasi berbayar/teknis
  kadarPertanianAlami: 0.1, // 10% tadah hujan/alami
};

type ZakatTab = "penghasilan" | "maal" | "fitrah" | "fidyah" | "pertanian";

export default function ZakatCalculator() {
  const [activeTab, setActiveTab] = useState<ZakatTab>("penghasilan");

  // State: Zakat Penghasilan
  const [incomePeriod, setIncomePeriod] = useState<"bulan" | "tahun">("bulan");
  const [incomeCalculationMode, setIncomeCalculationMode] = useState<"bruto" | "netto">("bruto");
  const [mainSalary, setMainSalary] = useState<number>(8500000);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [basicExpenses, setBasicExpenses] = useState<number>(2500000);

  // State: Zakat Maal (Tabungan & Emas)
  const [savingsValue, setSavingsValue] = useState<number>(100000000);
  const [goldValue, setGoldValue] = useState<number>(0);
  const [businessAssets, setBusinessAssets] = useState<number>(0);
  const [shortTermDebts, setShortTermDebts] = useState<number>(0);
  const [isHaulMet, setIsHaulMet] = useState<boolean>(true);

  // State: Zakat Fitrah
  const [fitrahMembers, setFitrahMembers] = useState<number>(4);
  const [fitrahPriceMode, setFitrahPriceMode] = useState<"nasional" | "kustom">("nasional");
  const [fitrahCustomPrice, setFitrahCustomPrice] = useState<number>(50000);

  // State: Fidyah Puasa
  const [missedDays, setMissedDays] = useState<number>(7);

  // State: Zakat Pertanian
  const [harvestWeight, setHarvestWeight] = useState<number>(800); // dalam kg beras
  const [irrigationType, setIrrigationType] = useState<"irigasi" | "tadah_hujan">("irigasi");
  const [ricePricePerKg, setRicePricePerKg] = useState<number>(15000);

  // Helper format rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Math.max(0, val));
  };

  // -----------------------------------------------------------
  // KALKULASI 1: ZAKAT PENGHASILAN & JASA
  // -----------------------------------------------------------
  const nisabPenghasilanAktif =
    incomePeriod === "bulan"
      ? BAZNAS_2026.nisabPenghasilanBulan
      : BAZNAS_2026.nisabPenghasilanTahun;

  const totalPenghasilanKotor = mainSalary + otherIncome;
  const totalPenghasilanTerhitung =
    incomeCalculationMode === "bruto"
      ? totalPenghasilanKotor
      : Math.max(0, totalPenghasilanKotor - basicExpenses);

  const isPenghasilanObligatory = totalPenghasilanTerhitung >= nisabPenghasilanAktif;
  const zakatPenghasilanNominal = isPenghasilanObligatory
    ? Math.round(totalPenghasilanTerhitung * BAZNAS_2026.kadarPenghasilan)
    : 0;

  // -----------------------------------------------------------
  // KALKULASI 2: ZAKAT MAAL
  // -----------------------------------------------------------
  const totalHartaBersih = Math.max(
    0,
    savingsValue + goldValue + businessAssets - shortTermDebts
  );
  const isMaalObligatory = isHaulMet && totalHartaBersih >= BAZNAS_2026.nisabMaalTahun;
  const zakatMaalNominal = isMaalObligatory
    ? Math.round(totalHartaBersih * BAZNAS_2026.kadarMaal)
    : 0;

  // -----------------------------------------------------------
  // KALKULASI 3: ZAKAT FITRAH
  // -----------------------------------------------------------
  const tarifFitrahPerJiwa =
    fitrahPriceMode === "nasional" ? BAZNAS_2026.fitrahNominalDefault : fitrahCustomPrice;
  const totalFitrahRupiah = fitrahMembers * tarifFitrahPerJiwa;
  const totalFitrahBerasKg = fitrahMembers * BAZNAS_2026.fitrahBerasKgPerJiwa;
  const totalFitrahBerasLiter = fitrahMembers * BAZNAS_2026.fitrahBerasLiterPerJiwa;

  // -----------------------------------------------------------
  // KALKULASI 4: FIDYAH PUASA
  // -----------------------------------------------------------
  const totalFidyahRupiah = missedDays * BAZNAS_2026.fidyahPerHari;

  // -----------------------------------------------------------
  // KALKULASI 5: ZAKAT PERTANIAN
  // -----------------------------------------------------------
  const isPertanianObligatory = harvestWeight >= BAZNAS_2026.nisabPertanianKgBeras;
  const kadarPertanian =
    irrigationType === "irigasi"
      ? BAZNAS_2026.kadarPertanianIrigasi
      : BAZNAS_2026.kadarPertanianAlami;
  const zakatPertanianKg = isPertanianObligatory
    ? Math.round(harvestWeight * kadarPertanian * 10) / 10
    : 0;
  const zakatPertanianRupiah = Math.round(zakatPertanianKg * ricePricePerKg);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner Resmi Ketetapan BAZNAS RI 2026 */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0D5C58]/10 via-[#0D5C58]/5 to-[#D4AF37]/15 border border-[#0D5C58]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D5C58] text-white text-[11px] font-semibold">
            <Scale className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Ketetapan Resmi BAZNAS RI 2026 M / 1447 H</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
            Kalkulator Zakat & Fidyah Terstandarisasi Nasional
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
            Perhitungan akurat mengacu pada <strong>SK Ketua BAZNAS RI No. 14 Tahun 2026</strong> (Zakat Fitrah & Fidyah) serta <strong>SK Ketua BAZNAS RI No. 15 Tahun 2026</strong> (Nisab Zakat Pendapatan & Jasa).
          </p>
        </div>
        <div className="shrink-0 p-2.5 rounded-2xl bg-white border border-stone-200 shadow-2xs text-center hidden md:block">
          <span className="text-[10px] text-stone-400 block font-semibold uppercase">Nisab Bulanan 2026</span>
          <span className="text-xs font-bold text-[#0D5C58] font-mono">Rp7.640.144</span>
        </div>
      </div>

      {/* Tab Selector Navigasi */}
      <div className="flex gap-1.5 sm:gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "penghasilan", label: "Zakat Penghasilan", icon: TrendingUp },
          { id: "maal", label: "Zakat Maal & Emas", icon: Coins },
          { id: "fitrah", label: "Zakat Fitrah", icon: Users },
          { id: "fidyah", label: "Fidyah Puasa", icon: Calendar },
          { id: "pertanian", label: "Zakat Pertanian", icon: Wheat },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ZakatTab)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#0D5C58] text-white shadow-sm ring-2 ring-[#0D5C58]/20"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ZAKAT PENGHASILAN & JASA                          */}
      {/* ========================================================= */}
      {activeTab === "penghasilan" && (
        <div className="space-y-5 animate-fade-in">
          {/* Info Card Nisab BAZNAS 2026 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-[#0D5C58]">
                <Info className="w-4 h-4" />
                <span>Nisab Resmi Zakat Penghasilan (SK Ketua BAZNAS No. 15/2026)</span>
              </span>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-stone-200">
                Kadar: 2,5%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-500">Nisab Per Bulan: </span>
                <strong className="text-stone-900 font-mono">Rp7.640.144</strong>
              </div>
              <div>
                <span className="text-stone-500">Nisab Per Tahun: </span>
                <strong className="text-stone-900 font-mono">Rp91.681.728</strong>
                <span className="text-stone-400"> (setara 85g emas)</span>
              </div>
            </div>
          </div>

          {/* Pengaturan Parameter Kalkulator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs">
              <span className="text-stone-500 block mb-1.5 font-medium">Periode Perhitungan:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setIncomePeriod("bulan")}
                  className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    incomePeriod === "bulan"
                      ? "bg-[#0D5C58] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Bulanan (Rp7,64 Juta)
                </button>
                <button
                  onClick={() => setIncomePeriod("tahun")}
                  className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    incomePeriod === "tahun"
                      ? "bg-[#0D5C58] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Tahunan (Rp91,68 Juta)
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs">
              <span className="text-stone-500 block mb-1.5 font-medium">Metode Penghitungan BAZNAS:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setIncomeCalculationMode("bruto")}
                  className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    incomeCalculationMode === "bruto"
                      ? "bg-[#0D5C58] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Bruto / Kotor (Utama)
                </button>
                <button
                  onClick={() => setIncomeCalculationMode("netto")}
                  className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    incomeCalculationMode === "netto"
                      ? "bg-[#0D5C58] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Netto (Setelah Kebutuhan)
                </button>
              </div>
            </div>
          </div>

          {/* Form Input Nominal */}
          <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Gaji / Penghasilan Rutin Pokok ({incomePeriod === "bulan" ? "per Bulan" : "per Tahun"}):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={mainSalary}
                  onChange={(e) => setMainSalary(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Pendapatan Tambahan / Bonus / Tunjangan / Usaha Sampingan:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                />
              </div>
            </div>

            {incomeCalculationMode === "netto" && (
              <div className="animate-fade-in">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pengeluaran Kebutuhan Pokok & Hutang Jatuh Tempo ({incomePeriod === "bulan" ? "per Bulan" : "per Tahun"}):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={basicExpenses}
                    onChange={(e) => setBasicExpenses(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Kotak Hasil Zakat Penghasilan */}
          <div
            className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
              isPenghasilanObligatory
                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-stone-50 border-stone-200"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs">
              {isPenghasilanObligatory ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800">
                    Telah Mencapai Nisab BAZNAS ({formatRupiah(nisabPenghasilanAktif)})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-stone-400" />
                  <span className="font-semibold text-stone-600">
                    Belum Mencapai Batas Nisab BAZNAS ({formatRupiah(nisabPenghasilanAktif)})
                  </span>
                </>
              )}
            </div>

            <span className="text-xs text-stone-500 block">
              Kewajiban Zakat Penghasilan (2,5% {incomePeriod === "bulan" ? "per Bulan" : "per Tahun"}):
            </span>

            <span className="text-3xl sm:text-4xl font-black text-[#0D5C58] tracking-tight block font-mono">
              {formatRupiah(zakatPenghasilanNominal)}
            </span>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed">
              {isPenghasilanObligatory
                ? "Wajib dikeluarkan sebagai zakat profesi/penghasilan setiap menerima rezeki sesuai ketentuan syariat."
                : "Tidak ada kewajiban zakat mengikat, namun Anda sangat dianjurkan untuk menyisihkan infaq dan sedekah sukarela."}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ZAKAT MAAL (HARTA, EMAS, TABUNGAN, PERDAGANGAN)     */}
      {/* ========================================================= */}
      {activeTab === "maal" && (
        <div className="space-y-5 animate-fade-in">
          {/* Ketentuan Nisab Maal BAZNAS 2026 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-[#0D5C58]">
                <Coins className="w-4 h-4" />
                <span>Ketentuan Zakat Maal BAZNAS (Harta Simpanan 1 Tahun / Haul)</span>
              </span>
              <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-stone-200">
                Kadar: 2,5%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-500">Nisab Emas (85 gram): </span>
                <strong className="text-stone-900 font-mono">Rp91.681.728</strong>
              </div>
              <div>
                <span className="text-stone-500">Nisab Perak (595 gram): </span>
                <span className="text-stone-700">Setara nilai 595g perak murni</span>
              </div>
            </div>
          </div>

          {/* Form Input Komponen Harta */}
          <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Total Tabungan, Deposito & Giro (Tersimpan 1 Tahun):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={savingsValue}
                  onChange={(e) => setSavingsValue(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nilai Emas / Logam Mulia Simpanan:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={goldValue}
                    onChange={(e) => setGoldValue(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Aset Lancar Perdagangan / Saham:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={businessAssets}
                    onChange={(e) => setBusinessAssets(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Hutang Jangka Pendek Jatuh Tempo Saat Haul (Pengurang):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={shortTermDebts}
                  onChange={(e) => setShortTermDebts(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
                />
              </div>
            </div>

            {/* Checkbox Haul 1 Tahun */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={isHaulMet}
                  onChange={(e) => setIsHaulMet(e.target.checked)}
                  className="w-4 h-4 accent-[#0D5C58] rounded cursor-pointer"
                />
                <span>Harta telah genap dimiliki selama 1 tahun Hijriah (memenuhi syarat <em>haul</em>).</span>
              </label>
            </div>
          </div>

          {/* Kotak Hasil Zakat Maal */}
          <div
            className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
              isMaalObligatory
                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-stone-50 border-stone-200"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs">
              {isMaalObligatory ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800">
                    Total Harta ({formatRupiah(totalHartaBersih)}) Telah Memenuhi Nisab & Haul
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-stone-400" />
                  <span className="font-semibold text-stone-600">
                    {!isHaulMet
                      ? "Syarat Haul Belum Terpenuhi (Belum Genap 1 Tahun)"
                      : `Harta (${formatRupiah(totalHartaBersih)}) Belum Mencapai Nisab Rp91.681.728`}
                  </span>
                </>
              )}
            </div>

            <span className="text-xs text-stone-500 block">
              Kewajiban Zakat Maal (2,5% per Tahun):
            </span>

            <span className="text-3xl sm:text-4xl font-black text-[#0D5C58] tracking-tight block font-mono">
              {formatRupiah(zakatMaalNominal)}
            </span>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed">
              Zakat maal dikeluarkan setahun sekali saat harta telah mencapai haul (1 tahun) dan nisab emas 85 gram.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ZAKAT FITRAH (RAMADAN 1447 H / 2026 M)              */}
      {/* ========================================================= */}
      {activeTab === "fitrah" && (
        <div className="space-y-5 animate-fade-in">
          {/* Info Card SK BAZNAS RI No. 14/2026 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-[#0D5C58]">
                <Users className="w-4 h-4" />
                <span>Ketetapan Zakat Fitrah Ramadan 1447 H / 2026 M (SK BAZNAS RI No. 14/2026)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-500">Nilai Uang Nasional: </span>
                <strong className="text-stone-900 font-mono">Rp50.000 / jiwa</strong>
              </div>
              <div>
                <span className="text-stone-500">Beras / Bahan Pokok: </span>
                <strong className="text-stone-900">2,5 kg atau 3,5 liter</strong>
                <span className="text-stone-400"> beras premium per jiwa</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-500 pt-1">
              Catatan: BAZNAS daerah tertentu dapat menyesuaikan nilai uang sesuai harga beras lokal (misal: Rp45.000 - Rp54.000).
            </p>
          </div>

          {/* Form Input Zakat Fitrah */}
          <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Jumlah Jiwa / Anggota Keluarga yang Wajib Dibayarkan:
              </label>
              <input
                type="number"
                min={1}
                value={fitrahMembers}
                onChange={(e) => setFitrahMembers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
              />
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                Pilihan Acuan Tarif Zakat Fitrah:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setFitrahPriceMode("nasional")}
                  className={`p-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-left ${
                    fitrahPriceMode === "nasional"
                      ? "bg-[#0D5C58]/10 border-[#0D5C58] text-[#0D5C58]"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="block font-bold">Standar BAZNAS Nasional</span>
                  <span className="text-[11px] text-stone-500 font-mono">Rp50.000 / jiwa</span>
                </button>

                <button
                  onClick={() => setFitrahPriceMode("kustom")}
                  className={`p-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-left ${
                    fitrahPriceMode === "kustom"
                      ? "bg-[#0D5C58]/10 border-[#0D5C58] text-[#0D5C58]"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="block font-bold">Sesuaikan Daerah</span>
                  <span className="text-[11px] text-stone-500">Kustomisasi nominal per jiwa</span>
                </button>
              </div>
            </div>

            {fitrahPriceMode === "kustom" && (
              <div className="animate-fade-in">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nominal Beras Daerah per Jiwa (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                  <input
                    type="number"
                    value={fitrahCustomPrice}
                    onChange={(e) => setFitrahCustomPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono text-stone-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Kotak Hasil Zakat Fitrah */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center space-y-3 shadow-2xs">
            <span className="text-xs text-stone-500 block">
              Total Pembayaran Zakat Fitrah ({fitrahMembers} Jiwa):
            </span>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#0D5C58] tracking-tight block font-mono">
                {formatRupiah(totalFitrahRupiah)}
              </span>
              <span className="text-xs text-stone-600 font-semibold block">
                Atau bila dalam bentuk beras: <strong>{totalFitrahBerasKg.toFixed(1)} Kg</strong> ({totalFitrahBerasLiter.toFixed(1)} Liter beras premium)
              </span>
            </div>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed border-t border-stone-100 pt-2">
              Wajib ditunaikan sejak awal bulan Ramadan hingga sebelum dimulainya shalat Idul Fitri 1 Syawal 1447 H.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FIDYAH PUASA                                       */}
      {/* ========================================================= */}
      {activeTab === "fidyah" && (
        <div className="space-y-5 animate-fade-in">
          {/* Ketetapan BAZNAS RI Fidyah 2026 */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-[#0D5C58]">
                <Calendar className="w-4 h-4" />
                <span>Ketetapan Fidyah BAZNAS RI Tahun 2026</span>
              </span>
              <strong className="text-stone-900 font-mono">Rp65.000 / jiwa / hari</strong>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
              Fidyah diperuntukkan bagi kaum muslimin yang tidak mampu menjalankan puasa Ramadan karena udzur syar'i permanen (orang tua renta atau sakit menahun tanpa harapan sembuh), setara dengan 1 porsi makan bergizi untuk fakir miskin.
            </p>
          </div>

          {/* Form Input Hari Puasa */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Jumlah Hari Puasa yang Ditinggalkan (Hari):
              </label>
              <input
                type="number"
                min={1}
                value={missedDays}
                onChange={(e) => setMissedDays(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
              />
            </div>
          </div>

          {/* Kotak Hasil Fidyah */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200 text-center space-y-2 shadow-2xs">
            <span className="text-xs text-stone-500 block">
              Total Fidyah yang Wajib Disalurkan ({missedDays} Hari):
            </span>

            <span className="text-3xl sm:text-4xl font-black text-[#0D5C58] tracking-tight block font-mono">
              {formatRupiah(totalFidyahRupiah)}
            </span>

            <span className="text-xs text-stone-600 block">
              Setara dengan santunan makan bergizi untuk <strong>{missedDays} porsi / {missedDays} orang mustahik fakir miskin</strong>.
            </span>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed border-t border-stone-100 pt-2">
              Dapat dibayarkan secara harian pada hari puasa ditinggalkan atau diakumulasikan sekaligus di akhir bulan Ramadan.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: ZAKAT PERTANIAN (PANEN PADI / GABAH)               */}
      {/* ========================================================= */}
      {activeTab === "pertanian" && (
        <div className="space-y-5 animate-fade-in">
          {/* Ketentuan BAZNAS Pertanian */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-stone-900 border-b border-stone-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-[#0D5C58]">
                <Wheat className="w-4 h-4" />
                <span>Ketentuan Zakat Pertanian / Hasil Tani BAZNAS</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-500">Nisab Hasil Panen: </span>
                <strong className="text-stone-900 font-mono">653 kg beras</strong>
                <span className="text-stone-400"> (atau 1 ton gabah basah)</span>
              </div>
              <div>
                <span className="text-stone-500">Kadar Pengairan: </span>
                <strong className="text-stone-900">5%</strong> (Irigasi Pompa/Teknis) / <strong className="text-stone-900">10%</strong> (Tadah Hujan)
              </div>
            </div>
            <p className="text-[10px] text-stone-500 pt-1">
              Zakat pertanian wajib ditunaikan seketika saat panen tanpa mensyaratkan berlalunya satu tahun (haul).
            </p>
          </div>

          {/* Form Input Pertanian */}
          <div className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Total Hasil Panen Bersih (Kg Beras atau Ekuivalen):
              </label>
              <input
                type="number"
                value={harvestWeight}
                onChange={(e) => setHarvestWeight(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-mono text-stone-900 focus:outline-none focus:border-[#0D5C58]"
              />
            </div>

            <div>
              <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                Jenis Sumber Pengairan Sawah / Kebun:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setIrrigationType("irigasi")}
                  className={`p-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-left ${
                    irrigationType === "irigasi"
                      ? "bg-[#0D5C58]/10 border-[#0D5C58] text-[#0D5C58]"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="block font-bold">Irigasi Berbayar / Pompa Teknis</span>
                  <span className="text-[11px] text-stone-500">Kadar zakat lebih ringan: 5%</span>
                </button>

                <button
                  onClick={() => setIrrigationType("tadah_hujan")}
                  className={`p-2.5 rounded-xl border font-semibold transition-all cursor-pointer text-left ${
                    irrigationType === "tadah_hujan"
                      ? "bg-[#0D5C58]/10 border-[#0D5C58] text-[#0D5C58]"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span className="block font-bold">Tadah Hujan / Aliran Sungai Alami</span>
                  <span className="text-[11px] text-stone-500">Tanpa biaya operasional air: 10%</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Perkiraan Harga Beras per Kg (untuk konversi Rupiah):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={ricePricePerKg}
                  onChange={(e) => setRicePricePerKg(Number(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Kotak Hasil Zakat Pertanian */}
          <div
            className={`p-5 rounded-2xl border text-center space-y-2 transition-all ${
              isPertanianObligatory
                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-stone-50 border-stone-200"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs">
              {isPertanianObligatory ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-800">
                    Hasil Panen ({harvestWeight} Kg) Telah Melampaui Nisab 653 Kg Beras
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-stone-400" />
                  <span className="font-semibold text-stone-600">
                    Hasil Panen ({harvestWeight} Kg) Belum Mencapai Batas Nisab 653 Kg Beras
                  </span>
                </>
              )}
            </div>

            <span className="text-xs text-stone-500 block">
              Zakat Hasil Pertanian yang Wajib Dikeluarkan (Kadar {(kadarPertanian * 100).toFixed(0)}%):
            </span>

            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-[#0D5C58] tracking-tight block font-mono">
                {zakatPertanianKg.toFixed(1)} Kg Beras
              </span>
              <span className="text-sm font-bold text-stone-700 block font-mono">
                atau setara {formatRupiah(zakatPertanianRupiah)}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 max-w-md mx-auto leading-relaxed border-t border-stone-100 pt-2">
              Dikeluarkan pada hari panen tiba sebagaimana firman Allah: "dan tunaikanlah haknya (zakatnya) di hari memetik hasilnya" (QS. Al-An'am: 141).
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKSI SUMBER RUJUKAN RESMI BAZNAS RI                       */}
      {/* ========================================================= */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm text-left space-y-3.5 text-xs text-stone-700">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Info className="w-4 h-4 text-[#0D5C58] shrink-0" />
          <h3 className="font-bold text-stone-900 text-sm font-serif">
            Sumber Data Resmi Badan Amil Zakat Nasional (BAZNAS) RI
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
            <h5 className="font-bold text-[#0D5C58]">1. SK Ketua BAZNAS RI No. 15 Tahun 2026:</h5>
            <p className="text-[11px] text-stone-600">
              Menetapkan nisab zakat pendapatan dan jasa tahun 2026 mengacu pada 85 gram emas, yaitu sebesar <strong>Rp91.681.728 per tahun</strong> atau <strong>Rp7.640.144 per bulan</strong> dengan kadar zakat 2,5% dari penghasilan yang telah mencapai nisab.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
            <h5 className="font-bold text-[#0D5C58]">2. SK Ketua BAZNAS RI No. 14 Tahun 2026:</h5>
            <p className="text-[11px] text-stone-600">
              Menetapkan nilai zakat fitrah tahun 1447 H / 2026 M setara dengan <strong>2,5 kg atau 3,5 liter beras premium per jiwa</strong>, atau nilai uang tunai sebesar <strong>Rp50.000 per jiwa</strong> secara nasional. Serta fidyah puasa ditetapkan sebesar <strong>Rp65.000 per jiwa / hari</strong>.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 text-[11px] text-stone-600">
          <h5 className="font-bold text-[#0D5C58]">3. Ketentuan Zakat Maal & Pertanian:</h5>
          <p>
            Zakat Maal (tabungan, emas, perdagangan) wajib dikeluarkan 2,5% bila telah mencapai nisab emas 85 gram (Rp91.681.728) dan genap haul 1 tahun hijriah. Adapun zakat pertanian dikeluarkan seketika saat panen apabila mencapai nisab 653 kg beras (kadar 5% untuk irigasi teknis/berbayar atau 10% untuk tadah hujan alami).
          </p>
        </div>
      </div>
    </div>
  );
}
