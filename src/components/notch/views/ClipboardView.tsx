import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clipboard,
  Search,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Code,
  FileText,
  Pause,
  Play
} from 'lucide-react';
import { clipboardService, SecureClipboardItem } from '../../../services/clipboardService';
import { useNotch } from '../../../context/NotchContext';

export const ClipboardView: React.FC = () => {
  const { showToast } = useNotch();
  const [items, setItems] = useState<SecureClipboardItem[]>(clipboardService.getItems());
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'text' | 'code' | 'url'>('all');
  const [isPaused, setIsPaused] = useState<boolean>(clipboardService.getIsPaused());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = clipboardService.subscribe(() => {
      setItems(clipboardService.getItems());
      setIsPaused(clipboardService.getIsPaused());
    });
    setItems(clipboardService.getItems());
    return unsub;
  }, []);

  const handleCopy = (item: SecureClipboardItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    showToast({
      appName: 'Clipboard Pro',
      title: 'Copied to Clipboard',
      message: item.text.slice(0, 45) + (item.text.length > 45 ? '...' : ''),
      icon: 'Clipboard',
      duration: 2000
    });
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleTogglePause = () => {
    const next = !isPaused;
    clipboardService.setPaused(next);
    setIsPaused(next);
    showToast({
      appName: 'Clipboard Pro',
      title: next ? 'Clipboard Tracking Paused' : 'Clipboard Tracking Active',
      message: next ? 'Privacy mode: new copies ignored' : 'Auto-capturing clipboard updates',
      icon: 'Shield',
      duration: 2000
    });
  };

  const handleClear = () => {
    clipboardService.clearHistory();
    showToast({
      appName: 'Clipboard Pro',
      title: 'History Cleared',
      message: 'All clipboard entries removed securely',
      icon: 'Trash2',
      duration: 2000
    });
  };

  const filteredItems = items
    .filter((it) => {
      if (filter === 'all') return true;
      return it.type === filter;
    })
    .filter((it) => {
      if (!search.trim()) return true;
      return it.text.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Search & Action Bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative flex-1 flex items-center">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clipboard..."
            className="w-full bg-white/10 hover:bg-white/15 focus:bg-black/40 text-slate-100 placeholder-slate-400 pl-6 pr-2 py-0.5 rounded-md text-[11px] border border-white/10 focus:outline-none focus:border-cyan-400/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-0.5 bg-black/20 p-0.5 rounded-md border border-white/10">
          {(['all', 'text', 'code', 'url'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-all capitalize ${
                filter === tab ? 'bg-white/20 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Privacy Pause / Resume */}
        <button
          onClick={handleTogglePause}
          title={isPaused ? 'Resume clipboard monitoring' : 'Pause clipboard monitoring (privacy)'}
          className={`p-1 rounded border transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
          }`}
        >
          {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
        </button>

        {/* Clear All */}
        <button
          onClick={handleClear}
          title="Clear all history"
          className="p-1 rounded bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-all"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Item Carousel / List */}
      <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-1">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center w-full text-slate-400 text-[10px] gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400/70" />
            <span>Clipboard is clean • Passwords & credentials automatically excluded</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="min-w-[130px] max-w-[160px] h-[64px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between shrink-0 transition-all group"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                  {item.type === 'code' && <Code className="w-2.5 h-2.5 text-sky-400" />}
                  {item.type === 'url' && <ExternalLink className="w-2.5 h-2.5 text-amber-400" />}
                  {item.type === 'text' && <FileText className="w-2.5 h-2.5 text-slate-400" />}
                  {item.preview || item.type}
                </span>

                <button
                  onClick={() => handleCopy(item)}
                  className="p-0.5 rounded hover:bg-white/20 text-slate-400 hover:text-white transition-all"
                  title="Copy to clipboard"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <p
                onClick={() => handleCopy(item)}
                className="text-[10px] text-slate-200 line-clamp-2 cursor-pointer font-sans break-all"
                title="Click to copy"
              >
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
