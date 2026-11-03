import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Edit2,
  ExternalLink,
  Terminal,
  Globe,
  Folder,
  Code,
  Music,
  Check,
  RotateCcw
} from 'lucide-react';
import { QuickAppShortcut } from '../../types';
import { windowActivityService } from '../../services/windowActivityService';
import { soundService } from '../../services/soundService';

const DEFAULT_SHORTCUTS: QuickAppShortcut[] = [
  { id: 'app-vscode', title: 'VS Code', icon: 'Code', target: 'vscode', actionType: 'app' },
  { id: 'app-edge', title: 'Edge Browser', icon: 'Globe', target: 'edge', actionType: 'app' },
  { id: 'app-terminal', title: 'PowerShell', icon: 'Terminal', target: 'terminal', actionType: 'app' },
  { id: 'app-explorer', title: 'File Explorer', icon: 'Folder', target: 'explorer', actionType: 'app' },
  { id: 'app-spotify', title: 'Spotify Music', icon: 'Music', target: 'spotify', actionType: 'app' }
];

interface QuickAppsBarModalProps {
  onClose: () => void;
}

export const QuickAppsBarModal: React.FC<QuickAppsBarModalProps> = ({ onClose }) => {
  const [shortcuts, setShortcuts] = useState<QuickAppShortcut[]>(DEFAULT_SHORTCUTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editTarget, setEditTarget] = useState<string>('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-sky-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-indigo-400" />;
      case 'Folder':
        return <Folder className="w-5 h-5 text-amber-400" />;
      case 'Music':
      default:
        return <Music className="w-5 h-5 text-pink-400" />;
    }
  };

  const handleLaunch = (shortcut: QuickAppShortcut) => {
    soundService.play('button_click');
    if (shortcut.actionType === 'url') {
      window.open(shortcut.target, '_blank');
    } else {
      windowActivityService.launchApp(shortcut.target);
    }
    onClose();
  };

  const startEdit = (s: QuickAppShortcut) => {
    setEditingId(s.id);
    setEditTitle(s.title);
    setEditTarget(s.target);
  };

  const saveEdit = (id: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editTitle, target: editTarget } : s))
    );
    setEditingId(null);
    soundService.play('toggle');
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
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            Quick Apps Bar
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
              PRO • 5 Slots
            </span>
          </h3>
          <p className="text-[11px] text-slate-400">
            One-touch shortcuts for active apps, websites and paths
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 5 Slots Grid */}
      <div className="grid grid-cols-5 gap-3">
        {shortcuts.map((shortcut, index) => {
          const isEditing = editingId === shortcut.id;

          return (
            <div
              key={shortcut.id}
              className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition group relative"
            >
              <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">
                #{index + 1}
              </div>

              <button
                onClick={() => handleLaunch(shortcut)}
                className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition"
              >
                {getIcon(shortcut.icon)}
              </button>

              <span className="mt-2 text-xs font-medium text-slate-200 text-center truncate w-full">
                {shortcut.title}
              </span>

              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={() => startEdit(shortcut)}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px] transition"
                  title="Edit Shortcut"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline Editor Drawer if active */}
      {editingId && (
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-sky-400/30 flex items-center gap-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Shortcut Title"
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
          />
          <input
            type="text"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
            placeholder="App ID or URL"
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
          />
          <button
            onClick={() => saveEdit(editingId)}
            className="px-3 py-1.5 rounded-lg bg-sky-500 text-black font-semibold text-xs flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      )}
    </motion.div>
  );
};
