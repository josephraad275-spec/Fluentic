import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdaptiveNode } from '../src/ai/master/lessonAdapter.ts';
import type { LearningNode } from '../src/types.ts';
test('lesson selection consumes central engine output using the existing exercise model',async()=>{
 const original=globalThis.fetch;
 const steps=['retrieve','construct','feedback','transfer','review'].map(type=>({id:type,type,instruction:'Construisez',targetLanguageText:'Je prends le train.',expectedAnswer:'Je prends le train.',meaning:'Meaning',feedbackRule:'Accord'}));
 globalThis.fetch=async(_url,options)=>{
  const request=JSON.parse(String(options?.body));assert.equal(request.mode,'personal_lesson');assert.equal(request.payload.learningIntent,'travel');
  return Response.json({success:true,status:'success',mode:'personal_lesson',title:'Voyage',objective:'Communiquer',level:'B1',intent:'travel',steps,retrievalPrompts:['Recall'],masteryCriteria:['Transfer'],transferTask:'New station',errorRecycling:[{concept:'tense',trigger:'error',revisitAfterMinutes:10}]});
 };
 try {
  const node:LearningNode={id:'n1',title:'Original',nativeTitle:'Titre',category:'Conversation',cefr:'B1',description:'Original',xpReward:20,gemReward:10,exercises:[],iconName:'Compass',coordinates:{x:1,y:2}};
  const result=await createAdaptiveNode(node,'en','fr','travel');
  assert.equal(result.id,node.id);assert.deepEqual(result.coordinates,node.coordinates);assert.equal(result.xpReward,0);assert.equal(result.gemReward,0);
  assert.deepEqual(result.exercises.map(e=>e.learningStage),['retrieve','construct','feedback','transfer','review']);
  for(const exercise of result.exercises)assert.deepEqual([...exercise.scrambledWords!].sort(),[...(exercise.correctAnswer as string[])].sort());
 } finally { globalThis.fetch=original; }
});
