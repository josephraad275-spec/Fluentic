import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Activity, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Brain, 
  Flame, 
  Headphones, 
  ShieldCheck,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { getI18n } from '../../services/localization';
import { resolveDirection } from '../../services/languageTypography';

interface FocusAlphaWaveViewProps {
  activeLanguage: Language;
  user: UserProfile;
}

export type FocusPresetId = 'alpha-432' | 'theta-528' | 'gamma-40' | 'pink-noise' | 'cosmic-drone';

interface FocusPreset {
  id: FocusPresetId;
  name: string;
  nameAr: string;
  nameNl: string;
  freqLeft: number;
  freqRight: number;
  beatHz: number;
  description: string;
  descriptionAr: string;
  descriptionNl: string;
  badge: string;
  badgeAr: string;
  badgeNl: string;
  color: string;
}

const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: 'alpha-432',
    name: '432Hz Calm Alpha (Active Learning)',
    nameAr: '432Hz موجات ألفا (الاستيعاب النشط)',
    nameNl: '432Hz Kalme Alfa (Actief Leren)',
    freqLeft: 432,
    freqRight: 442,
    beatHz: 10,
    description: 'Binaural 10Hz Alpha difference aligned to natural 432Hz harmonic tuning for deep cognitive absorption.',
    descriptionAr: 'فرق تردد ثنائي 10Hz متناغم مع تردد 432Hz الطبيعي لتسهيل الاستيعاب اللغوي والتركيز الذهني العميق.',
    descriptionNl: 'Binauraal 10Hz Alfa-verschil afgestemd op de 432Hz harmonische stemming voor optimale opname.',
    badge: 'Optimal for Vocabulary',
    badgeAr: 'الأمثل للمفردات',
    badgeNl: 'Optimaal voor Woordenschat',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'theta-528',
    name: '528Hz Theta (Deep Memory Consolidation)',
    nameAr: '528Hz ثيتا (ترسيخ الذاكرة العميقة)',
    nameNl: '528Hz Theta (Diepe Geheugenconsolidatie)',
    freqLeft: 528,
    freqRight: 534,
    beatHz: 6,
    description: 'Solfeggio frequency with a gentle 6Hz Theta rhythm designed to lock vocabulary into long-term synaptic memory.',
    descriptionAr: 'تردد سولفيجيو 528Hz بنبض ثيتا 6Hz مصمم لتثبيت الكلمات وتراكيب القواعد في الذاكرة الدائمة.',
    descriptionNl: 'Solfeggio-frequentie met een zacht 6Hz Theta-ritme voor langdurige verankering in het geheugen.',
    badge: 'Memory Consolidation',
    badgeAr: 'تثبيت الذاكرة',
    badgeNl: 'Geheugenopslag',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'gamma-40',
    name: '40Hz Gamma (Intense Cognitive Synthesis)',
    nameAr: '40Hz غاما (التركيز المعرفي الحاد)',
    nameNl: '40Hz Gamma (Intense Focus)',
    freqLeft: 220,
    freqRight: 260,
    beatHz: 40,
    description: 'High-frequency 40Hz neural synchronization for complex syntax deciphering and formal academic registers.',
    descriptionAr: 'تزامن عصبي عالي بتردد 40Hz لفك شفرات القواعد المعقدة والنصوص الأدبية والأكاديمية الرفيعة.',
    descriptionNl: 'Hoge 40Hz neurale synchronisatie voor complexe grammaticale structuren en academisch debat.',
    badge: 'C1/C2 Syntax Surgery',
    badgeAr: 'مناسب لمستويات C1/C2',
    badgeNl: 'Geschikt voor C1/C2',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'pink-noise',
    name: 'Gentle Pink Noise (Cognitive Isolation)',
    nameAr: 'الضوضاء الوردية (عزل التشتت الذهني)',
    nameNl: 'Zachte Roze Ruis (Cognitieve Isolatie)',
    freqLeft: 100,
    freqRight: 100,
    beatHz: 0,
    description: '1/f acoustic power distribution blocking background auditory distractions during reading sessions.',
    descriptionAr: 'توزيع صوتي متوازن يحجب الضوضاء المحيطة تماماً ويمنحك عزلة ذهنية كاملة للقراءة الهادئة.',
    descriptionNl: 'Akoestische ruis die omgevingsgeluiden effectief dempt tijdens intensieve leessessies.',
    badge: 'Distraction Shield',
    badgeAr: 'حاجب المشتتات',
    badgeNl: 'Aandachtsbeschermer',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'cosmic-drone',
    name: '108Hz Sacred Drone (Deep Stillness)',
    nameAr: '108Hz الرنين الكوني (الهدوء التام)',
    nameNl: '108Hz Kosmische Resonantie',
    freqLeft: 108,
    freqRight: 112,
    beatHz: 4,
    description: 'Low-frequency meditative foundation tuned to resonant octaves for zero-stress language absorption.',
    descriptionAr: 'رنين تأملي منخفض التردد يزيل التوتر ويهيئ العقل للاستيعاب السلس دون أي إجهاد.',
    descriptionNl: 'Laagfrequente meditatieve drone voor stressvrije en vloeiende taalabsorptie.',
    badge: 'Stress Reduction',
    badgeAr: 'تهدئة وتخفيف التوتر',
    badgeNl: 'Stressvermindering',
    color: 'from-blue-600 to-cyan-600',
  },
];

export const FocusAlphaWaveView: React.FC<FocusAlphaWaveViewProps> = ({
  activeLanguage,
  user,
}) => {
  const nativeCode = user.nativeLanguageCode || 'en';
  const isArabic = nativeCode === 'ar';
  const isDutch = nativeCode === 'nl';
  const isRtl = isArabic || resolveDirection('', nativeCode) === 'rtl';
  const i18n = getI18n(nativeCode);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<FocusPresetId>('alpha-432');
  const [volume, setVolume] = useState<number>(0.55);
  const [baseFreq, setBaseFreq] = useState<number>(432);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [targetTimerMinutes, setTargetTimerMinutes] = useState<number>(25); // 25m Pomodoro default
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseFilterRef = useRef<BiquadFilterNode | null>(null);

  // Canvas visualizer Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentPreset = FOCUS_PRESETS.find((p) => p.id === activePreset) || FOCUS_PRESETS[0];

  // Stop Web Audio nodes cleanly
  const stopAudio = () => {
    try {
      if (oscLeftRef.current) {
        oscLeftRef.current.stop();
        oscLeftRef.current.disconnect();
        oscLeftRef.current = null;
      }
      if (oscRightRef.current) {
        oscRightRef.current.stop();
        oscRightRef.current.disconnect();
        oscRightRef.current = null;
      }
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
      if (noiseFilterRef.current) {
        noiseFilterRef.current.disconnect();
        noiseFilterRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch {
      // Ignore cleanup error
    }
  };

  // Start soundwaves using pure Web Audio API
  const startAudio = (presetId: FocusPresetId, customFreq?: number) => {
    stopAudio();

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtxClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.28), now + 0.8);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const preset = FOCUS_PRESETS.find((p) => p.id === presetId) || FOCUS_PRESETS[0];
      const freq = customFreq || (presetId === 'alpha-432' ? baseFreq : preset.freqLeft);

      if (presetId === 'pink-noise') {
        // Synthesize gentle pink noise stream
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
          b6 = white * 0.115926;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        noiseSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.setValueAtTime(1.0, now);

        noiseSrc.connect(filter);
        filter.connect(masterGain);
        noiseSrc.start(now);

        noiseSourceRef.current = noiseSrc;
        noiseFilterRef.current = filter;
      } else {
        // Binaural synthesis: left ear vs right ear with stereo panner
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        const beatDiff = preset.beatHz;
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(freq, now);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(freq + beatDiff, now);

        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-0.88, now);
          pannerR.pan.setValueAtTime(0.88, now);
          oscL.connect(pannerL);
          pannerL.connect(masterGain);
          oscR.connect(pannerR);
          pannerR.connect(masterGain);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start(now);
        oscR.start(now);

        oscLeftRef.current = oscL;
        oscRightRef.current = oscR;
      }
    } catch (e) {
      console.warn('Focus Audio Notice:', e);
    }
  };

  // Toggle playback cleanly
  const togglePlay = () => {
    audioSynth.playGentleFeedback();
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activePreset, baseFreq);
      setIsPlaying(true);
    }
  };

  // Handle Preset change
  const handleSelectPreset = (presetId: FocusPresetId) => {
    audioSynth.playGentleFeedback();
    setActivePreset(presetId);
    const p = FOCUS_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setBaseFreq(p.freqLeft);
    }
    if (isPlaying) {
      startAudio(presetId, p?.freqLeft);
    }
  };

  // Handle Volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        Math.max(0.001, newVol * 0.28),
        audioContextRef.current.currentTime,
        0.05
      );
    }
  };

  // Handle Frequency change
  const handleFreqChange = (freq: number) => {
    setBaseFreq(freq);
    if (isPlaying && oscLeftRef.current && oscRightRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      oscLeftRef.current.frequency.setTargetAtTime(freq, now, 0.05);
      oscRightRef.current.frequency.setTargetAtTime(freq + currentPreset.beatHz, now, 0.05);
    }
  };

  // Session timer increment
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Auto-initialize Web Audio API context & play smooth 432Hz / 10Hz Alpha Binaural brainwave on mount
  useEffect(() => {
    try {
      startAudio('alpha-432', 432);
      setIsPlaying(true);
    } catch (e) {
      console.warn('Focus audio auto-start notice:', e);
    }

    // Gesture unlock if browser blocked immediate autoplay
    const unlockOnGesture = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener('click', unlockOnGesture, { once: true });
    window.addEventListener('touchstart', unlockOnGesture, { once: true });

    return () => {
      window.removeEventListener('click', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      stopAudio();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Smooth Canvas Soundwave Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0A1128');
      bgGrad.addColorStop(0.5, '#0F2137');
      bgGrad.addColorStop(1, '#080E21');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Center baseline
      const centerY = height / 2;

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.07)';
      ctx.lineWidth = 1;
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const activeAmpMultiplier = isPlaying ? Math.max(0.3, volume) : 0.08;
      const speed = isPlaying ? 0.045 : 0.008;

      // Draw 3 layered harmonic sine waves (Alpha, Theta, Resonant Sub-harmonic)
      const waves = [
        { amp: 38 * activeAmpMultiplier, freq: 0.016, color: 'rgba(212, 175, 55, 0.85)', width: 3 },
        { amp: 26 * activeAmpMultiplier, freq: 0.024, color: 'rgba(255, 215, 0, 0.65)', width: 2 },
        { amp: 16 * activeAmpMultiplier, freq: 0.038, color: 'rgba(56, 189, 248, 0.55)', width: 1.5 },
      ];

      waves.forEach((w, idx) => {
        ctx.beginPath();
        ctx.lineWidth = w.width;
        ctx.strokeStyle = w.color;
        ctx.shadowColor = w.color;
        ctx.shadowBlur = isPlaying ? 14 : 4;

        for (let x = 0; x < width; x += 2) {
          const envelope = Math.sin((x / width) * Math.PI); // Window tapering at edges
          const y = centerY + Math.sin(x * w.freq + phase * (idx + 1)) * w.amp * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Frequency readout indicator in canvas
      ctx.shadowBlur = 0;
      ctx.fillStyle = isPlaying ? '#D4AF37' : '#94A3B8';
      ctx.font = 'bold 11px system-ui, sans-serif';
      const statusText = isPlaying 
        ? `● 432Hz ALPHA SYNTHESIS • ACTIVE (${baseFreq} Hz)` 
        : '○ STANDBY • TAP START TO ENGAGE ALPHA SOUNDWAVES';
      ctx.fillText(statusText, 20, 26);

      phase += speed;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, volume, baseFreq]);

  // Sample immersion vocabulary cards for deep retention practice during soundwave sessions
  const immersionCards = [
    {
      phrase: activeLanguage.sampleGreeting || 'Buenos días',
      meaning: isArabic ? 'صباح الخير (التحية اليومية)' : isDutch ? 'Goedemorgen (dagelijkse begroeting)' : 'Good morning (Daily greeting)',
      tip: isArabic ? 'نغمة صوتية واضحة وطبيعية' : isDutch ? 'Vloeiende intonatie' : 'Clear melodic cadence',
    },
    {
      phrase: isArabic ? 'أهلاً وسهلاً' : 'Por favor / Gracias',
      meaning: isArabic ? 'ترحيب حار بالضيف' : isDutch ? 'Alsjeblieft / Dank je wel' : 'Please / Thank you (Essential etiquette)',
      tip: isArabic ? 'مفتاح التواصل الإنساني الرفيع' : isDutch ? 'Essentiële beleefdheidsvorm' : 'Core social scaffolding',
    },
    {
      phrase: isArabic ? 'العلم نور والجهل ظلام' : 'Paso a paso se llega lejos',
      meaning: isArabic ? 'حكمة عميقة حول قيمة المعرفة' : isDutch ? 'Stap voor stap kom je ver' : 'Step by step, one journeys far',
      tip: isArabic ? 'تركيب بلاغي لتثبيت المفاهيم' : isDutch ? 'Spreekwoordelijke diepgang' : 'Cognitive endurance idiom',
    },
  ];

  const currentCard = immersionCards[activeCardIndex % immersionCards.length];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="fluentic-focus-alpha-wave-view"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-36 space-y-6 select-none"
    >
      {/* Top Header Card */}
      <div className="w-full text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1B365D]/90 to-[#0F2137]/90 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-black shadow-md backdrop-blur-md">
          <Brain className="w-4 h-4 text-[#D4AF37]" />
          <span>
            {isArabic 
              ? 'محرك موجات الدماغ ألفا 432Hz للتركيز العميق' 
              : isDutch 
              ? '432Hz Alfagolven & Diepe Cognitieve Focus' 
              : '432Hz Alpha Brainwave Engine & Deep Focus'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {isArabic 
            ? 'محطة التركيز المعرفي وموجات ألفا' 
            : isDutch 
            ? 'Diepe Focus & Binaurale Alfagolven' 
            : 'Deep Cognitive Focus & Alpha Soundwaves'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {isArabic
            ? 'استمع إلى ترددات 432Hz وموجات ألفا الثنائية لتصفية الذهن، مضاعفة الحفظ طويل المدى، والاستيعاب السلس للغة دون أي إجهاد.'
            : isDutch
            ? 'Binaurale 432Hz-frequenties en kalmerende alfagolven stimuleren synaptische retentie en maximale taalopname tijdens je studiesessies.'
            : 'Soothe cognitive fatigue and maximize linguistic retention with pure, in-browser synthesized 432Hz binaural beats and alpha brainwave frequencies.'}
        </p>
      </div>

      {/* Main Interactive Animated Soundwave Player Box */}
      <div className="rounded-3xl bg-[#0A1128] text-white p-5 sm:p-7 border border-[#D4AF37]/40 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow ambient background behind visualizer */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Top Control Strip inside Player */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_12px_#34D399]' : 'bg-slate-600'}`} />
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{isArabic ? currentPreset.nameAr : isDutch ? currentPreset.nameNl : currentPreset.name}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {isArabic 
                  ? `التردد الأساسي: ${baseFreq} Hz • فرق ثنائي: ${currentPreset.beatHz} Hz` 
                  : `Fundamental: ${baseFreq} Hz • Binaural Delta: ${currentPreset.beatHz} Hz`}
              </div>
            </div>
          </div>

          {/* Session Timer Display */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-black text-amber-300">
              {formatTimer(sessionSeconds)}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-bold">
              {isArabic ? 'جلسة التركيز' : 'Session'}
            </span>
          </div>
        </div>

        {/* Animated Soundwave Canvas Display */}
        <div className="relative z-10 w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/70 shadow-inner">
          <canvas
            ref={canvasRef}
            width={800}
            height={220}
            className="w-full h-full object-cover"
          />

          {/* Center Play/Pause Trigger Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={togglePlay}
              className={`pointer-events-auto p-4 sm:p-5 rounded-full transition-all transform hover:scale-108 active:scale-95 shadow-2xl flex items-center justify-center cursor-pointer border ${
                isPlaying
                  ? 'bg-gradient-to-br from-amber-400 via-[#D4AF37] to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-[#1B365D] to-[#0A1128] text-[#D4AF37] border-[#D4AF37]/60 hover:border-[#D4AF37]'
              }`}
              title={isPlaying ? 'Pause Soundwaves' : 'Start 432Hz Alpha Waves'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Sliders & Acoustic Tuning Controls */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* 1. Volume Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{isArabic ? 'مستوى الصوت' : isDutch ? 'Geluidsvolume' : 'Soundwave Volume'}</span>
              </span>
              <span className="font-mono text-[#D4AF37]">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 2. Frequency Hz Slider */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#D4AF37]" />
                <span>{isArabic ? 'التردد الصوتي (هرتز)' : isDutch ? 'Frequentie (Hz)' : 'Frequency (Hz)'}</span>
              </span>
              <span className="font-mono text-[#D4AF37]">{baseFreq} Hz</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="1"
              value={baseFreq}
              onChange={(e) => handleFreqChange(parseInt(e.target.value, 10))}
              className="w-full accent-[#D4AF37] bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Presets Selection Grid */}
        <div className="relative z-10 space-y-3 pt-2">
          <div className="text-xs font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            <span>{isArabic ? 'أنماط الترددات الذهنية المبرمجة' : isDutch ? 'Binaurale Focus Profielen' : 'Binaural Focus Profiles'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {FOCUS_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#1B365D] to-[#0F2137] border-[#D4AF37] text-white shadow-lg ring-1 ring-[#D4AF37]/50'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white">
                      {isArabic ? preset.nameAr : isDutch ? preset.nameNl : preset.name}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                      {isArabic ? preset.badgeAr : isDutch ? preset.badgeNl : preset.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isArabic ? preset.descriptionAr : isDutch ? preset.descriptionNl : preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deep Retention Flashcard Recall Card while listening to soundwaves */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{activeLanguage.flag}</span>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {isArabic 
                ? 'استرجاع الذاكرة النشط أثناء الاستماع للموجات' 
                : isDutch 
                ? 'Actieve Herinnering tijdens het Luisteren' 
                : 'Active Cognitive Recall Exercise'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {activeCardIndex + 1} / {immersionCards.length}
          </span>
        </div>

        {/* Flipping Practice Card */}
        <div
          onClick={() => setIsCardFlipped(!isCardFlipped)}
          className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200 text-center cursor-pointer transition-all hover:shadow-md space-y-3"
        >
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            {isCardFlipped 
              ? (isArabic ? 'المعنى في موطنك الأصلي' : 'Meaning in Native Context') 
              : (isArabic ? 'العبارة باللغة المستهدفة (انقر للترجمة)' : 'Target Language Phrase (Tap to Reveal)')}
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wide font-sans">
            {isCardFlipped ? currentCard.meaning : currentCard.phrase}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            💡 {currentCard.tip}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              audioSynth.playGentleFeedback();
              setIsCardFlipped(false);
              setActiveCardIndex((prev) => (prev - 1 + immersionCards.length) % immersionCards.length);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {isArabic ? 'السابق' : 'Previous'}
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSuccessChime();
              setIsCardFlipped(false);
              setActiveCardIndex((prev) => (prev + 1) % immersionCards.length);
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer border border-[#C5A059]/40"
          >
            <span>{isArabic ? 'العبارة التالية' : 'Next Recall Phrase'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
