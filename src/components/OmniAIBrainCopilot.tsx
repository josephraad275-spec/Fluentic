import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Volume2, 
  Mic, 
  MicOff, 
  Bot, 
  Zap, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Language, CefrLevel, UserProfile } from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import { speechDetector } from '../services/speechDetectionService';
import { stripTransliteration } from '../services/languageTypography';
import { OmniAppEngineClient } from '../services/omniEngineService';

interface OmniAIBrainCopilotProps {
  activeLanguage: Language;
  activeCefr: CefrLevel;
  user: UserProfile;
  currentContext?: string;
}

interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  targetSnippet?: string;
  audioReadyText?: string;
  translation?: string;
  corrections?: Array<{ original: string; corrected: string; rule: string }>;
  idioms?: Array<{ idiom: string; literal: string; pragmatic: string }>;
  register?: string;
  suggestedDrills?: string[];
  latencyMs?: number;
  timestamp: string;
}

export const OmniAIBrainCopilot: React.FC<OmniAIBrainCopilotProps> = ({
  activeLanguage,
  activeCefr,
  user,
  currentContext = 'General Navigation',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'surgery' | 'drill'>('chat');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLatency, setLastLatency] = useState<number>(140);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-copilot',
      sender: 'ai',
      text: `Hello ${user.name || 'there'}! I am the Fluentic Central AI Brain, governing all tutoring, translation, and grammar across ${activeLanguage.name} (Level ${activeCefr}). Ask me anything, paste a tricky phrase, or request an instant drill!`,
      targetSnippet: activeLanguage.sampleGreeting,
      audioReadyText: activeLanguage.sampleGreeting,
      translation: `Core native greeting in ${activeLanguage.name}`,
      register: 'neutral',
      suggestedDrills: [
        `Explain formal vs informal in ${activeLanguage.name}`,
        `Give me a 30-second rapid speaking drill`,
        `Check my pronunciation and grammar`,
      ],
      timestamp: 'Now',
    },
  ]);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Speech Recognition toggle
  const toggleListening = async () => {
    if (isListening) {
      speechDetector.stopListening();
      setIsListening(false);
      return;
    }

    audioSynth.playGentleFeedback();
    setIsListening(true);
    const started = await speechDetector.startListening({
      langCode: activeLanguage.code,
      onTranscript: (transcript) => {
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
    if (!started) setIsListening(false);
  };

  // Send message to ultra-fast backend engine
  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || inputText).trim();
    if (!text || isLoading) return;

    audioSynth.playGentleFeedback();
    const startTime = performance.now();
    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const activeChat = await OmniAppEngineClient.executeActiveChat({
        userMessage: text,
        targetLanguage: activeLanguage.name,
        targetLanguageCode: activeLanguage.code,
        nativeLanguage: user.nativeLanguage || 'English',
        nativeLanguageCode: user.nativeLanguageCode || 'en',
        cefrLevel: activeCefr,
        learningIntent: user.learningIntent || 'conversational',
        history: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'tutor', text: m.text })),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLastLatency(elapsed);

      if (activeChat?.tutor_turn) {
        const turn = activeChat.tutor_turn;
        const targetClean = turn.targetLanguageUtterance ? stripTransliteration(turn.targetLanguageUtterance) : undefined;
        const audioClean = turn.audioReadyText ? stripTransliteration(turn.audioReadyText) : targetClean;

        const aiMsg: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: turn.reply || 'Here is the analysis:',
          targetSnippet: targetClean,
          audioReadyText: audioClean,
          translation: turn.translation,
          corrections: turn.contextualCorrections?.map((c) => ({
            original: c.originalSnippet,
            corrected: c.correctedSnippet,
            rule: c.grammaticalRule,
          })),
          idioms: turn.idiomBreakdowns?.map((i) => ({
            idiom: i.idiom,
            literal: i.literalMeaning,
            pragmatic: i.pragmaticUsage,
          })),
          register: turn.registerNotes?.detectedRegister,
          suggestedDrills: turn.pedagogicalNextPrompts,
          latencyMs: elapsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        audioSynth.playSuccessChime();
        return;
      }
      throw new Error('Omni engine returned empty payload');
    } catch {
      const elapsed = Math.round(performance.now() - startTime);
      setLastLatency(elapsed);
      const cleanGreeting = stripTransliteration(activeLanguage.sampleGreeting || 'Hello');
      const fallbackMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Understood! In ${activeLanguage.name} at CEFR Level ${activeCefr}, grammatical precision and active recall are fundamental. Let us anchor with high-frequency structures.`,
        targetSnippet: cleanGreeting,
        audioReadyText: cleanGreeting,
        translation: `High-frequency phrasing in ${activeLanguage.name}`,
        register: 'neutral',
        latencyMs: elapsed,
        suggestedDrills: [
          `Translate: "I would like to order a warm drink"`,
          `How do I say "See you tomorrow" politely?`,
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Pill Trigger (Always visible in bottom-right corner) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
          <button
            id="fluentic-omni-ai-brain-trigger"
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              audioSynth.playGentleFeedback();
            }}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-[0_10px_25px_rgba(37,99,235,0.35)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-400/40"
            title="Open Fluentic Omni AI Brain"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
            </div>
            <div className="flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Fluentic AI Brain</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tracking-tight">
              {lastLatency}ms
            </span>
          </button>
        </div>
      )}

      {/* Expanded Omni AI Drawer / Modal */}
      {isOpen && (
        <div
          id="fluentic-omni-ai-brain-drawer"
          className={`fixed z-50 transition-all duration-300 shadow-[0_25px_80px_rgba(15,23,42,0.35)] rounded-3xl bg-white/95 backdrop-blur-2xl border border-blue-200/90 overflow-hidden flex flex-col ${
            isMinimized
              ? 'bottom-20 right-4 sm:bottom-6 sm:right-6 w-80 h-16'
              : 'bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 w-auto sm:w-[480px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                    Fluentic AI Omni-Brain
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[9px] font-black uppercase font-mono border border-emerald-400/40">
                    Live V24
                  </span>
                </div>
                <p className="text-[10px] text-blue-100 truncate">
                  {activeLanguage.flag} {activeLanguage.name} • CEFR {activeCefr} • {lastLatency}ms Ultra-Fast
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Close AI Brain"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick AI Task Switcher */}
              <div className="px-3 py-1.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between gap-1 shrink-0 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-white text-blue-700 shadow-2xs border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💬 AI Tutor Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('surgery')}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    activeTab === 'surgery'
                      ? 'bg-white text-blue-700 shadow-2xs border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔬 Grammar Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('drill')}
                  className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
                    activeTab === 'drill'
                      ? 'bg-white text-blue-700 shadow-2xs border border-blue-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Rapid Drill
                </button>
              </div>

              {/* Chat & Output Stream */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-sans text-xs">
                {activeTab === 'surgery' && (
                  <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[11px] text-indigo-800">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instant Grammar & Morpho-Syntax Surgery</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Type or paste any sentence in {activeLanguage.name}. The AI instantly checks case endings, verb conjugations, and register flaws.
                    </p>
                  </div>
                )}

                {activeTab === 'drill' && (
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-extrabold text-[11px] text-emerald-800">
                      <Flame className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sub-Second Active Recall Drill Generator</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Click below to generate a real-time challenge calibrated to your CEFR {activeCefr} proficiency.
                    </p>
                    <div className="flex gap-2 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={() => handleSend(`Give me an active recall translation drill in ${activeLanguage.name} (Level ${activeCefr})`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-2xs hover:bg-emerald-700 cursor-pointer"
                      >
                        ⚡ Generate Translation Drill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`Give me a speaking fill-in-the-blank challenge for ${activeLanguage.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-bold text-[10px] hover:bg-emerald-100 cursor-pointer"
                      >
                        🎯 Fill-in-Blank
                      </button>
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-2 ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-slate-50 border border-slate-200/90 text-slate-900 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap text-[11px] sm:text-xs">{m.text}</p>

                      {/* Target snippet card with native audio speech */}
                      {(m.targetSnippet || m.audioReadyText) && (
                        <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-2xs flex items-center justify-between gap-2 mt-1">
                          <div className="min-w-0">
                            <span className="font-extrabold text-blue-900 text-xs sm:text-sm block truncate font-sans">
                              {m.targetSnippet || m.audioReadyText}
                            </span>
                            {m.translation && (
                              <span className="text-[10px] text-slate-500 italic block truncate">
                                "{m.translation}"
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => audioSynth.speakPhraseNative(m.audioReadyText || m.targetSnippet!, activeLanguage.code)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors shrink-0 cursor-pointer"
                            title="Play Native Pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Contextual corrections */}
                      {m.corrections && m.corrections.length > 0 && (
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1 mt-1">
                          <span className="font-extrabold uppercase text-[9px] tracking-wider text-rose-700 block">
                            🎯 Syntax Correction:
                          </span>
                          {m.corrections.map((c, idx) => (
                            <div key={idx} className="bg-white/90 p-1.5 rounded text-[10px] space-y-0.5">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="line-through text-rose-600">{c.original}</span>
                                <span>→</span>
                                <span className="font-bold text-emerald-700">{c.corrected}</span>
                              </div>
                              <p className="text-[10px] text-slate-600">{c.rule}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Idiom breakdown */}
                      {m.idioms && m.idioms.length > 0 && (
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1 mt-1">
                          <span className="font-extrabold uppercase text-[9px] tracking-wider text-amber-800 block">
                            💡 Idiom & Cultural Nuance:
                          </span>
                          {m.idioms.map((idm, idx) => (
                            <div key={idx} className="bg-white/90 p-1.5 rounded text-[10px] space-y-0.5">
                              <span className="font-bold text-amber-900 block">{idm.idiom}</span>
                              <div className="text-[9px] text-slate-500 italic">Literal: "{idm.literal}"</div>
                              <p className="text-[10px] text-slate-700">{idm.pragmatic}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Follow-up chips */}
                      {m.suggestedDrills && m.suggestedDrills.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1">
                          {m.suggestedDrills.map((drill, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSend(drill)}
                              className="px-2 py-0.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-[10px] font-semibold transition-colors text-left truncate max-w-full cursor-pointer"
                            >
                              ⚡ {drill}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[9px] opacity-60 pt-0.5 font-mono">
                        <span>{m.latencyMs ? `${m.latencyMs}ms` : ''}</span>
                        <span>{m.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    <span>Fluentic AI Neural Brain is thinking...</span>
                  </div>
                )}
              </div>

              {/* Bottom Input Bar */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-100 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice Input to AI Brain'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activeTab === 'surgery'
                        ? `Paste sentence to diagnose in ${activeLanguage.name}...`
                        : activeTab === 'drill'
                        ? `Ask for an active recall drill...`
                        : `Ask Fluentic AI Brain anything...`
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
                    title="Send to AI Brain"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
