/**
 * Procedural Web Audio API Sound Engine & Web Speech Interface
 * Zero external MP3 dependencies. 100% synthesized in-browser.
 */

import { getBcp47Locale } from './speechDetectionService';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private binauralNodes: {
    oscLeft?: OscillatorNode;
    oscRight?: OscillatorNode;
    gainNode?: GainNode;
    noiseNode?: AudioBufferSourceNode;
    filterNode?: BiquadFilterNode;
  } = {};
  private currentSoundscape: 'alpha' | 'cosmic' | 'rain' | 'mute' = 'mute';
  private masterVolume: number = 0.4;
  private soundEffectsEnabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext || AudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEffectsEnabled(enabled: boolean) {
    this.soundEffectsEnabled = enabled;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.binauralNodes.gainNode && this.ctx) {
      this.binauralNodes.gainNode.gain.setTargetAtTime(
        this.currentSoundscape === 'mute' ? 0 : this.masterVolume * 0.25,
        this.ctx.currentTime,
        0.1
      );
    }
  }

  /**
   * Procedural subtle tab click feedback
   */
  public playTabClick() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  }

  /**
   * Combo Multiplier Chime with scaling dynamic pitch
   */
  public playComboMultiplier(combo: number = 1) {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const baseFreq = 523.25; // C5
      // Pitch steps up with combo level
      const pitchMultiplier = Math.min(2.5, 1 + Math.min(combo, 10) * 0.08);
      const targetFreq = baseFreq * pitchMultiplier;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(targetFreq * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  }

  /**
   * Procedural Celesta Success Chime (Bright, warm, non-punitive)
   */
  public playSuccessChime() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        // Gentle envelope
        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.7);
      });
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }

  /**
   * Warm gentle hint / soft feedback chime
   */
  public playGentleFeedback() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.2); // A4

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  }

  /**
   * Soft non-jarring low tone for incorrect responses or invalid speech
   */
  public playErrorTone() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220.0, now); // A3
      osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.25); // F3

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  }

  /**
   * Milestone / Crown Level-Up Fanfare
   */
  public playCrownFanfare() {
    this.playTriumphChime();
  }

  /**
   * Triumphant chime for milestones and completions
   */
  public playTriumphChime() {
    if (!this.soundEffectsEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 987.77, 1318.51]; // C5, E5, G5, B5, E6

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.05 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.3);
      });
    } catch (e) {
      console.warn('Audio notice:', e);
    }
  }

  /**
   * Stop any active background soundscape
   */
  public stopSoundscape() {
    try {
      if (this.binauralNodes.oscLeft) {
        this.binauralNodes.oscLeft.stop();
        this.binauralNodes.oscLeft.disconnect();
      }
      if (this.binauralNodes.oscRight) {
        this.binauralNodes.oscRight.stop();
        this.binauralNodes.oscRight.disconnect();
      }
      if (this.binauralNodes.noiseNode) {
        this.binauralNodes.noiseNode.stop();
        this.binauralNodes.noiseNode.disconnect();
      }
      if (this.binauralNodes.gainNode) {
        this.binauralNodes.gainNode.disconnect();
      }
    } catch (e) {
      // Ignore cleanup error
    }
    this.binauralNodes = {};
    this.currentSoundscape = 'mute';
  }

  /**
   * Start procedural focus soundscape
   */
  public startSoundscape(mode: 'alpha' | 'cosmic' | 'rain' | 'mute') {
    this.stopSoundscape();
    this.currentSoundscape = mode;
    if (mode === 'mute') return;

    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(this.masterVolume * 0.22, now + 1.5);
      masterGain.connect(ctx.destination);
      this.binauralNodes.gainNode = masterGain;

      if (mode === 'alpha') {
        // 432Hz Alpha Study Waves (Binaural 10Hz beat: 432Hz left, 442Hz right)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(432, now);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(442, now); // 10Hz Alpha difference

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-0.85, now);
          pannerR.pan.setValueAtTime(0.85, now);
          oscL.connect(pannerL);
          pannerL.connect(masterGain);
          oscR.connect(pannerR);
          pannerR.connect(masterGain);
        } else {
          oscL.connect(masterGain);
          oscR.connect(masterGain);
        }

        oscL.start();
        oscR.start();
        this.binauralNodes.oscLeft = oscL;
        this.binauralNodes.oscRight = oscR;
      } else if (mode === 'cosmic') {
        // Cosmic Harmonic Drone (Subtle low resonant chords)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);
        filter.Q.setValueAtTime(2, now);

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(108, now); // A2 fundamental
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(162, now); // E3 fifth

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        this.binauralNodes.oscLeft = osc1;
        this.binauralNodes.oscRight = osc2;
      } else if (mode === 'rain') {
        // Gentle Rain (Pink Noise filtered stream)
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
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(1200, now);

        whiteNoise.connect(rainFilter);
        rainFilter.connect(masterGain);

        whiteNoise.start();
        this.binauralNodes.noiseNode = whiteNoise;
      }
    } catch (e) {
      console.warn('Soundscape startup error:', e);
    }
  }

  private customPersona: {
    enabled: boolean;
    name: string;
    accent: string;
    pitch: number;
    rate: number;
    voiceName?: string;
    cadenceWordsPerMin?: number;
  } | null = null;

  public setCustomVoicePersona(persona: {
    enabled: boolean;
    name: string;
    accent: string;
    pitch: number;
    rate: number;
    voiceName?: string;
    cadenceWordsPerMin?: number;
  } | null) {
    this.customPersona = persona;
  }

  public getCustomVoicePersona() {
    return this.customPersona;
  }

  /**
   * Native Web Speech Synthesis with target language localization & Custom Persona Neural Audio
   */
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    }
  }

  public getAvailableVoices(langCode?: string): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (!this.cachedVoices.length) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    if (!langCode) return this.cachedVoices;
    const clean = langCode.trim().toLowerCase().split(/[-_]/)[0];
    return this.cachedVoices.filter((v) => v.lang.toLowerCase().startsWith(clean));
  }

  /**
   * Finds the highest quality neural or premium voice for a given language code
   */
  public getBestVoiceForLanguage(langCode: string): SpeechSynthesisVoice | null {
    const fullLocale = getBcp47Locale(langCode);
    const clean = (langCode || 'en').trim().toLowerCase().split(/[-_]/)[0];
    const voices = this.getAvailableVoices(clean);
    if (!voices.length) return null;

    // 1. Prioritize neural, natural, premium, Google, or Siri voices matching exact full locale
    const neuralLocaleMatch = voices.find((v) => 
      v.lang.toLowerCase() === fullLocale.toLowerCase() &&
      /neural|natural|premium|online|google|enhanced|siri/i.test(v.name)
    );
    if (neuralLocaleMatch) return neuralLocaleMatch;

    // 2. Prioritize neural, natural, premium voices matching language prefix
    const neuralPriority = voices.find((v) => 
      /neural|natural|premium|online|google|enhanced|siri/i.test(v.name)
    );
    if (neuralPriority) return neuralPriority;

    // 3. Exact full regional match
    const exactMatch = voices.find((v) => v.lang.toLowerCase() === fullLocale.toLowerCase());
    if (exactMatch) return exactMatch;

    return voices[0] || null;
  }

  public speakPhraseNative(phrase: string, langCode: string = 'es'): Promise<void> {
    const customRate = this.customPersona?.enabled ? this.customPersona.rate : 0.95;
    return this.speakText(phrase, langCode, customRate);
  }

  public speak(phrase: string, langCode: string = 'es', rate?: number): Promise<void> {
    return this.speakText(phrase, langCode, rate);
  }

  public speakSlow(phrase: string, langCode: string = 'es'): Promise<void> {
    return this.speakText(phrase, langCode, 0.75);
  }

  public speakText(text: string, langCode: string = 'es', rate: number = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported on this browser.');
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const bcp47 = getBcp47Locale(langCode);
      utterance.lang = bcp47;

      // Apply custom voice persona or neural acoustic tuning
      if (this.customPersona && this.customPersona.enabled) {
        utterance.pitch = Math.max(0.7, Math.min(1.4, this.customPersona.pitch));
        utterance.rate = Math.max(0.6, Math.min(1.4, this.customPersona.rate));
      } else {
        // Natural human speech cadence: 0.75 for slow, 0.95-1.0 for normal, warm 1.02 pitch
        utterance.rate = rate;
        utterance.pitch = 1.02;
      }

      // Query and assign premium/neural voice profiles matching target language
      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (this.customPersona?.enabled && this.customPersona.voiceName) {
        const allVoices = this.getAvailableVoices();
        selectedVoice = allVoices.find((v) => v.name.includes(this.customPersona!.voiceName!)) || null;
      }

      if (!selectedVoice) {
        selectedVoice = this.getBestVoiceForLanguage(langCode);
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const audioSynth = new AudioSynthesizer();

