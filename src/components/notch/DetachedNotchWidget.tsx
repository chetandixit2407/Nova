import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Pin,
  PinOff,
  Move,
  Play,
  Pause,
  SkipForward,
  Wifi,
  Cpu,
  Clock,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Dock
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';
import { lyricsService } from '../../services/lyricsService';
import { aiAgentService } from '../../services/aiAgentService';
import { soundService } from '../../services/soundService';

interface DetachedNotchWidgetProps {
  onDockBack: () => void;
  onOpenFullscreenMusic?: () => void;
}

export const DetachedNotchWidget: React.FC<DetachedNotchWidgetProps> = ({
  onDockBack,
  onOpenFullscreenMusic
}) => {
  const { pomodoroSeconds, isPomodoroRunning, startPomodoro, pausePomodoro } = useNotch();

  // Widget state
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState<number>(audioEngine.getCurrentTime());
  const [cpuUsage, setCpuUsage] = useState<number>(58);
  const [ramUsage, setRamUsage] = useState<number>(69);
  const [downSpeed, setDownSpeed] = useState<string>('1.2 MB/s');
  const [upSpeed, setUpSpeed] = useState<string>('240 KB/s');
  const [isPinned, setIsPinned] = useState<boolean>(true);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  // AI agents
  const [agents, setAgents] = useState(aiAgentService.getAgents());

  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });

    const unsubAgents = aiAgentService.subscribe(() => {
      setAgents(aiAgentService.getAgents());
    });

    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.min(95, Math.max(12, prev + (Math.random() * 8 - 4))));
      setRamUsage((prev) => Math.min(92, Math.max(35, prev + (Math.random() * 4 - 2))));
    }, 2000);

    return () => {
      unsubAudio();
      unsubAgents();
      clearInterval(interval);
    };
  }, []);

  const lyrics = lyricsService.getLyricsForTrack(currentTrack.id);
  const activeLyricIndex = lyricsService.getCurrentLineIndex(lyrics, currentTime);
  const currentLyricLine = lyrics[activeLyricIndex]?.text || 'No lyrics at current timestamp';

  const formatPomodoro = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeAgent = agents.find((a) => a.status === 'executing' || a.status === 'waiting_approval') || agents[0];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 40 }}
      className={`fixed top-24 right-12 z-50 rounded-2xl bg-[#090d16]/92 border border-white/20 shadow-2xl backdrop-blur-2xl text-white select-none overflow-hidden transition-all duration-200 ${
        isCompact ? 'w-80' : 'w-96'
      }`}
      style={{
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.8), 0 0 25px -4px rgba(56, 189, 248, 0.25)'
      }}
    >
      {/* Top Drag Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02] cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            Detached Screen
          </span>
          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-medium">
            PRO
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            title={isCompact ? 'Expand' : 'Compact'}
          >
            {isCompact ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsPinned(!isPinned)}
            className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
            title="Always on Top"
          >
            {isPinned ? <Pin className="w-3.5 h-3.5 text-sky-400" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              soundService.play('notch_collapse');
              onDockBack();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-medium text-slate-200 transition"
            title="Re-dock into Dynamic Island"
          >
            <Dock className="w-3.5 h-3.5 text-sky-400" />
            <span>Dock</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4">
        {/* Music Player & Synced Lyric Snippet */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentTrack.title}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => audioEngine.togglePlay()}
                className="w-8 h-8 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => audioEngine.nextTrack()}
                className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              {onOpenFullscreenMusic && (
                <button
                  onClick={onOpenFullscreenMusic}
                  className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300"
                  title="Fullscreen Room"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                </button>
              )}
            </div>
          </div>

          {/* Real-time Synced Lyric Line */}
          <div className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-sky-200/90 italic truncate">
            "{currentLyricLine}"
          </div>
        </div>

        {/* Focus Timer & Network Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Focus Timer */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Focus
              </span>
              <span className="text-[10px] text-slate-400">25m</span>
            </div>
            <div className="my-1.5 text-lg font-mono font-bold text-white tracking-wider">
              {formatPomodoro(pomodoroSeconds)}
            </div>
            <button
              onClick={() => (isPomodoroRunning ? pausePomodoro() : startPomodoro())}
              className="w-full py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium text-slate-200 transition"
            >
              {isPomodoroRunning ? 'Pause' : 'Start'}
            </button>
          </div>

          {/* Network Live Speeds */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                Network
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">↓ Down</span>
                <span className="font-mono text-slate-200">{downSpeed}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">↑ Up</span>
                <span className="font-mono text-slate-200">{upSpeed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Telemetry Bar */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Hardware Telemetry
            </span>
            <span className="text-[10px] text-slate-400">Windows 11 Live</span>
          </div>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>CPU Load</span>
                <span className="font-mono">{Math.round(cpuUsage)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>RAM Usage</span>
                <span className="font-mono">{Math.round(ramUsage)}% (11.5 / 16 GB)</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${ramUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Status & Usage (Notchy) */}
        {!isCompact && (
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                {activeAgent.name}
              </span>
              <span className="text-[10px] font-mono text-violet-300">
                {activeAgent.usage.used} / {activeAgent.usage.limit} {activeAgent.usage.unit}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">
              {activeAgent.activeTask}
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              {activeAgent.usage.resetTimeStr}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
