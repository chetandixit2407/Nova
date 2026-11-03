export type NotchTheme = 
  | 'midnight'          // Deep black obsidian with subtle cyan sheen
  | 'windows-mica'      // Windows 11 Fluent dark acrylic with soft violet accents
  | 'cyber-glow'        // High-tech deep dark with neon emerald/teal border glow
  | 'oled-stealth'      // Pure black OLED #000000 minimal border
  | 'frosted-glass'     // Translucent blur with white frosty sheen
  | 'light-frost'       // Fluent Light theme with clean contrast
  | 'liquid-titanium'   // Pro: Metallic luster, chrome rim, silver reflection
  | 'supernova-horizon' // Pro: Cosmic amber/gold horizon glow and starlight
  | 'cyber-matrix-3d'   // Pro: Neon green/teal matrix stream & cyber depth
  | 'celestial-orrery'  // Pro: Astral deep indigo, sapphire starlight, orbit glow
  | 'prism-core';       // Pro: Spectral prismatic chromatic dispersion

export type NotchPlacement = 'top-center' | 'top-left' | 'top-right' | 'left' | 'right';

export type NotchTab = 
  | 'activities'
  | 'media'
  | 'ai_hub'
  | 'controls'
  | 'notifications'
  | 'settings';

export interface NotchConfig {
  theme: NotchTheme;
  compactWidth: number;       // default e.g. 210px (adjustable 100-340px)
  compactHeight: number;      // default e.g. 38px (adjustable 28-72px)
  expandedWidth: number;      // default e.g. 700px
  cornerRadius: number;       // default e.g. 24px
  topOffset: number;          // default e.g. 8px
  placement: NotchPlacement;  // flexible placement
  isDetached: boolean;        // Pro: Detached floating desktop screen widget
  opacity: number;            // 0.6 to 1.0
  blur: number;               // 8 to 40px
  glowIntensity: number;      // 0 to 100%
  glowColor: string;          // Hex or rgba
  hoverExpansion: boolean;    // auto expand on hover
  graceDelay: number;         // collapse delay in ms (e.g. 400ms)
  soundEnabled: boolean;      // Web Audio sound effects
  soundVolume: number;        // 0 to 1
  animationSpeed: 'snappy' | 'fluid' | 'gentle';
  notchPreset: 'custom' | 'dynamic_classic' | 'windows_fluent' | 'cyber_stealth' | 'compact_dot';
}

export interface LiveTask {
  id: string;
  title: string;
  type: 'download' | 'upload' | 'install' | 'copy' | 'timer' | 'record' | 'process';
  progress: number;           // 0 to 100
  speed?: string;             // e.g. "14.2 MB/s"
  detail?: string;            // e.g. "2.4 GB of 4.1 GB"
  status: 'running' | 'paused' | 'completed';
  icon: string;
  canPause?: boolean;
  canCancel?: boolean;
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;           // in seconds
  audioSrc?: string;          // for procedural or audio elements
  coverArt: string;
  genre: string;
}

export interface AppNotification {
  id: string;
  appName: string;
  title: string;
  message: string;
  timestamp: number;
  icon: string;
  isRead: boolean;
  priority: 'normal' | 'high' | 'urgent';
  actionLabel?: string;
  actionUrl?: string;
  animType?: 'message' | 'download' | 'download_complete' | 'warning' | 'error' | 'battery_low' | 'music' | 'timer_complete' | 'system_update' | 'default';
}

export interface ToastNotification {
  id: string;
  appName: string;
  title: string;
  message: string;
  timestamp: number;
  icon: string;
  priority?: 'normal' | 'high' | 'urgent';
  actionLabel?: string;
  duration?: number;
  animType?: 'message' | 'download' | 'download_complete' | 'warning' | 'error' | 'battery_low' | 'music' | 'timer_complete' | 'system_update' | 'default';
}

export interface AITool {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'Chat & Reasoning' | 'Code & Dev' | 'Search & Research' | 'Creative';
  iconName: string;
  isFavorite: boolean;
  isCustom?: boolean;
  color: string;
}

export interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
  charCount: number;
}

export interface SystemStatus {
  batteryLevel: number;        // 0 to 100
  isCharging: boolean;
  hasBattery: boolean;
  isOnline: boolean;
  effectiveType: string;       // e.g. "4g", "wifi"
  downlinkSpeed?: number;      // in Mbps
  brightness: number;          // 20 to 100%
  volume: number;              // 0 to 100%
  dndEnabled: boolean;
  focusMode: boolean;
  screenRecording: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
}

export interface HoveredCardInfo {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  value?: string;
  badge?: string;
  progress?: number;
  status?: string;
  color?: string;
}

export interface FlyingTextItem {
  id: string;
  text: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

// Pro 10: Drop Shelf item
export interface DropShelfFile {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  addedAt: number;
}

// Pro 2 & 3: AI Agents & Usage
export type AIAgentProvider = 'codex' | 'claude_code' | 'cursor' | 'antigravity';

export interface AIAgentPermissionApproval {
  id: string;
  agentId: AIAgentProvider;
  title: string;
  command: string;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AIAgentState {
  id: AIAgentProvider;
  name: string;
  isConnected: boolean;
  status: 'active' | 'idle' | 'executing' | 'waiting_approval' | 'indexing';
  activeTask?: string;
  gitBranch?: string;
  lastCommit?: string;
  usage: {
    used: number;
    limit: number;
    unit: string;
    resetTimeStr: string;
    percentage: number;
  };
}

// Pro 6: Synced Lyrics
export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

// Pro 7: Audio Output Switching
export interface AudioOutputDevice {
  id: string;
  label: string;
  kind: 'speaker' | 'headphones' | 'bluetooth' | 'monitor';
  isDefault: boolean;
  isActive: boolean;
}

// Pro 11: Clipboard Pro
export interface ClipboardProItem {
  id: string;
  text: string;
  type: 'text' | 'link' | 'color' | 'email' | 'code' | 'image';
  preview?: string; // image data or color hex
  pinned: boolean;
  timestamp: number;
  smartAction?: {
    label: string;
    action: string;
  };
}

// Pro 12: Quick Apps Bar
export interface QuickAppShortcut {
  id: string;
  title: string;
  icon: string;
  target: string;
  actionType: 'app' | 'url' | 'path';
}

// Pro 13: Volume Mixer
export interface AppVolumeSession {
  id: string;
  appName: string;
  icon: string;
  volume: number; // 0 to 100
  isMuted: boolean;
}


