import { estimateLevelFromEvidence, FLUENTIC_CEFR_LEVELS } from '../pedagogy.ts';
import { isCorrectAnswer } from '../validation.ts';
import type { DiagnosticData } from '../../services/omniEngineService.ts';
import { EngineError, object } from './runtime.ts';

export function diagnose(input: unknown): DiagnosticData {
 if(!Array.isArray(input) || input.length<1 || input.length>60) throw new EngineError('INVALID_REQUEST',400,'Assessment requires 1–60 answers.');
 const ids=new Set<number>();
 const answers=input.map(value=>{
  const a=object(value);
  if(!Number.isInteger(a.questionId)||ids.has(a.questionId as number)||!FLUENTIC_CEFR_LEVELS.includes(a.level as never)||!['A','B','C','D'].includes(String(a.selectedKey))||!['A','B','C','D'].includes(String(a.correctKey))) throw new EngineError('INVALID_REQUEST',400,'Malformed or duplicate assessment answer.');
  ids.add(a.questionId as number);
  return {questionId:a.questionId as number,level:a.level as typeof FLUENTIC_CEFR_LEVELS[number],selectedKey:String(a.selectedKey),correctKey:String(a.correctKey),targetSkill:typeof a.targetSkill==='string'?a.targetSkill:'',correct:isCorrectAnswer({selectedKey:a.selectedKey,correctKey:a.correctKey})};
 });
 const evidence=estimateLevelFromEvidence(answers);
 const correct=answers.filter(a=>a.correct).length;const errors=answers.filter(a=>!a.correct);
 const percentage=Math.round(correct/answers.length*100);
 return {assessedLevel:evidence.level,calibratedScore:correct,totalEvaluated:answers.length,structuralMasteryPercentage:percentage,activeRecallRetentionRate:percentage,
  spacedErrorRecycling:{recycledErrorCount:errors.length,flaggedConcepts:[...new Set(errors.map(a=>a.targetSkill).filter(Boolean))]},
  conceptMapping:answers.map(a=>({concept:a.targetSkill,status:a.correct?'emerging':'needs_review',tier:a.level})),
  realtimeGrammarFeedback:'',errorBreakdowns:errors.map(a=>({questionId:a.questionId,userChoice:a.selectedKey,correctKey:a.correctKey,linguisticReason:''}))};
}
