import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  User, 
  Globe2, 
  Target, 
  CheckCircle2, 
  Award,
  BookOpen
} from 'lucide-react';
import { audioSynth } from '../services/audioSynthesizer';
import { FluenticLogo } from './FluenticLogo';
import { WORLD_LANGUAGES } from '../data/languages';
import { SearchableLanguageSelect } from './SearchableLanguageSelect';
import { OmniAppEngineClient } from '../services/omniEngineService';

interface SignInViewProps {
  initialName?: string;
  initialEmail?: string;
  initialNativeLanguageCode?: string;
  initialTargetLanguageCode?: string;
  initialLearningIntent?: 'business' | 'travel' | 'academic' | 'conversational';
  onSignIn: (name: string, email: string, nativeLanguageCode: string, targetLanguageCode: string, learningIntent: 'business' | 'travel' | 'academic' | 'conversational') => void;
  onContinueGuest: (nativeLanguageCode: string, targetLanguageCode: string, learningIntent: 'business' | 'travel' | 'academic' | 'conversational') => void;
  onSkipTest?: (nativeLanguageCode: string, targetLanguageCode: string, name?: string, learningIntent?: 'business' | 'travel' | 'academic' | 'conversational') => void;
}

const POPULAR_TARGET_CODES = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ar', 'zh', 'ru', 'lt', 'nl'];

export const SignInView: React.FC<SignInViewProps> = ({
  initialName = '',
  initialEmail = '',
  initialNativeLanguageCode = 'en',
  initialTargetLanguageCode = 'en',
  initialLearningIntent = 'conversational',
  onSignIn,
  onContinueGuest,
  onSkipTest,
}) => {
  const [name, setName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [nativeCode, setNativeCode] = useState(initialNativeLanguageCode);
  const [targetCode, setTargetCode] = useState(initialTargetLanguageCode);
  const [learningIntent, setLearningIntent] = useState<'business' | 'travel' | 'academic' | 'conversational'>(initialLearningIntent);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDutch = nativeCode === 'nl';
  const isArabic = nativeCode === 'ar';
  const isRtl = isArabic;

  const selectedTargetLanguage = 
    WORLD_LANGUAGES.find((l) => l.code === targetCode) || 
    WORLD_LANGUAGES.find((l) => l.code === 'es') || 
    WORLD_LANGUAGES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Default display name strictly to 'Enter your name' ('أدخل اسمك' in Arabic locale) if unprovided
    const fallbackName = isArabic ? 'أدخل اسمك' : 'Enter your name';
    const finalDisplayName = name.trim() || fallbackName;
    const trimmedEmail = email.trim();

    setIsLoading(true);
    audioSynth.playSuccessChime();

    // Omni-App Engine V24 Mode 1 Onboarding Execution
    OmniAppEngineClient.executeOnboarding({
      displayName: finalDisplayName,
      nativeLanguageCode: nativeCode,
      targetLanguageCode: targetCode,
      learningIntent,
    }).catch((err) => console.warn('[Omni Onboarding]', err));

    setTimeout(() => {
      setIsLoading(false);
      onSignIn(
        finalDisplayName, 
        trimmedEmail || `${finalDisplayName.toLowerCase().replace(/\s+/g, '.')}@fluentic.local`,
        nativeCode,
        targetCode,
        learningIntent
      );
    }, 250);
  };

  const handleGuestClick = () => {
    audioSynth.playGentleFeedback();
    const fallbackName = isArabic ? 'أدخل اسمك' : 'Enter your name';
    OmniAppEngineClient.executeOnboarding({
      displayName: fallbackName,
      nativeLanguageCode: nativeCode,
      targetLanguageCode: targetCode,
      learningIntent,
    }).catch((err) => console.warn('[Omni Guest Onboarding]', err));
    onContinueGuest(nativeCode, targetCode, learningIntent);
  };

  return (
    <div
      id="fluentic-main-entry-login-page"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 z-20"
    >
      <div className="w-full max-w-lg mx-auto space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <FluenticLogo variant="horizontal" size="md" showTagline={true} />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            <button
              type="button"
              onClick={() => {
                setNativeCode('ar');
                audioSynth.playGentleFeedback();
              }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                nativeCode === 'ar' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              AR 🇸🇦
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                setNativeCode('nl');
                audioSynth.playGentleFeedback();
              }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                nativeCode === 'nl' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              NL 🇳🇱
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                setNativeCode('en');
                audioSynth.playGentleFeedback();
              }}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                nativeCode === 'en' ? 'bg-blue-600 text-white font-bold' : 'hover:text-slate-900'
              }`}
            >
              EN 🇬🇧
            </button>
          </div>
        </div>

        {/* Main Entry Card */}
        <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-blue-200/90 shadow-[0_20px_50px_rgba(30,58,138,0.08)] p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {isArabic 
                ? 'اختر لغاتك وابدأ اختبار تحديد المستوى' 
                : isDutch 
                ? 'Kies je Talen & Start de Niveautest' 
                : 'Select Languages & Begin Placement'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isArabic
                ? 'حدد لغتك الأم واللغة التي ترغب في إتقانها. يبدأ كل متعلم باختبار قياسي دقيق من 10 أسئلة (A1–C2).'
                : isDutch 
                ? 'Stel je moedertaal en doeltaal in via het wereldtalenmenu. Iedereen start met een 10-vragen niveautest (A1–C2).'
                : 'Configure your native language and target language with dynamic AI curricula. All learners begin with a 10-question placement test (A1–C2).'}
            </p>
          </div>

          {/* Mandatory Placement Test Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex items-start gap-3 text-left">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-extrabold text-amber-950 block text-[13px] mb-0.5">
                {isArabic 
                  ? 'اختبار تحديد المستوى القياسي CEFR (إلزامي)' 
                  : isDutch 
                  ? 'Verplichte CEFR Niveautest (Instaptoets)' 
                  : 'Mandatory CEFR Placement Test'}
              </span>
              {isArabic
                ? 'لا يمكن الدخول المباشر دون اختبار تحديد المستوى لضمان تعيين مستواك اللغوي الحقيقي بدقة تامة من A1 إلى C2.'
                : isDutch
                ? 'Niemand heeft directe toegang zonder de instaptest. Zo wordt jouw werkelijke taalniveau (A1 t/m C2) exact vastgesteld.'
                : 'No one enters the platform without the placement test. This calibrates your exact starting level from A1 to C2.'}
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Setup & Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Native Language Selector using SearchableLanguageSelect */}
            <div>
              <SearchableLanguageSelect
                id="signin-native-language-select"
                value={nativeCode}
                onChange={(lang) => {
                  setNativeCode(lang.code);
                  audioSynth.playGentleFeedback();
                }}
                label={isArabic ? '1. لغتي الأم (لغة واجهة التطبيق والتعليمات)' : isDutch ? '1. Mijn Moedertaal (Native Language)' : '1. My Native Language'}
                placeholder={isArabic ? 'ابحث عن لغتك الأم...' : isDutch ? 'Zoek moedertaal...' : 'Search native language...'}
                helperText={isArabic ? 'لشرح القواعد اللغوية والترجمة والتعليمات' : isDutch ? 'Voor grammatica-uitleg, vertalingen en instructies' : 'For explanations, guidance, and translations'}
                variant="card"
              />
            </div>

            {/* 2. Target Language Selector using SearchableLanguageSelect */}
            <div>
              <div className="mb-2">
                <SearchableLanguageSelect
                  id="signin-target-language-select"
                  value={targetCode}
                  onChange={(lang) => {
                    setTargetCode(lang.code);
                    audioSynth.playGentleFeedback();
                  }}
                  label={isArabic ? '2. اللغة التي أرغب في تعلمها (اللغة المستهدفة)' : isDutch ? '2. Taal die ik wil leren (Doeltaal)' : '2. Language I Want to Learn (Target)'}
                  placeholder={isArabic ? 'ابحث في أكثر من 55 لغة عالمية...' : isDutch ? 'Zoek uit alle 55+ talen...' : 'Search across all 55+ world languages...'}
                  helperText={isArabic ? 'ينشئ الذكاء الاصطناعي المنهج والتمارين بهذه اللغة' : isDutch ? 'AI genereert het complete curriculum in deze taal' : 'AI generates the complete curriculum in this language'}
                  variant="card"
                />
              </div>

              {/* Quick Pick Chips for popular target languages */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                  {isArabic ? 'شائع:' : isDutch ? 'Populair:' : 'Popular:'}
                </span>
                {POPULAR_TARGET_CODES.map((code) => {
                  const l = WORLD_LANGUAGES.find((item) => item.code === code);
                  if (!l) return null;
                  const isSelected = targetCode === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setTargetCode(code);
                        audioSynth.playGentleFeedback();
                      }}
                      className={`flex items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Name input */}
            {/* 3. Learning Intent ("Why are you learning?") */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                {isArabic ? '3. هدف التعلم (لماذا تتعلم هذه اللغة؟)' : isDutch ? '3. Leerdoel (Waarom leer je deze taal?)' : '3. Learning Intent (Why are you learning?)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'conversational' as const,
                    title: isArabic ? 'محادثة وطلاقة' : isDutch ? 'Conversatie' : 'Conversational',
                    desc: isArabic ? 'تواصل يومي وتعابير حية' : isDutch ? 'Dagelijkse vlotheid' : 'Daily Fluency',
                    icon: '💬',
                  },
                  {
                    id: 'travel' as const,
                    title: isArabic ? 'سفر وملاحة' : isDutch ? 'Reizen & Navigatie' : 'Travel & Transit',
                    desc: isArabic ? 'مطارات ومطاعم وطوارئ' : isDutch ? 'Vliegvelden & Nood' : 'Airports & Navigation',
                    icon: '✈️',
                  },
                  {
                    id: 'business' as const,
                    title: isArabic ? 'أعمال ومفاوضات' : isDutch ? 'Zakelijk & Onderhandelen' : 'Business & Negotiation',
                    desc: isArabic ? 'عقود واجتماعات رسمية' : isDutch ? 'Contracten & Overleg' : 'Contracts & Meetings',
                    icon: '💼',
                  },
                  {
                    id: 'academic' as const,
                    title: isArabic ? 'أكاديمي وأبحاث' : isDutch ? 'Academisch & Onderzoek' : 'Academic & Research',
                    desc: isArabic ? 'نصوص فكرية ونقد رسمي' : isDutch ? 'Literatuur & Analyse' : 'Analysis & Discourse',
                    icon: '🎓',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLearningIntent(item.id);
                      audioSynth.playGentleFeedback();
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all border flex items-center gap-2 cursor-pointer ${
                      learningIntent === item.id
                        ? 'bg-blue-50/90 border-blue-600 text-blue-950 ring-1 ring-blue-500 shadow-2xs'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Name input (Optional - defaults strictly to 'Enter your name' / 'أدخل اسمك') */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-name-input" className="block text-xs font-extrabold text-slate-800">
                  {isArabic ? '4. اسم المستخدم' : isDutch ? '4. Jouw Naam' : '4. User Name'}
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isArabic ? 'افتراضي: أدخل اسمك' : 'Default: Enter your name'}
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-name-input"
                  type="text"
                  placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* 4. Optional Email */}
            <div>
              <label htmlFor="login-email-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                {isArabic ? 'البريد الإلكتروني (اختياري)' : isDutch ? 'E-mailadres (optioneel)' : 'Email Address (optional)'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  placeholder={isArabic ? 'name@example.com' : isDutch ? 'naam@voorbeeld.nl' : 'name@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button -> Placement Test */}
            <button
              id="login-start-placement-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>
                {isArabic 
                  ? `بدء اختبار تحديد المستوى في ${selectedTargetLanguage.name} (10 أسئلة)` 
                  : isDutch 
                  ? `Start Niveautest ${selectedTargetLanguage.name} (10 Vragen)` 
                  : `Start Placement Test in ${selectedTargetLanguage.name} (10 Questions)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              {isArabic ? 'أو' : isDutch ? 'of' : 'or'}
            </span>
          </div>

          {/* Continue as Guest Button */}
          <button
            id="login-continue-guest-btn"
            type="button"
            onClick={handleGuestClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <span>
              {isArabic 
                ? 'المتابعة كضيف إلى اختبار تحديد المستوى' 
                : isDutch 
                ? 'Direct Verder als Gast naar Niveautest' 
                : 'Continue as Guest to Placement Test'}
            </span>
          </button>

          {/* Direct Skip Test Button */}
          <button
            id="login-skip-test-direct-btn"
            type="button"
            onClick={() => {
              audioSynth.playGentleFeedback();
              if (onSkipTest) {
                onSkipTest(nativeCode, targetCode, name);
              } else {
                onContinueGuest(nativeCode, targetCode);
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span>
              {isArabic 
                ? '⚡ تخطي الاختبار والبدء مباشرة (مستوى A1 المبتدئ)' 
                : isDutch 
                ? '⚡ Niveautest Overslaan & Direct Beginnen (A1)' 
                : '⚡ Skip Placement Test & Start Directly (A1 Beginner)'}
            </span>
          </button>

          {/* Ephemeral / Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-left">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">
                {isArabic ? 'حماية الخصوصية: ' : isDutch ? 'Privacy & Sessiegeheugen: ' : 'Privacy First: '}
              </span>
              {isArabic
                ? 'لا يتم حفظ بياناتك على القرص الصلب. جميع الجلسات تعمل في الذاكرة المؤقتة لمتصفحك فقط.'
                : isDutch 
                ? 'Jouw naam en oefensessies worden niet bewaard op schijf. Alles draait in het vluchtig werkgeheugen van deze browsersessie.'
                : 'Your name and practice sessions are never stored to disk. Everything runs transiently in-memory for this session.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
