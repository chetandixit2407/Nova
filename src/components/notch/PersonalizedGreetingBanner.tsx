import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  X,
  Edit3,
  Clock,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  greetingService,
  ActiveGreetingState,
  DEFAULT_GREETING_SETTINGS
} from '../../services/greetingService';
import {
  GreetingSettings,
  GreetingFontStyle,
  GreetingColorTheme,
  GreetingAnimationStyle,
  TimeOfDayPeriod
} from '../../types';

interface PersonalizedGreetingBannerProps {
  mode: 'compact' | 'dashboard';
  onOpenDashboard?: () => void;
  onDismiss?: () => void;
  onOpenSettings?: () => void;
}

export const PersonalizedGreetingBanner: React.FC<PersonalizedGreetingBannerProps> = ({
  mode,
  onOpenDashboard,
  onDismiss,
  onOpenSettings
}) => {
  const [settings, setSettings] = useState<GreetingSettings>(greetingService.getSettings());
  const [activeGreeting, setActiveGreeting] = useState<ActiveGreetingState>(
    greetingService.getActiveGreeting()
  );
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editNameVal, setEditNameVal] = useState<string>(settings.userName);

  // Sync with greetingService
  useEffect(() => {
    const unsub = greetingService.subscribe(() => {
      setSettings(greetingService.getSettings());
      setActiveGreeting(greetingService.getActiveGreeting());
    });
    return unsub;
  }, []);

  // Update clock time
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTimeStr(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const period = useMemo(() => {
    return activeGreeting.period || greetingService.getTimeOfDayPeriod();
  }, [activeGreeting.period]);

  const greetingData = useMemo(() => {
    return greetingService.getGreetingText(period);
  }, [settings, period]);

  // Color text styling
  const getColorClasses = (theme: GreetingColorTheme): string => {
    switch (theme) {
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]';
      case 'amber':
        return 'bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      case 'violet':
        return 'bg-gradient-to-r from-purple-300 via-violet-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]';
      case 'rose':
        return 'bg-gradient-to-r from-rose-300 via-pink-200 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]';
      case 'white':
        return 'bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]';
      case 'aurora':
      default:
        return 'bg-gradient-to-r from-teal-300 via-sky-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]';
    }
  };

  const getBorderGlow = (theme: GreetingColorTheme): string => {
    switch (theme) {
      case 'cyan':
        return 'border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]';
      case 'emerald':
        return 'border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'amber':
        return 'border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'violet':
        return 'border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
      case 'rose':
        return 'border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'white':
        return 'border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]';
      case 'aurora':
      default:
        return 'border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]';
    }
  };

  const getFontClasses = (font: GreetingFontStyle): string => {
    switch (font) {
      case 'mono':
        return 'font-mono tracking-normal';
      case 'serif':
        return 'font-serif italic tracking-wide';
      case 'cyber':
        return 'font-mono uppercase tracking-wider font-extrabold';
      case 'fluent':
      default:
        return 'font-sans tracking-tight font-bold';
    }
  };

  const renderPeriodIcon = (p: TimeOfDayPeriod, sizeClass = 'w-4 h-4') => {
    switch (p) {
      case 'morning':
        return <Sunrise className={`${sizeClass} text-amber-400 animate-pulse`} />;
      case 'afternoon':
        return <Sun className={`${sizeClass} text-yellow-300 animate-[spin_12s_linear_infinite]`} />;
      case 'evening':
        return <Sunset className={`${sizeClass} text-orange-400`} />;
      case 'night':
        return <Moon className={`${sizeClass} text-indigo-300 animate-pulse`} />;
    }
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = editNameVal.trim() || 'Virendra';
    greetingService.updateSettings({ userName: clean });
    setEditNameVal(clean);
    setIsEditingName(false);
  };

  // Typewriter effect state for typewriter animation style
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);
  const fullText = greetingData.main;

  useEffect(() => {
    if (settings.animationStyle === 'typewriter') {
      setTypewriterIndex(0);
      const interval = setInterval(() => {
        setTypewriterIndex((prev) => {
          if (prev >= fullText.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [fullText, settings.animationStyle, activeGreeting.startedAt]);

  // =========================================================================
  // 1. COMPACT NOTCH MODE (Rendered in Dynamic Island pill during startup / wake)
  // =========================================================================
  if (mode === 'compact') {
    return (
      <div
        onClick={onOpenDashboard}
        className="w-full h-full flex items-center justify-between px-3 cursor-pointer select-none text-white overflow-hidden relative group"
        title="Click to open Windows Smart Notch"
      >
        {/* Left Side: Animated Time-of-Day Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            {renderPeriodIcon(period, 'w-3.5 h-3.5')}
          </div>
        </div>

        {/* Center: Animated Personalized Greeting Text */}
        <div className="flex-1 min-w-0 mx-2 text-center overflow-hidden">
          {settings.animationStyle === 'typewriter' ? (
            <span
              className={`text-xs md:text-sm font-bold truncate block ${getFontClasses(
                settings.fontStyle
              )} ${getColorClasses(settings.colorTheme)}`}
            >
              {fullText.slice(0, typewriterIndex)}
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-sky-400 animate-pulse" />
            </span>
          ) : settings.animationStyle === 'glow-shimmer' ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative inline-block"
            >
              <span
                className={`text-xs md:text-sm font-bold truncate block ${getFontClasses(
                  settings.fontStyle
                )} ${getColorClasses(settings.colorTheme)}`}
              >
                {fullText}
              </span>
            </motion.div>
          ) : settings.animationStyle === 'aurora-wave' ? (
            <motion.span
              animate={{
                filter: [
                  'drop-shadow(0 0 6px rgba(56,189,248,0.4))',
                  'drop-shadow(0 0 12px rgba(168,85,247,0.6))',
                  'drop-shadow(0 0 6px rgba(16,185,129,0.4))',
                  'drop-shadow(0 0 6px rgba(56,189,248,0.4))'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`text-xs md:text-sm font-bold truncate block ${getFontClasses(
                settings.fontStyle
              )} ${getColorClasses(settings.colorTheme)}`}
            >
              {fullText}
            </motion.span>
          ) : settings.animationStyle === 'bounce-soft' ? (
            <motion.span
              initial={{ scale: 0.9, y: 4 }}
              animate={{ scale: [1, 1.04, 1], y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`text-xs md:text-sm font-bold truncate block ${getFontClasses(
                settings.fontStyle
              )} ${getColorClasses(settings.colorTheme)}`}
            >
              {fullText}
            </motion.span>
          ) : (
            // fade-slide
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`text-xs md:text-sm font-bold truncate block ${getFontClasses(
                settings.fontStyle
              )} ${getColorClasses(settings.colorTheme)}`}
            >
              {fullText}
            </motion.span>
          )}

          {/* Subtext info pill */}
          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5 truncate">
            <span>{currentTimeStr}</span>
            <span>•</span>
            <span className="text-slate-300 truncate max-w-[170px]">{greetingData.subtitle}</span>
          </div>
        </div>

        {/* Right: Reason badge + Dismiss X */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-slate-300 uppercase">
            {activeGreeting.reason === 'startup'
              ? 'Windows Boot'
              : activeGreeting.reason === 'inactivity'
              ? 'Welcome Back'
              : 'Live Greeting'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onDismiss) onDismiss();
              greetingService.dismissGreeting();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss Greeting"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. EXPANDED DASHBOARD HEADER BANNER (Top of dashboard)
  // =========================================================================
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-white/[0.04] via-white/[0.07] to-white/[0.03] border ${getBorderGlow(
        settings.colorTheme
      )} p-2.5 sm:p-3 shrink-0 transition-all`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-sky-500/10 blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        {/* Left: Icon & Personalized Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center shrink-0 shadow-md">
            {renderPeriodIcon(period, 'w-4 h-4')}
          </div>

          <div className="min-w-0">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editNameVal}
                  onChange={(e) => setEditNameVal(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={24}
                  autoFocus
                  className="px-2 py-0.5 rounded-lg bg-black/60 border border-sky-400 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-sky-400 w-32"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors"
                  title="Save Name"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditNameVal(settings.userName);
                    setIsEditingName(false);
                  }}
                  className="p-1 rounded bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-sm sm:text-base font-bold truncate ${getFontClasses(
                    settings.fontStyle
                  )} ${getColorClasses(settings.colorTheme)}`}
                >
                  {greetingData.main}
                </span>

                <button
                  onClick={() => {
                    setEditNameVal(settings.userName);
                    setIsEditingName(true);
                  }}
                  className="p-1 rounded text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                  title="Change Name"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{currentTimeStr}</span>
              </span>
              <span>•</span>
              <span className="truncate max-w-[240px] text-slate-400">{greetingData.subtitle}</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions (Customize in Settings, Test Greeting) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => greetingService.triggerTestGreeting()}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Preview Greeting Animation in Top Notch"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Test Animation</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-[11px] font-medium transition-colors cursor-pointer"
              title="Open Greeting Settings"
            >
              Customize
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
