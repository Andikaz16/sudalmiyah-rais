"use client";

import React from "react";
import { Sparkles, ShieldCheck, BookOpen, ExternalLink, CheckCircle2 } from "lucide-react";
import ChatHPTCard from "./ChatHPTCard";
import { useLanguage } from "@/context/LanguageContext";

export default function ChatHPTSection() {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <section id="chathpt" className="py-12 sm:py-16 bg-[#FAF8F5] text-stone-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Descriptive Context */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003B73]/10 border border-[#003B73]/20 text-[#003B73] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#B58A1E]" />
              <span>
                {isEn ? "Official Muhammadiyah Tarjih AI" : "Asisten AI Resmi Majelis Tarjih PP Muhammadiyah"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
              {isEn ? (
                <>
                  Effortless Islamic Consultation with{" "}
                  <span className="text-[#003B73]">ChatHPT</span>
                </>
              ) : (
                <>
                  Konsultasi Fatwa &amp; Ibadah Praktis Bersama{" "}
                  <span className="text-[#003B73]">ChatHPT</span>
                </>
              )}
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed">
              {isEn
                ? "Developed by the Tarjih and Tajdid Council with MPI PP Muhammadiyah, ChatHPT enables students, lecturers, mubalighs, and congregants to explore decisions, fatwas, and questions based directly on the authoritative Himpunan Putusan Tarjih (HPT)."
                : "Dikembangkan resmi oleh Majelis Tarjih dan Tajdid bersama MPI PP Muhammadiyah, ChatHPT memudahkan sivitas akademika UMS, mubaligh, dan jamaah menelusuri serta memahami putusan, fatwa, dan tanya jawab agama berlandaskan korpus resmi Himpunan Putusan Tarjih (HPT)."}
            </p>

            {/* Value Points */}
            <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? "Directly connected to thousands of authentic HPT decisions and fatwas."
                    : "Terhubung langsung dengan ribuan putusan HPT, fatwa, dan tanya jawab resmi."}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? "Official PP Muhammadiyah cloud infrastructure without third-party API limits."
                    : "Infrastruktur komputasi resmi PP Muhammadiyah, stabil dan bebas kendala kuota limit."}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isEn
                    ? "Interactive, natural conversational interface for easy daily learning."
                    : "Interaksi percakapan natural dan mudah dipahami untuk kajian harian maupun mimbar."}
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2">
              <a
                href="https://hpt.muhammadiyah.or.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#003B73] hover:bg-[#002855] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span>{isEn ? "Explore ChatHPT Portal" : "Kunjungi Portal ChatHPT Resmi"}</span>
                <ExternalLink className="w-4 h-4 text-amber-300" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Preview Card matching Pak Dodi's screenshot */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md">
              <ChatHPTCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
