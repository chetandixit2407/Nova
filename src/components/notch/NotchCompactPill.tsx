import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Download,
  Disc3,
  Coffee,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Bell,
  Cpu,
  Sun,
  Music2
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';
import {
  windowActivityService,
  DynamicActivity,
  WindowsApp
} from '../../services/windowActivityService';
import { soundService } from '../../services/soundService';
import { VayllEye } from './VayllEye';
import { AppIconBadge } from './AppIconBadge';

export const NotchCompactPill: React.FC = () => {
  const {
    toggleExpand,
    tasks,
    showLiveActivities,
    pomodoroSeconds,
    isPomodoroRunning,
    notifications,
    weather
  } = useNotch();

  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [foregroundApp, setForegroundApp] = useState<WindowsApp | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(4));
  const [cpuUsage, setCpuUsage] = useState<number>(59);

  // Subscribe to Windows Activity Service
  useEffect(() => {
    const unsubActivities = windowActivityService.subscribeActivities((acts) => {
      setActivities(acts);
    });

    const unsubForeground = windowActivityService.subscribeForeground((app) => {
      setForegroundApp(app);
    });

    return () => {
      unsubActivities();
      unsubForeground();
    };
  }, []);

  // Audio subscribe
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsAudioPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
    });
    return unsub;
  }, []);

  // Audio frequency visualization
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (audioEngine.getIsPlaying()) {
        const full = audioEngine.getFrequencies();
        const mini = new Uint8Array([full[2] || 0, full[5] || 0, full[8] || 0, full[12] || 0]);
        setFrequencies(mini);
      } else {
        setFrequencies(new Uint8Array(4));
      }
      animId = requestAnimationFrame(updateFreqs);
    };
    animId = requestAnimationFrame(updateFreqs);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Live CPU telemetry jitter
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => {
        const base = isAudioPlaying ? 61 : 57;
        const delta = Math.floor((Math.random() - 0.48) * 4);
        return Math.min(88, Math.max(38, base + delta));
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [isAudioPlaying]);

  const activeTasksList = tasks.filter((t) => t.status === 'running');
  const primaryTask =
    activeTasksList[0] || {
      id: 'task-vscode-dl',
      title: 'Downloading VS Code v1.95 (x64)',
      progress: 67
    };
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const isPomodoroActive = isPomodoroRunning && pomodoroSeconds > 0;

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={toggleExpand}
      className="w-full h-full flex items-center justify-between px-3 cursor-pointer select-none text-white overflow-hidden group"
      title="NOVA Dynamic Notch • Hover or click to expand"
    >
      {/* 1. LEFT ZONE: MEDIA OR VAYLL IRIS */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        {isAudioPlaying ? (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
              <Disc3 className="w-3 h-3 text-sky-400 animate-[spin_4s_linear_infinite]" />
            </div>
            {/* Equalizer frequency bars */}
            <div className="flex items-end gap-0.5 h-3 px-0.5">
              <span
                className="w-0.5 bg-sky-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(2, (frequencies[0] / 255) * 12)}px` }}
              />
              <span
                className="w-0.5 bg-cyan-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(2, (frequencies[1] / 255) * 12)}px` }}
              />
              <span
                className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(2, (frequencies[2] / 255) * 12)}px` }}
              />
            </div>
            <span className="text-[11px] font-mono font-medium text-sky-300 truncate max-w-[90px]">
              {currentTrack.title}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <VayllEye size="xs" />
            <span className="text-[11px] font-bold text-white tracking-tight">NOVA</span>
          </div>
        )}
      </div>

      {/* 2. CENTER ZONE: LIVE ACTIVITY / FOCUS TIMER */}
      <div className="flex items-center justify-center gap-2 px-2 min-w-0 flex-1">
        {primaryTask ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 max-w-[160px] truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
            <span className="text-[10px] font-semibold text-slate-200 truncate">
              {primaryTask.title.replace('Downloading ', '')}
            </span>
            <span className="text-[10px] font-mono font-bold text-sky-400 shrink-0">
              {primaryTask.progress}%
            </span>
          </div>
        ) : isPomodoroActive ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
            <Coffee className="w-3 h-3" />
            <span>{formatSecs(pomodoroSeconds)}</span>
          </div>
        ) : foregroundApp ? (
          <div className="flex items-center gap-1.5 truncate">
            <AppIconBadge name={foregroundApp.name} size="xs" />
            <span className="text-[11px] text-slate-300 truncate">{foregroundApp.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ready</span>
          </div>
        )}
      </div>

      {/* 3. RIGHT ZONE: CPU / WEATHER / NOTIFICATIONS */}
      <div className="flex items-center gap-2 shrink-0">
        {/* CPU % */}
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-300">
          <span className="text-slate-400">CPU</span>
          <span className="font-bold text-white">{cpuUsage}%</span>
        </div>

        {/* Weather */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
          <span className="text-amber-400">☀️</span>
          <span>{weather ? Math.round(((weather.temp - 32) * 5) / 9) : 7}°</span>
        </div>

        {/* Notification Bell Badge */}
        <div className="flex items-center gap-1">
          <Bell className="w-3 h-3 text-sky-400" />
          {unreadNotifs.length > 0 && (
            <span className="text-[9px] font-mono font-bold text-white bg-sky-500 rounded-full px-1 leading-tight">
              {unreadNotifs.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
