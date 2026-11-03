import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ClipboardList,
  Pin,
  PinOff,
  Search,
  ExternalLink,
  Mail,
  Palette,
  Image as ImageIcon,
  Check,
  Copy,
  Trash2,
  FileCode,
  Sparkles
} from 'lucide-react';
import { ClipboardProItem } from '../../types';
import { soundService } from '../../services/soundService';
import { windowActivityService } from '../../services/windowActivityService';

const INITIAL_ITEMS: ClipboardProItem[] = [
  {
    id: 'clip-1',
    text: 'https://github.com/chetandixit2407/Nova',
    type: 'link',
    pinned: true,
    timestamp: Date.now() - 3600000,
    smartAction: { label: 'Open in Edge', action: 'link' }
  },
  {
    id: 'clip-2',
    text: '#38bdf8',
    type: 'color',
    preview: '#38bdf8',
    pinned: true,
    timestamp: Date.now() - 7200000,
    smartAction: { label: 'Copy RGB (56, 189, 248)', action: 'color' }
  },
  {
    id: 'clip-3',
    text: 'team@nova-project.dev',
    type: 'email',
    pinned: false,
    timestamp: Date.now() - 10800000,
    smartAction: { label: 'Send Email', action: 'email' }
  },
  {
    id: 'clip-4',
    text: 'const morphPhysics = { stiffness: 480, damping: 32 };',
    type: 'code',
    pinned: false,
    timestamp: Date.now() - 14400000,
    smartAction: { label: 'Copy Formatted', action: 'code' }
  },
  {
    id: 'clip-5',
    text: 'Nova Architecture Diagram & Visual Identity v2',
    type: 'image',
    preview: '/src/assets/images/windows_fluent_bloom_1793691054545.jpg',
    pinned: true,
    timestamp: Date.now() - 86400000,
    smartAction: { label: 'Copy Image', action: 'image' }
  }
];

interface ClipboardProModalProps {
  onClose: () => void;
}

export const ClipboardProModal: React.FC<ClipboardProModalProps> = ({ onClose }) => {
  const [items, setItems] = useState<ClipboardProItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType || (filterType === 'pinned' && item.pinned);
    return matchesSearch && matchesType;
  });

  const handleCopy = (item: ClipboardProItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    soundService.play('button_click');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleTogglePin = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item))
    );
    soundService.play('toggle');
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    soundService.play('button_click');
  };

  const handleSmartAction = (item: ClipboardProItem) => {
    soundService.play('button_click');
    if (item.type === 'link') {
      windowActivityService.launchApp('edge');
    } else if (item.type === 'color') {
      navigator.clipboard.writeText('rgb(56, 189, 248)');
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    } else if (item.type === 'email') {
      window.location.href = `mailto:${item.text}`;
    } else {
      handleCopy(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="p-5 w-full flex flex-col space-y-4 text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Clipboard Pro
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-mono">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Pinned snippets, image previews & smart contextual actions
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clipboard history & snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-400"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10">
          {(['all', 'pinned', 'link', 'color', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium capitalize transition ${
                filterType === t ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition flex flex-col gap-2 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Type Icon or Color Swatch */}
                {item.type === 'color' && item.preview ? (
                  <div
                    className="w-6 h-6 rounded-md border border-white/20 shrink-0 shadow-sm"
                    style={{ backgroundColor: item.preview }}
                  />
                ) : item.type === 'link' ? (
                  <ExternalLink className="w-4 h-4 text-sky-400 shrink-0" />
                ) : item.type === 'email' ? (
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                ) : item.type === 'image' ? (
                  <ImageIcon className="w-4 h-4 text-pink-400 shrink-0" />
                ) : (
                  <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-200 font-mono truncate">{item.text}</div>
                  {item.type === 'image' && item.preview && (
                    <img
                      src={item.preview}
                      alt="Clipboard snippet preview"
                      className="mt-2 w-32 h-16 object-cover rounded-lg border border-white/15 shadow-md"
                    />
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleTogglePin(item.id)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    item.pinned ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={item.pinned ? 'Unpin' : 'Pin snippet'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleCopy(item)}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
                  title="Copy"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Smart Action Chip */}
            {item.smartAction && (
              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleSmartAction(item)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 font-medium transition border border-white/5"
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span>{item.smartAction.label}</span>
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
