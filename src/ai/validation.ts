import { FLUENTIC_CEFR_LEVELS } from './pedagogy.ts';

const record = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const key = (value: unknown) => typeof value === 'string' && ['A', 'B', 'C', 'D'].includes(value);

/** Missing answer keys are not evidence of a correct response. */
export function isCorrectAnswer(answer: unknown): boolean {
  if (!record(answer)) return false;
  if (typeof answer.correct === 'boolean') return answer.correct;
  return key(answer.selectedKey) && key(answer.correctKey) && answer.selectedKey === answer.correctKey;
}

export function validatePlacementQuestions(questions: unknown, count: number): void {
  if (!Array.isArray(questions) || questions.length !== count) throw new Error('Placement test generation was incomplete.');
  const ids = new Set();
  const prompts = new Set();
  const tiers = new Map<string, number>();
  for (const q of questions) {
    if (!record(q) || !Number.isInteger(q.id) || q.id < 1 || ids.has(q.id)) throw new Error('Placement question IDs must be unique positive integers.');
    ids.add(q.id);
    if (!FLUENTIC_CEFR_LEVELS.includes(q.level) || !text(q.prompt) || !text(q.instruction) || !text(q.explanation)) throw new Error('Placement question metadata is incomplete.');
    const prompt = q.prompt.normalize('NFC').trim();
    if (prompts.has(prompt)) throw new Error('Placement questions must contain independent prompts.');
    prompts.add(prompt);
    tiers.set(q.level, (tiers.get(q.level) || 0) + 1);
    if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error('Placement requires four options.');
    const keys = q.options.map((o: unknown) => record(o) ? o.key : undefined);
    const answers = q.options.map((o: unknown) => record(o) && text(o.text || o.text_native) ? (o.text || o.text_native).normalize('NFC').trim().toLowerCase() : '');
    if (!keys.every(key) || new Set(keys).size !== 4 || !key(q.correctKey) || answers.includes('') || new Set(answers).size !== 4) throw new Error('Placement answer options are invalid or duplicated.');
  }
  for (const tier of FLUENTIC_CEFR_LEVELS) {
    const minimum = tier === 'C1' || tier === 'C2' ? 2 : 1;
    if ((tiers.get(tier) || 0) < minimum) throw new Error(`Placement requires ${minimum} independent items at ${tier}.`);
  }
}

export function validatePersonalLesson(result: unknown, level: string, intent: string): void {
  if (!record(result) || result.level !== level || result.intent !== intent || !text(result.title) || !text(result.objective)) throw new Error('Lesson metadata does not match the learner.');
  const stages = ['retrieve', 'construct', 'feedback', 'transfer', 'review'];
  if (!Array.isArray(result.steps) || result.steps.length < stages.length || result.steps.length > 20) throw new Error('Lesson must include all five learning stages.');
  const ids = new Set();
  for (const step of result.steps) {
    if (!record(step) || !text(step.id) || ids.has(step.id) || !stages.includes(step.type) || !text(step.instruction)) throw new Error('Lesson steps are malformed or duplicated.');
    ids.add(step.id);
  }
  let previous = -1;
  for (const stage of stages) {
    const index = result.steps.findIndex((s: any) => s.type === stage);
    if (index <= previous) throw new Error('Lesson stages must progress from retrieval to review.');
    previous = index;
  }
  for (const field of ['retrievalPrompts', 'masteryCriteria']) {
    if (!Array.isArray(result[field]) || !result[field].length || !result[field].every(text)) throw new Error(`Lesson ${field} is incomplete.`);
  }
  if (!text(result.transferTask) || !Array.isArray(result.errorRecycling) || !result.errorRecycling.length || result.errorRecycling.some((r: unknown) => !record(r) || !text(r.concept) || !text(r.trigger) || !Number.isFinite(r.revisitAfterMinutes) || r.revisitAfterMinutes <= 0)) throw new Error('Lesson requires a transfer task and valid spaced review schedule.');
}
