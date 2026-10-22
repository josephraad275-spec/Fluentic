import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  Bot, 
  User, 
  Lightbulb, 
  Languages, 
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Mic,
  Zap
} from 'lucide-react';
import { Language, CefrLevel, UserProfile } from '../types';
import { WORLD_LANGUAGES } from '../data/languages';
import { audioSynth } from '../services/audioSynthesizer';
import { getBcp47Locale } from '../services/speechDetectionService';
import { FluenticLogo } from './FluenticLogo';
import { OmniAppEngineClient } from '../services/omniEngineService';
import { stripTransliteration } from '../services/languageTypography';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: Language;
  activeCefr: CefrLevel;
  user: UserProfile;
}

interface Message {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  targetSnippet?: string;
  audioReadyText?: string;
  phoneticGuide?: string;
  translation?: string;
  grammarAnatomy?: string;
  mnemonic?: string;
  realWorldExamples?: { target: string; translation: string }[];
  commonMistakes?: string;
  contextualCorrections?: Array<{
    originalSnippet: string;
    correctedSnippet: string;
    grammaticalRule: string;
    severity?: 'minor' | 'critical';
  }>;
  idiomBreakdowns?: Array<{
    idiom: string;
    literalMeaning: string;
    pragmaticUsage: string;
  }>;
  registerNotes?: {
    detectedRegister: 'colloquial' | 'neutral' | 'formal' | 'academic';
    appropriateForContext: boolean;
    recommendation: string;
  };
  tips?: string[];
  followUps?: string[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  "How do native speakers actually say 'How are you?'",
  "Explain the difference between formal and informal address",
  "Give me a 30-second speaking drill",
  "How can I sound more natural and less like a textbook?",
  "Test my vocabulary with a quick challenge",
];

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  activeCefr,
  user,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Hello ${user.name}! I am your Fluentic AI Polyglot Tutor. We're currently exploring ${activeLanguage.name} at Level ${activeCefr}. What would you like to master today?`,
      targetSnippet: activeLanguage.sampleGreeting,
      translation: `Standard greeting in ${activeLanguage.name}`,
      tips: [
        'Ask about tricky grammar rules, idioms, or cultural habits.',
        'Try typing in the target language to receive immediate feedback!'
      ],
      followUps: [
        `Teach me 3 slang words in ${activeLanguage.name}`,
        `Give me a common conversational idiom`
      ],
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getBcp47Locale(activeLanguage.code);
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    audioSynth.playGentleFeedback();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === user.nativeLanguageCode);
      const nativeLanguageName = nativeLangObj?.name || (user.nativeLanguageCode === 'nl' ? 'Dutch' : 'English');

      // Call Centralized Omni-App Engine V24 Mode 3 (Active Chat)
      const activeChatResult = await OmniAppEngineClient.executeActiveChat({
        userMessage: text,
        targetLanguage: activeLanguage.name,
        targetLanguageCode: activeLanguage.code,
        nativeLanguage: nativeLanguageName,
        nativeLanguageCode: user.nativeLanguageCode || 'en',
        cefrLevel: activeCefr,
        learningIntent: user.learningIntent || 'conversational',
        history: messages.map((m) => ({ role: m.sender, text: m.text })),
      });

      if (activeChatResult && activeChatResult.tutor_turn) {
        const turn = activeChatResult.tutor_turn;
        const targetClean = turn.targetLanguageUtterance ? stripTransliteration(turn.targetLanguageUtterance) : undefined;
        const audioClean = turn.audioReadyText ? stripTransliteration(turn.audioReadyText) : targetClean;

        const botMsg: Message = {
          id: `b-${Date.now()}`,
          sender: 'tutor',
          text: turn.reply || 'Here is what you need to know:',
          targetSnippet: targetClean,
          audioReadyText: audioClean,
          translation: turn.translation,
          contextualCorrections: turn.contextualCorrections,
          idiomBreakdowns: turn.idiomBreakdowns,
          registerNotes: turn.registerNotes,
          followUps: turn.pedagogicalNextPrompts,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMsg]);
        audioSynth.playSuccessChime();
        return;
      }

      throw new Error('Omni Engine returned empty turn, falling back');
    } catch {
      // Direct high-fidelity pedagogical fallback adhering strictly to target script purity
      const cleanSnippet = stripTransliteration(activeLanguage.sampleGreeting || '');
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'tutor',
        text: `Great focus on ${activeLanguage.name} at CEFR ${activeCefr}! Real fluency is acquired through active recall, contextual nuance, and spaced repetition.`,
        targetSnippet: cleanSnippet,
        audioReadyText: cleanSnippet,
        translation: `Core expression in ${activeLanguage.name}`,
        grammarAnatomy: 'Structural formulation with high communicative frequency in authentic native contexts.',
        mnemonic: 'Anchor the speech pattern with rhythm and natural intonation.',
        registerNotes: {
          detectedRegister: 'neutral',
          appropriateForContext: true,
          recommendation: 'Appropriate for standard situational dialogues and everyday communication.',
        },
        tips: [
          `Focus on rhythm and musical cadence in ${activeLanguage.name}.`,
          'Practice shadow-reading the authentic native script aloud.'
        ],
        followUps: [
          `How would a native speaker rephrase this formally in ${activeLanguage.name}?`,
          `Give me an authentic idiomatic expression for this situation`
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="fluentic-ai-tutor-modal"
        className="w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col rounded-3xl bg-white/95 backdrop-blur-2xl border border-blue-100 shadow-[0_25px_70px_rgba(15,23,42,0.25)] overflow-hidden"
      >
        {/* Header with Fluentic Logo */}
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FluenticLogo variant="icon" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Fluentic AI Polyglot Tutor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black uppercase">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{activeLanguage.flag} {activeLanguage.name}</span>
                <span>•</span>
                <span className="font-semibold text-blue-600">Level {activeCefr}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close AI Tutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'tutor' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {/* Register Notes */}
                {m.registerNotes && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 text-[11px] text-slate-700">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {m.registerNotes.detectedRegister}
                    </span>
                    <span className="truncate">{m.registerNotes.recommendation}</span>
                  </div>
                )}

                {/* Target snippet or Audio-ready Utterance card */}
                {(m.targetSnippet || m.audioReadyText) && (
                  <div className="p-3 rounded-xl bg-white border border-blue-100 shadow-xs text-slate-900 mt-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-blue-900 text-base block font-sans">
                        {m.targetSnippet || m.audioReadyText}
                      </span>
                      {m.translation && (
                        <span className="text-xs text-slate-600 italic block mt-0.5">
                          "{m.translation}"
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => audioSynth.speakPhraseNative(m.audioReadyText || m.targetSnippet!, activeLanguage.code)}
                      className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors shrink-0 cursor-pointer"
                      title="Listen with Native Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Contextual Corrections */}
                {m.contextualCorrections && m.contextualCorrections.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-950 mt-2 space-y-2">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-rose-700">
                      🎯 Contextual Corrections & Syntax Surgery:
                    </span>
                    {m.contextualCorrections.map((corr, idx) => (
                      <div key={idx} className="space-y-1 bg-white/80 p-2.5 rounded-lg border border-rose-100">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="line-through text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">{corr.originalSnippet}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">{corr.correctedSnippet}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{corr.grammaticalRule}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Idiom Breakdowns */}
                {m.idiomBreakdowns && m.idiomBreakdowns.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 mt-2 space-y-2">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-amber-800">
                      💡 Idiom & Cultural Pragmatics:
                    </span>
                    {m.idiomBreakdowns.map((idm, idx) => (
                      <div key={idx} className="bg-white/80 p-2.5 rounded-lg border border-amber-100 space-y-1">
                        <div className="font-bold text-amber-900 text-sm font-sans flex items-center justify-between">
                          <span>{idm.idiom}</span>
                          <button
                            type="button"
                            onClick={() => audioSynth.speakPhraseNative(idm.idiom, activeLanguage.code)}
                            className="p-1 rounded text-amber-700 hover:bg-amber-100 cursor-pointer"
                            title="Listen"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 italic">Literal: "{idm.literalMeaning}"</div>
                        <p className="text-[11px] text-slate-700 font-medium">{idm.pragmaticUsage}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grammar Anatomy Breakdown */}
                {m.grammarAnatomy && (
                  <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 mt-2 space-y-1">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-indigo-700">
                      🔬 Linguistic & Grammar Anatomy:
                    </span>
                    <p className="leading-relaxed">{m.grammarAnatomy}</p>
                  </div>
                )}

                {/* Memory Anchor / Mnemonic */}
                {m.mnemonic && (
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950 mt-2 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider block text-amber-800">
                        Memory Anchor & Mnemonic:
                      </span>
                      <p className="leading-relaxed font-medium">{m.mnemonic}</p>
                    </div>
                  </div>
                )}

                {/* Real-World Native Dialogue Examples with Native Audio Speaker */}
                {m.realWorldExamples && m.realWorldExamples.length > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs space-y-2 mt-2">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-slate-500">
                      💬 Authentic Native Context:
                    </span>
                    {m.realWorldExamples.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50/80 hover:bg-blue-50/50 transition-colors">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{ex.target}</div>
                          <div className="text-slate-500 italic text-[11px]">"{ex.translation}"</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => audioSynth.speakPhraseNative(ex.target, activeLanguage.code)}
                          className="p-2 rounded-md bg-white hover:bg-blue-100 text-blue-600 border border-slate-200 shadow-2xs transition-colors shrink-0"
                          title="Listen to native pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Common Learner Trap */}
                {m.commonMistakes && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 mt-2 space-y-0.5">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block text-rose-600">
                      ⚠️ Common Learner Trap & Native Nuance:
                    </span>
                    <p className="leading-relaxed">{m.commonMistakes}</p>
                  </div>
                )}

                {/* Quick Tips */}
                {m.tips && m.tips.length > 0 && (
                  <div className="pt-1 space-y-1">
                    {m.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow-up chips */}
                {m.followUps && m.followUps.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {m.followUps.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-[11px] font-semibold transition-colors text-left"
                      >
                        ⚡ {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] opacity-60 text-right mt-1">
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Fluentic AI is synthesizing master pedagogical insights...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Prompt Ideas:
          </span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-xs font-medium whitespace-nowrap transition-colors shadow-2xs shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-xl border transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
              title={isListening ? 'Stop listening' : 'Speak to AI Tutor'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              id="ai-tutor-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'Listening to your voice...' : `Ask anything about ${activeLanguage.name} grammar, pronunciation, or slang...`}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-md shadow-blue-500/20 shrink-0"
              title="Send to AI Tutor"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
