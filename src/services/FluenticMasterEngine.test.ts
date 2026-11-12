import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FluenticMasterEngine,
  enforceTargetScript,
  scorePlacement,
  validateAIResponse,
  type UserProfile,
} from './FluenticMasterEngine';
import type { PlacementTestQuestion } from './placementTestService';

const profile: UserProfile = {
  name: 'Learner', nativeLanguage: 'en', targetLanguage: 'es',
  intent: 'travel', currentCefr: 'evaluating',
};

describe('Fluentic master engine', () => {
  it('starts in onboarding with a complete UI contract', () => {
    const engine = new FluenticMasterEngine(profile);
    const state = validateAIResponse(engine.getState());
    assert.equal(state.app_mode, 'onboarding');
    assert.equal(state.diagnostic_data.current_cefr, 'evaluating');
    assert.ok(state.ui_translation.nav_ai_tutor);
  });

  it('rejects malformed AI payloads and out-of-range scores', () => {
    const engine = new FluenticMasterEngine(profile);
    const state = engine.getState();
    assert.throws(() => validateAIResponse({ ...state, app_mode: 'unknown' }));
    assert.throws(() => validateAIResponse({ ...state, diagnostic_data: { ...state.diagnostic_data, score_percentage: 101 } }));
    assert.throws(() => validateAIResponse({ ...state, ai_response: { ...state.ai_response, suggested_followups: [42] } }));
  });

  it('validates target script without allowing transliteration in audio', () => {
    assert.equal(enforceTargetScript('Здравствуйте!', 'ru'), 'Здравствуйте!');
    assert.equal(enforceTargetScript('こんにちは。', 'ja'), 'こんにちは。');
    assert.equal(enforceTargetScript('¡Hola!', 'es'), '¡Hola!');
    assert.throws(() => enforceTargetScript('Privet', 'ru'));
    assert.throws(() => enforceTargetScript('مرحبا hello', 'ar'));
    assert.throws(() => enforceTargetScript('Hola привет', 'es'));
  });

  it('conservatively scores incomplete tier evidence and identifies learning gaps', () => {
    const questions: PlacementTestQuestion[] = [
      { id: 1, level: 'A1', target_skill: 'greetings', options: [{key:'A',text:'a'}, {key:'B',text:'b'}, {key:'C',text:'c'}, {key:'D',text:'d'}], correct_key: 'A' },
      { id: 2, level: 'A1', target_skill: 'numbers', options: [{key:'A',text:'a'}, {key:'B',text:'b'}, {key:'C',text:'c'}, {key:'D',text:'d'}], correct_key: 'A' },
      { id: 3, level: 'A2', target_skill: 'verbs', options: [{key:'A',text:'a'}, {key:'B',text:'b'}, {key:'C',text:'c'}, {key:'D',text:'d'}], correct_key: 'A' },
      { id: 4, level: 'A2', target_skill: 'agreement', options: [{key:'A',text:'a'}, {key:'B',text:'b'}, {key:'C',text:'c'}, {key:'D',text:'d'}], correct_key: 'B' },
    ];
    const result = scorePlacement(questions, [
      { questionId: 1, selectedKey: 'A' }, { questionId: 2, selectedKey: 'A' },
      { questionId: 3, selectedKey: 'A' }, { questionId: 4, selectedKey: 'C' },
    ]);
    assert.equal(result.current_cefr, 'A1');
    assert.equal(result.score_percentage, 75);
    assert.deepEqual(result.concept_tags, ['agreement']);
    assert.throws(() => scorePlacement(questions, [{questionId:1,selectedKey:'A'}]));
  });

  it('does not allow lessons or tutor calls before placement', async () => {
    const engine = new FluenticMasterEngine(profile);
    assert.throws(() => engine.completeLesson('a1-1', [{concept:'vowels',correct:true}]));
    await assert.rejects(() => engine.chat('Hola'));
  });

  it('clears a previous language\'s progress and level when switching target', () => {
    const engine = new FluenticMasterEngine({ ...profile, currentCefr: 'B1' });
    engine.onboard({ targetLanguage: 'fr' });
    assert.equal(engine.getProfile().currentCefr, 'evaluating');
    assert.equal(engine.getProgress().completedNodeIds.length, 0);
    assert.throws(() => engine.onboard({nativeLanguage: 'fr'}));
  });
});