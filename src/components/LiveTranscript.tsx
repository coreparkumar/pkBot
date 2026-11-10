import React from 'react';
import { TranscriptTurn } from '../types';
import { Volume2, Copy, Check, Search, Terminal, MessageSquare, ArrowDownCircle } from 'lucide-react';
import { PARITOSH_PROFILE } from '../data/personaData';

interface LiveTranscriptProps {
  transcripts: TranscriptTurn[];
  onReplayVoice: (text: string) => void;
  onClear: () => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcripts,
  onReplayVoice,
  onClear,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = React.useState(true);

  React.useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts, autoScroll]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTranscripts = React.useMemo(() => {
    if (!searchTerm.trim()) return transcripts;
    const term = searchTerm.toLowerCase();
    return transcripts.filter((t) => t.text.toLowerCase().includes(term));
  }, [transcripts, searchTerm]);

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] flex flex-col h-[520px] overflow-hidden">
      {/* Brutalist Toolbar */}
      <div className="px-5 py-3.5 border-b-3 border-black bg-[#FFE600] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black">
            <Terminal className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-sm font-black text-black tracking-tight uppercase font-mono">
            Live Session Transcript
          </h2>
          <span className="text-[11px] font-mono font-black bg-white px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_#000]">
            {transcripts.length} {transcripts.length === 1 ? 'TURN' : 'TURNS'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search filter input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/60 stroke-[2.5]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="w-36 sm:w-44 bg-white border-2 border-black focus:bg-[#FFFBEB] rounded-none pl-8 pr-2 py-1 text-xs font-mono font-bold text-black placeholder:text-black/40 outline-none shadow-[2px_2px_0_0_#000]"
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            className={`p-1.5 border-2 border-black font-mono text-xs font-black transition-colors cursor-pointer shadow-[2px_2px_0_0_#000] ${
              autoScroll
                ? 'bg-black text-[#FFE600]'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Transcript Log Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFDF5]"
      >
        {filteredTranscripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-black/60">
            <div className="w-14 h-14 bg-[#FEF08A] border-3 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <p className="text-base font-black text-black font-mono uppercase">
              No conversation logs yet.
            </p>
            <p className="text-xs text-black/80 font-mono mt-1 max-w-sm font-semibold">
              Tap the central microphone to speak, or click one of the 5 key interview presets to test Paritosh's real-time voice response.
            </p>
          </div>
        ) : (
          filteredTranscripts.map((turn) => {
            const isUser = turn.sender === 'user';

            return (
              <div
                key={turn.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-9 h-9 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shrink-0 font-black text-xs shadow-[2px_2px_0_0_#000] overflow-hidden">
                    <img
                      src={PARITOSH_PROFILE.avatarPath}
                      alt="PK"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 border-3 border-black shadow-[4px_4px_0_0_#000] transition-colors ${
                    isUser
                      ? 'bg-[#BAE6FD] text-black'
                      : 'bg-[#FEF08A] text-black'
                  }`}
                >
                  {/* Speaker Label & Metadata */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b-2 border-black text-[11px] font-mono font-black">
                    <span className="uppercase tracking-wide">
                      {isUser ? '👤 Interviewer (You)' : `⚡ ${PARITOSH_PROFILE.name}`}
                    </span>
                    <div className="flex items-center gap-1.5 text-black/70">
                      <span className="bg-white px-1.5 py-0.2 border border-black text-[9px] uppercase">
                        {turn.source}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">{turn.timestamp}</span>
                    </div>
                  </div>

                  {/* Message Text */}
                  <div className="text-black font-medium text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                    {turn.text}
                  </div>

                  {/* Actions Bar for Bot Turns */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t-2 border-black flex items-center justify-end gap-2">
                      <button
                        onClick={() => onReplayVoice(turn.text)}
                        title="Replay Voice Response"
                        className="px-2.5 py-1 bg-white hover:bg-black hover:text-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 text-[11px] font-mono font-black transition-all cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>REPLAY</span>
                      </button>
                      <button
                        onClick={() => handleCopy(turn.id, turn.text)}
                        title="Copy text to clipboard"
                        className="px-2.5 py-1 bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 text-[11px] font-mono font-black transition-all cursor-pointer"
                      >
                        {copiedId === turn.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 border-2 border-black bg-black text-[#00E5FF] flex items-center justify-center shrink-0 font-black text-xs shadow-[2px_2px_0_0_#000]">
                    YOU
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
