import React from 'react';
import { 
  Sparkles, 
  Mic, 
  Layers, 
  MessageSquare, 
  Swords, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  Headphones, 
  Award, 
  Crown,
  Activity,
  Globe,
  Languages
} from 'lucide-react';
import { UserProfile, Language, NavigationTab, CefrLevel } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';

interface HolographicBentoViewProps {
  user: UserProfile;
  activeLanguage: Language;
  activeCefr: CefrLevel;
  onNavigate: (tab: NavigationTab) => void;
  onOpenProModal: () => void;
}

export const HolographicBentoView: React.FC<HolographicBentoViewProps> = ({
  user,
  activeLanguage,
  activeCefr,
  onNavigate,
  onOpenProModal,
}) => {
  return (
    <div
      id="fluentic-holographic-bento-view"
      className="w-full max-w-6xl mx-auto min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 space-y-6"
    >
      {/* Executive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Language & Level Header Card (Span 2 cols) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold tracking-wide uppercase">
                Currently Learning
              </span>
              <span className="text-3xl leading-none">{activeLanguage.flag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeLanguage.name} • Level {activeCefr}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
              {activeLanguage.description}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total XP</div>
                <div className="text-lg font-extrabold text-amber-400">{user.xp} XP</div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
                <div className="text-lg font-extrabold text-orange-400">{user.streakDays} Days 🔥</div>
              </div>
            </div>

            <button
              id="bento-start-syllabus-btn"
              onClick={() => {
                audioSynth.playGentleFeedback();
                onNavigate('syllabus');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-all"
            >
              <span>Continue Lessons</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Speaking & Pronunciation Practice */}
        {/* Card 2: AI Universal Translator & Live Dialogue */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-3">
              <Languages className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">AI Translator & Dialogue</h4>
            <p className="text-xs text-slate-500 mt-1">
              Ultra-fast translation across all global languages with two-way live conversation mode.
            </p>
          </div>

          <button
            id="bento-goto-translator-btn"
            onClick={() => onNavigate('ai-translator')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span>Open AI Translator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Generative Dialogue Theatre */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Dialogue Theatre</h4>
            <p className="text-xs text-slate-500 mt-1">
              Interactive roleplay scenarios, cafe dialogues, and cultural debates with AI native speakers.
            </p>
          </div>

          <button
            id="bento-goto-dialogue-btn"
            onClick={() => onNavigate('dialogue-theatre')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span>Start Dialogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: AI Chat & Real-Life Roleplay (Span 2 cols on md) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                Super Fun
              </span>
            </div>

            <h4 className="font-extrabold text-slate-900 text-lg">AI Chat & Roleplay</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Have real conversations in fun settings (ordering coffee, asking directions, shopping) or listen to a lively AI debate!
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onNavigate('dialogue-theatre')}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors text-center"
            >
              Start AI Chat
            </button>
          </div>
        </div>

        {/* Card 5: Speed Quiz Game */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3">
              <Swords className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Speed Quiz Game</h4>
            <p className="text-xs text-slate-500 mt-1">
              60-second rapid word sprint! Test your reflexes and build big combos.
            </p>
          </div>

          <button
            onClick={() => onNavigate('grand-arena')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span>Play Speed Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 6: Grammar Fixer */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Grammar Fixer</h4>
            <p className="text-xs text-slate-500 mt-1">
              Instantly check sentences, fix tricky mistakes, and learn simple rules.
            </p>
          </div>

          <button
            onClick={() => onNavigate('neural-radar')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-between transition-colors"
          >
            <span>Fix Grammar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
