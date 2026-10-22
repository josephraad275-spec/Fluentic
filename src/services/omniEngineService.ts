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
  /**
   * MODE 1: ONBOARDING (`onboarding`)
   * Collects setup parameters, defaults Display Name to 'Enter your name' ('أدخل اسمك' in Arabic locale),
   * and adapts 100% of UI string translations.
   */
  public static async executeOnboarding(params: OnboardingParams): Promise<OnboardingResult> {
    const isArabic = params.nativeLanguageCode.toLowerCase() === 'ar';
    const fallbackDisplayName = isArabic ? 'أدخل اسمك' : 'Enter your name';
    const finalDisplayName = (params.displayName && params.displayName.trim().length > 0)
      ? params.displayName.trim()
      : fallbackDisplayName;

    const localI18n = getI18n(params.nativeLanguageCode);

    try {
      const response = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'onboarding',
          payload: {
            displayName: finalDisplayName,
            nativeLanguageCode: params.nativeLanguageCode,
            targetLanguageCode: params.targetLanguageCode,
            learningIntent: params.learningIntent || 'conversational',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.mode === 'onboarding' && data.ui_translation) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[Omni-Engine Onboarding Notice] Server synthesis unreachable, utilizing local pedagogical engine:', e);
    }

    // Procedural Fallback adhering 1000% to V24 directives
    return {
      status: 'fallback',
      mode: 'onboarding',
      user_profile: {
        displayName: finalDisplayName,
        nativeLanguageCode: params.nativeLanguageCode,
        targetLanguageCode: params.targetLanguageCode,
        learningIntent: params.learningIntent || 'conversational',
        structuralMastery: 0,
        activeRecallRetentionRate: 100,
        spacedErrorRecyclingCount: 0,
        currentCefr: 'A1',
      },
      ui_translation: localI18n,
      pedagogical_trajectory: {
        primaryFocus: isArabic ? 'تأسيس مخارج الحروف وبناء النحو الهيكلي' : 'Foundational script mechanics & structural syntax',
        milestones: [
          isArabic ? 'إتقان أصوات ونطق الحروف الأصيلة (A1)' : 'Authentic phonics & script mechanics (A1)',
          isArabic ? 'التراكيب المترابطة والوصل النحوي (B1)' : 'Subordinate conjunctions & situational syntax (B1)',
          isArabic ? 'الخطاب الأكاديمي والتحليل البلاغي (C1/C2)' : 'Advanced academic discourse & rhetorical analysis (C1/C2)'
        ],
        rationale: isArabic
          ? 'مسار لغوي نقي يقيس التقدم بالإتقان الهيكلي والاستدعاء الذهني دون أي نقاط عشوائية.'
          : 'Linguistic scaffolding calibrated to cognitive retention, active recall, and zero arcade gamification.',
      },
    };
  }

  /**
   * MODE 2: DIAGNOSTIC PLACEMENT TESTING (`placement_test`)
   * Evaluates structural grammar, vocabulary depth, reading comprehension, and listening/phonetic awareness.
   * Generates diagnostic_data with real-time grammar feedback, error breakdowns, and concept mapping.
   */
  public static async evaluatePlacementDiagnostic(params: {
    targetLanguage: string;
    targetLanguageCode: string;
    nativeLanguage: string;
    nativeLanguageCode: string;
    userAnswers: Array<{ questionId: number; selectedKey: string; correctKey: string; level: CefrLevel; targetSkill: string }>;
  }): Promise<DiagnosticData> {
    const isArabic = params.nativeLanguageCode.toLowerCase() === 'ar';
    const isDutch = params.nativeLanguageCode.toLowerCase() === 'nl';

    try {
      const response = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'placement_test',
          payload: {
            action: 'evaluate',
            targetLanguage: params.targetLanguage,
            targetLanguageCode: params.targetLanguageCode,
            nativeLanguage: params.nativeLanguage,
            nativeLanguageCode: params.nativeLanguageCode,
            userAnswers: params.userAnswers,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.diagnostic_data) {
          return data.diagnostic_data;
        }
      }
    } catch (e) {
      console.warn('[Omni-Engine Diagnostic Notice] Utilizing local diagnostic matrix:', e);
    }

    // Procedural Fallback calculation
    const total = params.userAnswers.length || 10;
    const correctCount = params.userAnswers.filter((a) => a.selectedKey === a.correctKey).length;
    const accuracyPct = Math.round((correctCount / total) * 100);

    let assessedLevel: CefrLevel = 'A1';
    if (correctCount >= 9) assessedLevel = 'C2';
    else if (correctCount >= 7) assessedLevel = 'C1';
    else if (correctCount >= 5) assessedLevel = 'B2';
    else if (correctCount >= 3) assessedLevel = 'B1';
    else if (correctCount >= 2) assessedLevel = 'A2';

    const errors = params.userAnswers.filter((a) => a.selectedKey !== a.correctKey);

    return {
      assessedLevel,
      calibratedScore: correctCount,
      totalEvaluated: total,
      structuralMasteryPercentage: accuracyPct,
      activeRecallRetentionRate: Math.max(60, accuracyPct),
      spacedErrorRecycling: {
        recycledErrorCount: errors.length,
        flaggedConcepts: errors.map((e) => e.targetSkill),
      },
      conceptMapping: [
        { concept: isArabic ? 'مخارج الحروف والتطابق الصوتي' : 'Phonemic Orthography', status: correctCount >= 2 ? 'mastered' : 'emerging', tier: 'A1' },
        { concept: isArabic ? 'الربط النحوي والتراكيب الظرفية' : 'Subordinate Conjunctions', status: correctCount >= 5 ? 'mastered' : 'needs_review', tier: 'B1' },
        { concept: isArabic ? 'التحليل البلاغي والخطاب الرفيع' : 'Academic Rhetoric & Register', status: correctCount >= 8 ? 'mastered' : 'needs_review', tier: 'C1' },
      ],
      realtimeGrammarFeedback: isArabic
        ? `أظهرت دقة بنسبة ${accuracyPct}% عبر المعايير الأوروبية CEFR. تم تعيين المستوى: ${assessedLevel}.`
        : isDutch
        ? `Je behaalde ${accuracyPct}% nauwkeurigheid op de ERK-standaard. Gekwalificeerd niveau: ${assessedLevel}.`
        : `Demonstrated ${accuracyPct}% accuracy across standardized CEFR benchmarks. Verified Level: ${assessedLevel}.`,
      errorBreakdowns: errors.map((err) => ({
        questionId: err.questionId,
        userChoice: err.selectedKey,
        correctKey: err.correctKey,
        linguisticReason: isArabic
          ? `الخيار ${err.correctKey} يمثل التركيب الصحيح لمهارة: ${err.targetSkill}.`
          : `Choice ${err.correctKey} represents the structurally accurate formulation for: ${err.targetSkill}.`,
      })),
    };
  }

  /**
   * MODE 3: ACTIVE TUTORING & CHAT (`active_chat`)
   * Calibrated polyglot tutor with contextual corrections, idiom breakdowns, register notes, and audio-ready text.
   */
  public static async executeActiveChat(params: ActiveChatParams): Promise<ActiveChatResult> {
    const isArabic = params.nativeLanguageCode.toLowerCase() === 'ar';

    try {
      const response = await fetch('/api/engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'active_chat',
          payload: {
            userMessage: params.userMessage,
            targetLanguage: params.targetLanguage,
            targetLanguageCode: params.targetLanguageCode,
            nativeLanguage: params.nativeLanguage,
            nativeLanguageCode: params.nativeLanguageCode,
            cefrLevel: params.cefrLevel,
            learningIntent: params.learningIntent || 'conversational',
            history: params.history || [],
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && (data.mode === 'active_chat' || data.tutor_turn)) {
          return data;
        }
      }
    } catch (e) {
      console.warn('[Omni-Engine Chat Notice] Calling direct fallback tutor:', e);
    }

    // Procedural Fallback adhering to Target Script Purity & zero Latin transliterations
    const cleanSample = stripTransliteration(params.userMessage || '');
    return {
      status: 'fallback',
      mode: 'active_chat',
      tutor_turn: {
        reply: isArabic
          ? `ممتاز! في مستوى ${params.cefrLevel} لتعلم ${params.targetLanguage}، يعتمد الإتقان على التكرار المتباعد وفهم بنية الجملة.`
          : `Excellent practice! At CEFR ${params.cefrLevel} for ${params.targetLanguage}, structural fluency relies on active recall and morphological precision.`,
        targetLanguageUtterance: cleanSample,
        audioReadyText: cleanSample,
        translation: isArabic ? 'تعبير تواصلي مباشر' : 'Natural communicative phrasing',
        contextualCorrections: [],
        idiomBreakdowns: [],
        registerNotes: {
          detectedRegister: 'neutral',
          appropriateForContext: true,
          recommendation: isArabic ? 'أسلوب طبيعي ومناسب للمحادثات اليومية.' : 'Natural register appropriate for standard conversation.',
        },
        pedagogicalNextPrompts: [
          isArabic ? 'كيف أصيغ هذا التعبير بأسلوب رسمي؟' : 'How would a native speaker rephrase this formally?',
          isArabic ? 'أعطني مثلاً شائعاً مرتبطاً بهذا السياق' : 'Teach me an idiomatic expression in this context',
        ],
      },
    };
  }
}
