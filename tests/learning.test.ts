import test from 'node:test';
import assert from 'node:assert/strict';
import { isCorrectAnswer, validatePlacementQuestions, validatePersonalLesson } from '../src/ai/validation.ts';
import { estimateLevelFromEvidence, FLUENTIC_CEFR_LEVELS } from '../src/ai/pedagogy.ts';
import { stripTransliteration } from '../src/services/languageTypography.ts';
import { getI18n } from '../src/services/localization.ts';

const questions = () => ['A1','A2','B1','B2','C1','C1','C2','C2'].map((level,i) => ({ id:i+1, level, prompt:`Independent prompt ${i}`, instruction:'Choose', explanation:'Reason', correctKey:'A', options:['A','B','C','D'].map(key=>({key,text:`Option ${key}`})) }));
const lesson = () => ({ title:'Lesson', objective:'Communicate', level:'B1', intent:'travel', steps:['retrieve','construct','feedback','transfer','review'].map(type=>({id:type,type,instruction:'Task'})), retrievalPrompts:['Recall'], masteryCriteria:['Transfer'], transferTask:'New context', errorRecycling:[{concept:'Past tense',trigger:'Error',revisitAfterMinutes:10}] });

test('missing, malformed and mismatched answer keys never count as correct',()=> {
  for (const value of [null, {}, {level:'C2'}, {selectedKey:'X',correctKey:'X'}, {selectedKey:'A'}, {selectedKey:'A',correctKey:'B'}]) assert.equal(isCorrectAnswer(value),false);
  assert.equal(isCorrectAnswer({selectedKey:'A',correctKey:'A'}),true);
  assert.equal(isCorrectAnswer({correct:false,selectedKey:'A',correctKey:'A'}),false);
});
test('advanced placement requires multiple correct answers per advanced tier',()=> {
  const answers = FLUENTIC_CEFR_LEVELS.map(level=>({level,correct:true}));
  assert.equal(estimateLevelFromEvidence(answers).level,'B2');
  assert.equal(estimateLevelFromEvidence([...answers,{level:'C1',correct:true},{level:'C2',correct:true}]).level,'C2');
  assert.equal(estimateLevelFromEvidence([{level:'C2',correct:true}]).level,'A1');
  assert.equal(estimateLevelFromEvidence([]).confidence,0);
});
test('complete placement bank accepted',()=>validatePlacementQuestions(questions(),8));
for (const [name, mutate] of Object.entries({
  'duplicate ID': (q:any[])=>q[1].id=q[0].id,
  'duplicate prompt': (q:any[])=>q[1].prompt=q[0].prompt,
  'null item': (q:any[])=>q[0]=null,
  'legacy tier': (q:any[])=>q[0].level='A3',
  'duplicate option': (q:any[])=>q[0].options[1].text=q[0].options[0].text,
  'missing advanced evidence': (q:any[])=>q[5].level='B2',
  'invalid answer': (q:any[])=>q[0].correctKey='X',
})) test(`placement rejects ${name}`,()=>{const q=questions();mutate(q);assert.throws(()=>validatePlacementQuestions(q,8));});
test('complete adaptive sequence accepted',()=>validatePersonalLesson(lesson(),'B1','travel'));
for (const [name,mutate] of Object.entries({
  'wrong order': (r:any)=>r.steps.reverse(),
  'missing review': (r:any)=>r.steps.pop(),
  'duplicate ID': (r:any)=>r.steps[1].id=r.steps[0].id,
  'wrong level': (r:any)=>r.level='C2',
  'empty retrieval': (r:any)=>r.retrievalPrompts=[],
  'invalid schedule': (r:any)=>r.errorRecycling[0].revisitAfterMinutes=-1,
})) test(`lesson rejects ${name}`,()=>{const r=lesson();mutate(r);assert.throws(()=>validatePersonalLesson(r,'B1','travel'));});
test('Latin-script translations preserve meaningful parenthetical text and lines',()=> {
  assert.equal(stripTransliteration('Hello (formal).\nGood morning.'),'Hello (formal).\nGood morning.');
  assert.equal(stripTransliteration('Bonjour (formel).'),'Bonjour (formel).');
});
test('known romanized pronunciation is stripped from Japanese and Arabic',()=> {
  assert.equal(stripTransliteration('こんにちは (Konnichiwa)'),'こんにちは');
  assert.equal(stripTransliteration('السلام عليكم (As-salamu alaykum)'),'السلام عليكم');
});
test('available locale dictionaries have the same keys and no empty values',()=> {
  const keys=Object.keys(getI18n('en')).sort();
  for (const code of ['nl','es','fr','de','it','ru','ar']) {
    const dict=getI18n(code);
    assert.deepEqual(Object.keys(dict).sort(),keys,code);
    assert.ok(Object.values(dict).every(value=>typeof value==='string' && value.trim()),code);
  }
  assert.deepEqual(getI18n('fr-CA'),getI18n('fr'));
});
