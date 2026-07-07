import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    // Menangkap prompt yang dikirim dari aplikasi Expo
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt tidak boleh kosong" }), { status: 400 });
    }

    // Mengambil API Key dari Vercel Environment Variables (Aman dari sisi klien)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Inisialisasi model (gunakan gemini-1.5-flash untuk kecepatan hackathon)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Meminta respons dari Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Mengembalikan hasil ke aplikasi Expo
    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}