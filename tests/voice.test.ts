import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealtimeAudioEngine } from '../src/services/realtimeAudioEngine';

test('recording preserves all PCM at the actual 48 kHz device rate and releases the microphone', async () => {
  let processor: any;
  let stopped = 0;
  let uploaded: any;
  let transcript = '';
  class Context {
    sampleRate = 48000;
    state = 'running';
    destination = {};
    resume = async () => {};
    close = async () => { this.state = 'closed'; };
    createMediaStreamSource = () => ({ connect() {}, disconnect() {} });
    createScriptProcessor = () => (processor = { connect() {}, disconnect() {}, onaudioprocess: null });
  }
  const originalFetch = globalThis.fetch;
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { AudioContext: Context } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop: () => stopped++ }] }) } } });
  globalThis.fetch = async (_url, options) => { uploaded = JSON.parse(options!.body as string); return Response.json({ transcription: 'Bonjour', translation: 'Hello' }); };
  try {
    const engine = new RealtimeAudioEngine();
    assert.equal(await engine.startSession({ onTranscript: text => { transcript = text; } }), true);
    const chunk = new Float32Array(4096).fill(0.1);
    for (let i = 0; i < 3; i++) processor.onaudioprocess({ inputBuffer: { getChannelData: () => chunk }, outputBuffer: { getChannelData: () => new Float32Array(4096) } });
    await engine.stopSession();
    assert.equal(uploaded.sampleRate, 48000);
    assert.equal(Buffer.from(uploaded.audioPcmBase64, 'base64').length, 4096 * 3 * 2);
    assert.equal(transcript, 'Bonjour');
    assert.equal(stopped, 1);
    assert.equal(engine.getIsActive(), false);
    await engine.stopSession();
    assert.equal(stopped, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete (globalThis as any).window;
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  }
});
