import { FLUENTIC_CEFR_LEVELS, type FluenticCefrLevel } from './pedagogy';

export type DiagnosticResponse = {
  questionId: string;
  level: FluenticCefrLevel;
  correct: boolean;
  skill: 'reading' | 'writing' | 'listening' | 'speaking';
  advancedEvidence?: boolean;
};

export type DiagnosticSession = {
  id: string;
  currentLevel: FluenticCefrLevel;
  responses: DiagnosticResponse[];
  status: 'active' | 'complete';
};

export type DiagnosticDecision = {
  session: DiagnosticSession;
  nextLevel: FluenticCefrLevel | null;
  provisionalLevel: FluenticCefrLevel;
  confidence: number;
  requiresHumanReview: boolean;
};

const MIN_ITEMS_PER_TIER = 3;
const PASS_THRESHOLD = 0.8;

function validLevel(level: string): level is FluenticCefrLevel {
  return FLUENTIC_CEFR_LEVELS.includes(level as FluenticCefrLevel);
}

export function beginDiagnostic(id: string): DiagnosticSession {
  if (!id.trim()) throw new Error('Diagnostic session id is required');
  return { id, currentLevel: 'A1', responses: [], status: 'active' };
}

export function recordDiagnosticAnswer(
  session: DiagnosticSession,
  response: DiagnosticResponse
): DiagnosticDecision {
  if (session.status !== 'active') throw new Error('Diagnostic session already completed');
  if (!validLevel(response.level) || response.level !== session.currentLevel) {
    throw new Error('Answer level does not match the active diagnostic tier');
  }
  if (!response.questionId.trim()) throw new Error('Question id is required');
  if (session.responses.some(item => item.questionId === response.questionId)) {
    throw new Error('Duplicate diagnostic question');
  }
  if (!['reading', 'writing', 'listening', 'speaking'].includes(response.skill)) {
    throw new Error('Unknown diagnostic skill');
  }
  if (typeof response.correct !== 'boolean') throw new Error('Invalid assessment result');
  const advanced = response.level === 'C1' || response.level === 'C2';
  if (advanced && response.advancedEvidence !== true) {
    throw new Error('Advanced tier requires independently evaluated complex discourse evidence');
  }

  const responses = [...session.responses, { ...response }];
  const tierResponses = responses.filter(item => item.level === session.currentLevel);
  const priorTiers = FLUENTIC_CEFR_LEVELS.slice(0, FLUENTIC_CEFR_LEVELS.indexOf(session.currentLevel));
  const completedTiers = priorTiers.filter(level => {
    const items = responses.filter(item => item.level === level);
    return items.length >= MIN_ITEMS_PER_TIER && items.filter(item => item.correct).length / items.length >= PASS_THRESHOLD;
  });
  const provisionalLevel = completedTiers.at(-1) ?? 'A1';

  if (tierResponses.length < MIN_ITEMS_PER_TIER) {
    return {
      session: { ...session, responses },
      nextLevel: session.currentLevel,
      provisionalLevel,
      confidence: 0,
      requiresHumanReview: false,
    };
  }

  const accuracy = tierResponses.filter(item => item.correct).length / tierResponses.length;
  const passed = accuracy >= PASS_THRESHOLD;
  const index = FLUENTIC_CEFR_LEVELS.indexOf(session.currentLevel);
  const complete = !passed || index === FLUENTIC_CEFR_LEVELS.length - 1;
  const verifiedLevel = passed ? session.currentLevel : provisionalLevel;
  const nextLevel = complete ? null : FLUENTIC_CEFR_LEVELS[index + 1];
  const requiresHumanReview = FLUENTIC_CEFR_LEVELS.indexOf(verifiedLevel) >= 4;

  return {
    session: {
      ...session,
      responses,
      currentLevel: nextLevel ?? session.currentLevel,
      status: complete ? 'complete' : 'active',
    },
    nextLevel,
    provisionalLevel: verifiedLevel,
    confidence: Math.min(95, Math.round(50 + 45 * accuracy)),
    requiresHumanReview,
  };
}
