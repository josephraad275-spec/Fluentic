import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { registerFluenticAIRoutes } from '../src/ai/server/fluenticAIRoutes.ts';

async function request(body: unknown, generateContent: () => Promise<any>) {
  const app=express();
  app.use(express.json());
  registerFluenticAIRoutes(app,()=>({models:{generateContent}} as any));
  const server=app.listen(0,'127.0.0.1');
  await once(server,'listening');
  const address=server.address() as {port:number};
  try {
    const response=await fetch(`http://127.0.0.1:${address.port}/api/fluentic-ai`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    return {status:response.status,body:await response.json()};
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
}
test('malformed request payload fails before contacting provider',async()=>{
  let calls=0;
  const result=await request({action:'translate',payload:[]},async()=>{calls++;return {};});
  assert.equal(result.status,400);assert.equal(calls,0);
});
test('provider failure returns retryable error without leaking upstream details',async()=>{
  const result=await request({action:'translate',payload:{text:'Hello',targetLanguage:'French'}},async()=>{throw new Error('secret-key-provider-detail');});
  assert.equal(result.status,502);assert.equal(result.body.code,'AI_RESPONSE_FAILED');
  assert.ok(!JSON.stringify(result.body).includes('secret-key'));
});
test('model cannot overwrite trusted response envelope',async()=>{
  const result=await request({action:'translate',payload:{text:'Hello',targetLanguage:'French'}},async()=>({text:JSON.stringify({translation:'Bonjour (formel)',success:false,action:'placement'})}));
  assert.equal(result.status,200);assert.equal(result.body.success,true);assert.equal(result.body.action,'translate');
  assert.equal(result.body.translation,'Bonjour (formel)');
});
test('missing answer keys cannot promote learner to advanced proficiency',async()=>{
  const result=await request({action:'level-analysis',payload:{targetLanguage:'French',answers:[{level:'A1'},{level:'A2'},{level:'B1'}]}},async()=>({text:JSON.stringify({estimatedLevel:'C2',confidence:99})}));
  assert.equal(result.status,200);assert.equal(result.body.estimatedLevel,'A1');
  assert.equal(result.body.evidenceByTier.A1.correct,0);
});
