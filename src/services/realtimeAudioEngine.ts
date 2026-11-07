/** Microphone capture shared by Safari/iOS, Android Chrome, and desktop browsers. */
export interface LiveVoiceSessionOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  onTranscript: (transcription: string, translation?: string, detectedSource?: string) => void;
  onVadLevel?: (level: number, isSpeech: boolean) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'connecting' | 'listening' | 'processing') => void;
}

export class RealtimeAudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isRecording = false;
  private starting = false;
  private pcmChunks: Int16Array[] = [];
  private options: LiveVoiceSessionOptions | null = null;
  private sampleRate = 16000;
  private speechDetected = false;
  private limitTimer: ReturnType<typeof setTimeout> | null = null;
  private request: AbortController | null = null;
  private generation = 0;

  public async startSession(options: LiveVoiceSessionOptions): Promise<boolean> {
    if (this.starting) return false;
    this.starting = true;
    this.generation += 1;
    const generation = this.generation;
    this.request?.abort();
    await this.releaseCapture();
    this.options = options;
    this.pcmChunks = [];
    this.speechDetected = false;
    options.onStatusChange?.('connecting');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access requires HTTPS and a supported browser.');
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) throw new Error('Audio recording is unavailable in this browser.');
      // Create/resume inside the user gesture, before the microphone permission await (iOS).
      const context = new AudioCtx() as AudioContext;
      this.audioContext = context;
      await context.resume();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      } });
      if (generation !== this.generation) { stream.getTracks().forEach(track => track.stop()); return false; }
      this.mediaStream = stream;
      // Send the actual hardware rate; Safari may capture at 44.1 or 48 kHz.
      this.sampleRate = context.sampleRate;
      this.sourceNode = context.createMediaStreamSource(stream);
      this.processorNode = context.createScriptProcessor(4096, 1, 1);
      this.isRecording = true;
      this.processorNode.onaudioprocess = event => {
        if (!this.isRecording) return;
        const input = event.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);
        let energy = 0;
        for (let i = 0; i < input.length; i++) {
          const sample = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = sample < 0 ? sample * 32768 : sample * 32767;
          energy += sample * sample;
        }
        const rms = Math.sqrt(energy / input.length);
        const isSpeech = rms > 0.008;
        this.speechDetected ||= isSpeech;
        options.onVadLevel?.(Math.min(1, rms * 6), isSpeech);
        this.pcmChunks.push(pcm);
        // Explicit silence output prevents microphone feedback.
        event.outputBuffer.getChannelData(0).fill(0);
      };
      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(context.destination);
      this.limitTimer = setTimeout(() => void this.stopSession(), 60000);
      options.onStatusChange?.('listening');
      return true;
    } catch (error: any) {
      await this.releaseCapture();
      options.onError?.(error?.name === 'NotAllowedError' ? 'Allow microphone access in your browser settings, then try again.' : error.message || 'Could not start recording.');
      options.onStatusChange?.('idle');
      return false;
    } finally { this.starting = false; }
  }

  private async releaseCapture(): Promise<void> {
    this.isRecording = false;
    if (this.limitTimer) clearTimeout(this.limitTimer);
    this.limitTimer = null;
    if (this.processorNode) { this.processorNode.onaudioprocess = null; this.processorNode.disconnect(); }
    this.sourceNode?.disconnect();
    this.mediaStream?.getTracks().forEach(track => track.stop());
    const context = this.audioContext;
    this.processorNode = null;
    this.sourceNode = null;
    this.mediaStream = null;
    this.audioContext = null;
    if (context && context.state !== 'closed') await context.close().catch(() => undefined);
  }

  public async stopSession(): Promise<void> {
    if (this.starting && !this.isRecording) { this.generation += 1; await this.releaseCapture(); return; }
    if (!this.isRecording) return;
    const options = this.options;
    const generation = this.generation;
    const chunks = this.pcmChunks;
    const sampleRate = this.sampleRate;
    const hasSpeech = this.speechDetected;
    this.pcmChunks = [];
    await this.releaseCapture();
    if (!hasSpeech || !chunks.length) {
      options?.onError?.('No speech detected. Move closer to the microphone and try again.');
      options?.onStatusChange?.('idle');
      return;
    }
    options?.onStatusChange?.('processing');
    const controller = new AbortController();
    this.request = controller;
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const pcm = new Int16Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) { pcm.set(chunk, offset); offset += chunk.length; }
      const bytes = new Uint8Array(pcm.buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      // One complete upload avoids socket connection gaps, duplicate billing, and proxy WS restrictions.
      const response = await fetch('/api/gemini/live-audio-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ audioPcmBase64: btoa(binary), sampleRate,
          sourceLanguage: options?.sourceLanguage || 'auto', targetLanguage: options?.targetLanguage || 'English' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Speech service unavailable (${response.status}).`);
      if (generation !== this.generation) return;
      if (!data.transcription) throw new Error('No clear speech recognized. Please try again.');
      options?.onTranscript(data.transcription, data.translation || '', data.detectedSource);
    } catch (error: any) {
      if (generation === this.generation) options?.onError?.(error.name === 'AbortError' ? 'Speech processing timed out. Please try a shorter recording.' : error.message);
    } finally {
      clearTimeout(timeout);
      if (generation === this.generation) { this.request = null; options?.onStatusChange?.('idle'); }
    }
  }

  public getIsActive(): boolean { return this.isRecording; }
}
export const realtimeAudio = new RealtimeAudioEngine();
