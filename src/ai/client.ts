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
  const response = await fetch("/api/fluentic-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
    signal: options.signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || `Fluentic AI request failed (${response.status}).`);
  }
  return data as T & FluenticAIResponse;
}

export const fluenticTranslator = {
  translate: (text: string, sourceLanguage: string, targetLanguage: string, signal?: AbortSignal) =>
    fluenticAI<{ translation: string; detectedSourceLanguage?: string; register?: string; notes?: string }>(
      "translate", { text, sourceLanguage, targetLanguage }, { signal },
    ),
};

export const fluenticAssessment = {
  createPlacementTest: (targetLanguage: string, nativeLanguage: string, questionCount = 15) =>
    fluenticAI<{ language: string; questions: Array<Record<string, unknown>> }>(
      "placement", { targetLanguage, nativeLanguage, questionCount },
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
  const response = await fetch("/api/fluentic-ai/voice-stream", {
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
