"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Copy, Check, ChevronDown } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  source?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Bagaimana tuntunan shalat Tarawih & Witir menurut Tarjih?",
  "Apa bacaan doa iftitah menurut HPT Muhammadiyah?",
  "Bagaimana hukum qunut shalat Subuh menurut Majelis Tarjih?",
  "Apa kriteria hisab Kalender Hijriyah Global Tunggal (KHGT)?",
  "Tuntunan shalat jamak dan qashar untuk mahasiswa musafir?",
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
      text: "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di Layanan Tanya Tarjih AI Masjid Sudalmiyah Rais Kampus 2 UMS. Saya siap membantu menjawab pertanyaan Anda seputar tata cara ibadah harian, fiqih, dan fatwa persyarikatan berlandaskan Himpunan Putusan Tarjih (HPT) PP Muhammadiyah serta Al-Qur'an dan Sunnah shahihah.\n\nSilakan pilih topik di bawah atau ketikkan pertanyaan Anda.",
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
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tanya-tarjih", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.reply || "Maaf, terjadi kendala saat memproses jawaban. Silakan coba kembali.",
        source: data.source,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "ai",
          text: "Mohon maaf, koneksi ke asisten Tarjih terputus. Silakan periksa jaringan dan coba lagi.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
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

  return (
    <>
      {/* Floating Action Trigger Button - positioned above MobileBottomNav on small screens */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka Tanya Tarjih AI"
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[#003B73] hover:bg-[#002855] text-white font-semibold text-xs sm:text-sm shadow-xl border border-amber-400/50 hover:border-amber-300 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <div className="relative w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#003B73] animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-bold">Tanya Tarjih AI</span>
              <span className="text-[10px] text-amber-200/80 font-normal">Konsultasi Fatwa &amp; Ibadah</span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col w-full sm:w-[440px] md:w-[480px] h-full sm:h-[620px] bg-white sm:rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#003B73] via-[#002855] to-[#041222] text-white flex items-center justify-between border-b border-amber-400/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base font-serif tracking-tight text-white">
                    Tanya Tarjih AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 font-mono">
                    Beta
                  </span>
                </div>
                <p className="text-[11px] text-stone-200 font-sans">
                  Asisten Fiqih HPT PP Muhammadiyah
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup Tanya Tarjih AI"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Notice */}
          <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Berpedoman pada HPT &amp; Fatwa Majelis Tarjih PP Muhammadiyah</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF8F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-[#003B73] text-amber-300 flex items-center justify-center shrink-0 text-xs mt-1 shadow-xs">
                    <Bot className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#003B73] text-white rounded-tr-xs"
                      : "bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.source && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 font-medium flex items-center justify-between gap-2">
                      <span className="italic truncate">{msg.source}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="text-stone-400 hover:text-stone-700 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        title="Salin jawaban"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === msg.id ? "Tersalin" : "Salin"}</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender === "user" ? "text-stone-300" : "text-stone-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 text-xs mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#003B73] text-amber-300 flex items-center justify-center shrink-0 text-xs mt-1">
                  <Bot className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="bg-white border border-stone-200/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-stone-500 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#003B73] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-stone-600 font-medium">Merujuk Putusan Tarjih...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-stone-100/90 border-t border-stone-200/60 overflow-x-auto shrink-0 flex items-center gap-1.5 no-scrollbar">
              <span className="text-[10px] font-bold text-stone-500 shrink-0 uppercase tracking-wider mr-1">
                Pertanyaan Populer:
              </span>
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-[#003B73] text-stone-700 hover:text-white border border-stone-300/80 text-[11px] whitespace-nowrap transition-colors shrink-0 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

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
                placeholder="Ketik pertanyaan fiqih atau fatwa Tarjih..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#003B73]/20 focus:border-[#003B73]"
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
            <p className="text-[10px] text-stone-400 text-center mt-2">
              Jawaban dirumuskan bersumber dari HPT Majelis Tarjih &amp; Tajdid PP Muhammadiyah.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
