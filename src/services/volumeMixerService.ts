import { AppVolumeSession } from '../types';
import { soundService } from './soundService';

const INITIAL_SESSIONS: AppVolumeSession[] = [
  { id: 'master', appName: 'Master Volume', icon: 'Volume2', volume: 80, isMuted: false },
  { id: 'spotify', appName: 'Spotify', icon: 'Music', volume: 75, isMuted: false },
  { id: 'chrome', appName: 'Google Chrome', icon: 'Globe', volume: 60, isMuted: false },
  { id: 'discord', appName: 'Discord', icon: 'MessageSquare', volume: 90, isMuted: false },
  { id: 'vscode', appName: 'VS Code (Terminal Beep)', icon: 'Terminal', volume: 50, isMuted: false },
  { id: 'system', appName: 'Windows System Sounds', icon: 'Bell', volume: 45, isMuted: false }
];

class VolumeMixerService {
  private sessions: AppVolumeSession[] = [...INITIAL_SESSIONS];
  private listeners: Set<() => void> = new Set();

  public getSessions(): AppVolumeSession[] {
    return this.sessions;
  }

  public setVolume(id: string, volume: number): void {
    this.sessions = this.sessions.map((s) =>
      s.id === id ? { ...s, volume: Math.max(0, Math.min(100, volume)), isMuted: volume === 0 } : s
    );
    this.notify();
  }

  public toggleMute(id: string): void {
    this.sessions = this.sessions.map((s) =>
      s.id === id ? { ...s, isMuted: !s.isMuted } : s
    );
    soundService.play('toggle');
    this.notify();
  }

  public muteAll(): void {
    const allMuted = this.sessions.every((s) => s.isMuted);
    this.sessions = this.sessions.map((s) => ({
      ...s,
      isMuted: !allMuted
    }));
    soundService.play('toggle');
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const volumeMixerService = new VolumeMixerService();
