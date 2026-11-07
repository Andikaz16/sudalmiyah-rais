import { NextRequest, NextResponse } from "next/server";
import { TARJIH_KNOWLEDGE_BASE, TarjihTopic } from "@/data/tarjihKnowledge";

interface ClientHistoryItem {
  sender: "user" | "ai";
  text: string;
}

// Model-model Gemini yang cepat, efisien, dan memiliki kuota lebih tinggi
const CANDIDATE_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
];

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

Semoga penjelasan ini memberikan ketenangan dan kemudahan dalam beribadah. Jika membutuhkan pendalaman fatwa lebih lanjut, Anda juga dapat berkonsultasi langsung dengan Asatidz Takmir Masjid Sudalmiyah Rais Kampus 2 UMS atau menelusuri lema HPT di portal https://hpt.muhammadiyah.or.id.`;
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

    // 1. Pencarian Cerdas di Direktori Korpus Tarjih Lokal
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

    // Jika pertanyaan cocok kuat dengan topik HPT (score >= 3), berikan jawaban instan langsung!
    // Keuntungan: 0 ms latency, 0 pemakaian kuota API, 100% bebas dari rate limit / error kuota
    if (bestMatch && maxScore >= 3) {
      return NextResponse.json({
        reply: formatKnowledgeResponse(bestMatch),
        source: bestMatch.source,
        matchedTopic: bestMatch.title,
        isAiGenerated: false,
        engine: "instant-tarjih-corpus",
      });
    }

    // 2. Jika tidak ada kecocokan instan, gunakan Gemini API dengan proteksi multi-model fallback
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `Anda adalah "ChatHPT - Asisten AI Tarjih Muhammadiyah" untuk Masjid Sudalmiyah Rais Kampus 2 Universitas Muhammadiyah Surakarta (UMS).
Tugas Anda adalah menjawab pertanyaan pengguna secara ramah, mendalam, ilmiah, dan solutif.

Prinsip Menjawab:
1. Fiqih & Fatwa: Berlandaskan manhaj Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah, Al-Qur'an, dan Sunnah ash-Shahihah / al-Maqbulah. Berikan kesimpulan jelas, dalil, dan hikmah praktis.
2. Pertanyaan Umum / Kampus: Jawab dengan bijak, ilmiah, dan menyejukkan bagi sivitas akademika UMS.
3. Format Jawaban:
   - Salam pembuka santun.
   - Jawaban langsung / pokok hukum.
   - Penjelasan dalil dan rujukan (Al-Qur'an, Hadits shahih, atau HPT jika relevan).
   - Penutup yang menguatkan.
4. ATURAN KETAT: JANGAN PERNAH MENGGUNAKAN EMOJI DALAM SETIAP RESPON ANDA.`;

        // Riwayat singkat (maksimal 4 pesan terakhir untuk menghemat token)
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
                temperature: 0.3,
              },
            });

            if (response.text && response.text.trim()) {
              replyText = response.text.trim();
              selectedModel = model;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${model} tidak merespons, mencoba model cadangan:`, modelErr);
          }
        }

        if (replyText) {
          return NextResponse.json({
            reply: replyText,
            source: "Majelis Tarjih & Tajdid PP Muhammadiyah (ChatHPT AI)",
            isAiGenerated: true,
            model: selectedModel,
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed:", geminiError);
      }
    }

    // 3. Fallback Cerdas & Berkelanjutan (Jika API limit / offline)
    // Jika ada kecocokan parsial di korpus lokal
    if (bestMatch && maxScore >= 1) {
      return NextResponse.json({
        reply: formatKnowledgeResponse(bestMatch),
        source: bestMatch.source,
        matchedTopic: bestMatch.title,
        isAiGenerated: false,
        engine: "fallback-tarjih-corpus",
      });
    }

    // Jawaban santun dan komprehensif tanpa pernah menampilkan error teknis / kuota
    const gracefulReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Terima kasih atas pertanyaan Anda: "${message}".

Dalam tuntunan Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah, setiap persoalan ibadah dikembalikan kepada dalil-dalil Al-Qur'an dan Sunnah al-Maqbulah (ash-Shahihah) dengan semangat tajdid, purifikasi aqidah-ibadah, serta kemaslahatan umat (mashalihul 'ammah).

Untuk menelusuri lema putusan fiqih secara lengkap dan terperinci:
1. Anda dapat membaca rujukan resmi kitab Himpunan Putusan Tarjih (HPT) Jilid 1, 2, dan 3.
2. Mengakses asisten daring lema Tarjih resmi PP Muhammadiyah di: https://hpt.muhammadiyah.or.id
3. Berkonsultasi secara tatap muka dengan Asatidz dan Dewan Pembina Takmir di Masjid Kampus Sudalmiyah Rais UMS.

Semoga Allah SWT senantiasa membimbing langkah kita dalam menuntut ilmu dan beramal shaleh.`;

    return NextResponse.json({
      reply: gracefulReply,
      source: "ChatHPT — Majelis Tarjih & Tajdid PP Muhammadiyah",
      isAiGenerated: false,
      engine: "graceful-synthesis",
    });
  } catch (err: unknown) {
    console.error("Error in tanya-tarjih route:", err);
    // Tetap kembalikan pesan santun dan solutif agar pengunjung tidak melihat pesan error teknis
    return NextResponse.json({
      reply: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nTerima kasih telah mengajukan pertanyaan. Layanan asisten sedang melakukan sinkronisasi fatwa berkala.\n\nUntuk rujukan lengkap Himpunan Putusan Tarjih (HPT), Anda dapat menelusuri langsung di portal resmi https://hpt.muhammadiyah.or.id atau menghubungi Takmir Masjid Sudalmiyah Rais Kampus 2 UMS.`,
      source: "Majelis Tarjih & Tajdid PP Muhammadiyah",
      isAiGenerated: false,
    });
  }
}
