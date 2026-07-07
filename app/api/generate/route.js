import { GoogleGenAI } from '@google/genai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum terpasang di Vercel!");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Tangkap contents (array riwayat lengkap) dari Expo
    const body = await request.json();
    const { contents } = body;

    if (!contents || !Array.isArray(contents)) {
      return new Response(
        JSON.stringify({ error: 'Format contents harus berupa array riwayat chat yang valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Tembak ke Gemini API dengan membawa seluruh riwayat obrolan
    const result = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: contents, // Array ini sekarang berisi chat dari awal sampai yang paling baru
    });

    return new Response(JSON.stringify({ text: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('SERVER ERROR LOG:', error.message);
    return new Response(
      JSON.stringify({ error: `Kesalahan Server: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}