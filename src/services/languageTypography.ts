/**
 * Universal Directional Typography & Script Helper
 * Enforces strict bidirectional layout (RTL vs LTR) and pure native scripts.
 */

const RTL_CODES = new Set([
  'ar',  // Arabic
  'he',  // Hebrew
  'iw',  // Hebrew (legacy code)
  'fa',  // Persian / Farsi
  'ur',  // Urdu
  'yi',  // Yiddish
  'ps',  // Pashto
  'sd',  // Sindhi
  'ug',  // Uyghur
  'ckb', // Kurdish (Sorani)
  'ku',  // Kurdish
]);

// Unicode ranges for RTL scripts: Arabic, Hebrew, Syriac, Thaana, Samaritan, Mandaic, etc.
const RTL_CHAR_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

/**
 * Returns true if the language code uses Right-to-Left (RTL) script.
 */
export function isRtlLanguage(langCode?: string): boolean {
  if (!langCode) return false;
  const clean = langCode.trim().toLowerCase().split(/[-_]/)[0];
  return RTL_CODES.has(clean);
}

/**
 * Automatically detects whether a specific string contains RTL characters
 * (like Arabic or Hebrew script).
 */
export function hasRtlCharacters(text?: string): boolean {
  if (!text) return false;
  return RTL_CHAR_REGEX.test(text);
}

/**
 * Determines text direction based on both content and fallback language code.
 */
export function resolveDirection(text?: string, langCode?: string): 'rtl' | 'ltr' {
  if (text && hasRtlCharacters(text)) return 'rtl';
  if (langCode && isRtlLanguage(langCode)) return 'rtl';
  return 'ltr';
}

/**
 * Returns directional attributes and classes for DOM elements.
 */
export function getDirectionProps(text?: string, langCode?: string) {
  const isRtl = resolveDirection(text, langCode) === 'rtl';
  return {
    dir: isRtl ? ('rtl' as const) : ('ltr' as const),
    className: isRtl ? 'text-right font-arabic' : 'text-left',
  };
}

/**
 * Strips all Latin phonetic romanizations / transliterations enclosed in parentheses.
 * E.g. "السَّلامُ عَلَيْكُم (As-salāmu ʿalaykum)" -> "السَّلامُ عَلَيْكُم"
 * E.g. "こんにちは (Konnichiwa)" -> "こんにちは"
 * E.g. "パン _____ 食べます (Pan _____ tabemasu)" -> "パン _____ 食べます"
 * Only keeps native authentic characters and translations.
 */
export function stripTransliteration(text: string): string {
  if (!text) return '';
  return text
    // Remove any parenthesis containing Latin letters / diacritics / romanization tokens, along with optional trailing punctuation
    .replace(/\s*\([^)]*[A-Za-zāīūḍṣṭẓʿʾēōáéíóúàèìòùâêîôûäëïöüñçß][^)]*\)[.\s]*/g, ' ')
    // Normalize spaces and trim
    .replace(/\s{2,}/g, ' ')
    .trim();
}
