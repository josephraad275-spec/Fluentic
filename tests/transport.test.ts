import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiUrl } from '../src/services/apiTransport.ts';
test('web calls remain same-origin and native calls use configured backend',()=>{
  assert.equal(resolveApiUrl('/api/translate'),'/api/translate');
  assert.equal(resolveApiUrl('/api/translate','https://example.com'),'https://example.com/api/translate');
});
test('native backend rejects insecure or ambiguous origins',()=>{
  for(const origin of ['http://example.com','https://user:pass@example.com','https://example.com/path','https://example.com?key=secret','https://example.com#x']) assert.throws(()=>resolveApiUrl('/api/translate',origin));
  assert.throws(()=>resolveApiUrl('//example.com','https://example.org'));
});
