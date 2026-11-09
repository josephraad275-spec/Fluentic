import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { nativeCors } from '../src/server/cors.ts';
test('native CORS permits only exact configured origins',async()=>{
  const app=express();app.use(nativeCors(['capacitor://localhost']));app.use((_req,res)=>res.sendStatus(404));
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  const url=`http://127.0.0.1:${(server.address() as any).port}`;
  try {
    const allowed=await fetch(url,{method:'OPTIONS',headers:{Origin:'capacitor://localhost'}});
    assert.equal(allowed.status,204);assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),'capacitor://localhost');
    const denied=await fetch(url,{method:'OPTIONS',headers:{Origin:'https://evil.example'}});
    assert.equal(denied.headers.has('Access-Control-Allow-Origin'),false);
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); }
});
