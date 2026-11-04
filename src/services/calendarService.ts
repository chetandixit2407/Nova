/**
 * Calendar, Reminders & Regional Holidays Service
 * Manages upcoming events, personal recurring reminders, regional holidays, and due notifications.
 */

import { ReminderItem, CalendarEventItem } from '../types';
import { systemService } from './systemService';

export interface RegionalHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  region: string;
  type: 'public' | 'observance';
}

const DEFAULT_HOLIDAYS_2026: RegionalHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day", region: 'Global', type: 'public' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', region: 'US', type: 'public' },
  { date: '2026-01-26', name: 'Republic Day', region: 'IN', type: 'public' },
  { date: '2026-02-16', name: "Presidents' Day", region: 'US', type: 'public' },
  { date: '2026-03-04', name: 'Holi Festival', region: 'IN', type: 'observance' },
  { date: '2026-04-03', name: 'Good Friday', region: 'Global', type: 'public' },
  { date: '2026-04-05', name: 'Easter Sunday', region: 'Global', type: 'public' },
  { date: '2026-05-04', name: 'Early May Bank Holiday', region: 'UK', type: 'public' },
  { date: '2026-05-25', name: 'Memorial Day', region: 'US', type: 'public' },
  { date: '2026-07-01', name: 'Canada Day', region: 'CA', type: 'public' },
  { date: '2026-07-04', name: 'Independence Day', region: 'US', type: 'public' },
  { date: '2026-08-15', name: 'Independence Day', region: 'IN', type: 'public' },
  { date: '2026-09-07', name: 'Labor Day', region: 'US', type: 'public' },
  { date: '2026-10-31', name: 'Halloween', region: 'Global', type: 'observance' },
  { date: '2026-11-08', name: 'Diwali', region: 'IN', type: 'public' },
  { date: '2026-11-26', name: 'Thanksgiving Day', region: 'US', type: 'public' },
  { date: '2026-12-25', name: 'Christmas Day', region: 'Global', type: 'public' }
];

const STORAGE_REMINDERS_KEY = 'nova_reminders_v1';
const STORAGE_EVENTS_KEY = 'nova_events_v1';
const STORAGE_REGION_KEY = 'nova_calendar_region_v1';

class CalendarService {
  private reminders: ReminderItem[] = [];
  private events: CalendarEventItem[] = [];
  private region: string = 'US';
  private subscribers: Array<() => void> = [];
  private checkInterval: number | null = null;

  constructor() {
    this.loadState();
    this.startReminderChecker();
  }

  private loadState() {
    try {
      const storedReminders = localStorage.getItem(STORAGE_REMINDERS_KEY);
      if (storedReminders) {
        this.reminders = JSON.parse(storedReminders);
      } else {
        const now = Date.now();
        this.reminders = [
          {
            id: 'rem-1',
            title: 'Review Sprint Deliverables',
            timeStr: '15:30',
            timestamp: now,
            completed: false,
            category: 'work',
            recurrence: 'daily'
          },
          {
            id: 'rem-2',
            title: 'Stay Hydrated & Stretch',
            timeStr: '16:00',
            timestamp: now,
            completed: true,
            category: 'health',
            recurrence: 'daily'
          },
          {
            id: 'rem-3',
            title: 'Prepare Project Standup Notes',
            timeStr: '17:00',
            timestamp: now + 86400000,
            completed: false,
            category: 'work',
            recurrence: 'none'
          }
        ];
      }

      const storedEvents = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        this.events = [
          {
            id: 'evt-1',
            title: 'Design Sync: Windows Fluent & Dynamic Island',
            dateStr: todayStr,
            timeStr: '14:00 - 14:45',
            location: 'Microsoft Teams',
            isHoliday: false
          },
          {
            id: 'evt-2',
            title: 'NOVA Ecosystem Architecture Review',
            dateStr: todayStr,
            timeStr: '16:30 - 17:15',
            location: 'Conference Room 4B',
            isHoliday: false
          }
        ];
      }

      const savedRegion = localStorage.getItem(STORAGE_REGION_KEY);
      if (savedRegion) {
        this.region = savedRegion;
      }
    } catch (e) {
      console.warn('Failed to load calendar state from localStorage', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_REGION_KEY, this.region);
    } catch (e) {
      console.warn('Failed to save calendar state', e);
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // --- REMINDER MANAGEMENT ---
  public getReminders(): ReminderItem[] {
    return this.reminders;
  }

  public addReminder(item: Omit<ReminderItem, 'id' | 'completed' | 'timestamp'>): ReminderItem {
    const newReminder: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      completed: false
    };
    this.reminders = [newReminder, ...this.reminders];
    this.saveState();
    return newReminder;
  }

  public toggleReminder(id: string): void {
    this.reminders = this.reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    this.saveState();
  }

  public deleteReminder(id: string): void {
    this.reminders = this.reminders.filter((r) => r.id !== id);
    this.saveState();
  }

  // --- CALENDAR EVENTS ---
  public getEvents(): CalendarEventItem[] {
    return this.events;
  }

  public addEvent(event: Omit<CalendarEventItem, 'id'>): CalendarEventItem {
    const newEvent: CalendarEventItem = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    this.events = [...this.events, newEvent];
    this.saveState();
    return newEvent;
  }

  public deleteEvent(id: string): void {
    this.events = this.events.filter((e) => e.id !== id);
    this.saveState();
  }

  // --- HOLIDAYS ---
  public getRegion(): string {
    return this.region;
  }

  public setRegion(region: string): void {
    this.region = region;
    this.saveState();
  }

  public getUpcomingHolidays(limit: number = 3): RegionalHoliday[] {
    const todayStr = new Date().toISOString().split('T')[0];
    return DEFAULT_HOLIDAYS_2026.filter(
      (h) => (h.region === 'Global' || h.region === this.region) && h.date >= todayStr
    ).slice(0, limit);
  }

  // --- AUTO DUE REMINDER NOTIFICATIONS ---
  private startReminderChecker() {
    if (this.checkInterval) return;
    this.checkInterval = window.setInterval(() => {
      this.checkDueReminders();
    }, 60000);
  }

  private checkDueReminders() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    this.reminders.forEach((rem) => {
      if (!rem.completed && rem.timeStr === currentTimeStr) {
        systemService.sendNativeNotification(`Reminder: ${rem.title}`, {
          body: `Due right now • Category: ${rem.category}`
        });
      }
    });
  }
}

export const calendarService = new CalendarService();
