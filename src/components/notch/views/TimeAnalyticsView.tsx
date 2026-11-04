import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Coffee,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Clock,
  Shield,
  CheckCircle2,
  TrendingUp
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
    showToast
  } = useNotch();

  const [mode, setMode] = useState<'pomodoro' | 'screentime'>('pomodoro');
  const [report, setReport] = useState<ScreenTimeReport>(screenTimeService.getReport());
  const [isPaused, setIsPaused] = useState<boolean>(report.isPaused);

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

  return (
    <div className="flex flex-col h-[106px] px-2.5 py-1 justify-between text-xs select-none">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setMode('pomodoro')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              mode === 'pomodoro'
                ? 'bg-amber-500/30 text-amber-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-2.5 h-2.5" /> Pomodoro Timer
          </button>
          <button
            onClick={() => setMode('screentime')}
            className={`px-2 py-0.5 rounded-md text-[10px] transition-all flex items-center gap-1 ${
              mode === 'screentime'
                ? 'bg-sky-500/30 text-sky-200 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-2.5 h-2.5" /> Screen Time & Analytics
          </button>
        </div>

        {mode === 'screentime' && (
          <button
            onClick={handleToggleTracking}
            title={isPaused ? 'Resume tracking' : 'Pause tracking (privacy)'}
            className={`text-[9px] px-1.5 py-0.5 rounded border transition-all flex items-center gap-1 ${
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
      <div className="flex-1 flex items-center overflow-hidden py-1">
        {mode === 'pomodoro' ? (
          <div className="w-full flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <Coffee className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Focus Session</span>
                <span className="text-xl font-bold font-mono text-amber-300 tracking-wider">
                  {formatSecs(pomodoroSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={isPomodoroRunning ? pausePomodoro : startPomodoro}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 flex items-center gap-1 font-medium transition-all"
              >
                {isPomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{isPomodoroRunning ? 'Pause' : 'Start'}</span>
              </button>

              <button
                onClick={resetPomodoro}
                title="Reset timer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-between gap-2">
            {/* Today Total & Productivity Score */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 shrink-0">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400">Today Total</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {formatHoursMins(report.totalSecondsToday)}
                </span>
                <span className="text-[8px] text-slate-500">Weekly: {formatHoursMins(report.totalSecondsWeekly)}</span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400/50 bg-emerald-500/10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-300">{report.productivityScore}%</span>
                <span className="text-[7px] text-emerald-400/80">score</span>
              </div>
            </div>

            {/* Top Apps Breakdown */}
            <div className="flex-1 h-full bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-white/10 pb-0.5">
                <span>Application</span>
                <span>Time Spent</span>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto scrollbar-none">
                {report.history.slice(0, 2).map((app: AppUsageStat) => (
                  <div key={app.appId} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-200 truncate max-w-[120px]">{app.appName}</span>
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
