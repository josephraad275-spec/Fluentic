import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Check, 
  X, 
  Volume2, 
  RotateCcw, 
  Layers,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { getI18n } from '../../services/localization';
import { AICurriculumEngine } from '../../services/aiCurriculumService';
import { GrammarTopic } from '../../data/grammarTopicsData';

interface GrammarModuleViewProps {
  activeLanguage: Language;
  user: UserProfile;
}

export const GrammarModuleView: React.FC<GrammarModuleViewProps> = ({
  activeLanguage,
  user,
}) => {
  const nativeCode = user.nativeLanguageCode || 'en';
  const isDutch = nativeCode === 'nl';
  const i18n = getI18n(nativeCode);

  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedDrillAnswer, setSelectedDrillAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Load grammar topics dynamically using AICurriculumEngine
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    AICurriculumEngine.getGrammarTopics(activeLanguage, nativeCode)
      .then((data) => {
        if (!isCancelled && data && data.length > 0) {
          setTopics(data);
          setSelectedTopicId(data[0].id);
          setSelectedDrillAnswer(null);
          setIsAnswerChecked(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic grammar topics:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeLanguage.code, nativeCode]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  const handleSelectTopic = (id: string) => {
    audioSynth.playGentleFeedback();
    setSelectedTopicId(id);
    setSelectedDrillAnswer(null);
    setIsAnswerChecked(false);
  };

  const handleCheckDrill = () => {
    if (!selectedDrillAnswer || !currentTopic) return;
    setIsAnswerChecked(true);
    if (selectedDrillAnswer === currentTopic.drill.correctAnswer) {
      audioSynth.playSuccessChime();
    } else {
      audioSynth.playGentleFeedback();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeLanguage.flag}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeLanguage.name} {isDutch ? 'Grammaticagids' : 'Grammar Guide'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isDutch 
              ? `Duidelijke uitleg van taalregels, vervoegingen en zinsstructuren van het ${activeLanguage.name} in het Nederlands` 
              : `Master grammar rules, verb conjugations, and native structures for ${activeLanguage.name}`}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold flex items-center gap-1.5">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>{isDutch ? 'Genereren...' : 'Synthesizing...'}</span>
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{topics.length} {isDutch ? 'Kernmodules' : 'Core Modules'}</span>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700">
            {isDutch ? `Grammaticamodules voor ${activeLanguage.name} worden geladen...` : `Synthesizing authentic grammar curriculum for ${activeLanguage.name}...`}
          </p>
          <span className="text-xs text-slate-400">
            {isDutch ? 'Aangepast aan uw moedertaal' : 'Adapted to your native language & scripts'}
          </span>
        </div>
      ) : topics.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          {isDutch ? 'Geen grammaticamodules beschikbaar.' : 'No grammar modules available.'}
        </div>
      ) : (
        /* Main Split Layout: Topics List on Left, Topic Detail on Right */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Topics Navigation */}
          <div className="space-y-2">
            {topics.map((t) => {
              const isSelected = t.id === selectedTopicId;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTopic(t.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {t.category}
                  </div>
                  <h4 className="text-sm font-black mt-0.5">
                    {t.title}
                  </h4>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Topic Content & Drill */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Topic Title & Summary */}
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  {currentTopic.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {currentTopic.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {currentTopic.summary}
                </p>
              </div>

              {/* Rule Formula Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-900 block mb-1">
                    {isDutch ? 'Grammaticaformule & Ezelsbrug' : 'Grammar Formula & Rule'}
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 leading-relaxed">
                    {currentTopic.ruleFormula}
                  </p>
                </div>
              </div>

              {/* Examples in Context */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>{isDutch ? 'Voorbeeldzinnen in Context' : 'Contextual Examples'}</span>
                </h4>

                <div className="space-y-2.5">
                  {currentTopic.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 font-sans">
                          {ex.sentence}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {ex.translation}
                        </p>
                        {ex.note && (
                          <p className="text-[11px] text-blue-600 italic">
                            💡 {ex.note}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => audioSynth.speakText(ex.sentence, activeLanguage.code)}
                        className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-blue-600 shadow-2xs shrink-0 cursor-pointer"
                        title={isDutch ? 'Beluister uitspraak' : 'Listen'}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Drill Exercise */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {isDutch ? 'Snelle Begripstest' : 'Quick Understanding Check'}
                  </h4>
                </div>

                <p className="text-sm font-bold text-slate-900">
                  {currentTopic.drill.question}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTopic.drill.options.map((opt) => {
                    const isSelected = selectedDrillAnswer === opt;
                    const isCorrect = isAnswerChecked && opt === currentTopic.drill.correctAnswer;
                    const isWrong = isAnswerChecked && isSelected && opt !== currentTopic.drill.correctAnswer;

                    return (
                      <button
                        key={opt}
                        disabled={isAnswerChecked}
                        onClick={() => {
                          audioSynth.playGentleFeedback();
                          setSelectedDrillAnswer(opt);
                        }}
                        className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isWrong
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : isSelected
                            ? 'bg-blue-50 text-blue-900 border-blue-400 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isWrong && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons & Feedback */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {!isAnswerChecked ? (
                    <button
                      type="button"
                      disabled={!selectedDrillAnswer}
                      onClick={handleCheckDrill}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      {isDutch ? 'Controleer Antwoord' : 'Check Answer'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDrillAnswer(null);
                        setIsAnswerChecked(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isDutch ? 'Opnieuw proberen' : 'Try Again'}</span>
                    </button>
                  )}

                  {isAnswerChecked && (
                    <div className={`p-3 rounded-xl border text-xs flex-1 ${
                      selectedDrillAnswer === currentTopic.drill.correctAnswer
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <p className="font-bold">
                        {selectedDrillAnswer === currentTopic.drill.correctAnswer
                          ? (isDutch ? '✓ Uitstekend gedaan!' : '✓ Correct!')
                          : (isDutch ? '✗ Niet helemaal juist' : '✗ Incorrect')}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium opacity-90">
                        {currentTopic.drill.explanation}
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
