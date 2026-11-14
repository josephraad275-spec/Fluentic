import { FLUENTIC_CEFR_LEVELS } from '../pedagogy';
import { enforceTargetScript } from '../../services/FluenticMasterEngine';
import { WORLD_LANGUAGES } from '../../data/languages';

type JsonRecord = Record<string, unknown>;
const record = (value: unknown): value is JsonRecord => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(string);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid AI response: ${message}`);
}

function targetText(value: unknown, language: string, field: string): void {
  assert(string(value), `${field} is missing`);
  const candidate = language.toLowerCase().trim();
  const matched = WORLD_LANGUAGES.find(item =>
    item.code.toLowerCase() === candidate || item.name.toLowerCase() === candidate || item.nativeName.toLowerCase() === candidate
  );
  assert(matched, `unsupported target language: ${language}`);
  enforceTargetScript(value, matched.code);
}

export function validateGeneratedResponse(action: 'translate' | 'placement' | 'level-analysis' | 'personal-lesson' | 'speech-analysis', data: unknown, language: string, questionCount?: number): JsonRecord {
  assert(record(data), 'expected a JSON object');
  if (action === 'translate') {
    targetText(data.translation, language, 'translation');
    assert(data.detectedSourceLanguage === undefined || string(data.detectedSourceLanguage), 'detectedSourceLanguage');
  } else if (action === 'placement') {
    assert(Array.isArray(data.questions) && data.questions.length === questionCount, 'question count');
    const counts = new Map<string, number>();
    const ids = new Set<number>();
    for (const q of data.questions) {
      assert(record(q), 'question object');
      assert(Number.isInteger(q.id) && !ids.has(q.id as number), 'unique question id');
      ids.add(q.id as number);
      assert(FLUENTIC_CEFR_LEVELS.includes(q.level as typeof FLUENTIC_CEFR_LEVELS[number]), 'question level');
      counts.set(q.level as string, (counts.get(q.level as string) || 0) + 1);
      assert(string(q.skill) && string(q.instruction) && string(q.explanation), 'question metadata');
      targetText(q.prompt, language, 'question prompt');
      assert(Array.isArray(q.options) && q.options.length === 4, 'four options');
      const keys = new Set<string>();
      for (const option of q.options) {
        assert(record(option) && string(option.key) && /^[ABCD]$/.test(option.key) && !keys.has(option.key), 'option key');
        keys.add(option.key);
        targetText(option.text, language, 'option text');
      }
      assert(keys.size === 4 && keys.has(q.correctKey as string), 'correct answer');
      if (q.level === 'C1' || q.level === 'C2') {
        const evidence = `${q.skill} ${q.instruction} ${q.explanation}`.toLowerCase();
        assert(/rhetor|liter|academic|debate|argument|synthesi|inferen|register|critique|discourse|irony|pragmatic|stylistic|بلاغ|أكاديم|نقد|حجاج|استدلال|تحليل|خطاب/.test(evidence), 'advanced item lacks advanced-skill evidence');
        assert(!/greeting|self.introduction|café order|basic phrase|تحية|التعارف/.test(evidence), 'beginner item at C1/C2');
      }
    }
    assert(FLUENTIC_CEFR_LEVELS.every(level => (counts.get(level) || 0) >= 1), 'all CEFR tiers required');
  } else if (action === 'level-analysis') {
    assert(FLUENTIC_CEFR_LEVELS.includes(data.estimatedLevel as typeof FLUENTIC_CEFR_LEVELS[number]), 'estimatedLevel');
    assert(typeof data.confidence === 'number' && data.confidence >= 0 && data.confidence <= 100, 'confidence');
    assert(record(data.skillLevels) && strings(data.strengths) && strings(data.priorityGaps) && string(data.reasoning) && string(data.recommendedNextStep), 'assessment fields');
  } else if (action === 'personal-lesson') {
    assert(string(data.title) && string(data.objective) && Array.isArray(data.steps) && data.steps.length >= 4, 'lesson structure');
    assert(strings(data.retrievalPrompts) && Array.isArray(data.errorRecycling) && strings(data.masteryCriteria) && string(data.transferTask), 'lesson practice structure');
    const types = new Set<string>();
    for (const step of data.steps) {
      assert(record(step) && string(step.id) && string(step.type) && string(step.instruction) && string(step.meaning) && string(step.feedbackRule), 'step fields');
      types.add(step.type as string);
      if (step.targetLanguageText) targetText(step.targetLanguageText, language, 'targetLanguageText');
    }
    assert(['retrieve', 'construct', 'feedback', 'transfer'].every(type => types.has(type)), 'active recall sequence');
    for (const item of data.errorRecycling) {
      assert(record(item) && string(item.concept) && string(item.trigger) && typeof item.revisitAfterMinutes === 'number' && item.revisitAfterMinutes > 0, 'spaced review schedule');
    }
  } else if (action === 'speech-analysis') {
    assert(typeof data.transcript === 'string' && Array.isArray(data.corrections) && strings(data.observations), 'speech analysis fields');
    if (data.transcript.trim() && language !== 'auto') targetText(data.transcript, language, 'transcript');
    for (const correction of data.corrections) {
      assert(record(correction) && string(correction.reason), 'speech correction');
      if (language !== 'auto') {
        if (correction.heard) targetText(correction.heard, language, 'heard');
        if (correction.suggested) targetText(correction.suggested, language, 'suggested');
      }
    }
  }
  return data;
}
