/** Fluentic orchestration layer. No rendering, styles, or secrets live in this module. */
import type { UserProfile as LegacyProfile, LearningNode } from '../types';
import { getI18n } from './localization';
import { PlacementAssessmentEngine, type PlacementTestQuestion } from './placementTestService';
import { OmniAppEngineClient } from './omniEngineService';
import { fluenticLearning, fluenticVoice } from '../ai/client';
import { SAMPLE_CURRICULUM_NODES } from '../data/curriculum';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'evaluating';
export type AppMode = 'onboarding' | 'placement_test' | 'active_chat';
export type LearningIntent = 'travel' | 'business' | 'academic' | 'fluency';
export interface UserProfile {
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  intent: LearningIntent;
  currentCefr: CEFRLevel;
}
export interface UIStringDictionary {
  nav_home: string;
  nav_path: string;
  nav_grammar: string;
  nav_translator: string;
  nav_pro_studio: string;
  nav_ai_tutor: string;
  action_submit: string;
  action_continue: string;
  profile_placeholder: string;
  [key: string]: string;
}
export interface DiagnosticData {
  current_cefr: CEFRLevel;
  score_percentage: number;
  error_breakdown: string[];
  grammar_feedback: string;
  concept_tags: string[];
}
export interface AIResponsePayload {
  ui_translation: UIStringDictionary;
  app_mode: AppMode;
  diagnostic_data: DiagnosticData;
  ai_response: {
    text: string;
    audio_text: string;
    suggested_followups: string[];
    cultural_note?: string;
  };
}
export interface PlacementAnswer { questionId: number; selectedKey: string; }
export interface MasterPlacementQuestion {
  id: number;
  level: Exclude<CEFRLevel, 'evaluating'>;
  skill: string;
  instruction: string;
  prompt: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  audioText?: string;
}
export interface MasterPlacementSession { id: string; questions: MasterPlacementQuestion[]; answered: number; }
export interface MasterLearningUnit {
  level: Exclude<CEFRLevel, 'evaluating'>;
  nodes: Array<LearningNode & { unlocked: boolean; completed: boolean }>;
}
export interface MasterProgress { completedNodeIds: string[]; conceptAccuracy: Record<string, { correct: number; total: number }>; }
export interface MasterEngineOptions {
  onStateChange?: (state: AIResponsePayload, profile: UserProfile) => void;
  now?: () => number;
}

const CEFR: ReadonlyArray<Exclude<CEFRLevel, 'evaluating'>> = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MODES: ReadonlyArray<AppMode> = ['onboarding', 'placement_test', 'active_chat'];
const REQUIRED_UI = ['nav_home','nav_path','nav_grammar','nav_translator','nav_pro_studio','nav_ai_tutor','action_submit','action_continue','profile_placeholder'] as const;
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const normalizeCode = (code: string): string => code.trim().toLowerCase().replace(/_/g, '-').split('-')[0];
const inCefr = (v: unknown): v is CEFRLevel => typeof v === 'string' && (CEFR.includes(v as typeof CEFR[number]) || v === 'evaluating');
const ensure = (ok: boolean, message: string): void => { if (!ok) throw new Error(`Fluentic contract violation: ${message}`); };

/** Client-side structural validation; strict language/script screening is a separate step. */
export function validateAIResponse(input: unknown): AIResponsePayload {
  ensure(isObject(input), 'payload must be an object');
  const root = input as Record<string, unknown>;
  ensure(isObject(root.ui_translation), 'ui_translation must be an object');
  const ui = root.ui_translation as Record<string, unknown>;
  ensure(REQUIRED_UI.every((key) => isText(ui[key])), 'missing UI translation key');
  ensure(Object.values(ui).every((value) => typeof value === 'string'), 'UI values must be strings');
  ensure(MODES.includes(root.app_mode as AppMode), 'invalid app_mode');
  ensure(isObject(root.diagnostic_data), 'diagnostic_data must be an object');
  const diagnostic = root.diagnostic_data as Record<string, unknown>;
  ensure(inCefr(diagnostic.current_cefr), 'invalid CEFR');
  ensure(typeof diagnostic.score_percentage === 'number' && Number.isFinite(diagnostic.score_percentage) && diagnostic.score_percentage >= 0 && diagnostic.score_percentage <= 100, 'invalid score');
  ensure(isTextList(diagnostic.error_breakdown) && isTextList(diagnostic.concept_tags) && typeof diagnostic.grammar_feedback === 'string', 'invalid diagnostic details');
  ensure(isObject(root.ai_response), 'ai_response must be an object');
  const reply = root.ai_response as Record<string, unknown>;
  ensure(typeof reply.text === 'string' && typeof reply.audio_text === 'string' && isTextList(reply.suggested_followups), 'invalid tutor response');
  ensure(reply.cultural_note === undefined || typeof reply.cultural_note === 'string', 'invalid cultural note');
  return input as AIResponsePayload;
}

/** Checks writing system for languages with a distinctive mandatory script. */
const SCRIPT_RANGES: Readonly<Record<string, RegExp>> = {
  ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u,
  fa: /[\u0600-\u06FF\u0750-\u077F]/u,
  ur: /[\u0600-\u06FF\u0750-\u077F]/u,
  ru: /[\u0400-\u052F]/u,
  uk: /[\u0400-\u052F]/u,
  el: /[\u0370-\u03FF\u1F00-\u1FFF]/u,
  he: /[\u0590-\u05FF]/u,
  hi: /[\u0900-\u097F]/u,
  bn: /[\u0980-\u09FF]/u,
  th: /[\u0E00-\u0E7F]/u,
  ko: /[\uAC00-\uD7AF\u1100-\u11FF]/u,
  ja: /[\u3040-\u30FF\u3400-\u9FFF]/u,
  zh: /[\u3400-\u9FFF]/u,
};
const FOREIGN_LATIN = /[A-Za-z\u00C0-\u024F]/u;
const FOREIGN_SCRIPTS = /[\u0370-\u052F\u0590-\u06FF\u0750-\u077F\u08A0-\u08FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u;
const SCRIPT_GROUP: Readonly<Record<string, string>> = { ar: 'arabic', fa: 'arabic', ur: 'arabic', ru: 'cyrillic', uk: 'cyrillic', el: 'greek', he: 'hebrew', hi: 'devanagari', bn: 'bengali', th: 'thai', ko: 'korean', ja: 'japanese', zh: 'chinese' };
const DISALLOWED_SCRIPT: Readonly<Record<string, RegExp>> = {
  arabic: /[\u0370-\u052F\u0590-\u05FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  cyrillic: /[\u0370-\u03FF\u0590-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  greek: /[\u0400-\u052F\u0590-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  hebrew: /[\u0370-\u052F\u0600-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  devanagari: /[\u0370-\u06FF\u0980-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  bengali: /[\u0370-\u06FF\u0900-\u097F\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  thai: /[\u0370-\u06FF\u0900-\u09FF\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u,
  korean: /[\u0370-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF]/u,
  japanese: /[\u0370-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\uAC00-\uD7AF]/u,
  chinese: /[\u0370-\u06FF\u0900-\u09FF\u0E00-\u0E7F\u1100-\u11FF\u3040-\u30FF\uAC00-\uD7AF]/u,
};
export function enforceTargetScript(text: string, targetLanguage: string): string {
  const clean = text.normalize('NFC').trim();
  ensure(clean.length > 0 && clean.length <= 8000, 'invalid target utterance length');
  const code = normalizeCode(targetLanguage);
  const script = SCRIPT_RANGES[code];
  if (script) {
    ensure(script.test(clean), `target script missing for ${code}`);
    // Do not permit Latin phonetic/transliteration text in the audio utterance.
    ensure(!FOREIGN_LATIN.test(clean), `Latin transliteration detected in ${code} utterance`);
    ensure(!DISALLOWED_SCRIPT[SCRIPT_GROUP[code]].test(clean), `foreign script detected in ${code} utterance`);
  } else {
    ensure(!FOREIGN_SCRIPTS.test(clean), `non-Latin script detected in ${code} utterance`);
    ensure(FOREIGN_LATIN.test(clean), `Latin-script utterance missing for ${code}`);
  }
  return clean;
}

export function toMasterProfile(profile: LegacyProfile): UserProfile {
  const rawCefr = profile.activeCefr || profile.cefrLevel || 'evaluating';
  const rawIntent = profile.learningIntent;
  const intent: LearningIntent = rawIntent === 'travel' || rawIntent === 'business' || rawIntent === 'academic' ? rawIntent : 'fluency';
  return {
    name: profile.name || '',
    nativeLanguage: normalizeCode(profile.nativeLanguageCode || profile.nativeLanguage || 'en'),
    targetLanguage: normalizeCode(profile.activeLanguageCode || profile.targetLanguage || 'es'),
    intent,
    currentCefr: inCefr(rawCefr) ? rawCefr : 'evaluating',
  };
}
export function toLegacyProfile(profile: UserProfile, existing: LegacyProfile): LegacyProfile {
  return {
    ...existing,
    name: profile.name,
    nativeLanguageCode: profile.nativeLanguage,
    activeLanguageCode: profile.targetLanguage,
    learningIntent: profile.intent === 'fluency' ? 'conversational' : profile.intent,
    activeCefr: profile.currentCefr === 'evaluating' ? (existing.activeCefr || 'A1') : profile.currentCefr,
  };
}

function dictionary(code: string): UIStringDictionary {
  const t = getI18n(code);
  return {
    nav_home: t.navHome, nav_path: t.navPath, nav_grammar: t.navGrammar,
    nav_translator: t.navTranslator, nav_pro_studio: t.navPro,
    nav_ai_tutor: t.navAITutor, action_submit: t.confirm,
    action_continue: t.continue,
    profile_placeholder: normalizeCode(code) === 'ar' ? 'أدخل اسمك' : t.guestUser,
  };
}
function blankDiagnostic(level: CEFRLevel = 'evaluating'): DiagnosticData {
  return { current_cefr: level, score_percentage: 0, error_breakdown: [], grammar_feedback: '', concept_tags: [] };
}
function payload(mode: AppMode, profile: UserProfile, diagnostic: DiagnosticData, text = '', audioText = '', followups: string[] = [], note?: string): AIResponsePayload {
  return validateAIResponse({
    ui_translation: dictionary(profile.nativeLanguage), app_mode: mode, diagnostic_data: diagnostic,
    ai_response: { text, audio_text: audioText, suggested_followups: followups, ...(note ? { cultural_note: note } : {}) },
  });
}

/** Stateless helper: a formative diagnostic, not a certified CEFR examination. */
export function scorePlacement(questions: ReadonlyArray<PlacementTestQuestion>, answers: ReadonlyArray<PlacementAnswer>): DiagnosticData {
  ensure(questions.length > 0, 'placement requires questions');
  const ids = new Set(questions.map((q) => q.id));
  ensure(ids.size === questions.length, 'duplicate placement question IDs');
  const byId = new Map<number, string>();
  for (const answer of answers) {
    ensure(ids.has(answer.questionId) && !byId.has(answer.questionId), 'unknown or duplicate answer');
    ensure(/^[ABCD]$/.test(answer.selectedKey), 'invalid answer key');
    byId.set(answer.questionId, answer.selectedKey);
  }
  ensure(byId.size === questions.length, 'placement must be fully answered');
  const correct = questions.filter(q => byId.get(q.id) === q.correct_key);
  const wrong = questions.filter(q => byId.get(q.id) !== q.correct_key);
  const percent = Math.round(correct.length / questions.length * 100);
  // Highest tier with demonstrated accuracy and lower-tier evidence; conservative if tier coverage is sparse.
  let level: Exclude<CEFRLevel, 'evaluating'> = 'A1';
  for (const tier of CEFR.slice(1)) {
    const tierIdx = CEFR.indexOf(tier);
    const atOrBelow = questions.filter(q => CEFR.indexOf(q.level as typeof CEFR[number]) <= tierIdx);
    const atTier = questions.filter(q => q.level === tier);
    if (atTier.length < 2 || atOrBelow.length < 4) break;
    const lowerCorrect = atOrBelow.filter(q => byId.get(q.id) === q.correct_key).length;
    const tierCorrect = atTier.filter(q => byId.get(q.id) === q.correct_key).length;
    if (lowerCorrect / atOrBelow.length >= 0.75 && tierCorrect / atTier.length >= 0.6) level = tier;
    else break;
  }
  return {
    current_cefr: level, score_percentage: percent,
    error_breakdown: wrong.map(q => `${q.target_skill}: ${q.explanation || `Correct answer: ${q.correct_key}`}`),
    grammar_feedback: `${correct.length}/${questions.length} correct (${percent}%). Estimated level: ${level}; not a certified CEFR result.`,
    concept_tags: [...new Set(wrong.map(q => q.target_skill))],
  };
}

function questionForUI(question: PlacementTestQuestion): MasterPlacementQuestion {
  ensure(CEFR.includes(question.level as typeof CEFR[number]), 'unsupported placement CEFR question');
  ensure(question.options.length === 4 && new Set(question.options.map(o => o.key)).size === 4, 'placement must offer four distinct options');
  return {
    id: question.id,
    level: question.level as Exclude<CEFRLevel, 'evaluating'>,
    skill: question.target_skill,
    instruction: question.instruction || '', prompt: question.prompt || question.prompt_native || '',
    options: question.options.map(o => ({ key: o.key, text: o.text || o.text_native || '' })),
    ...(question.audioText ? { audioText: question.audioText } : {}),
  };
}

export class FluenticMasterEngine {
  private user: UserProfile;
  private state: AIResponsePayload;
  private session: { id: string; questions: PlacementTestQuestion[]; answers: Map<number, string> } | null = null;
  private progress: MasterProgress = { completedNodeIds: [], conceptAccuracy: {} };
  private readonly now: () => number;
  private readonly onStateChange?: MasterEngineOptions['onStateChange'];
  constructor(profile: UserProfile, options: MasterEngineOptions = {}) {
    ensure(isText(profile.nativeLanguage) && isText(profile.targetLanguage), 'language codes required');
    ensure(normalizeCode(profile.nativeLanguage) !== normalizeCode(profile.targetLanguage), 'native and target languages must differ');
    ensure(inCefr(profile.currentCefr), 'invalid initial CEFR');
    this.user = { ...profile, nativeLanguage: normalizeCode(profile.nativeLanguage), targetLanguage: normalizeCode(profile.targetLanguage) };
    this.now = options.now || Date.now;
    this.onStateChange = options.onStateChange;
    this.state = payload('onboarding', this.user, blankDiagnostic(this.user.currentCefr));
  }
  getProfile(): UserProfile { return { ...this.user }; }
  getState(): AIResponsePayload { return structuredClone(this.state); }
  getProgress(): MasterProgress { return structuredClone(this.progress); }
  private publish(next: AIResponsePayload): AIResponsePayload {
    this.state = validateAIResponse(next);
    this.onStateChange?.(this.getState(), this.getProfile());
    return this.getState();
  }
  onboard(changes: Partial<UserProfile>): AIResponsePayload {
    ensure(!changes.currentCefr || inCefr(changes.currentCefr), 'invalid CEFR');
    const newUser = { ...this.user, ...changes };
    ensure(isText(newUser.nativeLanguage) && isText(newUser.targetLanguage), 'language codes required');
    newUser.nativeLanguage = normalizeCode(newUser.nativeLanguage);
    newUser.targetLanguage = normalizeCode(newUser.targetLanguage);
    ensure(newUser.nativeLanguage !== newUser.targetLanguage, 'native and target languages must differ');
    if (newUser.targetLanguage !== this.user.targetLanguage) {
      newUser.currentCefr = 'evaluating'; this.session = null;
      this.progress = { completedNodeIds: [], conceptAccuracy: {} };
    }
    this.user = newUser;
    return this.publish(payload('onboarding', this.user, blankDiagnostic(this.user.currentCefr)));
  }
  beginPlacement(targetLanguageName: string, variant: 'A' | 'B' | 'C' | 'D' = 'A'): MasterPlacementSession {
    ensure(isText(targetLanguageName), 'target language name required');
    const questions = PlacementAssessmentEngine.getPlacementTest(this.user.targetLanguage, targetLanguageName, variant, this.user.nativeLanguage).questions;
    ensure(questions.length > 0, 'placement question bank is empty');
    const session = { id: `${this.now()}-${variant}-${this.user.targetLanguage}`, questions, answers: new Map<number, string>() };
    this.session = session;
    this.user.currentCefr = 'evaluating';
    this.publish(payload('placement_test', this.user, blankDiagnostic()));
    return { id: session.id, answered: 0, questions: questions.map(questionForUI) };
  }
  /** Adaptive presentation chooses an unanswered item nearest the next evidenced difficulty. */
  nextPlacementQuestion(sessionId: string): MasterPlacementQuestion | null {
    ensure(this.session !== null && this.session.id === sessionId, 'placement session expired');
    const session = this.session!;
    const seen = session.questions.filter(q => session.answers.has(q.id));
    const correct = seen.filter(q => session.answers.get(q.id) === q.correct_key).length;
    const ratio = seen.length ? correct / seen.length : 0.5;
    const lastTier = seen.length ? CEFR.indexOf(seen[seen.length - 1].level as typeof CEFR[number]) : 0;
    const idealTier = seen.length === 0 ? 0 : Math.max(0, Math.min(CEFR.length - 1, lastTier + (ratio >= 0.75 ? 1 : ratio < 0.4 ? -1 : 0)));
    const unseen = session.questions.filter(q => !session.answers.has(q.id));
    if (!unseen.length) return null;
    const next = [...unseen].sort((a, b) => Math.abs(CEFR.indexOf(a.level as typeof CEFR[number]) - idealTier) - Math.abs(CEFR.indexOf(b.level as typeof CEFR[number]) - idealTier))[0];
    return questionForUI(next);
  }
  answerPlacement(sessionId: string, answer: PlacementAnswer): { answered: number; total: number } {
    ensure(this.session !== null && this.session.id === sessionId, 'placement session expired');
    const session = this.session!;
    ensure(session.questions.some(q => q.id === answer.questionId), 'unknown question');
    ensure(!session.answers.has(answer.questionId), 'question already answered');
    ensure(/^[ABCD]$/.test(answer.selectedKey), 'invalid answer');
    session.answers.set(answer.questionId, answer.selectedKey);
    return { answered: session.answers.size, total: session.questions.length };
  }
  finishPlacement(sessionId: string): AIResponsePayload {
    ensure(this.session !== null && this.session.id === sessionId, 'placement session expired');
    const session = this.session!;
    const diagnostic = scorePlacement(session.questions, [...session.answers].map(([questionId, selectedKey]) => ({ questionId, selectedKey })));
    this.user.currentCefr = diagnostic.current_cefr;
    this.session = null;
    return this.publish(payload('placement_test', this.user, diagnostic, diagnostic.grammar_feedback));
  }
  getLearningPath(): MasterLearningUnit[] {
    const ceiling = Math.max(0, CEFR.indexOf(this.user.currentCefr as typeof CEFR[number]));
    const completed = new Set(this.progress.completedNodeIds);
    return CEFR.map((tier, i) => {
      const nodes = SAMPLE_CURRICULUM_NODES[tier] || [];
      return { level: tier, nodes: nodes.map((node, j) => ({
        ...node,
        completed: completed.has(node.id),
        unlocked: this.user.currentCefr !== 'evaluating' && i <= ceiling && (j === 0 || completed.has(nodes[j - 1].id)),
      })) };
    });
  }
  completeLesson(nodeId: string, results: Array<{ concept: string; correct: boolean }>): MasterProgress {
    const node = this.getLearningPath().flatMap(u => u.nodes).find(n => n.id === nodeId);
    ensure(Boolean(node?.unlocked), 'lesson is locked or unknown');
    ensure(results.length > 0, 'lesson must include scored work');
    ensure(results.every(result => isText(result.concept) && typeof result.correct === 'boolean'), 'invalid concept result');
    if (!this.progress.completedNodeIds.includes(nodeId)) this.progress.completedNodeIds.push(nodeId);
    for (const result of results) {
      const entry = this.progress.conceptAccuracy[result.concept] || { correct: 0, total: 0 };
      entry.total += 1; if (result.correct) entry.correct += 1;
      this.progress.conceptAccuracy[result.concept] = entry;
    }
    return this.getProgress();
  }
  async createAdaptiveLesson(minutesAvailable = 10): Promise<unknown> {
    ensure(this.user.currentCefr !== 'evaluating', 'placement required');
    ensure(Number.isFinite(minutesAvailable) && minutesAvailable >= 1 && minutesAvailable <= 120, 'invalid duration');
    const weaknesses = Object.entries(this.progress.conceptAccuracy)
      .filter(([, p]) => p.total > 0 && p.correct / p.total < 0.8).map(([tag]) => tag);
    const lesson = await fluenticLearning.createPersonalLesson({
      targetLanguage: this.user.targetLanguage, nativeLanguage: this.user.nativeLanguage,
      cefrLevel: this.user.currentCefr, learningIntent: this.user.intent === 'fluency' ? 'conversational' : this.user.intent,
      weaknesses, minutesAvailable,
    });
    ensure(isObject(lesson) && lesson.success === true, 'adaptive lesson service failed');
    return lesson;
  }
  async chat(message: string, history: Array<{ role: 'user' | 'tutor'; text: string }> = []): Promise<AIResponsePayload> {
    ensure(this.user.currentCefr !== 'evaluating', 'complete placement before tutoring');
    ensure(isText(message) && message.length <= 4000 && history.length <= 30, 'invalid tutoring input');
    const reply = await OmniAppEngineClient.executeActiveChat({
      userMessage: message, targetLanguage: this.user.targetLanguage,
      targetLanguageCode: this.user.targetLanguage, nativeLanguage: this.user.nativeLanguage,
      nativeLanguageCode: this.user.nativeLanguage, cefrLevel: this.user.currentCefr === 'evaluating' ? 'A1' : this.user.currentCefr,
      learningIntent: this.user.intent === 'fluency' ? 'conversational' : this.user.intent, history,
    });
    ensure(reply.status === 'success', 'AI tutor unavailable or response could not be verified');
    const rawUtterance = reply.tutor_turn.targetLanguageUtterance || reply.tutor_turn.audioReadyText;
    const pure = enforceTargetScript(rawUtterance, this.user.targetLanguage);
    const next = payload('active_chat', this.user, this.state.diagnostic_data,
      reply.tutor_turn.reply, pure, reply.tutor_turn.pedagogicalNextPrompts,
      reply.tutor_turn.idiomBreakdowns[0]?.pragmaticUsage);
    return this.publish(next);
  }
  async synthesizeTutorAudio(voiceName = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
    ensure(this.state.app_mode === 'active_chat', 'no active tutor utterance');
    const text = enforceTargetScript(this.state.ai_response.audio_text, this.user.targetLanguage);
    const result = await fluenticVoice.synthesize(text, this.user.targetLanguage, voiceName);
    ensure(isText(result.audioBase64) && isText(result.mimeType) && /^audio\//.test(result.mimeType), 'invalid TTS response');
    return { audioBase64: result.audioBase64, mimeType: result.mimeType };
  }
  async *streamTutorAudio(voiceName = 'Kore', signal?: AbortSignal): AsyncGenerator<import('../ai/client').FluenticVoiceStreamEvent> {
    ensure(this.state.app_mode === 'active_chat', 'no active tutor utterance');
    const text = enforceTargetScript(this.state.ai_response.audio_text, this.user.targetLanguage);
    yield* fluenticVoice.synthesizeStream(text, this.user.targetLanguage, voiceName, undefined, signal);
  }
}