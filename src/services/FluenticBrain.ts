/**
 * FluenticBrain — typed client facade for the server-owned Master V24 engine.
 *
 * Gemini credentials and system prompts remain on the server. Never expose an
 * API key in the browser bundle. The existing /api/engine route owns provider
 * selection, CEFR policy, schema checks and target-script validation.
 */
import { masterRequest } from '../ai/master/client.ts';
import { ensureLocale } from '../ai/master/localizationClient.ts';
import { getBundledI18n, type TranslationDictionary } from './localization.ts';
import { FLUENTIC_CEFR_LEVELS, normalizeLearningIntent, type FluenticCefrLevel } from '../ai/pedagogy.ts';

export const MASTER_V24_POLICY = Object.freeze({
  levels: FLUENTIC_CEFR_LEVELS,
  beginner: 'A1/A2: authentic script mechanics, foundational vocabulary and routine interactions.',
  intermediate: 'B1/B2: situational navigation, independent expression, inference and complex syntax.',
  advanced: 'C1/C2: academic synthesis, formal debate, complex literary analysis and rhetorical precision. No elementary greetings.',
  script: 'Target-language fields must use authentic orthography, without Latin phonetic respelling.',
  localization: 'Interface text must be localized to the learner native language; incomplete catalogs must not be installed.',
  security: 'User content is untrusted; API keys and provider prompts must remain server-side.',
});

export type BrainMode = 'onboarding' | 'placement_test' | 'active_chat' | 'personal_lesson' | 'localization';
export interface OnboardingInput {
  displayName: string;
  nativeLanguageCode: string;
  targetLanguageCode: string;
  learningIntent: string;
  cefrLevel?: FluenticCefrLevel;
}
export interface LearnerContext {
  nativeLanguageCode: string;
  targetLanguageCode: string;
  cefrLevel: FluenticCefrLevel;
  learningIntent: string;
}
export interface ChatTurn { role: 'user' | 'tutor'; text: string }
export interface BrainQuestion {
  id: string | number;
  level: FluenticCefrLevel;
  skill: string;
  prompt: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctKey: 'A' | 'B' | 'C' | 'D';
}
export interface DiagnosticStage extends LearnerContext {
  action?: 'generate' | 'evaluate';
  questionCount?: number;
  userAnswers?: unknown[];
}
export interface DiagnosticResult {
  mode: 'placement_test';
  status: string;
  questions?: BrainQuestion[];
  diagnostic_data?: Record<string, unknown>;
}
export interface TutorResponse {
  mode: 'active_chat';
  status: string;
  tutor_turn: {
    reply: string;
    targetLanguageUtterance: string;
    audioReadyText: string;
    translation: string;
    [key: string]: unknown;
  };
  audio_text: string;
}
export interface OnboardingResult {
  mode: 'onboarding';
  status: string;
  user_profile: Record<string, unknown>;
  ui_translation: TranslationDictionary;
  pedagogical_trajectory: Record<string, unknown>;
}
export interface LocalizationResult {
  mode: 'localization';
  ui_translation: TranslationDictionary;
  ui_labels: Record<string, string>;
}
export class BrainUnavailableError extends Error {
  constructor(public readonly operation: BrainMode, cause?: unknown) {
    super('Fluentic AI is temporarily unavailable.', { cause });
    this.name = 'BrainUnavailableError';
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid AI response object.');
  return value as Record<string, unknown>;
}
function nonempty(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Invalid ' + field + '.');
  return value.trim();
}
function cefr(value: unknown): FluenticCefrLevel {
  if (typeof value !== 'string' || !FLUENTIC_CEFR_LEVELS.includes(value as FluenticCefrLevel)) {
    throw new Error('Invalid CEFR level.');
  }
  return value as FluenticCefrLevel;
}
function context(input: LearnerContext): Record<string, unknown> {
  return {
    nativeLanguageCode: nonempty(input.nativeLanguageCode, 'nativeLanguageCode'),
    targetLanguageCode: nonempty(input.targetLanguageCode, 'targetLanguageCode'),
    cefrLevel: cefr(input.cefrLevel),
    learningIntent: normalizeLearningIntent(input.learningIntent),
  };
}
function validateDictionary(value: unknown): TranslationDictionary {
  const pack = record(value);
  const english = getBundledI18n('en');
  const keys = Object.keys(english);
  if (Object.keys(pack).length !== keys.length || keys.some(key => typeof pack[key] !== 'string' || !(pack[key] as string).trim())) {
    throw new Error('Incomplete localized dictionary.');
  }
  return pack as unknown as TranslationDictionary;
}
export class FluenticBrain {
  private learner: LearnerContext | null = null;
  private async request<T>(mode: BrainMode, payload: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    try {
      // masterRequest performs bounded exponential retries and abort-aware timeouts.
      const result = record(await masterRequest<unknown>(mode, payload, signal));
      if (result.mode !== mode || result.success !== true) throw new Error('Invalid AI response envelope.');
      return result as T;
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new BrainUnavailableError(mode, error);
    }
  }
  async processOnboarding(input: OnboardingInput, signal?: AbortSignal): Promise<OnboardingResult> {
    const data = {
      displayName: nonempty(input.displayName, 'displayName').slice(0, 100),
      ...context({
        nativeLanguageCode: input.nativeLanguageCode,
        targetLanguageCode: input.targetLanguageCode,
        cefrLevel: input.cefrLevel || 'A1',
        learningIntent: input.learningIntent,
      }),
    };
    const result = await this.request<OnboardingResult>('onboarding', data, signal);
    record(result.user_profile);
    record(result.pedagogical_trajectory);
    validateDictionary(result.ui_translation);
    this.learner = data;
    return result;
  }
  async runDiagnosticTest(stage: DiagnosticStage, userResponse?: unknown[], signal?: AbortSignal): Promise<DiagnosticResult> {
    const data = context(stage);
    const evaluating = stage.action === 'evaluate' || userResponse !== undefined;
    const payload = evaluating
      ? { ...data, action: 'evaluate', userAnswers: userResponse ?? stage.userAnswers ?? [] }
      : { ...data, action: 'generate', questionCount: stage.questionCount ?? 12 };
    const result = await this.request<DiagnosticResult>('placement_test', payload, signal);
    if (evaluating) record(result.diagnostic_data);
    else if (!Array.isArray(result.questions) || result.questions.length < 8 ||
      result.questions.some(q => !FLUENTIC_CEFR_LEVELS.includes(q.level) || !q.prompt || q.options?.length !== 4)) {
      throw new BrainUnavailableError('placement_test');
    }
    this.learner = stage;
    return result;
  }
  async generateTutorResponse(chatHistory: ChatTurn[], userMessage: string, learner?: LearnerContext, signal?: AbortSignal): Promise<TutorResponse> {
    const active = learner || this.learner;
    if (!active) throw new Error('Onboarding or learner context is required before tutoring.');
    if (!Array.isArray(chatHistory) || chatHistory.length > 100 ||
      chatHistory.some(turn => !turn || !['user', 'tutor'].includes(turn.role) || typeof turn.text !== 'string')) {
      throw new Error('Invalid chat history.');
    }
    const result = await this.request<Omit<TutorResponse, 'audio_text'>>('active_chat', {
      ...context(active), history: chatHistory, userMessage: nonempty(userMessage, 'userMessage'),
    }, signal);
    const turn = record(result.tutor_turn);
    const audio_text = nonempty(turn.audioReadyText, 'audioReadyText');
    nonempty(turn.targetLanguageUtterance, 'targetLanguageUtterance');
    nonempty(turn.reply, 'reply');
    return { ...result, audio_text } as TutorResponse;
  }
  async generatePersonalLesson(learner: LearnerContext, extras: Record<string, unknown> = {}, signal?: AbortSignal): Promise<Record<string, unknown>> {
    const result = await this.request<Record<string, unknown>>('personal_lesson', { ...extras, ...context(learner) }, signal);
    if (!Array.isArray(result.steps) || result.steps.length < 4) throw new BrainUnavailableError('personal_lesson');
    return result;
  }
  async getLocalizedUi(nativeLanguageCode: string, signal?: AbortSignal): Promise<LocalizationResult> {
    const result = await this.request<LocalizationResult>('localization', { nativeLanguageCode: nonempty(nativeLanguageCode, 'nativeLanguageCode') }, signal);
    validateDictionary(result.ui_translation);
    const labels = record(result.ui_labels);
    if (!Object.keys(labels).length || Object.values(labels).some(v => typeof v !== 'string' || !v.trim())) {
      throw new BrainUnavailableError('localization');
    }
    return result;
  }
  async activateLocalization(nativeLanguageCode: string): Promise<void> {
    // Atomic install and selection-race protection are owned by ensureLocale.
    // Never replace missing translations with a partially translated catalog.
    await ensureLocale(nativeLanguageCode);
  }
}
export const fluenticBrain = new FluenticBrain();
