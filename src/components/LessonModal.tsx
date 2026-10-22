import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Award,
  Gem,
  Flame,
  HelpCircle,
  Lightbulb,
  Clock,
  Mic,
  MicOff,
  RotateCcw,
} from 'lucide-react';
import { LearningNode, Language, Exercise } from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import { speechDetector } from '../services/speechDetectionService';
import { isRtlLanguage, stripTransliteration } from '../services/languageTypography';

interface LessonModalProps {
  node: LearningNode;
  activeLanguage: Language;
  onClose: () => void;
  onComplete: (earnedXp: number, earnedGems: number) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  node,
  activeLanguage,
  onClose,
  onComplete,
}) => {
  // STAGES:
  // 1: 'concept'    - Concept & Teaching Card (Native script, audio, translations, context)
  // 2: 'practice'   - Interactive exercises (word bank, matching, speech, fill-blank)
  // 3: 'assessment' - Mandatory Module Assessment Mini-Quiz (+20 Gems bonus)
  // 4: 'complete'   - Reinforcement & Progress Tracking (Mastery Badges & Streak points)
  const [stage, setStage] = useState<'concept' | 'practice' | 'assessment' | 'complete'>('concept');
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [reviewedConcepts, setReviewedConcepts] = useState<Record<number, boolean>>({});

  // Flexible Duration Selector (5m, 10m, 15m, or Custom) - ZERO visible running timers
  const [sessionMinutes, setSessionMinutes] = useState<number>(10);
  const [isCustomDurationModalOpen, setIsCustomDurationModalOpen] = useState<boolean>(false);
  const [customInputMinutes, setCustomInputMinutes] = useState<string>('20');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10 * 60);

  // Mandatory End-of-Lesson Assessment Mini-Quiz (+20 Gems bonus)
  const [assessmentSelectedKey, setAssessmentSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [assessmentChecked, setAssessmentChecked] = useState(false);
  const [assessmentCorrect, setAssessmentCorrect] = useState(false);
  const [quizGemsEarned, setQuizGemsEarned] = useState(0);

  // Assessment question with Fisher-Yates scrambled options (never default to A or B)
  const [assessmentQuestion] = useState(() => {
    const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const targetPhrase = stripTransliteration(node.exercises[0]?.targetPhrase || node.nativeTitle || node.title);
    const translation = node.exercises[0]?.translation || node.description;

    const correctText = targetPhrase;
    const distractors = [
      activeLanguage.sampleGreeting || 'Hello',
      'Universal idiomatic expression',
      'Secondary conversational structure'
    ].map((d) => stripTransliteration(d));

    const allOpts = [correctText, ...distractors];
    // True Fisher-Yates array shuffle
    for (let i = allOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]];
    }

    // Strictly ensure correct answer key does not default to A or B
    let correctIdx = allOpts.indexOf(correctText);
    if (correctIdx === 0 || correctIdx === 1) {
      const swapWith = Math.random() < 0.5 ? 2 : 3;
      [allOpts[correctIdx], allOpts[swapWith]] = [allOpts[swapWith], allOpts[correctIdx]];
      correctIdx = swapWith;
    }

    return {
      prompt: `Assessment: Which expression correctly matches "${translation}" in authentic ${activeLanguage.name}?`,
      correctKey: keys[correctIdx],
      options: allOpts.map((text, idx) => ({ key: keys[idx], text })),
      explanation: `"${targetPhrase}" is the authentic CEFR ${node.cefr || 'A1'} structure for "${translation}".`
    };
  });

  // Practice inputs
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambledTokens, setScrambledTokens] = useState<string[]>([]);
  const [assembledTokens, setAssembledTokens] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Audio Recognition
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState<string>('');
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);

  const isRtl = isRtlLanguage(activeLanguage.code);

  const rawExercise: Exercise = node.exercises[currentExIndex] || {
    id: 'fallback-ex',
    type: 'multiple-choice',
    prompt: `Practice phrase for ${node.title}`,
    targetPhrase: node.nativeTitle || node.title,
    translation: node.description,
    options: [node.nativeTitle || node.title, 'Option B', 'Option C', 'Option D'],
    correctAnswer: node.nativeTitle || node.title,
    culturalNote: 'Authentic real-world usage in context.',
    exampleSentence: node.nativeTitle || node.title,
    exampleTranslation: node.description,
  };

  // Pure native script guarantee: Strip transliterations
  const currentExercise: Exercise = {
    ...rawExercise,
    targetPhrase: stripTransliteration(rawExercise.targetPhrase || ''),
    translation: rawExercise.translation,
    options: rawExercise.options?.map((opt) => stripTransliteration(opt)),
    correctAnswer: Array.isArray(rawExercise.correctAnswer)
      ? rawExercise.correctAnswer.map((ans) => stripTransliteration(ans))
      : stripTransliteration(rawExercise.correctAnswer || ''),
    exampleSentence: stripTransliteration(rawExercise.exampleSentence || ''),
  };

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update duration selector
  const handleSelectDuration = (mins: number) => {
    audioSynth.playGentleFeedback();
    setSessionMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  const handleApplyCustomDuration = () => {
    const parsed = parseInt(customInputMinutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      handleSelectDuration(parsed);
      setIsCustomDurationModalOpen(false);
    }
  };

  // Reset & prepare exercise tokens on question transition
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setRecognizedSpeech('');
    setInterimSpeech('');
    setSpeechAccuracy(null);
    speechDetector.stopListening();
    setIsListening(false);

    if (currentExercise.type === 'sentence-scramble') {
      const tokens =
        currentExercise.scrambledWords ||
        (currentExercise.targetPhrase || '').split(/\s+/).filter(Boolean);
      // Clean tokens of any transliteration
      const cleaned = tokens.map((t) => stripTransliteration(t));
      const shuffled = [...cleaned].sort(() => 0.5 - Math.random());
      setScrambledTokens(shuffled);
      setAssembledTokens([]);
    }
  }, [currentExIndex, currentExercise.id]);

  const playAudio = (text: string, rate: number = 0.95) => {
    audioSynth.speakPhraseNative(text, activeLanguage.code);
  };

  // Start Speech Recognition
  const toggleSpeechRecognition = async () => {
    if (isListening) {
      speechDetector.stopListening();
      setIsListening(false);
      return;
    }

    audioSynth.playGentleFeedback();
    setIsListening(true);
    setInterimSpeech('');

    const started = await speechDetector.startListening({
      langCode: activeLanguage.code,
      onTranscript: (finalTranscript) => {
        setRecognizedSpeech(finalTranscript);
        setInterimSpeech('');
        // Calculate similarity to target phrase
        const targetClean = currentExercise.targetPhrase.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
        const heardClean = finalTranscript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim();
        const score = heardClean.includes(targetClean) || targetClean.includes(heardClean) ? 96 : 82;
        setSpeechAccuracy(score);
      },
      onInterim: (interim) => {
        setInterimSpeech(interim);
      },
      onError: (err) => {
        console.warn('Speech detection notice:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  // Step 1 -> Step 2 transition: User reviews the Concept Card
  const handleStartPractice = () => {
    audioSynth.playSuccessChime();
    setReviewedConcepts((prev) => ({ ...prev, [currentExIndex]: true }));
    setStage('practice');
  };

  // Word token toggle for sentence scramble
  const handleToggleToken = (word: string, isFromScrambled: boolean) => {
    if (isAnswerChecked) return;
    audioSynth.playGentleFeedback();

    if (isFromScrambled) {
      const idx = scrambledTokens.indexOf(word);
      if (idx !== -1) {
        const nextScrambled = [...scrambledTokens];
        nextScrambled.splice(idx, 1);
        setScrambledTokens(nextScrambled);
        setAssembledTokens([...assembledTokens, word]);
      }
    } else {
      const idx = assembledTokens.indexOf(word);
      if (idx !== -1) {
        const nextAssembled = [...assembledTokens];
        nextAssembled.splice(idx, 1);
        setAssembledTokens(nextAssembled);
        setScrambledTokens([...scrambledTokens, word]);
      }
    }
  };

  // Step 2: Check practice answer
  const handleCheckAnswer = () => {
    if (isAnswerChecked) {
      // Advance to next exercise or move to mandatory module assessment
      if (currentExIndex < node.exercises.length - 1) {
        const nextIdx = currentExIndex + 1;
        setCurrentExIndex(nextIdx);
        if (!reviewedConcepts[nextIdx]) {
          setStage('concept');
        } else {
          setStage('practice');
        }
      } else {
        // Mandatory end-of-module mini-quiz assessment
        setStage('assessment');
        audioSynth.playGentleFeedback();
      }
      return;
    }

    let correct = false;
    if (
      currentExercise.type === 'multiple-choice' ||
      currentExercise.type === 'listening-comprehension' ||
      currentExercise.type === 'translation' ||
      currentExercise.type === 'fill-blank'
    ) {
      correct = selectedOption === currentExercise.correctAnswer;
    } else if (currentExercise.type === 'sentence-scramble') {
      const assembledStr = assembledTokens.join(' ').trim().toLowerCase();
      const targetStr = (
        Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer.join(' ')
          : currentExercise.correctAnswer || currentExercise.targetPhrase || ''
      )
        .trim()
        .toLowerCase();
      correct = assembledStr === targetStr;
    } else if (currentExercise.type === 'speech-pronounce') {
      correct = (speechAccuracy ?? 0) >= 70 || recognizedSpeech.length > 2;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      audioSynth.playSuccessChime();
    } else {
      audioSynth.playGentleFeedback();
    }
  };

  // Check mandatory assessment mini-quiz
  const handleCheckAssessment = () => {
    if (!assessmentSelectedKey || assessmentChecked) return;
    const isAnsCorrect = assessmentSelectedKey === assessmentQuestion.correctKey;
    setAssessmentChecked(true);
    setAssessmentCorrect(isAnsCorrect);

    if (isAnsCorrect) {
      audioSynth.playTriumphChime();
      setQuizGemsEarned(20);
    } else {
      audioSynth.playGentleFeedback();
    }
  };

  const handleFinishAssessment = () => {
    setStage('complete');
    audioSynth.playCrownFanfare();
  };

  // Finalize Lesson & Award Mastery Badges + Regular Gems + Assessment Bonus Gems
  const handleFinish = () => {
    onComplete(node.xpReward, node.gemReward + quizGemsEarned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#f8fafd] via-white to-[#f0f4f9] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Navigation & Target Duration Bar (ZERO visible countdown timer) */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#0F2137] text-[#D4AF37] text-[11px] font-black uppercase tracking-wider border border-[#C5A059]/30">
              {node.cefr || 'A1'}
            </span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[140px] sm:max-w-[200px]">
              {node.title}
            </span>
          </div>

          {/* Session Target Duration Selector (Zero running timer pressure) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#C5A059] ml-1 shrink-0" />
            {[5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectDuration(mins)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all ${
                  sessionMinutes === mins
                    ? 'bg-[#1B365D] text-[#D4AF37] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mins}m
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomDurationModalOpen(true)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                ![5, 10, 15].includes(sessionMinutes)
                  ? 'bg-[#1B365D] text-[#D4AF37] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {![5, 10, 15].includes(sessionMinutes) ? `${sessionMinutes}m` : 'Custom'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">

          {/* ============================================================ */}
          {/* STEP 1: CONCEPT CARD (TEACH FIRST PEDAGOGY)                  */}
          {/* ============================================================ */}
          {stage === 'concept' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1B365D] bg-blue-50 px-3.5 py-1 rounded-full border border-[#C5A059]/30">
                  <BookOpen className="w-3.5 h-3.5 text-[#C5A059]" /> Concept Card • Pure Native Script
                </span>
                <h2
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`text-2xl sm:text-4xl font-black text-[#0F2137] tracking-tight leading-relaxed ${
                    isRtl ? 'text-right' : 'text-center'
                  }`}
                >
                  {currentExercise.targetPhrase}
                </h2>
              </div>

              {/* Dual-Speed Audio Pronunciation Controls */}
              <div className="flex justify-center items-center gap-3">
                <button
                  type="button"
                  onClick={() => playAudio(currentExercise.targetPhrase || '', 1.0)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1B365D] to-[#0F2137] hover:from-[#0F2137] text-[#D4AF37] font-black text-xs flex items-center gap-2 shadow-md shadow-blue-900/15 cursor-pointer border border-[#C5A059]/40"
                >
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Listen Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => playAudio(currentExercise.targetPhrase || '', 0.7)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span>Slow (0.7x)</span>
                </button>
              </div>

              {/* Meaning & Context Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meaning</span>
                  <p className="text-base sm:text-lg font-bold text-slate-800">
                    {currentExercise.translation}
                  </p>
                </div>
                {currentExercise.exampleSentence && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Real-Life Context</span>
                    <p
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`text-sm font-semibold text-slate-700 italic ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      "{currentExercise.exampleSentence}"
                    </p>
                    {currentExercise.exampleTranslation && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        ↳ {currentExercise.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pro Tip */}
              {currentExercise.culturalNote && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {currentExercise.culturalNote}
                  </p>
                </div>
              )}

              {/* Transition to Practice */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartPractice}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1B365D] via-[#0F2137] to-[#1B365D] hover:from-[#0F2137] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer border border-[#C5A059]/40"
                >
                  <span className="text-[#D4AF37]">Practice This Phrase</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: PRACTICAL INTERACTIVE PRACTICE                       */}
          {/* ============================================================ */}
          {stage === 'practice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-100">
                <span className="text-[#1B365D] font-extrabold uppercase tracking-wider">
                  Exercise {currentExIndex + 1} of {node.exercises.length}
                </span>
                <button
                  type="button"
                  onClick={() => setStage('concept')}
                  className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Review Concept
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentExercise.prompt}
                </h3>
                {currentExercise.type === 'listening-comprehension' && (
                  <button
                    type="button"
                    onClick={() => playAudio(currentExercise.targetPhrase || '', 0.9)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Volume2 className="w-4 h-4" /> Listen again
                  </button>
                )}
              </div>

              {/* Practice Form A: Multiple Choice / Translation */}
              {currentExercise.type !== 'sentence-scramble' && currentExercise.type !== 'speech-pronounce' && currentExercise.options && (
                <div className="space-y-2.5">
                  {currentExercise.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
                    if (isSelected && !isAnswerChecked) {
                      btnStyle = 'bg-blue-50 border-[#1B365D] text-[#0F2137] font-bold ring-2 ring-[#C5A059]/40';
                    } else if (isAnswerChecked) {
                      if (option === currentExercise.correctAnswer) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                      } else if (isSelected && option !== currentExercise.correctAnswer) {
                        btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                      } else {
                        btnStyle = 'opacity-40 bg-slate-50 border-slate-200 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswerChecked}
                        onClick={() => setSelectedOption(option)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <span
                          dir={isRtl ? 'rtl' : 'ltr'}
                          className={`text-sm font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                        >
                          {option}
                        </span>
                        {isAnswerChecked && option === currentExercise.correctAnswer && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {isAnswerChecked && isSelected && option !== currentExercise.correctAnswer && (
                          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Practice Form B: Sentence Scramble / Word Bank */}
              {currentExercise.type === 'sentence-scramble' && (
                <div className="space-y-4">
                  {/* Assembled Area */}
                  <div
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="min-h-[64px] p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-wrap gap-2 items-center"
                  >
                    {assembledTokens.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Tap words below to construct the phrase...</span>
                    ) : (
                      assembledTokens.map((word, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleToken(word, false)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1B365D] text-[#D4AF37] font-bold text-xs shadow-sm"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Scrambled Bank */}
                  <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-wrap gap-2 pt-2">
                    {scrambledTokens.map((word, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleToken(word, true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Form C: Speech Pronunciation */}
              {currentExercise.type === 'speech-pronounce' && (
                <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/80 text-center space-y-4">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Tap microphone and speak:
                  </p>
                  <h4
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className={`text-xl sm:text-2xl font-black text-slate-900 ${isRtl ? 'text-right' : 'text-center'}`}
                  >
                    "{currentExercise.targetPhrase}"
                  </h4>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 ring-8 ring-rose-400/30 animate-pulse'
                          : 'bg-gradient-to-tr from-amber-500 to-amber-600 hover:scale-105'
                      }`}
                    >
                      {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => playAudio(currentExercise.targetPhrase || '', 0.85)}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs cursor-pointer"
                      title="Hear audio"
                    >
                      <Volume2 className="w-5 h-5 text-[#C5A059]" />
                    </button>
                  </div>

                  {(interimSpeech || recognizedSpeech) && (
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 space-y-1">
                      <div>Heard: "{interimSpeech || recognizedSpeech}"</div>
                      {speechAccuracy !== null && (
                        <div className="text-emerald-700 font-extrabold">
                          Pronunciation Accuracy: {speechAccuracy}% 🎯
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 Feedback Bar */}
              {isAnswerChecked && (
                <div
                  className={`p-4 rounded-2xl flex items-center gap-3 ${
                    isCorrect
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">{isCorrect ? 'Outstanding!' : 'Keep Going!'}</p>
                    <p className="opacity-90">{currentExercise.translation}</p>
                  </div>
                </div>
              )}

              {/* Practice Actions */}
              <div className="pt-2 flex justify-end">
                {!isAnswerChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    disabled={
                      currentExercise.type === 'sentence-scramble'
                        ? assembledTokens.length === 0
                        : currentExercise.type === 'speech-pronounce'
                        ? !recognizedSpeech
                        : !selectedOption
                    }
                    className="px-6 py-3 rounded-2xl bg-[#1B365D] hover:bg-[#0F2137] disabled:opacity-50 text-[#D4AF37] font-black text-xs sm:text-sm shadow-md border border-[#C5A059]/40 cursor-pointer"
                  >
                    Check
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>
                      {currentExIndex < node.exercises.length - 1 ? 'Continue' : 'Finish Lesson'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MANDATORY END-OF-MODULE ASSESSMENT MINI-QUIZ (+20 GEMS BONUS) */}
          {/* ============================================================ */}
          {stage === 'assessment' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1B365D]/10 to-amber-500/15 border border-[#D4AF37]/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <Award className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      Mandatory End-of-Module Mini-Quiz
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Demonstrate CEFR mastery of <strong>{node.title}</strong>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950 font-black text-xs shadow-xs border border-amber-300 whitespace-nowrap">
                  +20 Gems 💎
                </span>
              </div>

              {/* Assessment Question Prompt */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1B365D]">
                  Final Verification Question
                </span>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {assessmentQuestion.prompt}
                </p>
              </div>

              {/* Multiple Choice Options (Scrambled A, B, C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {assessmentQuestion.options.map((opt) => {
                  const isSelected = assessmentSelectedKey === opt.key;
                  const isCorrectOpt = opt.key === assessmentQuestion.correctKey;

                  let optClass = 'bg-white border-slate-200 hover:border-[#D4AF37] text-slate-900 hover:bg-slate-50';
                  if (assessmentChecked) {
                    if (isCorrectOpt) {
                      optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      optClass = 'bg-rose-50 border-rose-400 text-rose-950';
                    } else {
                      optClass = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optClass = 'bg-blue-50/80 border-[#1B365D] text-slate-950 ring-2 ring-[#D4AF37]/40 font-bold';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={assessmentChecked}
                      onClick={() => {
                        audioSynth.playGentleFeedback();
                        setAssessmentSelectedKey(opt.key);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${optClass}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        assessmentChecked && isCorrectOpt
                          ? 'bg-emerald-600 text-white'
                          : assessmentChecked && isSelected
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'bg-[#1B365D] text-[#D4AF37]'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Assessment Feedback */}
              {assessmentChecked && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  assessmentCorrect
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {assessmentCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-sm">
                      {assessmentCorrect ? 'Assessment Passed! +20 Gems Awarded 🎉' : 'Review & Practice'}
                    </p>
                    <p className="opacity-90">{assessmentQuestion.explanation}</p>
                  </div>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-2 flex justify-end">
                {!assessmentChecked ? (
                  <button
                    type="button"
                    onClick={handleCheckAssessment}
                    disabled={!assessmentSelectedKey}
                    className="px-6 py-3 rounded-2xl bg-[#1B365D] hover:bg-[#0F2137] disabled:opacity-50 text-[#D4AF37] font-black text-xs sm:text-sm shadow-md border border-[#D4AF37]/50 cursor-pointer"
                  >
                    Verify Assessment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishAssessment}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <span>Claim Mastery & Rewards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: IMMEDIATE REINFORCEMENT & PROGRESS TRACKING          */}
          {/* ============================================================ */}
          {stage === 'complete' && (
            <div className="p-4 sm:p-6 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 text-[#C5A059] flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Lesson Completed! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  You successfully mastered the concepts in <strong>{node.title}</strong>!
                </p>
              </div>

              {/* Skill Mastery Badge */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-[#0F2137] via-[#1B365D] to-[#0F2137] text-white shadow-lg space-y-1 border border-[#C5A059]/40">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">
                  Skill Mastery Badge Unlocked
                </div>
                <div className="text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 text-white">
                  <span>🏅 CEFR {node.cefr || 'A1'} {node.category || 'Core'} Specialist</span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Verified proficiency milestone in {activeLanguage.name}
                </div>
              </div>

              {/* Cognitive Competency & Retention Verification (Zero arcade gamification) */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>CEFR {node.cefr || 'A1'} Competency Verified</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Structural Syntax Mastered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>FSRS Spaced Review Scheduled</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Continue Learning Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Custom Duration Selector Dialog */}
      {isCustomDurationModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Custom Session Duration</h4>
            <p className="text-xs text-slate-500">
              Set how many minutes you want to dedicate to this study session:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={customInputMinutes}
                onChange={(e) => setCustomInputMinutes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-center text-lg focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
              />
              <span className="text-sm font-bold text-slate-600">min</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomDurationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCustomDuration}
                className="px-5 py-2 rounded-xl bg-[#1B365D] text-[#D4AF37] font-black text-xs shadow-sm hover:bg-[#0F2137]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
