import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Timer, 
  Flame, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Award, 
  Volume2, 
  Check, 
  X,
  Play
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';

interface GrandArenaViewProps {
  activeLanguage: Language;
  user: UserProfile;
  onReward: (xp: number, gems: number) => void;
}

const ARENA_QUESTIONS: Record<string, Array<{ word: string; translation: string; options: string[] }>> = {
  default: [
    { word: 'Guten Tag', translation: 'Good day', options: ['Good day', 'Good night', 'Goodbye', 'Please'] },
    { word: 'Danke schön', translation: 'Thank you very much', options: ['Thank you very much', 'You are welcome', 'Excuse me', 'Hello'] },
    { word: 'Auf Wiedersehen', translation: 'Goodbye', options: ['Goodbye', 'Good morning', 'See you soon', 'Yes'] },
    { word: 'Entschuldigung', translation: 'Excuse me / Sorry', options: ['Excuse me / Sorry', 'Congratulations', 'Welcome', 'Cheers'] },
    { word: 'Wasser', translation: 'Water', options: ['Water', 'Bread', 'Coffee', 'Tea'] },
    { word: 'Freund', translation: 'Friend', options: ['Friend', 'Enemy', 'Teacher', 'Doctor'] },
    { word: 'Reise', translation: 'Journey / Trip', options: ['Journey / Trip', 'House', 'Book', 'Street'] },
  ],
  es: [
    { word: 'Hola', translation: 'Hello', options: ['Hello', 'Goodbye', 'Please', 'Thanks'] },
    { word: 'Gracias', translation: 'Thank you', options: ['Thank you', 'Excuse me', 'Good night', 'Yes'] },
    { word: 'Por favor', translation: 'Please', options: ['Please', 'Sorry', 'Hello', 'Water'] },
    { word: 'Buenos días', translation: 'Good morning', options: ['Good morning', 'Good afternoon', 'Goodbye', 'Welcome'] },
    { word: 'Amigo', translation: 'Friend', options: ['Friend', 'Family', 'Stranger', 'City'] },
    { word: 'Tiempo', translation: 'Time / Weather', options: ['Time / Weather', 'Food', 'Money', 'Music'] },
  ],
  fr: [
    { word: 'Bonjour', translation: 'Hello / Good day', options: ['Hello / Good day', 'Goodbye', 'Please', 'Yes'] },
    { word: 'Merci beaucoup', translation: 'Thank you very much', options: ['Thank you very much', 'You are welcome', 'Sorry', 'Night'] },
    { word: 'S’il vous plaît', translation: 'Please', options: ['Please', 'Excuse me', 'Hello', 'Goodbye'] },
    { word: 'Au revoir', translation: 'Goodbye', options: ['Goodbye', 'Good morning', 'Welcome', 'Cheers'] },
    { word: 'L’amitié', translation: 'Friendship', options: ['Friendship', 'Travel', 'Work', 'School'] },
  ],
};

export const GrandArenaView: React.FC<GrandArenaViewProps> = ({
  activeLanguage,
  user,
  onReward,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const questions = ARENA_QUESTIONS[activeLanguage.code] || ARENA_QUESTIONS.default;
  const currentQ = questions[questionIndex % questions.length];

  // 60-second timer countdown
  useEffect(() => {
    let timer: any;
    if (gameState === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'running') {
      setGameState('finished');
      audioSynth.playCrownFanfare();
      const xpEarned = score * 15;
      const gemsEarned = Math.floor(score / 3) + 2;
      onReward(xpEarned, gemsEarned);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, onReward]);

  const handleStartGame = () => {
    audioSynth.playSuccessChime();
    setGameState('running');
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setQuestionIndex(0);
  };

  const handleAnswer = (option: string) => {
    if (gameState !== 'running') return;

    if (option === currentQ.translation) {
      audioSynth.playSuccessChime();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      setScore((prev) => prev + 1);
    } else {
      audioSynth.playGentleFeedback();
      setStreak(0);
    }

    setQuestionIndex((prev) => prev + 1);
  };

  return (
    <div
      id="fluentic-grand-arena-view"
      className="w-full max-w-4xl mx-auto min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          <Swords className="w-3.5 h-3.5" />
          <span>Grand Arena • 60s Speed Sprint</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          High-Velocity Polyglot Arena
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Test your spontaneous retrieval agility in {activeLanguage.name} against the clock.
        </p>
      </div>

      {gameState === 'idle' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Swords className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">
              60-Second Rapid Vocabulary Duel
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Answer as many rapid linguistic translations as possible in one minute. Build high combos for bonus multipliers!
            </p>
          </div>

          <button
            id="arena-start-game-btn"
            onClick={handleStartGame}
            className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Sprint</span>
          </button>
        </div>
      )}

      {gameState === 'running' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-6">
          {/* Top Timer & Combo Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-rose-600 text-lg">
              <Timer className="w-5 h-5 animate-spin" />
              <span>{timeLeft}s</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-orange-600 font-extrabold text-sm">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{streak}x Combo</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Score: {score}
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Target Word Display */}
          <div className="py-6 text-center space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase">
              Translate Word • {activeLanguage.name}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentQ.word}
            </div>
            <button
              onClick={() => audioSynth.speakText(currentQ.word, activeLanguage.code)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 inline-flex items-center"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Option Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`arena-opt-${idx}-btn`}
                onClick={() => handleAnswer(opt)}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 font-bold text-sm text-slate-800 text-left shadow-xs transition-all hover:scale-[1.01]"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900">Sprint Concluded!</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              You answered {score} words correctly with a peak combo of {maxStreak}x.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-xs font-bold text-amber-800 uppercase">XP Awarded</div>
              <div className="text-xl font-black text-amber-900">+{score * 15} XP</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
              <div className="text-xs font-bold text-cyan-800 uppercase">Gems Earned</div>
              <div className="text-xl font-black text-cyan-900">+{Math.floor(score / 3) + 2} 💎</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
