import React from 'react';
import { Download, Sliders, RotateCcw, Volume2, FileText, Code, Sparkles } from 'lucide-react';
import { TranscriptTurn } from '../types';
import { exportToJson, exportToPdf } from '../services/exportService';

interface HeaderProps {
  transcripts: TranscriptTurn[];
  onOpenSettings: () => void;
  onClearSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  transcripts,
  onOpenSettings,
  onClearSession,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4 border-b-4 border-black bg-[#FFE600] sticky top-0 z-40 shadow-[0_4px_0_0_#000]">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-black text-[#FFE600] border-2 border-black flex items-center justify-center font-black shadow-[3px_3px_0_0_#000]">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-black uppercase">
            Paritosh Kumar
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-mono font-bold bg-white text-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_0_#000]">
            AI VOICE BOT
          </span>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line brutalist badges */}
      <nav className="hidden lg:flex items-center gap-3 text-xs font-mono font-bold text-black">
        <span className="bg-white border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] whitespace-nowrap">
          Mitratech TSE II
        </span>
        <span className="bg-[#BAE6FD] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] whitespace-nowrap">
          12+ Yrs L2/L3 SaaS
        </span>
        <span className="bg-[#BBF7D0] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] whitespace-nowrap">
          Local-First AI
        </span>
        <span className="bg-[#FBCFE8] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] whitespace-nowrap">
          Global Ready
        </span>
      </nav>

      {/* Zone 3: Primary action & utility controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSettings}
          title="Audio & Voice Settings"
          className="px-3 py-2 text-xs font-black text-black bg-[#00E5FF] hover:bg-[#38BDF8] border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Sliders className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline font-mono uppercase">Voice Engine</span>
        </button>

        {transcripts.length > 0 && (
          <button
            onClick={onClearSession}
            title="Reset conversation"
            className="p-2 text-white bg-[#FF2E93] hover:bg-[#F43F5E] border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        {/* Export dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-xs font-black text-[#FFE600] bg-black hover:bg-neutral-900 border-2 border-black shadow-[3px_3px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer uppercase font-mono"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export Logs</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 py-2 bg-white border-3 border-black shadow-[6px_6px_0_0_#000] z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black font-mono border-b-2 border-black bg-[#FFE600]">
                Choose Export Format
              </div>
              <button
                onClick={() => {
                  exportToPdf(transcripts);
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-black hover:bg-[#BAE6FD] flex items-center gap-2.5 transition-colors border-b border-black/20"
              >
                <FileText className="w-4 h-4 text-red-600 stroke-[2.5]" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={() => {
                  exportToJson(transcripts);
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-black hover:bg-[#BBF7D0] flex items-center gap-2.5 transition-colors border-b border-black/20"
              >
                <Code className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                <span>Export JSON Data</span>
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-black hover:bg-[#FBCFE8] flex items-center gap-2.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-700 stroke-[2.5]" />
                <span>Browser Print View</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
