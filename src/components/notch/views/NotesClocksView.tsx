import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Clock,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Globe
} from 'lucide-react';
import { QuickNoteItem, WorldClockItem } from '../../../types';
import { useNotch } from '../../../context/NotchContext';

const DEFAULT_CLOCKS: WorldClockItem[] = [
  { id: '1', city: 'London', country: 'UK', timezone: 'Europe/London', offsetHours: 0 },
  { id: '2', city: 'New York', country: 'US', timezone: 'America/New_York', offsetHours: -5 },
  { id: '3', city: 'Tokyo', country: 'JP', timezone: 'Asia/Tokyo', offsetHours: 9 },
  { id: '4', city: 'Sydney', country: 'AU', timezone: 'Australia/Sydney', offsetHours: 11 }
];

export const NotesClocksView: React.FC = () => {
  const { showToast } = useNotch();
  const [activeTab, setActiveTab] = useState<'notes' | 'clocks'>('notes');

  // Notes state
  const [notes, setNotes] = useState<QuickNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_notes_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'n-1',
        title: 'Project Roadmap',
        content: 'Ship dynamic notch v2.0 with complete productivity ecosystem',
        color: '#0284c7',
        category: 'work',
        isPinned: true,
        updatedAt: Date.now()
      },
      {
        id: 'n-2',
        title: 'Meeting Highlights',
        content: 'Discussed Microsoft Store packaging and frameless transparency',
        color: '#7c3aed',
        category: 'general',
        isPinned: false,
        updatedAt: Date.now()
      }
    ];
  });

  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteBody, setNewNoteBody] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nova_notes_v1', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() && !newNoteBody.trim()) return;

    const colors = ['#0284c7', '#7c3aed', '#d97706', '#059669', '#e11d48'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const item: QuickNoteItem = {
      id: `n-${Date.now()}`,
      title: newNoteTitle.trim() || 'Untitled Note',
      content: newNoteBody.trim(),
      color: randomColor,
      category: 'general',
      isPinned: false,
      updatedAt: Date.now()
    };

    setNotes([item, ...notes]);
    setNewNoteTitle('');
    setNewNoteBody('');
    showToast({
      appName: 'Quick Notes',
      title: 'Note Saved',
      message: item.title,
      icon: 'StickyNote',
      duration: 2000
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const getTimeInZone = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(currentTime);
    } catch {
      return '--:--:--';
    }
  };

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'notes'
                ? 'bg-purple-500/30 text-purple-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <StickyNote className="w-2.5 h-2.5" /> Quick Notes ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('clocks')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'clocks'
                ? 'bg-sky-500/30 text-sky-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-2.5 h-2.5" /> World Clocks
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center overflow-hidden py-1">
        {activeTab === 'notes' ? (
          <div className="w-full h-full flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* New Note Form Card */}
            <form
              onSubmit={handleAddNote}
              className="min-w-[130px] h-[64px] bg-white/5 border border-dashed border-white/20 rounded-lg p-1.5 flex flex-col justify-between shrink-0"
            >
              <input
                type="text"
                placeholder="Note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="bg-transparent text-[10px] text-white placeholder-slate-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Details..."
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                className="bg-transparent text-[9px] text-slate-300 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-0.5 text-[9px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded font-medium transition-all"
              >
                + Save Note
              </button>
            </form>

            {/* Note Cards */}
            {notes.map((note) => (
              <div
                key={note.id}
                className="min-w-[130px] max-w-[150px] h-[64px] rounded-lg p-1.5 flex flex-col justify-between shrink-0 border border-white/10 bg-white/5 relative group"
                style={{ borderTop: `2px solid ${note.color}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-100 truncate">{note.title}</span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-0.5 transition-opacity"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-300 line-clamp-2">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center gap-2 overflow-x-auto scrollbar-none">
            {DEFAULT_CLOCKS.map((clock) => (
              <div
                key={clock.id}
                className="min-w-[110px] h-[64px] bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col justify-between shrink-0"
              >
                <div className="flex items-center justify-between text-[9px] text-slate-400">
                  <span className="font-medium text-slate-200">{clock.city}</span>
                  <span className="font-mono text-[8px] px-1 bg-white/10 rounded">{clock.country}</span>
                </div>
                <span className="text-sm font-bold text-sky-300 font-mono tracking-wider">
                  {getTimeInZone(clock.timezone)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
