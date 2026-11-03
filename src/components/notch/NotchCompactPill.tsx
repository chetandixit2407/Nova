import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  ShieldCheck,
  Video,
  FileCheck,
  EyeOff
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';
import { VayllEye } from './VayllEye';

export const NotchCompactPill: React.FC = () => {
  const {
    tasks,
    toggleExpand,
    showLiveActivities,
    toggleLiveActivities
  } = useNotch();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(4));

  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
    });
    return unsub;
  }, []);

  // Visualizer loop for mini pill when audio is active
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (audioEngine.getIsPlaying()) {
        const full = audioEngine.getFrequencies();
        const mini = new Uint8Array([full[2] || 0, full[5] || 0, full[9] || 0, full[14] || 0]);
        setFrequencies(mini);
      }
      animId = requestAnimationFrame(updateFreqs);
    };
    animId = requestAnimationFrame(updateFreqs);
    return () => cancelAnimationFrame(animId);
  }, []);

  const activeTask = tasks.find((t) => t.status === 'running');
  const hasLiveActivity = isPlaying || Boolean(activeTask);

  return (
    <div
      onClick={toggleExpand}
      className="w-full h-full flex items-center justify-center cursor-pointer select-none text-xs font-medium text-slate-200 px-3 relative"
    >
      <AnimatePresence mode="wait">
        {showLiveActivities && hasLiveActivity ? (
          /* State 1: Live Activity running AND live activities enabled */
          <motion.div
            key="live-activity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-between gap-3 px-1"
          >
            {/* Live Indicator */}
            <div className="flex items-center gap-2 min-w-0">
              {isPlaying ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                    <span
                      className="w-0.5 bg-sky-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, (frequencies[0] / 255) * 14)}px` }}
                    />
                    <span
                      className="w-0.5 bg-cyan-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, (frequencies[1] / 255) * 14)}px` }}
                    />
                    <span
                      className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, (frequencies[2] / 255) * 14)}px` }}
                    />
                    <span
                      className="w-0.5 bg-sky-300 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, (frequencies[3] / 255) * 14)}px` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-sky-300 truncate max-w-[110px]">
                    {audioEngine.getCurrentTrack().title}
                  </span>
                </div>
              ) : activeTask ? (
                <div className="flex items-center gap-2 text-[11px]">
                  {activeTask.type === 'download' ? (
                    <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  ) : activeTask.type === 'install' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                  )}
                  <span className="text-slate-200 truncate max-w-[100px]">{activeTask.title}</span>
                  <span className="font-mono text-cyan-400 font-bold">{activeTask.progress}%</span>
                </div>
              ) : null}
            </div>

            {/* Right: Eye + Hide Live Activity Action */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLiveActivities();
                }}
                title="Hide live activity in notch (Eyes Only Mode)"
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
              </button>
              <VayllEye size="sm" />
            </div>
          </motion.div>
        ) : (
          /* State 3: Resting Idle Mode — ONLY EYES VISIBLE, REST COMPLETELY HIDDEN */
          <motion.div
            key="eyes-only"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center w-full h-full"
            title="NOVA Smart Notch (Hover or click to expand)"
          >
            <VayllEye size="md" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
