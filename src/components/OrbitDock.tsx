import React, { useEffect } from 'react';
import { 
  Home, 
  Sparkles, 
  BookOpen, 
  Languages, 
  Crown, 
  Calendar, 
  Target,
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { NavigationTab } from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import { getI18n } from '../services/localization';

interface OrbitDockProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAITutor: () => void;
  isAITutorActive?: boolean;
  isPro: boolean;
  nativeLanguageCode?: string;
  soundscapeMode?: 'alpha' | 'cosmic' | 'rain' | 'mute';
  onToggleSoundscape?: () => void;
}

export const OrbitDock: React.FC<OrbitDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenAITutor,
  isAITutorActive = false,
  isPro,
  nativeLanguageCode = 'nl',
  soundscapeMode = 'mute',
  onToggleSoundscape,
}) => {
  const i18n = getI18n(nativeLanguageCode);
  const isDutch = nativeLanguageCode === 'nl';

  // Keyboard shortcut listener (1 to 8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case '1':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('home');
          break;
        case '2':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('syllabus');
          break;
        case '3':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('grammar-module');
          break;
        case '4':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('ai-translator');
          break;
        case '5':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('pro-studio');
          break;
        case '6':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onOpenAITutor();
          break;
        case '7':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('daily-disciplines');
          break;
        case '8':
          e.preventDefault();
          audioSynth.playGentleFeedback();
          onSelectTab('focus');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab, onOpenAITutor]);

  return (
    <nav
      id="fluentic-spatial-orbit-dock"
      aria-label="Main navigation dock"
      className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 px-2 sm:px-3 py-1.5 rounded-2xl bg-[#0A1128]/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-slate-950/40 flex items-center gap-1 sm:gap-1.5 max-w-[98vw] overflow-x-auto no-scrollbar scrollbar-none text-slate-200"
    >
      {/* 1. Home */}
      <button
        id="dock-tab-home-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('home');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'home'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navHome || 'Home'} (1)`}
      >
        <Home className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'home' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'home' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navHome || 'Home'}
        </span>
      </button>

      {/* 2. Path */}
      <button
        id="dock-tab-path-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('syllabus');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'syllabus'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navPath || 'Path'} (2)`}
      >
        <Sparkles className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'syllabus' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'syllabus' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navPath || 'Path'}
        </span>
      </button>

      {/* 3. Grammar */}
      <button
        id="dock-tab-grammar-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('grammar-module');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'grammar-module'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navGrammar || 'Grammar'} (3)`}
      >
        <BookOpen className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'grammar-module' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'grammar-module' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navGrammar || 'Grammar'}
        </span>
      </button>

      {/* 4. AI Translator */}
      <button
        id="dock-tab-translator-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('ai-translator');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'ai-translator'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navTranslator || 'AI Translator'} (4)`}
      >
        <Languages className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'ai-translator' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'ai-translator' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navTranslator || 'AI Translator'}
        </span>
      </button>

      {/* 5. Pro Studio */}
      <button
        id="dock-tab-pro-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('pro-studio');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'pro-studio'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navPro || 'Pro Studio'} (5)`}
      >
        {!isPro && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-1 ring-slate-900 shadow-2xs" />
        )}
        <Crown className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'pro-studio' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'pro-studio' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navPro || 'Pro Studio'}
        </span>
      </button>

      {/* 6. AI Tutor: Neutral navy/slate (#1C2541) when inactive; Burnished Gold gradient (#D4AF37) ONLY when active */}
      <button
        id="dock-tab-ai-tutor-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onOpenAITutor();
        }}
        className={`relative flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] py-1.5 px-2.5 rounded-xl transition-all group cursor-pointer shrink-0 ${
          isAITutorActive
            ? 'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#C5A059] text-slate-950 font-black shadow-lg shadow-amber-400/25 border border-[#D4AF37] scale-105 ring-2 ring-amber-300/40'
            : 'bg-[#1C2541] hover:bg-[#253256] text-slate-200 hover:text-white border border-slate-700/80 shadow-xs'
        }`}
        title={`${i18n.navAITutor || 'AI Tutor'} (6)`}
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
            isAITutorActive ? 'text-slate-950 fill-slate-950/25' : 'text-slate-300 group-hover:text-white'
          }`} />
          {isAITutorActive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
            </span>
          )}
        </div>
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          isAITutorActive ? 'text-slate-950 font-black' : 'text-slate-200 font-bold group-hover:text-white'
        }`}>
          {i18n.navAITutor || 'AI Tutor'}
        </span>
      </button>

      {/* 7. Streaks & Goals */}
      <button
        id="dock-tab-streaks-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('daily-disciplines');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'daily-disciplines'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navDisciplines || 'Streaks & Goals'} (7)`}
      >
        <Calendar className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'daily-disciplines' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'daily-disciplines' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navDisciplines || 'Streaks & Goals'}
        </span>
      </button>

      {/* 8. Focus (at the far end) */}
      <button
        id="dock-tab-focus-btn"
        type="button"
        onClick={() => {
          audioSynth.playGentleFeedback();
          onSelectTab('focus');
        }}
        className={`relative flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1.5 px-2 rounded-xl transition-all group cursor-pointer shrink-0 ${
          activeTab === 'focus' || activeTab === 'dialogue-theatre'
            ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] font-black shadow-md border border-[#D4AF37]/50 scale-102 ring-1 ring-[#D4AF37]/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
        }`}
        title={`${i18n.navFocus || 'Focus'} (8)`}
      >
        <Target className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${
          activeTab === 'focus' || activeTab === 'dialogue-theatre' ? 'text-[#D4AF37]' : 'text-slate-300'
        }`} />
        <span className={`text-[10px] sm:text-[11px] tracking-normal whitespace-nowrap text-center mt-0.5 ${
          activeTab === 'focus' || activeTab === 'dialogue-theatre' ? 'text-[#D4AF37] font-black' : 'text-slate-300 font-semibold'
        }`}>
          {i18n.navFocus || 'Focus'}
        </span>
      </button>

      {/* Ambient Audio Toggle */}
      {onToggleSoundscape && (
        <div className="hidden lg:flex items-center pl-1 border-l border-slate-800 shrink-0">
          <button
            id="dock-toggle-binaural-btn"
            type="button"
            onClick={() => {
              audioSynth.playGentleFeedback();
              onToggleSoundscape();
            }}
            title={
              soundscapeMode && soundscapeMode !== 'mute'
                ? `Focus Audio Active (${soundscapeMode}) • Tap to Mute`
                : 'Toggle Focus Audio'
            }
            className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-1.5 rounded-xl transition-all cursor-pointer ${
              soundscapeMode && soundscapeMode !== 'mute'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundscapeMode && soundscapeMode !== 'mute' ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-[9px] font-bold mt-0.5">
              {soundscapeMode && soundscapeMode !== 'mute' ? 'ON' : 'Audio'}
            </span>
          </button>
        </div>
      )}
    </nav>
  );
};
