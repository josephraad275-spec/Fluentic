/**
 * Real-Time AI Voice Engine (16kHz 16-bit PCM Audio + WebSocket / Multimodal Streaming)
 * Directly replaces standard browser SpeechRecognition with 16kHz PCM audio stream capture
 * and Gemini multimodal speech processing.
 */

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
  private ws: WebSocket | null = null;
  private isRecording: boolean = false;
  private pcmChunks: Int16Array[] = [];
  private options: LiveVoiceSessionOptions | null = null;

  /**
   * Start 16kHz 16-bit PCM audio capture and streaming session
   */
  public async startSession(options: LiveVoiceSessionOptions): Promise<boolean> {
    this.stopSession();
    this.options = options;
    this.options.onStatusChange?.('connecting');

    try {
      // 1. Request microphone stream with clean audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;

      // 2. Setup Web Audio API at 16kHz
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtxClass({ sampleRate: 16000 });
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      // 4096 buffer size at 16kHz provides ~256ms chunk intervals
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.pcmChunks = [];
      this.isRecording = true;

      // 3. Connect to WebSocket stream if available
      this.connectWebSocket(options);

      // 4. Capture 16-bit PCM and calculate live Voice Activity Detection (VAD)
      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);

        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          sumSquares += s * s;
        }

        const rms = Math.sqrt(sumSquares / inputData.length);
        const vadLevel = Math.min(1, rms * 5.5);
        const isSpeech = rms > 0.015;

        // Visual VAD callback
        this.options?.onVadLevel?.(vadLevel, isSpeech);

        // Store PCM chunk for final aggregation
        this.pcmChunks.push(pcm16);

        // Stream chunk over WebSocket if open
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const base64 = this.int16ToBase64(pcm16);
          this.ws.send(JSON.stringify({
            type: 'chunk',
            pcmBase64: base64,
          }));
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.options.onStatusChange?.('listening');
      return true;
    } catch (err: any) {
      console.error('[RealtimeAudioEngine] Mic capture error:', err);
      this.options.onError?.(err?.message || 'Could not access microphone');
      this.stopSession();
      return false;
    }
  }

  /**
   * Stop session and finalize audio stream with Gemini
   */
  public async stopSession(): Promise<void> {
    if (!this.isRecording && !this.audioContext) return;
    this.isRecording = false;
    this.options?.onStatusChange?.('processing');

    // Disconnect audio nodes cleanly
    try {
      if (this.processorNode) {
        this.processorNode.disconnect();
        this.processorNode = null;
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((t) => t.stop());
        this.mediaStream = null;
      }
    } catch {
      // Ignore cleanup error
    }

    // If WebSocket is open, send finish
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'finish' }));
      } catch {
        // Fallback to REST
        await this.fallbackProcessAudio();
      }
    } else {
      // Process via REST fallback
      await this.fallbackProcessAudio();
    }
  }

  /**
   * Direct fallback to POST /api/gemini/live-audio-stream
   */
  private async fallbackProcessAudio(): Promise<void> {
    if (!this.pcmChunks.length) {
      this.options?.onStatusChange?.('idle');
      return;
    }

    try {
      // Concatenate all Int16 chunks
      const totalLength = this.pcmChunks.reduce((acc, c) => acc + c.length, 0);
      const combined = new Int16Array(totalLength);
      let offset = 0;
      for (const chunk of this.pcmChunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const pcmBase64 = this.int16ToBase64(combined);

      const res = await fetch('/api/gemini/live-audio-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioPcmBase64: pcmBase64,
          sampleRate: 16000,
          sourceLanguage: this.options?.sourceLanguage || 'auto',
          targetLanguage: this.options?.targetLanguage || 'English',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.transcription || data.translation) {
        this.options?.onTranscript(
          data.transcription || '',
          data.translation || '',
          data.detectedSource
        );
      }
    } catch (err: any) {
      console.warn('[RealtimeAudioEngine] REST Fallback Error:', err);
      this.options?.onError?.(err?.message || 'Speech processing failed');
    } finally {
      this.options?.onStatusChange?.('idle');
      this.pcmChunks = [];
    }
  }

  private connectWebSocket(options: LiveVoiceSessionOptions) {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws/voice-stream`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: 'start',
          sourceLanguage: options.sourceLanguage || 'auto',
          targetLanguage: options.targetLanguage || 'English',
          sampleRate: 16000,
        }));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'vad' && options.onVadLevel) {
            options.onVadLevel(msg.level || 0, Boolean(msg.isSpeech));
          } else if (msg.type === 'result') {
            options.onTranscript(
              msg.transcription || '',
              msg.translation || '',
              msg.detectedSource
            );
            options.onStatusChange?.('idle');
            socket.close();
          } else if (msg.type === 'error') {
            options.onError?.(msg.message || 'Stream error');
            options.onStatusChange?.('idle');
          }
        } catch {
          // ignore
        }
      };

      socket.onerror = () => {
        // Will seamlessly fallback to REST upon stopSession()
      };

      this.ws = socket;
    } catch {
      this.ws = null;
    }
  }

  private int16ToBase64(int16Array: Int16Array): string {
    const bytes = new Uint8Array(int16Array.buffer, int16Array.byteOffset, int16Array.byteLength);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public getIsActive(): boolean {
    return this.isRecording;
  }
}

export const realtimeAudio = new RealtimeAudioEngine();
