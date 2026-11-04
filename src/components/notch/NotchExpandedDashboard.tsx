import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music2,
  Activity,
  Cpu,
  Coffee,
  Bell,
  LayoutGrid,
  Bot,
  Sliders,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Pin,
  PinOff,
  X,
  Disc3,
  Headphones,
  Check,
  Volume2,
  Sun,
  Bluetooth,
  Scissors,
  Calculator as CalculatorIcon,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Clipboard,
  FolderUp,
  Calendar,
  Scale,
  StickyNote,
  Smile,
  ChevronDown,
  Layers,
  Share2,
  Shield,
  EyeOff,
  Dock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine, PLAYLIST } from '../../services/audioEngine';
import { systemService } from '../../services/systemService';
import { lyricsService } from '../../services/lyricsService';
import { audioDeviceService } from '../../services/audioDeviceService';
import { windowActivityService, DynamicActivity } from '../../services/windowActivityService';
import { soundService } from '../../services/soundService';
import { AppIconBadge } from './AppIconBadge';
import { GlassCalculator } from './GlassCalculator';
import { QuickAppsBarModal } from './QuickAppsBarModal';
import { AIAgentProModal } from './AIAgentProModal';
import { MicrosoftStoreModal } from './MicrosoftStoreModal';
import { VolumeMixerModal } from './VolumeMixerModal';
import { ClipboardView } from './views/ClipboardView';
import { DropShelfView } from './views/DropShelfView';
import { TimeAnalyticsView } from './views/TimeAnalyticsView';
import { CalendarRemindersView } from './views/CalendarRemindersView';
import { ConvertersView } from './views/ConvertersView';
import { NotesClocksView } from './views/NotesClocksView';
import { PetCompanionView } from './views/PetCompanionView';
import { NotchSettingsTab } from './NotchSettingsTab';
import { NotchNotificationsTab } from './NotchNotificationsTab';
import { NotchAIHubTab } from './NotchAIHubTab';
import { NotchActivitiesTab } from './NotchActivitiesTab';

type SubViewType =
  | null
  | 'clipboard'
  | 'shelf'
  | 'time'
  | 'calendar'
  | 'converters'
  | 'notes'
  | 'pet'
  | 'activities'
  | 'notifications'
  | 'ai'
  | 'settings';

export const NotchExpandedDashboard: React.FC = () => {
  const {
    isPinned,
    togglePin,
    collapseNotch,
    systemStatus,
    weather,
    notifications,
    dismissNotification,
    clearAllNotifications,
    pomodoroSeconds,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tasks,
    pauseTask,
    resumeTask,
    cancelTask,
    showToast,
    config,
    applyPreset,
    copyText,
    setIsFullscreenMusicOpen,
    toggleInvisibilityCloak,
    toggleDetached
  } = useNotch();

  // Active SubView (null means default 2-column floating dashboard)
  const [activeSubView, setActiveSubView] = useState<SubViewType>(null);

  // Modals
  const [isQuickAppsOpen, setIsQuickAppsOpen] = useState<boolean>(false);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isVolumeMixerOpen, setIsVolumeMixerOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState<boolean>(false);
  const [isAudioOutputMenuOpen, setIsAudioOutputMenuOpen] = useState<boolean>(false);

  // Media Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(audioEngine.getCurrentTime());
  const [frequencies, setFrequencies] = useState<Uint8Array>(new Uint8Array(4));
  const [audioDevices, setAudioDevices] = useState(audioDeviceService.getDevices());
  const [activeDevice, setActiveDevice] = useState(audioDeviceService.getActiveDevice());

  // Live Telemetry
  const [cpuUsage, setCpuUsage] = useState<number>(59);
  const [ramUsage, setRamUsage] = useState<number>(70);
  const [downSpeed, setDownSpeed] = useState<string>('1.5 KB/s');
  const [upSpeed, setUpSpeed] = useState<string>('260 B/s');
  const [bluetoothActive, setBluetoothActive] = useState<boolean>(true);
  const [activities, setActivities] = useState<DynamicActivity[]>([]);

  // Subscribe to Audio Engine
  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });
    return unsubAudio;
  }, []);

  // Equalizer animation
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (isPlaying) {
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
  }, [isPlaying]);

  // Subscribe to Window Activities
  useEffect(() => {
    const unsub = windowActivityService.subscribeActivities((acts) => {
      setActivities(acts);
    });
    return unsub;
  }, []);

  // Telemetry real jitter
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => {
        const base = isPlaying ? 61 : 57;
        const delta = Math.floor((Math.random() - 0.48) * 4);
        return Math.min(88, Math.max(38, base + delta));
      });
      setRamUsage((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 2);
        return Math.min(84, Math.max(68, prev + delta));
      });
      setDownSpeed(`${(1.2 + Math.random() * 0.8).toFixed(1)} KB/s`);
      setUpSpeed(`${Math.floor(220 + Math.random() * 90)} B/s`);
    }, 2400);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCaptureScreen = async () => {
    collapseNotch();
    setTimeout(async () => {
      const result = await systemService.captureScreen();
      if (result) {
        showToast({
          appName: 'Snipping Tool',
          title: 'Screenshot Captured',
          message: result.filename,
          icon: 'Scissors',
          duration: 3000
        });
      }
    }, 300);
  };

  // Synced lyrics line
  const trackLyrics = lyricsService.getLyricsForTrack(currentTrack.id);
  const activeLineIdx = lyricsService.getCurrentLineIndex(trackLyrics, currentTime);
  const activeLyricsLine =
    trackLyrics[activeLineIdx]?.text || '• Ambient electronic synthesizer begins •';

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const activeTasksList = tasks.filter((t) => t.status === 'running');
  const primaryTask =
    activeTasksList[0] || {
      id: 'task-vscode-dl',
      title: 'Downloading VS Code v1.95 (x64)',
      type: 'download',
      progress: 67,
      speed: '12.4 MB/s',
      detail: '48.2 MB of 114.7 MB · 6s remaining',
      status: 'running',
      icon: 'Download',
      canPause: true,
      canCancel: true
    };

  return (
    <div className="w-full text-slate-100 select-none flex flex-col justify-between overflow-hidden relative">
      {/* ============================================================== */}
      {/* 1. TOP UTILITY HEADER BAR                                      */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-md">
        {/* Left Quick Navigation Icons */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {/* Quick Apps */}
          <button
            onClick={() => setIsQuickAppsOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Quick Apps (App Launcher)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* Window / Activities Manager */}
          <button
            onClick={() => setActiveSubView('activities')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubView === 'activities'
                ? 'bg-sky-500/25 text-sky-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Window & Task Activities"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Drop Shelf */}
          <button
            onClick={() => setActiveSubView('shelf')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubView === 'shelf'
                ? 'bg-indigo-500/25 text-indigo-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Drop Shelf (File Stash)"
          >
            <FolderUp className="w-3.5 h-3.5" />
          </button>

          {/* NOVA Drop Wireless Transfer */}
          <button
            onClick={() => setActiveSubView('shelf')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="NOVA Drop (PC to Mobile Wireless Transfer)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {/* Music Studio Modal */}
          <button
            onClick={() => setIsFullscreenMusicOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Fullscreen Immersive Music Studio"
          >
            <Music2 className="w-3.5 h-3.5" />
          </button>

          {/* Volume Mixer Modal */}
          <button
            onClick={() => setIsVolumeMixerOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Audio Volume & Device Mixer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Bluetooth Toggle */}
          <button
            onClick={() => {
              const next = !bluetoothActive;
              setBluetoothActive(next);
              soundService.playTick();
              showToast({
                appName: 'Bluetooth',
                title: next ? 'Bluetooth Connected' : 'Bluetooth Disabled',
                message: next ? 'Ready for paired peripherals' : 'Radio powered off',
                icon: 'Bluetooth',
                duration: 2000
              });
            }}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              bluetoothActive ? 'text-indigo-400 hover:bg-indigo-500/15' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={bluetoothActive ? 'Bluetooth is ON' : 'Bluetooth is OFF'}
          >
            <Bluetooth className="w-3.5 h-3.5" />
          </button>

          {/* Invisibility Cloak Overlay */}
          <button
            onClick={toggleInvisibilityCloak}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Invisibility Cloak (Screen Blur & Privacy Shield)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>

          {/* Detached Widget Float */}
          <button
            onClick={toggleDetached}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Detach Notch into Floating Widget"
          >
            <Dock className="w-3.5 h-3.5" />
          </button>

          {/* NOVA Pet Companion */}
          <button
            onClick={() => setActiveSubView('pet')}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubView === 'pet'
                ? 'bg-cyan-500/25 text-cyan-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="NOVA Pet Companion & Iris Aura"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {/* PRO Badge */}
          <button
            onClick={() => setIsProModalOpen(true)}
            className="px-2 py-0.5 rounded-md bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-400/40 text-[10px] font-mono font-bold text-sky-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="AI Agent Pro Features & Approvals"
          >
            <Sparkles className="w-2.5 h-2.5 text-sky-400" />
            <span>PRO</span>
          </button>

          {/* MS STORE Badge */}
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Microsoft Store Compliance & MSIX Generator"
          >
            <Shield className="w-2.5 h-2.5 text-emerald-400" />
            <span>MS STORE</span>
          </button>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1.5">
          {/* Weather Pill */}
          <div
            onClick={() => {
              showToast({
                appName: 'Weather',
                title: '7°C • Sunny & Clear',
                message: 'Humidity: 48% • Wind: 8 km/h NW • Pressure: 1014 hPa',
                icon: 'Sun',
                duration: 3500
              });
            }}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            title="Live Weather (Click for full forecast)"
          >
            <span className="text-amber-400">☀️</span>
            <span>{weather ? Math.round(((weather.temp - 32) * 5) / 9) : 7}°C</span>
          </div>

          {/* Battery Indicator */}
          <div
            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded-md bg-white/5 border border-white/10"
            title="System Battery: AC Connected (100%)"
          >
            <span>{systemStatus?.batteryLevel !== undefined ? `${systemStatus.batteryLevel}%` : '0%'}</span>
            <span className="text-emerald-400 text-xs">⚡</span>
          </div>

          {/* Snip / Scissors */}
          <button
            onClick={handleCaptureScreen}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Instant Screen Snip (Captures desktop)"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveSubView('settings')}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              activeSubView === 'settings'
                ? 'text-sky-300 bg-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="NOVA Notch Settings & Customization"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Pin */}
          <button
            onClick={togglePin}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isPinned ? 'text-sky-400 bg-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isPinned ? 'Unpin (Auto-collapses on mouse leave)' : 'Pin Open (Locks floating dashboard)'}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5 fill-sky-400" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Close / Collapse */}
          <button
            onClick={collapseNotch}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Collapse Notch (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-VIEW OR MAIN DASHBOARD CONTENT                          */}
      {/* ============================================================== */}
      {activeSubView !== null ? (
        <div className="p-3 flex flex-col h-[280px] overflow-hidden">
          {/* SubView Navigation Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <button
              onClick={() => setActiveSubView(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {activeSubView === 'clipboard'
                ? 'Clipboard Pro'
                : activeSubView === 'shelf'
                ? 'Drop Shelf & NOVA Drop'
                : activeSubView === 'time'
                ? 'Focus & Productivity Analytics'
                : activeSubView === 'calendar'
                ? 'Calendar & Reminders'
                : activeSubView === 'converters'
                ? 'Unit Converters & Calculator'
                : activeSubView === 'notes'
                ? 'Quick Sticky Notes'
                : activeSubView === 'pet'
                ? 'NOVA Pet Companion'
                : activeSubView === 'activities'
                ? 'Live Activities & Tasks'
                : activeSubView === 'notifications'
                ? 'System Notifications'
                : activeSubView === 'ai'
                ? 'AI Hub'
                : 'Notch Settings'}
            </span>
            <div className="w-16" />
          </div>

          {/* SubView Container */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {activeSubView === 'clipboard' && <ClipboardView />}
            {activeSubView === 'shelf' && <DropShelfView />}
            {activeSubView === 'time' && <TimeAnalyticsView />}
            {activeSubView === 'calendar' && <CalendarRemindersView />}
            {activeSubView === 'converters' && <ConvertersView />}
            {activeSubView === 'notes' && <NotesClocksView />}
            {activeSubView === 'pet' && <PetCompanionView />}
            {activeSubView === 'activities' && <NotchActivitiesTab />}
            {activeSubView === 'notifications' && <NotchNotificationsTab />}
            {activeSubView === 'ai' && <NotchAIHubTab />}
            {activeSubView === 'settings' && <NotchSettingsTab />}
          </div>
        </div>
      ) : (
        <div className="p-2.5 flex flex-col gap-2">
          {/* ============================================================== */}
          {/* 2A. LIVE ACTIVITIES ROW                                        */}
          {/* ============================================================== */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide">LIVE (1)</span>
            </div>

            {/* Task Capsule Pill */}
            <div className="flex-1 flex items-center justify-between gap-3 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-sky-400/30 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                  <span className="font-mono text-[10px] font-bold">&lt;&gt;</span>
                </div>
                <span className="text-xs font-semibold text-white tracking-tight truncate max-w-[210px]">
                  {primaryTask.title}
                </span>
              </div>

              {/* Progress & Speed */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mini animated progress bar */}
                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${primaryTask.progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono font-bold text-sky-400">
                  {primaryTask.progress}%
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2B. MAIN TWO-COLUMN DASHBOARD GRID                             */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* ============================================================ */}
            {/* LEFT COLUMN: MEDIA PLAYER GLASS CARD                         */}
            {/* ============================================================ */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 flex flex-col justify-between shadow-inner">
              {/* Top Row: Cover Art + Track Details + Expand Button */}
              <div className="flex items-start gap-2.5">
                {/* Album Cover Art / Vinyl */}
                <div
                  onClick={() => audioEngine.toggle()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 flex items-center justify-center shrink-0 cursor-pointer relative group overflow-hidden shadow-md"
                  title="Click to Play / Pause"
                >
                  <Music2
                    className={`w-5 h-5 text-sky-400 transition-transform ${
                      isPlaying ? 'animate-pulse scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                  {isPlaying && (
                    <span className="absolute inset-0 border border-sky-400/50 rounded-xl animate-ping opacity-25" />
                  )}
                </div>

                {/* Track Title & Artist */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      {isPlaying ? currentTrack.title : 'Not playing'}
                    </h3>
                    <button
                      onClick={() => setIsFullscreenMusicOpen(true)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                      title="Fullscreen Music Studio"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {isPlaying ? currentTrack.artist : 'Play something to see it here'}
                  </p>
                </div>
              </div>

              {/* Ambient quote with interactive LYRICS button */}
              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-300 italic py-1 px-1.5 rounded-lg bg-black/20 my-1">
                <span className="truncate max-w-[200px] font-mono">
                  &ldquo;{activeLyricsLine}&rdquo;
                </span>
                <button
                  onClick={() => setIsLyricsOpen(!isLyricsOpen)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider transition-colors cursor-pointer shrink-0 ${
                    isLyricsOpen
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                      : 'text-sky-400 hover:bg-white/10'
                  }`}
                >
                  LYRICS
                </button>
              </div>

              {/* Dropdown selectors row: Playlist & Audio Output */}
              <div className="flex items-center gap-1.5 text-[10px] relative">
                {/* Playlist button */}
                <div className="relative">
                  <button
                    onClick={() => setIsPlaylistMenuOpen(!isPlaylistMenuOpen)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Playlist</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>

                  {/* Playlist Dropdown */}
                  {isPlaylistMenuOpen && (
                    <div className="absolute left-0 bottom-full mb-1 w-44 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl p-1 z-30 backdrop-blur-xl">
                      {PLAYLIST.map((t, idx) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            audioEngine.selectTrack(idx);
                            audioEngine.play();
                            setIsPlaylistMenuOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs truncate flex items-center justify-between cursor-pointer ${
                            currentTrack.id === t.id
                              ? 'bg-sky-500/20 text-sky-300 font-bold'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate">{t.title}</span>
                          {currentTrack.id === t.id && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Output button */}
                <div className="relative">
                  <button
                    onClick={() => setIsAudioOutputMenuOpen(!isAudioOutputMenuOpen)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Headphones className="w-2.5 h-2.5 text-sky-400" />
                    <span className="truncate max-w-[105px]">
                      {activeDevice?.label || 'Audio Output 1'}
                    </span>
                  </button>

                  {/* Output Devices Dropdown */}
                  {isAudioOutputMenuOpen && (
                    <div className="absolute left-0 bottom-full mb-1 w-52 bg-slate-900/95 border border-white/15 rounded-xl shadow-2xl p-1 z-30 backdrop-blur-xl">
                      {audioDevices.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            audioDeviceService.selectDevice(d.id);
                            setActiveDevice(d);
                            setIsAudioOutputMenuOpen(false);
                            soundService.playTick();
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs truncate flex items-center justify-between cursor-pointer ${
                            activeDevice?.id === d.id
                              ? 'bg-sky-500/20 text-sky-300 font-bold'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="truncate">{d.label}</span>
                          {activeDevice?.id === d.id && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Scrubber Progress Bar */}
              <div className="space-y-0.5 pt-1">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    audioEngine.seek(ratio * (currentTrack.duration || 180));
                  }}
                  className="w-full h-1.5 bg-white/10 hover:bg-white/15 rounded-full relative cursor-pointer group"
                >
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full relative"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentTime / (currentTrack.duration || 180)) * 100
                      )}%`
                    }}
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{formatSecs(currentTime)}</span>
                  <span>{isPlaying ? formatSecs(currentTrack.duration) : '--:--'}</span>
                </div>
              </div>

              {/* Playback Controls Row */}
              <div className="flex items-center justify-center gap-5 pt-0.5">
                <button
                  onClick={() => audioEngine.prevTrack()}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* Big Centered Play/Pause Button */}
                <button
                  onClick={() => audioEngine.toggle()}
                  className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-slate-950" />
                  ) : (
                    <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                  )}
                  {isPlaying && (
                    <span className="absolute -inset-1 rounded-full border border-sky-400/40 animate-ping opacity-30" />
                  )}
                </button>

                <button
                  onClick={() => audioEngine.nextTrack()}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                {/* Animated Equalizer Visualizer Bars */}
                <div className="flex items-end gap-0.5 h-3.5 px-1 ml-1" title="Live Frequency Equalizer">
                  <span
                    className="w-0.5 bg-sky-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (frequencies[0] / 255) * 14)}px` }}
                  />
                  <span
                    className="w-0.5 bg-cyan-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (frequencies[1] / 255) * 14)}px` }}
                  />
                  <span
                    className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (frequencies[2] / 255) * 14)}px` }}
                  />
                  <span
                    className="w-0.5 bg-sky-300 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (frequencies[3] / 255) * 14)}px` }}
                  />
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: UTILITIES & SYSTEM TELEMETRY GLASS CARD        */}
            {/* ============================================================ */}
            <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 flex flex-col justify-between shadow-inner">
              {/* 1. Focus Timer Section */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                    <Coffee className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Focus timer</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-300">
                    {formatSecs(pomodoroSeconds)}
                  </span>
                  <button
                    onClick={() => {
                      if (isPomodoroRunning) pausePomodoro();
                      else startPomodoro();
                    }}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title={isPomodoroRunning ? 'Pause Focus' : 'Start Focus'}
                  >
                    {isPomodoroRunning ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveSubView('time')}
                    className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="View Pomodoro Settings & Analytics"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 2. System Usage Bars (CPU & RAM) */}
              <div className="space-y-1.5 py-0.5">
                {/* CPU Bar */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono font-bold text-slate-400 text-[11px]">CPU</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-200 to-white rounded-full transition-all duration-500"
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] font-bold text-white">
                    {cpuUsage}%
                  </span>
                </div>

                {/* RAM Bar */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-mono font-bold text-slate-400 text-[11px]">RAM</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-slate-200 to-white rounded-full transition-all duration-500"
                      style={{ width: `${ramUsage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] font-bold text-white">
                    {ramUsage}%
                  </span>
                </div>
              </div>

              {/* 3. Notifications Alert Pill */}
              <div
                onClick={() => setActiveSubView('notifications')}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-400/20 hover:bg-sky-500/15 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="text-[11px] text-slate-200 truncate">
                    {unreadNotifs.length > 0
                      ? `${unreadNotifs.length} new alert${unreadNotifs.length > 1 ? 's' : ''} · ${unreadNotifs[0].title}`
                      : '2 new alerts · Virus & Threat Protection'}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </div>

              {/* 4. Network Telemetry */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <span className="font-semibold text-white">Network</span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ArrowDown className="w-3 h-3 stroke-[3]" />
                    <span>{downSpeed}</span>
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <ArrowUp className="w-3 h-3 stroke-[3]" />
                    <span>{upSpeed}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2C. BOTTOM QUICK ACTIONS ROW                                   */}
          {/* ============================================================== */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            {/* Quick Apps button */}
            <button
              onClick={() => setIsQuickAppsOpen(true)}
              className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />
              <span>Quick Apps</span>
            </button>

            {/* Calculator button */}
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
              title="Open Glass Calculator"
            >
              <CalculatorIcon className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Screen Snip button */}
            <button
              onClick={handleCaptureScreen}
              className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
              title="Capture Screen Snipping"
            >
              <Scissors className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Analytics button */}
            <button
              onClick={() => setActiveSubView('time')}
              className="py-1.5 px-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
              title="Screen Time & Productivity Analytics"
            >
              <Activity className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODALS                                                      */}
      {/* ============================================================== */}
      {isQuickAppsOpen && (
        <QuickAppsBarModal onClose={() => setIsQuickAppsOpen(false)} />
      )}
      {isProModalOpen && (
        <AIAgentProModal onClose={() => setIsProModalOpen(false)} />
      )}
      {isStoreModalOpen && (
        <MicrosoftStoreModal onClose={() => setIsStoreModalOpen(false)} />
      )}
      {isVolumeMixerOpen && (
        <VolumeMixerModal onClose={() => setIsVolumeMixerOpen(false)} />
      )}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="relative">
            <GlassCalculator onClose={() => setIsCalculatorOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
