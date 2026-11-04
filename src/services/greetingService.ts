import {
  GreetingSettings,
  GreetingFontStyle,
  GreetingColorTheme,
  GreetingAnimationStyle,
  TimeOfDayPeriod
} from '../types';

export interface ActiveGreetingState {
  isActive: boolean;
  text: string;
  subtext: string;
  reason: 'startup' | 'inactivity' | 'test' | null;
  startedAt: number;
  durationMs: number;
  period: TimeOfDayPeriod;
}

const STORAGE_KEY = 'nova_notch_greeting_settings';

export const DEFAULT_GREETING_SETTINGS: GreetingSettings = {
  enabled: true,
  userName: 'Virendra',
  customGreetingMode: 'auto_time',
  customPrefix: 'Welcome back,',
  fontStyle: 'fluent',
  colorTheme: 'cyan',
  animationStyle: 'glow-shimmer',
  emojiIcon: '👋',
  showOnStartup: true,
  startupDurationSec: 5,
  showOnDashboardOpen: true,
  showOnInactivityReturn: true,
  inactivityThresholdSec: 45,
  wakeDurationSec: 4
};

class GreetingService {
  private settings: GreetingSettings = { ...DEFAULT_GREETING_SETTINGS };
  private activeGreeting: ActiveGreetingState = {
    isActive: false,
    text: '',
    subtext: '',
    reason: null,
    startedAt: 0,
    durationMs: 0,
    period: 'morning'
  };

  private listeners: Set<() => void> = new Set();
  private dismissTimer: number | null = null;
  private lastActivityTimestamp: number = Date.now();
  private isUserCurrentlyIdle: boolean = false;
  private idleCheckInterval: number | null = null;

  constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      this.initActivityTracking();
      // Auto trigger startup greeting if enabled
      if (this.settings.enabled && this.settings.showOnStartup) {
        window.setTimeout(() => {
          this.triggerStartupGreeting();
        }, 600);
      }
    }
  }

  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...DEFAULT_GREETING_SETTINGS, ...parsed };
      }
    } catch {
      this.settings = { ...DEFAULT_GREETING_SETTINGS };
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save greeting settings', e);
    }
    this.notify();
  }

  public getSettings(): GreetingSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<GreetingSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
  }

  public resetSettings(): void {
    this.settings = { ...DEFAULT_GREETING_SETTINGS };
    this.saveSettings();
  }

  public getActiveGreeting(): ActiveGreetingState {
    return { ...this.activeGreeting };
  }

  public getTimeOfDayPeriod(date: Date = new Date()): TimeOfDayPeriod {
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 17) return 'afternoon';
    if (hours >= 17 && hours < 22) return 'evening';
    return 'night';
  }

  public getTimePeriodSalutation(period: TimeOfDayPeriod): string {
    switch (period) {
      case 'morning':
        return 'Good Morning';
      case 'afternoon':
        return 'Good Afternoon';
      case 'evening':
        return 'Good Evening';
      case 'night':
        return 'Good Night';
    }
  }

  public getSubtitleForPeriod(period: TimeOfDayPeriod): string {
    switch (period) {
      case 'morning':
        return 'Have a productive and energizing start to your day';
      case 'afternoon':
        return 'Keep up the great focus and momentum';
      case 'evening':
        return 'Winding down smoothly into a peaceful evening';
      case 'night':
        return 'Rest well, recharge, and stay inspired';
    }
  }

  public getGreetingText(customPeriod?: TimeOfDayPeriod): { main: string; subtitle: string; period: TimeOfDayPeriod } {
    const period = customPeriod || this.getTimeOfDayPeriod();
    const name = this.settings.userName.trim() || 'Virendra';
    const emoji = this.settings.emojiIcon || '👋';

    let salutation = '';
    if (this.settings.customGreetingMode === 'auto_time') {
      salutation = this.getTimePeriodSalutation(period);
    } else {
      salutation = this.settings.customPrefix.trim() || 'Welcome back';
    }

    const main = `${salutation}, ${name} ${emoji}`.trim();
    const subtitle = this.getSubtitleForPeriod(period);

    return { main, subtitle, period };
  }

  public triggerStartupGreeting(): void {
    if (!this.settings.enabled || !this.settings.showOnStartup) return;
    const { main, subtitle, period } = this.getGreetingText();
    const durationMs = (this.settings.startupDurationSec || 5) * 1000;
    this.activateGreeting(main, subtitle, 'startup', durationMs, period);
  }

  public triggerInactivityWakeGreeting(): void {
    if (!this.settings.enabled || !this.settings.showOnInactivityReturn) return;
    const { main, subtitle, period } = this.getGreetingText();
    const durationMs = (this.settings.wakeDurationSec || 4) * 1000;
    this.activateGreeting(main, subtitle, 'inactivity', durationMs, period);
  }

  public triggerTestGreeting(): void {
    const { main, subtitle, period } = this.getGreetingText();
    this.activateGreeting(main, subtitle, 'test', 5000, period);
  }

  private activateGreeting(
    text: string,
    subtext: string,
    reason: 'startup' | 'inactivity' | 'test',
    durationMs: number,
    period: TimeOfDayPeriod
  ): void {
    if (this.dismissTimer) {
      window.clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    this.activeGreeting = {
      isActive: true,
      text,
      subtext,
      reason,
      startedAt: Date.now(),
      durationMs,
      period
    };
    this.notify();

    this.dismissTimer = window.setTimeout(() => {
      this.dismissGreeting();
    }, durationMs);
  }

  public dismissGreeting(): void {
    if (this.dismissTimer) {
      window.clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    if (this.activeGreeting.isActive) {
      this.activeGreeting = {
        ...this.activeGreeting,
        isActive: false
      };
      this.notify();
    }
  }

  private initActivityTracking(): void {
    const onUserActivity = () => {
      const now = Date.now();
      const thresholdMs = (this.settings.inactivityThresholdSec || 45) * 1000;

      // If user was idle and is returning:
      if (this.isUserCurrentlyIdle && now - this.lastActivityTimestamp >= thresholdMs) {
        this.isUserCurrentlyIdle = false;
        if (this.settings.enabled && this.settings.showOnInactivityReturn) {
          this.triggerInactivityWakeGreeting();
        }
      }

      this.lastActivityTimestamp = now;
      this.isUserCurrentlyIdle = false;
    };

    window.addEventListener('mousemove', onUserActivity, { passive: true });
    window.addEventListener('keydown', onUserActivity, { passive: true });
    window.addEventListener('touchstart', onUserActivity, { passive: true });
    window.addEventListener('focus', onUserActivity, { passive: true });

    // Periodic check to mark idle
    this.idleCheckInterval = window.setInterval(() => {
      const idleTime = Date.now() - this.lastActivityTimestamp;
      const thresholdMs = (this.settings.inactivityThresholdSec || 45) * 1000;
      if (idleTime >= thresholdMs) {
        this.isUserCurrentlyIdle = true;
      }
    }, 5000);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Greeting listener error:', err);
      }
    });
  }
}

export const greetingService = new GreetingService();
