import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { validateGeneratedResponse } from './responseContracts';

test('translation allows authentic Arabic but rejects romanization', () => {
  const good = { translation: 'مرحبًا بالعالم', detectedSourceLanguage: 'English' };
  assert.equal(validateGeneratedResponse('translate', good, 'Arabic').translation, good.translation);
  assert.throws(() => validateGeneratedResponse('translate', { translation: 'marhaban مرحبا' }, 'ar'), /Latin transliteration/);
  assert.throws(() => validateGeneratedResponse('translate', { translation: '' }, 'Arabic'), /missing/);
});

test('placement cannot pass with duplicated choices or basic C2 evidence', () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const questions = levels.map((level, index) => ({
    id: index + 1, level, skill: level === 'C1' || level === 'C2' ? 'rhetorical analysis' : 'reading',
    instruction: 'Choose the best answer', prompt: 'Analysez cette affirmation.', explanation: 'Argument and context',
    options: ['A', 'B', 'C', 'D'].map(key => ({ key, text: key })), correctKey: 'A',
  }));
  assert.equal((validateGeneratedResponse('placement', { questions }, 'French', 6).questions as unknown[]).length, 6);
  const duplicate = structuredClone(questions);
  duplicate[0].options[1].key = 'A';
  assert.throws(() => validateGeneratedResponse('placement', { questions: duplicate }, 'French', 6));
  const elementary = structuredClone(questions);
  elementary[5].skill = 'basic greeting';
  elementary[5].explanation = 'self-introduction';
  assert.throws(() => validateGeneratedResponse('placement', { questions: elementary }, 'French', 6), /advanced item|beginner item/);
});

test('lesson requires retrieval, construction, feedback and transfer', () => {
  const steps = ['retrieve', 'construct', 'feedback', 'transfer'].map((type, index) => ({
    id: `step-${index}`, type, instruction: 'Respond', meaning: 'Meaning', feedbackRule: 'Correct errors', targetLanguageText: 'Bonjour',
  }));
  const lesson = { title: 'Lesson', objective: 'Practice', steps, retrievalPrompts: ['Recall'], errorRecycling: [{ concept: 'agreement', trigger: 'mistake', revisitAfterMinutes: 10 }], masteryCriteria: ['80%'], transferTask: 'Use in another context' };
  assert.ok(validateGeneratedResponse('personal-lesson', lesson, 'French'));
  assert.throws(() => validateGeneratedResponse('personal-lesson', { ...lesson, steps: steps.slice(1) }, 'French'));
});
