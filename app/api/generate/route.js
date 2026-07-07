import { GoogleGenAI } from '@google/genai';

// Mengambil API Key dari Environment Variables Vercel (Aman dari klien!)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request) {
  try {
    // Menerima data JSON dari aplikasi Expo
    const body = await request.json();
    const { prompt, image } = body;

    if (!prompt && !image) {
      return new Response(
        JSON.stringify({ error: 'Prompt atau gambar tidak boleh kosong' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let contents = prompt;

    // Jika Expo mengirimkan data gambar base64, siapkan format multimodal
    if (image && image.inlineData) {
      contents = [
        { text: prompt || 'Tolong analisis gambar ini.' },
        { inlineData: image.inlineData },
      ];
    }

    // Memanggil model Gemini (sesuai kode aslimu: gemini-2.5-flash)
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    // Mengembalikan jawaban teks ke aplikasi Expo
    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan pada server proxy.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}