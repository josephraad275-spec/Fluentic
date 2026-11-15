/**
 * src/services/aiCore.ts
 *
 * Fluentic centralized AI service ("Supreme Core").
 *
 * Every AI request in the app goes through this module:
 *   onboarding, adaptive diagnostic (question + evaluation), learning pathways, tutor chat.
 *
 * Guarantees enforced IN CODE (not just in prompts):
 *   1. Temperature is fixed at 0.15.
 *   2. Every response is parsed from JSON and validated with strict Zod schemas.
 *   3. Bounded exponential backoff with jitter for transport failures; bounded repair
 *      retries (the validator's issues are fed back to the model) for invalid output.
 *   4. CEFR tier rules are validated per item (allowed skills, registers, sentence length,
 *      and a multilingual greeting/pleasantry ban at C1/C2).
 *   5. Target-script purity is validated per field with Unicode script properties:
 *      zero Latin letters in non-Latin target fields, zero foreign scripts in Latin targets.
 *   6. `audio_text` is sanitized for TTS (markdown, emoji, symbols, URLs, brackets removed).
 *   7. The diagnostic level estimate / next probe level / stop decision are computed
 *      deterministically in code; the model must agree with them or the output is rejected.
 *
 * Requirements:
 *   - zod ^3.23 (also compatible with zod 4)
 *   - TypeScript target ES2018+ (Unicode property escapes), lib ES2020+
 *   - A server-side proxy at VITE_AI_ENDPOINT (default "/api/ai") that holds the model API key.
 *     Contract: POST { task, system, messages, temperature, maxTokens, responseFormat: "json" }
 *               -> 200 { "text": "<model output string>" }
 *     Never put a model API key in browser code.
 */

import { z } from 'zod';

/* ========================================================================== */
/* 1. Domain constants and types                                              */
/* ========================================================================== */

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const SKILLS = [
  'script_phonics',
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'writing',
  'discourse',
  'pragmatics',
] as const;
export type Skill = (typeof SKILLS)[number];

export const REGISTERS = [
  'foundational',
  'everyday',
  'situational',
  'formal',
  'professional',
  'academic',
  'literary',
  'debate',
] as const;
export type Register = (typeof REGISTERS)[number];

export const INTENTS = ['travel', 'business', 'academic', 'daily_fluency'] as const;
export type LearningIntent = (typeof INTENTS)[number];

export const EXERCISE_FORMATS = [
  'multiple_choice',
  'listening_choice',
  'fill_blank',
  'reorder',
  'typed_recall',
] as const;
export type ExerciseFormat = (typeof EXERCISE_FORMATS)[number];

/** Fixed by design: surgical, non-random output. Not configurable. */
export const AI_TEMPERATURE = 0.15;

export type TaskName =
  | 'onboarding'
  | 'diagnostic_question'
  | 'diagnostic_evaluation'
  | 'pathway'
  | 'tutor_chat';

export interface Issue {
  path: string;
  message: string;
}

interface TargetField {
  path: string;
  value: string;
}

function levelAt(index: number): CefrLevel {
  return CEFR_LEVELS[Math.max(0, Math.min(CEFR_LEVELS.length - 1, index))] ?? 'A1';
}

/* ========================================================================== */
/* 2. Zod schemas (strict: unknown keys are rejected)                         */
/* ========================================================================== */

const CefrSchema = z.enum(CEFR_LEVELS);
const SkillSchema = z.enum(SKILLS);
const RegisterSchema = z.enum(REGISTERS);
const IntentSchema = z.enum(INTENTS);
const ExerciseFormatSchema = z.enum(EXERCISE_FORMATS);

const CONCEPT_TAG_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_]+){0,2}$/;
const ConceptTagSchema = z
  .string()
  .regex(CONCEPT_TAG_PATTERN, 'must be a lowercase dot path such as "grammar.subjunctive" (max 3 segments)');
const IdSchema = z.string().min(1).max(64);
const nativeText = (max: number) => z.string().trim().min(1).max(max);
const targetText = (max: number) => z.string().trim().min(1).max(max);
const AudioTextSchema = z.string().trim().min(1).max(500);

const OptionSchema = z
  .object({
    id: z.string().min(1).max(16),
    text: targetText(300),
  })
  .strict();

const ExerciseBaseSchema = z
  .object({
    id: IdSchema,
    cefr_level: CefrSchema,
    skill: SkillSchema,
    format: ExerciseFormatSchema,
    register: RegisterSchema,
    concept_tag: ConceptTagSchema,
    instruction: nativeText(400),
    target_text: targetText(1200),
    options: z.array(OptionSchema).max(6),
    correct_option_id: z.string().min(1).max(16).nullable(),
    accepted_answers: z.array(targetText(600)).max(8),
    reorder_tokens: z.array(targetText(60)).max(20),
    explanation: nativeText(800),
    audio_text: AudioTextSchema,
  })
  .strict();

export const ExerciseSchema = ExerciseBaseSchema.superRefine((ex, ctx) => {
  const fail = (path: Array<string | number>, message: string): void => {
    ctx.addIssue({ code: 'custom', message, path });
  };
  const isChoice =
    ex.format === 'multiple_choice' || ex.format === 'listening_choice' || ex.format === 'fill_blank';

  if (isChoice) {
    if (ex.options.length < 2 || ex.options.length > 6) {
      fail(['options'], 'choice formats require between 2 and 6 options');
    }
    const ids = new Set(ex.options.map((o) => o.id));
    if (ids.size !== ex.options.length) fail(['options'], 'option ids must be unique');
    const texts = new Set(ex.options.map((o) => o.text));
    if (texts.size !== ex.options.length) fail(['options'], 'option texts must be unique');
    if (ex.correct_option_id === null || !ids.has(ex.correct_option_id)) {
      fail(['correct_option_id'], 'must reference exactly one existing option id');
    }
    if (ex.accepted_answers.length !== 0) fail(['accepted_answers'], 'must be [] for choice formats');
    if (ex.reorder_tokens.length !== 0) fail(['reorder_tokens'], 'must be [] for choice formats');
  } else {
    if (ex.options.length !== 0) fail(['options'], 'must be [] for reorder and typed_recall');
    if (ex.correct_option_id !== null) fail(['correct_option_id'], 'must be null for reorder and typed_recall');
    if (ex.accepted_answers.length < 1) fail(['accepted_answers'], 'at least one accepted answer is required');
    if (ex.format === 'reorder') {
      if (ex.reorder_tokens.length < 3) fail(['reorder_tokens'], 'reorder requires at least 3 tokens');
    } else if (ex.reorder_tokens.length !== 0) {
      fail(['reorder_tokens'], 'must be [] unless format is reorder');
    }
  }
});
export type Exercise = z.infer<typeof ExerciseSchema>;

const OnboardingSchema = z
  .object({
    intent: IntentSchema,
    starting_level_hypothesis: CefrSchema,
    suggested_daily_minutes: z.number().int().min(5).max(120),
    focus_skills: z
      .array(SkillSchema)
      .min(1)
      .max(4)
      .refine((arr) => new Set(arr).size === arr.length, 'focus_skills must be unique'),
    needs_script_foundation: z.boolean(),
    summary: nativeText(500),
  })
  .strict();
export type OnboardingOutput = z.infer<typeof OnboardingSchema>;

const DiagnosticQuestionSchema = z.object({ exercise: ExerciseSchema }).strict();
export type DiagnosticQuestionOutput = z.infer<typeof DiagnosticQuestionSchema>;

const WeakPointSchema = z
  .object({
    concept_tag: ConceptTagSchema,
    skill: SkillSchema,
    note: nativeText(300),
  })
  .strict();

const DiagnosticEvaluationSchema = z
  .object({
    estimated_level: CefrSchema,
    confidence: z.number().min(0).max(1),
    next_probe_level: CefrSchema,
    should_stop: z.boolean(),
    rationale: nativeText(600),
    weak_points: z.array(WeakPointSchema).max(8),
  })
  .strict();
export type DiagnosticEvaluationOutput = z.infer<typeof DiagnosticEvaluationSchema>;

const VocabularyItemSchema = z
  .object({
    term: targetText(120),
    meaning: nativeText(200),
    example_sentence: targetText(400),
    example_meaning: nativeText(400),
    audio_text: AudioTextSchema,
  })
  .strict();

const LessonSchema = z
  .object({
    id: IdSchema,
    title: nativeText(120),
    vocabulary: z.array(VocabularyItemSchema).min(3).max(10),
    exercises: z.array(ExerciseSchema).min(3).max(12),
    recycled_concept_tags: z.array(ConceptTagSchema).max(6),
  })
  .strict();

const UnitSchema = z
  .object({
    id: IdSchema,
    title: nativeText(120),
    objective: nativeText(300),
    lessons: z.array(LessonSchema).min(1).max(8),
  })
  .strict();

const PathwaySchema = z
  .object({
    goal: IntentSchema,
    cefr_level: CefrSchema,
    title: nativeText(160),
    units: z.array(UnitSchema).min(1).max(8),
  })
  .strict();
export type PathwayOutput = z.infer<typeof PathwaySchema>;

const CorrectionSchema = z
  .object({
    original: z.string().min(1).max(600),
    corrected: targetText(600),
    explanation: nativeText(500),
    concept_tag: ConceptTagSchema,
  })
  .strict();

const TutorChatSchema = z
  .object({
    cefr_level: CefrSchema,
    register: RegisterSchema,
    reply: targetText(1200),
    reply_gloss: nativeText(1200),
    corrections: z.array(CorrectionSchema).max(5),
    follow_up: targetText(400),
    audio_text: AudioTextSchema,
  })
  .strict();
export type TutorChatOutput = z.infer<typeof TutorChatSchema>;

/* ========================================================================== */
/* 3. CEFR tier profiles (single source of truth for prompts AND validation)  */
/* ========================================================================== */

interface LevelProfile {
  readonly label: string;
  readonly directive: string;
  readonly allowedSkills: readonly Skill[];
  readonly allowedRegisters: readonly Register[];
  readonly minWords?: number;
  readonly maxWords?: number;
  readonly banPleasantries: boolean;
}

const FOUNDATION_SKILLS: readonly Skill[] = [
  'script_phonics',
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'writing',
];
const ADVANCING_SKILLS: readonly Skill[] = [
  'vocabulary',
  'grammar',
  'reading',
  'listening',
  'writing',
  'discourse',
  'pragmatics',
];

const LEVEL_PROFILES: Record<CefrLevel, LevelProfile> = {
  A1: {
    label: 'Foundations: phonics, native script mechanics, core syntax',
    directive:
      'Foundations. Focus STRICTLY on phonics and sound-to-symbol mapping, native-script mechanics (letter or character recognition, writing direction, diacritics, stroke logic, joining forms) and core syntax (basic word order, present-tense verbs, articles and particles, high-frequency nouns). Target stimuli of at most 12 words. Registers: foundational or everyday only.',
    allowedSkills: FOUNDATION_SKILLS,
    allowedRegisters: ['foundational', 'everyday'],
    maxWords: 12,
    banPleasantries: false,
  },
  A2: {
    label: 'Elementary: script fluency, simple past/future, routines, basic questions',
    directive:
      'Elementary. Consolidate script fluency and core syntax: simple past and future, routines, questions, comparatives, possession, simple connectors (and, but, because). Target stimuli of at most 25 words. Registers: foundational or everyday only. No abstract or specialised vocabulary.',
    allowedSkills: FOUNDATION_SKILLS,
    allowedRegisters: ['foundational', 'everyday'],
    maxWords: 25,
    banPleasantries: false,
  },
  B1: {
    label: 'Situational navigation, narration, common subordinate clauses',
    directive:
      'Intermediate. Situational navigation: transport, services, workplace, health, plans and problems. Narration across tenses, opinions with reasons, conditionals and common subordinate clauses (because, although, when, if, that). Connected multi-sentence input. NO phonics or letter-recognition drills.',
    allowedSkills: ADVANCING_SKILLS,
    allowedRegisters: ['everyday', 'situational', 'formal', 'professional'],
    banPleasantries: false,
  },
  B2: {
    label: 'Complex subordinate clauses, intermediate discourse, abstract topics',
    directive:
      'Upper-intermediate. Complex subordinate clauses (relative, concessive, conditional, purpose), passive and reported speech, nominalisation, hedging and intermediate discourse: building and defending an argument, summarising, contrasting positions. Abstract topics and common idiom. At least 8 words per target stimulus. NO phonics drills.',
    allowedSkills: ADVANCING_SKILLS,
    allowedRegisters: ['situational', 'formal', 'professional', 'academic', 'debate'],
    minWords: 8,
    banPleasantries: false,
  },
  C1: {
    label: 'Advanced academic, professional and debate discourse (no basics)',
    directive:
      'Advanced. ZERO TOLERANCE FOR WEAKNESS. STRICT BAN: no greetings, farewells, introductions, thanks, apologies, small talk or "how are you" pleasantries; no basic vocabulary (colours, numbers, family, food, weather basics); no elementary single-clause sentences. Every item must demand high-level academic discourse, formal debate registers, literary critique or professional terminology, with multi-clause syntax, connotation, stance and rhetorical structure. At least 12 words per target stimulus.',
    allowedSkills: ADVANCING_SKILLS,
    allowedRegisters: ['formal', 'professional', 'academic', 'literary', 'debate'],
    minWords: 12,
    banPleasantries: true,
  },
  C2: {
    label: 'Mastery: near-native stylistic, literary and specialised discourse (no basics)',
    directive:
      'Mastery. ZERO TOLERANCE FOR WEAKNESS. Same STRICT BAN as C1 (no greetings, farewells, introductions, thanks, apologies, small talk, basic vocabulary or elementary sentences), at near-native difficulty: stylistic and register variation, ambiguity and implicature, literary and archaic forms, specialised legal, scientific and philosophical terminology, subtle synonymy and collocation, dense nominal syntax, rhetorical irony. At least 14 words per target stimulus.',
    allowedSkills: ADVANCING_SKILLS,
    allowedRegisters: ['formal', 'professional', 'academic', 'literary', 'debate'],
    minWords: 14,
    banPleasantries: true,
  },
};

/* ========================================================================== */
/* 4. Language, script and pleasantry utilities                               */
/* ========================================================================== */

export function primaryLanguage(tag: string): string {
  return tag.trim().toLowerCase().split(/[-_]/)[0] ?? '';
}

const LATIN_LANGS: ReadonlySet<string> = new Set([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'da', 'no', 'nb', 'nn', 'fi', 'pl', 'cs', 'sk',
  'hu', 'ro', 'tr', 'id', 'ms', 'vi', 'sw', 'tl', 'fil', 'ca', 'hr', 'sl', 'lt', 'lv', 'et', 'af',
  'sq', 'is', 'ga', 'cy', 'eu', 'gl', 'la', 'eo', 'az', 'uz', 'mt', 'lb', 'fo', 'so', 'zu', 'xh',
]);

const SCRIPT_BY_LANG: Readonly<Record<string, { label: string; scripts: readonly string[] }>> = {
  ar: { label: 'Arabic', scripts: ['Arabic'] },
  fa: { label: 'Persian (Arabic script)', scripts: ['Arabic'] },
  ur: { label: 'Urdu (Arabic script)', scripts: ['Arabic'] },
  ps: { label: 'Pashto (Arabic script)', scripts: ['Arabic'] },
  sd: { label: 'Sindhi (Arabic script)', scripts: ['Arabic'] },
  he: { label: 'Hebrew', scripts: ['Hebrew'] },
  yi: { label: 'Yiddish (Hebrew script)', scripts: ['Hebrew'] },
  ru: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  uk: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  bg: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  be: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  mk: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  kk: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  ky: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  mn: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  tg: { label: 'Cyrillic', scripts: ['Cyrillic'] },
  el: { label: 'Greek', scripts: ['Greek'] },
  hi: { label: 'Devanagari', scripts: ['Devanagari'] },
  mr: { label: 'Devanagari', scripts: ['Devanagari'] },
  ne: { label: 'Devanagari', scripts: ['Devanagari'] },
  bn: { label: 'Bengali', scripts: ['Bengali'] },
  ta: { label: 'Tamil', scripts: ['Tamil'] },
  te: { label: 'Telugu', scripts: ['Telugu'] },
  kn: { label: 'Kannada', scripts: ['Kannada'] },
  ml: { label: 'Malayalam', scripts: ['Malayalam'] },
  gu: { label: 'Gujarati', scripts: ['Gujarati'] },
  pa: { label: 'Gurmukhi', scripts: ['Gurmukhi'] },
  si: { label: 'Sinhala', scripts: ['Sinhala'] },
  th: { label: 'Thai', scripts: ['Thai'] },
  lo: { label: 'Lao', scripts: ['Lao'] },
  km: { label: 'Khmer', scripts: ['Khmer'] },
  my: { label: 'Myanmar', scripts: ['Myanmar'] },
  ka: { label: 'Georgian', scripts: ['Georgian'] },
  hy: { label: 'Armenian', scripts: ['Armenian'] },
  am: { label: 'Ethiopic', scripts: ['Ethiopic'] },
  ja: { label: 'Japanese (Kanji, Hiragana, Katakana)', scripts: ['Han', 'Hiragana', 'Katakana'] },
  zh: { label: 'Chinese (Han characters)', scripts: ['Han', 'Bopomofo'] },
  ko: { label: 'Korean (Hangul, Hanja)', scripts: ['Hangul', 'Han'] },
};

type ScriptPolicy =
  | { kind: 'latin' }
  | { kind: 'script'; label: string; scripts: readonly string[] }
  | { kind: 'unknown' };

export function resolveScriptPolicy(lang: string): ScriptPolicy {
  const code = primaryLanguage(lang);
  const entry = SCRIPT_BY_LANG[code];
  if (entry) return { kind: 'script', label: entry.label, scripts: entry.scripts };
  if (LATIN_LANGS.has(code)) return { kind: 'latin' };
  return { kind: 'unknown' };
}

const COMMON_OR_INHERITED = /^[\p{Script=Common}\p{Script=Inherited}]$/u;
const LETTER = /^\p{L}$/u;
const allowedScriptCache = new Map<string, RegExp>();

function allowedScriptRegex(scripts: readonly string[]): RegExp {
  const key = scripts.join('|');
  const cached = allowedScriptCache.get(key);
  if (cached) return cached;
  const regex = new RegExp(`^[${scripts.map((s) => `\\p{Script=${s}}`).join('')}]$`, 'u');
  allowedScriptCache.set(key, regex);
  return regex;
}

/**
 * Returns the distinct letters in `text` that do not belong to the target language's
 * authentic script. Digits, punctuation and combining marks are never violations.
 * Non-Latin targets: ANY Latin letter is a violation (transliteration, romanization,
 * pinyin, romaji, IPA, English glosses). Latin targets: any non-Latin letter is a violation.
 * Unknown languages are not verifiable and return [].
 */
export function findScriptViolations(text: string, targetLanguage: string): string[] {
  const policy = resolveScriptPolicy(targetLanguage);
  if (policy.kind === 'unknown') return [];
  const allowed = allowedScriptRegex(policy.kind === 'latin' ? ['Latin'] : policy.scripts);
  const offenders = new Set<string>();
  for (const ch of text.normalize('NFC')) {
    if (!LETTER.test(ch)) continue;
    if (COMMON_OR_INHERITED.test(ch)) continue;
    if (allowed.test(ch)) continue;
    offenders.add(ch);
  }
  return Array.from(offenders);
}

const PLEASANTRIES: Readonly<Record<string, readonly string[]>> = {
  en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night', 'goodbye', 'bye', 'how are you', 'thank you', 'thanks', 'please', 'nice to meet you', 'you are welcome', 'excuse me', 'sorry', 'see you'],
  es: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'adiós', 'hasta luego', 'gracias', 'por favor', 'cómo estás', 'cómo está usted', 'mucho gusto', 'de nada', 'perdón', 'lo siento'],
  fr: ['bonjour', 'bonsoir', 'salut', 'au revoir', 'merci', 's\'il vous plaît', 's\'il te plaît', 'comment allez-vous', 'comment ça va', 'enchanté', 'de rien', 'pardon', 'excusez-moi'],
  de: ['hallo', 'guten morgen', 'guten tag', 'guten abend', 'gute nacht', 'auf wiedersehen', 'tschüss', 'danke', 'bitte', 'wie geht\'s', 'wie geht es dir', 'wie geht es ihnen', 'freut mich', 'entschuldigung'],
  it: ['ciao', 'buongiorno', 'buonasera', 'buonanotte', 'arrivederci', 'grazie', 'per favore', 'per piacere', 'come stai', 'come sta', 'piacere', 'prego', 'scusa', 'scusi'],
  pt: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tchau', 'adeus', 'obrigado', 'obrigada', 'por favor', 'tudo bem', 'como vai', 'prazer', 'de nada', 'desculpa'],
  ar: ['مرحبا', 'أهلا', 'اهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'تصبح على خير', 'مع السلامة', 'شكرا', 'من فضلك', 'كيف حالك', 'تشرفنا', 'عفوا', 'آسف'],
  ru: ['привет', 'здравствуйте', 'доброе утро', 'добрый день', 'добрый вечер', 'спокойной ночи', 'до свидания', 'пока', 'спасибо', 'пожалуйста', 'как дела', 'приятно познакомиться', 'извините', 'простите'],
  ja: ['こんにちは', 'おはよう', 'こんばんは', 'おやすみ', 'さようなら', 'ありがとう', 'すみません', 'ごめんなさい', 'はじめまして', 'よろしくお願いします', 'お元気ですか'],
  ko: ['안녕하세요', '안녕', '안녕히 계세요', '안녕히 가세요', '감사합니다', '고맙습니다', '죄송합니다', '미안합니다', '처음 뵙겠습니다', '만나서 반갑습니다', '잘 지내세요'],
  zh: ['你好', '您好', '早上好', '下午好', '晚上好', '晚安', '再见', '谢谢', '请问', '对不起', '不客气', '很高兴认识你', '你好吗'],
  tr: ['merhaba', 'selam', 'günaydın', 'iyi akşamlar', 'iyi geceler', 'hoşça kal', 'güle güle', 'teşekkürler', 'teşekkür ederim', 'lütfen', 'nasılsın', 'nasılsınız', 'memnun oldum', 'özür dilerim'],
  hi: ['नमस्ते', 'नमस्कार', 'धन्यवाद', 'शुक्रिया', 'कृपया', 'आप कैसे हैं', 'आप कैसी हैं', 'अलविदा', 'माफ़ कीजिए'],
  nl: ['hallo', 'goedemorgen', 'goedemiddag', 'goedenavond', 'goedenacht', 'tot ziens', 'doei', 'dank je', 'dank u', 'bedankt', 'alsjeblieft', 'alstublieft', 'hoe gaat het', 'aangenaam'],
};

const SPACELESS_LANGS: ReadonlySet<string> = new Set(['ja', 'zh']);
const pleasantryCache = new Map<string, readonly string[]>();

function normalizeForMatch(text: string, lang: string): string {
  let s = text.normalize('NFKC');
  try {
    s = s.toLocaleLowerCase(lang);
  } catch {
    s = s.toLowerCase();
  }
  return s.replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

function normalizedPleasantries(lang: string): readonly string[] {
  const cached = pleasantryCache.get(lang);
  if (cached) return cached;
  const raw = PLEASANTRIES[lang] ?? [];
  const spaceless = SPACELESS_LANGS.has(lang);
  const normalized = raw.map((p) => {
    const n = normalizeForMatch(p, lang);
    return spaceless ? n.replace(/ /g, '') : n;
  });
  pleasantryCache.set(lang, normalized);
  return normalized;
}

/**
 * Heuristic detector for basic greetings and pleasantries. It flags text that STARTS
 * with such a phrase, or short text (<= 6 words / <= 20 CJK characters) that contains one.
 * Covered languages: en es fr de it pt ar ru ja ko zh tr hi nl. Others are not checked
 * here (the prompt still bans them).
 */
export function containsBasicPleasantry(text: string, languageTag: string): boolean {
  const lang = primaryLanguage(languageTag);
  const phrases = normalizedPleasantries(lang);
  if (phrases.length === 0) return false;
  const norm = normalizeForMatch(text, lang);
  if (!norm) return false;

  if (SPACELESS_LANGS.has(lang)) {
    const compact = norm.replace(/ /g, '');
    return phrases.some((p) => p.length > 0 && (compact.startsWith(p) || (compact.length <= 20 && compact.includes(p))));
  }
  const padded = ` ${norm} `;
  const wordCount = norm.split(' ').length;
  return phrases.some((p) => {
    if (!p) return false;
    const needle = ` ${p} `;
    return padded.startsWith(needle) || (wordCount <= 6 && padded.includes(needle));
  });
}

interface SegmenterLike {
  segment(input: string): Iterable<{ isWordLike?: boolean }>;
}
type SegmenterCtor = new (locale: string, options: { granularity: 'word' }) => SegmenterLike;

export function countWords(text: string, languageTag: string): number {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Segmenter) {
    try {
      const segmenter = new Segmenter(primaryLanguage(languageTag) || 'en', { granularity: 'word' });
      let count = 0;
      for (const segment of segmenter.segment(text)) {
        if (segment.isWordLike) count += 1;
      }
      return count;
    } catch {
      // Fall through to the whitespace heuristic.
    }
  }
  const tokens = text.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));
  if (tokens.length < 2 && text.length > 8) return Math.ceil(text.length / 2);
  return tokens.length;
}

/* ========================================================================== */
/* 5. audio_text sanitizer (TTS-ready)                                        */
/* ========================================================================== */

/**
 * Converts any model-produced string into clean, speakable plain text:
 * no markdown, HTML, URLs, bracketed stage directions, emoji, symbols or list markers.
 * ZWNJ/ZWJ are preserved on purpose (required by Persian and Indic scripts).
 */
export function sanitizeAudioText(input: string): string {
  let s = input.normalize('NFC');
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/`([^`]*)`/g, '$1');
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  s = s.replace(/https?:\/\/\S+/gi, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\[[^\]]*\]|\{[^}]*\}|［[^］]*］|【[^】]*】/g, ' ');
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  s = s.replace(/^\s*>+\s?/gm, '');
  s = s.replace(/^\s*(?:[-*+•·●▪◦]|\d+[.)])\s+/gm, '');
  s = s.replace(/[\u200B\uFEFF\u2060\uFE0F]/g, '');
  s = s.replace(/\p{Extended_Pictographic}/gu, ' ');
  s = s.replace(/[\p{So}\p{Sk}]/gu, ' ');
  s = s.replace(/[()（）]/g, ' ');
  s = s.replace(/[*_~#^|\\<>=@]/g, ' ');
  s = s.replace(/\//g, ' ');
  s = s.replace(/\s+[-–—]+\s+/g, ', ');
  s = s.replace(/[–—]/g, ', ');
  s = s.replace(/…/g, '.');
  s = s.replace(/\p{Cc}/gu, ' ');
  s = s.replace(/\s*\n+\s*/g, ' ');
  s = s.replace(/\s{2,}/g, ' ');
  s = s.replace(/\s+([.,;:!?،؛؟。、！？])/g, '$1');
  s = s.replace(/([.,;:!?،؛؟。、！？])\1+/g, '$1');
  s = s.replace(/^[\s.,;:!?،؛؟。、！？-]+/, '');
  return s.trim();
}

function sanitizeAudioFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAudioFields(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      out[key] = key === 'audio_text' && typeof v === 'string' ? sanitizeAudioText(v) : sanitizeAudioFields(v);
    }
    return out as T;
  }
  return value;
}

function collectAudioIssues(value: unknown, path: string, issues: Issue[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectAudioIssues(item, `${path}.${i}`, issues));
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      const childPath = `${path}.${key}`;
      if (key === 'audio_text' && typeof v === 'string') {
        if (v.length === 0) {
          issues.push({ path: childPath, message: 'is empty after TTS cleaning; write plain spoken sentences in the target language' });
        } else if (v.length > 500) {
          issues.push({ path: childPath, message: 'must be at most 500 characters' });
        }
      } else {
        collectAudioIssues(v, childPath, issues);
      }
    }
  }
}

/* ========================================================================== */
/* 6. Public input types                                                      */
/* ========================================================================== */

export interface LanguagePair {
  /** BCP-47 tag of the learner's native/UI language, e.g. "ar", "en", "fr". */
  nativeLanguage: string;
  /** BCP-47 tag of the language being learned, e.g. "ja", "ko", "es". */
  targetLanguage: string;
}

export interface OnboardingInput extends LanguagePair {
  answers: ReadonlyArray<{ question: string; answer: string }>;
  selfReportedLevel?: CefrLevel;
}

export interface DiagnosticAnswerRecord {
  exercise_id: string;
  cefr_level: CefrLevel;
  skill: Skill;
  concept_tag: string;
  correct: boolean;
}

export interface DiagnosticQuestionInput extends LanguagePair {
  level: CefrLevel;
  skill?: Skill;
  intent?: LearningIntent;
  /** Concept tags already used in this diagnostic; they must not repeat. */
  askedConceptTags?: readonly string[];
}

export interface DiagnosticEvaluationInput extends LanguagePair {
  history: readonly DiagnosticAnswerRecord[];
}

export interface PathwayInput extends LanguagePair {
  level: CefrLevel;
  intent: LearningIntent;
  unitCount?: number;
  lessonsPerUnit?: number;
  exercisesPerLesson?: number;
  /** Persistent weak points (concept tags) to recycle organically into later units. */
  weakConceptTags?: readonly string[];
}

export interface TutorTurn {
  role: 'learner' | 'tutor';
  text: string;
}

export interface TutorChatInput extends LanguagePair {
  level: CefrLevel;
  intent?: LearningIntent;
  history: readonly TutorTurn[];
  learnerMessage: string;
  weakConceptTags?: readonly string[];
}

/* ========================================================================== */
/* 7. Deterministic diagnostic planner                                        */
/* ========================================================================== */

interface LevelStats {
  total: number;
  correct: number;
}

export interface DiagnosticPlan {
  estimatedLevel: CefrLevel;
  nextProbeLevel: CefrLevel;
  shouldStop: boolean;
  stats: Record<CefrLevel, LevelStats>;
}

const PASS_RATIO = 0.7;
const MIN_ANSWERS_PER_LEVEL = 2;
const MAX_DIAGNOSTIC_ANSWERS = 14;

function emptyStats(): Record<CefrLevel, LevelStats> {
  return {
    A1: { total: 0, correct: 0 },
    A2: { total: 0, correct: 0 },
    B1: { total: 0, correct: 0 },
    B2: { total: 0, correct: 0 },
    C1: { total: 0, correct: 0 },
    C2: { total: 0, correct: 0 },
  };
}

/**
 * Pure, deterministic adaptive-diagnostic state machine.
 *  - A level is PASSED with >= 2 answers and >= 70% correct; FAILED with >= 2 answers and < 70%.
 *  - Levels below the first probed level are assumed passed when the first probed level passes.
 *  - The estimate is the highest consecutively passed level.
 *  - Probing moves up one level at a time; it stops when the next level is failed, when C2 is
 *    passed, when A1 is failed, or after 14 answers.
 */
export function computeDiagnosticPlan(history: readonly DiagnosticAnswerRecord[]): DiagnosticPlan {
  const stats = emptyStats();
  for (const answer of history) {
    const s = stats[answer.cefr_level];
    s.total += 1;
    if (answer.correct) s.correct += 1;
  }
  const passed = (l: CefrLevel): boolean => {
    const s = stats[l];
    return s.total >= MIN_ANSWERS_PER_LEVEL && s.correct / s.total >= PASS_RATIO;
  };
  const failed = (l: CefrLevel): boolean => {
    const s = stats[l];
    return s.total >= MIN_ANSWERS_PER_LEVEL && s.correct / s.total < PASS_RATIO;
  };
  const capped = history.length >= MAX_DIAGNOSTIC_ANSWERS;

  const firstProbed = CEFR_LEVELS.findIndex((l) => stats[l].total > 0);
  if (firstProbed === -1) {
    return { estimatedLevel: 'A1', nextProbeLevel: 'A1', shouldStop: false, stats };
  }
  const firstLevel = levelAt(firstProbed);

  if (!passed(firstLevel)) {
    if (!failed(firstLevel)) {
      return { estimatedLevel: levelAt(firstProbed - 1), nextProbeLevel: firstLevel, shouldStop: capped, stats };
    }
    if (firstProbed === 0) {
      return { estimatedLevel: 'A1', nextProbeLevel: 'A1', shouldStop: true, stats };
    }
    const lower = levelAt(firstProbed - 1);
    return { estimatedLevel: lower, nextProbeLevel: lower, shouldStop: capped, stats };
  }

  let estimatedIndex = firstProbed;
  for (let i = firstProbed + 1; i < CEFR_LEVELS.length; i += 1) {
    if (passed(levelAt(i))) estimatedIndex = i;
    else break;
  }
  const estimatedLevel = levelAt(estimatedIndex);
  if (estimatedIndex >= CEFR_LEVELS.length - 1) {
    return { estimatedLevel, nextProbeLevel: 'C2', shouldStop: true, stats };
  }
  const above = levelAt(estimatedIndex + 1);
  if (failed(above)) {
    return { estimatedLevel, nextProbeLevel: estimatedLevel, shouldStop: true, stats };
  }
  return { estimatedLevel, nextProbeLevel: above, shouldStop: capped, stats };
}

/* ========================================================================== */
/* 8. Semantic validation helpers                                             */
/* ========================================================================== */

function exerciseTargetFields(ex: Exercise, path: string): TargetField[] {
  const fields: TargetField[] = [
    { path: `${path}.target_text`, value: ex.target_text },
    { path: `${path}.audio_text`, value: ex.audio_text },
  ];
  ex.options.forEach((o, i) => fields.push({ path: `${path}.options.${i}.text`, value: o.text }));
  ex.accepted_answers.forEach((a, i) => fields.push({ path: `${path}.accepted_answers.${i}`, value: a }));
  ex.reorder_tokens.forEach((t, i) => fields.push({ path: `${path}.reorder_tokens.${i}`, value: t }));
  return fields;
}

function pleasantryIssues(fields: readonly TargetField[], lang: string, level: CefrLevel): Issue[] {
  if (!LEVEL_PROFILES[level].banPleasantries) return [];
  const issues: Issue[] = [];
  for (const field of fields) {
    if (containsBasicPleasantry(field.value, lang)) {
      issues.push({
        path: field.path,
        message: `contains a greeting, farewell, thanks or other basic pleasantry, which is strictly banned at ${level}; replace it with advanced academic, professional, debate or literary content`,
      });
    }
  }
  return issues;
}

function checkExercise(ex: Exercise, path: string, level: CefrLevel, lang: string): Issue[] {
  const profile = LEVEL_PROFILES[level];
  const issues: Issue[] = [];
  if (ex.cefr_level !== level) {
    issues.push({ path: `${path}.cefr_level`, message: `must equal the requested level ${level}, got ${ex.cefr_level}` });
  }
  if (!profile.allowedSkills.includes(ex.skill)) {
    issues.push({
      path: `${path}.skill`,
      message: `"${ex.skill}" is not allowed at ${level}; allowed: ${profile.allowedSkills.join(', ')}`,
    });
  }
  if (!profile.allowedRegisters.includes(ex.register)) {
    issues.push({
      path: `${path}.register`,
      message: `"${ex.register}" is not allowed at ${level}; allowed: ${profile.allowedRegisters.join(', ')}`,
    });
  }
  const words = countWords(ex.target_text, lang);
  if (profile.minWords !== undefined && words < profile.minWords) {
    issues.push({ path: `${path}.target_text`, message: `has ${words} words; ${level} requires at least ${profile.minWords}` });
  }
  if (profile.maxWords !== undefined && words > profile.maxWords) {
    issues.push({ path: `${path}.target_text`, message: `has ${words} words; ${level} allows at most ${profile.maxWords}` });
  }
  issues.push(...pleasantryIssues(exerciseTargetFields(ex, path), lang, level));
  return issues;
}

function normalizeConceptTags(tags: readonly string[] | undefined): string[] {
  if (!tags) return [];
  const unique = new Set<string>();
  for (const tag of tags) {
    const t = tag.trim();
    if (CONCEPT_TAG_PATTERN.test(t)) unique.add(t);
    if (unique.size >= 20) break;
  }
  return Array.from(unique);
}

function resolvePathwayCounts(input: PathwayInput): { units: number; lessons: number; exercises: number } {
  const clamp = (v: number | undefined, fallback: number, min: number, max: number): number =>
    Math.max(min, Math.min(max, Math.round(v ?? fallback)));
  return {
    units: clamp(input.unitCount, 2, 1, 6),
    lessons: clamp(input.lessonsPerUnit, 2, 1, 6),
    exercises: clamp(input.exercisesPerLesson, 6, 3, 10),
  };
}

/* ========================================================================== */
/* 9. Task definitions                                                        */
/* ========================================================================== */

interface TaskDefinition<TIn extends LanguagePair, TOut> {
  readonly name: TaskName;
  readonly schema: z.ZodType<TOut>;
  readonly maxTokens: number;
  readonly contract: string;
  readonly levelFor: (input: TIn) => CefrLevel | null;
  readonly instructions: (input: TIn) => string;
  readonly payload: (input: TIn) => Record<string, unknown>;
  readonly targetFields: (output: TOut) => TargetField[];
  readonly semanticChecks: (input: TIn, output: TOut) => Issue[];
}

const EXERCISE_CONTRACT = `Exercise object (all keys required):
{
  "id": string (unique, 1-64 chars),
  "cefr_level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2" (must equal the requested level),
  "skill": "script_phonics"|"vocabulary"|"grammar"|"reading"|"listening"|"writing"|"discourse"|"pragmatics",
  "format": "multiple_choice"|"listening_choice"|"fill_blank"|"reorder"|"typed_recall",
  "register": "foundational"|"everyday"|"situational"|"formal"|"professional"|"academic"|"literary"|"debate",
  "concept_tag": string (lowercase dot path, max 3 segments, chars a-z 0-9 _ , e.g. "grammar.subjunctive"),
  "instruction": string (NATIVE: what the learner must do),
  "target_text": string (TARGET: the stimulus. listening_choice: the transcript that will be spoken. fill_blank: the sentence with the blank written as "____". reorder: the full correct sentence. typed_recall: a context sentence or passage),
  "options": [{"id": string, "text": string (TARGET)}] (2-6 items for multiple_choice, listening_choice, fill_blank; otherwise []),
  "correct_option_id": string|null (the id of exactly one option for choice formats; otherwise null),
  "accepted_answers": [string (TARGET)] (1-8 items for reorder and typed_recall; otherwise []),
  "reorder_tokens": [string (TARGET)] (3-20 shuffled tokens for reorder; otherwise []),
  "explanation": string (NATIVE: why the answer is correct and why the most tempting wrong answer fails),
  "audio_text": string (TARGET, TTS-clean spoken version of the full correct sentence, no blank marker)
}`;

/* ---- 9.1 Onboarding ---------------------------------------------------- */

const onboardingTask: TaskDefinition<OnboardingInput, OnboardingOutput> = {
  name: 'onboarding',
  schema: OnboardingSchema,
  maxTokens: 900,
  contract: `{
  "intent": "travel"|"business"|"academic"|"daily_fluency",
  "starting_level_hypothesis": "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "suggested_daily_minutes": integer 5-120,
  "focus_skills": [1-4 unique values from the skill list: script_phonics, vocabulary, grammar, reading, listening, writing, discourse, pragmatics],
  "needs_script_foundation": boolean,
  "summary": string (NATIVE, 1-3 calm sentences)
}`,
  levelFor: () => null,
  instructions: () =>
    [
      'Analyse the learner\'s onboarding answers and produce a study profile.',
      '- Choose the single best primary intent.',
      '- starting_level_hypothesis must be conservative; the adaptive diagnostic will verify it. When the learner self-reports a level, do not exceed it by more than one step.',
      '- needs_script_foundation is true only when the target language uses a non-Latin script AND the answers indicate the learner cannot yet read it. Otherwise false.',
      '- focus_skills must fit the hypothesis level (no script_phonics above A2).',
      '- summary: NATIVE language, sober and professional. No streaks, points, rewards, emoji or cheerleading.',
    ].join('\n'),
  payload: (input) => ({
    target_language: input.targetLanguage,
    native_language: input.nativeLanguage,
    self_reported_level: input.selfReportedLevel ?? null,
    answers: input.answers.slice(0, 20).map((a) => ({
      question: a.question.slice(0, 300),
      answer: a.answer.slice(0, 600),
    })),
  }),
  targetFields: () => [],
  semanticChecks: (input, out) => {
    const issues: Issue[] = [];
    const policy = resolveScriptPolicy(input.targetLanguage);
    if (policy.kind === 'latin' && out.needs_script_foundation) {
      issues.push({ path: 'needs_script_foundation', message: 'must be false: the target language uses the Latin script' });
    }
    const level = out.starting_level_hypothesis;
    if (level !== 'A1' && level !== 'A2' && out.focus_skills.includes('script_phonics')) {
      issues.push({ path: 'focus_skills', message: 'script_phonics is only allowed for A1 and A2 hypotheses' });
    }
    if (input.selfReportedLevel) {
      const gap = CEFR_LEVELS.indexOf(level) - CEFR_LEVELS.indexOf(input.selfReportedLevel);
      if (gap > 1) {
        issues.push({ path: 'starting_level_hypothesis', message: 'must not exceed the self-reported level by more than one step' });
      }
    }
    return issues;
  },
};

/* ---- 9.2 Diagnostic question ------------------------------------------- */

const diagnosticQuestionTask: TaskDefinition<DiagnosticQuestionInput, DiagnosticQuestionOutput> = {
  name: 'diagnostic_question',
  schema: DiagnosticQuestionSchema,
  maxTokens: 1500,
  contract: `{ "exercise": <Exercise object> }

${EXERCISE_CONTRACT}`,
  levelFor: (input) => input.level,
  instructions: (input) =>
    [
      `Create EXACTLY ONE diagnostic exercise at level ${input.level}${input.skill ? ` probing the skill "${input.skill}"` : ' probing the skill that best discriminates this level'}.`,
      '- Exactly one defensible correct answer. Distractors must be plausible and reflect real learner error patterns, never absurd.',
      '- Answerable without images, audio files or external context.',
      '- Do not reuse any concept_tag listed in already_asked_concepts.',
      '- Prefer typed_recall, reorder and fill_blank when the level allows them; use multiple_choice for recognition only.',
      input.intent ? `- Where natural, set the content in the "${input.intent}" domain.` : '- Use a neutral domain.',
      '- The exercise.cefr_level field must be exactly the requested level.',
    ].join('\n'),
  payload: (input) => ({
    requested_level: input.level,
    requested_skill: input.skill ?? null,
    intent: input.intent ?? null,
    already_asked_concepts: normalizeConceptTags(input.askedConceptTags),
  }),
  targetFields: (out) => exerciseTargetFields(out.exercise, 'exercise'),
  semanticChecks: (input, out) => {
    const lang = primaryLanguage(input.targetLanguage);
    const issues = checkExercise(out.exercise, 'exercise', input.level, lang);
    if (input.skill && out.exercise.skill !== input.skill) {
      issues.push({ path: 'exercise.skill', message: `must be "${input.skill}"` });
    }
    if (normalizeConceptTags(input.askedConceptTags).includes(out.exercise.concept_tag)) {
      issues.push({ path: 'exercise.concept_tag', message: 'repeats an already asked concept; choose a different concept' });
    }
    return issues;
  },
};

/* ---- 9.3 Diagnostic evaluation ----------------------------------------- */

const diagnosticEvaluationTask: TaskDefinition<DiagnosticEvaluationInput, DiagnosticEvaluationOutput> = {
  name: 'diagnostic_evaluation',
  schema: DiagnosticEvaluationSchema,
  maxTokens: 1200,
  contract: `{
  "estimated_level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2" (copy precomputed.estimated_level exactly),
  "confidence": number 0-1,
  "next_probe_level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2" (copy precomputed.next_probe_level exactly),
  "should_stop": boolean (copy precomputed.should_stop exactly),
  "rationale": string (NATIVE, 1-3 factual sentences),
  "weak_points": [{"concept_tag": string, "skill": skill value, "note": string (NATIVE)}] (0-8 items)
}`,
  levelFor: () => null,
  instructions: () =>
    [
      'Interpret the learner\'s adaptive diagnostic history.',
      '- The level estimate, next probe level and stop decision were computed deterministically and are in "precomputed". Copy them EXACTLY; do not re-derive or adjust them.',
      '- weak_points: choose concept_tags ONLY from concept_tags the learner answered incorrectly, ordered by importance, with a short NATIVE-language note on the likely cause. If there are no incorrect answers, return [].',
      '- confidence reflects how well the evidence brackets the level (more answers at and just above the estimate means higher confidence).',
      '- rationale: NATIVE language, factual, no encouragement phrases, no emoji.',
    ].join('\n'),
  payload: (input) => {
    const plan = computeDiagnosticPlan(input.history);
    return {
      precomputed: {
        estimated_level: plan.estimatedLevel,
        next_probe_level: plan.nextProbeLevel,
        should_stop: plan.shouldStop,
      },
      per_level_stats: plan.stats,
      answers: input.history.map((a) => ({
        cefr_level: a.cefr_level,
        skill: a.skill,
        concept_tag: a.concept_tag,
        correct: a.correct,
      })),
    };
  },
  targetFields: () => [],
  semanticChecks: (input, out) => {
    const plan = computeDiagnosticPlan(input.history);
    const issues: Issue[] = [];
    if (out.estimated_level !== plan.estimatedLevel) {
      issues.push({ path: 'estimated_level', message: `must equal ${plan.estimatedLevel}` });
    }
    if (out.next_probe_level !== plan.nextProbeLevel) {
      issues.push({ path: 'next_probe_level', message: `must equal ${plan.nextProbeLevel}` });
    }
    if (out.should_stop !== plan.shouldStop) {
      issues.push({ path: 'should_stop', message: `must equal ${String(plan.shouldStop)}` });
    }
    const incorrect = new Set(input.history.filter((a) => !a.correct).map((a) => a.concept_tag));
    out.weak_points.forEach((w, i) => {
      if (!incorrect.has(w.concept_tag)) {
        issues.push({ path: `weak_points.${i}.concept_tag`, message: 'must be a concept_tag the learner answered incorrectly' });
      }
    });
    if (incorrect.size > 0 && out.weak_points.length === 0) {
      issues.push({ path: 'weak_points', message: 'must list the weak concepts because incorrect answers exist' });
    }
    return issues;
  },
};

/* ---- 9.4 Pathway ------------------------------------------------------- */

const INTENT_FOCUS: Record<LearningIntent, string> = {
  travel: 'transport, accommodation, dining, directions, shopping and bargaining, emergencies, health and cultural etiquette',
  business: 'meetings, email and written correspondence, negotiation, presentations, finance and operations, workplace relationships',
  academic: 'lectures and seminars, reading and summarising texts, essay structure, citation and argumentation, research vocabulary',
  daily_fluency: 'home life, social interaction, media and entertainment, opinions, plans, news and everyday problem-solving',
};

const pathwayTask: TaskDefinition<PathwayInput, PathwayOutput> = {
  name: 'pathway',
  schema: PathwaySchema,
  maxTokens: 8000,
  contract: `{
  "goal": "travel"|"business"|"academic"|"daily_fluency" (must equal the requested intent),
  "cefr_level": level value (must equal the requested level),
  "title": string (NATIVE),
  "units": [
    {
      "id": string,
      "title": string (NATIVE),
      "objective": string (NATIVE, one sentence stating the measurable outcome),
      "lessons": [
        {
          "id": string (unique across the whole pathway),
          "title": string (NATIVE),
          "vocabulary": [
            {
              "term": string (TARGET),
              "meaning": string (NATIVE),
              "example_sentence": string (TARGET),
              "example_meaning": string (NATIVE),
              "audio_text": string (TARGET, TTS-clean spoken form of example_sentence)
            }
          ] (3-10 items),
          "exercises": [<Exercise object>] (exact count requested),
          "recycled_concept_tags": [string] (concept tags re-introduced from weak_concept_tags; [] if none)
        }
      ] (exact count requested)
    }
  ] (exact count requested)
}

${EXERCISE_CONTRACT}`,
  levelFor: (input) => input.level,
  instructions: (input) => {
    const counts = resolvePathwayCounts(input);
    const weak = normalizeConceptTags(input.weakConceptTags);
    return [
      `Build a structured, progressive learning pathway for intent "${input.intent}" at level ${input.level}.`,
      `Intent focus: ${INTENT_FOCUS[input.intent]}.`,
      `Exact sizes: ${counts.units} unit(s); ${counts.lessons} lesson(s) per unit; ${counts.exercises} exercise(s) per lesson; 4-8 vocabulary items per lesson.`,
      '- Progressive: each unit builds on the previous one; each lesson is a bite-sized, single-objective module.',
      '- Rigorous active recall: at least half of the exercises in every lesson must use the formats typed_recall, reorder or fill_blank.',
      '- Non-gamified: no points, streaks, badges, rewards or cheerleading in any text.',
      '- Every exercise cefr_level must equal the pathway level. Every exercise needs a distinct concept_tag within its lesson.',
      weak.length > 0
        ? `- Spaced error recycling: weak_concept_tags = [${weak.join(', ')}]. From the second unit onward, every unit must re-introduce at least one of them organically in a new context: add the tag to that lesson's recycled_concept_tags AND include an exercise whose concept_tag equals it. Never put a tag in recycled_concept_tags that is not in weak_concept_tags.`
        : '- No weak concepts were supplied: recycled_concept_tags must be [] in every lesson.',
    ].join('\n');
  },
  payload: (input) => {
    const counts = resolvePathwayCounts(input);
    return {
      requested_level: input.level,
      intent: input.intent,
      unit_count: counts.units,
      lessons_per_unit: counts.lessons,
      exercises_per_lesson: counts.exercises,
      weak_concept_tags: normalizeConceptTags(input.weakConceptTags),
    };
  },
  targetFields: (out) => {
    const fields: TargetField[] = [];
    out.units.forEach((unit, u) => {
      unit.lessons.forEach((lesson, l) => {
        const base = `units.${u}.lessons.${l}`;
        lesson.vocabulary.forEach((v, i) => {
          fields.push({ path: `${base}.vocabulary.${i}.term`, value: v.term });
          fields.push({ path: `${base}.vocabulary.${i}.example_sentence`, value: v.example_sentence });
          fields.push({ path: `${base}.vocabulary.${i}.audio_text`, value: v.audio_text });
        });
        lesson.exercises.forEach((ex, e) => fields.push(...exerciseTargetFields(ex, `${base}.exercises.${e}`)));
      });
    });
    return fields;
  },
  semanticChecks: (input, out) => {
    const issues: Issue[] = [];
    const lang = primaryLanguage(input.targetLanguage);
    const counts = resolvePathwayCounts(input);
    const weak = new Set(normalizeConceptTags(input.weakConceptTags));
    const profile = LEVEL_PROFILES[input.level];
    const lessonIds = new Set<string>();
    const exerciseIds = new Set<string>();

    if (out.cefr_level !== input.level) issues.push({ path: 'cefr_level', message: `must equal ${input.level}` });
    if (out.goal !== input.intent) issues.push({ path: 'goal', message: `must equal ${input.intent}` });
    if (out.units.length !== counts.units) {
      issues.push({ path: 'units', message: `must contain exactly ${counts.units} unit(s), got ${out.units.length}` });
    }

    out.units.forEach((unit, u) => {
      let recycledInUnit = 0;
      if (unit.lessons.length !== counts.lessons) {
        issues.push({ path: `units.${u}.lessons`, message: `must contain exactly ${counts.lessons} lesson(s), got ${unit.lessons.length}` });
      }
      unit.lessons.forEach((lesson, l) => {
        const base = `units.${u}.lessons.${l}`;
        if (lessonIds.has(lesson.id)) issues.push({ path: `${base}.id`, message: 'lesson ids must be unique across the pathway' });
        lessonIds.add(lesson.id);
        if (lesson.exercises.length !== counts.exercises) {
          issues.push({ path: `${base}.exercises`, message: `must contain exactly ${counts.exercises} exercise(s), got ${lesson.exercises.length}` });
        }
        const tagsInLesson = new Set<string>();
        lesson.exercises.forEach((ex, e) => {
          const exPath = `${base}.exercises.${e}`;
          if (exerciseIds.has(ex.id)) issues.push({ path: `${exPath}.id`, message: 'exercise ids must be unique across the pathway' });
          exerciseIds.add(ex.id);
          if (tagsInLesson.has(ex.concept_tag) && !lesson.recycled_concept_tags.includes(ex.concept_tag)) {
            issues.push({ path: `${exPath}.concept_tag`, message: 'concept tags must be distinct within a lesson' });
          }
          tagsInLesson.add(ex.concept_tag);
          issues.push(...checkExercise(ex, exPath, input.level, lang));
        });
        const recall = lesson.exercises.filter(
          (ex) => ex.format === 'typed_recall' || ex.format === 'reorder' || ex.format === 'fill_blank',
        ).length;
        if (recall * 2 < lesson.exercises.length) {
          issues.push({ path: `${base}.exercises`, message: 'at least half of the exercises must be typed_recall, reorder or fill_blank' });
        }
        lesson.recycled_concept_tags.forEach((tag, t) => {
          if (!weak.has(tag)) {
            issues.push({ path: `${base}.recycled_concept_tags.${t}`, message: 'must be one of weak_concept_tags' });
          }
          if (!lesson.exercises.some((ex) => ex.concept_tag === tag)) {
            issues.push({ path: `${base}.recycled_concept_tags.${t}`, message: 'requires an exercise in the same lesson whose concept_tag equals it' });
          }
        });
        recycledInUnit += lesson.recycled_concept_tags.length;

        lesson.vocabulary.forEach((v, i) => {
          const vPath = `${base}.vocabulary.${i}`;
          const words = countWords(v.example_sentence, lang);
          if (profile.minWords !== undefined && words < profile.minWords) {
            issues.push({ path: `${vPath}.example_sentence`, message: `has ${words} words; ${input.level} requires at least ${profile.minWords}` });
          }
          if (profile.maxWords !== undefined && words > profile.maxWords) {
            issues.push({ path: `${vPath}.example_sentence`, message: `has ${words} words; ${input.level} allows at most ${profile.maxWords}` });
          }
          issues.push(
            ...pleasantryIssues(
              [
                { path: `${vPath}.term`, value: v.term },
                { path: `${vPath}.example_sentence`, value: v.example_sentence },
                { path: `${vPath}.audio_text`, value: v.audio_text },
              ],
              lang,
              input.level,
            ),
          );
        });
      });
      if (weak.size > 0 && u > 0 && recycledInUnit === 0) {
        issues.push({ path: `units.${u}`, message: 'must recycle at least one weak concept tag (spaced error recycling)' });
      }
    });
    return issues;
  },
};

/* ---- 9.5 Tutor chat ---------------------------------------------------- */

const tutorChatTask: TaskDefinition<TutorChatInput, TutorChatOutput> = {
  name: 'tutor_chat',
  schema: TutorChatSchema,
  maxTokens: 1800,
  contract: `{
  "cefr_level": level value (must equal the learner level),
  "register": "foundational"|"everyday"|"situational"|"formal"|"professional"|"academic"|"literary"|"debate",
  "reply": string (TARGET, your reply at the learner's level),
  "reply_gloss": string (NATIVE translation of reply),
  "corrections": [
    {
      "original": string (the learner's wording copied VERBATIM, even if it contains Latin letters),
      "corrected": string (TARGET, correct form in the authentic native script),
      "explanation": string (NATIVE, concise rule),
      "concept_tag": string (lowercase dot path)
    }
  ] (0-5 items; [] when the learner's message is correct),
  "follow_up": string (TARGET, exactly one question that forces the learner to produce language),
  "audio_text": string (TARGET, TTS-clean spoken version of reply followed by follow_up)
}`,
  levelFor: (input) => input.level,
  instructions: (input) => {
    const weak = normalizeConceptTags(input.weakConceptTags);
    return [
      'You are a rigorous, courteous conversation tutor.',
      `- Reply ONLY in the target language, calibrated to ${input.level}. reply_gloss carries the native-language translation.`,
      '- Correct every genuine error in the learner\'s last message in "corrections". Do not invent errors. If the learner wrote the target language in Latin letters (romanization) for a non-Latin script, correct it to the authentic script and explain.',
      '- If the learner wrote in their native language, still answer in the target language at their level and show the target-language equivalent of their message in corrections only if it was an attempt at the target language.',
      '- No flattery, emoji, points or cheerleading. Stay on substance.',
      input.intent ? `- Steer topics toward the "${input.intent}" domain.` : '- Keep topics general but substantive.',
      weak.length > 0 ? `- Where natural, create an opportunity to practise these weak concepts: ${weak.join(', ')}.` : '- No specific weak concepts supplied.',
      '- Your message must end with exactly one follow_up question.',
      LEVEL_PROFILES[input.level].banPleasantries
        ? '- At this level NEVER open with, or include, a greeting, thanks, apology or pleasantry. Engage the substance of the learner\'s message immediately.'
        : '- Keep pleasantries minimal.',
    ].join('\n');
  },
  payload: (input) => ({
    learner_level: input.level,
    intent: input.intent ?? null,
    weak_concept_tags: normalizeConceptTags(input.weakConceptTags),
    conversation_history: input.history.slice(-12).map((t) => ({ role: t.role, text: t.text.slice(0, 1200) })),
    learner_message: input.learnerMessage.slice(0, 2000),
  }),
  targetFields: (out) => [
    { path: 'reply', value: out.reply },
    { path: 'follow_up', value: out.follow_up },
    { path: 'audio_text', value: out.audio_text },
    ...out.corrections.map((c, i) => ({ path: `corrections.${i}.corrected`, value: c.corrected })),
  ],
  semanticChecks: (input, out) => {
    const issues: Issue[] = [];
    const lang = primaryLanguage(input.targetLanguage);
    const profile = LEVEL_PROFILES[input.level];
    if (out.cefr_level !== input.level) issues.push({ path: 'cefr_level', message: `must equal ${input.level}` });
    if (!profile.allowedRegisters.includes(out.register)) {
      issues.push({ path: 'register', message: `"${out.register}" is not allowed at ${input.level}; allowed: ${profile.allowedRegisters.join(', ')}` });
    }
    issues.push(
      ...pleasantryIssues(
        [
          { path: 'reply', value: out.reply },
          { path: 'follow_up', value: out.follow_up },
          { path: 'audio_text', value: out.audio_text },
        ],
        lang,
        input.level,
      ),
    );
    out.corrections.forEach((c, i) => {
      if (normalizeForMatch(c.original, lang) === normalizeForMatch(c.corrected, lang)) {
        issues.push({ path: `corrections.${i}`, message: '"corrected" must differ from "original"; remove corrections that change nothing' });
      }
    });
    return issues;
  },
};

/* ========================================================================== */
/* 10. System prompt builder                                                  */
/* ========================================================================== */

function languageName(tag: string): string {
  try {
    const names = new Intl.DisplayNames(['en'], { type: 'language' });
    const name = names.of(tag);
    if (name && name !== tag) return `${name} (${tag})`;
  } catch {
    // Fall back to the raw tag.
  }
  return tag;
}

function scriptPolicyText(targetTag: string, targetName: string): string {
  const policy = resolveScriptPolicy(targetTag);
  if (policy.kind === 'script') {
    return [
      `Every TARGET field must be written ONLY in the authentic native script of ${targetName}: ${policy.label}.`,
      'STRICT BAN inside TARGET fields: zero Latin letters, zero transliteration or romanization (pinyin, romaji, romanized Hangul, Arabizi and similar), zero phonetic respelling, zero IPA, zero English or native-language glosses, not even in parentheses or brackets.',
      'Digits and standard punctuation are allowed. A validator rejects any Latin letter in a TARGET field.',
    ].join('\n');
  }
  if (policy.kind === 'latin') {
    return [
      `Every TARGET field must be written ONLY in standard ${targetName} orthography (Latin script with the language's own diacritics).`,
      'STRICT BAN inside TARGET fields: no words from other languages (including the learner\'s native language), no other scripts, no phonetic respelling, no IPA, no glosses in parentheses. A validator rejects any non-Latin letter in a TARGET field.',
    ].join('\n');
  }
  return `Every TARGET field must be written ONLY in the authentic standard orthography of ${targetName}: no transliteration, no phonetic respelling, no IPA, no glosses, no words from other languages.`;
}

export function buildSystemPrompt<TIn extends LanguagePair, TOut>(def: TaskDefinition<TIn, TOut>, input: TIn): string {
  const nativeName = languageName(input.nativeLanguage);
  const targetName = languageName(input.targetLanguage);
  const level = def.levelFor(input);
  const ladder = CEFR_LEVELS.map((l) => `${l}: ${LEVEL_PROFILES[l].label}`).join('\n');

  const sections: string[] = [
    'You are the Fluentic Neural Core: the pedagogical engine of a premium, non-gamified language-learning product. Your output is machine-parsed and machine-validated; anything that violates the rules below is rejected and you will be asked to redo it.',

    [
      'OUTPUT PROTOCOL',
      '1. Respond with exactly ONE JSON object and nothing else: no prose before or after, no markdown, no code fences, no comments.',
      '2. Follow the OUTPUT CONTRACT exactly. Every listed key is required. No extra keys. Use [] or null only where the contract allows.',
      '3. All ids must be unique within the response.',
    ].join('\n'),

    [
      'LANGUAGES',
      `NATIVE language of the learner: ${nativeName}. Every field marked NATIVE (instructions, explanations, meanings, notes, summaries, titles) is written in this language, in correct, natural, properly spelled prose.`,
      `TARGET language being learned: ${targetName}. Every field marked TARGET is written in this language only.`,
    ].join('\n'),

    ['TARGET-SCRIPT PURITY (hard rule, machine-checked)', scriptPolicyText(input.targetLanguage, targetName)].join('\n'),

    [
      'AUDIO TEXT (hard rule, machine-checked)',
      'audio_text is sent directly to a text-to-speech engine. It must be plain, natural, fully punctuated spoken text in the TARGET language: no markdown, asterisks, underscores, hashes, bullets, emoji, symbols, URLs, brackets, parentheses, stage directions, blank markers or phonetic guides. Spell out anything a speech engine could misread. Maximum 500 characters.',
    ].join('\n'),

    ['CEFR RIGOR (hard rule, machine-checked)', 'Ladder:', ladder].join('\n'),
  ];

  if (level) {
    const profile = LEVEL_PROFILES[level];
    sections.push(
      [
        `ACTIVE LEVEL: ${level}`,
        profile.directive,
        `Allowed skills: ${profile.allowedSkills.join(', ')}.`,
        `Allowed registers: ${profile.allowedRegisters.join(', ')}.`,
        profile.banPleasantries
          ? 'A validator rejects any greeting, farewell, thanks, apology or pleasantry at this level, in any TARGET field, including answer options.'
          : 'Keep every item inside this level; do not drift into harder or easier material.',
      ].join('\n'),
    );
  }

  sections.push(['TASK', def.instructions(input)].join('\n'));
  sections.push(['OUTPUT CONTRACT', def.contract].join('\n'));
  return sections.join('\n\n');
}

/* ========================================================================== */
/* 11. Errors and transport                                                   */
/* ========================================================================== */

export type AIErrorCode = 'CONFIG' | 'ABORTED' | 'TIMEOUT' | 'TRANSPORT' | 'EXHAUSTED';

export class AIServiceError extends Error {
  readonly code: AIErrorCode;
  readonly attempts: number;
  readonly issues: readonly Issue[];
  readonly originalError: unknown;

  constructor(
    code: AIErrorCode,
    message: string,
    details: { attempts?: number; issues?: readonly Issue[]; originalError?: unknown } = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'AIServiceError';
    this.code = code;
    this.attempts = details.attempts ?? 0;
    this.issues = details.issues ?? [];
    this.originalError = details.originalError;
  }
}

export class TransportError extends Error {
  readonly status: number;
  readonly retryable: boolean;
  readonly retryAfterMs: number | undefined;
  readonly timedOut: boolean;
  readonly originalError: unknown;

  constructor(
    message: string,
    details: { status: number; retryable: boolean; retryAfterMs?: number; timedOut?: boolean; originalError?: unknown },
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'TransportError';
    this.status = details.status;
    this.retryable = details.retryable;
    this.retryAfterMs = details.retryAfterMs;
    this.timedOut = details.timedOut ?? false;
    this.originalError = details.originalError;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AITransportRequest {
  task: TaskName;
  system: string;
  messages: ChatMessage[];
  temperature: number;
  maxTokens: number;
  signal: AbortSignal;
}

/** Returns the raw model output string. Must throw TransportError for HTTP/network failures. */
export type AITransport = (request: AITransportRequest) => Promise<string>;

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

export function createFetchTransport(endpoint: string, extraHeaders: Record<string, string> = {}): AITransport {
  return async (request) => {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify({
          task: request.task,
          system: request.system,
          messages: request.messages,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
          responseFormat: 'json',
        }),
        signal: request.signal,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw new TransportError('Network request to the AI endpoint failed.', {
        status: 0,
        retryable: true,
        originalError: error,
      });
    }

    if (!response.ok) {
      const retryable =
        response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500;
      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
      throw new TransportError(`AI endpoint responded with HTTP ${response.status}.`, {
        status: response.status,
        retryable,
        ...(retryAfterMs !== undefined ? { retryAfterMs } : {}),
      });
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      throw new TransportError('AI endpoint returned a body that is not valid JSON.', {
        status: response.status,
        retryable: true,
        originalError: error,
      });
    }
    const text = typeof body === 'object' && body !== null ? (body as { text?: unknown }).text : undefined;
    if (typeof text !== 'string') {
      throw new TransportError('AI endpoint response is missing the string field "text".', {
        status: response.status,
        retryable: false,
      });
    }
    return text;
  };
}

/* ========================================================================== */
/* 12. Response processing                                                    */
/* ========================================================================== */

export function extractJsonObject(raw: string): unknown {
  const text = raw.replace(/^\uFEFF/, '').trim();
  const candidates: string[] = [text];
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) candidates.push(fence[1].trim());
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) candidates.push(text.slice(first, last + 1));
  for (const candidate of candidates) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value;
    } catch {
      // Try the next candidate.
    }
  }
  throw new SyntaxError('Response did not contain a valid JSON object.');
}

type ProcessOutcome<TOut> =
  | { ok: true; data: TOut; warnings: string[]; scriptVerified: boolean }
  | { ok: false; issues: Issue[] };

function processRaw<TIn extends LanguagePair, TOut>(
  def: TaskDefinition<TIn, TOut>,
  input: TIn,
  raw: string,
): ProcessOutcome<TOut> {
  let json: unknown;
  try {
    json = extractJsonObject(raw);
  } catch {
    return {
      ok: false,
      issues: [{ path: '$', message: 'the response is not a single valid JSON object; return ONLY the JSON object' }],
    };
  }

  const parsed = def.schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.length > 0 ? i.path.map(String).join('.') : '$',
        message: i.message,
      })),
    };
  }

  const data = sanitizeAudioFields(parsed.data);
  const issues: Issue[] = [];
  collectAudioIssues(data, '$', issues);
  issues.push(...def.semanticChecks(input, data));

  const targetLang = primaryLanguage(input.targetLanguage);
  const policy = resolveScriptPolicy(targetLang);
  for (const field of def.targetFields(data)) {
    const offenders = findScriptViolations(field.value, targetLang);
    if (offenders.length > 0) {
      const sample = offenders.slice(0, 8).join(' ');
      issues.push({
        path: field.path,
        message:
          policy.kind === 'latin'
            ? `contains characters from a foreign script (${sample}); write only standard ${targetLang} orthography`
            : `contains Latin or foreign-script letters (${sample}); write only in the authentic native script, with no transliteration, romanization, phonetics or glosses`,
      });
    }
  }

  if (issues.length > 0) return { ok: false, issues };

  const warnings: string[] = [];
  if (policy.kind === 'unknown') {
    warnings.push(`Script purity could not be verified for target language "${targetLang}" (no script rule registered).`);
  }
  return { ok: true, data, warnings, scriptVerified: policy.kind !== 'unknown' };
}

function buildRepairMessage(issues: readonly Issue[]): string {
  const shown = issues.slice(0, 15).map((i) => `- ${i.path}: ${i.message}`);
  const extra = issues.length > 15 ? `\n- ...and ${issues.length - 15} more issue(s)` : '';
  return [
    'Your previous response was rejected by the Fluentic validator. Fix EVERY issue below and return the complete corrected JSON object only, with no commentary.',
    ...shown,
  ].join('\n') + extra;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max);
}

/* ========================================================================== */
/* 13. Core engine                                                            */
/* ========================================================================== */

export interface AICoreEvent {
  type: 'attempt_failed' | 'success';
  task: TaskName;
  attempt: number;
  reason?: 'transport' | 'validation';
  issues?: readonly Issue[];
  error?: unknown;
}

export interface AICoreOptions {
  transport?: AITransport;
  /** Total attempts per call (transport retries and validation repairs share this budget). Default 4, range 1-6. */
  maxAttempts?: number;
  /** Per-attempt timeout in milliseconds. Default 60000. */
  requestTimeoutMs?: number;
  /** Backoff base in milliseconds. Default 500. */
  baseDelayMs?: number;
  /** Backoff ceiling in milliseconds. Default 8000. */
  maxDelayMs?: number;
  /** Optional telemetry hook. Errors thrown by the hook are ignored. */
  onEvent?: (event: AICoreEvent) => void;
}

export interface CallOptions {
  signal?: AbortSignal;
}

export interface AIResult<T> {
  data: T;
  meta: {
    task: TaskName;
    attempts: number;
    scriptVerified: boolean;
    warnings: string[];
  };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AIServiceError('ABORTED', 'The AI request was cancelled.'));
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(new AIServiceError('ABORTED', 'The AI request was cancelled.'));
    };
    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

const LANGUAGE_TAG_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

function normalizeLanguagePair<T extends LanguagePair>(input: T): T {
  const nativeLanguage = input.nativeLanguage.trim();
  const targetLanguage = input.targetLanguage.trim();
  if (!LANGUAGE_TAG_PATTERN.test(nativeLanguage)) {
    throw new AIServiceError('CONFIG', `Invalid nativeLanguage tag: "${input.nativeLanguage}".`);
  }
  if (!LANGUAGE_TAG_PATTERN.test(targetLanguage)) {
    throw new AIServiceError('CONFIG', `Invalid targetLanguage tag: "${input.targetLanguage}".`);
  }
  if (primaryLanguage(nativeLanguage) === primaryLanguage(targetLanguage)) {
    throw new AIServiceError('CONFIG', 'nativeLanguage and targetLanguage must be different languages.');
  }
  return { ...input, nativeLanguage, targetLanguage };
}

function assertLevel(level: string, field: string): asserts level is CefrLevel {
  if (!(CEFR_LEVELS as readonly string[]).includes(level)) {
    throw new AIServiceError('CONFIG', `${field} must be one of ${CEFR_LEVELS.join(', ')}.`);
  }
}

export function createAICore(options: AICoreOptions = {}) {
  const maxAttempts = Math.max(1, Math.min(6, Math.round(options.maxAttempts ?? 4)));
  const requestTimeoutMs = Math.max(1000, options.requestTimeoutMs ?? 60000);
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 500);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 8000);
  const transport: AITransport = options.transport ?? createFetchTransport(defaultEndpoint());

  const emit = (event: AICoreEvent): void => {
    if (!options.onEvent) return;
    try {
      options.onEvent(event);
    } catch {
      // Telemetry must never break the request.
    }
  };

  const backoffDelay = (attempt: number, error: unknown): number => {
    const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
    const jittered = exponential * (0.5 + Math.random() * 0.5);
    if (error instanceof TransportError && error.retryAfterMs !== undefined) {
      return Math.max(jittered, Math.min(error.retryAfterMs, 30000));
    }
    return jittered;
  };

  async function callTransport(
    task: TaskName,
    system: string,
    messages: ChatMessage[],
    maxTokens: number,
    callerSignal: AbortSignal | undefined,
  ): Promise<string> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, requestTimeoutMs);
    const onCallerAbort = (): void => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
    }
    try {
      return await transport({
        task,
        system,
        messages,
        temperature: AI_TEMPERATURE,
        maxTokens,
        signal: controller.signal,
      });
    } catch (error) {
      if (callerSignal?.aborted) throw new AIServiceError('ABORTED', 'The AI request was cancelled.');
      if (timedOut) {
        throw new TransportError(`AI request timed out after ${requestTimeoutMs} ms.`, {
          status: 0,
          retryable: true,
          timedOut: true,
          originalError: error,
        });
      }
      throw error;
    } finally {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', onCallerAbort);
    }
  }

  async function execute<TIn extends LanguagePair, TOut>(
    def: TaskDefinition<TIn, TOut>,
    input: TIn,
    callOptions: CallOptions | undefined,
  ): Promise<AIResult<TOut>> {
    const signal = callOptions?.signal;
    const system = buildSystemPrompt(def, input);
    const firstUser: ChatMessage = {
      role: 'user',
      content: JSON.stringify({ task: def.name, input: def.payload(input) }),
    };
    let messages: ChatMessage[] = [firstUser];
    let lastIssues: readonly Issue[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (signal?.aborted) throw new AIServiceError('ABORTED', 'The AI request was cancelled.', { attempts: attempt - 1 });

      let raw: string;
      try {
        raw = await callTransport(def.name, system, messages, def.maxTokens, signal);
      } catch (error) {
        if (error instanceof AIServiceError) throw error;
        const retryable = error instanceof TransportError && error.retryable;
        emit({ type: 'attempt_failed', task: def.name, attempt, reason: 'transport', error });
        if (!retryable || attempt === maxAttempts) {
          const timedOut = error instanceof TransportError && error.timedOut;
          throw new AIServiceError(
            timedOut ? 'TIMEOUT' : 'TRANSPORT',
            error instanceof Error ? error.message : 'The AI request failed.',
            { attempts: attempt, originalError: error },
          );
        }
        await sleep(backoffDelay(attempt, error), signal);
        continue;
      }

      const outcome = processRaw(def, input, raw);
      if (outcome.ok) {
        emit({ type: 'success', task: def.name, attempt });
        return {
          data: outcome.data,
          meta: { task: def.name, attempts: attempt, scriptVerified: outcome.scriptVerified, warnings: outcome.warnings },
        };
      }

      lastIssues = outcome.issues;
      emit({ type: 'attempt_failed', task: def.name, attempt, reason: 'validation', issues: outcome.issues });
      messages = [
        firstUser,
        { role: 'assistant', content: truncate(raw, 6000) },
        { role: 'user', content: buildRepairMessage(outcome.issues) },
      ];
    }

    throw new AIServiceError(
      'EXHAUSTED',
      `The AI response did not pass validation after ${maxAttempts} attempt(s): ${lastIssues
        .slice(0, 3)
        .map((i) => `${i.path}: ${i.message}`)
        .join(' | ')}`,
      { attempts: maxAttempts, issues: lastIssues },
    );
  }

  return {
    /** Builds a study profile from onboarding answers. */
    onboard(input: OnboardingInput, callOptions?: CallOptions): Promise<AIResult<OnboardingOutput>> {
      const prepared = normalizeLanguagePair(input);
      if (prepared.selfReportedLevel !== undefined) assertLevel(prepared.selfReportedLevel, 'selfReportedLevel');
      if (prepared.answers.length === 0) {
        throw new AIServiceError('CONFIG', 'onboard requires at least one answer.');
      }
      return execute(onboardingTask, prepared, callOptions);
    },

    /** Generates exactly one diagnostic exercise at the requested CEFR level. */
    generateDiagnosticQuestion(
      input: DiagnosticQuestionInput,
      callOptions?: CallOptions,
    ): Promise<AIResult<DiagnosticQuestionOutput>> {
      const prepared = normalizeLanguagePair(input);
      assertLevel(prepared.level, 'level');
      if (prepared.skill !== undefined && !LEVEL_PROFILES[prepared.level].allowedSkills.includes(prepared.skill)) {
        throw new AIServiceError('CONFIG', `Skill "${prepared.skill}" is not allowed at level ${prepared.level}.`);
      }
      return execute(diagnosticQuestionTask, prepared, callOptions);
    },

    /** Interprets diagnostic history. Level, next probe and stop decision are computed in code. */
    evaluateDiagnostic(
      input: DiagnosticEvaluationInput,
      callOptions?: CallOptions,
    ): Promise<AIResult<DiagnosticEvaluationOutput>> {
      const prepared = normalizeLanguagePair(input);
      if (prepared.history.length === 0) {
        throw new AIServiceError('CONFIG', 'evaluateDiagnostic requires at least one recorded answer.');
      }
      if (prepared.history.length > 60) {
        throw new AIServiceError('CONFIG', 'evaluateDiagnostic accepts at most 60 recorded answers.');
      }
      prepared.history.forEach((a) => assertLevel(a.cefr_level, 'history.cefr_level'));
      return execute(diagnosticEvaluationTask, prepared, callOptions);
    },

    /** Generates a unit/lesson tree tailored to intent, with spaced error recycling. */
    generatePathway(input: PathwayInput, callOptions?: CallOptions): Promise<AIResult<PathwayOutput>> {
      const prepared = normalizeLanguagePair(input);
      assertLevel(prepared.level, 'level');
      if (!(INTENTS as readonly string[]).includes(prepared.intent)) {
        throw new AIServiceError('CONFIG', `intent must be one of ${INTENTS.join(', ')}.`);
      }
      return execute(pathwayTask, prepared, callOptions);
    },

    /** One tutor turn: target-language reply, native gloss, corrections, one follow-up question. */
    tutorChat(input: TutorChatInput, callOptions?: CallOptions): Promise<AIResult<TutorChatOutput>> {
      const prepared = normalizeLanguagePair(input);
      assertLevel(prepared.level, 'level');
      if (prepared.learnerMessage.trim().length === 0) {
        throw new AIServiceError('CONFIG', 'learnerMessage must not be empty.');
      }
      return execute(tutorChatTask, prepared, callOptions);
    },
  };
}

export type AICore = ReturnType<typeof createAICore>;

function defaultEndpoint(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.VITE_AI_ENDPOINT ?? '/api/ai';
}

/** Shared application instance. Import this everywhere instead of calling any AI endpoint directly. */
export const aiCore: AICore = createAICore();
