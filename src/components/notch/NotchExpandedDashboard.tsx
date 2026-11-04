import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  VolumeX,
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
  Eye,
  EyeOff,
  Dock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  RotateCcw,
  Maximize2,
  Terminal,
  Code,
  Globe,
  Folder,
  Download,
  Copy,
  Plus,
  RefreshCw,
  ShieldCheck,
  Radio,
  FileUp,
  CheckCircle2,
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine, PLAYLIST } from '../../services/audioEngine';
import { systemService } from '../../services/systemService';
import { lyricsService } from '../../services/lyricsService';
import { audioDeviceService } from '../../services/audioDeviceService';
import { windowActivityService, DynamicActivity } from '../../services/windowActivityService';
import { soundService } from '../../services/soundService';
import { phoneSyncService } from '../../services/phoneSyncService';
import { VayllEye } from './VayllEye';
import { GlassCalculator } from './GlassCalculator';
import { QuickAppsBarModal } from './QuickAppsBarModal';
import { AIAgentProModal } from './AIAgentProModal';
import { MicrosoftStoreModal } from './MicrosoftStoreModal';
import { VolumeMixerModal } from './VolumeMixerModal';
import { PhoneSyncModal } from './PhoneSyncModal';
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
import { PersonalizedGreetingBanner } from './PersonalizedGreetingBanner';
import { BluetoothView } from './views/BluetoothView';
import { bluetoothService } from '../../services/bluetoothService';

type SubViewType =
  | null
  | 'bluetooth'
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
    pomodoroSeconds,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    tasks,
    pauseTask,
    resumeTask,
    cancelTask,
    showToast,
    config,
    copyText,
    setIsFullscreenMusicOpen,
    toggleInvisibilityCloak,
    toggleDetached,
    clipboardHistory,
    dropShelfFiles,
    eyesOnlyMode,
    toggleEyesOnlyMode,
    setEyesOnlyMode,
    resetNotchPosition,
    isCustomPositioned,
    activeTab
  } = useNotch();

  // Active SubView (null means default compact 2-column floating dashboard)
  const [activeSubView, setActiveSubView] = useState<SubViewType>(() =>
    activeTab === 'settings' || activeTab === 'notifications' ? activeTab : null
  );
  const [btDevices, setBtDevices] = useState(bluetoothService.getDevices());

  useEffect(() => {
    const unsubBt = bluetoothService.subscribe(() => {
      setBtDevices(bluetoothService.getDevices());
    });
    const onOpenSubView = (ev: Event) => {
      const target = (ev as CustomEvent<SubViewType>).detail;
      if (target) setActiveSubView(target);
    };
    window.addEventListener('nova:open-subview', onOpenSubView);
    return () => {
      unsubBt();
      window.removeEventListener('nova:open-subview', onOpenSubView);
    };
  }, []);

  // Modals
  const [isQuickAppsOpen, setIsQuickAppsOpen] = useState<boolean>(false);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isVolumeMixerOpen, setIsVolumeMixerOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isPlaylistMenuOpen, setIsPlaylistMenuOpen] = useState<boolean>(false);
  const [isAudioOutputMenuOpen, setIsAudioOutputMenuOpen] = useState<boolean>(false);
  const [isPhoneSyncOpen, setIsPhoneSyncOpen] = useState<boolean>(false);
  const [phoneDevice, setPhoneDevice] = useState(phoneSyncService.getDevice());

  useEffect(() => {
    const unsub = phoneSyncService.subscribe(() => {
      setPhoneDevice(phoneSyncService.getDevice());
    });
    return unsub;
  }, []);

  // Media Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(audioEngine.getCurrentTime());
  const [audioDevices, setAudioDevices] = useState(audioDeviceService.getDevices());
  const [activeDevice, setActiveDevice] = useState(audioDeviceService.getActiveDevice());

  // Master Volume & Luminance Slider States
  const [masterVolume, setMasterVolume] = useState<number>(55);
  const [displayBrightness, setDisplayBrightness] = useState<number>(90);

  // Live Telemetry
  const [cpuUsage, setCpuUsage] = useState<number>(62);
  const [ramUsage, setRamUsage] = useState<number>(72);
  const [downSpeed, setDownSpeed] = useState<string>('782 B/s');
  const [upSpeed, setUpSpeed] = useState<string>('0 B/s');
  const [bluetoothActive, setBluetoothActive] = useState<boolean>(true);
  const [copiedRecentId, setCopiedRecentId] = useState<string | null>(null);

  // Scroll Indicators & Drag Scrolling State
  const dashboardScrollRef = useRef<HTMLDivElement>(null);
  const subViewScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartScrollTopRef = useRef<number>(0);
  const isDraggingActiveRef = useRef<boolean>(false);

  // Subscribe to Audio Engine
  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });
    return unsubAudio;
  }, []);

  // Telemetry real jitter
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage((prev) => {
        const base = isPlaying ? 64 : 61;
        const delta = Math.floor((Math.random() - 0.48) * 4);
        return Math.min(88, Math.max(38, base + delta));
      });
      setRamUsage((prev) => {
        const delta = Math.floor((Math.random() - 0.5) * 2);
        return Math.min(84, Math.max(68, prev + delta));
      });
      setDownSpeed(`${Math.floor(740 + Math.random() * 80)} B/s`);
      setUpSpeed(`${Math.floor(Math.random() * 40)} B/s`);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsPlaylistMenuOpen(false);
        setIsAudioOutputMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check scroll position for scroll indicators
  const checkScrollState = useCallback(() => {
    const el = dashboardScrollRef.current;
    if (!el) return;
    const hasMoreBelow = el.scrollHeight - el.scrollTop - el.clientHeight > 14;
    const hasMoreAbove = el.scrollTop > 14;
    setCanScrollDown(hasMoreBelow);
    setCanScrollUp(hasMoreAbove);
  }, []);

  useEffect(() => {
    const el = dashboardScrollRef.current;
    if (!el) return;
    checkScrollState();
    const ro = new ResizeObserver(() => checkScrollState());
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkScrollState, activeSubView, tasks, isLyricsOpen, eyesOnlyMode]);

  // Drag-to-scroll implementation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left-click
    const target = e.target as HTMLElement;
    // Don't drag when interacting with controls
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('[role="slider"]') ||
      target.closest('.interactive-control')
    ) {
      return;
    }

    const currentScrollRef = activeSubView !== null ? subViewScrollRef.current : dashboardScrollRef.current;
    if (!currentScrollRef) return;

    isDraggingActiveRef.current = true;
    dragStartYRef.current = e.pageY;
    dragStartScrollTopRef.current = currentScrollRef.scrollTop;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingActiveRef.current) return;
    const currentScrollRef = activeSubView !== null ? subViewScrollRef.current : dashboardScrollRef.current;
    if (!currentScrollRef) return;

    const deltaY = e.pageY - dragStartYRef.current;
    currentScrollRef.scrollTop = dragStartScrollTopRef.current - deltaY;
    checkScrollState();
  };

  const handleMouseUp = () => {
    isDraggingActiveRef.current = false;
    setIsDragging(false);
  };

  const scrollDashboardDown = () => {
    if (dashboardScrollRef.current) {
      dashboardScrollRef.current.scrollBy({ top: 180, behavior: 'smooth' });
      soundService.playTick();
    }
  };

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

  const handleVolumeChange = (newVal: number) => {
    setMasterVolume(newVal);
    audioEngine.setVolume(newVal / 100);
  };

  const handleBrightnessChange = (newVal: number) => {
    setDisplayBrightness(newVal);
    const root = document.getElementById('desktop-viewport-container');
    if (root) {
      root.style.filter = `brightness(${newVal}%)`;
    }
  };

  // Synced lyrics line
  const trackLyrics = lyricsService.getLyricsForTrack(currentTrack.id);
  const activeLineIdx = lyricsService.getCurrentLineIndex(trackLyrics, currentTime);

  const activeTasksList = tasks.filter((t) => t.status === 'running');

  // Quick launch dock items
  const quickDockApps = [
    { id: 'vscode', name: 'VS Code', icon: Code, color: '#007ACC', exe: 'code.exe' },
    { id: 'terminal', name: 'Terminal', icon: Terminal, color: '#107C41', exe: 'wt.exe' },
    { id: 'browser', name: 'Edge', icon: Globe, color: '#0078D7', exe: 'msedge.exe' },
    { id: 'spotify', name: 'Spotify', icon: Music2, color: '#1DB954', exe: 'spotify.exe' },
    { id: 'explorer', name: 'Files', icon: Folder, color: '#FFB900', exe: 'explorer.exe' },
    { id: 'settings', name: 'Settings', icon: Sliders, color: '#7C3AED', exe: 'ms-settings:' },
    { id: 'calc', name: 'Calculator', icon: CalculatorIcon, color: '#38BDF8', exe: 'calc.exe' },
    { id: 'snipping', name: 'Snip', icon: Scissors, color: '#EC4899', exe: 'snippingtool.exe' }
  ];

  // Battery circular ring matching reference screenshot: "74% ⭕"
  const batteryPct = systemStatus?.batteryLevel !== undefined ? systemStatus.batteryLevel : 74;
  const ringRadius = 5.5;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (batteryPct / 100) * ringCircumference;

  // =========================================================================
  // 4. EYES-ONLY MODE: Show ONLY the eye icons. Hide all other elements!
  // =========================================================================
  if (eyesOnlyMode) {
    return (
      <div
        onClick={() => toggleEyesOnlyMode()}
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none relative group bg-transparent"
        title="Eyes-Only Mode Active • Click anywhere to reveal full dashboard"
      >
        <div className="relative">
          <VayllEye size="lg" interactive={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full text-slate-100 select-none flex flex-col overflow-hidden relative font-sans">
      {/* ============================================================== */}
      {/* 1. TOP UTILITY HEADER BAR (Fixed at the top, matching reference)*/}
      {/* ============================================================== */}
      <div className="shrink-0 z-20 flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl select-none sticky top-0">
        {/* Left Side: Enclosed Capsule Pill with Quick Icons */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#12161f] border border-white/10 shadow-inner">
          {/* 1. Quick Apps button (highlighted square pill) */}
          <button
            onClick={() => setIsQuickAppsOpen(true)}
            className="p-1 rounded-md bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer"
            title="Quick Apps (Launcher)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>

          {/* 2. Music Player */}
          <button
            onClick={() => setIsFullscreenMusicOpen(true)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Music Player"
          >
            <Music2 className="w-3.5 h-3.5" />
          </button>

          {/* 3. Audio & Sliders Mixer */}
          <button
            onClick={() => setIsVolumeMixerOpen(true)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Volume Mixer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* 4. Bluetooth Panel */}
          <button
            onClick={() => {
              setActiveSubView(activeSubView === 'bluetooth' ? null : 'bluetooth');
              soundService.playTick();
            }}
            className={`p-1 relative transition-colors cursor-pointer ${
              activeSubView === 'bluetooth'
                ? 'text-sky-300 bg-sky-500/20 rounded-md'
                : btDevices.some((d) => d.status === 'connected')
                ? 'text-sky-400 hover:text-sky-300'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Bluetooth Device Hub (${btDevices.filter((d) => d.status === 'connected').length} connected)`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            {btDevices.some((d) => d.status === 'connected') && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_4px_#38bdf8] animate-pulse" />
            )}
          </button>

          {/* 5. Smartphone Link & Live Notifications */}
          <button
            onClick={() => setIsPhoneSyncOpen(true)}
            className={`p-1 relative transition-colors cursor-pointer ${
              phoneDevice?.status === 'connected' ? 'text-sky-400 hover:text-sky-300' : 'text-slate-400 hover:text-white'
            }`}
            title={`Smart Phone Sync: ${
              phoneDevice && phoneDevice.status === 'connected'
                ? `${phoneDevice.name} (${phoneDevice.batteryLevel}%) • Live Mirror Active`
                : 'Connect Phone'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {phoneDevice?.status === 'connected' && (
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] animate-pulse" />
            )}
          </button>

          {/* 6. Clipboard */}
          <button
            onClick={() => setActiveSubView('clipboard')}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Clipboard Pro"
          >
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          {/* 6. Focus Timer */}
          <button
            onClick={() => setActiveSubView('time')}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Focus & Pomodoro Timer"
          >
            <Coffee className="w-3.5 h-3.5" />
          </button>

          {/* 7. Weather */}
          <button
            onClick={() => {
              showToast({
                appName: 'Weather',
                title: '28°C • Clear Skies',
                message: 'Humidity: 48% • Wind: 8 km/h NW',
                icon: 'Sun',
                duration: 2500
              });
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Weather Forecast"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* 8. Activities / Pulse */}
          <button
            onClick={() => setActiveSubView('activities')}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="System Activities"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* 9. Eyes-Only Mode Toggle */}
          <button
            onClick={() => toggleEyesOnlyMode()}
            className="p-1 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
            title="Toggle Eyes-Only Mode (Hides all UI, displays only Eyes)"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>

        {/* Right Side: PRO, Weather, Battery Ring, Pin, Settings, Close */}
        <div className="flex items-center gap-2.5 shrink-0 pl-2">
          {/* PRO Badge with Bot Icon */}
          <button
            onClick={() => setIsProModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="AI Agent Pro Features"
          >
            <Bot className="w-3.5 h-3.5 text-slate-300" />
            <span>PRO</span>
          </button>

          {/* Weather Indicator */}
          <div
            onClick={() => {
              showToast({
                appName: 'Weather',
                title: '28°C • Sunny & Clear',
                message: 'Real-time meteorological telemetry',
                icon: 'Sun',
                duration: 2500
              });
            }}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-200 cursor-pointer hover:text-white transition-colors"
            title="28°C Sunny & Clear"
          >
            <span className="text-amber-400">☀️</span>
            <span>28°C</span>
          </div>

          {/* Battery Indicator with Circular Progress Ring */}
          <div
            className="flex items-center gap-1 text-[11px] font-mono text-slate-200"
            title={`Battery Level: ${batteryPct}% (Connected to AC)`}
          >
            <span>{batteryPct}%</span>
            <svg className="w-3.5 h-3.5 -rotate-90 shrink-0" viewBox="0 0 16 16">
              <circle
                cx="8"
                cy="8"
                r={ringRadius}
                className="text-white/20"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="8"
                cy="8"
                r={ringRadius}
                className="text-white"
                strokeWidth="2"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          </div>

          {/* Pin */}
          <button
            onClick={togglePin}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isPinned ? 'text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
            title={isPinned ? 'Unpin' : 'Pin Open'}
          >
            {isPinned ? <Pin className="w-3.5 h-3.5 fill-sky-400" /> : <Pin className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Position (Free Drag & Snap) */}
          <button
            onClick={resetNotchPosition}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isCustomPositioned ? 'text-sky-400 hover:text-sky-300 bg-sky-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Reset Notch Position to Top-Center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveSubView('settings')}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              activeSubView === 'settings' ? 'text-sky-300' : 'text-slate-400 hover:text-white'
            }`}
            title="Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={collapseNotch}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
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
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-2.5">
          {/* SubView Navigation Header (Fixed) */}
          <div className="shrink-0 flex items-center justify-between pb-2 mb-2 border-b border-white/10 sticky top-0 z-10 bg-black/40 backdrop-blur-md px-1 py-1 rounded-lg">
            <button
              onClick={() => setActiveSubView(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {activeSubView === 'bluetooth'
                ? 'Bluetooth Devices & Peripherals'
                : activeSubView === 'clipboard'
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

          {/* SubView Scrollable Body */}
          <div
            ref={subViewScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll scroll-smooth overscroll-contain pr-1"
          >
            {activeSubView === 'bluetooth' && <BluetoothView />}
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
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Main Dashboard Scroll Container */}
          <div
            ref={dashboardScrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={(e) => e.stopPropagation()}
            onScroll={checkScrollState}
            className={`flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll scroll-smooth overscroll-contain p-2.5 flex flex-col gap-2.5 relative select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-default'
            }`}
          >
            {/* ============================================================ */}
            {/* 2A. PERSONALIZED GREETING BANNER WITH ANIMATION              */}
            {/* ============================================================ */}
            <PersonalizedGreetingBanner
              mode="dashboard"
              onOpenSettings={() => setActiveSubView('settings')}
            />

            {/* ============================================================ */}
            {/* 2B. MAIN TWO-COLUMN DASHBOARD GRID (Matching screenshot)     */}
            {/* ============================================================ */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0">
              {/* ========================================================== */}
              {/* LEFT COLUMN: MEDIA PLAYER GLASS CARD                       */}
              {/* ========================================================== */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between shadow-inner relative group">
                {/* Top Row: Thumbnail + Title */}
                <div className="flex items-center gap-2.5">
                  <div
                    onClick={() => audioEngine.toggle()}
                    className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 cursor-pointer shadow-sm group-hover:border-white/20 transition-all"
                  >
                    <Music2 className="w-5 h-5 text-slate-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      {isPlaying ? currentTrack.title : 'Not playing'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {isPlaying ? currentTrack.artist : 'Play something to see it here'}
                    </p>
                  </div>
                </div>

                {/* Open Media Player Centered Badge */}
                <div className="flex items-center justify-center my-1.5">
                  <button
                    onClick={() => setIsFullscreenMusicOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-black/80 hover:bg-black text-[11px] font-medium text-slate-200 hover:text-white border border-white/20 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open media player</span>
                  </button>
                </div>

                {/* Scrubber Progress Bar */}
                <div className="space-y-0.5">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      audioEngine.seek(ratio * (currentTrack.duration || 180));
                    }}
                    className="w-full h-1 bg-white/20 hover:bg-white/30 rounded-full relative cursor-pointer"
                  >
                    <div
                      className="h-full bg-white rounded-full relative"
                      style={{
                        width: `${Math.min(
                          100,
                          (currentTime / (currentTrack.duration || 180)) * 100
                        )}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{formatSecs(currentTime)}</span>
                    <span>{isPlaying ? formatSecs(currentTrack.duration) : '--:--'}</span>
                  </div>
                </div>

                {/* Playback Controls Row: Centered Big White Play Button */}
                <div className="flex items-center justify-center gap-6 pt-1">
                  <button
                    onClick={() => audioEngine.prevTrack()}
                    className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Previous Track"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => audioEngine.toggle()}
                    className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-black" />
                    ) : (
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => audioEngine.nextTrack()}
                    className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Next Track"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              {/* ========================================================== */}
              {/* RIGHT COLUMN: UTILITIES & TELEMETRY GLASS CARD             */}
              {/* ========================================================== */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between shadow-inner">
                {/* 1. Focus Timer Section (Rounded capsule) */}
                <div
                  onClick={() => {
                    if (isPomodoroRunning) pausePomodoro();
                    else startPomodoro();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
                  title={isPomodoroRunning ? 'Pause Focus' : 'Start Focus'}
                >
                  <div className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-xs font-semibold text-white">Focus timer</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs text-slate-300">
                    <span>{formatSecs(pomodoroSeconds)}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>

                {/* 2. System Usage Bars (CPU & RAM) */}
                <div className="space-y-2 py-1">
                  {/* CPU Bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-8 font-mono text-slate-400 text-[11px]">CPU</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${cpuUsage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px] font-bold text-slate-300">
                      {cpuUsage}%
                    </span>
                  </div>

                  {/* RAM Bar */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-8 font-mono text-slate-400 text-[11px]">RAM</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${ramUsage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px] font-bold text-slate-300">
                      {ramUsage}%
                    </span>
                  </div>
                </div>

                {/* 3. Network Telemetry */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="font-semibold text-white">Network</span>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" />
                      <span>{downSpeed}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3" />
                      <span>{upSpeed}</span>
                    </span>
                  </div>
                </div>

                {/* 4. Bottom 3 Pill Buttons (Calculator, Scissors, Activity) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                  <button
                    onClick={() => setIsCalculatorOpen(true)}
                    className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Glass Calculator"
                  >
                    <CalculatorIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCaptureScreen}
                    className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Screen Snipping"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setActiveSubView('time')}
                    className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Productivity Analytics"
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* 2C. EXTENDED SCROLLABLE CARDS (Revealed smoothly on scroll)  */}
            {/* ============================================================ */}

            {/* Card 4: Quick App Shortcuts Dock */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-bold text-white tracking-tight">Quick App Launch Dock</span>
                </div>
                <button
                  onClick={() => setIsQuickAppsOpen(true)}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Grid of 8 App Quick Launcher Tiles */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-0.5">
                {quickDockApps.map((app) => {
                  const IconComponent = app.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        soundService.playPop();
                        showToast({
                          appName: 'App Launcher',
                          title: `Opening ${app.name}`,
                          message: `Invoking ${app.exe} protocol...`,
                          icon: 'Play',
                          duration: 1800
                        });
                      }}
                      className="group flex flex-col items-center gap-1 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/5 hover:border-sky-400/30 transition-all cursor-pointer"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                        style={{ backgroundColor: `${app.color}20`, border: `1px solid ${app.color}40` }}
                      >
                        <IconComponent className="w-3.5 h-3.5" style={{ color: app.color }} />
                      </div>
                      <span className="text-[10px] font-medium text-slate-300 group-hover:text-white truncate max-w-full">
                        {app.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 5: Active Background Tasks & Downloads */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-white tracking-tight">Active Background Tasks</span>
                </div>
                <button
                  onClick={() => setActiveSubView('activities')}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <span>All Tasks</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Task Cards List */}
              <div className="space-y-1.5 pt-0.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                        <Download className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white truncate max-w-[200px]">
                            {task.title}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-sky-400 shrink-0 ml-2">
                            {task.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (task.status === 'running') pauseTask(task.id);
                          else resumeTask(task.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={task.status === 'running' ? 'Pause' : 'Resume'}
                      >
                        {task.status === 'running' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => cancelTask(task.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 6: Clipboard Stash & Drop Shelf Glance */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Recent Clipboard</span>
                  </div>
                  <button
                    onClick={() => setActiveSubView('clipboard')}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {(clipboardHistory && clipboardHistory.length > 0
                    ? clipboardHistory.slice(0, 2)
                    : [
                        { id: 'clip-1', text: 'https://github.com/chetandixit2407/Nova' },
                        { id: 'clip-2', text: 'npm run build' }
                      ]
                  ).map((clip) => (
                    <div
                      key={clip.id}
                      onClick={() => {
                        copyText(clip.text);
                        setCopiedRecentId(clip.id);
                        setTimeout(() => setCopiedRecentId(null), 1500);
                        soundService.playPop();
                      }}
                      className="p-1.5 rounded-lg bg-black/30 hover:bg-white/10 border border-white/5 text-[10px] font-mono text-slate-300 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      title="Click to Copy"
                    >
                      <span className="truncate max-w-[160px]">{clip.text}</span>
                      {copiedRecentId === clip.id ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <FolderUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Drop Shelf</span>
                  </div>
                  <button
                    onClick={() => setActiveSubView('shelf')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Open Shelf</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-black/30 border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-0.5">
                  <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-medium text-slate-300">
                    {dropShelfFiles && dropShelfFiles.length > 0
                      ? `${dropShelfFiles.length} file(s) staged`
                      : 'Drop files to top notch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Smart Phone Link & Live Notification Mirror */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900/40 to-slate-950/40 border border-sky-500/20 p-3 flex flex-col gap-2 shrink-0 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-bold text-white tracking-tight">Smart Phone Live Sync</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold">
                    WINDOWS NOTCH
                  </span>
                </div>
                <button
                  onClick={() => setIsPhoneSyncOpen(true)}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Configure</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {phoneDevice ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[11px]">{phoneDevice.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {phoneDevice.connectionType === 'bluetooth' ? 'Bluetooth LE (ANCS)' : 'Wi-Fi LAN Bridge'} • {phoneDevice.batteryLevel}% ⚡
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        phoneSyncService.triggerIncomingCall({
                          callerName: 'Sophia Martinez',
                          callerNumber: '+1 (555) 019-2834',
                          appType: 'cellular'
                        });
                        collapseNotch();
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Test live incoming call ringing animation on notch"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Test Call</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs">
                  <span className="text-[10px] text-slate-400">No smartphone connected</span>
                  <button
                    onClick={() => setIsPhoneSyncOpen(true)}
                    className="px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-white text-[10px] font-semibold cursor-pointer"
                  >
                    Pair Phone
                  </button>
                </div>
              )}
            </div>

            {/* Card 7: Audio & Luminance Quick Sliders */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Audio & Luminance Controls</span>
                <span className="text-[10px] font-mono text-slate-400">Live Hardware Sync</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Volume2 className="w-3 h-3 text-sky-400" />
                      Volume
                    </span>
                    <span className="font-mono text-[10px] font-bold text-white">{masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={masterVolume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400 interactive-control"
                  />
                </div>

                <div className="p-2 rounded-xl bg-black/30 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Sun className="w-3 h-3 text-amber-400" />
                      Brightness
                    </span>
                    <span className="font-mono text-[10px] font-bold text-white">{displayBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={displayBrightness}
                    onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400 interactive-control"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Breathing Space */}
            <div className="h-5 shrink-0" />
          </div>

          {/* Floating Scroll Indicator */}
          <AnimatePresence>
            {canScrollDown && (
              <motion.button
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={scrollDashboardDown}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-sky-400/35 text-sky-300 text-[10px] font-semibold shadow-xl shadow-black/80 backdrop-blur-md cursor-pointer group transition-all"
                title="Scroll down to view more cards"
              >
                <ChevronDown className="w-3 h-3 text-sky-400 animate-bounce group-hover:translate-y-0.5 transition-transform" />
                <span>More cards below</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. IN-NOTCH MODAL OVERLAYS (Contained cleanly within the Notch) */}
      {/* ============================================================== */}
      {isQuickAppsOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden rounded-[24px]">
          <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-1">
            <QuickAppsBarModal onClose={() => setIsQuickAppsOpen(false)} />
          </div>
        </div>
      )}
      {isProModalOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden rounded-[24px]">
          <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-1">
            <AIAgentProModal onClose={() => setIsProModalOpen(false)} />
          </div>
        </div>
      )}
      {isStoreModalOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden rounded-[24px]">
          <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-1">
            <MicrosoftStoreModal onClose={() => setIsStoreModalOpen(false)} />
          </div>
        </div>
      )}
      {isVolumeMixerOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden rounded-[24px]">
          <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-1">
            <VolumeMixerModal onClose={() => setIsVolumeMixerOpen(false)} />
          </div>
        </div>
      )}
      {isPhoneSyncOpen && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden rounded-[24px]">
          <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-1">
            <PhoneSyncModal onClose={() => setIsPhoneSyncOpen(false)} />
          </div>
        </div>
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
