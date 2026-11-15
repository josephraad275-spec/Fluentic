import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { system, messages, temperature = 0.15, maxTokens = 2048 } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: system,
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    });

    return new Response(
      JSON.stringify({ text: response.text ?? '' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate AI response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
