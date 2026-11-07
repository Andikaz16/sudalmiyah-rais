import React from "react";
import { ExternalLink, Sparkles, BookOpen } from "lucide-react";
import { ChatHPTLogoIcon, SuryaMuhammadiyahLogo } from "./ChatHPTLogos";

interface ChatHPTCardProps {
  className?: string;
  compact?: boolean;
}

export default function ChatHPTCard({ className = "", compact = false }: ChatHPTCardProps) {
  return (
    <div
      className={`rounded-3xl overflow-hidden border border-stone-200/90 shadow-xl bg-white flex flex-col ${className}`}
    >
      {/* Top Banner (White Card exactly like in the forward screenshot) */}
      <div className="bg-white p-6 sm:p-8 flex flex-col items-center justify-center text-center border-b border-stone-200 relative">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo ChatHPT */}
          <div className="flex items-center gap-2.5">
            <ChatHPTLogoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-stone-900" />
            <span className="font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight font-sans">
              Chat<span className="font-black">HPT</span>
            </span>
          </div>

          {/* Divider bar */}
          <div className="h-8 sm:h-10 w-px bg-stone-300" />

          {/* Logo Surya Muhammadiyah */}
          <SuryaMuhammadiyahLogo className="w-8 h-8 sm:w-10 sm:h-10 text-[#003B73]" />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-bold text-[#003B73] mt-2 tracking-wide font-sans">
          Asisten AI Tarjih Muhammadiyah
        </p>

        {/* Blue accent stripe underneath */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#003B73] via-[#1E3A8A] to-[#003B73]" />
      </div>

      {/* Bottom Card Preview (Navy WhatsApp Preview style matching screenshot) */}
      <div className="p-6 sm:p-8 bg-[#0F1D32] text-white flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          {/* Title & Domain */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950">
                Resmi PP Muhammadiyah
              </span>
              <span className="text-[11px] text-blue-300/90 font-mono">
                hpt.muhammadiyah.or.id
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-serif text-white leading-snug">
              ChatHPT — Asisten AI Tarjih Muhammadiyah
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Berangkat dari Himpunan Putusan Tarjih, ChatHPT membantu menelusuri dan memahami putusan, fatwa, dan tanya jawab agama secara cerdas dan interaktif.
            </p>
          </div>

          {/* Quotation from Takmir/Pengurus Message */}
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-xs sm:text-sm text-amber-200 leading-relaxed font-sans italic">
            &ldquo;Tidak akan kesulitan lagi bertanya ttg fatwa fatwa agama, khususnya fatwa fatwa Tarjih Muhammadiyah. Akses{" "}
            <a
              href="https://hpt.muhammadiyah.or.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 underline font-semibold not-italic hover:text-emerald-200"
            >
              https://hpt.muhammadiyah.or.id
            </a>
            &rdquo;
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href="https://hpt.muhammadiyah.or.id"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-100" />
            <span>Buka ChatHPT Resmi (hpt.muhammadiyah.or.id)</span>
            <ExternalLink className="w-4 h-4 text-emerald-100" />
          </a>
        </div>
      </div>
    </div>
  );
}
