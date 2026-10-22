import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, BookOpen, Volume2 } from 'lucide-react';
import { translateCustom, TranslationResult } from '../services/translationService';
import { WORLD_LANGUAGES } from '../data/languages';
import { audioSynth } from '../services/audioSynthesizer';

export const CustomTranslatorView: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState('Arabic');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    audioSynth.playGentleFeedback();

    try {
      const res = await translateCustom(inputText, targetLang);
      setResult(res);
      audioSynth.playSuccessChime();
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar Header */}
      <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-blue-100 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Custom AI Translator</h2>
              <p className="text-xs text-slate-500">Auto-detects source text & generates smart teaching translations</p>
            </div>
          </div>

          {/* Target Language Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Translate To:</span>
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                audioSynth.playGentleFeedback();
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {WORLD_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.name}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input / Output Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Source Text</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Auto Detection</span>
            </label>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste any text here in any language..."
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Output Card */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              {result ? `${result.detectedLanguage} → ${targetLang}` : 'Translation Result'}
            </label>
            <div className="w-full h-[156px] p-4 rounded-2xl border border-blue-200/80 bg-blue-50/30 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs font-semibold">Translating with Gemini...</span>
                </div>
              ) : result ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-extrabold text-slate-900 text-base leading-snug">{result.translatedText}</p>
                  </div>
                  {result.transliteration && (
                    <p className="text-xs font-semibold text-blue-600 italic">/{result.transliteration}/</p>
                  )}
                  {result.explanation && (
                    <div className="pt-2 border-t border-blue-100/80 flex items-start gap-1.5 text-xs text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{result.explanation}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">
                  Translation details will appear here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Translate & Analyze</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
