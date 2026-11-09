import { configureLearner, recordRetrieval } from "../ai/master/learnerState.ts";
import { normalizeLearningIntent } from "../ai/pedagogy.ts";
import { fluenticBrain } from "./FluenticBrain.ts";
import { diagnose } from "../ai/master/diagnostic.ts";
import { installTranslations } from "./localization.ts";
import { apiFetch } from "./apiTransport.ts";
import { CefrLevel, Language, UserProfile } from '../types';
import { getI18n, TranslationDictionary } from './localization';
import { stripTransliteration } from './languageTypography';

export interface OnboardingParams {
  displayName?: string;
  nativeLanguageCode: string;
  targetLanguageCode: string;
  learningIntent?: 'business' | 'travel' | 'academic' | 'conversational' | 'culture';
}

export interface OnboardingResult {
  status: 'success' | 'fallback';
  mode: 'onboarding';
  user_profile: {
    displayName: string;
    nativeLanguageCode: string;
    targetLanguageCode: string;
    learningIntent: string;
    structuralMastery: number;
    activeRecallRetentionRate: number;
    spacedErrorRecyclingCount: number;
    currentCefr: CefrLevel;
  };
  ui_translation: TranslationDictionary;
  pedagogical_trajectory: {
    primaryFocus: string;
    milestones: string[];
    rationale: string;
  };
}

export interface PlacementTestGenerateParams {
  targetLanguage: string;
  targetLanguageCode: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  variant?: 'A' | 'B' | 'C' | 'D';
}

export interface PlacementQuestion {
  id: number;
  level: CefrLevel;
  target_skill: string;
  instruction: string;
  prompt: string;
  options: Array<{ key: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correct_key: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  audioText?: string;
}

export interface DiagnosticData {
  assessedLevel: CefrLevel;
  calibratedScore: number;
  totalEvaluated: number;
  structuralMasteryPercentage: number;
  activeRecallRetentionRate: number;
  spacedErrorRecycling: {
    recycledErrorCount: number;
    flaggedConcepts: string[];
  };
  conceptMapping: Array<{
    concept: string;
    status: 'mastered' | 'needs_review' | 'emerging';
    tier: string;
  }>;
  realtimeGrammarFeedback: string;
  errorBreakdowns: Array<{
    questionId: number;
    userChoice?: string;
    correctKey: string;
    errorSnippet?: string;
    grammaticalCorrection?: string;
    linguisticReason: string;
  }>;
}

export interface ActiveChatParams {
  userMessage: string;
  targetLanguage: string;
  targetLanguageCode: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  cefrLevel: CefrLevel;
  learningIntent?: string;
  history?: Array<{ role: 'user' | 'tutor'; text: string }>;
}

export interface ActiveChatResult {
  status: 'success' | 'guarded' | 'fallback';
  mode: 'active_chat';
  guardrailAlert?: string;
  tutor_turn: {
    reply: string;
    targetLanguageUtterance?: string;
    audioReadyText: string;
    translation?: string;
    contextualCorrections: Array<{
      originalSnippet: string;
      correctedSnippet: string;
      grammaticalRule: string;
      severity: 'minor' | 'critical';
    }>;
    idiomBreakdowns: Array<{
      idiom: string;
      literalMeaning: string;
      pragmaticUsage: string;
    }>;
    registerNotes: {
      detectedRegister: 'colloquial' | 'neutral' | 'formal' | 'academic';
      appropriateForContext: boolean;
      recommendation: string;
    };
    pedagogicalNextPrompts: string[];
  };
}

export class OmniAppEngineClient {
  static async executeOnboarding(params: OnboardingParams): Promise<OnboardingResult> {
    const result = await fluenticBrain.processOnboarding({ displayName: params.displayName || 'Learner', nativeLanguageCode: params.nativeLanguageCode, targetLanguageCode: params.targetLanguageCode, learningIntent: params.learningIntent || 'conversational' }) as unknown as OnboardingResult;
    installTranslations(params.nativeLanguageCode, result.ui_translation);
    configureLearner({mode:"placement_test",nativeLanguageCode:params.nativeLanguageCode,targetLanguageCode:params.targetLanguageCode,intent:normalizeLearningIntent(params.learningIntent)});
    return result;
  }
  static async evaluatePlacementDiagnostic(params: {
    targetLanguage: string; targetLanguageCode: string; nativeLanguage: string; nativeLanguageCode: string;
    userAnswers: Array<{ questionId: number; selectedKey: string; correctKey: string; level: CefrLevel; targetSkill: string }>;
  }): Promise<DiagnosticData> {
    try {
      const result = await fluenticBrain.runDiagnosticTest({ nativeLanguageCode: params.nativeLanguageCode, targetLanguageCode: params.targetLanguageCode, cefrLevel: 'A1', learningIntent: 'conversational', action: 'evaluate' }, params.userAnswers) as unknown as { diagnostic_data: DiagnosticData };
      for (const answer of params.userAnswers) recordRetrieval(answer.targetSkill, answer.selectedKey === answer.correctKey);
      configureLearner({mode:"active_chat",level:result.diagnostic_data.assessedLevel as "A1"|"A2"|"B1"|"B2"|"C1"|"C2"});
      return result.diagnostic_data;
    } catch { return diagnose(params.userAnswers); }
  }
  static executeActiveChat(params: ActiveChatParams): Promise<ActiveChatResult> {
    return fluenticBrain.generateTutorResponse(params.history || [], params.userMessage, { nativeLanguageCode: params.nativeLanguageCode, targetLanguageCode: params.targetLanguageCode, cefrLevel: params.cefrLevel as 'A1'|'A2'|'B1'|'B2'|'C1'|'C2', learningIntent: params.learningIntent || 'conversational' }) as unknown as Promise<ActiveChatResult>;
  }
}
