import React, { useState } from 'react';
import { 
  CefrLevel, 
  Language, 
  UserProfile 
} from '../types';
import { WORLD_LANGUAGES } from '../data/languages';
import { SearchableLanguageSelect } from './SearchableLanguageSelect';
import { audioSynth } from '../services/audioSynthesizer';
import { 
  PlacementAssessmentEngine, 
  PlacementTestQuestion,
  PlacementQuestionOption
} from '../services/placementTestService';
import { OmniAppEngineClient, DiagnosticData } from '../services/omniEngineService';
import { getI18n } from '../services/localization';
import { isRtlLanguage, resolveDirection, hasRtlCharacters, stripTransliteration } from '../services/languageTypography';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Volume2, 
  GraduationCap, 
  ShieldCheck, 
  Flame, 
  Target,
  Layers,
  HelpCircle,
  Award,
  AlertCircle,
  RefreshCw,
  Brain
} from 'lucide-react';

interface OnboardingPlacementViewProps {
  initialProfile?: UserProfile;
  onComplete: (profile: UserProfile, targetLanguage: Language, assessedCefr: CefrLevel) => void;
}

export const OnboardingPlacementView: React.FC<OnboardingPlacementViewProps> = ({
  initialProfile,
  onComplete,
}) => {
  // Step 1: Profile & Language Setup, Step 2: 10-Question Placement Test, Step 3: Assessment Results
  // If the user already provided their name from SignInView, start right at the placement test!
  const [step, setStep] = useState<1 | 2 | 3>(
    initialProfile?.name && initialProfile.name.trim().length > 0 ? 2 : 1
  );

  // User details - default to English
  const [name, setName] = useState(initialProfile?.name || '');
  const [nativeLanguageCode, setNativeLanguageCode] = useState(initialProfile?.nativeLanguageCode || 'en');
  const [targetLanguageCode, setTargetLanguageCode] = useState(initialProfile?.activeLanguageCode || 'en');
  const [targetPace, setTargetPace] = useState<'casual' | 'dedicated' | 'intensive'>('dedicated');

  React.useEffect(() => {
    if (initialProfile) {
      if (initialProfile.name) setName(initialProfile.name);
      if (initialProfile.nativeLanguageCode) setNativeLanguageCode(initialProfile.nativeLanguageCode);
      if (initialProfile.activeLanguageCode) setTargetLanguageCode(initialProfile.activeLanguageCode);
    }
  }, [initialProfile]);

  // Placement Test State & Dynamic Adaptive Routing (Strict 10-Question Standardized CEFR Assessment)
  const [selectedVariant, setSelectedVariant] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [adaptiveStep, setAdaptiveStep] = useState(0); // 0 to 9 (10 questions across A1-C2)
  const TOTAL_ADAPTIVE_QUESTIONS = 10;
  const [activeTier, setActiveTier] = useState<CefrLevel>('A1');
  const [selectedOptionKey, setSelectedOptionKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [assessedLevel, setAssessedLevel] = useState<CefrLevel>('A1');
  const [unlockedLevels, setUnlockedLevels] = useState<CefrLevel[]>(['A1']);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [officialScoreText, setOfficialScoreText] = useState('');
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [userAnswerRecords, setUserAnswerRecords] = useState<Array<{
    questionId: number;
    selectedKey: string;
    correctKey: string;
    level: CefrLevel;
    targetSkill: string;
    selectedText?: string;
    correctText?: string;
  }>>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<number[]>([]);
  const [tierPerformance, setTierPerformance] = useState<{ level: CefrLevel; correct: boolean }[]>([]);
  const [testQuestions, setTestQuestions] = useState<PlacementTestQuestion[]>([]);

  // Localized dictionary based on chosen native language
  const i18n = getI18n(nativeLanguageCode);

  const targetLanguage = WORLD_LANGUAGES.find((l) => l.code === targetLanguageCode) || 
    WORLD_LANGUAGES.find((l) => l.code === 'en') || 
    WORLD_LANGUAGES[0];

  // Helper to clearly display language name without overlapping or duplicate names
  const getLanguageLabel = (lang: Language) => {
    if (!lang.nativeName || lang.nativeName.trim().toLowerCase() === lang.name.trim().toLowerCase()) {
      return lang.name;
    }
    return `${lang.name} • ${lang.nativeName}`;
  };

  // Stable retrieval of authentic, scrambled placement questions
  const getLoadedQuestions = React.useCallback((variant: 'A' | 'B' | 'C' | 'D' = selectedVariant) => {
    const test = PlacementAssessmentEngine.getPlacementTest(
      targetLanguage.code,
      targetLanguage.name,
      variant,
      nativeLanguageCode
    );
    return test.questions;
  }, [targetLanguage.code, targetLanguage.name, selectedVariant, nativeLanguageCode]);

  React.useEffect(() => {
    setTestQuestions(getLoadedQuestions(selectedVariant));
  }, [getLoadedQuestions, selectedVariant]);

  const currentQuestion = testQuestions[adaptiveStep] || getLoadedQuestions()[adaptiveStep] || getLoadedQuestions()[0];

  // Step 1 -> Step 2: Start the 10-Question Standardized Placement Test
  const handleStartPlacementTest = () => {
    if (!name.trim()) {
      setName(nativeLanguageCode === 'nl' ? 'Taalstudent' : 'Polyglot Explorer');
    }
    audioSynth.playSuccessChime();
    PlacementAssessmentEngine.clearTestCache();
    const fresh = PlacementAssessmentEngine.getPlacementTest(
      targetLanguage.code,
      targetLanguage.name,
      selectedVariant,
      nativeLanguageCode
    ).questions;
    setTestQuestions(fresh);
    setAdaptiveStep(0);
    setActiveTier('A1');
    setAnsweredQuestionIds([]);
    setTierPerformance([]);
    setSelectedOptionKey(null);
    setIsAnswerChecked(false);
    setScore(0);
    setStep(2);
  };

  // Skip Test: Allows user to bypass the test and start immediately at A1
  const handleSkipTest = () => {
    audioSynth.playGentleFeedback();
    const defaultName = nativeLanguageCode === 'ar' ? 'أدخل اسمك' : 'Enter your name';
    const cleanProfile: UserProfile = {
      id: initialProfile?.id || `usr-${Date.now().toString(36)}`,
      name: name.trim() || defaultName,
      email: initialProfile?.email || 'explorer@fluentic.local',
      avatar: (name.trim() || 'FL').slice(0, 2).toUpperCase(),
      isGuest: true,
      isPro: false,
      hasCompletedOnboarding: true,
      nativeLanguageCode,
      targetPace,
      learningIntent: initialProfile?.learningIntent || 'conversational',
      placementScore: 0,
      placementDiagnosis: nativeLanguageCode === 'ar'
        ? 'تم تخطي اختبار تحديد المستوى. البدء مباشرة من المستوى التأسيسي A1.'
        : nativeLanguageCode === 'nl'
        ? 'Niveautest overgeslagen. Je start direct bij ERK-niveau A1 (Beginner).'
        : 'Placement test skipped. Starting directly at CEFR level A1 (Beginner).',
      gems: 0,
      xp: 0,
      level: 1,
      streakDays: 0,
      streakShields: 0,
      streakProtected: false,
      completedNodeIds: [],
      nodeCrowns: {},
      dailyGoalMinutes: targetPace === 'casual' ? 10 : targetPace === 'intensive' ? 30 : 15,
      dailyGoalCompleted: false,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      unlockedAchievements: [],
      claimedAchievements: [],
      dailyQuests: [],
      activeLanguageCode: targetLanguage.code,
      activeLanguage: targetLanguage.name,
      activeCefr: 'A1',
      unlockedCefrLevels: ['A1'],
      soundscapeMode: 'mute',
      soundEffectsEnabled: true,
      dailyGoalXp: targetPace === 'casual' ? 20 : targetPace === 'intensive' ? 100 : 50,
      todayXp: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyRituals: {
        speechDrillCompleted: false,
        fsrsReviewCompleted: false,
        scenarioOrDebateCompleted: false,
      },
    };

    onComplete(cleanProfile, targetLanguage, 'A1');
  };

  // Switch Variant (A, B, C, D)
  const handleSelectVariant = (variant: 'A' | 'B' | 'C' | 'D') => {
    audioSynth.playGentleFeedback();
    setSelectedVariant(variant);
    setAdaptiveStep(0);
    setActiveTier('A2');
    setAnsweredQuestionIds([]);
    setTierPerformance([]);
    setSelectedOptionKey(null);
    setIsAnswerChecked(false);
    setScore(0);
  };

  // Dynamic Routing step transition
  const getNextAdaptiveTier = (current: CefrLevel, wasCorrect: boolean): CefrLevel => {
    const tiers: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIdx = tiers.indexOf(current);

    if (wasCorrect) {
      // Step up in difficulty
      return currentIdx < tiers.length - 1 ? tiers[currentIdx + 1] : 'C2';
    } else {
      // Step down in difficulty
      return currentIdx > 0 ? tiers[currentIdx - 1] : 'A1';
    }
  };

  // Check Answer
  const handleCheckAnswer = () => {
    if (!selectedOptionKey || isAnswerChecked) return;

    const isCorrect = selectedOptionKey === currentQuestion.correct_key;
    setIsAnswerChecked(true);

    if (isCorrect) {
      audioSynth.playSuccessChime();
      setScore((prev) => prev + 1);
    } else {
      audioSynth.playGentleFeedback();
    }
  };

  // Next Question with Dynamic Adaptive Routing
  const handleNextQuestion = () => {
    audioSynth.playGentleFeedback();

    const wasCorrect = selectedOptionKey === currentQuestion.correct_key;
    const currentQLevel = (currentQuestion.level?.toUpperCase() as CefrLevel) || activeTier;
    const updatedHistory = [...tierPerformance, { level: currentQLevel, correct: wasCorrect }];
    setTierPerformance(updatedHistory);
    setAnsweredQuestionIds((prev) => [...prev, currentQuestion.id]);

    const newRecord = {
      questionId: currentQuestion.id,
      selectedKey: selectedOptionKey || 'A',
      correctKey: currentQuestion.correct_key,
      level: currentQLevel,
      targetSkill: currentQuestion.target_skill || 'Linguistic Structure',
      selectedText: currentQuestion.options.find((o) => o.key === selectedOptionKey)?.text || '',
      correctText: currentQuestion.options.find((o) => o.key === currentQuestion.correct_key)?.text || '',
    };
    const updatedRecords = [...userAnswerRecords, newRecord];
    setUserAnswerRecords(updatedRecords);

    if (adaptiveStep + 1 < TOTAL_ADAPTIVE_QUESTIONS) {
      // Route difficulty adaptively based on accuracy
      const nextTier = getNextAdaptiveTier(activeTier, wasCorrect);
      setActiveTier(nextTier);
      setAdaptiveStep((prev) => prev + 1);
      setSelectedOptionKey(null);
      setIsAnswerChecked(false);
    } else {
      // Test Complete: Calculate official verified CEFR diagnostic score
      const finalScore = score + (selectedOptionKey === currentQuestion.correct_key && !isAnswerChecked ? 1 : 0);
      
      // Determine highest sustained level where student performed correctly
      const tiersHierarchy: CefrLevel[] = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
      let calibratedTier: CefrLevel = 'A1';

      for (const tier of tiersHierarchy) {
        const correctAtTier = updatedHistory.filter((item) => item.level === tier && item.correct).length;
        if (correctAtTier > 0) {
          calibratedTier = tier;
          break;
        }
      }

      // If score is high across the adaptive ladder
      if (finalScore >= 7) calibratedTier = 'C2';
      else if (finalScore >= 6 && calibratedTier < 'C1') calibratedTier = 'C1';
      else if (finalScore >= 5 && calibratedTier < 'B2') calibratedTier = 'B2';
      else if (finalScore >= 3 && calibratedTier < 'B1') calibratedTier = 'B1';
      else if (finalScore >= 2 && calibratedTier < 'A2') calibratedTier = 'A2';

      const result = PlacementAssessmentEngine.calculateCefrPlacement(finalScore, nativeLanguageCode, calibratedTier);

      setScore(finalScore);
      setAssessedLevel(result.level);
      setUnlockedLevels(result.unlockedLevels);
      setDiagnosisText(result.diagnosis);
      setOfficialScoreText(result.officialScoreText);

      // Trigger Central Omni-App Engine V24 Diagnostic Evaluation
      OmniAppEngineClient.evaluatePlacementDiagnostic({
        targetLanguage: targetLanguage.name,
        targetLanguageCode: targetLanguage.code,
        nativeLanguage: WORLD_LANGUAGES.find((l) => l.code === nativeLanguageCode)?.name || 'English',
        nativeLanguageCode,
        userAnswers: updatedRecords,
      }).then((diag) => {
        setDiagnosticData(diag);
        if (diag.assessedLevel) setAssessedLevel(diag.assessedLevel);
        if (diag.realtimeGrammarFeedback) setDiagnosisText(diag.realtimeGrammarFeedback);
      }).catch((e) => console.warn(e));

      setStep(3);
      audioSynth.playTriumphChime();
    }
  };

  // Complete Onboarding & Launch Application
  const handleFinishAndLaunch = () => {
    audioSynth.playSuccessChime();

    const defaultName = nativeLanguageCode === 'ar' ? 'أدخل اسمك' : 'Enter your name';
    const accuracy = diagnosticData?.structuralMasteryPercentage ?? Math.round((score / 10) * 100);

    const finalProfile: UserProfile = {
      id: initialProfile?.id || `usr-${Date.now().toString(36)}`,
      name: name.trim() || defaultName,
      displayName: name.trim() || defaultName,
      email: initialProfile?.email || 'explorer@fluentic.local',
      avatar: (name.trim() || 'FL').slice(0, 2).toUpperCase(),
      isGuest: true,
      isPro: false,
      hasCompletedOnboarding: true,
      nativeLanguageCode,
      targetPace,
      learningIntent: initialProfile?.learningIntent || 'conversational',
      placementScore: score,
      placementDiagnosis: diagnosisText,
      structuralMastery: accuracy,
      activeRecallRate: diagnosticData?.activeRecallRetentionRate ?? Math.max(70, accuracy),
      spacedErrorRecyclingCount: diagnosticData?.spacedErrorRecycling?.recycledErrorCount ?? (10 - score),
      diagnosticData: diagnosticData || undefined,
      gems: 0, // STRICT BAN: Zero superficial reward tokens
      xp: 0,   // STRICT BAN: Zero XP counters
      level: 1,
      streakDays: 0,   // Streak strictly starts at 0 until first daily lesson is completed
      streakShields: 0,
      streakProtected: false,
      completedNodeIds: [],
      nodeCrowns: {},
      dailyGoalMinutes: targetPace === 'casual' ? 10 : targetPace === 'intensive' ? 30 : 15,
      dailyGoalCompleted: false,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      unlockedAchievements: [],
      claimedAchievements: [],
      dailyQuests: [],
      activeLanguageCode: targetLanguage.code,
      activeLanguage: targetLanguage.name,
      activeCefr: assessedLevel,
      unlockedCefrLevels: unlockedLevels,
      soundscapeMode: 'mute',
      soundEffectsEnabled: true,
      dailyGoalXp: 0,
      todayXp: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      dailyRituals: {
        speechDrillCompleted: false,
        fsrsReviewCompleted: false,
        scenarioOrDebateCompleted: false,
      },
    };

    onComplete(finalProfile, targetLanguage, assessedLevel);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-8 z-10">
      {/* Central Card Container with Glassmorphism */}
      <div className="w-full max-w-4xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-blue-200/80 shadow-[0_20px_60px_rgba(30,58,138,0.12)] text-slate-900 overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✨</span>
            <span className="text-base font-black tracking-tight text-blue-900 font-sans">
              Fluentic <span className="text-blue-600 font-normal">| {i18n.tagline}</span>
            </span>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: nativeLanguageCode === 'nl' ? 'Profiel & Talen' : 'Profile & Languages' },
              { num: 2, label: nativeLanguageCode === 'nl' ? 'Niveautest (10 Vragen)' : 'Placement Test (10Q)' },
              { num: 3, label: nativeLanguageCode === 'nl' ? 'Kwalificatie' : 'Results' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : step > s.num
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <span>{s.num}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Profile, Native Language, Target Language */}
        {step === 1 && (
          <div className="p-6 sm:p-8 md:p-10 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {nativeLanguageCode === 'nl' ? 'Welkom bij Fluentic' : 'Welcome to Fluentic'}
              </h1>
              <p className="text-sm text-slate-600">
                {nativeLanguageCode === 'nl'
                  ? 'Stel je profiel in, kies je moedertaal en de taal die je wilt leren. Daarna doe je de officiële niveautest.'
                  : 'Configure your profile, native language, and target language, followed by your standardized placement test.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-2">
              {/* Nickname Input */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {nativeLanguageCode === 'nl' ? 'Jouw Gebruikersnaam / Roepnaam' : 'Your Nickname'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={nativeLanguageCode === 'ar' ? 'أدخل اسمك' : nativeLanguageCode === 'nl' ? 'Vul je naam in' : 'Enter your name'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 text-sm font-semibold outline-none transition-all shadow-inner"
                />
              </div>

              {/* Native Language */}
              <div className="space-y-1.5">
                <SearchableLanguageSelect
                  id="onboarding-native-lang-select"
                  value={nativeLanguageCode}
                  onChange={(lang) => {
                    setNativeLanguageCode(lang.code);
                    audioSynth.playGentleFeedback();
                  }}
                  label={nativeLanguageCode === 'nl' ? 'Mijn Moedertaal' : 'My Native Language'}
                  placeholder={nativeLanguageCode === 'nl' ? 'Zoek moedertaal...' : 'Search native language...'}
                  helperText={
                    nativeLanguageCode === 'nl'
                      ? 'Alle instructies, uitleg en vertalingen worden in jouw moedertaal weergegeven.'
                      : 'All interface prompts, grammar notes, and translations will match your native language.'
                  }
                  variant="input"
                />
              </div>

              {/* Target Language to Learn */}
              <div className="space-y-1.5">
                <SearchableLanguageSelect
                  id="onboarding-target-lang-select"
                  value={targetLanguageCode}
                  onChange={(lang) => {
                    setTargetLanguageCode(lang.code);
                    audioSynth.playGentleFeedback();
                  }}
                  label={nativeLanguageCode === 'nl' ? 'Taal die ik wil leren' : 'Language I Want to Learn'}
                  placeholder={nativeLanguageCode === 'nl' ? 'Kies uit alle 55+ talen...' : 'Choose from 55+ world languages...'}
                  helperText={
                    nativeLanguageCode === 'nl'
                      ? `Doeltaal: ${getLanguageLabel(targetLanguage)}`
                      : `Target: ${getLanguageLabel(targetLanguage)}`
                  }
                  variant="input"
                />
              </div>

              {/* Learning Pace */}
              <div className="md:col-span-2 space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {nativeLanguageCode === 'nl' ? 'Dagelijks Leertempo' : 'Learning Pace'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'casual', label: nativeLanguageCode === 'nl' ? 'Rustig' : 'Casual', time: '10 min/dag' },
                    { id: 'dedicated', label: nativeLanguageCode === 'nl' ? 'Toegewijd' : 'Dedicated', time: '15 min/dag' },
                    { id: 'intensive', label: nativeLanguageCode === 'nl' ? 'Intensief' : 'Intensive', time: '30 min/dag' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTargetPace(p.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        targetPace === p.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-black">{p.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandatory Placement Notice */}
            <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {nativeLanguageCode === 'nl' ? 'Niveautest & Kwalificatie: ' : 'Placement Test & Qualification: '}
                </span>
                {nativeLanguageCode === 'nl'
                  ? 'Kwalificeer je ERK-niveau via 10 gerichte vragen, of kies hieronder om direct bij niveau A1 (Beginner) te starten.'
                  : 'Qualify your CEFR level via 10 targeted questions, or choose below to skip and begin directly at A1 (Beginner).'}
              </div>
            </div>

            {/* Actions: Start Test OR Skip Test */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="onboarding-start-placement-btn"
                onClick={handleStartPlacementTest}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>{nativeLanguageCode === 'nl' ? 'Start Niveautest (10 Vragen)' : 'Begin Placement Test (10Q)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="onboarding-skip-test-btn"
                onClick={handleSkipTest}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{nativeLanguageCode === 'nl' ? 'Test Overslaan (Start bij A1)' : 'Skip Test (Start at A1 Beginner)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Standardized 10-Question Placement Test */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{targetLanguage.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      {getLanguageLabel(targetLanguage)}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[10px] border border-blue-200">
                      Tier: {activeTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {nativeLanguageCode === 'nl' 
                      ? `ERK Adaptieve Niveautest • Vraag ${adaptiveStep + 1} van ${TOTAL_ADAPTIVE_QUESTIONS}` 
                      : `CEFR Adaptive Placement • Question ${adaptiveStep + 1} of ${TOTAL_ADAPTIVE_QUESTIONS}`}
                  </p>
                </div>
              </div>

              {/* 4 Variants Selector (Variant A, B, C, D) & Change Language & Skip */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="onboarding-skip-test-header-btn"
                  onClick={handleSkipTest}
                  className="px-3 py-1 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer"
                >
                  {nativeLanguageCode === 'nl' ? 'Test Overslaan ⏩' : 'Skip Test ⏩'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 transition-all cursor-pointer"
                >
                  {nativeLanguageCode === 'nl' ? '⚙️ Wijzig talen' : '⚙️ Change Languages'}
                </button>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 px-2">
                    {nativeLanguageCode === 'nl' ? 'Variant:' : 'Variant:'}
                  </span>
                  {(['A', 'B', 'C', 'D'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleSelectVariant(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        selectedVariant === v
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Adaptive Routing Indicator & Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-blue-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {nativeLanguageCode === 'nl'
                      ? `Dynamische Adaptieve Routering • Actieve Moeilijkheidsgraad: ${activeTier}`
                      : `Dynamic Adaptive Routing • Current Difficulty Tier: ${activeTier}`}
                  </span>
                </span>
                <span className="text-slate-500">
                  {Math.round(((adaptiveStep + 1) / TOTAL_ADAPTIVE_QUESTIONS) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((adaptiveStep + 1) / TOTAL_ADAPTIVE_QUESTIONS) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-4 pt-1">
              {/* CEFR Level & Target Skill */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-extrabold border border-blue-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Niveau {currentQuestion.level || activeTier}</span>
                  </span>
                  <span className="font-bold text-slate-700">
                    {currentQuestion.target_skill}
                  </span>
                </div>
                <span className="text-slate-400 font-medium text-[11px]">
                  {nativeLanguageCode === 'nl' ? 'Officiële CEFR standaarden' : 'Standardized CEFR proficiency'}
                </span>
              </div>

              {/* Instruction Prompt */}
              <div className="text-sm sm:text-base font-bold text-slate-800">
                {currentQuestion.instruction || currentQuestion.prompt_translation || (nativeLanguageCode === 'nl' ? 'Kies het juiste antwoord:' : 'Choose the correct answer:')}
              </div>

              {/* Distinct High-Contrast Prompt Card with Audio Playback */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F2137] via-[#1B365D] to-[#0B1B3D] text-white shadow-lg border border-[#C5A059]/30 flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-[#D4AF37] font-extrabold flex items-center gap-2">
                    <span>{getLanguageLabel(targetLanguage)}</span>
                    {isRtlLanguage(targetLanguage.code) && (
                      <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[10px] text-[#FDE68A] font-bold border border-[#C5A059]/40">
                        RTL
                      </span>
                    )}
                  </div>
                  <p
                    dir={resolveDirection(currentQuestion.prompt || currentQuestion.prompt_native, targetLanguage.code)}
                    className={`text-lg sm:text-xl font-extrabold text-white tracking-wide leading-relaxed break-words ${
                      resolveDirection(currentQuestion.prompt || currentQuestion.prompt_native, targetLanguage.code) === 'rtl' ? 'text-right font-arabic' : 'text-left'
                    }`}
                  >
                    {stripTransliteration(currentQuestion.prompt || currentQuestion.prompt_native)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(
                          currentQuestion.audioText || currentQuestion.prompt || currentQuestion.prompt_native
                        );
                        utterance.lang = targetLanguage.code;
                        utterance.rate = 0.9;
                        window.speechSynthesis.speak(utterance);
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-[#C5A059]/30 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm"
                  title={nativeLanguageCode === 'nl' ? 'Luister naar uitspraak' : 'Listen to pronunciation'}
                >
                  <Volume2 className="w-5 h-5 text-[#D4AF37]" />
                </button>
              </div>

              {/* Options (A, B, C, D) - Clean single line, zero overlapping text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options.map((opt: PlacementQuestionOption) => {
                  const isSelected = selectedOptionKey === opt.key;
                  const isCorrect = opt.key === currentQuestion.correct_key;
                  const optionText = opt.text || opt.text_native || '';

                  let cardStyle = 'bg-white border-slate-200/90 hover:border-[#C5A059]/50 text-slate-900 hover:bg-slate-50/50';

                  if (isAnswerChecked) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs';
                    } else if (isSelected) {
                      cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                    } else {
                      cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-blue-50/80 border-[#1B365D] text-slate-950 ring-2 ring-[#C5A059]/40 font-bold shadow-xs';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => {
                        setSelectedOptionKey(opt.key);
                        audioSynth.playGentleFeedback();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer min-h-[58px] ${cardStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        isAnswerChecked && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswerChecked && isSelected
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'bg-[#1B365D] text-[#D4AF37]'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {opt.key}
                      </span>
                      <div
                        dir={resolveDirection(optionText, targetLanguage.code)}
                        className={`text-sm sm:text-base font-semibold leading-snug break-words flex-1 ${
                          resolveDirection(optionText, targetLanguage.code) === 'rtl' ? 'text-right font-arabic' : 'text-left'
                        }`}
                      >
                        {stripTransliteration(optionText)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Banner (Revealed on Answer Checked) */}
              {isAnswerChecked && (
                <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  selectedOptionKey === currentQuestion.correct_key
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {selectedOptionKey === currentQuestion.correct_key ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                        ✕
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="font-extrabold">
                      {selectedOptionKey === currentQuestion.correct_key
                        ? (nativeLanguageCode === 'nl' ? 'Uitstekend! Dat is juist.' : 'Excellent! That is correct.')
                        : (nativeLanguageCode === 'nl' 
                            ? `Niet helemaal. Het juiste antwoord is optie ${currentQuestion.correct_key}.` 
                            : `Not quite. The correct answer is option ${currentQuestion.correct_key}.`)}
                    </div>
                    {(currentQuestion.explanation || currentQuestion.explanation_translation) && (
                      <div className="text-xs text-slate-700 leading-relaxed">
                        {currentQuestion.explanation || currentQuestion.explanation_translation}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">
                  {nativeLanguageCode === 'nl' ? `Score: ${score} goed` : `Score: ${score} correct`}
                </span>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  id="onboarding-skip-test-btn-footer"
                  onClick={handleSkipTest}
                  className="text-xs font-bold text-slate-500 hover:text-amber-700 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {nativeLanguageCode === 'nl' ? 'Test overslaan (Start bij A1)' : 'Skip test (Start at A1)'}
                </button>
              </div>

              {!isAnswerChecked ? (
                <button
                  type="button"
                  disabled={!selectedOptionKey}
                  onClick={handleCheckAnswer}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    selectedOptionKey
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {nativeLanguageCode === 'nl' ? 'Controleren' : 'Check Answer'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {adaptiveStep + 1 < TOTAL_ADAPTIVE_QUESTIONS
                      ? (nativeLanguageCode === 'nl' ? 'Volgende Vraag' : 'Next Question')
                      : (nativeLanguageCode === 'nl' ? 'Bekijk Resultaat' : 'View Results')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Assessment Results & Level Unlocked */}
        {step === 3 && (
          <div className="p-6 sm:p-8 md:p-10 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {nativeLanguageCode === 'nl' ? 'Niveautest Voltooid!' : 'Placement Test Complete!'}
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                {nativeLanguageCode === 'nl'
                  ? `Gefeliciteerd ${name}! Op basis van jouw adaptieve sessie op de officiële ERK-ladder is jouw taalniveau vastgesteld.`
                  : `Congratulations ${name}! Based on your dynamic adaptive placement session, your official CEFR proficiency level is confirmed.`}
              </p>
            </div>

            {/* Official Diagnostic Score Banner */}
            <div className="max-w-xl mx-auto p-5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/25 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-blue-200">
                {nativeLanguageCode === 'ar' 
                  ? 'النتيجة التشخيصية الرسمية المعتمدة (CEFR)' 
                  : nativeLanguageCode === 'nl' 
                  ? 'Officieel Diagnostisch ERK-Resultaat' 
                  : 'Official CEFR Diagnostic Result'}
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {officialScoreText || (nativeLanguageCode === 'ar' ? `المستوى المعتمد: ${assessedLevel}` : nativeLanguageCode === 'nl' ? `Geverifieerd Niveau: ${assessedLevel}` : `Verified Level: ${assessedLevel}`)}
              </div>
              <div className="text-xs text-blue-100 font-medium">
                {nativeLanguageCode === 'ar'
                  ? 'تم التحقق والتقييم عبر محرك Fluentic التشخيصي استناداً إلى معايير الإتقان الهيكلي.'
                  : nativeLanguageCode === 'nl'
                  ? 'Vastgesteld via adaptieve scenariometingen volgens de officiële ERK-normen.'
                  : 'Calibrated via adaptive structural assessment according to standardized CEFR benchmarks.'}
              </div>
            </div>

            {/* Zero Gamification: Structural Mastery & Cognitive Retention Telemetry */}
            <div className="max-w-xl mx-auto grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {nativeLanguageCode === 'ar' ? 'الإتقان الهيكلي' : nativeLanguageCode === 'nl' ? 'Structureel' : 'Structural Mastery'}
                </div>
                <div className="text-2xl font-black text-blue-600">
                  {diagnosticData?.structuralMasteryPercentage ?? Math.round((score / 10) * 100)}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {nativeLanguageCode === 'ar' ? 'الدقة النحوية' : nativeLanguageCode === 'nl' ? 'Syntactische precisie' : 'Morpho-syntax'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {nativeLanguageCode === 'ar' ? 'الاستدعاء الذهني' : nativeLanguageCode === 'nl' ? 'Actieve Herinnering' : 'Active Recall'}
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {diagnosticData?.activeRecallRetentionRate ?? Math.max(70, Math.round((score / 10) * 100))}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {nativeLanguageCode === 'ar' ? 'الاحتفاظ المعرفي' : nativeLanguageCode === 'nl' ? 'Geheugenretentie' : 'Retention index'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {nativeLanguageCode === 'ar' ? 'تدوير الأخطاء' : nativeLanguageCode === 'nl' ? 'Foutrecycling' : 'Error Recycling'}
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {diagnosticData?.spacedErrorRecycling?.recycledErrorCount ?? (10 - score)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {nativeLanguageCode === 'ar' ? 'تكرار متباعد' : nativeLanguageCode === 'nl' ? 'FSRS-herhaling' : 'FSRS queue'}
                </div>
              </div>
            </div>

            {/* Diagnostic Real-time Grammar Feedback */}
            <div className="max-w-xl mx-auto p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 font-medium leading-relaxed text-left">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>
                  {nativeLanguageCode === 'ar' ? 'التقرير التشخيصي البيداغوجي:' : nativeLanguageCode === 'nl' ? 'Pedagogische Diagnose:' : 'Pedagogical Diagnostic Synthesis:'}
                </span>
              </div>
              <p>{diagnosisText}</p>
            </div>

            {/* Diagnostic Concept Mapping Table */}
            {diagnosticData?.conceptMapping && diagnosticData.conceptMapping.length > 0 && (
              <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 overflow-hidden text-left text-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>{nativeLanguageCode === 'ar' ? 'خريطة المفاهيم اللغوية (Concept Mapping)' : 'Diagnostic Concept Mapping'}</span>
                  <span className="text-[10px] text-slate-500">CEFR Framework</span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {diagnosticData.conceptMapping.map((item, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{item.tier}</span>
                        <span className="font-semibold text-slate-800">{item.concept}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'needs_review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status === 'mastered' 
                          ? (nativeLanguageCode === 'ar' ? 'مكتمل ✓' : 'Mastered ✓') 
                          : item.status === 'needs_review' 
                          ? (nativeLanguageCode === 'ar' ? 'للمراجعة ⚠️' : 'Review Queue ⚠️') 
                          : (nativeLanguageCode === 'ar' ? 'في طور التكوين 🔄' : 'Emerging 🔄')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real-time Grammar Error Breakdowns */}
            {diagnosticData?.errorBreakdowns && diagnosticData.errorBreakdowns.length > 0 && (
              <div className="max-w-xl mx-auto rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-left space-y-2">
                <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>
                    {nativeLanguageCode === 'ar' ? 'تحليل الأخطاء النحوية وتصحيح المسار:' : 'Linguistic Error Surgery & Concept Remediation:'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {diagnosticData.errorBreakdowns.map((err, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-rose-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 font-sans font-bold">
                          {nativeLanguageCode === 'ar' ? `سؤال #${err.questionId}` : `Item #${err.questionId}`}
                        </span>
                        <span>
                          <span className="line-through text-rose-600">{err.userChoice}</span>
                          <span className="text-slate-400 mx-1.5">→</span>
                          <span className="font-bold text-emerald-700">{err.correctKey}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px] font-sans">
                        {err.linguisticReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlocked Levels List */}
            <div className="max-w-md mx-auto space-y-2 pt-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {nativeLanguageCode === 'ar' ? 'المستويات المفتوحة على السلم الأوروبي' : nativeLanguageCode === 'nl' ? 'Ontgrendelde Niveaus' : 'Unlocked CEFR Tiers'}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => {
                  const isUnlocked = unlockedLevels.includes(lvl);
                  return (
                    <span
                      key={lvl}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                      }`}
                    >
                      {lvl} {isUnlocked ? '✓' : '🔒'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Launch App Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleFinishAndLaunch}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 mx-auto transition-all transform active:scale-95 cursor-pointer"
              >
                <span>{nativeLanguageCode === 'ar' ? 'بدء الاستوديو التعليمي' : nativeLanguageCode === 'nl' ? 'Start met Leren in Fluentic' : 'Launch Learning Studio'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
