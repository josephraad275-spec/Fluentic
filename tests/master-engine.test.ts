import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { FluenticMasterEngine } from '../src/ai/master/engine.ts';
import { EngineError, GeminiJsonGenerator, audioText, parseObject } from '../src/ai/master/runtime.ts';
import { targetText } from '../src/ai/master/script.ts';
import { diagnose } from '../src/ai/master/diagnostic.ts';
import { configureLearner, dueReviews, learnerState, recordRetrieval } from '../src/ai/master/learnerState.ts';
import { registerMasterEngine } from '../src/ai/master/routes.ts';
import { getI18n, installTranslations } from '../src/services/localization.ts';

const turn={reply:'Explication',targetLanguageUtterance:'Une analyse nuancée exige des preuves.',translation:'Sens',contextualCorrections:[],idiomBreakdowns:[],registerNotes:{detectedRegister:'academic',appropriateForContext:true,recommendation:'Préciser les preuves.'},pedagogicalNextPrompts:['Défendez cette thèse.']};
const fake=(response:Record<string,unknown>, inspect?:(prompt:string,input:unknown)=>void)=>new FluenticMasterEngine({generate:async(prompt,input)=>{inspect?.(prompt,input);return structuredClone(response);}});
test('JSON parser accepts object/fence and rejects raw prose, arrays and truncation',()=>{
 assert.deepEqual(parseObject('```json\n{"ok":true}\n```'),{ok:true});
 for(const value of ['prefix {"ok":true}','[]','{"ok":','null'])assert.throws(()=>parseObject(value));
});
test('voice transcript removes markdown while preserving native characters',()=>{
 assert.equal(audioText('## أهلاً **بك** [اليوم](https://example.org) 🎉'),'أهلاً بك اليوم');
 assert.equal(audioText('こんにちは。'),'こんにちは。');
});
test('script gate rejects romanized or mixed target fields rather than silently modifying meaning',()=>{
 assert.equal(targetText('こんにちは','ja'),'こんにちは');
 assert.throws(()=>targetText('Konnichiwa','ja'));
 assert.throws(()=>targetText('مرحبا (marhaba)','ar'));
 assert.equal(targetText('Bonjour (formel)','fr'),'Bonjour (formel)');
});
test('missing key and duplicated evidence cannot create a high proficiency result',()=>{
 assert.throws(()=>diagnose([{questionId:1,level:'C2'}]));
 const answer={questionId:1,level:'A1',selectedKey:'A',correctKey:'A',targetSkill:'phonics'};
 assert.throws(()=>diagnose([answer,answer]));
 const result=diagnose(Array.from({length:10},(_,i)=>({...answer,questionId:i+1})));
 assert.equal(result.assessedLevel,'A1');assert.equal(result.activeRecallRetentionRate,100);
});
test('onboarding returns localized complete dictionary and learner state',async()=>{
 const result=await fake({primaryFocus:'Syntaxe',milestones:['Construire'],rationale:'Pratique'}).execute('onboarding',{nativeLanguageCode:'fr',targetLanguageCode:'ja',displayName:'Jo',learningIntent:'travel'});
 assert.equal(result.mode,'onboarding');assert.deepEqual(result.ui_translation,getI18n('fr'));
 assert.equal((result.user_profile as any).activeRecallRetentionRate,0);
});
test('C2 tutor policy requires advanced evidence and forbids beginner tasks',async()=>{
 let prompt='';const result=await fake(turn,p=>prompt=p).execute('active_chat',{nativeLanguageCode:'fr',targetLanguageCode:'fr',cefrLevel:'C2',learningIntent:'academic',userMessage:'Analysez le discours.'});
 assert.match(prompt,/literary analysis|literary/);assert.match(prompt,/basic greetings/);
 assert.equal(result.audio_text,turn.targetLanguageUtterance);assert.equal(result.mode,'active_chat');
});
test('chat requires valid corrections and register instead of leaking raw output',async()=>{
 await assert.rejects(()=>fake({...turn,registerNotes:{}}).execute('active_chat',{targetLanguageCode:'fr',userMessage:'Bonjour'}));
 await assert.rejects(()=>fake({...turn,targetLanguageUtterance:'marhaba'}).execute('active_chat',{targetLanguageCode:'ar',userMessage:'مرحبا'}));
});
test('deterministic score survives provider failure without invented feedback',async()=>{
 const engine=new FluenticMasterEngine({generate:async()=>{throw new Error('offline');}});
 const result=await engine.execute('placement_test',{action:'evaluate',nativeLanguageCode:'fr',targetLanguageCode:'fr',userAnswers:[{questionId:1,level:'A1',selectedKey:'A',correctKey:'B'}]});
 assert.equal(result.status,'fallback');assert.equal((result.diagnostic_data as any).realtimeGrammarFeedback,'');assert.equal((result.diagnostic_data as any).activeRecallRetentionRate,0);
});
test('transient provider failure retries; permanent auth failure does not',async()=>{
 let calls=0;
 const ai={models:{generateContent:async()=>{calls++;if(calls<3)throw {status:429};return {text:'{"ok":true}'};}}};
 assert.deepEqual(await new GeminiJsonGenerator(()=>ai as any,async()=>{}).generate('policy',{}),{ok:true});assert.equal(calls,3);
 calls=0;const bad={models:{generateContent:async()=>{calls++;throw {status:401};}}};
 await assert.rejects(()=>new GeminiJsonGenerator(()=>bad as any,async()=>{}).generate('policy',{}));assert.equal(calls,1);
});
test('missing provider fails explicitly with 503',async()=>{
 await assert.rejects(()=>new GeminiJsonGenerator(()=>null).generate('policy',{}),(e:EngineError)=>e.status===503);
});
test('spaced errors are scheduled and isolated when target language changes',()=>{
 configureLearner({targetLanguageCode:'fr'});recordRetrieval('past',false,0);
 assert.equal(dueReviews(599999).length,0);assert.equal(dueReviews(600000).length,1);
 recordRetrieval('past',true,600000);assert.equal(learnerState().reviews[0].interval,1800000);
 configureLearner({targetLanguageCode:'ja'});assert.equal(learnerState().reviews.length,0);
});
test('incomplete locale pack is rejected atomically',()=>{
 assert.throws(()=>installTranslations('fr',{close:'Fermer'} as any));
 assert.equal(getI18n('fr').close,'Fermer');
});
test('all three legacy engine aliases use the same validated handler',async()=>{
 const app=express();app.use(express.json());registerMasterEngine(app,()=>null);
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');
 try {
  for(const path of ['/api/engine','/api/gemini/engine','/api/omni-engine']){
   const r=await fetch(`http://127.0.0.1:${(server.address() as any).port}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'active_chat',payload:{targetLanguageCode:'fr',userMessage:'Bonjour'}})});
   assert.equal(r.status,503);assert.equal((await r.json()).success,false);
  }
 }finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('advanced assessment rejects elementary content carrying a C2 label',async()=>{
 const questions=['A1','A2','B1','B2','C1','C1','C2','C2'].map((level,i)=>({id:i+1,level,skill:'greetings',prompt:`Bonjour ${i}`,instruction:'Choisissez',explanation:'Explication',correctKey:'A',options:['A','B','C','D'].map(key=>({key,text:`Réponse ${key}`}))}));
 await assert.rejects(()=>fake({questions}).execute('placement_test',{targetLanguageCode:'fr',nativeLanguageCode:'fr',questionCount:8}),(e:EngineError)=>e.code==='INVALID_ADVANCED_ITEM');
});
test('personal lesson validates the requested intent and all five stages',async()=>{
 const lesson={title:'Le voyage',objective:'Construire',level:'B1',intent:'travel',steps:['retrieve','construct','feedback','transfer','review'].map(type=>({id:type,type,instruction:'Construisez',targetLanguageText:'Je prends le train.',expectedAnswer:'Je prends le train.',meaning:'Sens',feedbackRule:'Accord'})),retrievalPrompts:['Rappelez'],masteryCriteria:['Transférez'],transferTask:'Autre situation',errorRecycling:[{concept:'accord',trigger:'erreur',revisitAfterMinutes:10}]};
 const result=await fake(lesson).execute('personal_lesson',{targetLanguageCode:'fr',nativeLanguageCode:'fr',cefrLevel:'B1',learningIntent:'travel'});
 assert.equal(result.status,'success');assert.equal((result.steps as unknown[]).length,5);
 await assert.rejects(()=>fake({...lesson,intent:'business'}).execute('personal_lesson',{targetLanguageCode:'fr',cefrLevel:'B1',learningIntent:'travel'}));
});
