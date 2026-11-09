import type { FluenticCefrLevel, LearningIntent } from '../pedagogy.ts';
import type { MasterMode } from './engine.ts';
export interface ReviewItem { concept:string; failures:number; dueAt:number; interval:number; }
export interface LearnerState { mode:MasterMode; nativeLanguageCode:string; targetLanguageCode:string; level:FluenticCefrLevel; intent:LearningIntent; reviews:ReviewItem[]; }
let state:LearnerState={mode:'onboarding',nativeLanguageCode:'en',targetLanguageCode:'en',level:'A1',intent:'conversational',reviews:[]};
export function learnerState():LearnerState{return {...state,reviews:state.reviews.map(r=>({...r}))};}
export function configureLearner(next:Partial<Omit<LearnerState,'reviews'>>):void {
 const changed=next.targetLanguageCode && next.targetLanguageCode!==state.targetLanguageCode;
 state={...state,...next,reviews:changed?[]:state.reviews};
}
export function recordRetrieval(concept:string,correct:boolean,now=Date.now()):void {
 if(!concept.trim())return;
 const existing=state.reviews.find(r=>r.concept===concept);
 const interval=correct?Math.min((existing?.interval||10*60000)*3,7*86400000):10*60000;
 const updated={concept,failures:(existing?.failures||0)+(correct?0:1),interval,dueAt:now+interval};
 state.reviews=[...state.reviews.filter(r=>r.concept!==concept),updated].slice(-100);
}
export function dueReviews(now=Date.now()):ReviewItem[]{return state.reviews.filter(r=>r.dueAt<=now).map(r=>({...r}));}
