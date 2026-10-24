"use client";

import React, { useState } from "react";
import { MessageCircle, ShieldCheck, Users, X, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface WhatsAppGroupWidgetProps {
  adminPhone?: string;
  adminName?: string;
}

export default function WhatsAppGroupWidget({
  adminPhone = "628122684688",
  adminName = "Bapak Dodi",
}: WhatsAppGroupWidgetProps) {
  const { language } = useLanguage();
  const isEn = language === "en";

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantRole, setApplicantRole] = useState("Mahasiswa UMS");
  const [customRole, setCustomRole] = useState("");

  const handleOpenWhatsappAdmin = () => {
    const finalRole = applicantRole === "Lainnya" ? (customRole || "Jamaah Umum") : applicantRole;
    const nameText = applicantName.trim() || (isEn ? "Congregant" : "Jamaah");

    const message = isEn
      ? `Assalamu'alaikum Warahmatullahi Wabarakatuh ${adminName}, my name is ${nameText} (${finalRole}). I would like to request permission to join the official UMS Campus Mosque Information WhatsApp Group. Thank you.`
      : `Assalamu'alaikum Warahmatullahi Wabarakatuh ${adminName}, nama saya ${nameText} (${finalRole}). Saya bermaksud memohon izin untuk bergabung ke Grup Informasi Resmi Masjid Kampus UMS. Mohon perkenan dan verifikasinya. Terima kasih.`;

    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section className="py-8 sm:py-12 bg-white text-stone-900 border-t border-stone-200/90 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B4619] via-[#0D5C22] to-[#003B73] p-6 sm:p-10 lg:p-12 text-white shadow-xl">
            {/* Background Decorative Pattern */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Information */}
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>
                    {isEn
                      ? "Official Campus Mosque Community • Admin Approval Required"
                      : "Komunitas Resmi Masjid Kampus • Wajib Verifikasi Admin"}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
                  {isEn ? (
                    <>
                      Join the <span className="text-emerald-300">Official Information Group</span> of UMS Campus Mosques
                    </>
                  ) : (
                    <>
                      Bergabung di <span className="text-emerald-300">Grup Informasi Resmi</span> Masjid Kampus UMS
                    </>
                  )}
                </h3>

                <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {isEn
                    ? "Receive weekly Friday khatib schedules, reminders for student religious circles, tabligh akbar dates, and official announcements directly on WhatsApp."
                    : "Dapatkan pengumuman berkala jadwal khatib & imam shalat Jumat 6 masjid kampus, agenda kajian mahasiswa, tabligh akbar, serta warta resmi takmir langsung di ponsel Anda."}
                </p>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-emerald-200/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isEn ? "Moderated & Free from Spammers" : "Terkurasi & Bebas Akun Spam"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isEn ? "Direct Access to Takmir Updates" : "Informasi Terverifikasi Pengurus"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isEn ? "UMS Civitas & Congregants" : "Sivitas Akademika & Jamaah"}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Trigger */}
              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-sm sm:text-base shadow-lg shadow-black/20 hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>{isEn ? "Join WhatsApp Group" : "Gabung Grup Informasi"}</span>
                </button>
                <p className="text-[11px] text-emerald-200/75 mt-2.5 text-center lg:text-right">
                  {isEn
                    ? `Verification supervised by ${adminName} (+${adminPhone.slice(0, 2)} ${adminPhone.slice(2, 5)}-${adminPhone.slice(5, 9)}-${adminPhone.slice(9)})`
                    : `Verifikasi diarahkan ke ${adminName} (+${adminPhone.slice(0, 2)} ${adminPhone.slice(2, 5)}-${adminPhone.slice(5, 9)}-${adminPhone.slice(9)})`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Dialog Verifikasi & Prosedur Bergabung */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-stone-900">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpenModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-xl font-bold font-serif text-stone-900">
                  {isEn ? "WhatsApp Group Verification" : "Verifikasi Masuk Grup WhatsApp"}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {isEn
                    ? "Official information forum for 6 UMS campus mosques."
                    : "Wadah informasi terpadu 6 masjid kampus Universitas Muhammadiyah Surakarta."}
                </p>
              </div>
            </div>

            {/* Notice Guard Card */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {isEn ? "Preventing Spammers & Bot Accounts" : "Antisipasi Akun Sembarangan & Spammer"}
                </span>
              </div>
              <p>
                {isEn
                  ? `In accordance with ${adminName}'s policy, every new member requires verification prior to approval to maintain group decorum and safety.`
                  : `Sesuai arahan pengurus (${adminName}), setiap calon anggota wajib melalui proses verifikasi terlebih dahulu demi menjaga ketertiban, kenyamanan ibadah, dan keamanan grup dari nomor asing/promosi sembarangan.`}
              </p>
            </div>

            {/* Form Verifikasi Singkat */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {isEn ? "Full Name / Congregant Name" : "Nama Lengkap / Nama Panggilan"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder={isEn ? "e.g. Ahmad Fauzi" : "Contoh: Ahmad Fauzi"}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {isEn ? "Status / Affiliation" : "Status / Sivitas"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                >
                  <option value="Mahasiswa UMS">Mahasiswa UMS</option>
                  <option value="Dosen UMS">Dosen UMS</option>
                  <option value="Tenaga Kependidikan (Tendik) UMS">Tenaga Kependidikan (Tendik) UMS</option>
                  <option value="Alumni UMS">Alumni UMS</option>
                  <option value="Jamaah Umum Masjid">Jamaah Umum Masjid</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {applicantRole === "Lainnya" && (
                <div>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder={isEn ? "Specify your status..." : "Tuliskan status atau instansi Anda..."}
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]"
                  />
                </div>
              )}
            </div>

            {/* Action Button & Explainer */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsappAdmin}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isEn
                    ? `Kirim Permohonan Izin ke ${adminName} (WhatsApp)`
                    : `Kirim Permohonan Izin ke ${adminName} (WhatsApp)`}
                </span>
              </button>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] leading-relaxed space-y-1">
                <p className="font-semibold text-stone-800">
                  {isEn ? "Why is this verification step necessary?" : "Mengapa melalui verifikasi WhatsApp?"}
                </p>
                <p>
                  {isEn
                    ? `After you send the request message, ${adminName} will review your identity and provide the official group invitation link directly via private WhatsApp message. This ensures the group remains clean, secure, and private.`
                    : `Setelah mengirim permohonan izin di atas, ${adminName} akan meninjau identitas Anda dan mengirimkan tautan grup secara langsung melalui pesan WhatsApp pribadi. Tautan grup tidak ditampilkan untuk publik agar terhindar dari spammer dan orang sembarangan.`}
                </p>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[11px] text-stone-400 text-center leading-relaxed">
              {isEn
                ? `Admin contact: ${adminName} (+62 812-2684-688). Automatically connects to WhatsApp.`
                : `Kontak admin: ${adminName} (+62 812-2684-688). Terhubung langsung ke WhatsApp.`}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
