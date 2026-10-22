export type CefrLevel = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  family: string;
  script: string;
  dialects?: string[];
  sampleGreeting: string;
  phoneticDifficulty: 'Gentle' | 'Moderate' | 'Intricate';
  description: string;
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'speech-pronounce' | 'sentence-scramble' | 'listening-comprehension' | 'translation' | 'fill-blank';
  prompt: string;
  targetPhrase: string;
  translation: string;
  phoneticIpa?: string;
  options?: string[];
  correctAnswer: string | string[];
  scrambledWords?: string[];
  audioSpeed?: number;
  culturalNote?: string;
  grammarTip?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface LearningNode {
  id: string;
  title: string;
  nativeTitle: string;
  category: 'Foundations' | 'Conversation' | 'Culture' | 'Grammar' | 'Professional' | 'Advanced Mastery' | 'Vocabulary';
  cefr: CefrLevel;
  description: string;
  xpReward: number;
  gemReward: number;
  targetDurationMinutes?: number;
  exercises: Exercise[];
  iconName: string;
  coordinates: { x: number; y: number };
}

export type FsrsRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface DailyQuest {
  id: string;
  title: string;
  category: 'xp' | 'practice' | 'speech' | 'review';
  target: number;
  current: number;
  completed: boolean;
  rewardGems: number;
  rewardXp: number;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  isPro: boolean;
  subscriptionTier?: 'monthly' | 'plus' | 'annual';
  proExpiryDate?: string;
  hasCompletedOnboarding?: boolean;
  nativeLanguageCode?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  targetPace?: 'casual' | 'dedicated' | 'intensive';
  placementScore?: number;
  placementDiagnosis?: string;
  placementLatencyMs?: number;
  gems: number;
  streakDays: number;
  currentStreak?: number;
  speakingPunctuation?: number;
  speakingScore?: number;
  streakShields: number;
  streakProtected?: boolean;
  xp: number;
  level: number;
  completedNodeIds: string[];
  nodeCrowns?: Record<string, number>;
  dailyGoalMinutes?: number;
  dailyGoalCompleted?: boolean;
  weeklyActivity?: number[];
  unlockedAchievements?: string[];
  claimedAchievements?: string[];
  isSignedIn?: boolean;
  totalPracticeMinutes?: number;
  createdAt?: string;
  lastLoginAt?: string;
  dailyQuests?: DailyQuest[];
  activeLanguageCode?: string;
  activeLanguage?: string;
  activeDialect?: string;
  activeCefr?: CefrLevel;
  cefrLevel?: CefrLevel;
  unlockedCefrLevels?: CefrLevel[];
  soundscapeMode?: 'alpha' | 'cosmic' | 'rain' | 'mute';
  soundscapeVolume?: number;
  soundEffectsEnabled?: boolean;
  dailyGoalXp?: number;
  todayXp?: number;
  lastActiveDate?: string;
  lastDailyRewardDate?: string;
  customVoiceAccent?: string;
  voiceCloningEnabled?: boolean;
  dailyRituals?: {
    speechDrillCompleted: boolean;
    fsrsReviewCompleted: boolean;
    scenarioOrDebateCompleted: boolean;
  };
  learningIntent?: 'business' | 'travel' | 'academic' | 'conversational' | 'culture';
  conceptProgress?: Record<string, { accuracy: number; lapses: number; lastTested: string }>;
  encryptedKeyHash?: string;
  structuralMastery?: number;
  activeRecallRate?: number;
  spacedErrorRecyclingCount?: number;
  diagnosticData?: {
    assessedLevel?: CefrLevel;
    calibratedScore?: number;
    totalEvaluated?: number;
    structuralMasteryPercentage?: number;
    activeRecallRetentionRate?: number;
    conceptMapping?: Array<{ concept: string; status: 'mastered' | 'needs_review' | 'emerging'; tier: string }>;
    realtimeGrammarFeedback?: string;
    errorBreakdowns?: Array<{ questionId: number; errorSnippet?: string; grammaticalCorrection?: string; linguisticReason?: string }>;
  };
  recycledErrors?: Array<{
    id: string;
    concept: string;
    errorSlip: string;
    correctedForm: string;
    lastEncountered: string;
    masteryStatus: 'flagged' | 'relearning' | 'mastered';
  }>;
}

export interface FsrsCard {
  id: string;
  language: string;
  targetLanguage?: string;
  front: string;
  back: string;
  imageUrl?: string;
  category?: string;
  contextSentence?: string;
  phoneticIpa?: string;
  examples?: string[];
  etymology?: string;
  cefr?: CefrLevel;
  reps: number;
  lapses: number;
  stability: number; // in days
  difficulty: number; // 1-10
  intervalDays?: number;
  dueTimestamp?: number;
  due?: string;
  created?: string;
  lastReviewed?: string;
  lastReviewTimestamp?: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
}

export interface ScenarioMessage {
  id: string;
  speaker: string;
  role: 'ai' | 'user' | 'system';
  text: string;
  translation?: string;
  culturalTip?: string;
  options?: string[];
  audioUrl?: string;
}

export interface DebateTurn {
  id: string;
  speaker: string;
  persona: 'Optimist' | 'Skeptic' | 'User';
  text: string;
  translation?: string;
  nuanceScore?: number;
  feedback?: string;
  suggestedCounterPoints?: string[];
}

export interface GrammarGap {
  id: string;
  title: string;
  category: 'Syntax' | 'False Friends' | 'Prepositions & Cases' | 'Subjunctive & Mood' | 'Phonetic Slips';
  severity: 'low' | 'medium' | 'high';
  frequencyCount: number;
  exampleSlip: string;
  correctForm: string;
  psycholinguisticExplanation: string;
  ruleOfThumb: string;
  quickDrill: {
    question: string;
    options: string[];
    correct: string;
    explanation: string;
  };
}

export type SpatialViewMode = 'units' | 'chrono' | 'constellation' | 'bento';

export type NavigationTab = 
  | 'home'
  | 'syllabus'
  | 'dialogue-theatre'
  | 'grammar-module'
  | 'ai-translator'
  | 'fsrs-vault'
  | 'daily-disciplines'
  | 'neural-radar'
  | 'pro-studio'
  | 'focus';

export type PaymentMethod = 'paypal' | 'credit-card' | 'google-pay' | 'apple-pay';

export type PurchasePlanId = 
  | 'gems-100'
  | 'gems-500'
  | 'gems-2000'
  | 'pro-monthly'
  | 'pro-plus'
  | 'pro-1year';

export interface PurchasePlan {
  id: PurchasePlanId;
  name: string;
  type: 'gems' | 'subscription';
  amount?: number;
  duration?: string;
  priceUsd: number;
  badge?: string;
  features: string[];
}

