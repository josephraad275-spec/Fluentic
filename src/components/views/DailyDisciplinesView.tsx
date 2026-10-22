import React, { useState } from 'react';
import { 
  Calendar, 
  Flame, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Unlock, 
  ChevronRight,
  TrendingUp 
} from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';

interface DailyDisciplinesViewProps {
  user: UserProfile;
  activeLanguage: Language;
  onToggleShield: () => void;
}

export const DailyDisciplinesView: React.FC<DailyDisciplinesViewProps> = ({
  user,
  activeLanguage,
  onToggleShield,
}) => {
  const isDutch = (user.nativeLanguageCode || 'nl') === 'nl';

  const [rituals, setRituals] = useState([
    { 
      id: 'r-1', 
      title: isDutch ? 'Voltooi 1 Leerpad-les' : 'Complete 1 Path Lesson', 
      category: isDutch ? 'Leerpad' : 'Path Scaffolding', 
      completed: false 
    },
    { 
      id: 'r-2', 
      title: isDutch ? 'Oefen 1 Grammatica-oefening' : 'Complete 1 Interactive Grammar Drill', 
      category: isDutch ? 'Grammatica' : 'Syntax Drill', 
      completed: false 
    },
    { 
      id: 'r-3', 
      title: isDutch ? 'Neem 1 Spraakopname op in Speech Lab' : 'Record 1 Phonetic Articulation in Speech Lab', 
      category: isDutch ? 'Fonetiek' : 'Phonetics Lab', 
      completed: false 
    },
    { 
      id: 'r-4', 
      title: isDutch ? 'Doe 1 Scenariogesprek in Dialogue Theatre' : 'Engage in 1 Generative Roleplay Scenario', 
      category: isDutch ? 'Actieve Herinnering' : 'Active Recall', 
      completed: false 
    },
  ]);

  const handleToggleRitual = (id: string) => {
    audioSynth.playGentleFeedback();
    setRituals(
      rituals.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    );
  };

  // Generate simulated 12-week activity heatmap
  const weeks = Array.from({ length: 14 }, (_, wIdx) =>
    Array.from({ length: 7 }, (_, dIdx) => {
      const isPast = wIdx < 12 || (wIdx === 12 && dIdx <= 3);
      const intensity = isPast ? Math.floor(Math.random() * 4) : 0;
      return { day: dIdx, intensity };
    })
  );

  return (
    <div
      id="fluentic-daily-disciplines-view"
      className="w-full max-w-5xl mx-auto min-h-[calc(100vh-140px)] pb-28 pt-4 px-4 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold mb-1">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>Habit Mastery & Streak Rituals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Neuroplastic language habits designed for sustainable compounding fluency.
          </p>
        </div>

        {/* Streak Shield Status */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">Current Streak</div>
            <div className="text-lg font-black text-slate-900">{user.streakDays} Consecutive Days</div>
          </div>
        </div>
      </div>

      {/* Grid: Daily Rituals & Streak Freeze Shield */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Rituals Checklist (Span 2 cols) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">
              Today's Ritual Checklist
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {rituals.filter((r) => r.completed).length}/{rituals.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {rituals.map((ritual) => (
              <div
                key={ritual.id}
                onClick={() => handleToggleRitual(ritual.id)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  ritual.completed
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                      ritual.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    {ritual.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold ${ritual.completed ? 'line-through opacity-70' : ''}`}>
                    {ritual.title}
                  </span>
                </div>

                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {ritual.completed ? (isDutch ? '✓ Beheerst' : '✓ Mastered') : ritual.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Shield & Freeze Protection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {isDutch ? 'Reeksbeschermer' : 'Streak Freeze Shield'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isDutch 
                ? 'Behoudt je leervoortgang en synaptische continuïteit wanneer je een dag afwezig bent.'
                : 'Guarantees zero learning interruption or streak reset when traveling or busy.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isDutch ? 'Status Bescherming:' : 'Protection Status:'}</span>
              <span className={user.streakProtected ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}>
                {user.streakProtected 
                  ? (isDutch ? 'ACTIEF (Beschermd)' : 'ACTIVE (Protected)') 
                  : (isDutch ? 'INACTIEF' : 'INACTIVE')}
              </span>
            </div>

            <button
              onClick={onToggleShield}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                user.streakProtected
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {user.streakProtected 
                ? (isDutch ? 'Schild Geactiveerd' : 'Shield Armed') 
                : (isDutch ? 'Activeer Reeksbeschermer' : 'Arm Freeze Shield')}
            </button>
          </div>
        </div>
      </div>

      {/* 14-Week Consistency Heatmap */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Immersion Activity Heatmap (Last 14 Weeks)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Total 124 Active Sessions</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((d, dIdx) => {
                  let bg = 'bg-slate-100';
                  if (d.intensity === 1) bg = 'bg-amber-200';
                  if (d.intensity === 2) bg = 'bg-amber-300';
                  if (d.intensity === 3) bg = 'bg-amber-500';

                  return (
                    <div
                      key={dIdx}
                      className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${bg}`}
                      title={`Week ${wIdx + 1}, Day ${dIdx + 1}: ${d.intensity} sessions`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Less Practice</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-200" />
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
          </div>
          <span>More Practice</span>
        </div>
      </div>
    </div>
  );
};
