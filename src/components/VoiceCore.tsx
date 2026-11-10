import React from 'react';
import { Mic, Square, Send, MessageSquareText, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BotStatus } from '../types';
import { VoiceInputMode } from '../services/speechService';

interface VoiceCoreProps {
  status: BotStatus;
  audioLevel: number; // 0.0 - 1.0
  frequencyData: Uint8Array | null;
  interimTranscript: string;
  onToggleListen: () => void;
  onStopSpeaking: () => void;
  onSubmitText: (query: string) => void;
  errorMessage?: string | null;
  infoNotice?: string | null;
  voiceMode: VoiceInputMode;
  onSetVoiceMode: (mode: VoiceInputMode) => void;
}

const BRIGHT_BAR_COLORS = [
  'bg-[#FFE600]', // Yellow
  'bg-[#00E5FF]', // Cyan
  'bg-[#FF2E93]', // Pink
  'bg-[#22C55E]', // Green
  'bg-[#A855F7]', // Purple
  'bg-[#FB923C]', // Orange
];

export const VoiceCore: React.FC<VoiceCoreProps> = ({
  status,
  audioLevel,
  interimTranscript,
  onToggleListen,
  onStopSpeaking,
  onSubmitText,
  errorMessage,
  infoNotice,
  voiceMode,
  onSetVoiceMode,
}) => {
  const [typedInput, setTypedInput] = React.useState('');
  const [showTextInput, setShowTextInput] = React.useState(false);

  // Equalizer bar heights generation (24 bars)
  const barCount = 24;
  const bars = React.useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      if (status === 'listening') {
        const factor = Math.sin((i / barCount) * Math.PI) * 0.8 + 0.2;
        const dynamicLevel = Math.max(0.15, Math.min(1, (audioLevel * 1.5 + Math.random() * 0.25) * factor));
        return dynamicLevel * 100;
      }
      if (status === 'speaking') {
        const phase = (Date.now() / 140 + i * 0.45) % (Math.PI * 2);
        const dynamicLevel = 0.3 + 0.55 * Math.abs(Math.sin(phase));
        return dynamicLevel * 100;
      }
      if (status === 'thinking') {
        const phase = (Date.now() / 220 + i * 0.35) % (Math.PI * 2);
        return (0.25 + 0.35 * Math.sin(phase)) * 100;
      }
      // Idle rhythm
      return 14 + (i % 4) * 6;
    });
  }, [status, audioLevel]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    onSubmitText(typedInput.trim());
    setTypedInput('');
  };

  return (
    <div className="bg-[#FFFBEB] border-4 border-black shadow-[8px_8px_0_0_#000] p-6 sm:p-8 relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
        <span className="font-mono font-black text-xs uppercase bg-[#FFE600] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
          VOICE COMMAND TERMINAL
        </span>

        {/* Voice Engine Mode Switcher Bar */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] text-[11px] font-mono font-bold">
          <button
            type="button"
            onClick={() => onSetVoiceMode('auto')}
            className={`px-2 py-0.5 border transition-all ${
              voiceMode === 'auto'
                ? 'bg-[#FFE600] text-black border-black font-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-black hover:bg-neutral-100'
            }`}
          >
            Auto Dual
          </button>
          <button
            type="button"
            onClick={() => onSetVoiceMode('direct-record')}
            title="Direct Audio Recording (100% resilient)"
            className={`px-2 py-0.5 border transition-all flex items-center gap-1 ${
              voiceMode === 'direct-record'
                ? 'bg-[#22C55E] text-black border-black font-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-black hover:bg-neutral-100'
            }`}
          >
            <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
            <span>Direct</span>
          </button>
          <button
            type="button"
            onClick={() => onSetVoiceMode('webspeech')}
            className={`px-2 py-0.5 border transition-all ${
              voiceMode === 'webspeech'
                ? 'bg-[#00E5FF] text-black border-black font-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-black hover:bg-neutral-100'
            }`}
          >
            WebSpeech
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* Equalizer Frequency Visualization */}
        <div className="h-16 w-full max-w-md flex items-end justify-center gap-1.5 sm:gap-2 mb-6 px-4 bg-white p-2 border-3 border-black shadow-[4px_4px_0_0_#000]">
          {bars.map((height, idx) => {
            const colorClass = BRIGHT_BAR_COLORS[idx % BRIGHT_BAR_COLORS.length];
            return (
              <div
                key={idx}
                style={{ height: `${Math.max(12, height)}%` }}
                className={`w-1.5 sm:w-2 border-2 border-black transition-all duration-75 ${
                  status === 'idle' ? 'bg-[#FFE600]' : colorClass
                }`}
              />
            );
          })}
        </div>

        {/* Large Central Brutalist Microphone Button */}
        <div className="relative mb-6">
          <button
            onClick={status === 'speaking' ? onStopSpeaking : onToggleListen}
            disabled={status === 'thinking'}
            aria-label={
              status === 'listening'
                ? 'Done speaking - process audio'
                : status === 'speaking'
                ? 'Stop speaking'
                : 'Tap to speak to Paritosh Kumar'
            }
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-black flex flex-col items-center justify-center transition-all duration-150 transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none shadow-[6px_6px_0_0_#000] cursor-pointer ${
              status === 'listening'
                ? 'bg-[#00E5FF] text-black'
                : status === 'speaking'
                ? 'bg-[#22C55E] text-black'
                : status === 'thinking'
                ? 'bg-[#FF2E93] text-white cursor-wait'
                : 'bg-[#FFE600] hover:bg-[#FACC15] text-black'
            }`}
          >
            {status === 'listening' ? (
              <>
                <Mic className="w-10 h-10 stroke-[2.5] animate-bounce" />
                <span className="text-[11px] font-mono font-black tracking-wider uppercase mt-1 bg-black text-[#00E5FF] px-2 py-0.5 border border-black">
                  DONE
                </span>
              </>
            ) : status === 'speaking' ? (
              <>
                <Square className="w-9 h-9 stroke-[2.5] fill-current" />
                <span className="text-[11px] font-mono font-black tracking-wider uppercase mt-1 bg-black text-[#22C55E] px-2 py-0.5 border border-black">
                  STOP
                </span>
              </>
            ) : status === 'thinking' ? (
              <>
                <Sparkles className="w-10 h-10 stroke-[2.5] animate-spin" />
                <span className="text-[11px] font-mono font-black tracking-wider uppercase mt-1 bg-black text-white px-2 py-0.5 border border-black">
                  THINK
                </span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 stroke-[2.5] mb-0.5" />
                <span className="text-xs font-black tracking-wide uppercase font-mono">
                  TAP TO SPEAK
                </span>
              </>
            )}
          </button>
        </div>

        {/* Primary Action Guidance */}
        <div className="max-w-md w-full">
          <div className="text-sm font-black text-black uppercase font-mono bg-white border-2 border-black py-1.5 px-3 shadow-[2px_2px_0_0_#000]">
            {status === 'listening'
              ? '🎤 LISTENING... TAP AGAIN TO SUBMIT'
              : status === 'speaking'
              ? '🔊 PARITOSH IS RESPONDING OUT LOUD'
              : status === 'thinking'
              ? '⚡ PROCESSING WITH STRICT BOUNDARY RULES...'
              : '👉 TAP MIC TO ASK OR PICK AN INTERVIEW PRESET'}
          </div>

          {/* Info Notice */}
          {infoNotice && (
            <div className="mt-3 p-2 bg-[#BBF7D0] border-2 border-black shadow-[3px_3px_0_0_#000] text-xs text-black font-mono font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0 stroke-[2.5]" />
              <span>{infoNotice}</span>
            </div>
          )}

          {/* Live Interim Speech Preview */}
          {interimTranscript && (
            <div className="mt-3 p-3 bg-white border-3 border-black shadow-[4px_4px_0_0_#000] text-left text-xs font-mono font-bold text-black animate-in fade-in">
              <span className="bg-[#FFE600] px-1.5 py-0.5 border border-black mr-2 uppercase">HEARING:</span>
              <span className="italic">"{interimTranscript}"</span>
            </div>
          )}

          {/* Error Message notice with 1-click Direct Mode resolution */}
          {errorMessage && (
            <div className="mt-3 p-3 bg-[#FEE2E2] border-3 border-black shadow-[4px_4px_0_0_#000] text-xs text-red-950 text-left font-mono font-bold space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 stroke-[2.5]" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.includes('Network error') && (
                <div className="pt-2 border-t-2 border-black flex items-center justify-between">
                  <span className="text-[11px] text-black">
                    Browser cloud speech blocked by browser policy.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSetVoiceMode('direct-record');
                      onToggleListen();
                    }}
                    className="px-2.5 py-1 bg-[#22C55E] text-black border-2 border-black shadow-[2px_2px_0_0_#000] font-black text-[11px] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform cursor-pointer"
                  >
                    <span>Use Direct Audio Recording</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alternative Text Input Toggle for quiet testing */}
        <div className="mt-6 pt-5 border-t-3 border-black w-full max-w-lg">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-black mb-2">
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="bg-white hover:bg-neutral-100 border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquareText className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{showTextInput ? 'HIDE TEXT INPUT' : 'OR TYPE QUESTION MANUALLY'}</span>
            </button>
            <span className="bg-[#BAE6FD] px-2 py-0.5 border border-black text-[10px] uppercase">
              100% Dynamic Engine
            </span>
          </div>

          {showTextInput && (
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Ask about TeamConnect, Sisense, MegaMind, Ollama..."
                className="flex-1 bg-white border-3 border-black shadow-[3px_3px_0_0_#000] px-3 py-2 text-xs font-mono font-bold text-black placeholder:text-black/50 outline-none focus:bg-[#FFFBEB]"
              />
              <button
                type="submit"
                disabled={!typedInput.trim() || status === 'thinking'}
                className="px-4 py-2 bg-[#00E5FF] hover:bg-[#38BDF8] disabled:opacity-50 text-black font-black text-xs border-3 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-1.5 transition-all shrink-0 cursor-pointer font-mono"
              >
                <span>ASK</span>
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
