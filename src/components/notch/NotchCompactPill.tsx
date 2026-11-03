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
  Minimize2
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
    isPomodoroRunning
  } = useNotch();

  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [foregroundApp, setForegroundApp] = useState<WindowsApp | null>(null);
  const [launchEvent, setLaunchEvent] = useState<{
    app: WindowsApp;
    stage: 'pop' | 'compact' | 'expanded';
  } | null>(null);

  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(4));

  // Subscribe to Windows Activity Service
  useEffect(() => {
    const unsubActivities = windowActivityService.subscribeActivities((acts) => {
      setActivities(acts);
    });

    const unsubForeground = windowActivityService.subscribeForeground((app) => {
      setForegroundApp(app);
    });

    const unsubLaunch = windowActivityService.subscribeLaunchEvents((event) => {
      setLaunchEvent(event);
      soundService.playPop();

      if (event.stage === 'expanded') {
        window.setTimeout(() => {
          setLaunchEvent((prev) => (prev?.app.id === event.app.id ? null : prev));
        }, 2800);
      }
    });

    return () => {
      unsubActivities();
      unsubForeground();
      unsubLaunch();
    };
  }, []);

  // Sync tasks
  useEffect(() => {
    tasks.forEach((t) => {
      windowActivityService.syncTaskActivity({
        id: t.id,
        title: t.title,
        type: t.type === 'download' ? 'download' : 'install',
        progress: t.progress,
        status: t.status,
        speed: t.speed,
        detail: t.detail,
        icon: t.icon
      });
    });
  }, [tasks]);

  // Audio subscribe
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsAudioPlaying(audioEngine.getIsPlaying());
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
      }
      animId = requestAnimationFrame(updateFreqs);
    };
    animId = requestAnimationFrame(updateFreqs);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Active activities computation
  const activeTasksList = activities.filter((a) => a.status === 'active' || a.status === 'launching');
  const completingActivity = activities.find((a) => a.status === 'completing');

  const isPomodoroActive = isPomodoroRunning && pomodoroSeconds > 0;
  const totalActiveCount =
    activeTasksList.length + (isAudioPlaying ? 1 : 0) + (isPomodoroActive ? 1 : 0);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={toggleExpand}
      className="w-full h-full flex items-center justify-center cursor-pointer select-none px-2 relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* 1. COMPLETION SUCCESS ANIMATION WITH GLOWING CHECKMARK         */}
        {/* ============================================================== */}
        {completingActivity ? (
          <motion.div
            key={`completion-${completingActivity.id}`}
            initial={{ opacity: 0, scale: 0.88, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="w-full flex items-center justify-between gap-2 px-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight truncate max-w-[130px]">
                {completingActivity.title}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {completingActivity.subtitle || 'Ready'}
            </span>
          </motion.div>
        ) : launchEvent && launchEvent.stage === 'pop' ? (
          /* ============================================================== */
          /* 2. IPHONE LAUNCH SEQUENCE — STAGE 1: APP ICON POP              */
          /* ============================================================== */
          <motion.div
            key={`launch-pop-${launchEvent.app.id}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [0.7, 1.25, 1.0] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 540, damping: 22 }}
            className="flex items-center justify-center w-full h-full"
            title={`Launching ${launchEvent.app.name}...`}
          >
            <AppIconBadge name={launchEvent.app.name} size="md" glow={true} />
          </motion.div>
        ) : launchEvent && launchEvent.stage === 'compact' ? (
          /* ============================================================== */
          /* 3. IPHONE LAUNCH SEQUENCE — STAGE 2: COMPACT PILL MORPH       */
          /* ============================================================== */
          <motion.div
            key={`launch-compact-${launchEvent.app.id}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 480, damping: 26 }}
            className="w-full flex items-center justify-between gap-2 px-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AppIconBadge name={launchEvent.app.name} size="xs" glow={true} />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-white tracking-tight truncate max-w-[110px]">
                  {launchEvent.app.name}
                </span>
                <span className="text-[10px] font-mono text-sky-400">Launching...</span>
              </div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full border border-sky-400/40 border-t-sky-400 animate-spin shrink-0" />
          </motion.div>
        ) : launchEvent && launchEvent.stage === 'expanded' ? (
          /* ============================================================== */
          /* 4. IPHONE LAUNCH SEQUENCE — STAGE 3: EXPANDED ACTIVITY CARD   */
          /* ============================================================== */
          <motion.div
            key={`launch-expanded-${launchEvent.app.id}`}
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ type: 'spring', stiffness: 460, damping: 26 }}
            className="w-full h-full flex flex-col justify-between p-2 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Row: App Icon + App Name + Live Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <AppIconBadge name={launchEvent.app.name} size="sm" glow={true} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-tight truncate">
                    {launchEvent.app.name}
                  </h4>
                  <p className="text-[10px] font-mono text-emerald-400 leading-tight">
                    Active in Foreground
                  </p>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-mono font-bold text-emerald-300">
                READY
              </div>
            </div>

            {/* Middle: Window Preview & Process Telemetry */}
            <div className="text-[11px] font-mono text-slate-300 truncate bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              {launchEvent.app.windowTitle}
            </div>

            {/* Bottom: Quick Actions */}
            <div className="flex items-center justify-between pt-0.5 text-[10px]">
              <span className="text-slate-400 font-mono">
                {launchEvent.app.cpuPercent}% CPU · {launchEvent.app.memoryMB} MB
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    windowActivityService.focusApp(launchEvent.app.id);
                    setLaunchEvent(null);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Focus</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => setLaunchEvent(null)}
                  className="px-2 py-0.5 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        ) : showLiveActivities && totalActiveCount >= 2 ? (
          /* ============================================================== */
          /* 5. MULTIPLE CONCURRENT ACTIVITIES: IPHONE SPLIT DYNAMIC ISLAND */
          /* ============================================================== */
          <motion.div
            key="split-island"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12 }}
            className="w-full flex items-center justify-between gap-2 px-1"
          >
            {/* Left Chamber: Primary task or Audio */}
            <div className="flex items-center gap-2 min-w-0">
              {isAudioPlaying ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <Disc3 className="w-3 h-3 text-sky-400 animate-[spin_4s_linear_infinite]" />
                  </div>
                  {/* Audio Equalizer bars */}
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
                  <span className="text-[10px] font-mono text-sky-300 truncate max-w-[95px]">
                    {audioEngine.getCurrentTrack().title}
                  </span>
                </div>
              ) : activeTasksList[0] ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <AppIconBadge name={activeTasksList[0].title} size="xs" glow={false} />
                  <span className="text-[11px] font-semibold text-white truncate max-w-[100px]">
                    {activeTasksList[0].title}
                  </span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">
                    {activeTasksList[0].progress}%
                  </span>
                </div>
              ) : null}
            </div>

            {/* Right Chamber / Secondary Mini-Island Bubble */}
            <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l border-white/10">
              {isPomodoroActive ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  <Coffee className="w-2.5 h-2.5" />
                  <span>{formatSecs(pomodoroSeconds)}</span>
                </div>
              ) : activeTasksList.length > 1 ? (
                <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
                  <Download className="w-3 h-3 text-cyan-400 animate-bounce" />
                  <span>{activeTasksList[1].progress}%</span>
                </div>
              ) : (
                <VayllEye size="xs" />
              )}
            </div>
          </motion.div>
        ) : showLiveActivities && (totalActiveCount === 1 || Boolean(foregroundApp)) ? (
          /* ============================================================== */
          /* 6. SINGLE ACTIVITY COMPACT PILL                                */
          /* ============================================================== */
          <motion.div
            key="single-activity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="w-full flex items-center justify-between gap-2 px-1"
          >
            {isAudioPlaying ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
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
                  <span className="text-[11px] font-mono text-sky-300 truncate max-w-[130px]">
                    {audioEngine.getCurrentTrack().title}
                  </span>
                </div>
                <VayllEye size="xs" />
              </div>
            ) : activeTasksList[0] ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <AppIconBadge name={activeTasksList[0].title} size="xs" glow={true} />
                  <span className="text-[11px] font-semibold text-white truncate max-w-[120px]">
                    {activeTasksList[0].title}
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400 font-bold">
                    {activeTasksList[0].progress}%
                  </span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full border border-sky-400/40 border-t-sky-400 animate-spin" />
              </div>
            ) : foregroundApp ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <AppIconBadge name={foregroundApp.name} size="xs" glow={false} />
                  <span className="text-[11px] font-semibold text-white truncate max-w-[140px]">
                    {foregroundApp.name}
                  </span>
                </div>
                <VayllEye size="xs" />
              </div>
            ) : (
              <VayllEye size="sm" />
            )}
          </motion.div>
        ) : (
          /* ============================================================== */
          /* 7. IDLE RESTING CAPSULE — PURE VAYLL IRIS WITH BLINK ANIMATION */
          /* ============================================================== */
          <motion.div
            key="idle-resting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="flex items-center justify-center w-full h-full"
            title="NOVA Dynamic Notch (Hover or click to expand)"
          >
            <VayllEye size="md" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
