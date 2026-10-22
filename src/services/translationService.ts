/**
 * Translation Service for Custom Translator
 */

import { stripTransliteration } from './languageTypography';

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
  transliteration?: string;
  explanation?: string;
}

export async function translateCustom(
  text: string,
  targetLanguage: string
): Promise<TranslationResult> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        sourceLanguage: 'auto',
        targetLanguage,
        detectSource: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      translatedText: stripTransliteration(data.translatedText || text),
      detectedLanguage: data.detectedSourceLanguage || 'Detected',
      explanation: data.explanation || undefined,
    };
  } catch (error) {
    console.error('Translation error in translateCustom:', error);
    return {
      translatedText: text,
      detectedLanguage: 'Auto',
      explanation: 'Translation could not be completed at this time.',
    };
  }
}
