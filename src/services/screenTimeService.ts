/**
 * Screen Time & Application Productivity Analytics Service
 * Real-time foreground application tracking, daily/weekly metrics, productivity scoring.
 */

import { AppUsageStat, ScreenTimeReport } from '../types';
import { windowActivityService, WindowsApp } from './windowActivityService';

const APP_CATEGORIES: Record<string, { category: AppUsageStat['category']; color: string; isProductive: boolean }> = {
  vscode: { category: 'code', color: '#007acc', isProductive: true },
  terminal: { category: 'terminal', color: '#10b981', isProductive: true },
  edge: { category: 'browser', color: '#0078d7', isProductive: true },
  chrome: { category: 'browser', color: '#f59e0b', isProductive: true },
  spotify: { category: 'media', color: '#1db954', isProductive: false },
  explorer: { category: 'utility', color: '#f59e0b', isProductive: true },
  taskmgr: { category: 'utility', color: '#06b6d4', isProductive: true },
  figma: { category: 'code', color: '#a855f7', isProductive: true }
};

class ScreenTimeService {
  private isPaused: boolean = false;
  private currentForegroundAppId: string = 'vscode';
  private appSecondsToday: Map<string, number> = new Map();
  private appSecondsWeekly: Map<string, number> = new Map();
  private listeners: Set<() => void> = new Set();
  private trackerInterval: number | null = null;

  constructor() {
    this.initDefaultData();
    this.startTracking();
  }

  private initDefaultData() {
    // Realistic baseline for demo so user immediately sees analytics
    this.appSecondsToday.set('vscode', 3600 * 2 + 18 * 60); // 2h 18m
    this.appSecondsToday.set('edge', 3600 * 1 + 12 * 60);   // 1h 12m
    this.appSecondsToday.set('terminal', 48 * 60);           // 48m
    this.appSecondsToday.set('spotify', 3600 * 1 + 45 * 60); // 1h 45m
    this.appSecondsToday.set('explorer', 22 * 60);           // 22m

    this.appSecondsWeekly.set('vscode', 3600 * 14 + 30 * 60);
    this.appSecondsWeekly.set('edge', 3600 * 8 + 40 * 60);
    this.appSecondsWeekly.set('terminal', 3600 * 5 + 15 * 60);
    this.appSecondsWeekly.set('spotify', 3600 * 9 + 20 * 60);
    this.appSecondsWeekly.set('explorer', 3600 * 2 + 10 * 60);
  }

  private startTracking() {
    // Listen for foreground changes from windowActivityService
    windowActivityService.subscribeForeground((app: WindowsApp | null) => {
      if (app) {
        this.currentForegroundAppId = app.id;
      }
    });

    // 1-second interval tracker
    this.trackerInterval = window.setInterval(() => {
      if (this.isPaused || !this.currentForegroundAppId) return;

      const currentToday = this.appSecondsToday.get(this.currentForegroundAppId) || 0;
      this.appSecondsToday.set(this.currentForegroundAppId, currentToday + 1);

      const currentWeekly = this.appSecondsWeekly.get(this.currentForegroundAppId) || 0;
      this.appSecondsWeekly.set(this.currentForegroundAppId, currentWeekly + 1);

      // Notify every 5s to save CPU
      if ((currentToday + 1) % 5 === 0) {
        this.notify();
      }
    }, 1000);
  }

  public getReport(): ScreenTimeReport {
    let totalToday = 0;
    let totalWeekly = 0;
    let productiveSeconds = 0;

    const stats: AppUsageStat[] = [];

    this.appSecondsToday.forEach((secsToday, appId) => {
      totalToday += secsToday;
      const secsWeekly = this.appSecondsWeekly.get(appId) || secsToday;
      totalWeekly += secsWeekly;

      const meta = APP_CATEGORIES[appId] || { category: 'other' as const, color: '#94a3b8', isProductive: true };
      if (meta.isProductive) {
        productiveSeconds += secsToday;
      }

      stats.push({
        appId,
        appName: this.getAppDisplayName(appId),
        category: meta.category,
        secondsToday: secsToday,
        secondsWeekly: secsWeekly,
        percentage: 0,
        color: meta.color
      });
    });

    // Compute percentages
    stats.forEach((s) => {
      s.percentage = totalToday > 0 ? Math.round((s.secondsToday / totalToday) * 100) : 0;
    });

    // Sort descending by usage
    stats.sort((a, b) => b.secondsToday - a.secondsToday);

    const productivityScore = totalToday > 0 ? Math.round((productiveSeconds / totalToday) * 100) : 85;
    const mostUsedApp = stats[0] ? stats[0].appName : 'VS Code';

    return {
      totalSecondsToday: totalToday,
      totalSecondsWeekly: totalWeekly,
      productivityScore,
      mostUsedApp,
      isPaused: this.isPaused,
      history: stats
    };
  }

  private getAppDisplayName(appId: string): string {
    switch (appId) {
      case 'vscode':
        return 'Visual Studio Code';
      case 'terminal':
        return 'Windows Terminal';
      case 'edge':
        return 'Microsoft Edge';
      case 'spotify':
        return 'Spotify Music';
      case 'explorer':
        return 'File Explorer';
      case 'taskmgr':
        return 'Task Manager';
      default:
        return appId.charAt(0).toUpperCase() + appId.slice(1);
    }
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    this.notify();
    return this.isPaused;
  }

  public resetData() {
    this.appSecondsToday.clear();
    this.appSecondsWeekly.clear();
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const screenTimeService = new ScreenTimeService();
