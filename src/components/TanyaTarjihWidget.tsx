"use client";

import React, { useState } from "react";
import { X, Search, ExternalLink, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { TARJIH_KNOWLEDGE_BASE, TarjihTopic } from "@/data/tarjihKnowledge";
import { ChatHPTLogoIcon, SuryaMuhammadiyahLogo } from "./ChatHPTLogos";

export default function TanyaTarjihWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<TarjihTopic | null>(null);

  const filteredTopics = TARJIH_KNOWLEDGE_BASE.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* Floating Action Trigger Button - positioned on bottom-right above mobile bottom nav */}
      <div className="fixed bottom-24 sm:bottom-24 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka ChatHPT - Asisten AI Tarjih Muhammadiyah"
            className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white font-semibold text-xs sm:text-sm shadow-xl border border-amber-400/50 hover:border-amber-300 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <div className="relative w-8 h-8 rounded-full bg-white text-[#003B73] flex items-center justify-center shrink-0 shadow-xs group-hover:rotate-6 transition-transform">
              <SuryaMuhammadiyahLogo className="w-5 h-5 text-[#003B73]" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#003B73] animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-extrabold tracking-tight text-white text-xs sm:text-sm">
                ChatHPT
              </span>
              <span className="text-[10px] text-amber-200/90 font-medium leading-tight">
                Asisten AI Tarjih
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col w-full sm:w-[460px] md:w-[500px] h-full sm:h-[640px] bg-white sm:rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-fade-up">
          {/* Header Banner - Matching ChatHPT Logo Banner */}
          <div className="bg-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-200 shrink-0">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <ChatHPTLogoIcon className="w-7 h-7 text-stone-900" />
                  <span className="font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight font-sans">
                    Chat<span className="font-black">HPT</span>
                  </span>
                </div>
                <div className="h-6 w-px bg-stone-300" />
                <SuryaMuhammadiyahLogo className="w-7 h-7 text-[#003B73]" />
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-[#003B73] mt-1 tracking-wide">
                Asisten AI Tarjih Muhammadiyah
              </p>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedTopic(null);
              }}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup ChatHPT"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF8F5]">
            {/* Visual Card (Matching WhatsApp forward screenshot sent by Pak Dodi) */}
            <div className="rounded-2xl bg-[#0F1D32] border border-blue-900/60 p-4 sm:p-5 text-white space-y-3 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950">
                    Resmi PP Muhammadiyah
                  </span>
                  <span className="text-[11px] text-blue-300 font-mono">
                    hpt.muhammadiyah.or.id
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold font-serif text-white pt-1">
                  ChatHPT — Asisten AI Tarjih Muhammadiyah
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Berangkat dari Himpunan Putusan Tarjih, ChatHPT membantu menelusuri dan memahami putusan, fatwa, dan tanya jawab agama.
                </p>
              </div>

              {/* Pak Dodi Quote */}
              <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-amber-200 leading-relaxed font-sans italic">
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

              {/* Direct Open Button */}
              <a
                href="https://hpt.muhammadiyah.or.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Buka ChatHPT Resmi (Bebas Limit)</span>
                <ExternalLink className="w-4 h-4 text-emerald-200" />
              </a>
            </div>

            {/* Offline & Instant Knowledge Base Directory */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#003B73]" />
                  <span>Direktori Putusan Tarjih Cepat (Instan)</span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">Bebas Limit</span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedTopic(null);
                  }}
                  placeholder="Cari topik fatwa: tarawih, iftitah, qunut, zakat..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]"
                />
              </div>

              {/* Active Topic Detail View */}
              {selectedTopic && (
                <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-2.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#003B73] uppercase tracking-wider">
                        Putusan Resmi HPT
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-stone-900 font-serif">
                        {selectedTopic.title}
                      </h5>
                    </div>
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="text-[10px] text-stone-400 hover:text-stone-700 underline font-medium cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
                    <div>
                      <p className="font-semibold text-stone-900">Ringkasan Hukum:</p>
                      <p className="text-stone-700 mt-0.5">{selectedTopic.summary}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <p className="font-semibold text-stone-900">Putusan Tarjih:</p>
                      <p className="text-stone-800 mt-0.5 whitespace-pre-wrap">{selectedTopic.putusanTarjih}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-stone-900">Dalil Rujukan:</p>
                      <p className="italic text-stone-600 mt-0.5">{selectedTopic.dalil}</p>
                    </div>

                    <div className="text-[10px] text-[#003B73] font-medium pt-1 border-t border-stone-100 flex items-center justify-between">
                      <span>Sumber: {selectedTopic.source}</span>
                      <a
                        href="https://hpt.muhammadiyah.or.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>ChatHPT</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* List of Knowledge Topics */}
              {!selectedTopic && (
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-800 group-hover:text-[#003B73] transition-colors truncate">
                          {topic.title}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">
                          {topic.summary}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#003B73] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                  {filteredTopics.length === 0 && (
                    <div className="p-4 rounded-xl bg-white border border-stone-200 text-center space-y-2">
                      <p className="text-xs text-stone-500">
                        Topik &ldquo;{searchQuery}&rdquo; belum ada di direktori ringkas.
                      </p>
                      <a
                        href="https://hpt.muhammadiyah.or.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                      >
                        <span>Tanyakan langsung di ChatHPT Resmi</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0 text-center space-y-1">
            <p className="text-[11px] text-stone-500">
              Layanan resmi kerja sama Majelis Tarjih &amp; Tajdid, MPI, dan LabMu PP Muhammadiyah.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
