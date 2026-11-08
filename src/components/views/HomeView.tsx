import { uiText } from "../../services/uiLocalization.ts";
import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  BookOpen, 
  MessageSquare, 
  Layers, 
  Clock, 
  Check, 
  Crown, 
  Target, 
  Send, 
  Loader2, 
  BrainCircuit, 
  Trophy, 
  CheckCircle2,
  Bot
} from 'lucide-react';
import { UserProfile, Language, NavigationTab } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { getI18n } from '../../services/localization';
import { OmniAppEngineClient } from '../../services/omniEngineService';
import { stripTransliteration } from '../../services/languageTypography';

interface HomeViewProps {
  user: UserProfile;
  activeLanguage: Language;
  onNavigate: (tab: NavigationTab) => void;
  onStartNextLesson: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  activeLanguage,
  onNavigate,
  onStartNextLesson,
  onUpdateUser,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Central AI Brain query state
  const [aiQueryInput, setAiQueryInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponseData, setAiResponseData] = useState<{
    reply: string;
    targetSnippet?: string;
    audioReadyText?: string;
    translation?: string;
    corrections?: Array<{ original: string; corrected: string; rule: string }>;
    register?: string;
  } | null>(null);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const i18n = getI18n(user.nativeLanguageCode || 'en');
  const streak = user.streakDays || user.currentStreak || 1;
  const activeCefr = user.activeCefr || 'A1';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExecuteAIQuery = async (customText?: string) => {
    const text = (customText || aiQueryInput).trim();
    if (!text || isAiLoading) return;

    audioSynth.playGentleFeedback();
    setIsAiLoading(true);

    try {
      const result = await OmniAppEngineClient.executeActiveChat({
        userMessage: text,
        targetLanguage: activeLanguage.name,
        targetLanguageCode: activeLanguage.code,
        nativeLanguage: user.nativeLanguage || 'English',
        nativeLanguageCode: user.nativeLanguageCode || 'en',
        cefrLevel: user.activeCefr || 'B1',
        learningIntent: user.learningIntent || 'conversational',
      });

      if (result?.tutor_turn) {
        const turn = result.tutor_turn;
        setAiResponseData({
          reply: turn.reply,
          targetSnippet: turn.targetLanguageUtterance ? stripTransliteration(turn.targetLanguageUtterance) : undefined,
          audioReadyText: turn.audioReadyText ? stripTransliteration(turn.audioReadyText) : undefined,
          translation: turn.translation,
          corrections: turn.contextualCorrections?.map((c) => ({
            original: c.originalSnippet,
            corrected: c.correctedSnippet,
            rule: c.grammaticalRule,
          })),
          register: turn.registerNotes?.detectedRegister,
        });
        audioSynth.playSuccessChime();
        if (!customText) setAiQueryInput('');
        return;
      }
      throw new Error('No response');
    } catch {
      setAiResponseData({
        reply: `Excellent query on ${activeLanguage.name}! Fluency is developed through active recall, continuous exposure, and practical usage.`,
        targetSnippet: stripTransliteration(activeLanguage.sampleGreeting),
        audioReadyText: stripTransliteration(activeLanguage.sampleGreeting),
        translation: `Core expression in ${activeLanguage.name}`,
        register: 'neutral',
      });
      audioSynth.playSuccessChime();
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePlayAIUtterance = async (phraseToSpeak?: string) => {
    const phrase = phraseToSpeak || aiResponseData?.audioReadyText || aiResponseData?.targetSnippet || activeLanguage.sampleGreeting;
    if (!phrase || isPlayingAudio) return;

    setIsPlayingAudio(true);
    audioSynth.playGentleFeedback();
    try {
      await audioSynth.speakPhraseNative(phrase, activeLanguage.code);
    } catch {
      // fallback
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const completedLessonsCount = user.completedNodeIds?.length || 0;
  const claimedAchievements = user.claimedAchievements || [];

  const achievements = [
    {
      id: 'first-step',
      title: 'First Milestone',
      description: 'Completed your diagnostic assessment and first unit.',
      icon: CheckCircle2,
      isUnlocked: completedLessonsCount >= 1 || Boolean(user.hasCompletedOnboarding),
    },
    {
      id: 'immersion-habit',
      title: 'Consistency Habit',
      description: 'Maintained active daily practice streak.',
      icon: Flame,
      isUnlocked: streak >= 2,
    },
    {
      id: 'polyglot-pioneer',
      title: 'CEFR Progression',
      description: 'Reached and demonstrated proficiency on placement milestones.',
      icon: Trophy,
      isUnlocked: Boolean(user.hasCompletedOnboarding),
    },
  ];

  const handleClaimAchievement = (id: string, title: string) => {
    if (claimedAchievements.includes(id)) {
      audioSynth.playGentleFeedback();
      showToast(`✓ ${title} is already claimed!`);
      return;
    }
    audioSynth.playSuccessChime();
    const next = [...claimedAchievements, id];
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        claimedAchievements: next,
        gems: user.gems + 20,
      });
    }
    showToast(`🎉 Claimed 20 Gems for "${title}"!`);
  };

  const durationOptions = [
    { minutes: 5, label: '5m (Casual)' },
    { minutes: 10, label: '10m (Regular)' },
    { minutes: 15, label: '15m (Dedicated)' },
    { minutes: 30, label: '30m (Intensive)' },
  ];

  const promptSuggestions = [
    `How do I order food politely in ${activeLanguage.name}?`,
    `Explain the past tense conjugation rules`,
    `What are 5 essential idioms used by locals?`,
    `Simulate a formal job interview opening`,
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-7 pb-28 text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO BANNER (Vibrant & Luminous) */}
      <section 
        id="fluentic-hero-welcome-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-7 shadow-lg shadow-blue-500/15"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-blue-50 border border-white/20">
                <span className="text-base">{activeLanguage.flag}</span>
                <span>{activeLanguage.name}</span>
                <span>•</span>
                <span>{activeCefr}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/25 text-orange-100 border border-orange-300/30">
                <Flame className="w-3.5 h-3.5 text-orange-300" />
                <span>{streak}{" " + uiText("ui_beaf6f881a9b")}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/25 text-emerald-100 border border-emerald-300/30">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>{user.totalPracticeMinutes || 0}{uiText("ui_d69630b536fd")}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {user.name ? `Welcome back, ${user.name}` : 'Welcome to Fluentic'}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">{uiText("ui_a2bb34780af8")}{activeLanguage.name}{uiText("ui_4d5b8ad9fefe")}</p>
          </div>

          <div className="shrink-0">
            <button
              id="home-start-next-lesson-btn"
              onClick={() => {
                audioSynth.playSuccessChime();
                onStartNextLesson();
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>{i18n.startNextLesson || 'Continue Lesson'}</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. FLUENTIC AI CENTRAL COMMAND (Crisp & Clean) */}
      <section 
        id="home-ai-central-command-hub"
        className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{uiText("ui_92da04315826")}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">{uiText("ui_c24bee6f4b39")}</span>
              </h2>
              <p className="text-[11px] text-slate-500">{uiText("ui_7d90cc2b0a4f")}{activeLanguage.name}
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={aiQueryInput}
              onChange={(e) => setAiQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteAIQuery()}
              placeholder={`Ask anything about ${activeLanguage.name} grammar, vocabulary, or culture...`}
              disabled={isAiLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => handleExecuteAIQuery()}
            disabled={isAiLoading || !aiQueryInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isAiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{uiText("ui_ea9e45ac7083")}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteAIQuery(prompt)}
              disabled={isAiLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200/80 text-[11px] text-slate-700 hover:text-blue-700 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* AI Response Card */}
        {aiResponseData && (
          <div className="mt-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />{uiText("ui_b691a924ee85")}</span>
              {aiResponseData.register && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono uppercase font-bold">{uiText("ui_053a9fd41356")}{aiResponseData.register}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-800 leading-relaxed">
              {aiResponseData.reply}
            </p>

            {aiResponseData.targetSnippet && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-blue-100 text-xs shadow-2xs">
                <div>
                  <div className="font-bold text-slate-900">
                    "{aiResponseData.targetSnippet}"
                  </div>
                  {aiResponseData.translation && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {aiResponseData.translation}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePlayAIUtterance(aiResponseData.targetSnippet)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isPlayingAudio ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'
                  }`}
                  title={uiText("ui_d6eea3bea303")}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </button>
              </div>
            )}

            {aiResponseData.corrections && aiResponseData.corrections.length > 0 && (
              <div className="text-[11px] space-y-1 pt-1 border-t border-blue-100">
                <div className="font-semibold text-emerald-700">{uiText("ui_a220a0e30c0c")}</div>
                {aiResponseData.corrections.map((c, i) => (
                  <div key={i} className="text-slate-700">
                    <span className="text-rose-500 line-through mr-1.5">{c.original}</span>
                    <span className="text-emerald-700 font-bold mr-2">→ {c.corrected}</span>
                    <span className="text-slate-500">({c.rule})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. DAILY TARGET & STREAK DISCIPLINE (Crisp 2-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Duration Selector */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{uiText("ui_cc260e695c98")}</h3>
                <p className="text-[10px] text-slate-500">{uiText("ui_9166ca5f209f")}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              {user.dailyGoalMinutes || 15}{uiText("ui_9eb29e003681")}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {durationOptions.map((opt) => {
              const isSelected = (user.dailyGoalMinutes || 15) === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => {
                    audioSynth.playGentleFeedback();
                    if (onUpdateUser) {
                      onUpdateUser({
                        ...user,
                        dailyGoalMinutes: opt.minutes,
                      });
                    }
                    showToast(`Daily target updated to ${opt.minutes} min/day!`);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Daily Discipline & Streak Protection */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {streak}{uiText("ui_12e8e932be93")}</h3>
                <p className="text-[10px] text-slate-500">{uiText("ui_fd3000b3a8af")}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">{uiText("ui_f4b55218f43c")}</span>
          </div>

          {/* Mini Quests Checklist */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 truncate">{uiText("ui_784011f58de9")}</span>
              <span className="text-blue-600 font-bold shrink-0">{user.totalPracticeMinutes || 0}{uiText("ui_d74f4c3bdc44")}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-700 truncate">{uiText("ui_c7ca42ecfa0a")}</span>
              <span className="text-emerald-600 font-bold shrink-0">{uiText("ui_4e9d1da6f736")}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('daily-disciplines')}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center cursor-pointer"
          >{uiText("ui_d5f9236eca82")}</button>
        </div>

      </div>

      {/* 4. THREE LEARNING TRACKS (Crisp & Modern) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800">{uiText("ui_5643e743a4ab")}</h2>
          <span className="text-xs text-slate-500">{uiText("ui_2db6f91af139")}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Track 1: Path */}
          <div 
            onClick={() => {
              audioSynth.playGentleFeedback();
              onNavigate('syllabus');
            }}
            className="group p-5 rounded-2xl bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{uiText("ui_fa4d9e4b0a9f")}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{uiText("ui_3f4331c973a7")}</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-blue-600">
              <span>{uiText("ui_81b1ba4bf713")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Track 2: Dialogue */}
          <div 
            onClick={() => {
              audioSynth.playGentleFeedback();
              onNavigate('dialogue-theatre');
            }}
            className="group p-5 rounded-2xl bg-white hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{uiText("ui_4f9bea9c7b84")}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{uiText("ui_a669fe9dcde8")}</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-indigo-600">
              <span>{uiText("ui_bba165d9e520")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Track 3: Grammar */}
          <div 
            onClick={() => {
              audioSynth.playGentleFeedback();
              onNavigate('grammar-module');
            }}
            className="group p-5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{uiText("ui_912528cb8d73")}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{uiText("ui_4859660526c6")}</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-emerald-600">
              <span>{uiText("ui_28348a167195")}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. COGNITIVE RETENTION SCIENCE (Crisp White Card with Soft Tints) */}
      <section 
        id="home-cognitive-pedagogy-guide"
        className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xs p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{uiText("ui_7a13d874b001")}</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-500">{uiText("ui_80b4772edac7")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              <span>{uiText("ui_49134b7c90e1")}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{uiText("ui_09d9a83292fb")}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-orange-900">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
              <span>{uiText("ui_8fef9d759749")}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{uiText("ui_0fe5ef4ec3cb")}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>{uiText("ui_22e0fd5fba0c")}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">{uiText("ui_724200dcccce")}</p>
          </div>
        </div>
      </section>

      {/* 6. PRO STUDIO BANNER (Vibrant & Eye-Catching) */}
      <section 
        id="home-pro-studio-banner"
        className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 shadow-lg shadow-orange-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
            <Crown className="w-3.5 h-3.5 text-white" />
            <span>{uiText("ui_a26161a82f74")}</span>
          </div>
          <h3 className="text-base font-bold text-white">{uiText("ui_aa0645fcbb6e")}</h3>
          <p className="text-xs text-amber-100/90 max-w-xl leading-relaxed">{uiText("ui_9d8c33e4c091")}</p>
        </div>
        <button
          id="home-open-pro-studio-btn"
          onClick={() => {
            audioSynth.playSuccessChime();
            onNavigate('pro-studio');
          }}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{uiText("ui_e4b1b06e9872")}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
        </button>
      </section>

      {/* 7. MILESTONES & ACHIEVEMENTS (Crisp Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800">{uiText("ui_9ab651c9b5c7")}</h2>
          <span className="text-xs text-slate-500">{uiText("ui_149b50bdec71")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            const isClaimed = claimedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                onClick={() => handleClaimAchievement(ach.id, ach.title)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : ach.isUnlocked
                    ? 'bg-white border-blue-300 text-slate-900 hover:shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-lg ${isClaimed ? 'bg-emerald-100 text-emerald-700' : ach.isUnlocked ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{ach.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{ach.description}</div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isClaimed ? (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" />{uiText("ui_ddcd2779294a")}</span>
                  ) : ach.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] shadow-2xs">{uiText("ui_4ca41db02825")}</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">{uiText("ui_c1f88e9d6c41")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
