import type { Express, Request, Response } from "express";
import type { GoogleGenAI } from "@google/genai";
import { FLUENTIC_CEFR_LEVELS, buildPlacementAuthoringInstruction, buildPersonalLessonInstruction, estimateLevelFromEvidence, normalizeLearningIntent } from "../pedagogy";
import { stripTransliteration } from "../../services/languageTypography";

type AIClientProvider = () => GoogleGenAI | null;

const CORE_MODEL = "gemini-3.8-flash";
const TRANSCRIPTION_MODEL = "gemini-3.5-transcribe";
const TTS_MODEL = "gemini-3.8-flash-tts";
const MAX_TEXT_LENGTH = 12000;
const CEFR_LEVELS = FLUENTIC_CEFR_LEVELS;

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
      capabilities: ["translation", "placement", "level-analysis", "personal-lessons", "speech-analysis", "voice-synthesis", "voice-streaming"],
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
          `You are Fluentic's expert translation engine. Translate into ${targetLanguage}. Source language: ${sourceLanguage}. Preserve meaning, tone, formatting, names, numbers and intent. Handle idioms naturally rather than literally. Return only the target language in its authentic writing system; never append transliteration, phonetic respelling, or English approximations. Return JSON only: {"translation":"...","detectedSourceLanguage":"...","register":"formal|informal|neutral","notes":"short optional nuance note"}.`,
          sourceText,
          1200
        );
        if (!cleanString(result.translation)) throw new Error("Translation response was empty.");
        result.translation = stripTransliteration(result.translation);
        return res.json({ success: true, action, ...result });
      }

      if (action === "placement") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const nativeLanguage = cleanString(payload.nativeLanguage, "English");
        const count = Math.max(8, Math.min(30, Number(payload.questionCount) || 15));
        const result = await generateJson(
          ai,
          buildPlacementAuthoringInstruction(targetLanguage, nativeLanguage, count),
          { learnerGoal: cleanString(payload.goal, "general fluency"), knownLevel: cleanString(payload.currentLevel, "unknown") },
          5000
        );
        if (!Array.isArray(result.questions) || result.questions.length !== count) throw new Error("Placement test generation was incomplete.");
        result.questions = result.questions.map((question: any) => ({ ...question, prompt: stripTransliteration(String(question.prompt || "")) }));
        const presentTiers = new Set(result.questions.map((question: any) => String(question.level).toUpperCase()));
        if (CEFR_LEVELS.some((level) => !presentTiers.has(level))) throw new Error("Placement test must contain evidence for every CEFR tier from A1 to C2.");
        const invalidQuestion = result.questions.some((question: any) => {
          if (!question || typeof question !== "object") return true;
          if (!CEFR_LEVELS.includes(String(question.level).toUpperCase() as typeof CEFR_LEVELS[number])) return true;
          if (!cleanString(question.prompt)) return true;
          if (!Array.isArray(question.options) || question.options.length !== 4) return true;
          const keys = question.options.map((option: any) => option?.key);
          if (new Set(keys).size !== 4 || !["A", "B", "C", "D"].every(key => keys.includes(key))) return true;
          if (!keys.includes(question.correctKey)) return true;
          const answers = question.options.map((option: any) => cleanString(option?.text || option?.text_native));
          return answers.some((answer: string) => !answer) || new Set(answers.map((answer: string) => answer.toLocaleLowerCase())).size !== 4;
        });
        if (invalidQuestion) throw new Error("Placement test contains invalid, duplicate, or incomplete answer options.");
        return res.json({ success: true, action, ...result });
      }

      if (action === "level-analysis") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const answers = payload.answers;
        if (!Array.isArray(answers) || answers.length < 3) throw new Error("At least three assessment answers are required.");
        const result = await generateJson(
          ai,
          `You are Fluentic's cautious CEFR assessor for ${targetLanguage}. Estimate the learner's level using only the supplied evidence. Distinguish demonstrated ability from uncertainty; never overstate precision. C1/C2 require advanced academic discourse, formal debate, complex literary/rhetorical analysis, inference and synthesis; elementary phrase recognition cannot support an advanced result. Evaluate grammar, vocabulary, reading, writing and communication where evidence exists. Return JSON: {"estimatedLevel":"A1|A2|B1|B2|C1|C2","confidence":0-100,"skillLevels":{"grammar":"...","vocabulary":"...","reading":"...","writing":"...","communication":"..."},"strengths":["..."],"priorityGaps":["..."],"reasoning":"...","recommendedNextStep":"..."}.`,
          { answers, selfReportedLevel: cleanString(payload.selfReportedLevel, "unknown"), learnerGoal: cleanString(payload.goal, "general fluency") },
          2200
        );
        if (!CEFR_LEVELS.includes(result.estimatedLevel)) throw new Error("The level assessor returned an invalid CEFR level.");
        const evidenceAnswers = answers.map((answer: any) => ({
          level: answer?.level,
          correct: typeof answer?.correct === "boolean" ? answer.correct : answer?.selectedKey === answer?.correctKey,
        }));
        const hasTierEvidence = evidenceAnswers.some((answer: any) => CEFR_LEVELS.includes(String(answer.level).toUpperCase() as any));
        if (hasTierEvidence) {
          const evidence = estimateLevelFromEvidence(evidenceAnswers);
          if (CEFR_LEVELS.indexOf(result.estimatedLevel) > CEFR_LEVELS.indexOf(evidence.level)) result.estimatedLevel = evidence.level;
          result.confidence = Math.min(100, Math.max(0, Math.min(Number(result.confidence) || 0, evidence.confidence)));
          result.evidenceByTier = evidence.evidence;
        }
        return res.json({ success: true, action, ...result });
      }

      if (action === "personal-lesson") {
        const targetLanguage = requireText(payload.targetLanguage, "targetLanguage", 100);
        const nativeLanguage = cleanString(payload.nativeLanguage, "English");
        const rawLevel = cleanString(payload.cefrLevel, "A1").toUpperCase();
        const level = CEFR_LEVELS.includes(rawLevel as any) ? rawLevel : "A1";
        const intent = normalizeLearningIntent(payload.learningIntent || payload.goal);
        const result = await generateJson(
          ai,
          buildPersonalLessonInstruction(targetLanguage, nativeLanguage, level as any, intent),
          {
            targetLanguage, nativeLanguage, level,
            goal: cleanString(payload.goal, "general fluency"),
            learningIntent: intent,
            interests: Array.isArray(payload.interests) ? payload.interests.slice(0, 8) : [],
            weaknesses: Array.isArray(payload.weaknesses) ? payload.weaknesses.slice(0, 12) : [],
            recentPerformance: payload.recentPerformance || {},
            minutesAvailable: Math.max(5, Math.min(60, Number(payload.minutesAvailable) || 15)),
          },
          3500
        );
        if (!Array.isArray(result.steps) || result.steps.length < 4) throw new Error("The adaptive lesson did not contain a complete retrieval-to-transfer sequence.");
        const allowedStepTypes = new Set(["retrieve", "construct", "feedback", "transfer", "review"]);
        const stepTypes = new Set(result.steps.map((step: any) => step?.type));
        if (result.steps.some((step: any) => !step || !allowedStepTypes.has(step.type) || !cleanString(step.instruction))) {
          throw new Error("The adaptive lesson contains malformed learning steps.");
        }
        if (!["retrieve", "construct", "feedback", "transfer"].every((type) => stepTypes.has(type))) {
          throw new Error("The adaptive lesson is missing a required learning stage.");
        }
        result.steps = result.steps.map((step: any) => ({ ...step, targetLanguageText: stripTransliteration(String(step.targetLanguageText || "")) }));
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
              { text: `Analyze this learner's speech. Target language: ${targetLanguage}. Feedback language: ${nativeLanguage}. Detect the spoken language, transcribe faithfully in its authentic writing system. Never include transliteration, Latin phonetic respelling, or English approximations in transcript, heard, or suggested fields. Evaluate intelligibility, pronunciation patterns, fluency and grammar only where audible. Do not guess inaudible words. Return JSON: {"transcript":"...","detectedLanguage":"...","targetLanguageMatch":true,"pronunciationScore":0-100,"fluencyScore":0-100,"intelligibilityScore":0-100,"observations":["..."],"corrections":[{"heard":"...","suggested":"...","reason":"..."}],"practiceDrill":"..."}.` },
            ],
          },
          config: { responseMimeType: "application/json", temperature: 0.15, maxOutputTokens: 1800 },
        });
        const analysis = parseJson(result.text || "");
        analysis.transcript = stripTransliteration(String(analysis.transcript || ""));
        analysis.corrections = Array.isArray(analysis.corrections) ? analysis.corrections.map((correction: any) => ({
          ...correction,
          heard: stripTransliteration(String(correction.heard || "")),
          suggested: stripTransliteration(String(correction.suggested || "")),
        })) : [];
        return res.json({ success: true, action, ...analysis });
      }

      if (action === "voice-synthesis") {
        const text = requireText(payload.text, "text", 5000);
        const language = cleanString(payload.language, "English");
        const languageCode = cleanString(payload.languageCode, "en-US");
        const voiceName = cleanString(payload.voiceName, "Kore");
        const style = cleanString(
          payload.style,
          "Fluentic's consistent tutor persona: warm, confident, encouraging, calm, articulate, and naturally conversational. Speak the supplied transcript verbatim in the language indicated by its script and language metadata. Use native phonology, natural sentence stress, appropriate cadence, and clear but unhurried pacing. Never read stage directions or add words."
        );

        // Gemini 3.8 TTS uses the Interactions API and structured speech metadata.
        const interaction = await ai.interactions.create({
          model: TTS_MODEL,
          input: [{
            type: "user_input",
            content: [{
              type: "text",
              text,
              annotations: [{ type: "speech_metadata", style }],
            }],
          }],
          response_format: { type: "audio" },
          generation_config: {
            speech_config: [{ voice: voiceName }],
          },
        } as any);

        const audioBase64 = (interaction as any).output_audio?.data;
        if (!audioBase64) throw new Error("Voice synthesis returned no audio.");
        return res.json({
          success: true,
          action,
          mimeType: "audio/wav",
          audioBase64,
          voiceName,
          language,
          languageCode,
          note: "Fluentic's consistent generated tutor voice. This is not a cloned person's voice.",
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
  app.post("/api/fluentic-ai/voice-stream", async (req: Request, res: Response) => {
    const ai = getAI();
    if (!ai) return res.status(503).json({ success: false, error: "Fluentic AI is not configured." });
    try {
      const payload = req.body?.payload && typeof req.body.payload === "object" ? req.body.payload : req.body;
      const text = requireText(payload.text, "text", 5000);
      const voiceName = cleanString(payload.voiceName, "Kore");
      const style = cleanString(payload.style, "Warm, clear, encouraging Fluentic language tutor. Speak the exact transcript with native pronunciation and natural conversational cadence.");
      res.status(200);
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();
      const stream = await ai.interactions.create({
        model: TTS_MODEL,
        input: [{ type: "user_input", content: [{ type: "text", text, annotations: [{ type: "speech_metadata", style }] }] }],
        response_format: { type: "audio", mime_type: "audio/l16", sample_rate: 24000 },
        generation_config: { speech_config: [{ voice: voiceName }] },
        stream: true,
      } as any);
      for await (const event of stream as any) {
        if (event?.event_type === "step.delta" && event.delta?.type === "audio" && event.delta.data) {
          res.write("data: " + JSON.stringify({ type: "audio", mimeType: "audio/l16", sampleRate: 24000, data: event.delta.data }) + "\n\n");
        }
      }
      res.write("data: " + JSON.stringify({ type: "done" }) + "\n\n");
      res.end();
    } catch (error: any) {
      const message = error?.message || "Fluentic voice stream failed.";
      if (res.headersSent) {
        res.write("data: " + JSON.stringify({ type: "error", error: message }) + "\n\n");
        res.end();
      } else {
        res.status(502).json({ success: false, error: message });
      }
    }
  });

}
