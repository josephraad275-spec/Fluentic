import { FsrsCard, CefrLevel } from '../types';

export type FsrsRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export class FsrsEngine {
  // Default FSRS v4.5 parameters
  private static readonly REQUESTED_RETENTION = 0.90;
  private static readonly FACTOR = 19 / 81;

  public static createCard(
    language: string,
    front: string,
    back: string,
    cefr: CefrLevel = 'A1',
    contextSentence?: string,
    etymology?: string
  ): FsrsCard {
    return {
      id: 'card-' + Math.random().toString(36).substring(2, 9),
      language,
      front,
      back,
      contextSentence,
      etymology,
      cefr,
      reps: 0,
      lapses: 0,
      stability: 1.0,
      difficulty: 5.0,
      intervalDays: 0,
      dueTimestamp: Date.now(),
      state: 'new',
    };
  }

  public static calculateRetrievability(card: FsrsCard, nowTimestamp: number = Date.now()): number {
    if (card.reps === 0 || !card.lastReviewTimestamp) return 1.0;
    const daysElapsed = Math.max(0, (nowTimestamp - card.lastReviewTimestamp) / (1000 * 60 * 60 * 24));
    if (card.stability <= 0) return 0.5;
    const r = Math.pow(1 + (this.FACTOR * daysElapsed) / card.stability, -0.5);
    return Math.max(0, Math.min(1, r));
  }

  public static reviewCard(card: FsrsCard, rating: FsrsRating): FsrsCard {
    const now = Date.now();
    let { stability, difficulty, reps, lapses, state } = card;

    // Difficulty adjustment
    // rating 1: D increases (+1.5), rating 3: normal, rating 4: D decreases (-1.0)
    const diffDelta = (4 - rating) * 0.75;
    difficulty = Math.max(1.0, Math.min(10.0, difficulty + diffDelta));

    if (rating === 1) {
      // Failed recall
      lapses += 1;
      stability = Math.max(0.4, stability * 0.35);
      state = reps === 0 ? 'learning' : 'relearning';
    } else {
      reps += 1;
      state = 'review';
      if (card.reps === 0) {
        // First successful learning step
        stability = rating === 2 ? 1.2 : rating === 3 ? 2.5 : 4.5;
      } else {
        // Subsequent review step
        const modifier = rating === 2 ? 1.2 : rating === 3 ? 2.2 : 3.4;
        const hardPenalty = rating === 2 ? 0.8 : 1.0;
        const easyBonus = rating === 4 ? 1.3 : 1.0;
        stability = Math.max(0.5, stability * (1 + modifier * (11 - difficulty) / 10) * hardPenalty * easyBonus);
      }
    }

    // Interval calculation for 90% target retention:
    // interval = S * ( (R^(-2) - 1) / FACTOR )
    const intervalDays = rating === 1 
      ? 0.1 // ~2.4 hours for immediate re-test
      : Math.max(1, Math.round(stability * 0.9));

    const dueTimestamp = now + intervalDays * 24 * 60 * 60 * 1000;

    return {
      ...card,
      reps,
      lapses,
      stability,
      difficulty,
      intervalDays,
      dueTimestamp,
      lastReviewTimestamp: now,
      state,
    };
  }

  public static getRetentionCurvePoints(stability: number, maxDays: number = 30): { day: number; retention: number }[] {
    const points: { day: number; retention: number }[] = [];
    for (let day = 0; day <= maxDays; day += 1) {
      const r = Math.pow(1 + (this.FACTOR * day) / Math.max(0.1, stability), -0.5);
      points.push({ day, retention: Math.round(r * 100) });
    }
    return points;
  }
}
