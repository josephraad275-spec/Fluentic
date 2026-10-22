import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Crown, 
  Flame, 
  Gem, 
  Headphones, 
  Volume2, 
  VolumeX, 
  Orbit, 
  LayoutGrid, 
  GitCommit, 
  ChevronDown, 
  Check, 
  Sliders, 
  User, 
  Sparkles,
  ShieldCheck,
  X,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Language, CefrLevel, SpatialViewMode, UserProfile } from '../types';
import { WORLD_LANGUAGES } from '../data/languages';
import { audioSynth } from '../services/audioSynthesizer';
import { FluenticLogo } from './FluenticLogo';
import { getI18n } from '../services/localization';

interface TopHorizonDeckProps {
  user: UserProfile;
  activeLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  activeCefr: CefrLevel;
  onSelectCefr: (cefr: CefrLevel) => void;
  activeDialect: string;
  onSelectDialect: (dialect: string) => void;
  spatialMode: SpatialViewMode;
  onSelectSpatialMode: (mode: SpatialViewMode) => void;
  soundscapeMode: 'alpha' | 'cosmic' | 'rain' | 'mute';
  onSelectSoundscape: (mode: 'alpha' | 'cosmic' | 'rain' | 'mute') => void;
  onOpenSpotlight: () => void;
  onOpenAuthModal: () => void;
  onOpenProModal: () => void;
  onOpenAITutor?: () => void;
  isAITutorActive?: boolean;
  onRetakePlacement?: () => void;
  onSignOut?: () => void;
  onSelectNativeLanguage?: (langCode: string) => void;
}

export const TopHorizonDeck: React.FC<TopHorizonDeckProps> = ({
  user,
  activeLanguage,
  onSelectLanguage,
  activeCefr,
  onSelectCefr,
  activeDialect,
  onSelectDialect,
  spatialMode,
  onSelectSpatialMode,
  soundscapeMode,
  onSelectSoundscape,
  onOpenSpotlight,
  onOpenAuthModal,
  onOpenProModal,
  onOpenAITutor,
  isAITutorActive = false,
  onRetakePlacement,
  onSignOut,
  onSelectNativeLanguage,
}) => {
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [matrixTab, setMatrixTab] = useState<'target' | 'native'>('target');
  const [langSearch, setLangSearch] = useState('');
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDialectDropdownOpen, setIsDialectDropdownOpen] = useState(false);
  const [showGemsInfo, setShowGemsInfo] = useState(false);
  const [showStreakInfo, setShowStreakInfo] = useState(false);
  const [volume, setVolume] = useState(0.4);

  // Level Locked Modal State
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
  const [attemptedLevel, setAttemptedLevel] = useState<CefrLevel>('A2');

  const i18n = getI18n(user?.nativeLanguageCode || 'nl');
  const isArabic = (user?.nativeLanguageCode || 'en') === 'ar';
  const isDutch = (user?.nativeLanguageCode || 'en') === 'nl';
  const unlockedLevels = user?.unlockedCefrLevels || ['A1'];

  const filteredLanguages = WORLD_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.family.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleLevelClick = (lvl: CefrLevel) => {
    if (unlockedLevels.includes(lvl)) {
      audioSynth.playGentleFeedback();
      onSelectCefr(lvl);
    } else {
      audioSynth.playGentleFeedback();
      setAttemptedLevel(lvl);
      setIsLockedModalOpen(true);
    }
  };

  return (
    <>
      <header
        id="fluentic-top-horizon-deck"
        className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-xs transition-all"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="fluentic-brand-logo-btn"
              onClick={onOpenSpotlight}
              className="flex items-center group cursor-pointer focus:outline-none"
              title="Fluentic"
            >
              <FluenticLogo variant="horizontal" size="sm" showBadge={false} />
            </button>

            {/* Target Language Button */}
            <button
              id="top-language-selector-btn"
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 transition-all text-xs sm:text-sm font-bold shadow-xs hover:border-blue-500 cursor-pointer"
            >
              <span className="text-base sm:text-lg leading-none">{activeLanguage.flag}</span>
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{activeLanguage.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[10px] sm:text-xs font-black text-blue-800 border border-blue-200">
                {activeCefr}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Native Language (UI & Translation Language) Badge & Switcher */}
            <button
              id="top-native-language-btn"
              onClick={() => {
                setMatrixTab('native');
                setIsLangModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all hover:border-blue-500 cursor-pointer shadow-2xs"
              title={
                isArabic
                  ? 'لغتي الأم: العربية (انقر للتغيير)'
                  : isDutch 
                  ? 'Mijn moedertaal: Nederlands (klik om te wijzigen)' 
                  : 'My native language (click to change)'
              }
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{isArabic ? '🇸🇦 AR' : isDutch ? '🇳🇱 NL' : (user.nativeLanguageCode || 'en').toUpperCase()}</span>
            </button>

            {/* Dialect Selector Dropdown (if available) */}
            {activeLanguage.dialects && activeLanguage.dialects.length > 0 && (
              <div className="relative hidden md:block">
                <button
                  id="top-dialect-selector-btn"
                  onClick={() => setIsDialectDropdownOpen(!isDialectDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer"
                >
                  <span className="max-w-[110px] truncate">{activeDialect || activeLanguage.dialects[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isDialectDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-40 text-slate-900">
                    <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {i18n.selectDialect}
                    </p>
                    {activeLanguage.dialects.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          onSelectDialect(d);
                          setIsDialectDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-blue-50 text-slate-700 hover:text-blue-900 cursor-pointer"
                      >
                        <span className="truncate">{d}</span>
                        {(activeDialect === d || (!activeDialect && d === activeLanguage.dialects![0])) && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Placement Test Retake & Dedicated AI Tutor Button */}
          <div className="flex items-center gap-2">
            {onOpenAITutor && (
              <button
                id="top-deck-ai-tutor-btn"
                onClick={() => {
                  audioSynth.playGentleFeedback();
                  onOpenAITutor();
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isAITutorActive
                    ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] border border-[#C5A059]/40 font-black shadow-xs scale-102'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 font-bold shadow-2xs'
                }`}
                title="Open Fluentic AI Polyglot Tutor"
              >
                <Sparkles className={`w-3.5 h-3.5 ${
                  isAITutorActive ? 'text-[#D4AF37] fill-[#D4AF37]/30' : 'text-[#C5A059]'
                }`} />
                <span>AI Tutor</span>
              </button>
            )}

            {onRetakePlacement && (
              <button
                onClick={() => onRetakePlacement()}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{i18n.retakeTest}</span>
              </button>
            )}
          </div>

          {/* Right Section: Pro Studio Link, Streak, Gems, Soundscape & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Direct Pro Studio Link with Real Payment Plans */}
            <button
              id="top-deck-pro-studio-btn"
              onClick={() => {
                audioSynth.playGentleFeedback();
                onOpenProModal();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-sm transition-all hover:scale-102 active:scale-98 cursor-pointer border border-amber-400/40"
              title="Open Fluentic Pro Studio & Real Payment Plans"
            >
              <Crown className="w-3.5 h-3.5 fill-white text-white" />
              <span>{isArabic ? 'استوديو Pro' : 'Pro Studio'}</span>
              <span className="hidden sm:inline px-1 py-0.2 rounded bg-white/25 text-[10px] uppercase tracking-wider font-extrabold">
                {isArabic ? 'الخطط' : 'Plans'}
              </span>
            </button>

            {/* Streak Counter with Interactive Usage Explanation */}
            <div className="relative">
              <button
                type="button"
                id="top-deck-streak-pill"
                onClick={() => {
                  setShowStreakInfo(!showStreakInfo);
                  setShowGemsInfo(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black shadow-2xs transition-colors cursor-pointer"
                title={isArabic ? 'انقر لمعرفة فائدة سلسلة الأيام' : 'Click to see what Day Streak is used for'}
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>{user?.streakDays || 0}{isArabic ? 'يوم' : 'd'}</span>
              </button>

              {showStreakInfo && (
                <div
                  className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white border border-orange-200 shadow-xl z-50 text-slate-900 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-orange-100 text-xs font-black text-orange-800">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                      {isArabic ? `سلسلة الأيام (${user?.streakDays || 0} يوم)` : `Day Streak (${user?.streakDays || 0} days)`}
                    </span>
                    <button
                      onClick={() => setShowStreakInfo(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    <strong>{isArabic ? 'ما هي فائدتها؟' : 'What is it used for?'}</strong> {isArabic ? 'تتبع أيام الممارسة اللغوية المستمرة لترسيخ التعلم.' : 'Your streak tracks consecutive days of daily language practice.'}
                  </p>
                  <ul className="text-[11px] text-slate-600 mt-1.5 space-y-1 list-disc list-inside">
                    <li>{isArabic ? 'فتح مكافآت وجواهر عند بلوغ 7 و14 و30 يوماً.' : 'Unlocks bonus gems at 7, 14, and 30-day milestones.'}</li>
                    <li>{isArabic ? 'حماية الانضباط والمرونة العصبية في تثبيت اللغة.' : 'Protects your linguistic momentum and neuroplasticity.'}</li>
                    <li>{isArabic ? 'حماية السلسلة (50 💎) تمنع فقدان تقدمك في حال الانشغال!' : 'If missed, a Streak Shield (50 💎) prevents it from resetting!'}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Cognitive Retention & CEFR Structural Mastery Indicator */}
            <div className="relative">
              <button
                type="button"
                id="top-deck-mastery-pill"
                onClick={() => {
                  setShowGemsInfo(!showGemsInfo);
                  setShowStreakInfo(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-black shadow-2xs transition-colors cursor-pointer"
                title="Cognitive Retention Science & CEFR Structural Mastery"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{user?.activeCefr || 'A1'} {isArabic ? 'إتقان' : isDutch ? 'Beheersing' : 'Mastery'}</span>
              </button>

              {showGemsInfo && (
                <div
                  className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-white border border-blue-200 shadow-xl z-50 text-slate-900 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-blue-100 text-xs font-black text-blue-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      {isArabic ? 'علم الاكتساب اللغوي والذاكرة' : isDutch ? 'Cognitieve Verwervingswetenschap' : 'Cognitive Retention Science'}
                    </span>
                    <button
                      onClick={() => setShowGemsInfo(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    {isArabic 
                      ? 'تعتمد Fluentic على علوم الذاكرة العصبية والتدرج المنهجي بدلاً من الألعاب السطحية:' 
                      : isDutch
                      ? 'Fluentic vervangt willekeurige gamescores door bewezen cognitieve leermethodologie:'
                      : 'Fluentic eliminates arbitrary arcade scores in favor of cognitive linguistic science:'}
                  </p>
                  <div className="text-[11px] text-slate-600 mt-1.5 space-y-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-50/70 border border-blue-100">
                      🧠 <strong>{isArabic ? 'التكرار المتباعد FSRS:' : isDutch ? 'FSRS Gespreide Herhaling:' : 'FSRS Spaced Retention:'}</strong> {isArabic ? 'فترات استدعاء ذكية لترسيخ المفردات في الذاكرة الدائمة.' : isDutch ? 'Actieve herinneringsintervallen voor langdurige neuronale opslag.' : 'Optimal active recall intervals to maximize long-term vocabulary retention.'}
                    </div>
                    <div className="p-1.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                      📚 <strong>{isArabic ? 'التدرج المعياري CEFR:' : isDutch ? 'ERK Structurele Opbouw:' : 'CEFR Scaffolding:'}</strong> {isArabic ? 'تدرج حقيقي من أصوات الحروف (A1) إلى الخطاب الرسمي (C2).' : isDutch ? 'Doelgerichte progressie van klankregels (A1) tot formeel debat (C2).' : 'Graduated linguistic progression from sound mechanics (A1) to formal debate (C2).'}
                    </div>
                    <div className="p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                      🎯 <strong>{isArabic ? 'إتقان حقيقي بلا تشتيت:' : isDutch ? 'Geen Spelstress:' : 'Zero Fluff & Pure Mastery:'}</strong> {isArabic ? 'يقاس النجاح بالطلاقة الحقيقية والفهم العميق للمفاهيم.' : isDutch ? 'Succes wordt gemeten in echt begrip en vloeiende communicatie.' : 'Success measured purely by structural fluency and communicative depth.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Soundscape Controller */}
            <div className="relative">
              <button
                id="top-deck-soundscape-btn"
                onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
                className={`p-2 rounded-xl transition-all border cursor-pointer ${
                  soundscapeMode !== 'mute'
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                }`}
                title={i18n.soundscape}
              >
                {soundscapeMode !== 'mute' ? (
                  <Headphones className="w-4 h-4 text-blue-600 animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {isSoundMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-blue-600" />
                      {i18n.soundscape}
                    </span>
                    <button
                      onClick={() => setIsSoundMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    {[
                      { id: 'mute', label: 'Stil / Gedempt' },
                      { id: 'alpha', label: 'Binaurale Alpha Golven (10Hz)' },
                      { id: 'cosmic', label: 'Kosmische Harmonie (432Hz)' },
                      { id: 'rain', label: 'Warme Zachte Regen' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          audioSynth.playGentleFeedback();
                          onSelectSoundscape(mode.id as any);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all cursor-pointer ${
                          soundscapeMode === mode.id
                            ? 'bg-blue-50 text-blue-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{mode.label}</span>
                        {soundscapeMode === mode.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Auth Trigger */}
            <div className="relative">
              <button
                id="top-deck-profile-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {user?.avatar || (user?.name || 'TL').slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold max-w-[90px] truncate">
                  {user?.name || (isArabic ? 'أدخل اسمك' : i18n.guestUser)}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-slate-900 space-y-2 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pb-2 border-b border-slate-100">
                    <div className="font-extrabold text-sm text-slate-900 truncate">
                      {user?.name || (isArabic ? 'أدخل اسمك' : isDutch ? 'Gastgebruiker' : 'Guest Explorer')}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {user?.email || 'explorer@fluentic.local'}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                      <span>{isArabic ? 'اللغة الأم:' : isDutch ? 'Moedertaal:' : 'Native Language:'}</span>
                      <span className="uppercase font-bold">{user?.nativeLanguageCode || 'nl'}</span>
                      <span>•</span>
                      <span>{isArabic ? 'اللغة المستهدفة:' : isDutch ? 'Doeltaal:' : 'Target Language:'}</span>
                      <span>{activeLanguage.flag} {activeLanguage.name}</span>
                    </div>

                    {/* Account Database Stats Pill */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-blue-600">
                        💎 {user?.gems || 0}
                      </span>
                      <span className="flex items-center gap-1 text-orange-600">
                        🔥 {user?.streakDays || 0}d
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        ⏱️ {user?.totalPracticeMinutes || 0}m
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onRetakePlacement) onRetakePlacement();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {isArabic ? '🎯 إعادة اختبار تحديد المستوى' : isDutch ? '🎯 Niveautest Opnieuw Doen' : '🎯 Retake Placement Test'}
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {isArabic ? '🔐 الحساب والأمان المشفر' : isDutch ? '🔐 Account & Versleuteling' : '🔐 Account & Encryption'}
                    </button>

                    {onSignOut && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-t border-slate-100 flex items-center justify-between"
                      >
                        <span>{isArabic ? '🔄 تبديل الحساب / تحديث البيانات' : isDutch ? '🔄 Wissel Account / Re-log Database' : '🔄 Switch Account / Re-log'}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md font-extrabold">DB</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* LANGUAGE & LEVEL MATRIX MODAL */}
      {isLangModalOpen && (
        <div
          id="fluentic-language-matrix-modal"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLangModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">
                    {matrixTab === 'target' 
                      ? i18n.selectLanguage 
                      : isArabic 
                      ? 'اختر لغتك الأم' 
                      : isDutch 
                      ? 'Kies Jouw Moedertaal' 
                      : 'Select Your Native Language'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {matrixTab === 'target' 
                      ? (isArabic ? 'أكثر من 55 لغة عالمية متاحة للتعلم. اختر لغتك المستهدفة.' : isDutch ? '55 talen beschikbaar om te leren. Kies je doeltaal.' : '55 languages available. Choose your target.')
                      : (isArabic ? 'اختر لغتك الأم. ستتكيف جميع التعليمات والواجهة والقواعد معها بنسبة 100%.' : isDutch ? 'Kies jouw moedertaal. Alle uitleg en vertalingen worden hierop afgestemd.' : 'Choose your native language. All UI, rules, and guidance will adapt 100%.')}
                  </p>
                </div>
              </div>
              <button
                id="language-matrix-close-btn"
                onClick={() => setIsLangModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Target Language vs Native Language */}
            <div className="px-5 pt-3 pb-1 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMatrixTab('target')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  matrixTab === 'target'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {isArabic ? '🎯 اللغة المستهدفة للتعلم (55)' : isDutch ? '🎯 Doeltaal om te leren (55)' : '🎯 Target Language (55)'}
              </button>
              <button
                type="button"
                onClick={() => setMatrixTab('native')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  matrixTab === 'native'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {isArabic ? '🗣️ لغتي الأم (لغة واجهة التطبيق)' : isDutch ? '🗣️ Mijn Moedertaal (55)' : '🗣️ Native Language (55)'}
              </button>
            </div>

            {/* Level Bar & Search Filter */}
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Level Selector with Locks (only in target language mode) */}
              {matrixTab === 'target' ? (
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-700 mr-1">{i18n.level}:</span>
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => {
                    const isUnlocked = unlockedLevels.includes(lvl);
                    const isCurrent = activeCefr === lvl;

                    return (
                      <button
                        key={lvl}
                        id={`cefr-filter-${lvl}-btn`}
                        onClick={() => handleLevelClick(lvl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isUnlocked
                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-amber-300 hover:bg-amber-50'
                        }`}
                        title={isUnlocked ? `${lvl} (${i18n.unlocked})` : `${lvl} (${i18n.locked})`}
                      >
                        <span>{lvl}</span>
                        {!isUnlocked && <Lock className="w-3 h-3 text-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs font-semibold text-slate-600">
                  {isArabic
                    ? 'اختر لغة لتعيينها كلغتك الأم للواجهة والدروس:'
                    : isDutch
                    ? 'Selecteer een taal om direct als moedertaal in te stellen:'
                    : 'Select a language to set as your native language for UI and instructions:'}
                </div>
              )}

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    isArabic
                      ? 'ابحث في 55 لغة...'
                      : isDutch
                      ? 'Zoek in 55 talen...'
                      : 'Search across 55 languages...'
                  }
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Language Grid */}
            <div className="overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredLanguages.map((lang) => {
                const isSelected = matrixTab === 'target' 
                  ? activeLanguage.code === lang.code 
                  : (user.nativeLanguageCode || 'nl') === lang.code;

                return (
                  <button
                    key={lang.code}
                    id={`matrix-lang-${lang.code}-btn`}
                    onClick={() => {
                      audioSynth.playSuccessChime();
                      if (matrixTab === 'target') {
                        onSelectLanguage(lang);
                      } else {
                        if (onSelectNativeLanguage) {
                          onSelectNativeLanguage(lang.code);
                        }
                      }
                      setIsLangModalOpen(false);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white hover:bg-blue-50/40 border-slate-200 hover:border-blue-300 text-slate-900'
                    }`}
                  >
                    <span className="text-2xl leading-none mt-0.5">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-black text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {lang.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {lang.family}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {lang.nativeName}
                      </div>
                      <div className={`text-[11px] truncate mt-1 italic ${isSelected ? 'text-blue-100' : 'text-blue-600/80'}`}>
                        "{lang.sampleGreeting}"
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {isArabic
                    ? 'جميع اللغات الـ 55 متاحة بالكامل دون قيود على القلوب أو المحاولات'
                    : isDutch
                    ? 'Alle 55 talen beschikbaar zonder hartjesbeperkingen'
                    : 'All 55 languages available with zero artificial heart caps'}
                </span>
              </div>
              <span className="font-bold text-blue-600">
                {isArabic ? '55 لغة جاهزة' : isDutch ? '55 Talen Klaar' : '55 Languages Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL LOCKED WARNING MODAL */}
      {isLockedModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLockedModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 text-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {isArabic
                  ? `المستوى ${attemptedLevel} مقفل!`
                  : isDutch
                  ? `Niveau ${attemptedLevel} is Vergrendeld!`
                  : `Level ${attemptedLevel} is Locked!`}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isArabic
                  ? `لا يمكنك الانتقال مباشرة إلى المستوى ${attemptedLevel} دون اجتياز اختبار تحديد المستوى القياسي المكون من 10 أسئلة لمعايرة مهاراتك بدقة.`
                  : isDutch
                  ? `Je kunt niet zomaar naar niveau ${attemptedLevel} wisselen zonder de niveautest af te leggen, zelfs niet na het inloggen. Doe de gestandaardiseerde 10-vragen niveautest om je niveau te kwalificeren!`
                  : `You cannot jump directly to level ${attemptedLevel} without qualifying through the standardized 10-question placement assessment.`}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {isArabic
                  ? 'يختبر التقييم درجات الإطار الأوروبي المشترك (من A1 حتى C2).'
                  : isDutch
                  ? 'De test toetst 10 treden van de ERK-ladder (A1 t/m C2).'
                  : 'The test assesses standard CEFR framework benchmarks (A1 through C2).'}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLockedModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                {i18n.close}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLockedModalOpen(false);
                  setIsLangModalOpen(false);
                  if (onRetakePlacement) onRetakePlacement();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{i18n.takeTestNow}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
