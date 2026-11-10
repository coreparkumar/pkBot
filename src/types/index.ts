export type BotStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface TranscriptTurn {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  durationMs?: number;
  source: 'voice' | 'preset' | 'text';
}

export interface PresetQuestion {
  id: string;
  category: string;
  title: string;
  query: string;
  shortDescription: string;
  canonicalAnswer: string;
}

export interface AudioSettings {
  voiceURI: string;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}
