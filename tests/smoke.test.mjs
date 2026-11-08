import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { existsSync } from 'node:fs';

test('production server serves UI, isolates API errors and never publishes server bundle', { timeout: 20000 }, async () => {
  assert.equal(existsSync('dist/server.cjs'),false);
  assert.equal(existsSync('dist/server.cjs.map'),false);
  const portServer=createServer();
  portServer.listen(0,'127.0.0.1');
  await once(portServer,'listening');
  const port=portServer.address().port;
  await new Promise(resolve=>portServer.close(resolve));
  const child=spawn(process.execPath,['scripts/start.mjs'],{ env:{...process.env,PORT:String(port),GEMINI_API_KEY:'',NODE_ENV:''},stdio:['ignore','pipe','pipe'] });
  let output='';
  child.stdout.on('data',data=>output+=data);
  child.stderr.on('data',data=>output+=data);
  const url=`http://127.0.0.1:${port}`;
  try {
    let ready=false;
    for(let i=0;i<100;i++) {
      if(child.exitCode!==null) throw new Error(output);
      try { if((await fetch(`${url}/api/health`)).ok) { ready=true;break; } } catch {}
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    assert.ok(ready,output);
    const home=await fetch(url);
    assert.equal(home.status,200);
    assert.ok((await home.text()).includes('<div id="root">'));
    assert.equal(home.headers.has('x-powered-by'),false);
    const missing=await fetch(`${url}/api/does-not-exist`);
    assert.equal(missing.status,404);
    assert.equal((await missing.json()).success,false);
    const payment=await fetch(`${url}/api/payment/checkout`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({planId:'pro-monthly'})});
    assert.equal(payment.status,503);
    assert.equal((await payment.json()).success,false);
    const ai=await fetch(`${url}/api/fluentic-ai`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'translate',payload:{text:'Hello',targetLanguage:'French'}})});
    assert.equal(ai.status,503);
    for(const path of ['/server.cjs','/server.cjs.map']) {
      const response=await fetch(url+path);
      assert.ok(response.headers.get('content-type').includes('text/html'));
      assert.ok(!(await response.text()).includes('registerFluenticAIRoutes'));
    }
  } finally {
    child.kill('SIGTERM');
    await once(child,'exit');
  }
});
