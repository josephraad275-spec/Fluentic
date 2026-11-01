import type { Express, Request, Response } from "express";
import type { GoogleGenAI } from "@google/genai";

type AIClientProvider = () => GoogleGenAI | null;

const CORE_MODEL = "gemini-3.8-flash";
const TRANSCRIPTION_MODEL = "gemini-3.5-transcribe";
const TTS_MODEL = "gemini-3.8-flash-tts";
const MAX_TEXT_LENGTH = 12000;
const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function cleanString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function parseJson(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
    throw new Error("The AI returned an invalid structured response.");
  }
}

async function generateJson(ai: GoogleGenAI, systemInstruction: string, input: unknown, maxOutputTokens = 1800) {
  const result = await ai.models.generateContent({
    model: CORE_MODEL,
    contents: typeof input === "string" ? input : JSON.stringify(input),
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.25,
      maxOutputTokens,
    },
  });
  return parseJson(result.text || "");
}

function requireText(value: unknown, field: string, max = MAX_TEXT_LENGTH): string {
  const text = cleanString(value);
  if (!text) throw new Error(`${field} is required.`);
  if (text.length > max) throw new Error(`${field} exceeds the ${max}-character limit.`);
  return text;
}

export function registerFluenticAIRoutes(app: Express, getAI: AIClientProvider) {
  app.get("/api/fluentic-ai/health", (_req: Request, res: Response) => {
    res.json({
      name: "Fluentic AI",
      status: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
      capabilities: ["translation", "placement", "level-analysis", "personal-lessons", "speech-analysis", "voice-synthesis"],
      uiChanges: false,
    });
  });

  app.post("/api/fluentic-ai", async (req: Request, res: Response) => {
    try {
      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Fluentic AI is not configured. Add GEMINI_API_KEY to the server environment.",
          code: "AI_NOT_CONFIGURED",
        });
      }

      const action = cleanString(req.body?.action).toLowerCase();
      const payload = req.body?.payload && typeof req.body.payload === "object" ? req.body.payload : req.body;

      if (action === "translate") {
        const sourceText = requireText(payload.text, "text");
        const sourceLanguage = cleanString(payload.sourceLanguage, "auto");
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const result = await generateJson(
          ai,
          `You are Fluentic's expert translation engine. Translate into ${targetLanguage}. Source language: ${sourceLanguage}. Preserve meaning, tone, formatting, names, numbers and intent. Handle idioms naturally rather than literally. Return JSON only: {"translation":"...","detectedSourceLanguage":"...","register":"formal|informal|neutral","notes":"short optional nuance note"}.`,
          sourceText,
          1200
        );
        if (!cleanString(result.translation)) throw new Error("Translation response was empty.");
        return res.json({ success: true, action, ...result });
      }

      if (action === "placement") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const nativeLanguage = cleanString(payload.nativeLanguage, "English");
        const count = Math.max(8, Math.min(30, Number(payload.questionCount) || 15));
        const result = await generateJson(
          ai,
          `You are Fluentic's CEFR placement-test author. Create exactly ${count} original questions for a learner of ${targetLanguage}; explain instructions in ${nativeLanguage}. Cover vocabulary, grammar, reading, functional communication and (where text permits) listening-readiness. Spread difficulty from A1 to C2 and make later questions progressively harder. Every multiple-choice question must have exactly four options and exactly one defensible correct answer. Avoid cultural trivia. Return JSON: {"language":"...","questions":[{"id":1,"level":"A1|A2|B1|B2|C1|C2","skill":"...","instruction":"...","prompt":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctKey":"A","explanation":"..."}]}.`,
          { learnerGoal: cleanString(payload.goal, "general fluency"), knownLevel: cleanString(payload.currentLevel, "unknown") },
          5000
        );
        if (!Array.isArray(result.questions) || result.questions.length < 8) throw new Error("Placement test generation was incomplete.");
        return res.json({ success: true, action, ...result });
      }

      if (action === "level-analysis") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const answers = payload.answers;
        if (!Array.isArray(answers) || answers.length < 3) throw new Error("At least three assessment answers are required.");
        const result = await generateJson(
          ai,
          `You are Fluentic's cautious CEFR assessor for ${targetLanguage}. Estimate the learner's level using only the supplied evidence. Distinguish demonstrated ability from uncertainty; never overstate precision. Evaluate grammar, vocabulary, reading, writing and communication where evidence exists. Return JSON: {"estimatedLevel":"A1|A2|B1|B2|C1|C2","confidence":0-100,"skillLevels":{"grammar":"...","vocabulary":"...","reading":"...","writing":"...","communication":"..."},"strengths":["..."],"priorityGaps":["..."],"reasoning":"...","recommendedNextStep":"..."}.`,
          { answers, selfReportedLevel: cleanString(payload.selfReportedLevel, "unknown"), learnerGoal: cleanString(payload.goal, "general fluency") },
          2200
        );
        if (!CEFR_LEVELS.includes(result.estimatedLevel)) throw new Error("The level assessor returned an invalid CEFR level.");
        return res.json({ success: true, action, ...result });
      }

      if (action === "personal-lesson") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const nativeLanguage = cleanString(payload.nativeLanguage, "English");
        const level = cleanString(payload.cefrLevel, "A1");
        const result = await generateJson(
          ai,
          `You are Fluentic's adaptive language curriculum designer. Build one practical, personalized lesson for a ${level} learner studying ${targetLanguage}. Explanations should be in ${nativeLanguage}; examples and exercises in ${targetLanguage}. Adapt to the learner's goal, interests, available time and demonstrated weaknesses. Teach one clear objective, scaffold examples, then test transfer. Return JSON: {"title":"...","level":"...","objective":"...","estimatedMinutes":15,"whyThisLesson":"...","teachingPoints":[{"concept":"...","explanation":"...","examples":[{"target":"...","translation":"..."}]}],"practice":[{"type":"multiple_choice|translation|short_answer|conversation","prompt":"...","options":["..."],"expectedAnswer":"...","feedback":"..."}],"recallPrompt":"...","nextLessonRecommendation":"..."}.`,
          {
            targetLanguage, nativeLanguage, level,
            goal: cleanString(payload.goal, "general fluency"),
            interests: payload.interests || [],
            weaknesses: payload.weaknesses || [],
            recentPerformance: payload.recentPerformance || {},
            minutesAvailable: Math.max(5, Math.min(60, Number(payload.minutesAvailable) || 15)),
          },
          3500
        );
        return res.json({ success: true, action, ...result });
      }

      if (action === "speech-analysis") {
        const audioBase64 = requireText(payload.audioBase64, "audioBase64", 18_000_000);
        const mimeType = cleanString(payload.mimeType, "audio/webm");
        const targetLanguage = cleanString(payload.targetLanguage, "auto");
        const nativeLanguage = cleanString(payload.nativeLanguage, "English");
        const result = await ai.models.generateContent({
          model: TRANSCRIPTION_MODEL,
          contents: {
            parts: [
              { inlineData: { mimeType, data: audioBase64 } },
              { text: `Analyze this learner's speech. Target language: ${targetLanguage}. Feedback language: ${nativeLanguage}. Detect the spoken language, transcribe faithfully in its native writing system, and evaluate intelligibility, pronunciation patterns, fluency and grammar only where audible. Do not guess inaudible words. Return JSON: {"transcript":"...","detectedLanguage":"...","targetLanguageMatch":true,"pronunciationScore":0-100,"fluencyScore":0-100,"intelligibilityScore":0-100,"observations":["..."],"corrections":[{"heard":"...","suggested":"...","reason":"..."}],"practiceDrill":"..."}.` },
            ],
          },
          config: { responseMimeType: "application/json", temperature: 0.15, maxOutputTokens: 1800 },
        });
        return res.json({ success: true, action, ...parseJson(result.text || "") });
      }

      if (action === "voice-synthesis") {
        const text = requireText(payload.text, "text", 5000);
        const language = cleanString(payload.language, "English");
        const voiceName = cleanString(payload.voiceName, "Kore");
        const style = cleanString(payload.style, "Natural, warm, clear language tutor");
        const result = await ai.models.generateContent({
          model: TTS_MODEL,
          contents: [{ parts: [{ text: `Speak the following ${language} text. Voice direction: ${style}. Text: ${text}` }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          } as any,
        });
        const audioPart = result.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData?.data);
        if (!audioPart?.inlineData?.data) throw new Error("Voice synthesis returned no audio.");
        return res.json({
          success: true,
          action,
          mimeType: audioPart.inlineData.mimeType || "audio/pcm",
          audioBase64: audioPart.inlineData.data,
          voiceName,
          note: "This is a generated preset voice, not a cloned person's voice.",
        });
      }

      return res.status(400).json({
        error: "Unsupported Fluentic AI action.",
        supportedActions: ["translate", "placement", "level-analysis", "personal-lesson", "speech-analysis", "voice-synthesis"],
      });
    } catch (error: any) {
      const message = error?.message || "Fluentic AI request failed.";
      console.error("[Fluentic AI]", message);
      return res.status(400).json({ success: false, error: message });
    }
  });
}
