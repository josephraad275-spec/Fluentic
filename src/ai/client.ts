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
    interests?: string[];
    weaknesses?: string[];
    recentPerformance?: Record<string, unknown>;
    minutesAvailable?: number;
  }) => fluenticAI("personal-lesson", payload),
};

export const fluenticVoice = {
  analyzeSpeech: (audioBase64: string, mimeType: string, targetLanguage: string, nativeLanguage: string) =>
    fluenticAI("speech-analysis", { audioBase64, mimeType, targetLanguage, nativeLanguage }),
  synthesize: (text: string, language: string, voiceName = "Kore", style?: string) =>
    fluenticAI<{ audioBase64: string; mimeType: string; voiceName: string; note: string }>(
      "voice-synthesis", { text, language, voiceName, style },
    ),
};
