import "dotenv/config";
import type { GoogleGenAI } from '@google/genai';

// Defaults verified against Google's model catalogue; override per deployment/account.
export const AI_MODELS = {
  text: process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash',
  fallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-flash-latest',
  transcription: process.env.GEMINI_TRANSCRIPTION_MODEL || 'gemini-3.5-transcribe',
  speech: process.env.GEMINI_TTS_MODEL || 'gemini-3.8-flash-tts',
};

export async function generateWithFallback(ai: GoogleGenAI, options: {
  contents: any; config?: any; preferredModel?: string;
}, timeoutMs = 25000) {
  const models = [...new Set([options.preferredModel || AI_MODELS.text, AI_MODELS.fallback])];
  let lastError: unknown;
  for (const model of models) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await ai.models.generateContent({ model, contents: options.contents,
        config: { ...options.config, abortSignal: controller.signal, httpOptions: { timeout: timeoutMs } } });
    } catch (error: any) {
      lastError = error;
      // Changing models cannot fix credentials or invalid requests.
      if ([400, 401, 403].includes(Number(error.status || error.code))) throw error;
    } finally { clearTimeout(timer); }
  }
  throw lastError;
}

export async function transcribeAudio(ai: GoogleGenAI, data: string, mimeType: string): Promise<string> {
  // Dedicated ASR uses Interactions, not models.generateContent.
  const result: any = await ai.interactions.create({
    model: AI_MODELS.transcription,
    input: [{ type: 'audio', data, mime_type: mimeType }],
  } as any, { timeout: 30000, maxRetries: 0 });
  const text = result.output_text || result.outputs?.flatMap((item: any) =>
    item.type === 'text' ? [item.text] : []).join('');
  if (typeof text !== 'string') throw new Error('Transcription returned no text.');
  return text.trim();
}
