import { AudioSettings } from '../types';

// Speech Recognition types polyfill for browsers
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export type VoiceInputMode = 'auto' | 'webspeech' | 'direct-record';

export class SpeechService {
  private recognition: any = null;
  private isListeningActive = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private voiceInputMode: VoiceInputMode = 'auto';
  private hasEncounteredNetworkError = false;

  public setVoiceInputMode(mode: VoiceInputMode) {
    this.voiceInputMode = mode;
  }

  public getVoiceInputMode(): VoiceInputMode {
    return this.voiceInputMode;
  }

  public hasNetworkErrorOccurred(): boolean {
    return this.hasEncounteredNetworkError;
  }

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindow;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  public findBestDefaultVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices.length) return null;

    const preferredNames = [
      'Google US English',
      'Microsoft David',
      'Microsoft Guy Online',
      'Daniel',
      'Alex',
      'Samantha',
      'en-US',
      'en-GB',
    ];

    for (const name of preferredNames) {
      const match = voices.find(
        (v) => v.name.includes(name) || v.lang.startsWith(name)
      );
      if (match) return match;
    }

    const englishVoice = voices.find((v) => v.lang.startsWith('en'));
    return englishVoice || voices[0] || null;
  }

  public speak(
    text: string,
    settings: AudioSettings,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): void {
    if (!this.isSynthesisSupported()) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 1500);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = Math.max(0.7, Math.min(1.5, settings.rate || 1.0));
    utterance.pitch = Math.max(0.7, Math.min(1.3, settings.pitch || 1.0));
    utterance.volume = Math.max(0, Math.min(1, settings.volume || 1.0));

    if (settings.voiceURI) {
      const voices = this.getVoices();
      const matchedVoice = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    } else {
      const best = this.findBestDefaultVoice();
      if (best) utterance.voice = best;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public isCurrentlySpeaking(): boolean {
    if (!this.isSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }

  // --- Real Microphone Audio Analysis ---
  public async initAudioAnalyzer(onAudioLevel: (level: number, frequencyData: Uint8Array) => void): Promise<MediaStream | null> {
    try {
      if (this.micStream) {
        this.stopAudioAnalyzer();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLoop = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedLevel = Math.min(1, average / 128);

        onAudioLevel(normalizedLevel, dataArray);
        this.animationFrameId = requestAnimationFrame(updateLoop);
      };

      updateLoop();
      return stream;
    } catch (err) {
      console.warn('Microphone access for visualizer unavailable or permission denied:', err);
      return null;
    }
  }

  public stopAudioAnalyzer(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
  }

  // Converts Blob to Base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // strip data:audio/xxx;base64, prefix
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Calls server-side /api/transcribe using Gemini
  public async transcribeAudioBlob(blob: Blob): Promise<string> {
    try {
      const base64 = await this.blobToBase64(blob);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64,
          mimeType: blob.type || 'audio/webm',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data.text || '';
    } catch (err) {
      console.error('Error in transcribeAudioBlob:', err);
      throw err;
    }
  }

  // --- Resilient Speech Recognition with Auto-Fallback ---
  public async startListening(callbacks: {
    onStart?: () => void;
    onInterim?: (text: string) => void;
    onFinal?: (text: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    onAudioLevel?: (level: number, frequencyData: Uint8Array) => void;
    onInfoNotice?: (notice: string) => void;
  }): Promise<boolean> {
    if (this.isListeningActive) {
      this.stopListening();
    }

    // Initialize mic stream & audio level visualizer
    const stream = await this.initAudioAnalyzer((level, freqData) => {
      callbacks.onAudioLevel?.(level, freqData);
    });

    if (!stream) {
      callbacks.onError?.('Microphone access was denied or is unavailable. Please allow microphone permissions in your browser.');
      return false;
    }

    this.isListeningActive = true;
    this.audioChunks = [];

    // Initialize MediaRecorder to capture audio chunks simultaneously as a safety net
    try {
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      this.mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Slice chunks every 250ms
    } catch (recorderErr) {
      console.warn('MediaRecorder could not start:', recorderErr);
    }

    // Decide whether to use WebSpeech API or Direct Audio Recording
    const shouldUseDirectAudio =
      this.voiceInputMode === 'direct-record' ||
      (this.voiceInputMode === 'auto' && this.hasEncounteredNetworkError) ||
      !this.isSpeechSupported();

    if (shouldUseDirectAudio) {
      callbacks.onStart?.();
      callbacks.onInfoNotice?.('Direct Audio Mode active (recording audio directly for zero-failure transcription).');
      return true;
    }

    // Attempt browser WebSpeech recognition
    try {
      const win = window as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;

      let hasProducedTranscript = false;

      this.recognition.onstart = () => {
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        const userSpokenText = event.results[0][0].transcript;
        console.log("User Spoken:", userSpokenText);
        hasProducedTranscript = true;
        callbacks.onFinal?.(userSpokenText);
      };

      this.recognition.onerror = async (event: any) => {
        console.error("Speech recognition error", event.error);

        if (event.error === 'network') {
          this.hasEncounteredNetworkError = true;
          callbacks.onInfoNotice?.(
            'Browser speech service blocked network connection. Automatically recovering speech with Direct Audio Engine...'
          );

          // Stop MediaRecorder and transcribe the recorded audio chunks!
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            await new Promise((res) => setTimeout(res, 300));

            if (this.audioChunks.length > 0) {
              const mime = this.mediaRecorder.mimeType || 'audio/webm';
              const audioBlob = new Blob(this.audioChunks, { type: mime });

              try {
                const transcribed = await this.transcribeAudioBlob(audioBlob);
                if (transcribed && transcribed.trim()) {
                  hasProducedTranscript = true;
                  callbacks.onFinal?.(transcribed.trim());
                  return;
                }
              } catch (transcribeErr) {
                console.warn('Fallback transcription failed:', transcribeErr);
              }
            }
          }

          // If no audio chunks were recovered yet, instruct user that we switched mode
          callbacks.onError?.(
            'Network error during browser speech recognition. Automatically switched to Direct Audio Recording mode — tap the microphone again to speak!'
          );
          return;
        }

        let errorMsg = 'Microphone listening encountered an issue.';
        if (event.error === 'not-allowed') {
          errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          // If no speech was caught by WebSpeech, check if we captured audio chunks
          if (this.audioChunks.length > 0 && !hasProducedTranscript) {
            try {
              const mime = this.mediaRecorder?.mimeType || 'audio/webm';
              const audioBlob = new Blob(this.audioChunks, { type: mime });
              const transcribed = await this.transcribeAudioBlob(audioBlob);
              if (transcribed && transcribed.trim()) {
                callbacks.onFinal?.(transcribed.trim());
                return;
              }
            } catch (e) {
              // ignore
            }
          }
          errorMsg = 'No speech was detected. Tap the microphone and try speaking again.';
        }

        callbacks.onError?.(errorMsg);
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.warn('Failed to start SpeechRecognition, falling back to Direct Audio:', err);
      this.hasEncounteredNetworkError = true;
      callbacks.onStart?.();
      callbacks.onInfoNotice?.('Direct Audio Mode activated.');
      return true;
    }
  }

  // Stops listening and, if in direct mode or recovering, processes audio
  public async stopListeningAndTranscribe(): Promise<string | null> {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      await new Promise((res) => setTimeout(res, 300));
    }

    this.isListeningActive = false;
    this.stopAudioAnalyzer();

    if (this.audioChunks.length > 0) {
      try {
        const mime = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mime });
        const transcribed = await this.transcribeAudioBlob(audioBlob);
        return transcribed;
      } catch (err) {
        console.warn('Transcription error:', err);
        return null;
      }
    }

    return null;
  }

  public stopListening(): void {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }

    this.isListeningActive = false;
    this.stopAudioAnalyzer();
  }
}

export const speechService = new SpeechService();
