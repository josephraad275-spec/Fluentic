import { masterRequest } from "./master/client.ts";
import { apiFetch } from "../services/apiTransport.ts";
export type FluenticAIAction =
  | "translate"
  | "placement"
  | "level-analysis"
  | "personal-lesson"
  | "speech-analysis"
  | "voice-synthesis";

export interface FluenticAIResponse<T = Record<string, unknown>> {
  success: boolean;
  action: FluenticAIAction;
  error?: string;
  [key: string]: unknown;
}

export async function fluenticAI<T = Record<string, unknown>>(
  action: FluenticAIAction,
  payload: Record<string, unknown>,
  options: { signal?: AbortSignal } = {},
): Promise<T & FluenticAIResponse> {
  if (action === 'placement' || action === 'personal-lesson') {
    const mode = action === 'placement' ? 'placement_test' : 'personal_lesson';
    const data = await masterRequest<Record<string, unknown>>(mode, { ...payload, action: 'generate_questions' }, options.signal);
    return { ...data, success: true, action } as T & FluenticAIResponse;
  }
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await apiFetch("/api/fluentic-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
        signal: options.signal,
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
      if (attempt === maxAttempts - 1) throw new Error("Network unavailable. Please check your connection and retry.");
      await new Promise<void>((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
      continue;
    }

    const data: unknown = await response.json().catch(() => null);
    const body = data !== null && typeof data === "object" && !Array.isArray(data)
      ? data as Record<string, unknown> : {};
    if (response.ok && body.success === true && body.action === action) {
      return body as T & FluenticAIResponse;
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < maxAttempts - 1) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const delay = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 5000) : 400 * 2 ** attempt;
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const error = typeof body.error === "string" ? body.error : `Fluentic AI request failed (${response.status}).`;
    throw new Error(error);
  }
  throw new Error("Fluentic AI request could not be completed.");
}

export const fluenticTranslator = {
  translate: (text: string, sourceLanguage: string, targetLanguage: string, signal?: AbortSignal) =>
    fluenticAI<{ translation: string; detectedSourceLanguage?: string; register?: string; notes?: string }>(
      "translate", { text, sourceLanguage, targetLanguage }, { signal },
    ),
};

export const fluenticAssessment = {
  createPlacementTest: (targetLanguage: string, nativeLanguage: string, questionCount = 15, learningIntent?: "travel" | "business" | "academic" | "conversational" | "culture") =>
    fluenticAI<{ language: string; questions: Array<Record<string, unknown>> }>(
      "placement", { targetLanguage, nativeLanguage, questionCount, learningIntent },
    ),
  analyzeLevel: (targetLanguage: string, answers: unknown[], selfReportedLevel?: string, goal?: string) =>
    fluenticAI<{ estimatedLevel: string; confidence: number; skillLevels: Record<string, string>; strengths: string[]; priorityGaps: string[] }>(
      "level-analysis", { targetLanguage, answers, selfReportedLevel, goal },
    ),
};

export const fluenticLearning = {
  createPersonalLesson: (payload: {
    targetLanguage: string;
    nativeLanguage: string;
    cefrLevel: string;
    goal?: string;
    learningIntent?: "travel" | "business" | "academic" | "conversational" | "culture";
    interests?: string[];
    weaknesses?: string[];
    recentPerformance?: Record<string, unknown>;
    minutesAvailable?: number;
  }) => fluenticAI("personal-lesson", payload),
};

export interface FluenticVoiceStreamEvent {
  type: "audio" | "done" | "error";
  data?: string;
  mimeType?: string;
  sampleRate?: number;
  error?: string;
}

async function* streamFluenticVoice(text: string, language: string, voiceName = "Kore", style?: string, signal?: AbortSignal): AsyncGenerator<FluenticVoiceStreamEvent> {
  const response = await apiFetch("/api/fluentic-ai/voice-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
    body: JSON.stringify({ text, language, voiceName, style }),
    signal,
  });
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Fluentic voice stream failed (${response.status}).`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      for (const eventText of events) {
        const dataLine = eventText.split("\n").find((line) => line.startsWith("data:"));
        if (!dataLine) continue;
        const event = JSON.parse(dataLine.slice(5).trim()) as FluenticVoiceStreamEvent;
        if (event.type === "error") throw new Error(event.error || "Fluentic voice stream failed.");
        yield event;
      }
      if (chunk.done) break;
    }
  } finally {
    reader.releaseLock();
  }
}
export const fluenticVoice = {
  analyzeSpeech: (audioBase64: string, mimeType: string, targetLanguage: string, nativeLanguage: string) =>
    fluenticAI("speech-analysis", { audioBase64, mimeType, targetLanguage, nativeLanguage }),
  synthesize: (text: string, language: string, voiceName = "Kore", style?: string) =>
    fluenticAI<{ audioBase64: string; mimeType: string; voiceName: string; note: string }>(
      "voice-synthesis", { text, language, voiceName, style },
    ),
  synthesizeStream: (text: string, language: string, voiceName = "Kore", style?: string, signal?: AbortSignal) =>
    streamFluenticVoice(text, language, voiceName, style, signal),
};
