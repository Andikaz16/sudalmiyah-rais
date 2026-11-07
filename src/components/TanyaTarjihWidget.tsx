"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  User,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { ChatHPTLogoIcon, SuryaMuhammadiyahLogo } from "./ChatHPTLogos";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  source?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Bagaimana tuntunan shalat Tarawih & Witir 11 rakaat?",
  "Apa bacaan doa iftitah menurut HPT Muhammadiyah?",
  "Bagaimana hukum qunut dalam shalat Subuh?",
  "Apa kriteria hisab Kalender Hijriyah Global Tunggal (KHGT)?",
  "Tuntunan shalat jamak dan qashar untuk mahasiswa musafir?",
  "Berapa kadar zakat fitrah dan bolehkah dengan uang?",
  "Apa bacaan ruku' dan sujud yang rajih dalam HPT?",
  "Bagaimana fatwa Majelis Tarjih tentang hukum rokok dan vape?",
  "Kapan sujud sahwi dikerjakan sebelum atau sesudah salam?",
  "Bagaimana shalat tahiyyatul masjid saat khatib sedang khutbah?",
];

export default function TanyaTarjihWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      sender: "ai",
      text: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di ChatHPT Masjid Sudalmiyah Rais Kampus 2 UMS. Saya siap membantu menjawab pertanyaan Anda seputar tata cara ibadah harian, fiqih shalat, adab, hisab KHGT, hingga fatwa persyarikatan berlandaskan Himpunan Putusan Tarjih (HPT) PP Muhammadiyah serta Al-Qur'an dan Sunnah shahihah.\n\nSilakan ketik pertanyaan Anda langsung di sini atau pilih topik populer di bawah.",
      source: "Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah",
      timestamp: "Baru saja",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tanya-tarjih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-4).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text:
          data.reply ||
          "Maaf, asisten sedang memproses jawaban. Silakan coba kembali.",
        source: data.source || "Himpunan Putusan Tarjih PP Muhammadiyah",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "fallback-" + Date.now(),
          sender: "ai",
          text: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nTerima kasih atas pertanyaan Anda. Layanan tetap dapat diakses dengan memilih topik populer di atas, atau Anda dapat merujuk lema kitab HPT langsung di portal resmi https://hpt.muhammadiyah.or.id.",
          source: "Majelis Tarjih & Tajdid PP Muhammadiyah",
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "initial-welcome-" + Date.now(),
        sender: "ai",
        text: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nPercakapan telah diperbarui. Silakan ajukan pertanyaan seputar tata cara ibadah, fiqih shalat, dzikir, atau fatwa Tarjih Muhammadiyah.",
        source: "Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah",
        timestamp: "Baru saja",
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Trigger Button - Always visible bottom-right */}
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
                Tanya Tarjih AI
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Modal Chat Dialog */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col w-full sm:w-[480px] md:w-[520px] h-full sm:h-[650px] bg-white sm:rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-fade-up">
          {/* Header Banner */}
          <div className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-stone-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ChatHPTLogoIcon className="w-7 h-7 text-stone-900" />
                <span className="font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight font-sans">
                  Chat<span className="font-black">HPT</span>
                </span>
              </div>
              <div className="h-6 w-px bg-stone-300" />
              <SuryaMuhammadiyahLogo className="w-7 h-7 text-[#003B73]" />
              <div className="hidden sm:flex flex-col">
                <span className="text-[11px] font-bold text-[#003B73] leading-tight">
                  Asisten AI Tarjih
                </span>
                <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Siap Menjawab
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleResetChat}
                title="Mulai percakapan baru"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Bersihkan obrolan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <a
                href="https://hpt.muhammadiyah.or.id"
                target="_blank"
                rel="noopener noreferrer"
                title="Kunjungi portal pusat hpt.muhammadiyah.or.id"
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Buka portal ChatHPT pusat"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup ChatHPT"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader info strip */}
          <div className="bg-[#0F1D32] px-4 py-2 flex items-center justify-between text-white text-[11px] shrink-0 border-b border-blue-950">
            <span className="text-stone-300 font-medium truncate pr-2">
              Tanya jawab fatwa &amp; fiqih ibadah langsung di sini.
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 shrink-0">
              Bebas Limit
            </span>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF8F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <SuryaMuhammadiyahLogo className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[86%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#003B73] text-white rounded-tr-xs"
                      : "bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

                  {/* AI Metadata & Actions */}
                  {msg.sender === "ai" && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-500 font-medium">
                      <div className="flex items-center gap-1 text-[#003B73] font-semibold truncate max-w-[240px]">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">{msg.source}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-stone-800 flex items-center gap-1 transition-colors cursor-pointer text-stone-500"
                          title="Salin jawaban"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">
                                Tersalin
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                        <span className="text-stone-300">•</span>
                        <a
                          href="https://hpt.muhammadiyah.or.id"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-500 hover:text-emerald-700 flex items-center gap-0.5 transition-colors"
                          title="Periksa lema di portal resmi"
                        >
                          <span>Portal HPT</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.sender === "user" ? "text-stone-300" : "text-stone-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 text-xs mt-1 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#003B73] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <SuryaMuhammadiyahLogo className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-stone-200/90 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-stone-600 shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#003B73] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-stone-700 font-medium">
                    Merujuk Putusan Tarjih...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Horizontal Scroll */}
          <div className="px-3.5 py-2 bg-stone-100 border-t border-stone-200 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
            <span className="text-[10px] font-bold text-stone-500 shrink-0 uppercase tracking-wider mr-1">
              Topik Populer:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-[#003B73] text-stone-700 hover:text-white border border-stone-300 text-[11px] whitespace-nowrap transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan fiqih, tata cara shalat, atau fatwa Tarjih..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Kirim pertanyaan"
                className="w-10 h-10 rounded-2xl bg-[#003B73] hover:bg-[#002855] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 px-1">
              <span>
                Korpus resmi Himpunan Putusan Tarjih (HPT) PP Muhammadiyah.
              </span>
              <a
                href="https://hpt.muhammadiyah.or.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>hpt.muhammadiyah.or.id</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
