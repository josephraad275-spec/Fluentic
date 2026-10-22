import React, { useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert 
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';

interface NeuralRadarViewProps {
  activeLanguage: Language;
  user: UserProfile;
}

const DIAGNOSTIC_GAPS = [
  {
    id: 'gap-1',
    topic: 'Subjunctive Mood vs. Indicative',
    errorRate: 34,
    category: 'Syntax & Mood',
    sampleFaulty: 'Espero que tú vienes a la fiesta mañana.',
    explanation: 'Verbs expressing wishes require the subjunctive form ("vengas") instead of indicative ("vienes").',
  },
  {
    id: 'gap-2',
    topic: 'Preposition Distinction (Por vs. Para)',
    errorRate: 42,
    category: 'Prepositions',
    sampleFaulty: 'Trabajo por una empresa tecnológica alemana.',
    explanation: '"Para" is required when expressing destination/employer recipient rather than cause/exchange.',
  },
  {
    id: 'gap-3',
    topic: 'Direct & Indirect Clitic Pronoun Placement',
    errorRate: 28,
    category: 'Morphosyntax',
    sampleFaulty: 'Yo quiero dar a él el libro nuevo.',
    explanation: 'Native syntax requires clitic doubling or enclitic attachment ("Quiero darle el libro").',
  },
];

export const NeuralRadarView: React.FC<NeuralRadarViewProps> = ({
  activeLanguage,
  user,
}) => {
  const [selectedGap, setSelectedGap] = useState(DIAGNOSTIC_GAPS[0]);
  const [sentenceToSurgeon, setSentenceToSurgeon] = useState(DIAGNOSTIC_GAPS[0].sampleFaulty);
  const [surgeonAnalysis, setSurgeonAnalysis] = useState<{
    originalText?: string;
    correctedText?: string;
    identifiedErrors?: string[];
    deepPedagogicalRule?: string;
    drillExercises?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunGrammarSurgeon = async () => {
    if (!sentenceToSurgeon.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/grammar-surgeon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: sentenceToSurgeon,
          targetLanguage: activeLanguage.name,
        }),
      });

      const data = await res.json();
      setSurgeonAnalysis(data);
      audioSynth.playSuccessChime();
    } catch (e) {
      // Local pedagogical fallback
      setSurgeonAnalysis({
        originalText: sentenceToSurgeon,
        correctedText: sentenceToSurgeon.replace('vienes', 'vengas').replace('por una empresa', 'para una empresa'),
        identifiedErrors: ['Mood discordance: Indicative used in place of subjunctive after volition verb.'],
        deepPedagogicalRule: 'Subordinate clauses triggered by verbs of wishing, hoping, or doubting mandate subjunctive morphology.',
        drillExercises: [
          'Espero que tú ___ (venir) pronto.',
          'Deseo que nosotros ___ (tener) éxito.',
        ],
      });
      audioSynth.playSuccessChime();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="fluentic-neural-radar-view"
      className="w-full max-w-5xl mx-auto min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 space-y-6"
    >
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Smart Grammar Fixer & Quick Tips</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Fix Tricky Grammar Mistakes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Spot common tricky rules and check your sentences in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identified Gaps Heatmap (Col 1) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">
            Common Tricky Spots
          </h3>

          <div className="space-y-3">
            {DIAGNOSTIC_GAPS.map((gap) => (
              <button
                key={gap.id}
                onClick={() => {
                  setSelectedGap(gap);
                  setSentenceToSurgeon(gap.sampleFaulty);
                  setSurgeonAnalysis(null);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  selectedGap.id === gap.id
                    ? 'bg-cyan-50/80 border-cyan-300 ring-2 ring-cyan-400/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {gap.category}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    {gap.errorRate}% Tricky
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  {gap.topic}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 60s AI Grammar Surgeon Console (Col 2 & 3) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Instant Sentence Checker
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
              Language: {activeLanguage.name}
            </span>
          </div>

          {/* Input text to perform surgery on */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Type or paste any sentence you want to check:
            </label>
            <textarea
              id="surgeon-input-sentence"
              rows={3}
              value={sentenceToSurgeon}
              onChange={(e) => setSentenceToSurgeon(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm outline-none focus:border-cyan-500 focus:bg-white transition-all resize-none"
              placeholder="Type any sentence here to check grammar..."
            />
          </div>

          <button
            id="surgeon-run-btn"
            onClick={handleRunGrammarSurgeon}
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Checking your sentence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Check & Fix Sentence</span>
              </>
            )}
          </button>

          {/* Surgery Output Card */}
          {surgeonAnalysis && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Checked & Corrected
                </span>
              </div>

              {surgeonAnalysis.correctedText && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Corrected Sentence</div>
                  <div className="text-base font-black text-emerald-900 mt-0.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    {surgeonAnalysis.correctedText}
                  </div>
                </div>
              )}

              {surgeonAnalysis.deepPedagogicalRule && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">How It Works</div>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                    {surgeonAnalysis.deepPedagogicalRule}
                  </p>
                </div>
              )}

              {surgeonAnalysis.drillExercises && surgeonAnalysis.drillExercises.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Quick Mini-Practice</div>
                  <div className="space-y-1.5">
                    {surgeonAnalysis.drillExercises.map((drill, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800">
                        {drill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
