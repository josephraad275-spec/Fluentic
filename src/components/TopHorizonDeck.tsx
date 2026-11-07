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
  onOpenSignInPage?: () => void;
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
  onOpenSignInPage,
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
        className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-xs transition-all text-slate-900"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Language Selector */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              id="fluentic-brand-logo-btn"
              onClick={onOpenSpotlight}
              className="flex items-center group cursor-pointer focus:outline-none"
              title="Fluentic"
            >
              <span className="sm:hidden"><FluenticLogo variant="icon" size="sm" /></span>
              <span className="hidden sm:inline"><FluenticLogo variant="horizontal" size="sm" showTagline={false} /></span>
            </button>

            {/* Target Language Button */}
            <button
              id="top-language-selector-btn"
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 transition-all text-xs sm:text-sm font-semibold shadow-xs hover:border-blue-400 cursor-pointer"
            >
              <span className="text-base sm:text-lg leading-none">{activeLanguage.flag}</span>
              <span className="hidden sm:inline max-w-[130px] truncate">{activeLanguage.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] sm:text-xs font-mono font-bold text-blue-700 border border-blue-200">
                {activeCefr}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Quick Spotlight Shortcut Pill */}
          <button
            onClick={onOpenSpotlight}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-medium"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search curriculum, scenarios, grammar...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-500 border border-slate-300">⌘K</kbd>
          </button>

          {/* Right Section: Streak, Gems, AI Tutor & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Streak Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{user?.streakDays || 0}d</span>
            </div>

            {/* Gems Wallet */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <Gem className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>{user?.gems || 0}</span>
            </div>

            {/* Dedicated AI Tutor Button */}
            {onOpenAITutor && (
              <button
                id="top-deck-ai-tutor-btn"
                onClick={() => {
                  audioSynth.playGentleFeedback();
                  onOpenAITutor();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer font-bold ${
                  isAITutorActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-2xs'
                }`}
                title="Open Fluentic AI Tutor"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAITutorActive ? 'text-white' : 'text-blue-600'} animate-pulse`} />
                <span className="hidden sm:inline">AI Tutor</span>
              </button>
            )}

            {/* Direct Sign In Page Button */}
            {onOpenSignInPage && (
              <button
                id="top-deck-signin-btn"
                onClick={() => {
                  audioSynth.playGentleFeedback();
                  onOpenSignInPage();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
                title="Go to Sign In & Setup Page"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user?.name && user.name !== 'Explorer' && user.name !== 'Enter your name' ? 'Switch / Sign In' : 'Sign In'}</span>
              </button>
            )}

            {/* Profile Avatar / Settings Button */}
            <button
              id="top-deck-auth-profile-btn"
              onClick={() => {
                audioSynth.playGentleFeedback();
                onOpenAuthModal();
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-all cursor-pointer"
              title="Account & Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[80px] truncate">
                {user?.name || 'Explorer'}
              </span>
            </button>
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
