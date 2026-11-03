import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Globe,
  MessageSquare,
  Terminal,
  Bell,
  Sliders
} from 'lucide-react';
import { volumeMixerService } from '../../services/volumeMixerService';
import { AppVolumeSession } from '../../types';

interface VolumeMixerModalProps {
  onClose: () => void;
}

export const VolumeMixerModal: React.FC<VolumeMixerModalProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<AppVolumeSession[]>(volumeMixerService.getSessions());

  useEffect(() => {
    const unsub = volumeMixerService.subscribe(() => {
      setSessions(volumeMixerService.getSessions());
    });
    return unsub;
  }, []);

  const getSessionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music':
        return <Music className="w-4 h-4 text-pink-400" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'Bell':
        return <Bell className="w-4 h-4 text-amber-400" />;
      default:
        return <Volume2 className="w-4 h-4 text-slate-300" />;
    }
  };

  const allMuted = sessions.every((s) => s.isMuted);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="p-5 w-full flex flex-col space-y-4 text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            Windows Volume Mixer
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              PRO
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Per-application volume control & active audio session muting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => volumeMixerService.muteAll()}
            className={`px-3 py-1 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
              allMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
            }`}
          >
            {allMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{allMuted ? 'Unmute All' : 'Mute All Sessions'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-44 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                {getSessionIcon(session.icon)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-slate-200 truncate">{session.appName}</div>
                <div className="text-[10px] text-slate-400">
                  {session.isMuted ? 'Muted' : `${session.volume}% active`}
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={session.isMuted ? 0 : session.volume}
                onChange={(e) => volumeMixerService.setVolume(session.id, parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-xs font-mono text-slate-400 w-8 text-right">
                {session.isMuted ? '0%' : `${session.volume}%`}
              </span>
            </div>

            {/* Mute button */}
            <button
              onClick={() => volumeMixerService.toggleMute(session.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                session.isMuted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {session.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
