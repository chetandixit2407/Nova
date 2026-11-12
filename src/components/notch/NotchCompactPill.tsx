import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Music,
  Download,
  Battery,
  BatteryCharging,
  Cpu,
  Clock,
  CloudSun,
  ShieldAlert
} from 'lucide-react';
import { VayllEye } from './VayllEye';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';

/**
 * Windows Dynamic Island Compact Pill:
 * Features live contextual activities (music waveforms, download task progress,
 * green camera / orange mic privacy indicators, desktop/laptop system telemetry,
 * or minimal Vayll eyes), plus double-click to shrink to a slim edge line.
 */
export const NotchCompactPill: React.FC = () => {
  const {
    config,
    tasks,
    systemStatus,
    weather,
    isPrivacyCameraActive,
    isPrivacyMicrophoneActive,
    privacyCameraApp,
    privacyMicrophoneApp,
    toggleSlimLine
  } = useNotch();

  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [frequencies, setFrequencies] = useState<number[]>([12, 28, 42, 20]);

  // Subscribe to audio engine
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
    });
    return unsub;
  }, []);

  // Equalizer animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrequencies([
        Math.floor(8 + Math.random() * 24),
        Math.floor(12 + Math.random() * 32),
        Math.floor(16 + Math.random() * 38),
        Math.floor(10 + Math.random() * 26)
      ]);
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeRunningTask = tasks.find((t) => t.status === 'running');
  const closedMode = config.closedNotchDisplay || 'auto';

  // Determine what to render based on user preference and live activity
  const renderContent = () => {
    // 1. If music is actively playing and mode is auto or music
    if (isPlaying && (closedMode === 'auto' || closedMode === 'music')) {
      return (
        <div className="flex items-center justify-between w-full px-3 gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shrink-0 shadow-sm">
              <Music className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[11px] font-semibold text-white truncate max-w-[130px]">
                {currentTrack.title}
              </span>
              <span className="text-[9px] text-slate-400 truncate max-w-[130px]">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          {/* Animated Equalizer Wave Bars */}
          <div className="flex items-end gap-0.5 h-3.5 shrink-0 px-1">
            {frequencies.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${Math.max(3, h * 0.35)}px` }}
                transition={{ duration: 0.1 }}
                className="w-0.5 bg-gradient-to-t from-pink-500 to-rose-400 rounded-full"
              />
            ))}
          </div>
        </div>
      );
    }

    // 2. If an active task / download is executing
    if (activeRunningTask && closedMode === 'auto') {
      return (
        <div className="flex items-center justify-between w-full px-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-bounce" />
            <span className="text-[11px] font-medium text-slate-200 truncate max-w-[130px]">
              {activeRunningTask.title}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
            {activeRunningTask.progress}%
          </span>
        </div>
      );
    }

    // 3. User requested Battery (Laptops)
    if (closedMode === 'battery') {
      return (
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-200">
          {systemStatus.isCharging ? (
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          ) : (
            <Battery className="w-4 h-4 text-slate-300" />
          )}
          <span className="font-bold">{systemStatus.batteryLevel}%</span>
          <span className="text-[10px] text-slate-400">
            {systemStatus.isCharging ? 'Charging' : 'Battery'}
          </span>
        </div>
      );
    }

    // 4. User requested CPU & RAM (Desktops)
    if (closedMode === 'cpu_ram') {
      return (
        <div className="flex items-center justify-center gap-3 text-xs font-mono text-slate-200">
          <div className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] font-bold">58% CPU</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-emerald-400">64% RAM</span>
          </div>
        </div>
      );
    }

    // 5. User requested Clock & Weather
    if (closedMode === 'clock_weather') {
      return (
        <div className="flex items-center justify-center gap-2.5 text-xs text-slate-200">
          <div className="flex items-center gap-1 font-mono font-semibold">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-300">{weather?.temp ?? 72}°F</span>
          </div>
        </div>
      );
    }

    // 6. Default: Minimal Vayll interactive companion eyes
    return <VayllEye size="md" interactive={true} />;
  };

  return (
    <div
      onDoubleClick={toggleSlimLine}
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden cursor-default px-1"
      title="NOVA Smart Notch • Hover to open • Double-click to shrink into slim edge line"
    >
      {/* Privacy Indicators: Green for Camera, Orange for Microphone */}
      {(isPrivacyCameraActive || isPrivacyMicrophoneActive) && (
        <div className="absolute left-2.5 flex items-center gap-1.5 z-20">
          {isPrivacyCameraActive && (
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
              title={`Camera in use by ${privacyCameraApp}`}
            />
          )}
          {isPrivacyMicrophoneActive && (
            <span
              className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse"
              title={`Microphone in use by ${privacyMicrophoneApp}`}
            />
          )}
        </div>
      )}

      {/* Main Contextual or Minimal Content */}
      {renderContent()}

      {/* Subtle Right Side Double-Click Hint Dot */}
      <div className="absolute right-2.5 w-1 h-1 rounded-full bg-white/20 pointer-events-none" />
    </div>
  );
};
