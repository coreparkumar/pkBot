import React from 'react';
import { BotStatus } from '../types';
import { PARITOSH_PROFILE } from '../data/personaData';
import { Mic, Volume2, Loader2, Radio, Globe, ExternalLink, Zap } from 'lucide-react';

interface PersonaHeaderCardProps {
  status: BotStatus;
  currentUtterance?: string;
}

export const PersonaHeaderCard: React.FC<PersonaHeaderCardProps> = ({
  status,
}) => {
  const [imgSrc, setImgSrc] = React.useState(PARITOSH_PROFILE.avatarPath);

  const statusConfig = {
    idle: {
      label: 'PERSONA READY',
      subtext: 'Awaiting your voice query or question selection',
      icon: Radio,
      bgColor: 'bg-[#FFE600]',
      textColor: 'text-black',
    },
    listening: {
      label: 'LISTENING NOW',
      subtext: 'Real-time mic audio streaming...',
      icon: Mic,
      bgColor: 'bg-[#00E5FF]',
      textColor: 'text-black',
    },
    thinking: {
      label: 'REASONING',
      subtext: 'Evaluating resume context & boundaries...',
      icon: Loader2,
      bgColor: 'bg-[#FF2E93]',
      textColor: 'text-white',
    },
    speaking: {
      label: 'PARITOSH SPEAKING',
      subtext: 'Synthesizing voice response...',
      icon: Volume2,
      bgColor: 'bg-[#22C55E]',
      textColor: 'text-black',
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] p-6 relative overflow-hidden">
      {/* Decorative top-right brutalist badge */}
      <div className="absolute top-0 right-0 bg-black text-[#FFE600] font-mono text-[10px] font-black uppercase px-3 py-1 border-b-2 border-l-2 border-black">
        ASSESSMENT VERIFIED
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Paritosh's Real Photo with Brutalist Frame */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FFE600] border-4 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
              <img
                src={imgSrc}
                alt={PARITOSH_PROFILE.name}
                onError={() => setImgSrc('/src/assets/images/my-pic_c949ea9c.jpg')}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Live Indicator Stamp */}
            <div
              className={`absolute -bottom-2 -right-2 px-2 py-0.5 border-2 border-black font-mono font-black text-[10px] shadow-[2px_2px_0_0_#000] ${statusConfig.bgColor} ${statusConfig.textColor}`}
            >
              {status.toUpperCase()}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">
                {PARITOSH_PROFILE.name}
              </h1>
              <span className="text-xs font-mono font-black bg-[#BBF7D0] text-black px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0_0_#000]">
                TSE II @ MITRATECH
              </span>
            </div>

            <p className="text-sm font-bold text-black mt-1 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FF2E93] fill-[#FF2E93]" />
              <span>{PARITOSH_PROFILE.title}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-black mt-2">
              <span className="bg-[#FEF08A] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_#000]">
                {PARITOSH_PROFILE.experience}
              </span>
              <span className="bg-[#BAE6FD] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_0_#000] flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <span>{PARITOSH_PROFILE.availability}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono font-bold text-black mt-2.5">
              <a
                href={PARITOSH_PROFILE.links.github}
                target="_blank"
                rel="noreferrer"
                className="bg-[#DDD6FE] hover:bg-[#C4B5FD] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform flex items-center gap-1"
              >
                <span>github.com/coreparkumar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={PARITOSH_PROFILE.links.website}
                target="_blank"
                rel="noreferrer"
                className="bg-[#FED7AA] hover:bg-[#FDBA74] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform flex items-center gap-1"
              >
                <span>worthifyme.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={PARITOSH_PROFILE.links.portfolio}
                target="_blank"
                rel="noreferrer"
                className="bg-[#FBCFE8] hover:bg-[#F472B6] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform flex items-center gap-1"
              >
                <span>portfolio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Real-time Bot State Card */}
        <div className={`p-4 border-3 border-black shadow-[4px_4px_0_0_#000] flex items-center gap-3.5 ${statusConfig.bgColor} min-w-[240px]`}>
          <div className="p-2.5 bg-black text-white border-2 border-black shadow-[2px_2px_0_0_#FFF]">
            <StatusIcon className={`w-5 h-5 stroke-[2.5] ${status === 'thinking' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-black text-black tracking-wider uppercase font-mono">
              {statusConfig.label}
            </div>
            <div className="text-[11px] font-bold text-black/80 font-mono">
              {statusConfig.subtext}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
