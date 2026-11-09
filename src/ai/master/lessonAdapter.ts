import type { Exercise, LearningNode } from '../../types.ts';
import { fluenticBrain } from '../../services/FluenticBrain.ts';
import { dueReviews, learnerState } from './learnerState.ts';
import { validatePersonalLesson } from '../validation.ts';
import { normalizeLearningIntent } from '../pedagogy.ts';

export async function createAdaptiveNode(node:LearningNode,nativeLanguageCode:string,targetLanguageCode:string,learningIntent:string,signal?:AbortSignal):Promise<LearningNode> {
 const intent=normalizeLearningIntent(learningIntent);
 const result=await fluenticBrain.generatePersonalLesson({nativeLanguageCode,targetLanguageCode,cefrLevel:node.cefr as 'A1'|'A2'|'B1'|'B2'|'C1'|'C2',learningIntent:intent},{weaknesses:dueReviews().map(r=>r.concept),recentPerformance:learnerState().reviews},signal);
 validatePersonalLesson(result,node.cefr,intent);
 const steps=result.steps as Array<{id:string;type:Exercise['learningStage'];instruction:string;targetLanguageText:string;expectedAnswer:string;meaning:string;feedbackRule:string}>;
 const exercises:Exercise[]=steps.map(step=>{
  if(!step.expectedAnswer?.trim()||!step.targetLanguageText?.trim())throw new Error('Lesson has no answerable target content.');
  const segmenter=new Intl.Segmenter(targetLanguageCode,{granularity:'word'});
  const tokens=Array.from(segmenter.segment(step.expectedAnswer)).map(s=>s.segment).filter(s=>s.trim());
  // Fisher–Yates avoids a predictable answer order while preserving word tokens.
  const scrambled=[...tokens];for(let i=scrambled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[scrambled[i],scrambled[j]]=[scrambled[j],scrambled[i]];}
  return {id:step.id,type:'sentence-scramble',learningStage:step.type,prompt:step.instruction,targetPhrase:step.targetLanguageText,translation:step.meaning||'',correctAnswer:tokens,scrambledWords:scrambled,grammarTip:step.feedbackRule||''};
 });
 return {...node,title:String(result.title),description:String(result.objective),xpReward:0,gemReward:0,exercises};
}
