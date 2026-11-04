import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Globe,
  BellRing
} from 'lucide-react';
import { calendarService, RegionalHoliday } from '../../../services/calendarService';
import { ReminderItem, CalendarEventItem } from '../../../types';
import { useNotch } from '../../../context/NotchContext';

export const CalendarRemindersView: React.FC = () => {
  const { showToast } = useNotch();
  const [reminders, setReminders] = useState<ReminderItem[]>(calendarService.getReminders());
  const [events, setEvents] = useState<CalendarEventItem[]>(calendarService.getEvents());
  const [region, setRegion] = useState<string>(calendarService.getRegion());
  const [holidays, setHolidays] = useState<RegionalHoliday[]>(calendarService.getUpcomingHolidays());
  const [activeTab, setActiveTab] = useState<'reminders' | 'events' | 'holidays'>('reminders');
  const [newReminderText, setNewReminderText] = useState<string>('');

  useEffect(() => {
    const unsub = calendarService.subscribe(() => {
      setReminders(calendarService.getReminders());
      setEvents(calendarService.getEvents());
      setRegion(calendarService.getRegion());
      setHolidays(calendarService.getUpcomingHolidays());
    });
    return unsub;
  }, []);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;

    calendarService.addReminder({
      title: newReminderText.trim(),
      category: 'work',
      timeStr: '18:00',
      recurrence: 'none'
    });
    setNewReminderText('');
    showToast({
      appName: 'Reminders',
      title: 'Reminder Added',
      message: newReminderText.trim(),
      icon: 'BellRing',
      duration: 2000
    });
  };

  const handleToggleReminder = (id: string) => {
    calendarService.toggleReminder(id);
  };

  const handleDeleteReminder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    calendarService.deleteReminder(id);
  };

  const handleChangeRegion = (newReg: string) => {
    calendarService.setRegion(newReg);
  };

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'reminders'
                ? 'bg-sky-500/30 text-sky-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-2.5 h-2.5" /> Reminders ({reminders.filter((r) => !r.completed).length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'events'
                ? 'bg-purple-500/30 text-purple-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-2.5 h-2.5" /> Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              activeTab === 'holidays'
                ? 'bg-amber-500/30 text-amber-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-2.5 h-2.5" /> Holidays
          </button>
        </div>

        {activeTab === 'holidays' && (
          <select
            value={region}
            onChange={(e) => handleChangeRegion(e.target.value)}
            className="bg-white/10 text-slate-200 text-[10px] rounded px-1.5 py-0.5 border border-white/10 focus:outline-none"
          >
            <option value="US" className="bg-slate-800 text-white">US</option>
            <option value="UK" className="bg-slate-800 text-white">UK</option>
            <option value="IN" className="bg-slate-800 text-white">IN</option>
            <option value="CA" className="bg-slate-800 text-white">CA</option>
          </select>
        )}
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 flex items-center overflow-hidden py-1">
        {activeTab === 'reminders' && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-1 pr-1">
              {reminders.length === 0 ? (
                <div className="text-center text-slate-400 text-[10px] py-2">No pending reminders</div>
              ) : (
                reminders.slice(0, 3).map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => handleToggleReminder(rem.id)}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-md px-2 py-1 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {rem.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-[10px] truncate ${
                          rem.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {rem.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteReminder(rem.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-0.5 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick add input */}
            <form onSubmit={handleAddReminder} className="flex items-center gap-1 shrink-0 mt-1">
              <input
                type="text"
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="+ Add new reminder..."
                className="flex-1 bg-white/10 focus:bg-black/40 text-slate-100 placeholder-slate-400 px-2 py-0.5 rounded text-[10px] border border-white/10 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 text-[10px] border border-sky-400/30"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="w-full h-full flex flex-col gap-1 overflow-y-auto scrollbar-none">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-2 py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-6 rounded-full shrink-0 bg-sky-400"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-slate-100 font-medium truncate">{evt.title}</span>
                    <span className="text-[8px] text-slate-400">
                      {evt.dateStr} • {evt.timeStr} • {evt.location || 'Online'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="w-full h-full flex items-center gap-2 overflow-x-auto scrollbar-none">
            {holidays.map((h) => (
              <div
                key={h.name}
                className="min-w-[130px] h-[64px] bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col justify-between shrink-0"
              >
                <div className="flex items-center justify-between text-[9px] text-amber-400">
                  <span>{h.date}</span>
                  <span className="text-[8px] px-1 rounded bg-amber-400/20">{h.region}</span>
                </div>
                <span className="text-[10px] text-slate-200 font-medium line-clamp-2">{h.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
