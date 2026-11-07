import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { registerFluenticAIRoutes } from '../src/ai/server/fluenticAIRoutes';
import { AI_MODELS, generateWithFallback, transcribeAudio } from '../src/ai/server/modelRuntime';
import { estimateLevelFromEvidence, buildPersonalLessonInstruction } from '../src/ai/pedagogy';

async function withAPI(ai: any, run: (post: (payload: any) => Promise<Response>) => Promise<void>) {
  const app = express();
  app.use(express.json());
  registerFluenticAIRoutes(app, () => ai);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = (server.address() as any).port;
  try { await run(payload => fetch(`http://127.0.0.1:${port}/api/fluentic-ai`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
  })); } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
}

test('elementary correct answers cannot award an advanced tier', () => {
  assert.equal(estimateLevelFromEvidence(Array.from({ length: 10 }, () => ({ level: 'A1', correct: true }))).level, 'A1');
  assert.equal(estimateLevelFromEvidence([{ level: 'C2', correct: true }]).level, 'A1');
  assert.equal(estimateLevelFromEvidence([{ level: 'A1' }]).confidence, 0);
});
test('placement requires demonstrated contiguous levels and reports limited confidence', () => {
  const answers = ['A1','A2','B1','B2','C1','C2'].flatMap(level => Array.from({ length: 2 }, () => ({ level, correct: level !== 'B2' })));
  const result = estimateLevelFromEvidence(answers);
  assert.equal(result.level, 'B1');
  assert.ok(result.confidence < 85);
});
test('AI failover recovers from unavailable model but does not retry bad credentials', async () => {
  const calls: string[] = [];
  const ai: any = { models: { generateContent: async ({ model }: any) => {
    calls.push(model); if (calls.length === 1) throw { status: 503 }; return { text: 'ok' };
  } } };
  assert.equal((await generateWithFallback(ai, { contents: 'test', preferredModel: 'unavailable' })).text, 'ok');
  assert.deepEqual(calls, ['unavailable', AI_MODELS.fallback]);
  let count = 0;
  ai.models.generateContent = async () => { count++; throw { status: 401 }; };
  await assert.rejects(generateWithFallback(ai, { contents: 'test' }));
  assert.equal(count, 1);
});
test('dedicated transcription uses Interactions with audio data, not content generation', async () => {
  let request: any;
  const text = await transcribeAudio({ interactions: { create: async (input: any) => { request = input; return { output_text: 'مرحبا' }; } } } as any, 'AAAA', 'audio/wav');
  assert.equal(text, 'مرحبا');
  assert.equal(request.model, AI_MODELS.transcription);
  assert.deepEqual(request.input, [{ type: 'audio', data: 'AAAA', mime_type: 'audio/wav' }]);
});
test('unconfigured AI returns a clear service error', async () => {
  await withAPI(null, async post => {
    const response = await post({ action: 'translate', payload: { text: 'Hello', targetLanguage: 'French' } });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).code, 'AI_NOT_CONFIGURED');
  });
});
test('duplicate answer keys and IDs are rejected instead of showing a broken placement test', async () => {
  const questions = ['A1','A2','B1','B2','C1','C2','A1','A2'].map((level, id) => ({ id, level, prompt: 'Question', instruction: 'Choose', options: [{ key: 'A', text: 'One' }, { key: 'A', text: 'Two' }, { key: 'C', text: 'Three' }, { key: 'D', text: 'Four' }], correctKey: 'A' }));
  await withAPI({ models: { generateContent: async () => ({ text: JSON.stringify({ questions }) }) } }, async post => {
    const response = await post({ action: 'placement', payload: { targetLanguage: 'French', questionCount: 8 } });
    assert.equal(response.status, 502);
  });
});
test('missing answer keys are never treated as correct in level analysis', async () => {
  await withAPI({ models: { generateContent: async () => ({ text: JSON.stringify({ estimatedLevel: 'C2', confidence: 100 }) }) } }, async post => {
    const response = await post({ action: 'level-analysis', payload: { targetLanguage: 'French', answers: [{ level: 'A1' }, { level: 'A2' }, { level: 'B1' }] } });
    const result = await response.json();
    assert.equal(result.estimatedLevel, 'A1');
    assert.equal(result.evidenceByTier.A1.correct, 0);
  });
});
test('personal lessons receive needs, time, level and goal, and require all learning stages', async () => {
  let request: any;
  const steps = ['retrieve','construct','feedback','transfer','review'].map(type => ({ type, instruction: 'Practice', targetLanguageText: 'Bonjour' }));
  await withAPI({ models: { generateContent: async (input: any) => { request = input; return { text: JSON.stringify({ level: 'A2', intent: 'travel', steps }) }; } } }, async post => {
    const response = await post({ action: 'personal-lesson', payload: { targetLanguage: 'French', cefrLevel: 'A2', learningIntent: 'travel', minutesAvailable: 10, weaknesses: ['past tense'] } });
    assert.equal(response.status, 200);
    const input = JSON.parse(request.contents);
    assert.equal(input.minutesAvailable, 10);
    assert.deepEqual(input.weaknesses, ['past tense']);
    assert.match(request.config.systemInstruction, /A2 learner of French/);
    assert.match(request.config.systemInstruction, /travel/);
  });
  assert.match(buildPersonalLessonInstruction('French', 'English', 'C1', 'business'), /Absolutely exclude elementary phrases/);
});
