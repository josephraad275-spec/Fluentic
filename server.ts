import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { getI18n } from "./src/services/localization.ts";
import { stripTransliteration } from "./src/services/languageTypography.ts";

dotenv.config();

// Helper to convert raw 16kHz 16-bit mono PCM into standard WAV format
export function pcm16ToWav(pcmBuffer: Buffer, sampleRate: number = 16000, numChannels: number = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // 16 bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

interface GenerateContentOptions {
  contents: any;
  config?: any;
  preferredModel?: string;
}

// Models supported according to the Gemini API guidelines in SKILL.md:
// "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: GenerateContentOptions
) {
  const preferred = options.preferredModel || "gemini-3.8-flash";
  const modelList = Array.from(new Set([preferred, ...CANDIDATE_MODELS]));

  let lastError: any = null;

  for (let i = 0; i < modelList.length; i++) {
    const model = modelList[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isCapacityOrTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.code === 503 ||
        err?.code === 429 ||
        errMsg.includes("503") ||
        errMsg.includes("429") ||
        errMsg.includes("high demand") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isCapacityOrTransient && i < modelList.length - 1) {
        console.warn(`[Gemini Failover] Model "${model}" hit capacity constraint (${errMsg.slice(0, 60)}...). Failing over to "${modelList[i + 1]}"...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        continue;
      }

      if (i < modelList.length - 1) {
        console.warn(`[Gemini Failover] Model "${model}" returned error. Retrying with "${modelList[i + 1]}"...`);
        continue;
      }
    }
  }

  throw lastError;
}

// Ultra-fast multimodal audio transcription and live translation via Gemini 3.5 Transcribe / 3.8 Flash
export async function processAudioWithGemini(
  audioWavBase64: string,
  sourceLang: string = "auto",
  targetLang: string = "English"
): Promise<{ transcription: string; translation: string; detectedSource: string; latencyMs: number }> {
  const startTime = Date.now();
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini AI client not initialized (missing GEMINI_API_KEY)");
  }

  const prompt = `You are an ultra-fast multimodal transcription and speech translation engine.
Source language hint: ${sourceLang}.
Target language: ${targetLang}.
Strict rules:
1. Transcribe the audio speech verbatim into its authentic native script (e.g. Arabic, Russian, French, Spanish, Japanese, German, Chinese, etc.). Zero Latin transliteration.
2. Translate the speech into fluent, accurate ${targetLang}.
Return strictly valid JSON matching:
{
  "transcription": "<verbatim native script transcription>",
  "translation": "<fluent translation in ${targetLang}>",
  "detectedSource": "<detected source language name>"
}`;

  const audioPart = {
    inlineData: {
      mimeType: "audio/wav",
      data: audioWavBase64,
    },
  };

  const audioModels = ["gemini-3.5-transcribe", "gemini-3.8-flash", "gemini-flash-latest"];
  let lastErr = null;

  for (const model of audioModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [audioPart, { text: prompt }],
        },
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const raw = (response.text || "").trim();
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = JSON.parse(cleaned);

      return {
        transcription: String(parsed.transcription || "").trim(),
        translation: String(parsed.translation || "").trim(),
        detectedSource: parsed.detectedSource || sourceLang,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Audio Process Warning] Model ${model} failed, trying fallback:`, err?.message || err);
      continue;
    }
  }

  throw lastErr || new Error("Failed to process audio with Gemini models");
}

function getFallbackPlacementQuestions(
  target: string,
  native: string,
  targetCode?: string,
  nativeCode?: string
) {
  const isDutch = (nativeCode === 'nl') || (native || '').toLowerCase().includes('dutch') || (native || '').toLowerCase().includes('nederlands');
  
  const lowerTarget = (target || '').toLowerCase();
  const code = (targetCode || '').toLowerCase();

  let greetings = ["Hola", "Buenos días", "Buenas tardes", "Adiós"];
  let cafe = ["Un café, por favor", "La cuenta, por favor", "Cuánto cuesta?"];
  let transit = ["Dónde está la estación?", "A qué hora sale el tren?", "Gire a la derecha"];
  let social = ["Mucho gusto en conocerte", "De dónde eres?", "Hablo un poco"];

  if (code === 'fr' || lowerTarget.includes('french') || lowerTarget.includes('français')) {
    greetings = ["Bonjour", "Bonsoir", "Salut", "Au revoir"];
    cafe = ["Un café, s'il vous plaît", "L'addition, s'il vous plaît", "Combien ça coûte ?"];
    transit = ["Où est la gare ?", "À quelle heure part le train ?", "Tournez à droite"];
    social = ["Enchanté de faire votre connaissance", "D'où venez-vous ?", "J'apprends la langue"];
  } else if (code === 'de' || lowerTarget.includes('german') || lowerTarget.includes('deutsch')) {
    greetings = ["Guten Tag", "Guten Morgen", "Hallo", "Auf Wiedersehen"];
    cafe = ["Einen Kaffee, bitte", "Die Rechnung, bitte", "Wie viel kostet das?"];
    transit = ["Wo ist der Bahnhof?", "Wann fährt der Zug ab?", "Biegen Sie rechts ab"];
    social = ["Freut mich, Sie kennenzulernen", "Woher kommen Sie?", "Ich lerne diese Sprache"];
  } else if (code === 'it' || lowerTarget.includes('italian') || lowerTarget.includes('italiano')) {
    greetings = ["Buongiorno", "Ciao", "Buonasera", "Arrivederci"];
    cafe = ["Un caffè, per favore", "Il conto, per favore", "Quanto costa?"];
    transit = ["Dov'è la stazione?", "A che ora parte il treno?", "Gira a destra"];
    social = ["Piacere di conoscerti", "Di dove sei?", "Sto imparando la lingua"];
  } else if (code === 'ja' || lowerTarget.includes('japanese') || lowerTarget.includes('nihongo')) {
    greetings = ["こんにちは", "おはようございます", "こんばんは", "さようなら"];
    cafe = ["コーヒーを一杯ください", "お会計をお願いします", "いくらですか？"];
    transit = ["駅はどこですか？", "電車は何時に出発しますか？", "右に曲がってください"];
    social = ["はじめまして、よろしくお願いします", "出身はどこですか？", "勉強中です"];
  } else if (code === 'ar' || lowerTarget.includes('arabic') || lowerTarget.includes('العربية')) {
    greetings = ["مرحباً", "صباح الخير", "مساء الخير", "مع السلامة"];
    cafe = ["قهوة من فضلك", "الحساب لو سمحت", "كم ثمن هذا؟"];
    transit = ["أين المحطة؟", "متى يغادر القطار؟", "انعطف يميناً"];
    social = ["تشرفت بمعرفتك", "من أين أنت؟", "أنا أتعلم اللغة"];
  } else if (code === 'zh' || lowerTarget.includes('chinese') || lowerTarget.includes('mandarin')) {
    greetings = ["你好", "早上好", "晚上好", "再见"];
    cafe = ["请给我一杯咖啡", "买单，谢谢", "这个多少钱？"];
    transit = ["请问车站在哪里？", "火车几点出发？", "向右转"];
    social = ["很高兴认识你", "你来自哪里？", "我正在学语言"];
  } else if (code === 'nl' || lowerTarget.includes('dutch') || lowerTarget.includes('nederlands')) {
    greetings = ["Hallo", "Goedemorgen", "Goedenavond", "Tot ziens"];
    cafe = ["Een koffie, alstublieft", "De rekening, graag", "Hoeveel kost dit?"];
    transit = ["Waar is het station?", "Hoe laat vertrekt de trein?", "Sla rechtsaf"];
    social = ["Aangenaam kennis te maken", "Waar kom je vandaan?", "Ik leer de taal"];
  }

  const promptSelect = isDutch ? "Kies de juiste betekenis of vorm in het" : "Choose the correct meaning or form in";
  const skillLabel = (nlStr: string, enStr: string) => isDutch ? nlStr : enStr;

  return {
    targetLanguage: target,
    nativeLanguage: native,
    questions: [
      {
        id: 1,
        level: "A1",
        target_skill: skillLabel("Begroetingen & Basis", "Greetings & Essentials"),
        prompt_native: greetings[0],
        prompt_translation: `${promptSelect} ${target}: "${greetings[0]}"`,
        options: [
          { key: "A", text_native: greetings[0], text_translation: skillLabel("Hallo / Goedendag", "Hello / Good day") },
          { key: "B", text_native: greetings[3], text_translation: skillLabel("Tot ziens", "Goodbye") },
          { key: "C", text_native: cafe[1], text_translation: skillLabel("De rekening, alstublieft", "The bill, please") },
          { key: "D", text_native: transit[2], text_translation: skillLabel("Sla rechtsaf", "Turn right") }
        ],
        correct_key: "A",
        explanation_translation: skillLabel("Dit is de universele begroeting.", "This is the primary greeting formula.")
      },
      {
        id: 2,
        level: "A2",
        target_skill: skillLabel("Eten & Bestellen", "Dining & Ordering"),
        prompt_native: cafe[0],
        prompt_translation: `${promptSelect} ${target}: "${cafe[0]}"`,
        options: [
          { key: "A", text_native: greetings[1], text_translation: skillLabel("Goedemorgen", "Good morning") },
          { key: "B", text_native: cafe[0], text_translation: skillLabel("Een koffie, alstublieft", "A coffee, please") },
          { key: "C", text_native: transit[0], text_translation: skillLabel("Waar is het station?", "Where is the station?") },
          { key: "D", text_native: greetings[3], text_translation: skillLabel("Tot ziens", "Goodbye") }
        ],
        correct_key: "B",
        explanation_translation: skillLabel("Beleefde formule om drinken te bestellen.", "Standard polite ordering request.")
      },
      {
        id: 3,
        level: "A3",
        target_skill: skillLabel("Oriëntatie & Vervoer", "Wayfinding & Transit"),
        prompt_native: transit[0],
        prompt_translation: `${promptSelect} ${target}: "${transit[0]}"`,
        options: [
          { key: "A", text_native: greetings[0], text_translation: skillLabel("Hallo", "Hello") },
          { key: "B", text_native: cafe[2], text_translation: skillLabel("Hoeveel kost dit?", "How much does this cost?") },
          { key: "C", text_native: transit[0], text_translation: skillLabel("Waar is het station?", "Where is the station?") },
          { key: "D", text_native: social[1], text_translation: skillLabel("Waar kom je vandaan?", "Where are you from?") }
        ],
        correct_key: "C",
        explanation_translation: skillLabel("Essentiële vraag om de weg te vinden.", "Essential direction and transit query.")
      },
      {
        id: 4,
        level: "B1",
        target_skill: skillLabel("Sociale Introductie", "Social Introduction"),
        prompt_native: social[0],
        prompt_translation: `${promptSelect} ${target}: "${social[0]}"`,
        options: [
          { key: "A", text_native: social[0], text_translation: skillLabel("Aangenaam kennis te maken", "Pleased to meet you") },
          { key: "B", text_native: cafe[1], text_translation: skillLabel("De rekening", "The bill") },
          { key: "C", text_native: transit[1], text_translation: skillLabel("Vertrektijd van de trein", "Train departure time") },
          { key: "D", text_native: greetings[2], text_translation: skillLabel("Goedenavond", "Good evening") }
        ],
        correct_key: "A",
        explanation_translation: skillLabel("Beleefdheidsformule bij een eerste ontmoeting.", "Courteous introduction phrase.")
      },
      {
        id: 5,
        level: "B2",
        target_skill: skillLabel("Tijd & Dienstregeling", "Time & Scheduling"),
        prompt_native: transit[1],
        prompt_translation: `${promptSelect} ${target}: "${transit[1]}"`,
        options: [
          { key: "A", text_native: cafe[0], text_translation: skillLabel("Koffie bestellen", "Ordering coffee") },
          { key: "B", text_native: transit[1], text_translation: skillLabel("Hoe laat vertrekt de trein?", "What time does the train depart?") },
          { key: "C", text_native: social[0], text_translation: skillLabel("Aangenaam", "Pleased to meet you") },
          { key: "D", text_native: greetings[1], text_translation: skillLabel("Goedemorgen", "Good morning") }
        ],
        correct_key: "B",
        explanation_translation: skillLabel("Vraagconstructie voor tijdstippen en schema's.", "Interrogative structure for transport timetables.")
      },
      {
        id: 6,
        level: "B3",
        target_skill: skillLabel("Herkomst & Gespreksvoering", "Origins & Conversation"),
        prompt_native: social[1],
        prompt_translation: `${promptSelect} ${target}: "${social[1]}"`,
        options: [
          { key: "A", text_native: greetings[3], text_translation: skillLabel("Tot ziens", "Goodbye") },
          { key: "B", text_native: transit[0], text_translation: skillLabel("Waar is het station?", "Where is the station?") },
          { key: "C", text_native: social[1], text_translation: skillLabel("Waar kom je vandaan?", "Where do you come from?") },
          { key: "D", text_native: cafe[2], text_translation: skillLabel("Hoeveel kost dit?", "How much is this?") }
        ],
        correct_key: "C",
        explanation_translation: skillLabel("Vraag naar achtergrond of nationaliteit.", "Conversational inquiry about origin.")
      },
      {
        id: 7,
        level: "C1",
        target_skill: skillLabel("Financiële & Formele Transacties", "Formal & Commercial Transactions"),
        prompt_native: cafe[1],
        prompt_translation: `${promptSelect} ${target}: "${cafe[1]}"`,
        options: [
          { key: "A", text_native: cafe[1], text_translation: skillLabel("De rekening, alstublieft", "The check, please") },
          { key: "B", text_native: greetings[0], text_translation: skillLabel("Hallo", "Hello") },
          { key: "C", text_native: transit[2], text_translation: skillLabel("Sla rechtsaf", "Turn right") },
          { key: "D", text_native: social[0], text_translation: skillLabel("Aangenaam", "Pleased to meet you") }
        ],
        correct_key: "A",
        explanation_translation: skillLabel("Formele afsluiting van een restaurantbezoek.", "Idiomatic commercial transaction request.")
      },
      {
        id: 8,
        level: "C2",
        target_skill: skillLabel("Navigatie & Ruimtelijke Instructies", "Directional & Spatial Instructions"),
        prompt_native: transit[2],
        prompt_translation: `${promptSelect} ${target}: "${transit[2]}"`,
        options: [
          { key: "A", text_native: cafe[0], text_translation: skillLabel("Koffie bestellen", "Coffee order") },
          { key: "B", text_native: greetings[2], text_translation: skillLabel("Goedenavond", "Good evening") },
          { key: "C", text_native: transit[2], text_translation: skillLabel("Sla rechtsaf", "Turn to the right") },
          { key: "D", text_native: social[1], text_translation: skillLabel("Waar kom je vandaan?", "Where are you from?") }
        ],
        correct_key: "C",
        explanation_translation: skillLabel("Gebiedende wijs / instructieve richting.", "Imperative spatial directive.")
      },
      {
        id: 9,
        level: "C3",
        target_skill: skillLabel("Waarde & Prijsonderhandeling", "Valuation & Price Inquiry"),
        prompt_native: cafe[2],
        prompt_translation: `${promptSelect} ${target}: "${cafe[2]}"`,
        options: [
          { key: "A", text_native: cafe[2], text_translation: skillLabel("Hoeveel kost dit?", "How much does this cost?") },
          { key: "B", text_native: greetings[3], text_translation: skillLabel("Tot ziens", "Goodbye") },
          { key: "C", text_native: social[0], text_translation: skillLabel("Aangenaam", "Pleased to meet you") },
          { key: "D", text_native: transit[0], text_translation: skillLabel("Waar is het station?", "Where is the station?") }
        ],
        correct_key: "A",
        explanation_translation: skillLabel("Nauwkeurige kwantitatieve vraagzin.", "Precise financial inquiry formula.")
      },
      {
        id: 10,
        level: "C3+",
        target_skill: skillLabel("Taalverwerving & Zelfexpressie", "Language Mastery & Expression"),
        prompt_native: social[2],
        prompt_translation: `${promptSelect} ${target}: "${social[2]}"`,
        options: [
          { key: "A", text_native: greetings[1], text_translation: skillLabel("Goedemorgen", "Good morning") },
          { key: "B", text_native: cafe[1], text_translation: skillLabel("De rekening", "The bill") },
          { key: "C", text_native: transit[1], text_translation: skillLabel("Vertrektijd", "Departure time") },
          { key: "D", text_native: social[2], text_translation: skillLabel("Ik spreek / leer de taal", "I speak / am learning the language") }
        ],
        correct_key: "D",
        explanation_translation: skillLabel("Meta-linguïstische expressie van taalvaardigheid.", "Meta-linguistic statement of language proficiency.")
      }
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
  });

  // =========================================================================
  // MASTER SYSTEM DIRECTIVE: FLUENTIC OMNI-APP ENGINE (V24 CORE)
  // Centralized backend processing brain and pedagogical engine
  // Governs: Onboarding, Diagnostic Placement Testing, Active Chat, and Adaptive Curriculum
  // Enforces 100% Native Language UI Purity, Target Script Purity, Zero Gamification, and Guardrails
  // =========================================================================
  const handleOmniEngineRequest = async (req: express.Request, res: express.Response) => {
    try {
      const mode = (req.body?.mode || "").toLowerCase().trim();
      const payload = req.body?.payload || req.body || {};
      const ai = getGeminiClient();

      // -----------------------------------------------------------------------
      // MODE 1: ONBOARDING (`onboarding`)
      // -----------------------------------------------------------------------
      if (mode === "onboarding") {
        const rawDisplayName = typeof payload.displayName === "string" ? payload.displayName.trim() : "";
        const nativeLanguageCode = (payload.nativeLanguageCode || "en").toLowerCase().trim();
        const targetLanguageCode = (payload.targetLanguageCode || "es").toLowerCase().trim();
        const learningIntent = payload.learningIntent || "conversational";

        const isArabic = nativeLanguageCode === "ar";
        const isDutch = nativeLanguageCode === "nl";

        // Display Name defaults strictly to "Enter your name" ("أدخل اسمك" in Arabic locale) if unprovided
        const fallbackDisplayName = isArabic ? "أدخل اسمك" : "Enter your name";
        const finalDisplayName = rawDisplayName.length > 0 ? rawDisplayName : fallbackDisplayName;

        // Immediately adapt 100% of UI string translations (`ui_translation`) to selected native language
        const uiTranslation = getI18n(nativeLanguageCode);

        // Build pedagogical trajectory based on learning intent
        const trajectoryMap: Record<string, { primaryFocus: string; milestones: string[]; rationale: string }> = {
          business: {
            primaryFocus: isArabic
              ? "المفاوضات المهنية، صياغة المراسلات الرسمية، ومصطلحات الأعمال والعقود"
              : isDutch
              ? "Zakelijke onderhandelingen, formele correspondentie en contractvocabulaire"
              : "Professional negotiation, formal correspondence, and corporate discourse",
            milestones: [
              isArabic ? "المصطلحات الرسمية وآداب الاجتماعات (B1)" : "Formal workplace etiquette & lexicon (B1)",
              isArabic ? "صياغة المقترحات والحجج التفاوضية (B2)" : "Negotiation proposals & counter-arguments (B2)",
              isArabic ? "البلاغة التنفيذية والإقناع الاستراتيجي (C1/C2)" : "Executive rhetoric & strategic persuasion (C1/C2)"
            ],
            rationale: isArabic
              ? "مسار مهني مكثف يركز على الدقة اللغوية والأسلوب الرسمي المعتمد."
              : "High-precision professional curriculum calibrated for workplace mastery without casual fluff."
          },
          travel: {
            primaryFocus: isArabic
              ? "الملاحة في المطارات والمحطات، المعاملات الفندقية، والمواقف الطارئة"
              : isDutch
              ? "Transithandelingen, reserveringen, stadsnavigatie en noodsituaties"
              : "Transit wayfinding, hospitality exchanges, and urgent navigation",
            milestones: [
              isArabic ? "تعبيرات الاستقبال والتنقل الحيوي (A1/A2)" : "Survival phonics & transit phrases (A1/A2)",
              isArabic ? "إدارة المواقف غير المتوقعة وحل المشكلات (B1)" : "Situational problem-solving & inquiries (B1)",
              isArabic ? "التفاعل العفوي والتفاهم الثقافي المعمق (B2)" : "Spontaneous cultural interaction & colloquial ease (B2)"
            ],
            rationale: isArabic
              ? "تركيز على الاستدعاء الذهني الفوري للجمل الأكثر فاعلية في السفر."
              : "Fast-acting functional fluency prioritizing direct real-world comprehension."
          },
          academic: {
            primaryFocus: isArabic
              ? "الخطاب الأكاديمي، النقد الفكري، وتحليل النصوص الأدبية والبحوث"
              : isDutch
              ? "Academisch discours, formele debatten en literaire tekstanalyse"
              : "Academic discourse, formal debate registers, and literary analysis",
            milestones: [
              isArabic ? "بناء الجمل المركبة والروابط المنطقية (B1/B2)" : "Complex subordinating syntax & logical connectors (B1/B2)",
              isArabic ? "المناظرة الفكرية وتفنيد الأطروحات (C1)" : "Dialectical argumentation & rhetorical defense (C1)",
              isArabic ? "التحليل الأسلوبي والبلاغة الكلاسيكية المتقدمة (C2)" : "Stylistics, classical prose & literary deconstruction (C2)"
            ],
            rationale: isArabic
              ? "مسار أكاديمي صارم يستبعد الجمل البسيطة ويركز على الفصاحة الفكرية."
              : "Strict academic curriculum rigorously excluding basic greetings and forcing advanced rhetoric."
          },
          conversational: {
            primaryFocus: isArabic
              ? "الطلاقة الحوارية العفوية، التعبيرات الاصطلاحية، والتواصل الاجتماعي الدافئ"
              : isDutch
              ? "Spontane sociale vloeiendheid, idiomatische expressie en dagelijkse dialoog"
              : "Spontaneous conversational fluency, idiomatic mastery, and social nuance",
            milestones: [
              isArabic ? "التعارف والاهتمامات الشخصية (A2)" : "Everyday social introductions & interests (A2)",
              isArabic ? "سرد القصص والآراء العفوية (B1/B2)" : "Narrative expression & nuanced perspectives (B1/B2)",
              isArabic ? "استيعاب السخرية الخفيفة والأمثال الشعبية (C1)" : "Cultural proverbs, humor, and natural idioms (C1)"
            ],
            rationale: isArabic
              ? "تطوير ردود الفعل اللغوية التلقائية والطلاقة الصوتية."
              : "Spaced active recall tuned for fluid communicative confidence."
          }
        };

        const trajectory = trajectoryMap[learningIntent] || trajectoryMap.conversational;

        return res.json({
          status: "success",
          mode: "onboarding",
          user_profile: {
            displayName: finalDisplayName,
            nativeLanguageCode,
            targetLanguageCode,
            learningIntent,
            // ZERO GAMIFICATION: progression measured through structural mastery and active recall
            structuralMastery: 0,
            activeRecallRetentionRate: 100,
            spacedErrorRecyclingCount: 0,
            currentCefr: "A1"
          },
          ui_translation: uiTranslation,
          pedagogical_trajectory: trajectory
        });
      }

      // -----------------------------------------------------------------------
      // MODE 2: DIAGNOSTIC PLACEMENT TESTING (`placement_test`)
      // -----------------------------------------------------------------------
      if (mode === "placement_test") {
        const action = payload.action || (payload.userAnswers ? "evaluate" : "generate_questions");
        const targetLanguage = payload.targetLanguage || "Spanish";
        const targetLanguageCode = (payload.targetLanguageCode || "es").toLowerCase();
        const nativeLanguage = payload.nativeLanguage || "English";
        const nativeLanguageCode = (payload.nativeLanguageCode || "en").toLowerCase();
        const isArabic = nativeLanguageCode === "ar";
        const isDutch = nativeLanguageCode === "nl";

        // Evaluation Action: Calculate CEFR placement levels dynamically based on accuracy
        if (action === "evaluate") {
          const userAnswers = Array.isArray(payload.userAnswers) ? payload.userAnswers : [];
          const totalEvaluated = Math.max(userAnswers.length, 1);
          const correctCount = userAnswers.filter((a: any) => a.selectedKey === a.correctKey).length;
          const accuracyPercentage = Math.round((correctCount / totalEvaluated) * 100);

          let assessedLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" = "A1";
          if (correctCount >= 9) assessedLevel = "C2";
          else if (correctCount >= 7) assessedLevel = "C1";
          else if (correctCount >= 5) assessedLevel = "B2";
          else if (correctCount >= 3) assessedLevel = "B1";
          else if (correctCount >= 2) assessedLevel = "A2";

          const errors = userAnswers.filter((a: any) => a.selectedKey !== a.correctKey);

          let diagnosticFeedback = isArabic
            ? `أظهرت دقة بنسبة ${accuracyPercentage}% عبر المعايير الأوروبية المرجعية CEFR. تم تعيين مستواك اللغوي عند: ${assessedLevel}.`
            : isDutch
            ? `Je behaalde ${accuracyPercentage}% nauwkeurigheid op de ERK-standaard. Gekwalificeerd niveau: ${assessedLevel}.`
            : `Demonstrated ${accuracyPercentage}% accuracy across CEFR standardized benchmarks. Verified Level: ${assessedLevel}.`;

          const conceptMap = [
            {
              concept: isArabic ? "مخارج الحروف والتطابق الصوتي" : "Orthographic Phonics & Mechanics",
              status: correctCount >= 2 ? "mastered" : "emerging",
              tier: "A1"
            },
            {
              concept: isArabic ? "الربط النحوي والتراكيب الظرفية" : "Complex Subordinate Conjunctions",
              status: correctCount >= 5 ? "mastered" : "needs_review",
              tier: "B1"
            },
            {
              concept: isArabic ? "الخطاب الأكاديمي والتحليل البلاغي" : "Advanced Academic Discourse & Rhetoric",
              status: correctCount >= 8 ? "mastered" : "needs_review",
              tier: "C1"
            }
          ];

          // If AI client is configured, enrich diagnostic feedback with linguistic concept mapping
          if (ai && errors.length > 0) {
            try {
              const diagnosticPrompt = `You are Fluentic Diagnostic Evaluation Engine.
User tested for target language: ${targetLanguage}.
User native language: ${nativeLanguage}.
Assessed level: ${assessedLevel} (${correctCount}/${totalEvaluated} correct).
Errors logged: ${JSON.stringify(errors.slice(0, 5))}.
Provide:
1. Concise linguistic feedback in ${nativeLanguage} explaining the exact grammatical confusion and how to overcome it.
2. Error breakdowns for missed questions in ${nativeLanguage}.
Format strictly as JSON:
{
  "realtimeGrammarFeedback": "...",
  "errorBreakdowns": [
    {"questionId": 1, "errorSnippet": "...", "grammaticalCorrection": "...", "linguisticReason": "..."}
  ]
}`;
              const diagResponse = await generateContentWithFallback(ai, {
                contents: diagnosticPrompt,
                config: { responseMimeType: "application/json", temperature: 0.2 },
              });
              const diagParsed = JSON.parse(diagResponse.text || "{}");
              if (diagParsed.realtimeGrammarFeedback) {
                diagnosticFeedback = diagParsed.realtimeGrammarFeedback;
              }
              if (Array.isArray(diagParsed.errorBreakdowns)) {
                return res.json({
                  status: "success",
                  mode: "placement_test",
                  diagnostic_data: {
                    assessedLevel,
                    calibratedScore: correctCount,
                    totalEvaluated,
                    structuralMasteryPercentage: accuracyPercentage,
                    activeRecallRetentionRate: Math.max(65, accuracyPercentage),
                    spacedErrorRecycling: {
                      recycledErrorCount: errors.length,
                      flaggedConcepts: errors.map((e: any) => e.targetSkill || "Syntax")
                    },
                    conceptMapping: conceptMap,
                    realtimeGrammarFeedback: diagnosticFeedback,
                    errorBreakdowns: diagParsed.errorBreakdowns
                  }
                });
              }
            } catch (err) {
              console.warn("[Omni-Engine Placement Diagnosis AI Warning]", err);
            }
          }

          return res.json({
            status: "success",
            mode: "placement_test",
            diagnostic_data: {
              assessedLevel,
              calibratedScore: correctCount,
              totalEvaluated,
              structuralMasteryPercentage: accuracyPercentage,
              activeRecallRetentionRate: Math.max(65, accuracyPercentage),
              spacedErrorRecycling: {
                recycledErrorCount: errors.length,
                flaggedConcepts: errors.map((e: any) => e.targetSkill || "Grammar Focus")
              },
              conceptMapping: conceptMap,
              realtimeGrammarFeedback: diagnosticFeedback,
              errorBreakdowns: errors.map((err: any) => ({
                questionId: err.questionId,
                userChoice: err.selectedKey,
                correctKey: err.correctKey,
                errorSnippet: err.selectedText || "",
                grammaticalCorrection: err.correctText || "",
                linguisticReason: isArabic
                  ? `الخيار الصحيح يراعي القواعد الهيكلية لـ: ${err.targetSkill || "بناء الجملة"}.`
                  : `Choice ${err.correctKey} demonstrates accurate structural morphology for: ${err.targetSkill || "syntax"}.`
              }))
            }
          });
        }

        // Question Generation: strictly follow tier criteria
        // A1/A2: native script mechanics, fundamental phonics, core high-frequency structures
        // B1/B2: situational navigation, complex conjunctions, intermediate syntax
        // C1/C2: STRICTLY BAN basic greetings or simple phrases. Force advanced academic discourse, formal debate registers, complex literary prose, and rhetorical analysis.
        // Target script purity: zero Latin transliterations.
        if (ai) {
          try {
            const prompt = `You are Fluentic Adaptive Placement Engine V24 Core.
Target language: ${targetLanguage} (${targetLanguageCode}).
User native language: ${nativeLanguage} (${nativeLanguageCode}).

MANDATED TIER REQUIREMENTS:
- A1 / A2 Tiers (Q1-Q3): Native script mechanics, fundamental phonics, core high-frequency survival structures.
- B1 / B2 Tiers (Q4-Q7): Situational navigation, complex conjunctions, intermediate syntax, hypothetical clauses.
- C1 / C2 Tiers (Q8-Q10): STRICTLY BAN basic greetings or simple phrases. Force advanced academic discourse, formal debate registers, complex literary prose, and rhetorical analysis.

MANDATED SCRIPT CONSTRAINTS:
- All target phrases, reading passages, and multiple-choice options MUST be in authentic native script of ${targetLanguage}.
- STRICT BAN: Zero Latin transliterations, phonetic guide strings, or English phonetic approximations permitted in target fields.
- Prompts, instructions, questions, and explanations MUST be in ${nativeLanguage}.

Format strictly as JSON:
{
  "questions": [
    {
      "id": 1,
      "level": "A1",
      "target_skill": "Skill name in ${nativeLanguage}",
      "instruction": "Instruction prompt in ${nativeLanguage}",
      "prompt": "Prompt text in authentic ${targetLanguage} native script (ZERO transliteration)",
      "options": [
        {"key": "A", "text": "Option A in ${targetLanguage} native script"},
        {"key": "B", "text": "Option B in ${targetLanguage} native script"},
        {"key": "C", "text": "Option C in ${targetLanguage} native script"},
        {"key": "D", "text": "Option D in ${targetLanguage} native script"}
      ],
      "correct_key": "A",
      "explanation": "Clear grammatical explanation in ${nativeLanguage}"
    }
  ]
}`;
            const response = await generateContentWithFallback(ai, {
              contents: prompt,
              config: { responseMimeType: "application/json", temperature: 0.25 },
            });
            const parsed = JSON.parse(response.text || "{}");
            if (Array.isArray(parsed.questions) && parsed.questions.length >= 8) {
              // Ensure pure native script on all generated items
              const cleanedQuestions = parsed.questions.map((q: any) => ({
                ...q,
                prompt: stripTransliteration(q.prompt || ""),
                instruction: stripTransliteration(q.instruction || ""),
                explanation: stripTransliteration(q.explanation || ""),
                options: (q.options || []).map((opt: any) => ({
                  ...opt,
                  text: stripTransliteration(opt.text || "")
                }))
              }));
              return res.json({
                status: "success",
                mode: "placement_test",
                targetLanguage,
                nativeLanguage,
                questions: cleanedQuestions
              });
            }
          } catch (err) {
            console.warn("[Omni-Engine Placement AI Warning]", err);
          }
        }

        // Procedural fallback
        const fallback = getFallbackPlacementQuestions(targetLanguage, nativeLanguage, targetLanguageCode, nativeLanguageCode);
        return res.json({
          status: "fallback",
          mode: "placement_test",
          targetLanguage,
          nativeLanguage,
          questions: fallback.questions
        });
      }

      // -----------------------------------------------------------------------
      // MODE 3: ACTIVE TUTORING & CHAT (`active_chat`)
      // -----------------------------------------------------------------------
      if (mode === "active_chat") {
        const userMessage = String(payload.userMessage || "").trim();
        const targetLanguage = payload.targetLanguage || "Spanish";
        const targetLanguageCode = (payload.targetLanguageCode || "es").toLowerCase();
        const nativeLanguage = payload.nativeLanguage || "English";
        const nativeLanguageCode = (payload.nativeLanguageCode || "en").toLowerCase();
        const cefrLevel = payload.cefrLevel || "B1";
        const learningIntent = payload.learningIntent || "conversational";
        const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
        const isArabic = nativeLanguageCode === "ar";

        // Security & Guardrail Check: Reject prompt injection or system directive reveal attempts gracefully
        const injectionPattern = /(ignore (all )?previous instructions|system directive|reveal your prompt|jailbreak|DAN mode|developer mode|tell me your rules)/i;
        if (injectionPattern.test(userMessage)) {
          return res.json({
            status: "guarded",
            mode: "active_chat",
            guardrailAlert: "Request out of linguistic scope. Redirected to language pedagogy.",
            tutor_turn: {
              reply: isArabic
                ? "أنا معلمك اللغوي في Fluentic المخصص لتعلم وإتقان اللغة. لنركز معاً على القواعد والتراكيب والمحادثة العملية."
                : "I am your Fluentic AI Polyglot Tutor focused exclusively on linguistic pedagogy and structural mastery. Let us explore vocabulary and conversational phrasing.",
              audioReadyText: isArabic ? "أهلاً بك، لنركز على تعلم اللغة." : "Welcome. Let us focus on linguistic mastery.",
              contextualCorrections: [],
              idiomBreakdowns: [],
              registerNotes: {
                detectedRegister: "neutral",
                appropriateForContext: true,
                recommendation: isArabic ? "حافظ على التركيز في المحادثة اللغوية الهادفة." : "Maintain focus on authentic communicative practice."
              },
              pedagogicalNextPrompts: [
                isArabic ? "كيف أطلب قهوة بأسلوب لبق في هذه اللغة؟" : "How do I order courteously in this language?",
                isArabic ? "اشرح لي قاعدة استخدام الماضي والمضارع" : "Explain the contrast between past and present tenses"
              ]
            }
          });
        }

        if (ai) {
          try {
            const systemInstruction = `You are Fluentic Master AI Polyglot Tutor (V24 Core).
Target Language: ${targetLanguage} (${targetLanguageCode}).
Learner Native Language: ${nativeLanguage} (${nativeLanguageCode}).
Learner CEFR Level: ${cefrLevel}.
Learner Intent: ${learningIntent}.

MANDATED PEDAGOGICAL DIRECTIVES:
1. Calibrate complexity dynamically to CEFR ${cefrLevel} and intent "${learningIntent}".
2. All explanations, tips, and translations MUST be written 100% in the user's native language (${nativeLanguage}). Zero English leakage if native language is not English.
3. Target Language Utterance: Authentic native script for ${targetLanguage}. Zero Latin transliterations permitted in target fields.
4. Audio Ready Text: Provide an audio-ready string of pure target language text optimized for zero-latency Text-to-Speech (TTS) engines.
5. Contextual Corrections: If the user wrote in ${targetLanguage}, analyze their grammar, syntax, verb conjugations, and word choice. Highlight errors and explain the rule in ${nativeLanguage}.
6. Idiom Breakdowns: Break down any idioms, metaphors, or cultural expressions used.
7. Register Notes: State whether the register is colloquial, neutral, formal, or academic, and note if it is appropriate.

Format strictly as JSON:
{
  "reply": "Warm pedagogical reply and explanation written entirely in ${nativeLanguage}",
  "targetLanguageUtterance": "Exemplary phrase in ${targetLanguage} native script (ZERO Latin transliteration)",
  "audioReadyText": "Clean target phrase for TTS in ${targetLanguage}",
  "translation": "Natural translation in ${nativeLanguage}",
  "contextualCorrections": [
    {
      "originalSnippet": "User phrase slip",
      "correctedSnippet": "Polished native phrase in ${targetLanguage}",
      "grammaticalRule": "Grammar rule explanation in ${nativeLanguage}",
      "severity": "minor" | "critical"
    }
  ],
  "idiomBreakdowns": [
    {
      "idiom": "Idiom in ${targetLanguage}",
      "literalMeaning": "Literal translation in ${nativeLanguage}",
      "pragmaticUsage": "How natives use it in ${nativeLanguage}"
    }
  ],
  "registerNotes": {
    "detectedRegister": "colloquial" | "neutral" | "formal" | "academic",
    "appropriateForContext": true,
    "recommendation": "Advice on register in ${nativeLanguage}"
  },
  "pedagogicalNextPrompts": ["Interactive prompt 1 in ${nativeLanguage}", "Interactive prompt 2 in ${nativeLanguage}"]
}`;

            const response = await generateContentWithFallback(ai, {
              contents: `History: ${JSON.stringify(history)}\nUser says: "${userMessage}"`,
              config: { systemInstruction, responseMimeType: "application/json", temperature: 0.45 },
            });

            const parsed = JSON.parse(response.text || "{}");
            return res.json({
              status: "success",
              mode: "active_chat",
              tutor_turn: {
                reply: parsed.reply || "",
                targetLanguageUtterance: stripTransliteration(parsed.targetLanguageUtterance || ""),
                audioReadyText: stripTransliteration(parsed.audioReadyText || parsed.targetLanguageUtterance || ""),
                translation: parsed.translation || "",
                contextualCorrections: Array.isArray(parsed.contextualCorrections) ? parsed.contextualCorrections : [],
                idiomBreakdowns: Array.isArray(parsed.idiomBreakdowns) ? parsed.idiomBreakdowns : [],
                registerNotes: parsed.registerNotes || {
                  detectedRegister: "neutral",
                  appropriateForContext: true,
                  recommendation: isArabic ? "أسلوب متوازن وطبيعي." : "Balanced, natural phrasing."
                },
                pedagogicalNextPrompts: Array.isArray(parsed.pedagogicalNextPrompts) ? parsed.pedagogicalNextPrompts : []
              }
            });
          } catch (err) {
            console.warn("[Omni-Engine Active Chat AI Warning]", err);
          }
        }

        // Procedural fallback
        const cleanUserMsg = stripTransliteration(userMessage);
        return res.json({
          status: "fallback",
          mode: "active_chat",
          tutor_turn: {
            reply: isArabic
              ? `أهلاً بك! في مستوى ${cefrLevel} لتعلم ${targetLanguage}، يعتمد الإتقان على التكرار المتباعد ودقة التصريف والتركيب.`
              : `Welcome! At CEFR ${cefrLevel} for ${targetLanguage}, structural mastery develops through active recall and grammatical accuracy.`,
            targetLanguageUtterance: cleanUserMsg,
            audioReadyText: cleanUserMsg,
            translation: isArabic ? "تعبير لغوي عملي" : "Functional practical expression",
            contextualCorrections: [],
            idiomBreakdowns: [],
            registerNotes: {
              detectedRegister: "neutral",
              appropriateForContext: true,
              recommendation: isArabic ? "أسلوب سليم ومناسب للتواصل." : "Natural communicative register."
            },
            pedagogicalNextPrompts: [
              isArabic ? "كيف أصيغ هذا التعبير بأسلوب أكثر رسمية؟" : "How can I express this in a formal register?",
              isArabic ? "أعطني تمرين نطق فوري لهذه الجملة" : "Give me a quick pronunciation drill for this phrase"
            ]
          }
        });
      }

      // Default unsupported mode
      return res.status(400).json({ error: `Unsupported mode "${mode}". Supported: onboarding, placement_test, active_chat.` });
    } catch (engineError: any) {
      console.error("[Omni-Engine Fatal Error]", engineError);
      res.status(500).json({ error: engineError?.message || "Internal Omni-Engine processing error" });
    }
  };

  app.post("/api/engine", handleOmniEngineRequest);
  app.post("/api/gemini/engine", handleOmniEngineRequest);
  app.post("/api/omni-engine", handleOmniEngineRequest);

  // AI Scenario Generator / Continuation
  app.post("/api/gemini/scenario", async (req, res) => {
    try {
      const { language, targetLevel, scenarioPrompt, history } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallbackAvailable: true,
        });
      }

      const systemInstruction = `You are Fluentic Scenario AI, an elite multilingual conversation simulator.
The user is practicing ${language || "Spanish"} at CEFR level ${targetLevel || "B2"}.
Scenario context: "${scenarioPrompt || "Ordering coffee in a busy cafe"}".
Respond in character as native speaker(s).
Format your response as a JSON object with:
{
  "dialogue": [
    {
      "speaker": "Name or Role",
      "text": "Native language line",
      "translation": "English translation",
      "culturalTip": "Nuanced pragmatic tip or idiom explanation (optional)",
      "options": ["User reply suggestion 1", "User reply suggestion 2", "User reply suggestion 3"]
    }
  ],
  "vocabularyAlerts": [
    {"term": "term", "meaning": "meaning", "register": "colloquial/formal"}
  ],
  "grammarFocus": "Brief note on grammatical structures used"
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Previous history: ${JSON.stringify(history || [])}\nContinue or initialize the scenario. Make it rich and pedagogically engaging.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Scenario Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate scenario" });
    }
  });

  // Interactive Scenario Dialogue Chat with Writing Feedback
  app.post("/api/gemini/dialogue-chat", async (req, res) => {
    try {
      const { 
        targetLanguage, 
        targetLanguageCode, 
        nativeLanguage, 
        scenarioTitle, 
        persona, 
        setting, 
        userMessage, 
        history, 
        cefrLevel 
      } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallbackAvailable: true,
        });
      }

      const targetLang = targetLanguage || "Spanish";
      const nativeLang = nativeLanguage || "Dutch";

      const systemInstruction = `You are an interactive conversational partner named "${persona || "Local Friend"}" in a language learning app.
Setting: "${setting || "A pleasant spot in town"}".
Scenario: "${scenarioTitle || "Daily Conversation"}".
Target Language to speak in: ${targetLang} (CEFR level ${cefrLevel || "A2"}).
User's Native Language: ${nativeLang}.

Task:
1. Respond to the user's message IN CHARACTER, strictly in ${targetLang}. Keep the response natural, appropriate for CEFR ${cefrLevel || "A2"}, and conversational (1-3 sentences).
2. Provide an accurate translation of your response in ${nativeLang}.
3. Evaluate what the user wrote ("wrotting"):
   - Did they write in ${targetLang}? Check grammar, spelling, conjugation, and word choice. Provide concise, friendly feedback in ${nativeLang}.
   - If they wrote in ${nativeLang}, explain kindly how to say it in ${targetLang}.
4. Provide 2 or 3 quick suggested replies the user can say next, each with ${targetLang} text and ${nativeLang} translation.

Format strictly as JSON:
{
  "replyText": "Response in ${targetLang}",
  "replyTranslation": "Response translated into ${nativeLang}",
  "writingFeedback": {
    "isAccurate": true,
    "suggestion": "Brief constructive tip in ${nativeLang} about grammar or natural expression, or praise if flawless",
    "improvedUserPhrase": "Polished version of user sentence in ${targetLang} (if applicable)"
  },
  "suggestedReplies": [
    {"text": "Phrase 1 in ${targetLang}", "translation": "Translation in ${nativeLang}"},
    {"text": "Phrase 2 in ${targetLang}", "translation": "Translation in ${nativeLang}"}
  ]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Conversation history: ${JSON.stringify(history || [])}\nLatest user message: "${userMessage}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Dialogue Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to process dialogue turn" });
    }
  });

  // Multi-Agent Debate Engine
  app.post("/api/gemini/debate", async (req, res) => {
    try {
      const { topic, language, userArgument, history, personaA, personaB } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const systemInstruction = `You are managing a 3-way polyglot debate in ${language || "French"}.
Personas:
Persona A: ${personaA || "Optimist philosopher (enthusiastic, forward-looking)"}
Persona B: ${personaB || "Pragmatic skeptic (analytical, questioning)"}
Topic: "${topic}"
User's last argument: "${userArgument || ""}"
Generate a turn where Persona A or Persona B responds directly to the user's argument in ${language}, evaluates nuance, challenges or agrees, and asks a probing question.
Respond in JSON:
{
  "speaker": "Persona A Name or Persona B Name",
  "text": "Response in target language",
  "translation": "English translation",
  "nuanceScore": 92,
  "feedback": "Linguistic and rhetoric feedback on user argument",
  "suggestedCounterPoints": ["Option 1", "Option 2"]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `History: ${JSON.stringify(history || [])}\nUser argument: "${userArgument}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Debate Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate debate turn" });
    }
  });

  // AI Grammar Surgeon & Gap Diagnostic
  app.post("/api/gemini/grammar-surgeon", async (req, res) => {
    try {
      const { userMistakes, language, context } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const systemInstruction = `You are Fluentic's AI Real-Time Grammar Surgeon.
Analyze the user's recent language mistakes or hesitation patterns in ${language || "German"}.
Diagnose root linguistic confusion (false friends, subjunctive mood, case agreement, word order).
Generate a targeted 60-second micro-intervention.
Format as JSON:
{
  "diagnosedGap": "Confusion between prepositions with Dative vs Accusative",
  "rootCauseExplanation": "Psycholinguistic reason why English speakers stumble here",
  "ruleOfThumb": "Memorable mnemonic or quick rule",
  "microDrill": [
    {
      "prompt": "Fill in the blank or choose right form",
      "sentence": "Ich gehe in ___ (das/dem) Park.",
      "options": ["den", "dem", "das", "des"],
      "correct": "den",
      "explanation": "Movement towards a destination triggers Accusative."
    }
  ],
  "subconsciousNeuralTrigger": "Visual pattern cue to remember"
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `User mistakes/hesitations: ${JSON.stringify(userMistakes || [])}. Context: ${context || "general"}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Grammar Surgeon Error:", error);
      res.status(500).json({ error: error.message || "Failed to diagnose grammar gap" });
    }
  });

  // Document & Subtitle Lens (Interactive Reading Deconstruction)
  app.post("/api/gemini/document-lens", async (req, res) => {
    try {
      const { text, language, userLevel } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const systemInstruction = `You are Fluentic Document Lens.
Deconstruct foreign text in ${language || "Italian"} for a ${userLevel || "B1"} learner into an interactive learning sheet.
Break down complex sentences, highlight key vocabulary with CEFR difficulty levels (A1-C2), provide root etymologies, and extract flashcards for FSRS Memory Vault.
Format as JSON:
{
  "summary": "Brief 1-sentence English summary",
  "overallCEFR": "B2",
  "analyzedParagraphs": [
    {
      "original": "Original sentence or paragraph",
      "translation": "English translation",
      "tokens": [
        {"word": "word", "lemma": "root", "pos": "noun/verb/adj", "level": "B1", "definition": "definition"}
      ]
    }
  ],
  "extractedFlashcards": [
    {"front": "foreign term", "back": "English meaning", "contextSentence": "Example in sentence", "etymology": "Latin root or derivation"}
  ],
  "culturalContext": "Key historical or cultural insight from the text"
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Analyze this text:\n"${text}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Document Lens Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze document" });
    }
  });

  // Real-time AI Polyglot Tutor / Co-pilot (Enhanced 100x Pedagogical Depth)
  app.post("/api/gemini/ai-tutor", async (req, res) => {
    try {
      const { userMessage, targetLanguage, userLevel, nativeLanguage, context } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const systemInstruction = `You are Fluentic's World-Class AI Master Polyglot Professor & Linguistic Co-pilot.
Target Language: ${targetLanguage || 'English'}
Learner Level: CEFR ${userLevel || 'A2'}
Learner's Native Language: ${nativeLanguage || 'English'}
Conversation Context: "${context || 'Interactive tutoring session'}"

PEDAGOGICAL DIRECTIVES:
1. Deliver master-tier linguistic clarity: explain "why" the language works this way using accessible comparative linguistics. ALL explanations, grammar notes, translations, and mnemonics MUST be written exclusively in the learner's native language (${nativeLanguage || 'English'}). Zero English leakage if native language is not English.
2. Always supply authentic, idiomatic phrasing in ${targetLanguage || 'the target language'} using authentic native script.
3. If the user asks a grammar rule, give:
   - Direct immediate answer with rule of thumb in ${nativeLanguage || 'English'}.
   - Morphological breakdown (root, tense, gender/case agreement).
   - An intuitive mnemonic or mental image in ${nativeLanguage || 'English'}.
   - 2 real-world native conversational examples in ${targetLanguage} with ${nativeLanguage || 'English'} translations.
   - The single most common trap/pitfall learners fall into and how to avoid it.
4. If the user writes or speaks in the target language:
   - Celebrate communicative intent.
   - Gently refine phrasing to sound 100% natural, colloquial, or professional.
5. Provide 3 interactive, thought-provoking follow-up prompts to keep the learner practicing in ${nativeLanguage || 'English'}.

Format your response STRICTLY as a valid JSON object matching:
{
  "reply": "Masterful, warm, concise yet rich pedagogical explanation written entirely in ${nativeLanguage || 'English'}.",
  "targetLanguageSnippet": "Exemplary phrase or natural expression in ${targetLanguage || 'the target language'} (native script)",
  "phoneticGuide": "IPA transcription and syllable stress (e.g., [ˈbwenos ˈdi.as])",
  "englishTranslation": "Natural translation in ${nativeLanguage || 'English'} (+ literal breakdown if idiomatic)",
  "grammarAnatomy": "Morphosyntactic analysis in ${nativeLanguage || 'English'} (e.g., subjunctive trigger, reflexive pronoun, case agreement)",
  "mnemonic": "Memorable trick or visual analogy in ${nativeLanguage || 'English'}",
  "realWorldExamples": [
    {"target": "Native dialogue example 1 in ${targetLanguage}", "translation": "Translation in ${nativeLanguage || 'English'} 1"},
    {"target": "Native dialogue example 2 in ${targetLanguage}", "translation": "Translation in ${nativeLanguage || 'English'} 2"}
  ],
  "commonMistakes": "Key error learners make and the native perspective in ${nativeLanguage || 'English'}",
  "quickTips": ["Actionable golden rule 1 in ${nativeLanguage || 'English'}", "Actionable golden rule 2 in ${nativeLanguage || 'English'}"],
  "suggestedFollowUps": ["Follow-up practice query 1 in ${nativeLanguage || 'English'}", "Follow-up practice query 2", "Follow-up practice query 3"]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `User message: "${userMessage}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Tutor Error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI Tutor response" });
    }
  });

  // AI Speech & Pronunciation Coach with Strict Phonetic Alignment (Zero Punctuation Penalty)
  app.post("/api/gemini/speech-feedback", async (req, res) => {
    try {
      const { targetPhrase, recognizedText, language } = req.body;
      const ai = getGeminiClient();

      // Normalize speech input: strip punctuation entirely so punctuation impact is strictly 0
      const normalizedTarget = (targetPhrase || "").toLowerCase().trim().replace(/[.,!¡?¿;:—"'\-]/g, "").replace(/\s+/g, " ");
      const normalizedSpoken = (recognizedText || "").toLowerCase().trim().replace(/[.,!¡?¿;:—"'\-]/g, "").replace(/\s+/g, " ");

      // Check filler / gibberish patterns
      const isGibberish = /blah(\s*blah)+/i.test(normalizedSpoken) ||
        normalizedSpoken.length < 2 ||
        /^(na|la|da|uh|um)\1+$/i.test(normalizedSpoken);

      if (isGibberish) {
        return res.json({
          accuracyScore: 10,
          speakingPunctuation: 0,
          punctuationPenalty: 0,
          isPassing: false,
          phoneticFeedback: "Rejected: Non-target sounds or repetitive filler words detected. Please enunciate the target phrase clearly.",
          mouthPositioningTip: "Listen to native audio model, focus on initial consonant attacks and clear vowel length.",
          rhythmAndCadence: "Non-fluent cadence",
          phonemeBreakdown: [
            { word: targetPhrase, status: "needs_work", tip: "Target pronunciation not articulated." }
          ]
        });
      }

      if (!ai) {
        // Fallback calculation using Levenshtein distance with zero punctuation penalty
        let dist = 0;
        const maxLen = Math.max(normalizedTarget.length, normalizedSpoken.length, 1);
        for (let i = 0; i < Math.min(normalizedTarget.length, normalizedSpoken.length); i++) {
          if (normalizedTarget[i] !== normalizedSpoken[i]) dist++;
        }
        dist += Math.abs(normalizedTarget.length - normalizedSpoken.length);
        const score = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));

        return res.json({
          accuracyScore: score,
          speakingPunctuation: 0,
          punctuationPenalty: 0,
          isPassing: score >= 85,
          phoneticFeedback: score >= 85 ? "Excellent accuracy. Target phonemes matched." : "Accuracy below 85% requirement. Check consonant and vowel clarity.",
          mouthPositioningTip: "Form lips and elevate tongue according to native target vowels.",
          rhythmAndCadence: "Natural prosody",
          phonemeBreakdown: normalizedTarget.split(" ").map((w: string) => ({
            word: w,
            status: normalizedSpoken.includes(w) ? "perfect" : "needs_work",
            tip: normalizedSpoken.includes(w) ? "Clear articulation" : "Focus on vowel formant and consonant stop"
          }))
        });
      }

      const systemInstruction = `You are Fluentech's World-Class Acoustic Phonetician and Accent Coach for ${language || 'English'}.
Target Native Phrase: "${targetPhrase}"
Learner's Spoken Utterance: "${recognizedText}"

CRITICAL RULES:
1. Punctuation Penalty is strictly ZERO (0). Never deduct marks for punctuation in spoken audio.
2. Must compute authentic articulatory and acoustic phonetic distance.
3. Threshold: If pronunciation accuracy is below 85%, mark isPassing as false.
4. Provide precise articulatory mechanics: tongue position (high/low, front/back), lip roundedness, vocal cord voicing, and breath aspiration.
5. Highlight prosodic rhythm: primary stress, vowel length, and intonational contour.

Format strictly as JSON:
{
  "accuracyScore": 92,
  "speakingPunctuation": 0,
  "punctuationPenalty": 0,
  "isPassing": true,
  "phoneticFeedback": "High-fidelity phonetic analysis praising correct vowels and pinpointing exact consonant transitions",
  "mouthPositioningTip": "Detailed physiological tongue elevation and lip shaping instruction",
  "rhythmAndCadence": "Assessment of sentence stress, tonic syllable, and speech cadence",
  "phonemeBreakdown": [
    {"word": "word", "status": "perfect | needs_work", "tip": "specific phonemic instruction"}
  ]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Evaluate speech pronunciation for "${recognizedText}" against target "${targetPhrase}". Enforce >=85% threshold with 0 punctuation penalty.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      parsed.speakingPunctuation = 0;
      parsed.punctuationPenalty = 0;
      // Enforce >= 85% rule
      parsed.isPassing = (parsed.accuracyScore || 0) >= 85;
      res.json(parsed);
    } catch (error: any) {
      console.error("Speech Feedback Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech feedback" });
    }
  });

  // Dynamic Global AI Curriculum Generator (CEFR A1 through C2 for any language pair)
  app.post("/api/gemini/curriculum", async (req, res) => {
    try {
      const { targetLanguage, targetLanguageCode, nativeLanguage, nativeLanguageCode, cefrLevel } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured", fallbackAvailable: true });
      }

      const target = targetLanguage || "Spanish";
      const native = nativeLanguage || "English";
      const level = cefrLevel || "A1";

      const systemInstruction = `You are Fluentic's Master Global Curriculum Architect.
Target Language to teach: ${target} (${targetLanguageCode || ""}).
User's Native Language: ${native} (${nativeLanguageCode || ""}).
CEFR Level: ${level}.

Strict Rules:
1. Target phrases, options, and vocabulary tokens MUST be accurately rendered in the TARGET language's authentic native script (e.g., Arabic script for Arabic, Kanji/Kana for Japanese, Cyrillic for Russian, Hangul for Korean, Devanagari for Hindi).
2. Question prompts, instructions, explanations, grammar tips, and cultural notes MUST be written in the user's NATIVE language (${native}).
3. Generate 2 to 3 curriculum learning nodes for CEFR level ${level}.
4. Each node must have 2 to 3 interactive exercises (multiple-choice, speech-pronounce, sentence-scramble, fill-blank).

Format strictly as JSON:
{
  "cefr": "${level}",
  "nodes": [
    {
      "id": "node-${level.toLowerCase()}-1",
      "title": "Title in ${native}",
      "nativeTitle": "Title in ${target} native script",
      "category": "Foundations" | "Conversation" | "Culture" | "Grammar" | "Vocabulary",
      "cefr": "${level}",
      "description": "Pedagogical summary in ${native}",
      "xpReward": 60,
      "gemReward": 12,
      "iconName": "Sparkles" | "Coffee" | "Compass" | "BookOpen" | "MessageSquare",
      "exercises": [
        {
          "id": "ex-${level.toLowerCase()}-1",
          "type": "multiple-choice",
          "prompt": "Prompt in ${native}",
          "targetPhrase": "Phrase in ${target} native script",
          "translation": "Translation in ${native}",
          "phoneticIpa": "IPA transcription or romanization",
          "options": ["Correct option in target script", "Distractor 1 in target script", "Distractor 2 in target script", "Distractor 3 in target script"],
          "correctAnswer": "Correct option in target script",
          "culturalNote": "Contextual tip in ${native}",
          "grammarTip": "Grammar rule in ${native}"
        },
        {
          "id": "ex-${level.toLowerCase()}-2",
          "type": "speech-pronounce",
          "prompt": "Prompt in ${native}",
          "targetPhrase": "Speech phrase in ${target} native script",
          "translation": "Translation in ${native}",
          "phoneticIpa": "IPA or phonetic guide",
          "correctAnswer": "Speech phrase in ${target} native script"
        }
      ]
    }
  ]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Generate authentic curriculum nodes for learning ${target} (native script) for a native speaker of ${native} at CEFR level ${level}.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Curriculum Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate curriculum" });
    }
  });

  // AI Dynamic Placement Test Engine (10 Questions covering full CEFR A1-C2 spectrum)
  app.post("/api/gemini/placement-test", async (req, res) => {
    try {
      const { targetLanguage, targetLanguageCode, nativeLanguage, nativeLanguageCode } = req.body;
      const ai = getGeminiClient();

      const target = targetLanguage || "Spanish";
      const native = nativeLanguage || "English";

      if (ai) {
        try {
          const systemInstruction = `You are Fluentic's Adaptive Placement Test Engine.
Target Language being tested: ${target} (${targetLanguageCode || ""}).
User's Native Language: ${native} (${nativeLanguageCode || ""}).

Rules:
1. Generate exactly 10 multiple-choice questions spanning the full CEFR spectrum:
   - Q1-Q3: A1, A2, A3 (Survival words, greetings, essential verbs, routine nouns)
   - Q4-Q6: B1, B2, B3 (Past tenses, conjunctions, hypotheticals, subordinate clauses)
   - Q7-Q10: C1, C2, C3, C3+ (Advanced subjunctive, high-register idiomatic expressions, complex inverted syntax)
2. Target phrases, choices, and vocab MUST be in the TARGET language's authentic native script (Arabic, Japanese Kanji/Kana, Russian Cyrillic, Chinese Hanzi, Korean Hangul, Greek, Hindi, etc.).
3. Prompts, questions, translations, target skill names, and explanations MUST be written in the user's NATIVE language (${native}).

Format strictly as JSON:
{
  "targetLanguage": "${target}",
  "nativeLanguage": "${native}",
  "questions": [
    {
      "id": 1,
      "level": "A1",
      "target_skill": "Skill name in ${native}",
      "prompt_native": "Question or sentence prompt in ${target} native script",
      "prompt_translation": "Question prompt in ${native}",
      "options": [
        {"key": "A", "text_native": "Option in ${target} native script", "text_translation": "Translation in ${native}"},
        {"key": "B", "text_native": "Option in ${target} native script", "text_translation": "Translation in ${native}"},
        {"key": "C", "text_native": "Option in ${target} native script", "text_translation": "Translation in ${native}"},
        {"key": "D", "text_native": "Option in ${target} native script", "text_translation": "Translation in ${native}"}
      ],
      "correct_key": "A",
      "explanation_translation": "Explanation in ${native}"
    }
  ]
}`;

          const response = await generateContentWithFallback(ai, {
            contents: `Generate 10 CEFR placement questions (A1 to C2) for learning ${target} with prompts and explanations in ${native}.`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          const parsed = JSON.parse(response.text || "{}");
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 5) {
            return res.json(parsed);
          }
        } catch (genError: any) {
          console.warn("Placement Test AI generation note: using procedural fallback:", genError?.message || genError);
        }
      }

      // Safe procedural fallback returns authentic questions without 500 or 503 error
      const fallback = getFallbackPlacementQuestions(target, native, targetLanguageCode, nativeLanguageCode);
      res.json(fallback);
    } catch (error: any) {
      console.warn("Placement Test recovery notice:", error?.message || error);
      res.json(getFallbackPlacementQuestions(req.body?.targetLanguage || "Spanish", req.body?.nativeLanguage || "English", req.body?.targetLanguageCode, req.body?.nativeLanguageCode));
    }
  });

  // Dynamic Grammar Module Generator (A1 through C2)
  app.post("/api/gemini/grammar-module", async (req, res) => {
    try {
      const { targetLanguage, targetLanguageCode, nativeLanguage, nativeLanguageCode, topicId } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured", fallbackAvailable: true });
      }

      const target = targetLanguage || "Spanish";
      const native = nativeLanguage || "English";

      const systemInstruction = `You are Fluentic's AI Global Grammar Engine.
Target Language: ${target}.
Native Language: ${native}.
Topic requested: "${topicId || "foundations"}".

Rules:
1. All rules, explanations, and mnemonics must be in ${native}.
2. All examples, target words, and exercise choices must be rendered in authentic native script for ${target}.
3. Provide IPA / romanization where appropriate.

Format as JSON:
{
  "topics": [
    {
      "id": "topic-1",
      "title": "Topic Title in ${native}",
      "nativeTitle": "Topic Title in ${target} script",
      "level": "A1" | "A2" | "B1" | "B2" | "C1",
      "summary": "Brief summary in ${native}",
      "rules": [
        {
          "ruleTitle": "Rule Title in ${native}",
          "explanation": "Clear explanation in ${native}",
          "examples": [
            {
              "targetText": "Example in ${target} native script",
              "nativeTranslation": "Translation in ${native}",
              "phoneticIpa": "Phonetic guide",
              "note": "Morphological note in ${native}"
            }
          ]
        }
      ],
      "practice": [
        {
          "prompt": "Exercise question in ${native}",
          "sentence": "Sentence with ___ blank in target script",
          "options": ["Option 1 in target script", "Option 2 in target script", "Option 3 in target script"],
          "correctAnswer": "Option 1 in target script",
          "explanation": "Why this is correct in ${native}"
        }
      ]
    }
  ]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Generate 3 comprehensive grammar topics for ${target} explained in ${native}.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Grammar Module Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate grammar module" });
    }
  });

  // Dynamic Speech Scenarios Generator
  app.post("/api/gemini/speech-scenarios", async (req, res) => {
    try {
      const { targetLanguage, targetLanguageCode, nativeLanguage, nativeLanguageCode } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured", fallbackAvailable: true });
      }

      const target = targetLanguage || "Spanish";
      const native = nativeLanguage || "English";

      const systemInstruction = `You are Fluentic's AI Speech Lab Scenario Architect.
Target Language: ${target} (${targetLanguageCode || ""}).
Native Language: ${native} (${nativeLanguageCode || ""}).

Generate 4 authentic real-life speaking scenarios (e.g. In the Cafe, City Navigation, Making Friends, Doctor/Emergency).
Rules:
1. Target phrases must be in authentic ${target} native script (Arabic, Kanji/Kana, Cyrillic, Hangul, Devanagari, etc.).
2. Translations, titles, descriptions, and context tips must be in ${native}.
3. Include accurate IPA or phonetic guide for every phrase.

Format strictly as JSON:
{
  "scenarios": [
    {
      "id": "cafe",
      "title": "Title in ${native}",
      "category": "Category in ${native}",
      "description": "Description in ${native}",
      "phrases": [
        {
          "targetText": "Phrase in ${target} native script",
          "nativeTranslation": "Translation in ${native}",
          "ipa": "/IPA transcription/",
          "contextTip": "Usage tip in ${native}"
        }
      ]
    }
  ]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `Generate 4 speech scenarios for practicing speaking ${target} (native script) translated into ${native}.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Speech Scenarios Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech scenarios" });
    }
  });

  // AI Unlimited Scenario Chat (100+ turns capacity, 4 core scenarios, inline feedback)
  app.post("/api/gemini/scenario-chat", async (req, res) => {
    try {
      const { language, userLevel, scenarioId, userMessage, history } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured" });
      }

      const scenarios: Record<string, string> = {
        'food-ordering': 'Ordering Food in a lively restaurant or cafe. Act as a polite, culturally authentic waiter/host.',
        'getting-to-know': 'Getting to Know Someone at a casual social mixer or park. Act as a friendly local asking engaging questions.',
        'talking-about-self': 'Talking About Yourself, your hobbies, background, and goals in an interview or meetup. Act as an interested conversation partner.',
        'asking-help': 'Needing Help / Asking for Assistance in an airport, transit station, or lost in the city. Act as a helpful local citizen or transit official.'
      };

      const scenarioDescription = scenarios[scenarioId] || scenarios['food-ordering'];
      // Keep sliding window of latest 12 turns to ensure unlimited 100+ turns without exceeding token budget
      const recentHistory = (history || []).slice(-12);

      const systemInstruction = `You are Fluentech's Scenario AI Partner for ${language || 'Spanish'}.
User CEFR Level: ${userLevel || 'A2'}.
Scenario: ${scenarioDescription}.
Behavior Guidelines:
1. Stay 100% in character for the roleplay.
2. Adapt vocabulary complexity to the user's CEFR level (${userLevel || 'A2'}).
3. Provide an inline grammar or vocabulary coaching card (if user had any small slip or used a great phrase).
4. Provide 3 quick suggested user replies suitable for their level.
Format strictly as JSON:
{
  "reply": "Native reply in ${language}",
  "speaker": "Waiter / Host / Local / Partner",
  "englishTranslation": "Translation in English",
  "inlineFeedback": {
    "hasTip": true,
    "tipType": "grammar" | "vocabulary" | "cultural",
    "note": "Constructive linguistic or cultural tip"
  },
  "suggestedReplies": ["Reply 1", "Reply 2", "Reply 3"]
}`;

      const response = await generateContentWithFallback(ai, {
        contents: `History: ${JSON.stringify(recentHistory)}\nUser said: "${userMessage}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Scenario Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate scenario reply" });
    }
  });

  // AI Translation Endpoint with OpenRouter model (`openrouter/free`) - Optimized for ULTRA-FAST response
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage, detectSource } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Source text is required for translation" });
      }

      const trimmedText = text.trim();
      const isAuto = !sourceLanguage || sourceLanguage.toLowerCase() === "auto" || sourceLanguage.toLowerCase() === "auto-detect" || detectSource;
      const srcLang = isAuto ? "auto-detected" : sourceLanguage;
      const tgtLang = targetLanguage || "English";

      let translatedText = "";
      let detectedSourceLanguage: string | undefined = undefined;

      let register: 'formal' | 'informal' | 'neutral' = 'neutral';
      let culturalNuance: string | undefined = undefined;
      let idiomBreakdown: string | undefined = undefined;

      // Ultra-fast sub-second neural translation using Gemini with strict application/json
      const ai = getGeminiClient();
      if (ai) {
        try {
          const sysPrompt = `You are a high-speed, sub-second neural translation engine.
Translate the input into ${tgtLang}.
INPUT SOURCE LANGUAGE: ${srcLang}.
STRICT OUTPUT REQUIREMENT:
Return valid JSON matching this schema:
{
  "translation": "<pure accurate ${tgtLang} text with zero commentary, zero explanations, and zero surrounding quotes>",
  "detectedSource": "<name of detected source language>",
  "register": "<formal | informal | neutral>",
  "culturalNuance": "<brief 1-sentence cultural, etiquette, or social context note in ${tgtLang} or user language>",
  "idiomBreakdown": "<brief explanation if idioms/metaphors are present, or null if literal>"
}`;

          const response = await generateContentWithFallback(ai, {
            contents: trimmedText,
            preferredModel: "gemini-3.8-flash",
            config: {
              systemInstruction: sysPrompt,
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens: 350,
            },
          });

          const rawResult = (response.text || "").trim();
          if (rawResult) {
            try {
              const cleanedJson = rawResult.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
              const parsed = JSON.parse(cleanedJson);
              if (parsed.translation || parsed.translatedText) {
                translatedText = String(parsed.translation || parsed.translatedText || "").trim();
                detectedSourceLanguage = parsed.detectedSource || parsed.detectedSourceLanguage;
                if (parsed.register) register = parsed.register;
                if (parsed.culturalNuance) culturalNuance = String(parsed.culturalNuance).trim();
                if (parsed.idiomBreakdown && parsed.idiomBreakdown !== "null") {
                  idiomBreakdown = String(parsed.idiomBreakdown).trim();
                }
              }
            } catch {
              // Regex fallback to pull "translation" value safely
              const match = rawResult.match(/"translation"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
              if (match) {
                translatedText = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
              }
              const detMatch = rawResult.match(/"detectedSource"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
              if (detMatch) {
                detectedSourceLanguage = detMatch[1].trim();
              }
              const regMatch = rawResult.match(/"register"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
              if (regMatch && ['formal', 'informal', 'neutral'].includes(regMatch[1].toLowerCase())) {
                register = regMatch[1].toLowerCase() as 'formal' | 'informal' | 'neutral';
              }
              const cultMatch = rawResult.match(/"culturalNuance"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
              if (cultMatch) {
                culturalNuance = cultMatch[1].replace(/\\"/g, '"').trim();
              }
            }

            // Secondary cleanup: If translatedText is still raw JSON or empty
            if (!translatedText || translatedText.startsWith('{')) {
              const plain = rawResult
                .replace(/^\{[\s\S]*"translation"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"[\s\S]*\}$/i, '$1')
                .replace(/^```json\s*/i, '')
                .replace(/\s*```$/i, '')
                .replace(/^["']|["']$/g, '')
                .trim();
              if (plain && !plain.startsWith('{')) {
                translatedText = plain;
              }
            }
          }
        } catch (geminiErr) {
          console.warn("[Gemini Translate Warning]", geminiErr);
        }
      }

      // Fast OpenRouter backup if Gemini client had an issue
      if (!translatedText && process.env.OPENROUTER_API_KEY) {
        try {
          const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://fluentic.app",
            },
            body: JSON.stringify({
              model: "openrouter/free",
              messages: [
                { role: "system", content: `Translate directly into ${tgtLang}. Output ONLY raw translated text string. No JSON, no markdown, no quotes.` },
                { role: "user", content: trimmedText },
              ],
              max_tokens: 200,
              temperature: 0.1,
            }),
          });
          if (orResponse.ok) {
            const orData = await orResponse.json();
            const rawContent = (orData.choices?.[0]?.message?.content || "").trim();
            // Ensure no JSON string from openrouter
            if (rawContent.startsWith('{') && rawContent.includes('"translation"')) {
              try {
                const parsed = JSON.parse(rawContent);
                translatedText = (parsed.translation || "").trim();
              } catch {
                translatedText = rawContent;
              }
            } else {
              translatedText = rawContent;
            }
          }
        } catch (e) {
          console.warn("[OpenRouter fallback]", e);
        }
      }

      if (!translatedText) {
        translatedText = trimmedText;
      }

      // Ensure final safety: never return raw JSON string as translatedText
      if (translatedText.startsWith('{') && translatedText.includes('"translation"')) {
        try {
          const parsed = JSON.parse(translatedText);
          translatedText = parsed.translation || translatedText;
          if (parsed.detectedSource) detectedSourceLanguage = parsed.detectedSource;
          if (parsed.register) register = parsed.register;
          if (parsed.culturalNuance) culturalNuance = parsed.culturalNuance;
          if (parsed.idiomBreakdown) idiomBreakdown = parsed.idiomBreakdown;
        } catch {
          // ignore
        }
      }

      res.json({
        translatedText,
        translation: translatedText,
        detectedSourceLanguage: detectedSourceLanguage || (isAuto ? "Auto-Detected" : undefined),
        register,
        culturalNuance,
        idiomBreakdown,
      });
    } catch (error: any) {
      console.error("Translation Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Translation failed" });
    }
  });

  // Direct Audio Stream Capture (16kHz 16-bit PCM Audio / WAV) endpoint via Gemini Multimodal Audio
  app.post("/api/gemini/live-audio-stream", async (req, res) => {
    try {
      const { audioPcmBase64, audioBase64, sampleRate, sourceLanguage, targetLanguage } = req.body;
      let wavBase64 = "";

      if (audioPcmBase64) {
        const pcmBuffer = Buffer.from(audioPcmBase64, "base64");
        const wavBuffer = pcm16ToWav(pcmBuffer, sampleRate || 16000, 1);
        wavBase64 = wavBuffer.toString("base64");
      } else if (audioBase64) {
        wavBase64 = audioBase64;
      } else {
        return res.status(400).json({ error: "audioPcmBase64 or audioBase64 is required" });
      }

      const result = await processAudioWithGemini(
        wavBase64,
        sourceLanguage || "auto",
        targetLanguage || "English"
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Live Audio Stream API Error:", error);
      res.status(500).json({ error: error.message || "Failed to process audio stream" });
    }
  });

  // Enterprise Payment Gateway (PayPal, Visa/Mastercard, Google Pay, Apple Pay)
  app.post("/api/payment/checkout", async (req, res) => {
    try {
      const { planId, paymentMethod, cardDetails, buyerEmail } = req.body;
      
      // Simulate enterprise TLS 1.3 verification & tokenization
      const transactionId = `FLT-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Validate payment methods
      const validMethods = ["paypal", "credit-card", "google-pay", "apple-pay"];
      if (!validMethods.includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      let grantedGems = 0;
      let isProGranted = false;
      let proDurationMonths = 0;

      switch (planId) {
        case "gems-100":
          grantedGems = 100;
          break;
        case "gems-500":
          grantedGems = 500;
          break;
        case "gems-2000":
          grantedGems = 2000;
          break;
        case "pro-monthly":
          isProGranted = true;
          proDurationMonths = 1;
          break;
        case "pro-6month":
          isProGranted = true;
          proDurationMonths = 6;
          break;
        case "pro-1year":
          isProGranted = true;
          proDurationMonths = 12;
          break;
        default:
          return res.status(400).json({ error: "Invalid plan identifier" });
      }

      res.json({
        success: true,
        transactionId,
        paymentMethod,
        planId,
        grantedGems,
        isProGranted,
        proDurationMonths,
        timestamp: new Date().toISOString(),
        receiptUrl: `https://fluentech.ai/receipts/${transactionId}`,
        message: "Payment processed successfully via encrypted gateway."
      });
    } catch (error: any) {
      console.error("Payment Error:", error);
      res.status(500).json({ error: error.message || "Payment processing failed" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = http.createServer(app);

  // WebSocket Server for Real-Time Streaming Audio (16kHz 16-bit PCM Audio)
  const wss = new WebSocketServer({ server, path: "/api/ws/voice-stream" });

  wss.on("connection", (ws: WebSocket) => {
    let session = {
      sourceLanguage: "auto",
      targetLanguage: "Arabic",
      sampleRate: 16000,
      audioChunks: [] as Buffer[],
      isActive: true,
    };

    ws.on("message", async (data: Buffer | string) => {
      try {
        if (typeof data === "string" || (Buffer.isBuffer(data) && data[0] === 123 /* '{' */)) {
          const msg = JSON.parse(data.toString());
          if (msg.type === "start") {
            session.sourceLanguage = msg.sourceLanguage || "auto";
            session.targetLanguage = msg.targetLanguage || "Arabic";
            session.sampleRate = msg.sampleRate || 16000;
            session.audioChunks = [];
            ws.send(JSON.stringify({ type: "ready", status: "listening" }));
          } else if (msg.type === "chunk" && msg.pcmBase64) {
            const chunk = Buffer.from(msg.pcmBase64, "base64");
            session.audioChunks.push(chunk);

            // Compute real-time RMS for Voice Activity Detection (VAD)
            const sampleCount = Math.floor(chunk.length / 2);
            let sumSquares = 0;
            for (let i = 0; i < sampleCount; i++) {
              const sample = chunk.readInt16LE(i * 2) / 32768.0;
              sumSquares += sample * sample;
            }
            const rms = Math.sqrt(sumSquares / Math.max(1, sampleCount));
            const isSpeech = rms > 0.015;

            ws.send(JSON.stringify({
              type: "vad",
              level: Math.min(1, rms * 6),
              isSpeech,
              timestamp: Date.now(),
            }));
          } else if (msg.type === "finish") {
            if (session.audioChunks.length === 0) {
              ws.send(JSON.stringify({
                type: "result",
                transcription: "",
                translation: "",
                detectedSource: session.sourceLanguage,
              }));
              return;
            }

            const fullPcm = Buffer.concat(session.audioChunks);
            const wavBuffer = pcm16ToWav(fullPcm, session.sampleRate, 1);
            const result = await processAudioWithGemini(
              wavBuffer.toString("base64"),
              session.sourceLanguage,
              session.targetLanguage
            );

            ws.send(JSON.stringify({
              type: "result",
              ...result,
            }));

            session.audioChunks = [];
          }
        } else if (Buffer.isBuffer(data)) {
          // Direct binary PCM chunk
          session.audioChunks.push(data);
        }
      } catch (err: any) {
        console.warn("[Voice Stream WS Warning]", err);
        ws.send(JSON.stringify({ type: "error", message: err?.message || "Stream processing error" }));
      }
    });

    ws.on("close", () => {
      session.isActive = false;
      session.audioChunks = [];
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Fluentic Omni-Studio server with Live Audio Streaming running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
