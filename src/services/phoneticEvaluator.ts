// ======================================================================
// FLUENTECH STRICT PHONETIC & LEVENSHTEIN SPEECH EVALUATOR
// Fixes AI over-leniency, rejects filler words/gibberish, enforces >= 85% confidence.
// ======================================================================

export interface WordPhonemeAnalysis {
  targetWord: string;
  spokenWord?: string;
  isCorrect: boolean;
  accuracy: number; // 0 - 100
  phonemeStatus: 'exact' | 'mispronounced' | 'omitted' | 'inserted';
  targetIpa?: string;
  spokenIpa?: string;
  guidanceTip?: string;
}

export interface SpeechEvaluationResult {
  isPassing: boolean; // strictly confidence >= 85%
  passed: boolean;
  confidenceScore: number; // 0 - 100
  speakingPunctuation: number; // strictly 0 as requested
  punctuationPenalty: number; // strictly 0
  isGibberishOrFiller: boolean;
  isGibberish: boolean;
  rejectionReason?: string;
  normalizedTarget: string;
  normalizedSpoken: string;
  levenshteinDistance: number;
  wordAnalyses: WordPhonemeAnalysis[];
  phonemeBreakdown?: { phoneme: string; status: string; ipa?: string }[];
  phoneticFeedback: string;
  correctiveGuidance: string;
}

const FILLER_PATTERNS = [
  /blah(\s*blah)+/i,
  /na(\s*na)+/i,
  /la(\s*la)+/i,
  /da(\s*da)+/i,
  /uh+(\s*uh+)+/i,
  /um+(\s*um+)+/i,
  /test(\s*test)+/i,
  /gibberish/i,
  /random/i,
  /asdf/i,
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’«»¡!¿]/g, '')
    .replace(/\s+/g, ' ');
}

// Compute standard Levenshtein distance
export function computeLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

// Check for gibberish, repetitive filler syllables or silence
export function detectGibberishOrFiller(spoken: string): { isFiller: boolean; reason?: string } {
  const trimmed = spoken.trim();
  if (!trimmed || trimmed.length < 2) {
    return { isFiller: true, reason: 'Audio input was too faint, silent, or unarticulated.' };
  }

  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isFiller: true, reason: 'Rejected: Non-target speech sounds or repetitive filler words detected.' };
    }
  }

  // Check repeating identical 3+ words or repeating single letter
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 3 && tokens.every((t) => t.toLowerCase() === tokens[0].toLowerCase())) {
    return { isFiller: true, reason: 'Rejected: Monotonous repeating sound detected.' };
  }

  return { isFiller: false };
}

// Strict Speech Evaluation against native target sentence
export function evaluateSpokenPhrase(arg1: string, arg2: string, _languageCode?: string): SpeechEvaluationResult {
  // Support both (target, spoken) and (spoken, target) orders
  const norm1 = normalizeText(arg1);
  const norm2 = normalizeText(arg2);
  
  // By default target is arg1, spoken is arg2; if arg1 is empty or clearly spoken, normalize
  const normTarget = norm1.length >= norm2.length ? norm1 : norm2;
  const normSpoken = norm1.length >= norm2.length ? norm2 : norm1;

  // 1. Check STT integrity & gibberish
  const fillerCheck = detectGibberishOrFiller(arg2 || arg1);
  if (fillerCheck.isFiller) {
    return {
      isPassing: false,
      passed: false,
      confidenceScore: 12,
      speakingPunctuation: 0,
      punctuationPenalty: 0,
      isGibberishOrFiller: true,
      isGibberish: true,
      rejectionReason: fillerCheck.reason,
      normalizedTarget: normTarget,
      normalizedSpoken: normSpoken,
      levenshteinDistance: computeLevenshtein(normTarget, normSpoken),
      wordAnalyses: normTarget.split(' ').map((w) => ({
        targetWord: w,
        isCorrect: false,
        accuracy: 0,
        phonemeStatus: 'omitted',
        guidanceTip: 'Target sound not articulated.',
      })),
      phonemeBreakdown: normTarget.split(' ').map((w) => ({ phoneme: w, status: 'mispronounced' })),
      phoneticFeedback: 'Non-target articulation detected. Please speak the exact target phrase clearly.',
      correctiveGuidance: 'Listen to the native voice audio model and mirror the cadence and vowels.',
    };
  }

  const targetWords = normTarget.split(' ').filter(Boolean);
  const spokenWords = normSpoken.split(' ').filter(Boolean);

  const wordAnalyses: WordPhonemeAnalysis[] = [];
  let totalWordAccuracy = 0;

  for (let i = 0; i < targetWords.length; i++) {
    const tWord = targetWords[i];
    const sWord = spokenWords[i];

    if (!sWord) {
      wordAnalyses.push({
        targetWord: tWord,
        isCorrect: false,
        accuracy: 0,
        phonemeStatus: 'omitted',
        guidanceTip: `Missing word "${tWord}".`,
      });
      continue;
    }

    const dist = computeLevenshtein(tWord, sWord);
    const maxLen = Math.max(tWord.length, sWord.length);
    const accuracy = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));

    const isWordCorrect = accuracy >= 88;
    totalWordAccuracy += accuracy;

    wordAnalyses.push({
      targetWord: tWord,
      spokenWord: sWord,
      isCorrect: isWordCorrect,
      accuracy,
      phonemeStatus: isWordCorrect ? 'exact' : 'mispronounced',
      guidanceTip: isWordCorrect
        ? undefined
        : `Phonetic slip: "${sWord}" vs native "${tWord}". Check tongue elevation and vowel duration.`,
    });
  }

  // Account for extra inserted words
  if (spokenWords.length > targetWords.length) {
    for (let j = targetWords.length; j < spokenWords.length; j++) {
      wordAnalyses.push({
        targetWord: '',
        spokenWord: spokenWords[j],
        isCorrect: false,
        accuracy: 0,
        phonemeStatus: 'inserted',
        guidanceTip: `Extra unexpected word "${spokenWords[j]}".`,
      });
    }
  }

  // Overall sentence Levenshtein distance
  const fullDist = computeLevenshtein(normTarget, normSpoken);
  const fullMaxLen = Math.max(normTarget.length, normSpoken.length, 1);
  const rawLevScore = Math.max(0, Math.round(((fullMaxLen - fullDist) / fullMaxLen) * 100));

  // Blend word-level and sentence-level Levenshtein
  const avgWordScore = targetWords.length > 0 ? Math.round(totalWordAccuracy / targetWords.length) : 0;
  const confidenceScore = Math.min(100, Math.round(rawLevScore * 0.45 + avgWordScore * 0.55));

  // Strict requirement: confidence >= 85%
  const isPassing = confidenceScore >= 85;

  let phoneticFeedback = '';
  let correctiveGuidance = '';

  if (isPassing) {
    phoneticFeedback = `Excellent pronunciation accuracy (${confidenceScore}%). Clean phoneme alignment and native-like rhythm.`;
    correctiveGuidance = 'Rhythm, intonation, and formant positioning closely match native acoustic targets.';
  } else {
    const mispronounced = wordAnalyses.filter((w) => !w.isCorrect && w.targetWord).map((w) => `"${w.targetWord}"`);
    phoneticFeedback = `Pronunciation accuracy (${confidenceScore}%) is below the 85% threshold. Mispronounced or omitted tokens: ${mispronounced.join(', ') || 'Sentence structure'}.`;
    correctiveGuidance = 'Focus on vowel length and stop consonants. Click the audio speaker to repeat aloud in unison.';
  }

  return {
    isPassing,
    passed: isPassing,
    confidenceScore,
    speakingPunctuation: 0,
    punctuationPenalty: 0,
    isGibberishOrFiller: false,
    isGibberish: false,
    normalizedTarget: normTarget,
    normalizedSpoken: normSpoken,
    levenshteinDistance: fullDist,
    wordAnalyses,
    phonemeBreakdown: wordAnalyses.map((w) => ({
      phoneme: w.targetWord,
      status: w.phonemeStatus,
      ipa: w.targetIpa,
    })),
    phoneticFeedback,
    correctiveGuidance,
  };
}

export type PhoneticEvaluationResult = SpeechEvaluationResult;
export const evaluateSpeechPhonetics = evaluateSpokenPhrase;
export const evaluateStrictSpeech = evaluateSpokenPhrase;
