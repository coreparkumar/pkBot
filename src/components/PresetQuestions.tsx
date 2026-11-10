import React from 'react';
import { PRESET_QUESTIONS } from '../data/personaData';
import { PresetQuestion, BotStatus } from '../types';
import { Play, Sparkles } from 'lucide-react';

interface PresetQuestionsProps {
  status: BotStatus;
  activeQuestionId: string | null;
  onSelectPreset: (question: PresetQuestion) => void;
}

const BRUTALIST_CARD_THEMES = [
  { bg: 'bg-[#FEF08A]', badge: 'bg-[#FFE600]', text: 'text-black' },
  { bg: 'bg-[#BAE6FD]', badge: 'bg-[#38BDF8]', text: 'text-black' },
  { bg: 'bg-[#BBF7D0]', badge: 'bg-[#4ADE80]', text: 'text-black' },
  { bg: 'bg-[#FBCFE8]', badge: 'bg-[#F472B6]', text: 'text-black' },
  { bg: 'bg-[#DDD6FE]', badge: 'bg-[#A78BFA]', text: 'text-black' },
];

export const PresetQuestions: React.FC<PresetQuestionsProps> = ({
  status,
  activeQuestionId,
  onSelectPreset,
}) => {
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b-3 border-black">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black text-black tracking-tight uppercase font-mono">
              Key Interview Assessment Questions
            </h2>
            <p className="text-xs font-bold text-black/70 font-mono">
              Click any question for instant dynamic synthesis based on resume context
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-xs font-mono font-black bg-black text-[#FFE600] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
          5 INSTANT PRESETS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PRESET_QUESTIONS.map((q, idx) => {
          const isActive = activeQuestionId === q.id && (status === 'speaking' || status === 'thinking');
          const theme = BRUTALIST_CARD_THEMES[idx % BRUTALIST_CARD_THEMES.length];

          return (
            <button
              key={q.id}
              onClick={() => onSelectPreset(q)}
              disabled={status === 'thinking'}
              className={`text-left p-4 border-3 border-black transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                theme.bg
              } ${
                isActive
                  ? 'ring-4 ring-black shadow-[8px_8px_0_0_#000] translate-x-[-2px] translate-y-[-2px]'
                  : 'shadow-[4px_4px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 border-2 border-black shadow-[1px_1px_0_0_#000] ${theme.badge}`}>
                    {q.category}
                  </span>
                  <span className="text-[11px] font-mono font-black text-black">
                    0{idx + 1}
                  </span>
                </div>
                <div className="text-xs font-black text-black leading-snug uppercase font-mono">
                  {q.title}
                </div>
                <div className="text-[11px] text-black/80 mt-2 line-clamp-3 font-medium leading-relaxed">
                  {q.shortDescription}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono font-black text-black">
                <span className="uppercase text-[11px]">
                  {isActive ? 'SPEAKING...' : 'TEST INQUIRY'}
                </span>
                <div
                  className={`w-7 h-7 border-2 border-black flex items-center justify-center transition-transform ${
                    isActive
                      ? 'bg-black text-[#FFE600] scale-110'
                      : 'bg-white group-hover:bg-black group-hover:text-white shadow-[2px_2px_0_0_#000]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
