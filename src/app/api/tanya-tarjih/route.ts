import { NextRequest, NextResponse } from "next/server";
import { TARJIH_KNOWLEDGE_BASE, TarjihTopic } from "@/data/tarjihKnowledge";

interface ClientHistoryItem {
  sender: "user" | "ai";
  text: string;
}

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

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

    // 1. Cek kecocokan di Knowledge Base Tarjih
    const normalizedQuery = message.toLowerCase();
    let bestMatch: TarjihTopic | null = null;
    let maxScore = 0;

    for (const topic of TARJIH_KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of topic.keywords) {
        if (normalizedQuery.includes(kw.toLowerCase())) {
          score += 2;
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

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 2. Jika API Key Gemini tersedia, gunakan Google Gemini Generative AI
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `Anda adalah "Tanya Tarjih AI", asisten kecerdasan buatan resmi untuk Masjid Sudalmiyah Rais Kampus 2 Universitas Muhammadiyah Surakarta (UMS).
Anda bertindak seperti platform AI percakapan cerdas pada umumnya (seperti Google Gemini), yang siap menjawab segala pertanyaan dari pengguna dengan mendalam, tepat sasaran, luas, dan relevan sesuai apa yang ditanyakan oleh pengguna.

Prinsip Menjawab:
1. Menjawab Sesuai Pertanyaan Pengguna:
   - Jawablah secara spesifik dan tepat apa yang ditanyakan pengguna. Jangan mengalihkan ke topik lain yang tidak ditanyakan.
   - Jika pengguna bertanya tentang hukum, ibadah, doa, adab, atau fatwa, berikan penjelasan dari sudut pandang pemikiran resmi Persyarikatan Muhammadiyah (HPT - Himpunan Putusan Tarjih, Manhaj Tarjih & Tajdid, Al-Qur'an, dan Sunnah ash-Shahihah / Maqbulah).
   - Contoh kasus jika ditanya tentang doa khatmil Qur'an: Jelaskan bahwa berdoa setelah membaca atau mengkhatamkan Al-Qur'an adalah amalan yang baik dan termasuk saat yang mustajab. Mengenai doa khusus, lafazh doa yang populer beredar di lembar akhir mushaf tidak berasal dari riwayat shahih yang mengikat, sehingga jamaah boleh membaca doa kebaikan ma'tsur atau permohonan kebaikan apa pun dengan bahasa yang dipahami asalkan tidak meyakininya sebagai rukun/kewajiban syar'i khusus dari Nabi SAW.
   - Jika pengguna bertanya di luar masalah fiqih (misalnya seputar kegiatan masjid, kehidupan kampus UMS, adab belajar, motivasi, sains Islam, muamalah kontemporer), jawablah dengan cerdas, solutif, ilmiah, dan bijak.
2. Gaya Bahasa & Format:
   - Gunakan bahasa Indonesia yang santun, ilmiah, ramah, dan menyejukkan bagi sivitas akademika UMS.
   - Susun jawaban dengan rapi:
     * Jawaban Langsung / Kesimpulan Ringkas.
     * Uraian Penjelasan & Dalil Rujukan (Al-Qur'an / Hadits Shahih jika ada).
     * Hikmah & Saran Praktis.
3. ATURAN KETAT: JANGAN PERNAH MENGGUNAKAN EMOJI DALAM SETIAP RESPON ANDA.

${bestMatch && maxScore >= 4 ? `Dokumen Rujukan HPT Terkait (Gunakan sebagai bahan rujukan penguat HPT jika relevan):\nTopik: ${bestMatch.title}\nPutusan: ${bestMatch.putusanTarjih}\nDalil: ${bestMatch.dalil}\nSumber: ${bestMatch.source}` : ""}`;

        // Bangun konteks percakapan multi-turn
        const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

        // Masukkan riwayat percakapan sebelumnya (maksimal 6 pesan terakhir)
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          if (!h.text || h.text.startsWith("Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di Layanan Tanya Tarjih")) {
            continue;
          }
          if (h.sender === "user") {
            contents.push({ role: "user", parts: [{ text: h.text }] });
          } else if (h.sender === "ai") {
            contents.push({ role: "model", parts: [{ text: h.text }] });
          }
        }

        // Pertanyaan terkini
        contents.push({ role: "user", parts: [{ text: message }] });

        let replyText = "";
        let selectedModel = "";

        // Coba model kandidat secara berurutan
        for (const model of CANDIDATE_MODELS) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.35,
              },
            });

            if (response.text && response.text.trim()) {
              replyText = response.text.trim();
              selectedModel = model;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${model} failed, checking next model candidate:`, modelErr);
          }
        }

        if (replyText) {
          return NextResponse.json({
            reply: replyText,
            source: bestMatch && maxScore >= 4 ? bestMatch.source : "Majelis Tarjih & Tajdid PP Muhammadiyah (Gemini AI)",
            matchedTopic: bestMatch && maxScore >= 4 ? bestMatch.title : undefined,
            isAiGenerated: true,
            model: selectedModel,
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API connection error:", geminiError);
      }
    }

    // 3. Fallback Cerdas (Jika API Key belum disetel atau offline)
    // Hanya gunakan offline HPT jika skor kecocokan tinggi (score >= 4)
    if (bestMatch && maxScore >= 4) {
      const formattedReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Mengenai pertanyaan Anda tentang "${bestMatch.title}", berikut tuntunan resmi menurut Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah:

1. Kesimpulan Hukum:
${bestMatch.summary}

2. Tinjauan Putusan Tarjih:
${bestMatch.putusanTarjih}

3. Dalil Rujukan:
${bestMatch.dalil}

Rujukan Resmi:
${bestMatch.source}

Jika Anda memerlukan kajian atau konsultasi lebih mendalam, Anda dapat menghubungi Sekretariat Takmir Masjid Sudalmiyah Rais Kampus 2 UMS atau mengikuti Pengajian Tarjih berkala setiap pekan di masjid.`;

      return NextResponse.json({
        reply: formattedReply,
        source: bestMatch.source,
        matchedTopic: bestMatch.title,
        isAiGenerated: false,
      });
    }

    // Jika pertanyaan di luar topik direktori offline dan AI Gemini belum aktif
    const offlineNoticeReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Terima kasih atas pertanyaan Anda: "${message}".

Saat ini sistem asisten berjalan dalam mode direktori offline terbatas. Agar Tanya Tarjih AI dapat menjawab pertanyaan bebas apa saja secara cerdas dan mendalam persis seperti platform Google Gemini (termasuk hukum doa khatmil Qur'an, fatwa kontemporer, fiqih ibadah, dan konsultasi interaktif):

1. Sistem memerlukan Google Gemini API Key aktif (tersedia gratis).
2. Dapatkan API Key di Google AI Studio (https://aistudio.google.com/).
3. Masukkan kunci ke variabel lingkungan GEMINI_API_KEY pada file .env.local atau konfigurasi hosting server Anda.

Jika Anda membutuhkan jawaban atau fatwa Tarjih atas pertanyaan di atas secara langsung hari ini, silakan berkonsultasi dengan asatidz Takmir Masjid Sudalmiyah Rais Kampus 2 UMS di kantor sekretariat masjid.`;

    return NextResponse.json({
      reply: offlineNoticeReply,
      source: "Takmir Masjid Sudalmiyah Rais Kampus 2 UMS",
      isAiGenerated: false,
    });
  } catch (err: unknown) {
    console.error("Error in tanya-tarjih route:", err);
    return NextResponse.json(
      { error: "Terjadi gangguan pada sistem. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
