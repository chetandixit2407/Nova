/**
 * Secure Clipboard History Service
 * Automatic capture, sensitive credential & password filtering, privacy controls.
 */

import { systemService } from './systemService';

export interface SecureClipboardItem {
  id: string;
  text: string;
  type: 'text' | 'code' | 'url' | 'color' | 'image';
  timestamp: number;
  charCount: number;
  preview?: string;
  isSensitive?: boolean;
  category?: 'general' | 'code' | 'links';
}

const SENSITIVE_PATTERNS = [
  /(?:password|passwd|secret|token|api[_-]?key|bearer\s+|client[_-]?secret|private[_-]?key)\s*[:=]\s*\S+/i,
  /\b(?:\d{4}[ -]?){3}\d{4}\b/, // Credit card numbers
  /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
  /ghp_[a-zA-Z0-9]{36}/, // GitHub personal tokens
  /xox[baprs]-[0-9a-zA-Z]{10,48}/, // Slack tokens
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ // JWT token
];

const INITIAL_HISTORY: SecureClipboardItem[] = [
  {
    id: 'cb-1',
    text: 'git commit -m "feat(notch): implement fluid dynamic island spring physics"',
    type: 'code',
    timestamp: Date.now() - 1000 * 60 * 15,
    charCount: 71,
    category: 'code'
  },
  {
    id: 'cb-2',
    text: 'https://github.com/chetandixit2407/Nova',
    type: 'url',
    timestamp: Date.now() - 1000 * 60 * 42,
    charCount: 38,
    category: 'links'
  },
  {
    id: 'cb-3',
    text: 'Design tokens: --notch-glow-cyan: #38bdf8; --notch-blur: 24px;',
    type: 'text',
    timestamp: Date.now() - 1000 * 60 * 95,
    charCount: 61,
    category: 'general'
  }
];

class ClipboardService {
  private items: SecureClipboardItem[] = [];
  private isPaused: boolean = false;
  private autoCaptureEnabled: boolean = true;
  private listeners: Set<() => void> = new Set();
  private lastCapturedText: string = '';
  private pollingTimer: number | null = null;

  constructor() {
    this.loadFromStorage();
    this.startAutoCapture();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('nova_secure_clipboard');
      if (saved) {
        this.items = JSON.parse(saved);
      } else {
        this.items = [...INITIAL_HISTORY];
      }
    } catch {
      this.items = [...INITIAL_HISTORY];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('nova_secure_clipboard', JSON.stringify(this.items.slice(0, 50)));
    } catch {}
  }

  public isSensitiveContent(text: string): boolean {
    if (!text || text.trim().length === 0) return false;
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
  }

  public classifyItem(text: string): 'text' | 'code' | 'url' | 'color' {
    if (text.startsWith('http://') || text.startsWith('https://')) return 'url';
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text.trim())) return 'color';
    if (/[{};=><()]|const |let |import |export |function |class |return /i.test(text)) return 'code';
    return 'text';
  }

  public addItem(rawText: string): boolean {
    if (this.isPaused || !rawText || !rawText.trim()) return false;
    const text = rawText.trim();

    // Sensitive check - reject passwords and credentials
    if (this.isSensitiveContent(text)) {
      return false;
    }

    if (text === this.lastCapturedText) return false;
    this.lastCapturedText = text;

    const type = this.classifyItem(text);
    const newItem: SecureClipboardItem = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      type,
      timestamp: Date.now(),
      charCount: text.length,
      category: type === 'code' ? 'code' : type === 'url' ? 'links' : 'general'
    };

    this.items = [newItem, ...this.items.filter((item) => item.text !== text)].slice(0, 50);
    this.saveToStorage();
    this.notify();
    return true;
  }

  public getItems(query: string = '', category: string = 'all'): SecureClipboardItem[] {
    return this.items.filter((item) => {
      const matchesQuery = query === '' || item.text.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category || item.type === category;
      return matchesQuery && matchesCategory;
    });
  }

  public deleteItem(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveToStorage();
    this.notify();
  }

  public clearHistory() {
    this.items = [];
    this.saveToStorage();
    systemService.clearSystemClipboard().catch(() => {});
    this.notify();
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.notify();
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private startAutoCapture() {
    if (typeof window === 'undefined') return;

    // Window focus change listener
    window.addEventListener('focus', () => {
      this.checkSystemClipboard();
    });

    // Periodic check every 3s (in Electron, Main Process clipboard works without requiring DOM focus)
    this.pollingTimer = window.setInterval(() => {
      if ((systemService.isElectronDesktop() || document.hasFocus()) && this.autoCaptureEnabled && !this.isPaused) {
        this.checkSystemClipboard();
      }
    }, 3000);
  }

  private async checkSystemClipboard() {
    try {
      const text = await systemService.readClipboard();
      if (text && text.trim() && text !== this.lastCapturedText) {
        this.addItem(text);
      }
    } catch {
      // Browser permission or background constraint
    }
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

export const clipboardService = new ClipboardService();
