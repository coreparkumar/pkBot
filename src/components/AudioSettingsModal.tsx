import React from 'react';
import { X, Sliders, Mic, Play } from 'lucide-react';
import { AudioSettings } from '../types';
import { speechService, VoiceInputMode } from '../services/speechService';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  voiceMode: VoiceInputMode;
  onSetVoiceMode: (mode: VoiceInputMode) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  voiceMode,
  onSetVoiceMode,
}) => {
  const [availableVoices, setAvailableVoices] = React.useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      const voices = speechService.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    speechService.speak(
      'Hello, I am Paritosh Kumar. Ready to discuss production troubleshooting, TeamConnect, and local AI agent workflows.',
      settings
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FFFDF5] border-4 border-black shadow-[10px_10px_0_0_#000] max-w-lg w-full p-0 relative overflow-hidden">
        {/* Brutalist Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black bg-[#FFE600]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black">
              <Sliders className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-sm font-black text-black tracking-tight uppercase font-mono">
              Voice Synthesis & Audio Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-[2px_2px_0_0_#000] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Voice Input Engine (Network-resilient selector) */}
          <div>
            <label className="block text-xs font-black uppercase font-mono text-black mb-2">
              Speech-to-Text Input Mode
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onSetVoiceMode('auto')}
                className={`p-2.5 border-2 border-black text-left text-xs font-mono transition-all cursor-pointer ${
                  voiceMode === 'auto'
                    ? 'bg-[#FFE600] text-black font-black shadow-[3px_3px_0_0_#000]'
                    : 'bg-white text-black font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="font-black">Auto Dual</div>
                <div className="text-[10px] text-black/70 mt-0.5 font-medium">Smart fallback</div>
              </button>
              <button
                type="button"
                onClick={() => onSetVoiceMode('direct-record')}
                className={`p-2.5 border-2 border-black text-left text-xs font-mono transition-all cursor-pointer ${
                  voiceMode === 'direct-record'
                    ? 'bg-[#22C55E] text-black font-black shadow-[3px_3px_0_0_#000]'
                    : 'bg-white text-black font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="font-black">Direct Audio</div>
                <div className="text-[10px] text-black/70 mt-0.5 font-medium">Zero network err</div>
              </button>
              <button
                type="button"
                onClick={() => onSetVoiceMode('webspeech')}
                className={`p-2.5 border-2 border-black text-left text-xs font-mono transition-all cursor-pointer ${
                  voiceMode === 'webspeech'
                    ? 'bg-[#00E5FF] text-black font-black shadow-[3px_3px_0_0_#000]'
                    : 'bg-white text-black font-bold hover:bg-neutral-100'
                }`}
              >
                <div className="font-black">WebSpeech</div>
                <div className="text-[10px] text-black/70 mt-0.5 font-medium">Chrome cloud</div>
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-xs font-black uppercase font-mono text-black mb-1.5">
              Synthesis Voice Engine
            </label>
            <select
              value={settings.voiceURI}
              onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
              className="w-full bg-white border-2 border-black p-2 text-xs font-mono font-bold text-black outline-none shadow-[2px_2px_0_0_#000]"
            >
              <option value="">Default (Auto-select natural voice)</option>
              {availableVoices
                .filter((v) => v.lang.startsWith('en'))
                .map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-black/70 mt-1 font-mono font-medium">
              Web Speech API leverages your operating system voices.
            </p>
          </div>

          {/* Speech Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-black font-mono text-black mb-1.5">
              <span>SPEECH CADENCE (SPEED)</span>
              <span className="bg-[#BAE6FD] px-2 py-0.5 border border-black tabular-nums">
                {settings.rate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={settings.rate}
              onChange={(e) =>
                onUpdateSettings({ rate: parseFloat(e.target.value) })
              }
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-black font-mono text-black mb-1.5">
              <span>VOCAL PITCH</span>
              <span className="bg-[#BBF7D0] px-2 py-0.5 border border-black tabular-nums">
                {settings.pitch.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={settings.pitch}
              onChange={(e) =>
                onUpdateSettings({ pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Troubleshooting Tip */}
          <div className="p-3 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0_0_#000] text-xs font-mono font-medium text-black">
            <div className="flex items-center gap-1.5 font-black uppercase mb-1">
              <Mic className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Speech Input Tip</span>
            </div>
            <span>
              If your browser blocks external speech cloud recognition, switch to Direct Audio Mode above. It records directly on your device without network errors.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t-3 border-black bg-white">
          <button
            onClick={handleTestVoice}
            className="px-3.5 py-2 bg-white hover:bg-[#BAE6FD] text-black text-xs font-mono font-black border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>TEST PREVIEW</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-mono font-black border-2 border-black shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer uppercase"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
