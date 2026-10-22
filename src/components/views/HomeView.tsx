import React, { useState } from 'react';
import { 
  Flame, 
  Gem, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Mic, 
  MessageSquare,
  Zap, 
  BookOpen, 
  ShieldCheck, 
  Target,
  Check,
  Clock,
  Crown,
  HelpCircle,
  Languages
} from 'lucide-react';
import { UserProfile, Language, NavigationTab } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { getI18n } from '../../services/localization';

interface HomeViewProps {
  user: UserProfile;
  activeLanguage: Language;
  onNavigate: (tab: NavigationTab) => void;
  onStartNextLesson: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  progress: number;
  isUnlocked: boolean;
  rewardXp: number;
  rewardGems: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  activeLanguage,
  onNavigate,
  onStartNextLesson,
  onUpdateUser,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isArabic = (user.nativeLanguageCode || 'en') === 'ar';
  const isDutch = (user.nativeLanguageCode || 'en') === 'nl';
  const isRtl = isArabic;
  const i18n = getI18n(user.nativeLanguageCode || 'nl');

  const completedLessonsCount = user.completedNodeIds?.length || 0;
  const streak = user.streakDays || 0;
  const gems = user.gems || 0;
  const claimedAchievements = user.claimedAchievements || [];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Curated cognitive competency milestones (Zero arcade gamification)
  const achievements: Achievement[] = [
    {
      id: 'first-step',
      title: isArabic 
        ? 'الخطوة الأولى (أساس A1)' 
        : isDutch 
        ? 'Eerste Stap (A1 Fundament)' 
        : 'Foundational Phonics (A1)',
      description: isArabic
        ? 'إكمال الدرس الأول في مخارج الحروف والأصوات والقواعد التأسيسية.'
        : isDutch 
        ? 'Voltooi je eerste les in schriftmechanica en klankregels.' 
        : 'Master foundational letterforms and sound rules.',
      icon: Sparkles,
      color: 'from-blue-600 to-indigo-600',
      progress: completedLessonsCount >= 1 ? 100 : 0,
      isUnlocked: completedLessonsCount >= 1,
      rewardXp: 0,
      rewardGems: 0,
    },
    {
      id: 'streak-ignited',
      title: isArabic 
        ? 'الانضباط والتعلم المستمر' 
        : isDutch 
        ? 'Dagelijkse Leerdiscipline' 
        : 'Cognitive Consistency',
      description: isArabic
        ? 'المحافظة على عادة التعلم المنتظم يومياً لتثبيت الذاكرة العصبية.'
        : isDutch 
        ? 'Houd een actieve dagelijkse leerdiscipline vast.' 
        : 'Maintain daily spaced immersion for synaptic retention.',
      icon: Flame,
      color: 'from-orange-500 to-amber-600',
      progress: streak >= 1 ? 100 : 0,
      isUnlocked: streak >= 1,
      rewardXp: 0,
      rewardGems: 0,
    },
    {
      id: 'dialogue-master',
      title: isArabic 
        ? 'الاسترجاع العفوي والتركيز' 
        : isDutch 
        ? 'Spontane Dialoogvaardigheid' 
        : 'Spontaneous Active Recall',
      description: isArabic
        ? 'المشاركة في محطة التركيز المعرفي وسيناريوهات الاستدعاء الذهني المباشر.'
        : isDutch 
        ? 'Oefen real-time scenariogesprekken in Dialogue Theatre.' 
        : 'Engage in contextual conversational recall.',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      progress: Math.min(100, Math.round((completedLessonsCount * 5 / 20) * 100)),
      isUnlocked: completedLessonsCount >= 1,
      rewardXp: 0,
      rewardGems: 0,
    },
    {
      id: 'polyglot-pioneer',
      title: isArabic 
        ? 'التقييم القياسي المعتمد CEFR' 
        : isDutch 
        ? 'Gestandaardiseerde ERK Kwalificatie' 
        : 'Standardized CEFR Assessment',
      description: isArabic
        ? 'تحديد المستوى اللغوي بدقة عبر اختبار الـ 10 أسئلة المعياري.'
        : isDutch 
        ? 'Kwalificeer je ERK-niveau via de 10-vragen niveautest.' 
        : 'Demonstrate proficiency on the 10-question placement test.',
      icon: Trophy,
      color: 'from-purple-600 to-indigo-600',
      progress: user.hasCompletedOnboarding ? 100 : 0,
      isUnlocked: Boolean(user.hasCompletedOnboarding),
      rewardXp: 0,
      rewardGems: 0,
    },
  ];

  // Single press handler for milestones
  const handleSinglePressAchievement = (ach: Achievement) => {
    const isClaimed = claimedAchievements.includes(ach.id);

    if (ach.isUnlocked && !isClaimed) {
      audioSynth.playSuccessChime();
      const nextClaimed = [...claimedAchievements, ach.id];
      const updatedUser: UserProfile = {
        ...user,
        claimedAchievements: nextClaimed,
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      showToast(
        isDutch 
          ? `✓ ${ach.title}: Competentie geverifieerd!` 
          : `✓ ${ach.title}: Competency verified!`
      );
    } else if (isClaimed) {
      audioSynth.playGentleFeedback();
      showToast(
        isDutch 
          ? `✓ ${ach.title} is al geverifieerd!` 
          : `✓ ${ach.title} is already verified!`
      );
    } else {
      audioSynth.playGentleFeedback();
      showToast(
        isDutch 
          ? `ℹ️ Nog niet bereikt: ${ach.description}` 
          : `ℹ️ In progress: ${ach.description}`
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-3 sm:py-5 space-y-4 sm:space-y-5 pb-20">
      
      {/* Toast Notification for Single-Press Actions */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Compact Streamlined Hero Card */}
      <section 
        id="fluentic-hero-welcome-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 shadow-lg shadow-blue-500/15"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-blue-100 flex items-center gap-1 border border-white/20 whitespace-nowrap">
                <span>{activeLanguage.flag}</span>
                <span>{activeLanguage.name}</span>
                <span>•</span>
                <span>{user.activeCefr || 'A1'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-orange-400/25 text-orange-200 flex items-center gap-1 border border-orange-300/30 whitespace-nowrap">
                <Flame className="w-3 h-3 text-orange-300" />
                <span>{streak} {isArabic ? 'أيام' : isDutch ? 'dagen' : 'days'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 flex items-center gap-1 border border-emerald-300/30 whitespace-nowrap">
                <Clock className="w-3 h-3 text-emerald-300" />
                <span>{user.totalPracticeMinutes || 0}د {isArabic ? 'ممارسة' : isDutch ? 'praktijk' : 'practice'}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-normal text-white leading-tight truncate">
              {isArabic 
                ? (user.name ? `مرحباً، ${user.name}!` : 'أدخل اسمك')
                : isDutch 
                ? (user.name ? `Welkom, ${user.name}!` : 'Vul je naam in')
                : (user.name ? `Welcome, ${user.name}!` : 'Enter your name')}
            </h1>

            <p className="text-xs text-blue-100/90 font-normal leading-normal truncate">
              {isArabic
                ? `أنت تتعلم ${activeLanguage.name} بتقدم مستمر وتركيز عميق.`
                : isDutch
                ? `Je leert ${activeLanguage.name} vanuit het Nederlands.`
                : `Learning ${activeLanguage.name} with active progress.`}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
            <button
              id="home-start-next-lesson-btn"
              onClick={() => {
                audioSynth.playSuccessChime();
                onStartNextLesson();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>{i18n.startNextLesson}</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Daily Duration Target Selector (5m, 10m, 15m, custom) with ZERO Visible Timers */}
      <section 
        id="home-duration-target-card"
        className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-normal">
                {isArabic ? 'هدف وقت الممارسة اليومي' : isDutch ? 'Dagelijks Leervoornemen' : (user.nativeLanguageCode === 'es' ? 'Meta Diaria de Estudio' : user.nativeLanguageCode === 'fr' ? 'Objectif d\'Étude Quotidien' : user.nativeLanguageCode === 'de' ? 'Tägliches Lernziel' : 'Daily Practice Duration Target')}
              </h3>
              <p className="text-[10px] text-slate-500">
                {isArabic ? 'بدون ضغط عد تنازلي — تعلّم بهدوء وبالوتيرة المناسبة لك' : isDutch ? 'Geen tikkende timers — leer ontspannen op jouw eigen tempo' : (user.nativeLanguageCode === 'es' ? 'Sin temporizadores estresantes — aprende a tu propio ritmo' : user.nativeLanguageCode === 'fr' ? 'Sans minuteurs stressants — apprenez à votre rythme' : user.nativeLanguageCode === 'de' ? 'Kein Zeitdruck — lerne in deinem eigenen Wohlfühltempo' : 'Zero timer pressure — master language at your own comfortable pace')}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 whitespace-nowrap">
            {user.dailyGoalMinutes || 15}د / {isArabic ? 'يوم' : isDutch ? 'dag' : 'day'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { minutes: 5, label: isArabic ? '5 دقائق (هادئ)' : isDutch ? '5 min (Ontspannen)' : '5m (Casual)' },
            { minutes: 10, label: isArabic ? '10 دقائق (منتظم)' : isDutch ? '10 min (Regulier)' : '10m (Regular)' },
            { minutes: 15, label: isArabic ? '15 دقيقة (مخصص)' : isDutch ? '15 min (Toegewijd)' : '15m (Dedicated)' },
            { minutes: 30, label: isArabic ? '30 دقيقة (مكثف)' : isDutch ? '30 min (Aangepast)' : 'Custom (30m)' },
          ].map((target) => {
            const isSelected = (user.dailyGoalMinutes || 15) === target.minutes;
            return (
              <button
                key={target.minutes}
                type="button"
                onClick={() => {
                  audioSynth.playGentleFeedback();
                  if (onUpdateUser) {
                    onUpdateUser({
                      ...user,
                      dailyGoalMinutes: target.minutes,
                    });
                  }
                  showToast(
                    isDutch 
                      ? `🎯 Doel bijgewerkt: ${target.minutes} minuten per dag!` 
                      : `🎯 Daily goal set to ${target.minutes} min/day!`
                  );
                }}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] border-[#C5A059]/50 shadow-xs ring-1 ring-[#C5A059]/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{target.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Compact 2-Col Dashboard Row (Daily Quests + Streak Shield) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Left: Compact Daily Quests (takes 2 cols on md) */}
        <div className="md:col-span-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-normal">
                {i18n.dailyQuests}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {isArabic ? 'هدف الانضباط اليومي' : isDutch ? 'Dagelijkse Leerdiscipline' : 'Daily Immersion Target'}
            </span>
          </div>

          {/* Compact Quest Items */}
          <div className="space-y-1.5">
            {[
              {
                id: 'q1',
                title: isArabic ? '15 دقيقة من الانغماس اللغوي النشط' : isDutch ? '15 minuten actieve taalonderdompeling' : '15 min active immersion',
                progress: Math.min(15, user.totalPracticeMinutes || 0),
                max: 15,
                unit: isArabic ? 'دقيقة' : 'min',
                focusTag: isArabic ? 'هدف التركيز' : isDutch ? 'Focusdoel' : 'Focus Goal',
              },
              {
                id: 'q2',
                title: isArabic ? 'معايرة النطق ومخارج الحروف الصوتية' : isDutch ? 'Uitspraak- en formantprecisie' : 'Phonetic formant calibration',
                progress: 0,
                max: 100,
                unit: '%',
                focusTag: isArabic ? 'الصوتيات' : isDutch ? 'Fonetiek' : 'Phonetics',
              },
              {
                id: 'q3',
                title: isArabic ? 'جلسة تدريب على سيناريو استرجاع في محطة التركيز' : isDutch ? '1 Scenariogesprek in Dialogue Theatre' : '1 Dialogue Theatre scenario',
                progress: 0,
                max: 1,
                unit: isArabic ? 'سيناريو' : 'scenario',
                focusTag: isArabic ? 'استرجاع نشط' : isDutch ? 'Dialoog' : 'Active Recall',
              },
            ].map((q) => {
              const isCompleted = q.progress >= q.max;
              return (
                <div
                  key={q.id}
                  className="px-3 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 mb-1">
                      <span className="truncate pr-2">{q.title}</span>
                      <span className="text-slate-500 shrink-0 whitespace-nowrap font-medium">
                        {q.progress}/{q.max} {q.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (q.progress / q.max) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isCompleted ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        <span>{i18n.completed}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200 whitespace-nowrap">
                        {q.focusTag}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Daily Discipline Card */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-normal">
                    {streak} {isArabic ? 'أيام سلسلة مستمرة' : isDutch ? 'Dagen Actieve Reeks' : 'Day Consistency'}
                  </h4>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                {user.streakProtected 
                  ? (isArabic ? 'محمية' : isDutch ? 'Beschermd' : 'Protected') 
                  : (isArabic ? 'نشطة' : isDutch ? 'Actief' : 'Active')}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              {isArabic
                ? 'التعرض اليومي المنتظم للغة يرسخ المسارات العصبية ويمنع منحنى النسيان الطبيعي للذاكرة.'
                : isDutch 
                ? 'Consistente dagelijkse blootstelling versterkt synaptische geheugensporen en voorkomt de vergeetcurve.'
                : 'Daily spaced exposure cements neural pathways and prevents the Ebbinghaus forgetting curve.'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('daily-disciplines')}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all text-center cursor-pointer"
          >
            {isArabic ? 'عرض الانضباط والأهداف' : isDutch ? 'Bekijk Leerdiscipline & Doelen' : 'View Consistency & Goals'}
          </button>
        </div>
      </div>

      {/* Pure Pedagogical Architecture & Cognitive Retention Guide */}
      <section 
        id="home-cognitive-pedagogy-guide"
        className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 p-4 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{isArabic ? 'علم الاكتساب اللغوي والمنهجية التربوية' : isDutch ? 'Cognitieve Verwervingswetenschap & Leermethode' : 'Cognitive Retention Science & Pure Pedagogy'}</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-400">
            {isArabic ? 'منهجية خالصة' : 'Pure Methodology'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{isArabic ? '🧠 التكرار المتباعد FSRS' : isDutch ? '🧠 FSRS Gespreide Herhaling' : '🧠 FSRS Spaced Retention'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>{isArabic ? 'المبدأ العلمي:' : isDutch ? 'Wetenschappelijk principe:' : 'Cognitive principle:'}</strong> {isArabic
                ? 'فترات الاستدعاء النشط المحسوبة رياضياً ضد منحنى النسيان لضمان التثبيت الدائم في الذاكرة طويلة المدى.'
                : isDutch 
                ? 'Actieve herinneringsintervallen afgestemd op de vergeetcurve zorgen voor blijvende verankering in het langetermijngeheugen.'
                : 'Optimal active recall intervals mathematically calibrated against the forgetting curve for permanent long-term storage.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-orange-900">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
              <span>{isArabic ? '🔥 الانغماس اليومي المستمر' : isDutch ? '🔥 Dagelijkse Onderdompeling' : '🔥 Daily Immersion Discipline'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>{isArabic ? 'المرونة العصبية:' : isDutch ? 'Neuroplasticiteit:' : 'Neuroplasticity:'}</strong> {isArabic
                ? 'الجلسات الدقيقة والمنتظمة يومياً تبني ردود الفعل اللغوية التلقائية دون إجهاد معرفي أو نقاط عشوائية.'
                : isDutch
                ? 'Korte, frequente micro-sessies bouwen automatische taalreflexen op zonder cognitieve overbelasting of willekeurige gamescores.'
                : 'Focused daily micro-sessions build native grammatical reflexes and phonological awareness without arcade score anxiety.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>{isArabic ? '🏛️ التدرج المنهجي CEFR' : isDutch ? '🏛️ ERK Structurele Opbouw' : '🏛️ CEFR Scaffolding'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>{isArabic ? 'التركيز الهيكلي:' : isDutch ? 'Curriculumfocus:' : 'Structural focus:'}</strong> {isArabic
                ? 'تدرج منتظم من قواعد ونطق الحروف الأصيلة (A1) حتى التراكيب المتقدمة والمناظرات الأكاديمية (C1/C2).'
                : isDutch
                ? 'Gestructureerde progressie van schriftmechanica (A1) tot formele syntaxis, academisch debat en idioom (C1/C2).'
                : 'Systematic progression from authentic script mechanics (A1) to complex syntactic registers and debate (C1/C2).'}
            </p>
          </div>
        </div>
      </section>

      {/* Dedicated Pro Studio & Real Payment Plan Section */}
      <section 
        id="home-pro-studio-banner"
        className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 sm:p-5 shadow-lg shadow-orange-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-amber-100 border border-white/20">
            <Crown className="w-3.5 h-3.5 fill-white text-white" />
            <span>{isArabic ? 'استوديو Fluentic Pro • اشتراكات موثقة' : 'Fluentic Pro Studio • Real Payment Plans'}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            {isArabic 
              ? 'الترقية إلى اشتراك Fluentic Pro واستوديو النطق' 
              : isDutch 
              ? 'Upgrade naar Pro Studio & Echte Betalingsplannen' 
              : 'Upgrade to Pro Studio & Real Payment Plans'}
          </h3>
          <p className="text-xs text-amber-100/95 max-w-xl leading-relaxed">
            {isArabic
              ? 'محادثات غير محدودة مع المعلم الذكي، تصحيح مخارج الحروف، ومسارات C1/C2 المتقدمة وحماية دائمة للسلسلة. اشترك شهرياً ($4.99/شهر) أو وفر مع إتقان Pro السنوي ($39.99/سنة الأكثر طلباً بمعدل $3.33/شهر فقط).'
              : isDutch 
              ? 'Onbeperkte AI Polyglot Tutor interactie, accentanalyse, C1/C2 mastermodules en permanente Streak Freeze bescherming. Pro Maandelijks ($4.99/mnd) of Pro Jaarlijks Meesterschap ($39.99/jaar — Meest Populair aan $3.33/mnd equivalent) met veilige 256-bit betaling.'
              : 'Unlimited AI Polyglot Tutor voice conversations, acoustic accent coaching, C1/C2 master modules, and permanent streak shields. Pro Monthly ($4.99/mo) or Pro Annual Mastery ($39.99/yr — Most Popular at $3.33/mo equivalent) with 256-bit encrypted checkout.'}
          </p>
        </div>
        <button
          id="home-open-pro-studio-btn"
          onClick={() => {
            audioSynth.playSuccessChime();
            onNavigate('pro-studio');
          }}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{isArabic ? 'عرض الخطط واستوديو Pro' : isDutch ? 'Bekijk Plannen & Pro Studio' : 'View Plans & Pro Studio'}</span>
          <ArrowRight className="w-4 h-4 text-slate-700" />
        </button>
      </section>

      {/* Compact Quick Practice Section */}
      <section className="space-y-2">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-normal">
          {i18n.quickPractice}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              id: 'dialogue',
              title: isArabic ? 'محطة التركيز والسيناريوهات' : isDutch ? 'Dialoog' : 'Dialogue & Focus',
              desc: isArabic ? 'استرجاع نشط وموجات ألفا' : isDutch ? 'AI rollenspellen' : 'Roleplay & Alpha Focus',
              icon: MessageSquare,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              tab: 'focus' as NavigationTab,
            },
            {
              id: 'grammar',
              title: isArabic ? 'قواعد اللغة' : isDutch ? 'Grammatica' : 'Grammar',
              desc: isArabic ? 'التراكيب وحالات الإعراب' : isDutch ? 'Naamvallen & regels' : 'Cases & syntax rules',
              icon: BookOpen,
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              tab: 'grammar-module' as NavigationTab,
            },
            {
              id: 'translator',
              title: isArabic ? 'المترجم الذكي' : isDutch ? 'AI Vertaler' : 'AI Translator',
              desc: isArabic ? 'ترجمة فورية فائقة السرعة' : isDutch ? 'Live dialoog & vertaling' : 'Instant high-speed translation',
              icon: Languages,
              color: 'text-teal-600 bg-teal-50 border-teal-200',
              tab: 'ai-translator' as NavigationTab,
            },
            {
              id: 'syllabus',
              title: isArabic ? 'مسار التعلم المخصص' : isDutch ? 'Leerpad' : 'Learning Path',
              desc: isArabic ? 'منهج CEFR المتكامل بحسب هدفك' : isDutch ? 'Volledig curriculum' : 'Full tailored CEFR curriculum',
              icon: Sparkles,
              color: 'text-blue-600 bg-blue-50 border-blue-200',
              tab: 'syllabus' as NavigationTab,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  audioSynth.playGentleFeedback();
                  onNavigate(card.tab);
                }}
                className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-left hover:border-blue-400 hover:shadow-sm transition-all group flex flex-col justify-between cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate">
                    {card.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Single-Press Achievements Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-normal">
            {i18n.milestonesAchievements}
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            {isArabic ? 'اضغط مرة واحدة للاستلام' : isDutch ? 'Tik 1x om te claimen' : 'Single-press to claim'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            const isClaimed = claimedAchievements.includes(ach.id);
            const canClaim = ach.isUnlocked && !isClaimed;

            return (
              <button
                type="button"
                key={ach.id}
                onClick={() => handleSinglePressAchievement(ach)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-97 ${
                  canClaim
                    ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-sm ring-1 ring-amber-300/50'
                    : isClaimed
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
                title={canClaim ? (isArabic ? 'انقر للاستلام!' : isDutch ? 'Tik om te claimen!' : 'Tap to claim!') : ach.title}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ach.color} text-white flex items-center justify-center shadow-2xs`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {canClaim ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse whitespace-nowrap">
                        {isArabic ? 'استلام!' : isDutch ? 'Claim!' : 'Claim!'}
                      </span>
                    ) : isClaimed ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-0.5 whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        <span>{isArabic ? 'تم الاستلام' : isDutch ? 'Geclaimd' : 'Claimed'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {ach.progress}%
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-xs truncate">
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span className={ach.progress === 100 ? 'text-emerald-700' : 'text-slate-500'}>
                    {ach.progress === 100 ? (isDutch ? '✓ Beheerst' : '✓ Mastered') : (isDutch ? 'In Ontwikkeling' : 'In Progress')}
                  </span>
                  <span className="text-blue-600">{isDutch ? 'ERK Validatie' : 'CEFR Validated'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
};
