export interface ElectronAutostartStatus {
  openAtLogin: boolean;
  isWindowsStore: boolean;
}

export interface ElectronSystemMetrics {
  cpuPercent: number;
  memoryPercent: number;
  usedMemoryGB: number;
  totalMemoryGB: number;
  uptimeSeconds: number;
}

export interface ElectronNotchSyncPayload {
  isExpanded: boolean;
  width: number;
  height: number;
  reveal?: boolean;
  fullscreen?: boolean;
}

export interface ElectronAppLaunchPayload {
  id?: string;
  name?: string;
  protocol?: string;
  exePath?: string;
  processName?: string;
}

export interface ElectronAPI {
  readonly isElectron: boolean;
  readonly platform: string;
  syncNotchWindow: (payload: ElectronNotchSyncPayload) => Promise<boolean>;
  moveNotchWindow: (dx: number, dy: number) => Promise<boolean>;
  resetNotchWindow: () => Promise<boolean>;
  toggleNotchVisibility: () => Promise<boolean>;
  openExternal: (url: string) => Promise<boolean>;
  launchApp: (payload: ElectronAppLaunchPayload) => Promise<{
    success: boolean;
    method?: string;
    error?: string;
  }>;
  sendNotification: (payload: {
    title: string;
    body?: string;
    silent?: boolean;
  }) => Promise<boolean>;
  readClipboardText: () => Promise<string>;
  writeClipboardText: (text: string) => Promise<boolean>;
  clearClipboard: () => Promise<boolean>;
  getAutostart: () => Promise<ElectronAutostartStatus>;
  setAutostart: (enabled: boolean) => Promise<ElectronAutostartStatus>;
  getSystemMetrics: () => Promise<ElectronSystemMetrics>;
  onOpenTab: (callback: (tab: string) => void) => () => void;
  onToggleExpand: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
