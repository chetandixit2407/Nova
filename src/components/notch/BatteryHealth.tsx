import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Battery,
  BatteryCharging,
  Zap,
  ShieldCheck,
  Thermometer,
  Clock,
  Sparkles,
  Sliders
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { systemService } from '../../services/systemService';

export const BatteryHealth: React.FC = () => {
  const { systemStatus } = useNotch();

  const [batteryState, setBatteryState] = useState<{
    level: number;
    charging: boolean;
    hasBattery: boolean;
  }>({
    level: systemStatus.batteryLevel,
    charging: systemStatus.isCharging,
    hasBattery: systemStatus.hasBattery
  });

  const [powerMode, setPowerMode] = useState<'saver' | 'balanced' | 'performance'>('balanced');
  const healthPercent = 98; // Simulated Windows battery health capacity
  const cycleCount = 42;
  const tempCelsius = 29;

  // Connect to Windows Battery API abstraction layer
  useEffect(() => {
    systemService.getBatteryStatus((status) => {
      setBatteryState(status);
    });
  }, []);

  const { level, charging, hasBattery } = batteryState;

  // Estimated runtime or charge time
  const getTimeEstimate = () => {
    if (charging) {
      if (level >= 100) return 'Fully charged';
      const minsRemaining = Math.max(5, Math.round(((100 - level) / 100) * 80));
      return `~${minsRemaining} min to 100%`;
    } else {
      const hoursRemaining = (level / 100) * 6.5;
      const h = Math.floor(hoursRemaining);
      const m = Math.round((hoursRemaining - h) * 60);
      return `~${h}h ${m}m remaining`;
    }
  };

  // Color gradient according to level & charging
  const getFillColor = () => {
    if (charging) return 'from-emerald-400 to-teal-300 shadow-[0_0_12px_#34d399]';
    if (level <= 20) return 'from-rose-500 to-red-400 shadow-[0_0_12px_#f43f5e]';
    if (level <= 45) return 'from-amber-400 to-yellow-300 shadow-[0_0_12px_#f59e0b]';
    return 'from-sky-400 to-cyan-300 shadow-[0_0_12px_#38bdf8]';
  };

  return (
    <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl select-none transition-colors hover:border-white/20 space-y-3">
      {/* Header: Title & Charging Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            {charging ? (
              <BatteryCharging className="w-4 h-4 animate-pulse" />
            ) : (
              <Battery className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Windows Battery & Power</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                {hasBattery ? 'OEM API' : 'AC Direct'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              {charging ? 'Plugged into AC Adapter' : 'Running on Lithium Battery'}
            </p>
          </div>
        </div>

        {/* Live Percentage */}
        <div className="text-right">
          <div className="text-lg font-bold font-mono text-white tracking-tight flex items-center gap-1">
            {charging && <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />}
            <span>{level}%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">{getTimeEstimate()}</div>
        </div>
      </div>

      {/* Main Battery Bar with Animated Charging Wave */}
      <div className="space-y-1">
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
          <motion.div
            initial={false}
            animate={{ width: `${level}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`h-full rounded-full bg-gradient-to-r ${getFillColor()} relative overflow-hidden`}
          >
            {/* Shimmer line when charging */}
            {charging && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-1/3 h-full bg-white/50 skew-x-12"
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Health Metrics Strip */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-slate-400 block text-[9px]">CAPACITY HEALTH</span>
          <span className="text-emerald-400 font-bold">{healthPercent}% (Normal)</span>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-slate-400 block text-[9px]">CYCLE COUNT</span>
          <span className="text-slate-200 font-bold">{cycleCount} Cycles</span>
        </div>
        <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
          <span className="text-slate-400 block text-[9px]">TEMPERATURE</span>
          <span className="text-sky-300 font-bold">{tempCelsius}°C (Optimal)</span>
        </div>
      </div>

      {/* Power Mode Segmented Selector */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-sky-400" />
          <span>Power Profile</span>
        </span>
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5 text-[10px]">
          {(['saver', 'balanced', 'performance'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPowerMode(mode)}
              className={`px-2 py-0.5 rounded-md font-medium capitalize transition-all cursor-pointer ${
                powerMode === mode
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
