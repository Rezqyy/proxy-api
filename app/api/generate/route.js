import { GoogleGenAI } from '@google/genai';

// Konfigurasi Header CORS agar tidak diblokir oleh Expo Web / Browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Fungsi OPTIONS wajib ada untuk menangani Preflight Request dari CORS
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  try {
    // 1. Cek apakah API Key terbaca oleh Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum terpasang atau terbaca di Vercel!");
    }

    // Inisialisasi AI di dalam blok try-catch
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // 2. Tangkap data dari Expo
    const body = await request.json();
    const { prompt, image } = body;

    let contents = prompt;

    if (image && image.inlineData) {
      contents = [
        { text: prompt || 'Tolong analisis gambar ini.' },
        { inlineData: image.inlineData },
      ];
    }

    // 3. Tembak ke Gemini API
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    // 4. Kembalikan hasil sukses dengan header CORS
    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    // Tampilkan error asli di log Vercel agar mudah dilacak
    console.error('SERVER ERROR LOG:', error.message);
    
    return new Response(
      JSON.stringify({ error: `Kesalahan Server: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}