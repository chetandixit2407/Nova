import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutGrid,
  Music2,
  Sliders,
  Bluetooth,
  ClipboardList,
  Coffee,
  CloudSun,
  Activity,
  Sparkles,
  Pin,
  PinOff,
  Settings,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Sun,
  Disc3,
  Radio,
  Scissors,
  Calculator as CalculatorIcon,
  TrendingUp,
  Bell,
  Wifi,
  ExternalLink,
  RotateCw,
  Check,
  Copy,
  Download,
  ShieldCheck,
  FileCheck,
  Cpu,
  HardDrive,
  EyeOff,
  Move,
  Layers,
  FileUp,
  Headphones,
  Speaker,
  Maximize2,
  Bot,
  Folder
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine, PLAYLIST } from '../../services/audioEngine';
import { systemService } from '../../services/systemService';
import { soundService } from '../../services/soundService';
import { lyricsService } from '../../services/lyricsService';
import { audioDeviceService } from '../../services/audioDeviceService';
import { VayllEye } from './VayllEye';
import { GlassCalculator } from './GlassCalculator';
import { BatteryHealth } from './BatteryHealth';
import { NotchAIHubTab } from './NotchAIHubTab';
import { NotchNotificationsTab } from './NotchNotificationsTab';
import { NotchSettingsTab } from './NotchSettingsTab';
import { AppIconBadge } from './AppIconBadge';
import { AIAgentProModal } from './AIAgentProModal';
import { DropShelfModal } from './DropShelfModal';
import { ClipboardProModal } from './ClipboardProModal';
import { QuickAppsBarModal } from './QuickAppsBarModal';
import { VolumeMixerModal } from './VolumeMixerModal';
import { MicrosoftStoreModal } from './MicrosoftStoreModal';
import { windowActivityService, DynamicActivity, WindowsApp } from '../../services/windowActivityService';

export type ExpandedSubView =
  | 'none'
  | 'calculator'
  | 'system_monitor'
  | 'media_playlist'
  | 'focus_presets'
  | 'notifications'
  | 'app_launcher'
  | 'bluetooth'
  | 'clipboard'
  | 'brightness_volume'
  | 'weather_details'
  | 'activities'
  | 'settings'
  | 'ai_agents'
  | 'drop_shelf'
  | 'clipboard_pro'
  | 'quick_apps'
  | 'volume_mixer'
  | 'ms_store';

export const NotchExpandedDashboard: React.FC = () => {
  const {
    isPinned,
    togglePin,
    collapseNotch,
    systemStatus,
    weather,
    refreshWeather,
    notifications,
    clipboardHistory,
    copyText,
    readSystemClipboard,
    clearClipboard,
    pomodoroSeconds,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tasks,
    showToast,
    triggerTestNotification,
    invisibilityCloakActive,
    toggleInvisibilityCloak,
    toggleDetached,
    dropShelfFiles,
    addDropShelfFiles,
    removeDropShelfFile,
    clearDropShelf,
    setIsFullscreenMusicOpen
  } = useNotch();

  // Active sub-view drawer
  const [subView, setSubView] = useState<ExpandedSubView>('none');

  // Media Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(audioEngine.getCurrentTime());
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);
  const [masterVolume, setMasterVolume] = useState<number>(50);
  const [displayBrightness, setDisplayBrightness] = useState<number>(90);

  // Live Telemetry Simulation with Real-world Baseline
  const [cpuUsage, setCpuUsage] = useState<number>(62);
  const [ramUsage, setRamUsage] = useState<number>(72);
  const [downSpeed, setDownSpeed] = useState<string>('782 B/s');
  const [upSpeed, setUpSpeed] = useState<string>('0 B/s');
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);

  // Bluetooth connected devices mock state
  const [bluetoothActive, setBluetoothActive] = useState<boolean>(true);
  const [btDevices, setBtDevices] = useState([
    { name: 'Sony WH-1000XM5', type: 'Headphones', connected: true, battery: 85 },
    { name: 'Logitech MX Master 3S', type: 'Mouse', connected: true, battery: 90 },
    { name: 'Keychron Q1 Pro', type: 'Keyboard', connected: true, battery: 74 }
  ]);

  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [foregroundApp, setForegroundApp] = useState<WindowsApp | null>(null);

  // Subscribe to Windows Activity Service
  useEffect(() => {
    const unsubActs = windowActivityService.subscribeActivities((acts) => {
      setActivities(acts);
    });
    const unsubFg = windowActivityService.subscribeForeground((app) => {
      setForegroundApp(app);
    });
    return () => {
      unsubActs();
      unsubFg();
    };
  }, []);

  // Subscribe to Audio Engine
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });
    return unsub;
  }, []);

  // Audio frequency pulse
  useEffect(() => {
    let animId: number;
    const checkAudio = () => {
      if (isPlaying) {
        const freqs = audioEngine.getFrequencies();
        let sum = 0;
        const bands = Math.min(10, freqs.length);
        for (let i = 0; i < bands; i++) {
          sum += freqs[i];
        }
        setAudioAmplitude(sum / bands);
      } else {
        setAudioAmplitude((prev) => Math.max(0, prev - 4));
      }
      animId = requestAnimationFrame(checkAudio);
    };
    animId = requestAnimationFrame(checkAudio);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Live dynamic fluctuation for CPU, RAM, and Network
  useEffect(() => {
    const timer = setInterval(() => {
      // Natural jitter for CPU
      setCpuUsage((prev) => {
        const base = isPlaying ? 64 : 58;
        const delta = Math.floor((Math.random() - 0.48) * 8);
        return Math.min(94, Math.max(38, base + delta));
      });

      // Natural jitter for RAM
      setRamUsage((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 3);
        return Math.min(88, Math.max(65, prev + delta));
      });

      // Realistic Network packet fluctuation
      const isDL = Math.random() > 0.3;
      if (isDL) {
        const dlBytes = Math.floor(Math.random() * 950 + 200);
        if (dlBytes > 800) {
          const kb = (Math.random() * 2.8 + 1.2).toFixed(1);
          setDownSpeed(`${kb} KB/s`);
        } else {
          setDownSpeed(`${dlBytes} B/s`);
        }
      } else {
        setDownSpeed('140 B/s');
      }

      const isUL = Math.random() > 0.65;
      if (isUL) {
        const ulBytes = Math.floor(Math.random() * 450 + 50);
        setUpSpeed(`${ulBytes} B/s`);
      } else {
        setUpSpeed('0 B/s');
      }
    }, 1800);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCaptureScreen = async () => {
    soundService.playTick();
    showToast({
      appName: 'Windows Snipping Tool',
      title: 'Capturing Display...',
      message: 'Select the screen or window to capture.',
      icon: 'Scissors',
      duration: 2000
    });
    const result = await systemService.captureScreen();
    if (result) {
      soundService.playSuccess();
      showToast({
        appName: 'Windows Snipping Tool',
        title: 'Screenshot Captured',
        message: `Saved ${result.filename} to Downloads.`,
        icon: 'Scissors',
        actionLabel: 'Open',
        duration: 3500
      });
    }
  };

  const handleCopyClipboard = async (id: string, text: string) => {
    await copyText(text);
    setCopiedClipId(id);
    setTimeout(() => setCopiedClipId(null), 1800);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const latestNotification = notifications[0] || {
    title: 'Windows Security',
    message: 'System running smoothly. No threats detected.'
  };

  // Battery percentage and ring calculation
  const batteryPct = systemStatus.batteryLevel ?? 74;
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (batteryPct / 100) * circumference;

  return (
    <div className="w-full text-slate-100 select-none">
      {/* 1. TOP TOOLBAR — Exactly inspired by the reference screenshot */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
        {/* Left Toolbar Pill Container */}
        <div className="flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-xl px-1.5 py-1 overflow-x-auto max-w-[62%] scrollbar-none">
          {/* 1. Apps / Launcher */}
          <button
            onClick={() => setSubView(subView === 'app_launcher' ? 'none' : 'app_launcher')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'app_launcher'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="App Launcher & AI Hub"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* 2. Quick Apps Bar (Pro) */}
          <button
            onClick={() => setSubView(subView === 'quick_apps' ? 'none' : 'quick_apps')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'quick_apps'
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Quick Apps Bar (5 Customizable Slots)"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* 3. Notchy AI Agent Hub & Usage (Pro) */}
          <button
            onClick={() => setSubView(subView === 'ai_agents' ? 'none' : 'ai_agents')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'ai_agents'
                ? 'bg-violet-500/25 text-violet-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Notchy — AI Agents & Usage Monitor"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>

          {/* 4. Drop Shelf (Pro) */}
          <button
            onClick={() => setSubView(subView === 'drop_shelf' ? 'none' : 'drop_shelf')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 relative ${
              subView === 'drop_shelf' || dropShelfFiles.length > 0
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Drop Shelf (Temporary file holding & Explorer reveal)"
          >
            <FileUp className="w-3.5 h-3.5" />
            {dropShelfFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* 5. Music */}
          <button
            onClick={() => setSubView(subView === 'media_playlist' ? 'none' : 'media_playlist')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'media_playlist' || isPlaying
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Ambient Music Synthesizer & Playlist"
          >
            <Music2 className="w-3.5 h-3.5" />
          </button>

          {/* 6. Volume Mixer (Pro) */}
          <button
            onClick={() => setSubView(subView === 'volume_mixer' ? 'none' : 'volume_mixer')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'volume_mixer'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Windows Per-App Volume Mixer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* 7. Bluetooth */}
          <button
            onClick={() => setSubView(subView === 'bluetooth' ? 'none' : 'bluetooth')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'bluetooth'
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Bluetooth Devices"
          >
            <Bluetooth className="w-3.5 h-3.5" />
          </button>

          {/* 8. Clipboard Pro */}
          <button
            onClick={() => setSubView(subView === 'clipboard_pro' ? 'none' : 'clipboard_pro')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'clipboard_pro'
                ? 'bg-violet-500/20 text-violet-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Clipboard Pro (Pinned Snippets, Image Previews & Smart Actions)"
          >
            <ClipboardList className="w-3.5 h-3.5" />
          </button>

          {/* 9. Focus / Coffee */}
          <button
            onClick={() => setSubView(subView === 'focus_presets' ? 'none' : 'focus_presets')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'focus_presets' || isPomodoroRunning
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Focus & Pomodoro Timer"
          >
            <Coffee className="w-3.5 h-3.5" />
          </button>

          {/* 10. Weather / Sun */}
          <button
            onClick={() => setSubView(subView === 'weather_details' ? 'none' : 'weather_details')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'weather_details'
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Live Weather Forecast"
          >
            <CloudSun className="w-3.5 h-3.5" />
          </button>

          {/* 11. Activity / Pulse */}
          <button
            onClick={() => setSubView(subView === 'activities' ? 'none' : 'activities')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${
              subView === 'activities'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Live Tasks & System Activities"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Status Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pro Action 1: Invisibility Cloak Toggle */}
          <button
            onClick={toggleInvisibilityCloak}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              invisibilityCloakActive
                ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Invisibility Cloak (Ctrl+Alt+H)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {/* Pro Action 2: Detach to Desktop Screen */}
          <button
            onClick={toggleDetached}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Detach Notch to Floating Desktop Screen"
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {/* Subtle VayllEye blink animation */}
          <div className="hidden sm:flex items-center px-0.5" title="NOVA Dynamic Iris">
            <VayllEye size="xs" />
          </div>

          {/* PRO Badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>PRO</span>
          </div>

          {/* Microsoft Store MSIX Center */}
          <button
            onClick={() => setSubView(subView === 'ms_store' ? 'none' : 'ms_store')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold transition-all cursor-pointer ${
              subView === 'ms_store'
                ? 'bg-sky-500/25 border-sky-400 text-sky-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Microsoft Store MSIX Packaging & WACK Certification Center"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">MS STORE</span>
          </button>

          {/* Weather Temperature */}
          <button
            onClick={refreshWeather}
            className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Click to refresh weather"
          >
            <span className="text-amber-400">☀️</span>
            <span>{weather ? Math.round(((weather.temp - 32) * 5) / 9) : 28}°C</span>
          </button>

          {/* Circular Battery Ring Gauge */}
          <div
            className="flex items-center gap-1.5 text-xs font-mono text-slate-300 cursor-pointer"
            onClick={() => setSubView(subView === 'system_monitor' ? 'none' : 'system_monitor')}
            title={`Battery: ${batteryPct}% ${systemStatus.isCharging ? '(Charging)' : ''}`}
          >
            <span>{batteryPct}%</span>
            <div className="relative w-4 h-4 flex items-center justify-center">
              <svg className="w-4 h-4 -rotate-90" viewBox="0 0 18 18">
                <circle
                  cx="9"
                  cy="9"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white/15"
                />
                <circle
                  cx="9"
                  cy="9"
                  r={radius}
                  fill="none"
                  stroke={systemStatus.isCharging ? '#38bdf8' : '#ffffff'}
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {systemStatus.isCharging && (
                <span className="absolute w-1 h-1 rounded-full bg-sky-400 animate-ping" />
              )}
            </div>
          </div>

          {/* Pin Button */}
          <button
            onClick={togglePin}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isPinned
                ? 'bg-sky-500/20 text-sky-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isPinned ? 'Unpin Notch (auto-collapse)' : 'Pin Notch open'}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5 fill-sky-300" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setSubView(subView === 'settings' ? 'none' : 'settings')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              subView === 'settings'
                ? 'bg-white/20 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Notch Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            onClick={collapseNotch}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Collapse Notch (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="p-3.5 max-h-[calc(84vh-56px)] overflow-y-auto overscroll-contain">
        <AnimatePresence mode="wait">
          {subView === 'none' ? (
            /* DEFAULT 2-COLUMN DASHBOARD (Exact reference layout) */
            <motion.div
              key="main-dashboard"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.14 }}
              className="space-y-3"
            >
              {/* LIVE ACTIVITIES STACKED CAROUSEL BAR (Shows when apps or tasks are active) */}
              {activities.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                    Live ({activities.length})
                  </span>
                  {activities.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => {
                        if (act.appId && act.appId !== 'system') {
                          windowActivityService.focusApp(act.appId);
                        }
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs transition-all cursor-pointer shrink-0 ${
                        act.isForeground
                          ? 'bg-sky-500/20 border-sky-400/50 text-white shadow-sm ring-1 ring-sky-400/30'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                      title={act.detail || act.title}
                    >
                      <AppIconBadge name={act.title} size="xs" glow={false} />
                      <span className="font-semibold text-white truncate max-w-[120px]">{act.title}</span>
                      {act.progress !== undefined && (
                        <span className="font-mono text-[10px] text-sky-400 font-bold">{act.progress}%</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* TOP TWO-COLUMN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                {/* LEFT: LARGE MEDIA PLAYER CARD */}
                <div className="bg-white/[0.035] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 flex flex-col justify-between transition-all backdrop-blur-xl group relative overflow-hidden">
                  {/* Subtle glass reflection sheen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

                  {/* Top section: Album Art + Track Info + Open Media Player Badge */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-3.5 mb-3">
                      {/* Album Art Box */}
                      <div
                        onClick={() => audioEngine.toggle()}
                        className="w-14 h-14 rounded-2xl relative flex items-center justify-center shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 shadow-md"
                        style={{
                          background: isPlaying ? currentTrack.coverArt : 'rgba(255, 255, 255, 0.08)',
                          boxShadow: isPlaying
                            ? `0 0 16px rgba(56, 189, 248, ${0.3 + (audioAmplitude / 255) * 0.4})`
                            : 'none'
                        }}
                        title={isPlaying ? 'Click to Pause' : 'Click to Play'}
                      >
                        {isPlaying ? (
                          <Disc3 className="w-7 h-7 text-white animate-[spin_5s_linear_infinite]" />
                        ) : (
                          <Music2 className="w-6 h-6 text-slate-400" />
                        )}
                        {isPlaying && (
                          <span className="absolute bottom-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                          </span>
                        )}
                      </div>

                      {/* Track Name & Subtitle */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="text-sm font-bold text-white tracking-tight truncate">
                            {isPlaying ? currentTrack.title : 'Not playing'}
                          </h3>
                          {/* Fullscreen Music Experience Button (Pro Feat 5) */}
                          <button
                            onClick={() => setIsFullscreenMusicOpen(true)}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="Fullscreen Listening Room & Synced Lyrics"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {isPlaying
                            ? `${currentTrack.artist} · ${currentTrack.album}`
                            : 'Play something to see it here'}
                        </p>

                        {/* Real-time Synced Lyrics Preview (Pro Feat 6) */}
                        <div
                          onClick={() => setIsFullscreenMusicOpen(true)}
                          className="mt-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-sky-200/90 truncate cursor-pointer hover:border-sky-400/30 flex items-center justify-between transition"
                          title="Click to view Synced Lyrics in Fullscreen"
                        >
                          <span className="truncate italic">
                            "{lyricsService.getLyricsForTrack(currentTrack.id)[lyricsService.getCurrentLineIndex(lyricsService.getLyricsForTrack(currentTrack.id), currentTime)]?.text || 'Ambient audio synthesized'}"
                          </span>
                          <span className="text-[9px] text-sky-400 font-mono ml-2 uppercase font-semibold shrink-0">Lyrics</span>
                        </div>

                        {/* Audio Output Switcher & Open Media Player Chips (Pro Feat 7) */}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setSubView('media_playlist')}
                            className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Playlist</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>

                          <button
                            onClick={() => {
                              const devs = audioDeviceService.getDevices();
                              const nextIdx = (devs.findIndex((d) => d.isActive) + 1) % devs.length;
                              audioDeviceService.selectDevice(devs[nextIdx].id);
                              showToast({
                                appName: 'Audio Output',
                                title: 'Switched Output Device',
                                message: devs[nextIdx].label,
                                icon: 'Headphones',
                                duration: 2500
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                            title="Click to switch Audio Output Device"
                          >
                            <Headphones className="w-3 h-3 text-sky-400" />
                            <span className="truncate max-w-[110px]">{audioDeviceService.getActiveDevice()?.label}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle section: Timeline Scrubber */}
                  <div className="relative z-10 space-y-1 my-2">
                    <input
                      type="range"
                      min={0}
                      max={currentTrack.duration || 180}
                      value={currentTime}
                      onChange={(e) => audioEngine.seek(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                      <span>{formatSecs(currentTime)}</span>
                      <span>
                        {isPlaying
                          ? `-${formatSecs(Math.max(0, currentTrack.duration - currentTime))}`
                          : '--:--'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom section: Playback Controls */}
                  <div className="relative z-10 flex items-center justify-center gap-6 pt-1">
                    <button
                      onClick={() => audioEngine.previousTrack()}
                      className="p-2 text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Previous Track"
                    >
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>

                    {/* Prominent White Circular Play/Pause Button */}
                    <button
                      onClick={() => audioEngine.toggle()}
                      className="w-11 h-11 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                      )}
                    </button>

                    <button
                      onClick={() => audioEngine.nextTrack()}
                      className="p-2 text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Next Track"
                    >
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* RIGHT: STACKED 3 CARDS */}
                <div className="flex flex-col gap-2.5 justify-between">
                  {/* 1. FOCUS / POMODORO TIMER CARD (Right top) */}
                  <div
                    onClick={() => setSubView('focus_presets')}
                    className="bg-white/[0.035] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white tracking-tight">Focus timer</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                        {formatSecs(pomodoroSeconds)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPomodoroRunning) pausePomodoro();
                          else startPomodoro();
                        }}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title={isPomodoroRunning ? 'Pause timer' : 'Start timer'}
                      >
                        {isPomodoroRunning ? (
                          <Pause className="w-3 h-3 fill-white" />
                        ) : (
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                        )}
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* 2. CPU & RAM + NOTIFICATIONS CARD (Right middle) */}
                  <div
                    onClick={() => setSubView('notifications')}
                    className="bg-white/[0.035] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 space-y-2.5 transition-all cursor-pointer group"
                  >
                    {/* CPU Progress Bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold w-8">CPU</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${cpuUsage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 font-bold tabular-nums w-8 text-right">
                        {cpuUsage}%
                      </span>
                    </div>

                    {/* RAM Progress Bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 font-semibold w-8">RAM</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${ramUsage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 font-bold tabular-nums w-8 text-right">
                        {ramUsage}%
                      </span>
                    </div>

                    {/* Notifications Strip */}
                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <Bell className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate text-slate-300">
                          {unreadCount > 0 ? `${unreadCount} new alerts · ` : ''}
                          {latestNotification.title}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 ml-1" />
                    </div>
                  </div>

                  {/* 3. NETWORK UPLOAD / DOWNLOAD SPEEDS (Right lower) */}
                  <div
                    onClick={() => setSubView('system_monitor')}
                    className="bg-white/[0.035] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white tracking-tight">Network</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-slate-300 tabular-nums">
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-400 font-bold">↓</span>
                        <span>{downSpeed}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-sky-400 font-bold">↑</span>
                        <span>{upSpeed}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: 4 COMPACT SHORTCUT CARDS (Quick Apps Bar, Calculator, Snipping Tool, System Monitor) */}
              <div className="grid grid-cols-4 gap-2.5 pt-0.5">
                {/* 1. Quick Apps Bar (5 Slots) */}
                <button
                  onClick={() => setSubView('quick_apps')}
                  className="bg-white/[0.04] hover:bg-sky-500/15 active:scale-[0.98] border border-white/[0.08] hover:border-sky-400/30 rounded-2xl py-3 px-3 flex items-center justify-center gap-1.5 transition-all cursor-pointer group shadow-sm text-xs font-semibold text-slate-300 hover:text-white"
                  title="Quick Apps Bar (5 Slots)"
                >
                  <Layers className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline text-[11px]">Quick Apps</span>
                </button>

                {/* 2. Calculator Shortcut */}
                <button
                  onClick={() => setSubView('calculator')}
                  className="bg-white/[0.04] hover:bg-white/10 active:scale-[0.98] border border-white/[0.08] hover:border-white/20 rounded-2xl py-3 px-4 flex items-center justify-center transition-all cursor-pointer group shadow-sm"
                  title="Open Calculator"
                >
                  <CalculatorIcon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </button>

                {/* 3. Snipping Tool / Screenshot Shortcut */}
                <button
                  onClick={handleCaptureScreen}
                  className="bg-white/[0.04] hover:bg-white/10 active:scale-[0.98] border border-white/[0.08] hover:border-white/20 rounded-2xl py-3 px-4 flex items-center justify-center transition-all cursor-pointer group shadow-sm"
                  title="Capture Screen / Snipping Tool"
                >
                  <Scissors className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </button>

                {/* 4. System Monitor Shortcut */}
                <button
                  onClick={() => setSubView('system_monitor')}
                  className="bg-white/[0.04] hover:bg-white/10 active:scale-[0.98] border border-white/[0.08] hover:border-white/20 rounded-2xl py-3 px-4 flex items-center justify-center transition-all cursor-pointer group shadow-sm"
                  title="Open System Telemetry Monitor"
                >
                  <TrendingUp className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* SUB-VIEW DRAWERS (Slide in with Back Button navigation) */
            <motion.div
              key={subView}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {/* Back to main dashboard header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <button
                  onClick={() => setSubView('none')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                  <span>Return to Dashboard</span>
                </button>

                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {subView.replace('_', ' ')}
                </span>
              </div>

              {/* Sub-view rendering */}
              {subView === 'calculator' && (
                <GlassCalculator onClose={() => setSubView('none')} />
              )}

              {subView === 'system_monitor' && (
                <div className="space-y-3">
                  <BatteryHealth />
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-sky-400" />
                        CPU Cores
                      </div>
                      <div className="text-lg font-bold text-white">8 Cores · 16 Threads</div>
                      <div className="text-slate-400 text-[10px]">Current Load: {cpuUsage}%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                        Memory
                      </div>
                      <div className="text-lg font-bold text-white">11.5 / 16.0 GB</div>
                      <div className="text-slate-400 text-[10px]">Utilization: {ramUsage}%</div>
                    </div>
                  </div>
                </div>
              )}

              {subView === 'media_playlist' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Procedural Ambient Synthesizer Tracks</div>
                  <div className="grid grid-cols-1 gap-2">
                    {PLAYLIST.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          audioEngine.selectTrack(idx);
                          audioEngine.play();
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          audioEngine.getCurrentIndex() === idx && isPlaying
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                            style={{ background: t.coverArt }}
                          >
                            <Music2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{t.title}</div>
                            <div className="text-[11px] text-slate-400">{t.artist} · {t.genre}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {formatSecs(t.duration)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {subView === 'focus_presets' && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-mono font-bold text-white tracking-wider">
                      {formatSecs(pomodoroSeconds)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isPomodoroRunning ? 'Focus Session in Progress' : 'Focus Timer Paused'}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        if (isPomodoroRunning) pausePomodoro();
                        else startPomodoro();
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isPomodoroRunning ? 'Pause Session' : 'Start Focus'}
                    </button>
                    <button
                      onClick={resetPomodoro}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset (25m)
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => {
                        resetPomodoro();
                        startPomodoro();
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-slate-300 cursor-pointer"
                    >
                      25m Focus
                    </button>
                    <button
                      onClick={() => {
                        // 15m
                        pausePomodoro();
                        startPomodoro();
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-slate-300 cursor-pointer"
                    >
                      15m Quick
                    </button>
                    <button
                      onClick={() => {
                        // 5m break
                        pausePomodoro();
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-slate-300 cursor-pointer"
                    >
                      5m Break
                    </button>
                  </div>
                </div>
              )}

              {subView === 'notifications' && (
                <NotchNotificationsTab />
              )}

              {subView === 'app_launcher' && (
                <div className="space-y-4">
                  {/* Windows Native Applications Quick Launch */}
                  <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        Windows Applications (Triggers Dynamic Notch)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Live Foreground Tracking</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { id: 'vscode', name: 'VS Code' },
                        { id: 'terminal', name: 'Terminal' },
                        { id: 'spotify', name: 'Spotify' },
                        { id: 'edge', name: 'Edge' },
                        { id: 'explorer', name: 'Explorer' },
                        { id: 'taskmgr', name: 'Task Manager' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          onClick={() => {
                            windowActivityService.launchApp(app.id);
                            setSubView('none');
                          }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-sky-400/40 transition-all cursor-pointer group"
                        >
                          <AppIconBadge name={app.name} size="sm" glow={false} />
                          <span className="text-[10px] font-medium text-slate-200 group-hover:text-white truncate max-w-[70px]">
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Tools & Hub */}
                  <NotchAIHubTab />
                </div>
              )}

              {subView === 'settings' && (
                <NotchSettingsTab />
              )}

              {subView === 'bluetooth' && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bluetooth className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">Bluetooth Status</span>
                    </div>
                    <button
                      onClick={() => setBluetoothActive(!bluetoothActive)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        bluetoothActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {bluetoothActive ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {btDevices.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{d.name}</div>
                          <div className="text-[10px] text-slate-400">{d.type} · Connected</div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400">{d.battery}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subView === 'clipboard' && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">Clipboard History</span>
                    </div>
                    <button
                      onClick={readSystemClipboard}
                      className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[11px] font-medium cursor-pointer"
                    >
                      Sync
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                    {clipboardHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleCopyClipboard(item.id, item.text)}
                        className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <span className="text-xs text-slate-300 font-mono truncate max-w-[340px]">
                          {item.text}
                        </span>
                        {copiedClipId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {subView === 'brightness_volume' && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                        Master Volume
                      </span>
                      <span className="font-mono text-slate-300">{masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={masterVolume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMasterVolume(val);
                        audioEngine.setVolume(val / 100);
                      }}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        Display Brightness
                      </span>
                      <span className="font-mono text-slate-300">{displayBrightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      value={displayBrightness}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDisplayBrightness(val);
                        const root = document.getElementById('desktop-viewport-container');
                        if (root) root.style.filter = `brightness(${val}%)`;
                      }}
                      className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {subView === 'weather_details' && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-amber-400" />
                      {weather?.location || 'Local Weather'}
                    </span>
                    <button
                      onClick={refreshWeather}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-3xl font-bold font-mono text-white">
                        {weather ? Math.round(((weather.temp - 32) * 5) / 9) : 28}°C
                      </div>
                      <div className="text-xs text-sky-300">{weather?.condition ?? 'Sunny / Clear'}</div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                      <div>Humidity: {weather?.humidity ?? 48}%</div>
                      <div>Wind: {weather?.windSpeed ?? 8} km/h</div>
                      <div>High: {weather ? Math.round(((weather.high - 32) * 5) / 9) : 31}°C</div>
                    </div>
                  </div>
                </div>
              )}

              {subView === 'activities' && (
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                    <span>Live Background Tasks & Download Monitor (Pro Feat 14)</span>
                    <button
                      onClick={() => windowActivityService.launchApp('explorer')}
                      className="text-[10px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
                    >
                      <Folder className="w-3 h-3" />
                      <span>Open Downloads Folder</span>
                    </button>
                  </div>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-[240px]">{task.title}</span>
                        <span className="font-mono text-sky-400 font-bold">{task.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-400 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>{task.speed}</span>
                        <span>{task.detail}</span>
                        {task.type === 'download' && (
                          <button
                            onClick={() => windowActivityService.launchApp('explorer')}
                            className="text-sky-400 hover:underline cursor-pointer"
                          >
                            Reveal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pro Sub-views */}
              {subView === 'ai_agents' && (
                <AIAgentProModal onClose={() => setSubView('none')} />
              )}

              {subView === 'drop_shelf' && (
                <DropShelfModal
                  files={dropShelfFiles}
                  onAddFiles={addDropShelfFiles}
                  onRemoveFile={removeDropShelfFile}
                  onClearAll={clearDropShelf}
                  onClose={() => setSubView('none')}
                />
              )}

              {subView === 'clipboard_pro' && (
                <ClipboardProModal onClose={() => setSubView('none')} />
              )}

              {subView === 'quick_apps' && (
                <QuickAppsBarModal onClose={() => setSubView('none')} />
              )}

              {subView === 'volume_mixer' && (
                <VolumeMixerModal onClose={() => setSubView('none')} />
              )}

              {subView === 'ms_store' && (
                <MicrosoftStoreModal onClose={() => setSubView('none')} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
