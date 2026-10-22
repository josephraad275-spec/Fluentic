import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Mic, 
  MessageSquare, 
  Layers, 
  Swords, 
  Calendar, 
  Activity, 
  Crown, 
  Globe, 
  Headphones, 
  Code, 
  X,
  Volume2
} from 'lucide-react';
import { NavigationTab, CefrLevel, Language } from '../types';
import { WORLD_LANGUAGES } from '../data/languages';
import { audioSynth } from '../services/audioSynthesizer';

interface CommandSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onSelectLanguage: (lang: Language) => void;
  onSetCefr: (cefr: CefrLevel) => void;
  onSetSoundscape: (mode: 'alpha' | 'cosmic' | 'rain' | 'mute') => void;
  onOpenProModal: () => void;
  activeLanguage: Language;
}

export const CommandSpotlight: React.FC<CommandSpotlightProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectLanguage,
  onSetCefr,
  onSetSoundscape,
  onOpenProModal,
  activeLanguage,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent toggles
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { id: 'act-1', title: 'Open Syllabus & Learning Path', icon: Sparkles, tab: 'syllabus' as NavigationTab, hint: 'Key 2' },
    { id: 'act-2', title: 'Generative Scenario Studio & Debates', icon: MessageSquare, tab: 'dialogue-theatre' as NavigationTab, hint: 'Key 3' },
    { id: 'act-3', title: 'Grammar Modules & Conjugation', icon: Activity, tab: 'grammar-module' as NavigationTab, hint: 'Key 4' },
    { id: 'act-4', title: 'AI Universal Translator & Live Dialogue', icon: Globe, tab: 'ai-translator' as NavigationTab, hint: 'Key 5' },
    { id: 'act-5', title: 'Daily Disciplines & Streak Rituals', icon: Calendar, tab: 'daily-disciplines' as NavigationTab, hint: 'Key 6' },
    { id: 'act-6', title: 'Pro Studio & Premium Tiers', icon: Crown, tab: 'pro-studio' as NavigationTab, hint: 'Key 7' },
  ];

  const soundActions = [
    { id: 'snd-1', title: 'Play 432Hz Alpha Study Waves', mode: 'alpha' as const, label: 'Alpha 432Hz' },
    { id: 'snd-2', title: 'Play Cosmic Harmonic Drone', mode: 'cosmic' as const, label: 'Harmonic Drone' },
    { id: 'snd-3', title: 'Play Gentle Rain Focus Noise', mode: 'rain' as const, label: 'Gentle Rain' },
    { id: 'snd-4', title: 'Mute Background Soundscapes', mode: 'mute' as const, label: 'Mute' },
  ];

  const matchingLanguages = WORLD_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(query.toLowerCase()) ||
      l.family.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const filteredActions = quickActions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      id="fluentic-command-spotlight-modal"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="spotlight-search-input"
            type="text"
            placeholder="Type a command, jump to language, or switch soundscape (e.g. 'French', 'Speech', 'Alpha')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base outline-none font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            id="spotlight-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Nav Section */}
          {filteredActions.length > 0 && (
            <div>
              <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Spatial Navigation
              </p>
              <div className="space-y-1">
                {filteredActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      id={`spotlight-${action.tab}-btn`}
                      onClick={() => {
                        audioSynth.playGentleFeedback();
                        onNavigate(action.tab);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-slate-700 hover:text-slate-900 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-amber-50 group-hover:text-amber-700 text-slate-600 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{action.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {action.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Languages Section */}
          {matchingLanguages.length > 0 && (
            <div>
              <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                World Languages (55+ Available)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchingLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    id={`spotlight-lang-${lang.code}-btn`}
                    onClick={() => {
                      audioSynth.playSuccessChime();
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all ${
                      activeLanguage.code === lang.code
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="font-semibold text-sm leading-tight">{lang.name}</div>
                        <div className="text-xs text-slate-400">{lang.nativeName}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {lang.family}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Soundscapes quick action */}
          <div>
            <p className="px-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Focus Binaural Soundscapes (Web Audio)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {soundActions.map((snd) => (
                <button
                  key={snd.id}
                  id={`spotlight-sound-${snd.mode}-btn`}
                  onClick={() => {
                    onSetSoundscape(snd.mode);
                    audioSynth.startSoundscape(snd.mode);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{snd.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono">1-8</kbd>
            <span>Spotlight:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono">Cmd+K</kbd>
          </div>
          <span className="font-medium text-amber-700">Fluentic Omni-Studio 2.0</span>
        </div>
      </div>
    </div>
  );
};
