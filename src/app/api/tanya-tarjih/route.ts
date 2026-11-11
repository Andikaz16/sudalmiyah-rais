import { NextRequest, NextResponse } from "next/server";
import { TARJIH_KNOWLEDGE_BASE, TarjihTopic } from "@/data/tarjihKnowledge";

interface ClientHistoryItem {
  sender: "user" | "ai";
  text: string;
}

// Model-model Gemini resmi terkini yang didukung oleh Google GenAI SDK
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.8-flash",
];

const STOP_WORDS = new Set([
  "apa", "apakah", "bagaimana", "hukum", "hukumnya", "tata", "cara", "tuntunan",
  "tentang", "menurut", "pandangan", "tarjih", "muhammadiyah", "hpt", "dalam",
  "dan", "atau", "yang", "di", "ke", "dari", "untuk", "ini", "itu", "bisa",
  "boleh", "bolehkah", "adakah", "apabila", "jika", "adalah", "gimana"
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function scoreSession(query: string, session: { firstQuestion?: string; matchedQuestion?: string; kategori?: string }): number {
  const qKeywords = extractKeywords(query);
  if (qKeywords.length === 0) return 0;

  const targetText = [
    session.firstQuestion || "",
    session.matchedQuestion || "",
    session.kategori || "",
  ].join(" ").toLowerCase();

  let score = 0;
  let matchedKeywords = 0;

  for (const kw of qKeywords) {
    if (targetText.includes(kw)) {
      score += 10;
      matchedKeywords++;
    }
  }

  // Bonus jika seluruh kata kunci utama terdapat pada sesi ChatHPT
  if (matchedKeywords === qKeywords.length) {
    score += 15;
  }

  return score;
}

// Bridge langsung ke korpus ChatHPT resmi (https://hpt.muhammadiyah.or.id)
async function fetchFromChatHPT(query: string): Promise<{ reply: string; source: string; sessionId?: string } | null> {
  try {
    const q = query.trim();
    if (!q) return null;

    let targetSessionId: string | null = null;

    // 1. Coba pencarian presisi melalui endpoint find-session
    try {
      const res = await fetch(
        `https://hpt.muhammadiyah.or.id/api/chat/find-session?q=${encodeURIComponent(q)}`,
        {
          headers: {
            "User-Agent": "ChatHPT-Bridge/1.0 (Masjid Kampus UMS)",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.sessionId) targetSessionId = data.sessionId;
      }
    } catch {}

    // 2. Jika tidak ditemukan secara presisi, gunakan kata kunci pokok
    const keywords = extractKeywords(q);
    if (!targetSessionId && keywords.length > 0) {
      const simplifiedQuery = keywords.join(" ");
      try {
        const res = await fetch(
          `https://hpt.muhammadiyah.or.id/api/chat/find-session?q=${encodeURIComponent(simplifiedQuery)}`,
          {
            headers: {
              "User-Agent": "ChatHPT-Bridge/1.0 (Masjid Kampus UMS)",
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(4000),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.sessionId) targetSessionId = data.sessionId;
        }
      } catch {}
    }

    // 3. Cari di arsip sesi ChatHPT yang telah diverifikasi
    if (!targetSessionId) {
      const searchTerms = [q];
      if (keywords.length > 0) searchTerms.push(keywords.join(" "));

      for (const term of searchTerms) {
        try {
          const res = await fetch(
            `https://hpt.muhammadiyah.or.id/api/chat/sessions?limit=8&offset=0&q=${encodeURIComponent(term)}`,
            {
              headers: {
                "User-Agent": "ChatHPT-Bridge/1.0 (Masjid Kampus UMS)",
                Accept: "application/json",
              },
              signal: AbortSignal.timeout(4000),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const sessions = data.sessions || [];

            let bestSession: { sessionId: string } | null = null;
            let maxScore = 0;

            for (const s of sessions) {
              const sc = scoreSession(q, s);
              if (sc > maxScore) {
                maxScore = sc;
                bestSession = s;
              }
            }

            if (bestSession && maxScore >= 10) {
              targetSessionId = bestSession.sessionId;
              break;
            }
          }
        } catch {}
      }
    }

    if (!targetSessionId) return null;

    // 4. Ambil percakapan lengkap dari sesi ChatHPT yang cocok
    const sessionRes = await fetch(
      `https://hpt.muhammadiyah.or.id/api/chat/sessions/${targetSessionId}`,
      {
        headers: {
          "User-Agent": "ChatHPT-Bridge/1.0 (Masjid Kampus UMS)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!sessionRes.ok) return null;

    const sessionData = await sessionRes.json();
    interface SessionMsg {
      role: string;
      content: string;
    }
    const assistantMsgs = (sessionData.messages || []).filter((m: SessionMsg) => m.role === "assistant");
    if (assistantMsgs.length === 0) return null;

    let content: string = assistantMsgs[0].content || "";

    // Rapikan tag sitasi internal [[sources/...]] menjadi rujukan resmi yang bersih dan informatif
    content = content.replace(/\[\[sources\/([^\]]+)\]\]/g, (_, slug: string) => {
      const cleanTitle = slug
        .replace(/-/g, " ")
        .replace(/^(fatwa|tja)\s+/i, (m) => m.toUpperCase());
      return `[Rujukan: ${cleanTitle}]`;
    });

    return {
      reply: content,
      source: "ChatHPT Resmi — Majelis Tarjih & Tajdid PP Muhammadiyah (hpt.muhammadiyah.or.id)",
      sessionId: targetSessionId,
    };
  } catch {
    return null;
  }
}

function formatKnowledgeResponse(topic: TarjihTopic): string {
  return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Mengenai pertanyaan Anda tentang "${topic.title}", berikut penjelasan resmi berlandaskan Himpunan Putusan Tarjih (HPT) Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah:

1. Kesimpulan Hukum:
${topic.summary}

2. Tinjauan Putusan Tarjih:
${topic.putusanTarjih}

3. Dalil Rujukan:
${topic.dalil}

Rujukan Resmi:
${topic.source}

Semoga penjelasan ini memberikan ketenangan dan kemudahan dalam beribadah. Anda juga dapat menelusuri lema HPT langsung di portal resmi https://hpt.muhammadiyah.or.id.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body.message || "").trim();
    const history: ClientHistoryItem[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { error: "Pesan pertanyaan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // =========================================================================
    // 1. TIER UTAMA: Sinkronisasi Langsung ke Korpus ChatHPT Resmi (hpt.muhammadiyah.or.id)
    // =========================================================================
    const chatHPTResult = await fetchFromChatHPT(message);
    if (chatHPTResult && chatHPTResult.reply) {
      return NextResponse.json({
        reply: chatHPTResult.reply,
        source: chatHPTResult.source,
        sessionId: chatHPTResult.sessionId,
        isAiGenerated: true,
        engine: "chathpt-official-corpus",
      });
    }

    // =========================================================================
    // 2. TIER KEDUA: Google GenAI (gemini-2.5-flash / gemini-3.8-flash)
    // Berstandar Manhaj Tarjih & Tajdid Muhammadiyah persis seperti ChatHPT
    // =========================================================================
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `Anda adalah "ChatHPT - Asisten AI Resmi Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah" untuk Masjid Kampus Universitas Muhammadiyah Surakarta (UMS).
Tugas Anda adalah menjawab pertanyaan pengguna secara otentik, ilmiah, mendalam, dan selaras 100% dengan putusan resmi Majelis Tarjih & Tajdid PP Muhammadiyah.

Pedoman Menjawab Sesuai Format Resmi ChatHPT:
1. Struktur Jawaban Wajib:
   ## Pertanyaan:
   (Formulasi ulang pertanyaan pengguna secara jelas)

   ## Jawaban:
   🔹 (Jelaskan pokok hukum langsung: Wajib, Sunnah, Mubah, Makruh, atau Haram).
   🔹 (Bedakan dengan tegas apakah persoalan termasuk ibadah mahdhah yang terikat dalil khusus/kaidah asal haram kecuali ada perintah, atau ibadah mu'amalah yang terbuka ruang kreasi dan kemaslahatan/al-ashlu fil-mu'amalah al-ibahah).

   (Uraikan perkembangan fatwa Tarjih secara kronologis lintas tahun jika ada fatwa resmi, misalnya Fatwa 1999, 2016, 2020, 2021, dst., atau sebutkan naskah HPT yang relevan).

   **Dalil-dalil:**
   (Sertakan teks ayat Al-Qur'an dan Hadits maqbulah/shahih dalam huruf Arab, terjemahan bahasa Indonesia yang akurat, serta perawinya seperti HR. Bukhari, Muslim, Abu Dawud, dll).

   **Kesimpulan:**
   (Ringkasan hukum praktis yang memberikan kepastian ibadah dan kemaslahatan bagi umat).

2. Landasan Manhaj Tarjih:
   - Sumber utama: Al-Qur'an dan As-Sunnah Ash-Shahihah / Al-Maqbulah.
   - Menggunakan pendekatan Bayani, Burhani, dan 'Irfani.
   - Rujukan: Kitab Himpunan Putusan Tarjih (HPT) Jilid 1, 2, dan 3, Fatwa Tarjih, dan Tanya Jawab Agama (TJA) Suara Muhammadiyah.

3. ATURAN KETAT DAN MUTLAK:
   - JANGAN PERNAH MENGGUNAKAN EMOJI SAMA SEKALI dalam seluruh teks respon Anda.
   - Berikan jawaban yang ilmiah, menyejukkan, tidak menghakimi, dan berbasis dalil kuat.`;

        const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
        const recentHistory = history.slice(-4);
        for (const h of recentHistory) {
          if (!h.text || h.text.startsWith("Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di ChatHPT")) {
            continue;
          }
          if (h.sender === "user") {
            contents.push({ role: "user", parts: [{ text: h.text }] });
          } else if (h.sender === "ai") {
            contents.push({ role: "model", parts: [{ text: h.text }] });
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

        let replyText = "";
        let selectedModel = "";

        for (const model of CANDIDATE_MODELS) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.2,
              },
            });

            if (response.text && response.text.trim()) {
              replyText = response.text.trim();
              selectedModel = model;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${model} gagal merespons, mencoba cadangan:`, modelErr);
          }
        }

        if (replyText) {
          return NextResponse.json({
            reply: replyText,
            source: "ChatHPT — Majelis Tarjih & Tajdid PP Muhammadiyah (hpt.muhammadiyah.or.id)",
            isAiGenerated: true,
            model: selectedModel,
            engine: "chathpt-genai-synthesis",
          });
        }
      } catch (geminiError) {
        console.warn("Gemini GenAI generation failed:", geminiError);
      }
    }

    // =========================================================================
    // 3. TIER KETIGA: Korpus Pengetahuan Tarjih Lokal (Offline Database)
    // =========================================================================
    const normalizedQuery = message.toLowerCase();
    let bestMatch: TarjihTopic | null = null;
    let maxScore = 0;

    for (const topic of TARJIH_KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of topic.keywords) {
        const kwLower = kw.toLowerCase();
        if (normalizedQuery === kwLower) {
          score += 6;
        } else if (normalizedQuery.includes(kwLower)) {
          score += 3;
        }
      }
      if (normalizedQuery.includes(topic.title.toLowerCase())) {
        score += 5;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = topic;
      }
    }

    if (bestMatch && maxScore >= 2) {
      return NextResponse.json({
        reply: formatKnowledgeResponse(bestMatch),
        source: bestMatch.source,
        matchedTopic: bestMatch.title,
        isAiGenerated: false,
        engine: "instant-tarjih-corpus",
      });
    }

    // =========================================================================
    // 4. TIER KEEMPAT: Jawaban Santun & Solutif Terakhir
    // =========================================================================
    const gracefulReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Terima kasih atas pertanyaan Anda mengenai: "${message}".

Dalam tuntunan Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah, setiap persoalan ibadah dan muamalah dikembalikan kepada dalil-dalil Al-Qur'an dan Sunnah al-Maqbulah (ash-Shahihah) dengan semangat tajdid, purifikasi aqidah-ibadah, serta kemaslahatan umat (mashalihul 'ammah).

Untuk menelusuri lema putusan fiqih secara lengkap dan terperinci:
1. Anda dapat membaca rujukan resmi kitab Himpunan Putusan Tarjih (HPT) Jilid 1, 2, dan 3.
2. Mengakses asisten resmi ChatHPT PP Muhammadiyah langsung di portal: https://hpt.muhammadiyah.or.id
3. Berkonsultasi secara langsung dengan Asatidz dan Dewan Pembina Takmir di Masjid Kampus UMS.

Semoga Allah SWT senantiasa membimbing langkah kita dalam menuntut ilmu dan beramal shaleh.`;

    return NextResponse.json({
      reply: gracefulReply,
      source: "ChatHPT — Majelis Tarjih & Tajdid PP Muhammadiyah",
      isAiGenerated: false,
      engine: "graceful-synthesis",
    });
  } catch (err: unknown) {
    console.error("Error in tanya-tarjih route:", err);
    return NextResponse.json({
      reply: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nTerima kasih telah mengajukan pertanyaan. Layanan asisten sedang melakukan sinkronisasi fatwa berkala.\n\nUntuk rujukan lengkap Himpunan Putusan Tarjih (HPT), Anda dapat menelusuri langsung di portal resmi https://hpt.muhammadiyah.or.id atau menghubungi Takmir Masjid Kampus UMS.`,
      source: "Majelis Tarjih & Tajdid PP Muhammadiyah",
      isAiGenerated: false,
    });
  }
}
