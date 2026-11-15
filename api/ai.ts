import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages, temperature = 0.15, maxTokens = 2048 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages payload' });
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

    return res.status(200).json({ text: response.text ?? '' });
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
}
