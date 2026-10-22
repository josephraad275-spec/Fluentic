/**
 * Real-Time Audio Detection & Speech Recognition Engine (Gemini 16kHz Multimodal PCM Streaming)
 * Seamlessly captures 16kHz 16-bit audio stream and feeds Gemini Live & Multimodal Speech API.
 */

import { realtimeAudio } from './realtimeAudioEngine';

// BCP-47 Language mapping
export const BCP47_MAP: Record<string, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-BR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
  ru: 'ru-RU',
  nl: 'nl-NL',
  tr: 'tr-TR',
  pl: 'pl-PL',
  sv: 'sv-SE',
  el: 'el-GR',
  hi: 'hi-IN',
  uk: 'uk-UA',
  vi: 'vi-VN',
  cs: 'cs-CZ',
  ro: 'ro-RO',
  hu: 'hu-HU',
  da: 'da-DK',
  fi: 'fi-FI',
  no: 'no-NO',
  id: 'id-ID',
  th: 'th-TH',
  he: 'he-IL',
  fa: 'fa-IR',
  tl: 'fil-PH',
  lt: 'lt-LT',
  lv: 'lv-LV',
  et: 'et-EE',
  bn: 'bn-BD',
  ur: 'ur-PK',
  ms: 'ms-MY',
  bg: 'bg-BG',
  hr: 'hr-HR',
  sr: 'sr-RS',
  sk: 'sk-SK',
  sl: 'sl-SI',
  ca: 'ca-ES',
  sw: 'sw-KE',
};

export function getBcp47Locale(langCode?: string): string {
  if (!langCode) return 'en-US';
  const clean = langCode.trim().toLowerCase().split(/[-_]/)[0];
  return BCP47_MAP[clean] || `${clean}-${clean.toUpperCase()}`;
}

export interface SpeechDetectionOptions {
  langCode?: string;
  targetLangName?: string;
  sourceLangName?: string;
  onTranscript: (finalTranscript: string, translation?: string, detectedSource?: string) => void;
  onInterim?: (interimTranscript: string) => void;
  onVadLevel?: (level: number, isSpeech: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class SpeechDetectionService {
  private isListening: boolean = false;

  public getIsListening(): boolean {
    return this.isListening || realtimeAudio.getIsActive();
  }

  /**
   * Start 16kHz direct audio stream capture with Gemini processing
   */
  public async startListening(options: SpeechDetectionOptions): Promise<boolean> {
    this.stopListening();
    this.isListening = true;

    try {
      const started = await realtimeAudio.startSession({
        sourceLanguage: options.sourceLangName || options.langCode || 'auto',
        targetLanguage: options.targetLangName || 'English',
        onTranscript: (transcription, translation, detectedSource) => {
          options.onTranscript(transcription, translation, detectedSource);
        },
        onVadLevel: (level, isSpeech) => {
          options.onVadLevel?.(level, isSpeech);
          if (isSpeech && options.onInterim) {
            options.onInterim('...');
          }
        },
        onError: (err) => {
          console.warn('[SpeechDetectionService Error]', err);
          this.isListening = false;
          options.onError?.(err);
        },
        onStatusChange: (status) => {
          if (status === 'idle') {
            this.isListening = false;
            options.onEnd?.();
          }
        },
      });

      return started;
    } catch (err: any) {
      console.warn('Realtime PCM Audio start failed:', err);
      this.isListening = false;
      options.onError?.(err?.message || 'Failed to start microphone');
      return false;
    }
  }

  /**
   * Stop active listening and trigger final transcription
   */
  public async stopListening(): Promise<void> {
    this.isListening = false;
    await realtimeAudio.stopSession();
  }
}

export const speechDetector = new SpeechDetectionService();
