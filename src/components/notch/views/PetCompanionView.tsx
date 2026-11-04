import React from 'react';
import { Bot, Sparkles, SunDim, Sliders } from 'lucide-react';
import { NovaPetWidget } from '../NovaPetWidget';
import { useNotch } from '../../../context/NotchContext';

export const PetCompanionView: React.FC = () => {
  const { config, updateConfig, showToast } = useNotch();

  return (
    <div className="flex items-center justify-between h-[106px] px-2.5 py-1 text-xs select-none gap-3">
      {/* Left: Interactive NOVA Pet robot avatar */}
      <div className="flex-1">
        <NovaPetWidget compact={false} />
      </div>

      {/* Right: Ambient Edge Light controls */}
      <div className="w-[125px] h-full bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-200 flex items-center gap-1">
            <SunDim className="w-3 h-3 text-cyan-400" /> Edge Aura
          </span>
          <span className="text-[9px] text-cyan-300 font-mono">Dynamic</span>
        </div>

        <p className="text-[8px] text-slate-400 leading-tight">
          Auto-reacts to music, Pomodoro, alerts, and downloads.
        </p>

        <div className="flex items-center justify-between text-[9px] text-slate-300 pt-1 border-t border-white/10">
          <span>Glow Effect</span>
          <span className="text-emerald-400 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};
