import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coffee,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Clock,
  Shield,
  CheckCircle2,
  TrendingUp,
  ListTodo,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNotch } from '../../../context/NotchContext';
import { screenTimeService } from '../../../services/screenTimeService';
import { ScreenTimeReport, AppUsageStat } from '../../../types';

export const TimeAnalyticsView: React.FC = () => {
  const {
    pomodoroSeconds,
    isPomodoroRunning,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    showToast,
    focusTasks,
    addFocusTask,
    toggleFocusTask,
    deleteFocusTask,
    reorderFocusTasks,
    pomodoroWorkDuration,
    pomodoroBreakDuration,
    setPomodoroWorkDuration,
    setPomodoroBreakDuration
  } = useNotch();

  const [mode, setMode] = useState<'pomodoro' | 'tasks' | 'screentime'>('pomodoro');
  const [report, setReport] = useState<ScreenTimeReport>(screenTimeService.getReport());
  const [isPaused, setIsPaused] = useState<boolean>(report.isPaused);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isBreakMode, setIsBreakMode] = useState<boolean>(false);

  useEffect(() => {
    const unsub = screenTimeService.subscribe(() => {
      const rep = screenTimeService.getReport();
      setReport(rep);
      setIsPaused(rep.isPaused);
    });
    return unsub;
  }, []);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatHoursMins = (totalSec: number) => {
    const totalMin = Math.floor(totalSec / 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const handleToggleTracking = () => {
    const nextPaused = screenTimeService.togglePause();
    setIsPaused(nextPaused);
    showToast({
      appName: 'Time Analytics',
      title: nextPaused ? 'Screen Time Paused' : 'Screen Time Active',
      message: nextPaused ? 'App usage tracking paused' : 'Tracking foreground apps',
      icon: 'Clock',
      duration: 2000
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addFocusTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    showToast({
      appName: 'Focus Productivity',
      title: 'Task Created',
      message: `Added task "${newTaskTitle.trim()}"`,
      icon: 'ListTodo',
      duration: 1800
    });
  };

  return (
    <div className="flex flex-col h-full min-h-[140px] px-2.5 py-1.5 justify-between text-xs select-none gap-2">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setMode('pomodoro')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-amber-500/30 text-amber-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-2.5 h-2.5" /> Pomodoro ({formatSecs(pomodoroSeconds)})
          </button>
          <button
            onClick={() => setMode('tasks')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'tasks'
                ? 'bg-emerald-500/30 text-emerald-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListTodo className="w-2.5 h-2.5" /> Tasks ({focusTasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setMode('screentime')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'screentime'
                ? 'bg-sky-500/30 text-sky-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-2.5 h-2.5" /> Analytics ({report.productivityScore}%)
          </button>
        </div>

        {mode === 'screentime' && (
          <button
            onClick={handleToggleTracking}
            title={isPaused ? 'Resume tracking' : 'Pause tracking (privacy)'}
            className={`text-[9px] px-1.5 py-0.5 rounded border transition-all flex items-center gap-1 cursor-pointer ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/20'
            }`}
          >
            <Shield className="w-2.5 h-2.5" /> {isPaused ? 'Paused' : 'Active'}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden py-0.5">
        {mode === 'pomodoro' && (
          <div className="w-full flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isBreakMode ? 'Rest & Break Interval' : 'High-Focus Productivity Sprint'}
                  </span>
                  <span className="text-xl font-bold font-mono text-amber-300 tracking-wider">
                    {formatSecs(pomodoroSeconds)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 flex items-center gap-1 font-medium transition-all cursor-pointer"
                >
                  {isPomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isPomodoroRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={resetPomodoro}
                  title="Reset timer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom durations */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
              <div className="flex items-center gap-2">
                <span>Work:</span>
                {[15, 25, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setPomodoroWorkDuration(m);
                      setIsBreakMode(false);
                    }}
                    className={`px-1.5 py-0.5 rounded font-mono cursor-pointer transition ${
                      pomodoroWorkDuration === m ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span>Break:</span>
                {[5, 10, 15].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setPomodoroBreakDuration(b);
                      setIsBreakMode(true);
                      resetPomodoro();
                    }}
                    className={`px-1.5 py-0.5 rounded font-mono cursor-pointer transition ${
                      pomodoroBreakDuration === b ? 'bg-sky-500/30 text-sky-300 font-bold border border-sky-400/40' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {b}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'tasks' && (
          <div className="w-full flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5">
            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add new focus task..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Task List */}
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto notch-dashboard-scroll pr-1">
              {focusTasks.length === 0 ? (
                <div className="text-center py-3 text-[11px] text-slate-400">
                  No active focus tasks. Add your top priority tasks above!
                </div>
              ) : (
                focusTasks.map((t, idx) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/15 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button
                        onClick={() => toggleFocusTask(t.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer shrink-0 ${
                          t.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span className={`truncate text-slate-200 ${t.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                        {t.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase font-bold shrink-0 ${
                          t.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : t.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => reorderFocusTasks(idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-0.5 rounded hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => reorderFocusTasks(idx, Math.min(focusTasks.length - 1, idx + 1))}
                        disabled={idx === focusTasks.length - 1}
                        className="p-0.5 rounded hover:bg-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteFocusTask(t.id)}
                        className="p-0.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {mode === 'screentime' && (
          <div className="w-full flex items-center justify-between gap-2.5">
            {/* Today Total & Productivity Score */}
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Today Total</span>
                <span className="text-base font-bold text-slate-100 font-mono">
                  {formatHoursMins(report.totalSecondsToday)}
                </span>
                <span className="text-[9px] text-slate-500">Weekly: {formatHoursMins(report.totalSecondsWeekly)}</span>
              </div>
              <div className="w-11 h-11 rounded-full border-2 border-emerald-400/50 bg-emerald-500/10 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-emerald-300">{report.productivityScore}%</span>
                <span className="text-[8px] text-emerald-400/80">score</span>
              </div>
            </div>

            {/* Top Apps Breakdown */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1">
                <span>Application</span>
                <span>Time Spent</span>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto scrollbar-none pt-1">
                {report.history.slice(0, 3).map((app: AppUsageStat) => (
                  <div key={app.appId} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-200 truncate max-w-[130px]">{app.appName}</span>
                    <span className="text-slate-400 font-mono">{formatHoursMins(app.secondsToday)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
