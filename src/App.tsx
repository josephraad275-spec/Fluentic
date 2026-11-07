import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  SpatialViewMode, 
  CefrLevel, 
  Language, 
  UserProfile, 
  LearningNode 
} from './types';
import { WORLD_LANGUAGES } from './data/languages';
import { CryptoStorage, STORAGE_KEY_PROFILE, STORAGE_KEY_CARDS } from './services/cryptoStorage';
import { audioSynth } from './services/audioSynthesizer';
import { AccountDatabase, STORAGE_KEY_ACCOUNTS_DB } from './services/accountDatabase';

import { Sparkles } from 'lucide-react';

// Core Canvas & Navigation
import { AmbientCanvas } from './components/AmbientCanvas';
import { TopHorizonDeck } from './components/TopHorizonDeck';
import { OrbitDock } from './components/OrbitDock';
import { CommandSpotlight } from './components/CommandSpotlight';
import { AuthModal } from './components/AuthModal';
import { LessonModal } from './components/LessonModal';
import { OnboardingPlacementView } from './components/OnboardingPlacementView';
import { SignInView } from './components/SignInView';
import { AITutorModal } from './components/AITutorModal';
import { OmniAIBrainCopilot } from './components/OmniAIBrainCopilot';

// Views
import { HomeView } from './components/views/HomeView';
import { DuolingoPathView } from './components/views/DuolingoPathView';
import { DialogueTheatreView } from './components/views/DialogueTheatreView';
import { DailyDisciplinesView } from './components/views/DailyDisciplinesView';
import { ProStudioView } from './components/views/ProStudioView';
import { GrammarModuleView } from './components/views/GrammarModuleView';
import { AITranslatorView } from './components/views/AITranslatorView';
import { FocusAlphaWaveView } from './components/views/FocusAlphaWaveView';

const DEFAULT_USER: UserProfile = {
  id: 'usr-explorer-001',
  name: 'Explorer',
  displayName: 'Explorer',
  email: 'explorer@fluentic.ai',
  avatar: 'EX',
  isGuest: true,
  isPro: false,
  hasCompletedOnboarding: false,
  nativeLanguageCode: 'en',
  nativeLanguage: 'English',
  targetPace: 'dedicated',
  placementScore: 0,
  structuralMastery: 0,
  activeRecallRate: 0,
  spacedErrorRecyclingCount: 0,
  xp: 0,
  level: 1,
  gems: 0,
  streakDays: 0,
  speakingPunctuation: 0,
  speakingScore: 0,
  totalPracticeMinutes: 0,
  streakShields: 0,
  streakProtected: false,
  activeLanguageCode: 'es',
  activeLanguage: 'Spanish',
  activeCefr: 'A1',
  unlockedCefrLevels: ['A1'],
  completedNodeIds: [],
  nodeCrowns: {},
  dailyGoalMinutes: 15,
  dailyGoalCompleted: false,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  unlockedAchievements: [],
  claimedAchievements: [],
  isSignedIn: true,
  dailyQuests: [],
};

export function App() {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fluentic_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return { ...DEFAULT_USER, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  // User session state
  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fluentic_signed_in') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isSignedIn) return;
    try { localStorage.setItem('fluentic_user_session', JSON.stringify(user)); localStorage.setItem('fluentic_signed_in', 'true'); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [user, isSignedIn]);

  const [activeLanguage, setActiveLanguage] = useState<Language>(() => {
    return (
      WORLD_LANGUAGES.find((l) => l.code === user.activeLanguageCode) ||
      WORLD_LANGUAGES[0]
    );
  });

  const [activeCefr, setActiveCefr] = useState<CefrLevel>(user.activeCefr || 'A1');
  const [activeDialect, setActiveDialect] = useState<string>('');
  const [spatialMode, setSpatialMode] = useState<SpatialViewMode>('chrono');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [soundscapeMode, setSoundscapeMode] = useState<'alpha' | 'cosmic' | 'rain' | 'mute'>('mute');
  const [isRetakingPlacement, setIsRetakingPlacement] = useState(false);

  // Modals
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [activeLessonNode, setActiveLessonNode] = useState<LearningNode | null>(null);

  // In-memory state only: do NOT save previous information, name, or practices to disk
  const handleUpdateUser = (updated: UserProfile) => {
    setUser(updated);
  };

  const handleSelectLanguage = (lang: Language) => {
    setActiveLanguage(lang);
    const savedLevel = user.languageLevels?.[lang.code];
    const level = lang.code === user.activeLanguageCode ? activeCefr : savedLevel?.level || 'A1';
    setActiveCefr(level);
    setActiveDialect(lang.dialects && lang.dialects.length > 0 ? lang.dialects[0] : '');
    handleUpdateUser({
      ...user,
      languageLevels: { ...user.languageLevels, [activeLanguage.code]: { level: activeCefr, unlocked: user.unlockedCefrLevels || ['A1'] } },
      activeCefr: level,
      unlockedCefrLevels: lang.code === user.activeLanguageCode ? user.unlockedCefrLevels : savedLevel?.unlocked || ['A1'],
      activeLanguageCode: lang.code,
      activeLanguage: lang.name,
    });
  };

  const handleSelectCefr = (cefr: CefrLevel) => {
    setActiveCefr(cefr);
    handleUpdateUser({
      ...user,
      activeCefr: cefr,
    });
  };

  // Handler when completing onboarding & placement
  const handleOnboardingComplete = (
    finalProfile: UserProfile,
    chosenTargetLanguage: Language,
    assessedCefr: CefrLevel
  ) => {
    setUser(finalProfile);
    setActiveLanguage(chosenTargetLanguage);
    setActiveCefr(assessedCefr);
    setActiveDialect(
      chosenTargetLanguage.dialects && chosenTargetLanguage.dialects.length > 0
        ? chosenTargetLanguage.dialects[0]
        : ''
    );
    setActiveTab('home');
    setIsRetakingPlacement(false);
  };

  // Complete a lesson node
  const handleLessonComplete = (xpEarned: number, gemsEarned: number) => {
    if (!activeLessonNode) return;
    const nodeId = activeLessonNode.id;
    const currentCrown = user.nodeCrowns?.[nodeId] || 0;
    const newCrown = Math.min(currentCrown + 1, 5);

    const completedIds = user.completedNodeIds.includes(nodeId)
      ? user.completedNodeIds
      : [...user.completedNodeIds, nodeId];

    // Increment streak if not yet practiced today
    const nextStreak = user.streakDays === 0 ? 1 : user.streakDays;
    const addedMinutes = activeLessonNode.targetDurationMinutes || 5;
    const nextPracticeMinutes = (user.totalPracticeMinutes || 0) + addedMinutes;

    handleUpdateUser({
      ...user,
      xp: user.xp,
      gems: user.gems,
      streakDays: nextStreak,
      totalPracticeMinutes: nextPracticeMinutes,
      completedNodeIds: completedIds,
      nodeCrowns: {
        ...(user.nodeCrowns || {}),
        [nodeId]: newCrown,
      },
    });

    setActiveLessonNode(null);
  };

  const handleSignOut = () => {
    audioSynth.playGentleFeedback();
    setUser(DEFAULT_USER);
    setIsSignedIn(false);
    try {
      for (const key of Object.keys(localStorage)) if (key.startsWith('fluentic_')) localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage)) if (key.startsWith('fluentic_')) sessionStorage.removeItem(key);
      AccountDatabase.clearDatabase();
    } catch {
      // Ignore
    }
  };

  // If user is not signed in, ALWAYS show the dedicated clean main entry login page!
  if (!isSignedIn) {
    return (
      <div className="relative min-h-screen bg-[#f0f4f9] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 antialiased overflow-x-hidden">
        {/* Living moving background */}
        <AmbientCanvas />

        {/* Dedicated Main Entry Login Page with Language Configuration & Mandatory Placement Test */}
        <SignInView
          initialName={user.name && user.name !== 'Explorer' ? user.name : ''}
          initialEmail={user.email && user.email !== 'explorer@fluentic.ai' ? user.email : ''}
          initialNativeLanguageCode={user.nativeLanguageCode || 'en'}
          initialTargetLanguageCode={activeLanguage?.code || 'es'}
          initialLearningIntent={user.learningIntent || 'conversational'}
          onBackToDashboard={() => setIsSignedIn(true)}
          onSignIn={(name, email, nativeLangCode, targetLangCode, intent) => {
            try { localStorage.setItem('fluentic_signed_in', 'true'); } catch {}
            const targetLang = WORLD_LANGUAGES.find((l) => l.code === targetLangCode) || activeLanguage;
            setActiveLanguage(targetLang);
            const defaultName = nativeLangCode === 'ar' ? 'أدخل اسمك' : 'Enter your name';
            const finalName = name.trim() || defaultName;

            // Fresh in-memory session only - never persisted to disk
            // MANDATORY PLACEMENT TEST: hasCompletedOnboarding is set to false!
            const brandNew: UserProfile = {
              ...DEFAULT_USER,
              id: `usr-${Date.now()}`,
              name: finalName,
              email: email.trim() || `${finalName.toLowerCase().replace(/\s+/g, '.')}@fluentic.local`,
              avatar: (finalName || 'FL').slice(0, 2).toUpperCase(),
              nativeLanguage: WORLD_LANGUAGES.find(language => language.code === nativeLangCode)?.name || 'English',
              nativeLanguageCode: nativeLangCode,
              activeLanguageCode: targetLang.code,
              activeLanguage: targetLang.name,
              learningIntent: intent,
              isGuest: false,
              isSignedIn: true,
              hasCompletedOnboarding: false, // NO ONE ENTERS WITHOUT PLACEMENT TEST!
              totalPracticeMinutes: 0,
              xp: 0,
              gems: 0,
              streakDays: 0,
              speakingPunctuation: 0,
              speakingScore: 0,
            };
            setUser(brandNew);
            setIsSignedIn(true);
          }}
          onContinueGuest={(nativeLangCode, targetLangCode, intent) => {
            try { localStorage.setItem('fluentic_signed_in', 'true'); } catch {}
            const targetLang = WORLD_LANGUAGES.find((l) => l.code === targetLangCode) || activeLanguage;
            setActiveLanguage(targetLang);
            const defaultName = nativeLangCode === 'ar' ? 'أدخل اسمك' : 'Enter your name';
            const guestProfile: UserProfile = {
              ...DEFAULT_USER,
              id: `usr-guest-${Date.now()}`,
              name: defaultName,
              email: 'guest@fluentic.local',
              avatar: 'FL',
              nativeLanguage: WORLD_LANGUAGES.find(language => language.code === nativeLangCode)?.name || 'English',
              nativeLanguageCode: nativeLangCode,
              activeLanguageCode: targetLang.code,
              activeLanguage: targetLang.name,
              learningIntent: intent,
              isGuest: true,
              isSignedIn: true,
              hasCompletedOnboarding: false, // NO ONE ENTERS WITHOUT PLACEMENT TEST!
              totalPracticeMinutes: 0,
              xp: 0,
              gems: 0,
              streakDays: 0,
              speakingPunctuation: 0,
              speakingScore: 0,
            };
            setUser(guestProfile);
            setIsSignedIn(true);
          }}
          onSkipTest={(nativeLangCode, targetLangCode, customName, intent) => {
            try { localStorage.setItem('fluentic_signed_in', 'true'); } catch {}
            const targetLang = WORLD_LANGUAGES.find((l) => l.code === targetLangCode) || activeLanguage;
            setActiveLanguage(targetLang);
            setActiveCefr('A1');
            const defaultName = nativeLangCode === 'ar' ? 'أدخل اسمك' : 'Enter your name';
            const finalName = customName?.trim() || defaultName;
            const skipProfile: UserProfile = {
              ...DEFAULT_USER,
              id: `usr-${Date.now()}`,
              name: finalName,
              email: 'explorer@fluentic.local',
              avatar: (finalName || 'FL').slice(0, 2).toUpperCase(),
              nativeLanguage: WORLD_LANGUAGES.find(language => language.code === nativeLangCode)?.name || 'English',
              nativeLanguageCode: nativeLangCode,
              activeLanguageCode: targetLang.code,
              activeLanguage: targetLang.name,
              learningIntent: intent || 'conversational',
              isGuest: true,
              isSignedIn: true,
              hasCompletedOnboarding: true,
              placementScore: 0,
              speakingPunctuation: 0,
              speakingScore: 0,
              placementDiagnosis: nativeLangCode === 'nl'
                ? 'Niveautest overgeslagen. Je start direct bij ERK-niveau A1 (Beginner).'
                : 'Placement test skipped. Starting directly at CEFR level A1 (Beginner).',
              totalPracticeMinutes: 0,
              xp: 0,
              gems: 0,
              streakDays: 0,
              streakShields: 0,
              streakProtected: false,
              weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
              unlockedAchievements: [],
              claimedAchievements: [],
              completedNodeIds: [],
              nodeCrowns: {},
            };
            setUser(skipProfile);
            setIsSignedIn(true);
          }}
        />
      </div>
    );
  }

  // If user has not completed onboarding or clicked retake, show the entry page & placement screen
  if (!user.hasCompletedOnboarding || isRetakingPlacement) {
    return (
      <div className="relative min-h-screen bg-[#f0f4f9] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 antialiased overflow-x-hidden">
        {/* Living moving background */}
        <AmbientCanvas />

        {/* Onboarding & Placement Screen */}
        <OnboardingPlacementView
          initialProfile={user}
          onComplete={handleOnboardingComplete}
        />
      </div>
    );
  }

  const isArabic = user.nativeLanguageCode === 'ar';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="relative min-h-screen bg-[#f0f4f9] text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 antialiased overflow-x-hidden"
    >
      {/* Dynamic Living Waves Canvas */}
      <AmbientCanvas />

      {/* Top Horizon Deck */}
      <TopHorizonDeck
        user={user}
        activeLanguage={activeLanguage}
        onSelectLanguage={handleSelectLanguage}
        activeCefr={activeCefr}
        onSelectCefr={handleSelectCefr}
        activeDialect={activeDialect}
        onSelectDialect={setActiveDialect}
        spatialMode={spatialMode}
        onSelectSpatialMode={setSpatialMode}
        soundscapeMode={soundscapeMode}
        onSelectSoundscape={setSoundscapeMode}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProModal={() => setActiveTab('pro-studio')}
        onOpenAITutor={() => setIsAITutorOpen(true)}
        isAITutorActive={isAITutorOpen}
        onRetakePlacement={() => setIsRetakingPlacement(true)}
        onSignOut={handleSignOut}
        onOpenSignInPage={() => setIsSignedIn(false)}
        onSelectNativeLanguage={(code) => handleUpdateUser({ ...user, nativeLanguageCode: code, nativeLanguage: WORLD_LANGUAGES.find(language => language.code === code)?.name || 'English' })}
      />

      {/* Main View Area */}
      <main className="relative z-10 w-full">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            activeLanguage={activeLanguage}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartNextLesson={() => setActiveTab('syllabus')}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'syllabus' && (
          <DuolingoPathView
            user={{ ...user, activeCefr }}
            activeLanguage={activeLanguage}
            onSelectNode={(node) => setActiveLessonNode(node)}
            onClaimMilestone={() => undefined}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {(activeTab === 'focus' || activeTab === 'dialogue-theatre') && (
          <FocusAlphaWaveView
            activeLanguage={activeLanguage}
            user={user}
          />
        )}

        {activeTab === 'daily-disciplines' && (
          <DailyDisciplinesView
            user={user}
            activeLanguage={activeLanguage}
            onToggleShield={() => {
              if (user.streakProtected) return;
              if (user.gems >= 50) {
                audioSynth.playSuccessChime();
                handleUpdateUser({
                  ...user,
                  gems: user.gems - 50,
                  streakProtected: true,
                });
              } else {
                alert('Insufficient gems. Complete lessons to earn gems!');
              }
            }}
          />
        )}

        {activeTab === 'grammar-module' && (
          <GrammarModuleView
            activeLanguage={activeLanguage}
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}

        {activeTab === 'ai-translator' && (
          <AITranslatorView
            activeLanguage={activeLanguage}
            nativeLanguageCode={user.nativeLanguageCode}
          />
        )}

        {activeTab === 'pro-studio' && (
          <ProStudioView
            activeLanguage={activeLanguage}
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Spatial Orbit Dock with Core Navigation and Dedicated Standalone AI Tutor Menu Button */}
      <OrbitDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAITutor={() => {
          audioSynth.playGentleFeedback();
          setIsAITutorOpen(true);
        }}
        isAITutorActive={isAITutorOpen}
        isPro={user.isPro}
        nativeLanguageCode={user.nativeLanguageCode || 'nl'}
        soundscapeMode={soundscapeMode}
        onToggleSoundscape={() => {
          const nextMode = soundscapeMode === 'alpha' ? 'mute' : 'alpha';
          setSoundscapeMode(nextMode);
          audioSynth.startSoundscape(nextMode);
        }}
      />

      {/* Command Spotlight Modal (Cmd+K) */}
      <CommandSpotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        onNavigate={setActiveTab}
        onSelectLanguage={handleSelectLanguage}
        onSetCefr={handleSelectCefr}
        onSetSoundscape={setSoundscapeMode}
        onOpenProModal={() => setActiveTab('pro-studio')}
        activeLanguage={activeLanguage}
      />

      {/* Auth & Security Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onUpdateUser={handleUpdateUser}
      />

      {/* Lesson Exercise Modal */}
      {activeLessonNode && (
        <LessonModal
          user={user}
          node={activeLessonNode}
          activeLanguage={activeLanguage}
          onClose={() => setActiveLessonNode(null)}
          onComplete={handleLessonComplete}
        />
      )}

      {/* AI Tutor Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        activeLanguage={activeLanguage}
        activeCefr={activeCefr}
        user={user}
      />

      {/* Omnipresent Central AI Brain Copilot (Accessible everywhere) */}
      <OmniAIBrainCopilot
        activeLanguage={activeLanguage}
        activeCefr={activeCefr}
        user={user}
        currentContext={activeTab}
      />
    </div>
  );
}

export default App;
