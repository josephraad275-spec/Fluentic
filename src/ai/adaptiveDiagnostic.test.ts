import test from 'node:test';
import assert from 'node:assert/strict';
import { beginDiagnostic, recordDiagnosticAnswer } from './adaptiveDiagnostic';

test('diagnostic starts at A1', () => {
  assert.deepEqual(beginDiagnostic('session-123'), {
    id: 'session-123', currentLevel: 'A1', responses: [], status: 'active'
  });
});

test('diagnostic requires three answers before moving up', () => {
  let session = beginDiagnostic('session-123');
  for (let i = 0; i < 2; i++) {
    const decision = recordDiagnosticAnswer(session, {
      questionId: 'a1-' + i, level: 'A1', correct: true, skill: 'reading'
    });
    assert.equal(decision.nextLevel, 'A1');
    session = decision.session;
  }
  const decision = recordDiagnosticAnswer(session, {
    questionId: 'a1-2', level: 'A1', correct: true, skill: 'reading'
  });
  assert.equal(decision.nextLevel, 'A2');
  assert.equal(decision.provisionalLevel, 'A1');
});

test('failed tier ends diagnostic without advancing', () => {
  let session = beginDiagnostic('session-123');
  for (let i = 0; i < 2; i++) {
    session = recordDiagnosticAnswer(session, {
      questionId: 'a1-' + i, level: 'A1', correct: false, skill: 'reading'
    }).session;
  }
  const decision = recordDiagnosticAnswer(session, {
    questionId: 'a1-2', level: 'A1', correct: true, skill: 'reading'
  });
  assert.equal(decision.session.status, 'complete');
  assert.equal(decision.nextLevel, null);
});

test('duplicate question IDs and tier mismatch are rejected', () => {
  const session = recordDiagnosticAnswer(beginDiagnostic('session-123'), {
    questionId: 'one', level: 'A1', correct: true, skill: 'reading'
  }).session;
  assert.throws(() => recordDiagnosticAnswer(session, {
    questionId: 'one', level: 'A1', correct: true, skill: 'reading'
  }), /Duplicate/);
  assert.throws(() => recordDiagnosticAnswer(session, {
    questionId: 'two', level: 'C2', correct: true, skill: 'reading'
  }), /level/);
});
