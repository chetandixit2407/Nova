import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  NotchConfig,
  NotchTab,
  LiveTask,
  AppNotification,
  ToastNotification,
  AITool,
  ClipboardItem,
  SystemStatus,
  WeatherData,
  HoveredCardInfo,
  FlyingTextItem,
  NotchPlacement,
  DropShelfFile
} from '../types';
import { soundService } from '../services/soundService';
import { systemService } from '../services/systemService';
import { audioEngine } from '../services/audioEngine';
import { phoneSyncService } from '../services/phoneSyncService';

const DEFAULT_CONFIG: NotchConfig = {
  theme: 'midnight',
  compactWidth: 340,
  compactHeight: 38,
  expandedWidth: 620,
  cornerRadius: 24,
  topOffset: 8,
  placement: 'top-center',
  isDetached: false,
  opacity: 0.96,
  blur: 24,
  glowIntensity: 50,
  glowColor: '#38bdf8',
  hoverExpansion: true,
  graceDelay: 240,
  soundEnabled: true,
  soundVolume: 0.5,
  animationSpeed: 'fluid',
  notchPreset: 'dynamic_classic'
};

const DEFAULT_AI_TOOLS: AITool[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    description: 'Multimodal AI by Google with 1M+ context window and deep search grounding.',
    category: 'Chat & Reasoning',
    iconName: 'Sparkles',
    isFavorite: true,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    description: 'OpenAI conversational model with reasoning, canvas, and advanced voice.',
    category: 'Chat & Reasoning',
    iconName: 'Bot',
    isFavorite: true,
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com',
    description: 'Native Windows everyday AI companion built into Microsoft 365 and Edge.',
    category: 'Chat & Reasoning',
    iconName: 'Laptop',
    isFavorite: true,
    color: 'from-sky-500 to-blue-600'
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai',
    description: 'Anthropic AI known for nuanced writing, coding artifacts, and large docs.',
    category: 'Code & Dev',
    iconName: 'Code',
    isFavorite: true,
    color: 'from-amber-600 to-orange-500'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com',
    description: 'Open-weight reasoning model with exceptional mathematical and coding power.',
    category: 'Code & Dev',
    iconName: 'Cpu',
    isFavorite: false,
    color: 'from-cyan-500 to-blue-700'
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    url: 'https://www.perplexity.ai',
    description: 'AI-powered conversational search engine with cited real-time web sources.',
    category: 'Search & Research',
    iconName: 'Search',
    isFavorite: true,
    color: 'from-teal-500 to-emerald-700'
  },
  {
    id: 'grok',
    name: 'Grok',
    url: 'https://x.com/i/grok',
    description: 'Real-time conversational AI with direct live access to the X global stream.',
    category: 'Search & Research',
    iconName: 'Compass',
    isFavorite: false,
    color: 'from-slate-700 to-zinc-900'
  }
];

export const EXCLUDED_ACTIVITY_PATTERNS = ['KB5043145', 'task-win-update'];

export const isExcludedActivity = (title?: string, id?: string): boolean => {
  if (!title && !id) return false;
  return EXCLUDED_ACTIVITY_PATTERNS.some(
    (pattern) => (title && title.includes(pattern)) || (id && id.includes(pattern))
  );
};

const INITIAL_TASKS: LiveTask[] = [
  {
    id: 'task-vscode-dl',
    title: 'Downloading VS Code v1.95 (x64)',
    type: 'download',
    progress: 42,
    speed: '12.4 MB/s',
    detail: '48.2 MB of 114.7 MB · 6s remaining',
    status: 'running',
    icon: 'Download',
    canPause: true,
    canCancel: true
  },
  {
    id: 'task-directx-runtime',
    title: 'DirectX 12 End-User Runtimes',
    type: 'install',
    progress: 84,
    speed: '16.8 MB/s',
    detail: 'Verifying cryptographic digital signatures',
    status: 'running',
    icon: 'ShieldCheck',
    canPause: true,
    canCancel: true
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    appName: 'Windows Security',
    title: 'Virus & Threat Protection',
    message: 'Quick scan completed. No active threats detected on system drives.',
    timestamp: Date.now() - 1000 * 60 * 4,
    icon: 'Shield',
    isRead: false,
    priority: 'normal',
    actionLabel: 'View Report'
  },
  {
    id: 'notif-2',
    appName: 'Microsoft Outlook',
    title: 'Quarterly Architecture Sync',
    message: 'Starting in 15 minutes · Join Microsoft Teams meeting',
    timestamp: Date.now() - 1000 * 60 * 18,
    icon: 'Mail',
    isRead: false,
    priority: 'high',
    actionLabel: 'Join Meeting'
  },
  {
    id: 'notif-3',
    appName: 'GitHub Desktop',
    title: 'Pull Request Merged',
    message: 'PR #142 "Dynamic Island Notch spring transitions" merged into main.',
    timestamp: Date.now() - 1000 * 60 * 55,
    icon: 'GitPullRequest',
    isRead: true,
    priority: 'normal'
  }
];

interface NotchContextValue {
  config: NotchConfig;
  updateConfig: (patch: Partial<NotchConfig>) => void;
  applyPreset: (preset: NotchConfig['notchPreset']) => void;
  resetConfig: () => void;
  isExpanded: boolean;
  isPinned: boolean;
  togglePin: () => void;
  activeTab: NotchTab;
  setActiveTab: (tab: NotchTab) => void;
  expandNotch: () => void;
  collapseNotch: () => void;
  toggleExpand: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  tasks: LiveTask[];
  addTask: (task: Omit<LiveTask, 'id'>) => void;
  pauseTask: (id: string) => void;
  resumeTask: (id: string) => void;
  cancelTask: (id: string) => void;
  clearCompletedTasks: () => void;
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  triggerTestNotification: () => void;
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  dndEnabled: boolean;
  toggleDND: () => void;
  aiTools: AITool[];
  addCustomAITool: (tool: Omit<AITool, 'id'>) => void;
  removeAITool: (id: string) => void;
  toggleFavoriteAI: (id: string) => void;
  clipboardHistory: ClipboardItem[];
  copyText: (text: string) => Promise<boolean>;
  readSystemClipboard: () => Promise<void>;
  clearClipboard: () => void;
  quickNotes: string;
  setQuickNotes: (notes: string) => void;
  systemStatus: SystemStatus;
  weather: WeatherData | null;
  refreshWeather: () => Promise<void>;
  viewMode: 'desktop' | 'overlay';
  setViewMode: (mode: 'desktop' | 'overlay') => void;
  wallpaperIndex: number;
  setWallpaperIndex: (idx: number) => void;
  isScreenCopyMode: boolean;
  toggleScreenCopyMode: () => void;
  setScreenCopyMode: (val: boolean) => void;
  flyingTextItems: FlyingTextItem[];
  triggerFlyToNotch: (text: string, startX?: number, startY?: number) => void;
  removeFlyingTextItem: (id: string) => void;
  isNotchIngesting: boolean;
  pomodoroSeconds: number;
  isPomodoroRunning: boolean;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  activeActivityCount: number;
  hoveredCardInfo: HoveredCardInfo | null;
  showLiveActivities: boolean;
  setShowLiveActivities: (show: boolean) => void;
  toggleLiveActivities: () => void;
  // Pro Features:
  invisibilityCloakActive: boolean;
  toggleInvisibilityCloak: () => void;
  setInvisibilityCloakActive: (active: boolean) => void;
  isDetached: boolean;
  toggleDetached: () => void;
  dropShelfFiles: DropShelfFile[];
  addDropShelfFiles: (files: DropShelfFile[]) => void;
  removeDropShelfFile: (id: string) => void;
  clearDropShelf: () => void;
  isFullscreenMusicOpen: boolean;
  setIsFullscreenMusicOpen: (val: boolean) => void;
  setPlacement: (placement: NotchPlacement) => void;
  setDimensions: (width: number, height: number) => void;
  eyesOnlyMode: boolean;
  setEyesOnlyMode: (val: boolean) => void;
  toggleEyesOnlyMode: () => void;
  notchPosition: { x: number; y: number } | null;
  setNotchPosition: (pos: { x: number; y: number } | null) => void;
  resetNotchPosition: () => void;
  isCustomPositioned: boolean;
}

const NotchContext = createContext<NotchContextValue | null>(null);

export const NotchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved config
  const [config, setConfig] = useState<NotchConfig>(() => {
    try {
      const saved = localStorage.getItem('nova_notch_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed, isDetached: false, hoverExpansion: true, graceDelay: 240 };
      }
      return { ...DEFAULT_CONFIG, isDetached: false, hoverExpansion: true, graceDelay: 240 };
    } catch {
      return { ...DEFAULT_CONFIG, isDetached: false, hoverExpansion: true, graceDelay: 240 };
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<NotchTab>('activities');
  const [tasks, setTasks] = useState<LiveTask[]>(() => {
    try {
      const saved = localStorage.getItem('nova_live_tasks');
      if (saved) {
        const parsed: LiveTask[] = JSON.parse(saved);
        return parsed.filter((t) => !isExcludedActivity(t.title, t.id));
      }
      return INITIAL_TASKS.filter((t) => !isExcludedActivity(t.title, t.id));
    } catch {
      return INITIAL_TASKS.filter((t) => !isExcludedActivity(t.title, t.id));
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('nova_notifications');
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        return parsed.filter((n) => !isExcludedActivity(n.title, n.id) && !n.message?.includes('KB5043145'));
      }
      return INITIAL_NOTIFICATIONS.filter((n) => !isExcludedActivity(n.title, n.id) && !n.message?.includes('KB5043145'));
    } catch {
      return INITIAL_NOTIFICATIONS.filter((n) => !isExcludedActivity(n.title, n.id) && !n.message?.includes('KB5043145'));
    }
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [dndEnabled, setDndEnabled] = useState<boolean>(false);

  const [aiTools, setAiTools] = useState<AITool[]>(() => {
    try {
      const saved = localStorage.getItem('nova_ai_tools');
      return saved ? JSON.parse(saved) : DEFAULT_AI_TOOLS;
    } catch {
      return DEFAULT_AI_TOOLS;
    }
  });

  const [clipboardHistory, setClipboardHistory] = useState<ClipboardItem[]>([
    { id: 'cb-1', text: 'git commit -m "feat(notch): implement fluid dynamic island"', timestamp: Date.now() - 1000 * 60 * 12, charCount: 61 },
    { id: 'cb-2', text: 'npm run electron:msix', timestamp: Date.now() - 1000 * 60 * 35, charCount: 21 },
    { id: 'cb-3', text: 'https://ais-dev-nhouojev3vrlirkjcgsyzw-870296140886.asia-east1.run.app', timestamp: Date.now() - 1000 * 60 * 70, charCount: 71 }
  ]);

  const [quickNotes, setQuickNotesState] = useState<string>(() => {
    return localStorage.getItem('nova_quick_notes') || '• Polish Windows mica acrylic reflection\n• Verify 60fps spring transitions\n• Test MediaSession audio controls';
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    batteryLevel: 94,
    isCharging: true,
    hasBattery: true,
    isOnline: true,
    effectiveType: 'wifi',
    downlinkSpeed: 65,
    brightness: 90,
    volume: 50,
    dndEnabled: false,
    focusMode: false,
    screenRecording: false
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [viewMode, setViewModeState] = useState<'desktop' | 'overlay'>(() => {
    try {
      const saved = localStorage.getItem('nova_view_mode');
      if (saved === 'desktop' || saved === 'overlay') return saved;
    } catch {}
    return 'desktop';
  });

  const setViewMode = useCallback((mode: 'desktop' | 'overlay') => {
    setViewModeState(mode);
    try {
      localStorage.setItem('nova_view_mode', mode);
    } catch {}
    soundService.playTick();
  }, []);
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(0);
  const [isScreenCopyMode, setIsScreenCopyMode] = useState<boolean>(false);
  const [flyingTextItems, setFlyingTextItems] = useState<FlyingTextItem[]>([]);
  const [isNotchIngesting, setIsNotchIngesting] = useState<boolean>(false);

  // Pomodoro
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);

  // Live Card Hover Glance (streamed to notch)
  const [hoveredCardInfo, setHoveredCardInfo] = useState<HoveredCardInfo | null>(null);

  // Option to show / hide live activities (music, active tasks, timers) in collapsed notch
  const [showLiveActivities, setShowLiveActivitiesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nova_show_live_activities');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const setShowLiveActivities = useCallback((show: boolean) => {
    setShowLiveActivitiesState(show);
    localStorage.setItem('nova_show_live_activities', JSON.stringify(show));
    soundService.playTick();
  }, []);

  const toggleLiveActivities = useCallback(() => {
    setShowLiveActivitiesState((prev) => {
      const next = !prev;
      localStorage.setItem('nova_show_live_activities', JSON.stringify(next));
      soundService.playTick();
      return next;
    });
  }, []);

  const collapseTimerRef = useRef<number | null>(null);
  const hoverOpenTimerRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const lastToggleTimeRef = useRef<number>(0);

  // Save config
  const updateConfig = useCallback((patch: Partial<NotchConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('nova_notch_config', JSON.stringify(next));
      soundService.setEnabled(next.soundEnabled);
      soundService.setVolume(next.soundVolume);
      return next;
    });
  }, []);

  // Pro Features State — always boot directly into compact Smart Notch on launch
  const [invisibilityCloakActive, setInvisibilityCloakActive] = useState<boolean>(false);
  const [isDetached, setIsDetached] = useState<boolean>(false);
  const [dropShelfFiles, setDropShelfFiles] = useState<DropShelfFile[]>([]);
  const [isFullscreenMusicOpen, setIsFullscreenMusicOpen] = useState<boolean>(false);
  const [eyesOnlyMode, setEyesOnlyMode] = useState<boolean>(false);

  const toggleEyesOnlyMode = useCallback(() => {
    setEyesOnlyMode((prev) => {
      const next = !prev;
      soundService.playPop();
      return next;
    });
  }, []);

  const toggleInvisibilityCloak = useCallback(() => {
    setInvisibilityCloakActive((prev) => {
      const next = !prev;
      if (next) soundService.play('notch_expand');
      else soundService.play('notch_collapse');
      return next;
    });
  }, []);

  const toggleDetached = useCallback(() => {
    setIsDetached((prev) => {
      const next = !prev;
      updateConfig({ isDetached: next });
      if (next) soundService.play('notch_expand');
      else soundService.play('notch_collapse');
      return next;
    });
  }, [updateConfig]);

  const addDropShelfFiles = useCallback((newFiles: DropShelfFile[]) => {
    setDropShelfFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeDropShelfFile = useCallback((id: string) => {
    setDropShelfFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearDropShelf = useCallback(() => {
    setDropShelfFiles([]);
  }, []);

  const setPlacement = useCallback((placement: NotchPlacement) => {
    updateConfig({ placement });
    soundService.play('toggle');
  }, [updateConfig]);

  const setDimensions = useCallback((compactWidth: number, compactHeight: number) => {
    updateConfig({ compactWidth, compactHeight });
  }, [updateConfig]);

  // Dynamic Free-floating screen coordinates (draggable anywhere, persisted in localStorage)
  const [notchPosition, setNotchPositionState] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('nova_notch_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const setNotchPosition = useCallback((pos: { x: number; y: number } | null) => {
    setNotchPositionState(pos);
    if (pos) {
      try {
        localStorage.setItem('nova_notch_position', JSON.stringify(pos));
      } catch {}
    } else {
      try {
        localStorage.removeItem('nova_notch_position');
      } catch {}
    }
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Alt+H for Invisibility Cloak, Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleInvisibilityCloak();
      } else if (e.key === 'Escape' && invisibilityCloakActive) {
        setInvisibilityCloakActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invisibilityCloakActive, toggleInvisibilityCloak]);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('nova_notch_config');
    soundService.setEnabled(DEFAULT_CONFIG.soundEnabled);
    soundService.setVolume(DEFAULT_CONFIG.soundVolume);
  }, []);

  const applyPreset = useCallback((preset: NotchConfig['notchPreset']) => {
    let patch: Partial<NotchConfig> = { notchPreset: preset };
    switch (preset) {
      case 'dynamic_classic':
        patch = {
          theme: 'midnight',
          compactWidth: 200,
          compactHeight: 36,
          expandedWidth: 380,
          cornerRadius: 20,
          glowIntensity: 50,
          glowColor: '#38bdf8',
          opacity: 0.96,
          blur: 24,
          animationSpeed: 'fluid'
        };
        break;
      case 'windows_fluent':
        patch = {
          theme: 'windows-mica',
          compactWidth: 210,
          compactHeight: 38,
          expandedWidth: 390,
          cornerRadius: 18,
          glowIntensity: 45,
          glowColor: '#818cf8',
          opacity: 0.92,
          blur: 32,
          animationSpeed: 'fluid'
        };
        break;
      case 'cyber_stealth':
        patch = {
          theme: 'cyber-glow',
          compactWidth: 200,
          compactHeight: 36,
          expandedWidth: 380,
          cornerRadius: 14,
          glowIntensity: 75,
          glowColor: '#10b981',
          opacity: 0.98,
          blur: 16,
          animationSpeed: 'snappy'
        };
        break;
      case 'compact_dot':
        patch = {
          theme: 'oled-stealth',
          compactWidth: 175,
          compactHeight: 34,
          expandedWidth: 360,
          cornerRadius: 18,
          glowIntensity: 20,
          glowColor: '#ffffff',
          opacity: 1.0,
          blur: 12,
          animationSpeed: 'snappy'
        };
        break;
      default:
        break;
    }
    updateConfig({ ...patch, notchPreset: preset });
    soundService.playTick();
  }, [updateConfig]);

  const setActiveTab = useCallback((tab: NotchTab) => {
    setActiveTabState(tab);
    soundService.playTick();
  }, []);

  const expandNotch = useCallback(() => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    setIsExpanded((prev) => {
      if (!prev) soundService.playPop();
      return true;
    });
  }, []);

  const collapseNotch = useCallback(() => {
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (isPinned) return; // Do not collapse if pinned
    setIsExpanded((prev) => {
      if (prev) soundService.playSnap();
      return false;
    });
  }, [isPinned]);

  const toggleExpand = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 160) return; // Debounce rapid double clicks
    lastToggleTimeRef.current = now;

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    setIsExpanded((prev) => {
      if (!prev) soundService.playPop();
      else soundService.playSnap();
      return !prev;
    });
  }, []);

  const togglePin = useCallback(() => {
    setIsPinned((prev) => {
      soundService.playTick();
      return !prev;
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    // Anti-flicker delay of 60ms: expands smoothly when cursor enters notch
    hoverOpenTimerRef.current = window.setTimeout(() => {
      if (isHoveredRef.current) {
        expandNotch();
      }
    }, 60);
  }, [expandNotch]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    if (isPinned) return;

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    // Grace delay of 240ms so moving cursor between notch and app shortcuts never collapses prematurely
    collapseTimerRef.current = window.setTimeout(() => {
      if (!isHoveredRef.current && !isPinned) {
        collapseNotch();
      }
    }, 240);
  }, [isPinned, collapseNotch]);

  // Tasks actions
  const addTask = useCallback((task: Omit<LiveTask, 'id'>) => {
    if (isExcludedActivity(task.title)) return;
    const id = `task-${Date.now()}`;
    const newTask: LiveTask = { ...task, id };
    setTasks((prev) => {
      const updated = [newTask, ...prev.filter((t) => !isExcludedActivity(t.title, t.id))];
      try {
        localStorage.setItem('nova_live_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    soundService.playTick();
  }, []);

  const pauseTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'paused' } : t))
    );
    soundService.playTick();
  }, []);

  const resumeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'running' } : t))
    );
    soundService.playTick();
  }, []);

  const cancelTask = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem('nova_live_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    soundService.playSnap();
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.status !== 'completed');
      try {
        localStorage.setItem('nova_live_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    soundService.playTick();
  }, []);

  // Live task progression tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.status !== 'running') return t;
          const increment = Math.random() * 2.2 + 0.8;
          const nextProgress = Math.min(100, Math.round(t.progress + increment));
          if (nextProgress >= 100 && t.progress < 100) {
            soundService.playSuccess();
            return {
              ...t,
              progress: 100,
              status: 'completed',
              speed: 'Done',
              detail: 'Operation completed successfully'
            };
          }
          return {
            ...t,
            progress: nextProgress
          };
        })
      );
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  // Notifications
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    soundService.playTick();
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    soundService.playTick();
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
      if (dndEnabled) return;
      if (isExcludedActivity(toast.title) || toast.message?.includes('KB5043145')) return;
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast: ToastNotification = {
        ...toast,
        id,
        timestamp: Date.now(),
        duration: toast.duration || 1000 // Exactly 1 second display then auto-hide
      };
      setToasts((prev) => [newToast, ...prev.filter((t) => t.title !== toast.title)].slice(0, 4));
      soundService.playChime();
    },
    [dndEnabled]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    soundService.playSnap();
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const resetNotchPosition = useCallback(() => {
    setNotchPosition(null);
    systemService.resetNativeWindowPosition();
    soundService.play('notch_collapse');
    showToast({
      appName: 'NOVA Island',
      title: 'Position Reset',
      message: 'Restored to original top-center position',
      icon: 'RotateCcw',
      duration: 1600
    });
  }, [setNotchPosition, showToast]);

  // Real-time phone notification subscription
  useEffect(() => {
    const unsub = phoneSyncService.onToast((toast) => {
      if (dndEnabled) return;
      setToasts((prev) => [toast, ...prev.filter((t) => t.id !== toast.id)].slice(0, 4));
      setNotifications((prev) => [
        {
          id: toast.id,
          appName: toast.appName,
          title: toast.title,
          message: toast.message,
          timestamp: toast.timestamp,
          icon: toast.icon,
          isRead: false,
          priority: 'high',
          animType: toast.animType,
          sender: toast.sender
        },
        ...prev
      ]);
    });
    return unsub;
  }, [dndEnabled]);

  const triggerTestNotification = useCallback(async () => {
    const testTitles = [
      { app: 'Windows Terminal', title: 'Build Succeeded', msg: 'Electron MSIX v1.0.2.0 package generated in release/NOVA-NOTCH-1.0.2.0-x64.msix.' },
      { app: 'Spotify', title: 'Now Playing', msg: 'Synthwave Nightscape by NOVA Audio.' },
      { app: 'Windows Backup', title: 'Cloud Sync Completed', msg: 'All system files safely synchronized to OneDrive.' }
    ];
    const picked = testTitles[Math.floor(Math.random() * testTitles.length)];
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      appName: picked.app,
      title: picked.title,
      message: picked.msg,
      timestamp: Date.now(),
      icon: 'Bell',
      isRead: false,
      priority: 'high'
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast({
      appName: picked.app,
      title: picked.title,
      message: picked.msg,
      icon: 'Bell',
      priority: 'high',
      actionLabel: 'View'
    });
    await systemService.sendNativeNotification(picked.title, { body: picked.msg });
  }, [showToast]);

  const toggleDND = useCallback(() => {
    setDndEnabled((prev) => {
      const next = !prev;
      setSystemStatus((s) => ({ ...s, dndEnabled: next }));
      soundService.playTick();
      return next;
    });
  }, []);

  // AI Tools
  const addCustomAITool = useCallback((tool: Omit<AITool, 'id'>) => {
    const id = `ai-${Date.now()}`;
    const newTool: AITool = { ...tool, id, isCustom: true };
    setAiTools((prev) => {
      const next = [...prev, newTool];
      localStorage.setItem('nova_ai_tools', JSON.stringify(next));
      return next;
    });
    soundService.playSuccess();
  }, []);

  const removeAITool = useCallback((id: string) => {
    setAiTools((prev) => {
      const next = prev.filter((t) => t.id !== id);
      localStorage.setItem('nova_ai_tools', JSON.stringify(next));
      return next;
    });
    soundService.playTick();
  }, []);

  const toggleFavoriteAI = useCallback((id: string) => {
    setAiTools((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
      localStorage.setItem('nova_ai_tools', JSON.stringify(next));
      return next;
    });
    soundService.playTick();
  }, []);

  // Clipboard
  const copyText = useCallback(async (text: string) => {
    const success = await systemService.copyToClipboard(text);
    if (success) {
      soundService.playPop();
      setClipboardHistory((prev) => [
        { id: `cb-${Date.now()}`, text, timestamp: Date.now(), charCount: text.length },
        ...prev.filter((c) => c.text !== text)
      ]);
    }
    return success;
  }, []);

  const readSystemClipboard = useCallback(async () => {
    const text = await systemService.readClipboard();
    if (text && text.trim()) {
      setClipboardHistory((prev) => [
        { id: `cb-${Date.now()}`, text, timestamp: Date.now(), charCount: text.length },
        ...prev.filter((c) => c.text !== text)
      ]);
      soundService.playTick();
    }
  }, []);

  const clearClipboard = useCallback(() => {
    setClipboardHistory([]);
    soundService.playTick();
  }, []);

  const setQuickNotes = useCallback((notes: string) => {
    setQuickNotesState(notes);
    localStorage.setItem('nova_quick_notes', notes);
  }, []);

  // Weather
  const refreshWeather = useCallback(async () => {
    const data = await systemService.fetchWeather();
    setWeather(data);
  }, []);

  // Screen Click-to-Copy & Fly-to-Notch System (Dynamic Island style)
  const toggleScreenCopyMode = useCallback(() => {
    setIsScreenCopyMode((prev) => {
      const next = !prev;
      if (next) {
        soundService.playPop();
        showToast({
          appName: 'Screen Text Grabber',
          title: 'Text Grabber Active',
          message: 'Click any text on the screen to fly it into Notch Clipboard.',
          icon: 'MousePointerClick',
          duration: 2400
        });
      } else {
        soundService.playSnap();
      }
      return next;
    });
  }, [showToast]);

  const setScreenCopyMode = useCallback((val: boolean) => {
    setIsScreenCopyMode(val);
  }, []);

  const triggerFlyToNotch = useCallback((text: string, startX?: number, startY?: number) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const id = `fly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Default start position is near cursor or center if omitted
    const x = startX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 400);
    const y = startY ?? (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500);
    const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
    const targetY = config.topOffset + 20;

    const newItem: FlyingTextItem = {
      id,
      text: cleanText,
      startX: x,
      startY: y,
      targetX,
      targetY
    };

    setFlyingTextItems((prev) => [...prev, newItem]);

    // Copy to system clipboard
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanText).catch(() => {});
    }

    // Save to notch clipboard history immediately
    setClipboardHistory((prev) => [
      { id: `cb-${Date.now()}`, text: cleanText, timestamp: Date.now(), charCount: cleanText.length },
      ...prev.filter((c) => c.text !== cleanText)
    ]);

    // Fly duration: ~620ms, then trigger Notch swallow / absorption bounce & sound
    window.setTimeout(() => {
      setIsNotchIngesting(true);
      soundService.playIngest();

      // Show brief notification toast in notch
      showToast({
        appName: 'Notch Clipboard',
        title: 'Copied to Notch',
        message: cleanText.length > 40 ? `${cleanText.slice(0, 40)}...` : cleanText,
        icon: 'Copy',
        duration: 1800
      });

      window.setTimeout(() => {
        setIsNotchIngesting(false);
      }, 420);

      // Remove from flying items
      setFlyingTextItems((prev) => prev.filter((item) => item.id !== id));
    }, 620);
  }, [config.topOffset, showToast]);

  const removeFlyingTextItem = useCallback((id: string) => {
    setFlyingTextItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Pomodoro timer
  const startPomodoro = useCallback(() => {
    setIsPomodoroRunning(true);
    soundService.playTick();
  }, []);

  const pausePomodoro = useCallback(() => {
    setIsPomodoroRunning(false);
    soundService.playTick();
  }, []);

  const resetPomodoro = useCallback(() => {
    setIsPomodoroRunning(false);
    setPomodoroSeconds(25 * 60);
    soundService.playTick();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isPomodoroRunning) {
      interval = window.setInterval(() => {
        setPomodoroSeconds((sec) => {
          if (sec <= 1) {
            soundService.playSuccess();
            setIsPomodoroRunning(false);
            return 25 * 60;
          }
          return sec - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning]);

  // Initial system monitor mount
  useEffect(() => {
    systemService.getBatteryStatus((status) => {
      setSystemStatus((prev) => ({
        ...prev,
        batteryLevel: status.level,
        isCharging: status.charging,
        hasBattery: status.hasBattery
      }));
    });

    const net = systemService.getNetworkInfo();
    setSystemStatus((prev) => ({
      ...prev,
      isOnline: net.isOnline,
      effectiveType: net.effectiveType,
      downlinkSpeed: net.downlinkSpeed
    }));

    refreshWeather();

    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes notch
      if (e.key === 'Escape') {
        if (isExpanded) {
          collapseNotch();
        }
      }
      // Alt + Space or Alt + N toggles notch
      if ((e.altKey && e.code === 'Space') || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        toggleExpand();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Subscribe to Windows System Tray & Global Shortcut events via secure Electron preload bridge
    let unlistenOpenTab: (() => void) | null = null;
    let unlistenToggleExpand: (() => void) | null = null;

    if (window.electronAPI?.onOpenTab) {
      unlistenOpenTab = window.electronAPI.onOpenTab((requestedTab) => {
        if (requestedTab) {
          setActiveTabState(requestedTab as NotchTab);
          window.dispatchEvent(new CustomEvent('nova:open-subview', { detail: requestedTab }));
        }
        expandNotch();
      });
    }

    if (window.electronAPI?.onToggleExpand) {
      unlistenToggleExpand = window.electronAPI.onToggleExpand(() => {
        toggleExpand();
      });
    }

    const handleCustomOpenTab = (ev: Event) => {
      const detail = (ev as CustomEvent<NotchTab>).detail;
      if (detail) {
        setActiveTabState(detail);
      }
      expandNotch();
    };
    window.addEventListener('nova:open-tab', handleCustomOpenTab);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('nova:open-tab', handleCustomOpenTab);
      if (unlistenOpenTab) unlistenOpenTab();
      if (unlistenToggleExpand) unlistenToggleExpand();
    };
  }, [isExpanded, collapseNotch, toggleExpand, expandNotch, refreshWeather]);

  const activeActivityCount = tasks.filter((t) => t.status === 'running').length;

  return (
    <NotchContext.Provider
      value={{
        config,
        updateConfig,
        applyPreset,
        resetConfig,
        isExpanded,
        isPinned,
        togglePin,
        activeTab,
        setActiveTab,
        expandNotch,
        collapseNotch,
        toggleExpand,
        handleMouseEnter,
        handleMouseLeave,
        tasks,
        addTask,
        pauseTask,
        resumeTask,
        cancelTask,
        clearCompletedTasks,
        notifications,
        dismissNotification,
        clearAllNotifications,
        triggerTestNotification,
        toasts,
        showToast,
        dismissToast,
        clearAllToasts,
        dndEnabled,
        toggleDND,
        aiTools,
        addCustomAITool,
        removeAITool,
        toggleFavoriteAI,
        clipboardHistory,
        copyText,
        readSystemClipboard,
        clearClipboard,
        quickNotes,
        setQuickNotes,
        systemStatus,
        weather,
        refreshWeather,
        viewMode,
        setViewMode,
        wallpaperIndex,
        setWallpaperIndex,
        isScreenCopyMode,
        toggleScreenCopyMode,
        setScreenCopyMode,
        flyingTextItems,
        triggerFlyToNotch,
        removeFlyingTextItem,
        isNotchIngesting,
        pomodoroSeconds,
        isPomodoroRunning,
        startPomodoro,
        pausePomodoro,
        resetPomodoro,
        activeActivityCount,
        hoveredCardInfo,
        showLiveActivities,
        setShowLiveActivities,
        toggleLiveActivities,
        // Pro Features:
        invisibilityCloakActive,
        toggleInvisibilityCloak,
        setInvisibilityCloakActive,
        isDetached,
        toggleDetached,
        dropShelfFiles,
        addDropShelfFiles,
        removeDropShelfFile,
        clearDropShelf,
        isFullscreenMusicOpen,
        setIsFullscreenMusicOpen,
        setPlacement,
        setDimensions,
        eyesOnlyMode,
        setEyesOnlyMode,
        toggleEyesOnlyMode,
        notchPosition,
        setNotchPosition,
        resetNotchPosition,
        isCustomPositioned: notchPosition !== null
      }}
    >
      {children}
    </NotchContext.Provider>
  );
};

export const useNotch = () => {
  const ctx = useContext(NotchContext);
  if (!ctx) throw new Error('useNotch must be used within NotchProvider');
  return ctx;
};
