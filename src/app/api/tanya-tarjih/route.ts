import { NextRequest, NextResponse } from "next/server";
import { TARJIH_KNOWLEDGE_BASE, TarjihTopic } from "@/data/tarjihKnowledge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { error: "Pesan pertanyaan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // 1. Cek apakah ada kecocokan di Knowledge Base Tarjih
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

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Jika API Key Gemini tersedia, gunakan model gemini-3.8-flash dengan RAG context
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const contextData = bestMatch
          ? `Topik Tarjih Terkait: ${bestMatch.title}\nRingkasan Putusan: ${bestMatch.putusanTarjih}\nDalil: ${bestMatch.dalil}\nSumber: ${bestMatch.source}`
          : "Gunakan pedoman Himpunan Putusan Tarjih (HPT) PP Muhammadiyah dan Al-Qur'an serta Sunnah Shahihah.";

        const systemPrompt = `Anda adalah Asisten Cerdas Fatwa & Fiqih Tarjih Masjid Sudalmiyah Rais Universitas Muhammadiyah Surakarta (UMS).
Tugas Anda adalah menjawab pertanyaan jamaah, sivitas akademika, dan mahasiswa seputar ibadah harian, fiqih, serta fatwa persyarikatan.
Pedoman penting:
1. Berpegang teguh pada paham agama Islam dalam Muhammadiyah (Himpunan Putusan Tarjih/HPT, manhaj Tarjih, Al-Qur'an, dan Sunnah Maqbulah).
2. Sampaikan jawaban secara terstruktur:
   - Kesimpulan Hukum / Tuntunan Ringkas.
   - Penjelasan & Tinjauan Putusan Tarjih.
   - Dalil Rujukan (Al-Qur'an atau Hadits Shahih).
3. Bersikap santun, menyejukkan, ilmiah, dan solutif bagi mahasiswa di lingkungan kampus UMS.
4. Jangan menggunakan emoji sama sekali. Gunakan bahasa Indonesia baku yang sopan dan jelas.

Konteks Dokumen Tarjih Resmi:
${contextData}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });

        const replyText = response.text || "";
        if (replyText.trim()) {
          return NextResponse.json({
            reply: replyText,
            source: bestMatch ? bestMatch.source : "Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah",
            matchedTopic: bestMatch ? bestMatch.title : undefined,
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API error, falling back to local Tarjih knowledge base:", geminiError);
      }
    }

    // 3. Fallback Offline Cerdas berbasis Knowledge Base Tarjih Resmi
    if (bestMatch && maxScore > 0) {
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
      });
    }

    // Default polite response jika belum ada kecocokan spesifik
    const defaultReply = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Terima kasih atas pertanyaan Anda. Untuk topik spesifik ini, Majelis Tarjih & Tajdid senantiasa mengedepankan prinsip kemudahan, kemaslahatan, dan keselarasan dengan Al-Qur'an serta Sunnah ash-Shahihah.

Topik populer seputar putusan Tarjih yang dapat Anda tanyakan secara langsung:
- Tuntunan Shalat Tarawih & Witir 11 Rakaat
- Doa Iftitah 'Allahumma Ba'id' dan Bacaan Basmalah Sirr
- Hukum Qunut Shalat Subuh & Qunut Nazilah
- Pelaksanaan Adzan Shalat Jumat 1 Kali
- Kalender Hijriyah Global Tunggal (KHGT) & Hisab
- Panduan Shalat Jamak & Qashar bagi Musafir/Mahasiswa
- Ketentuan Zakat Fitrah (Beras vs Uang)
- Shalat Idul Fitri di Lapangan Kampus UMS
- Panduan Bunga Bank & Muamalah Syariah

Anda juga dapat berkonsultasi langsung dengan asatidz Takmir Masjid Sudalmiyah Rais Kampus 2 UMS pada jam operasional sekretariat.`;

    return NextResponse.json({
      reply: defaultReply,
      source: "Majelis Tarjih & Tajdid Pimpinan Pusat Muhammadiyah",
    });
  } catch (err: unknown) {
    console.error("Error in tanya-tarjih route:", err);
    return NextResponse.json(
      { error: "Terjadi gangguan pada sistem. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
