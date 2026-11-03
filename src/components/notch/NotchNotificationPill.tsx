import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { ToastNotification } from '../../types';
import { VayllEye } from './VayllEye';
import { NotificationIconAnimation } from '../notifications/NotificationIconAnimation';

interface NotchNotificationPillProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  onOpenNotch: () => void;
  shapeConfig: {
    type: string;
    width: number;
    height: number;
    cornerRadius: number;
    glowColor: string;
    border: string;
    bg: string;
    eyeExpression: 'auto' | 'normal' | 'alert' | 'happy' | 'sleepy' | 'focused' | 'wink' | 'look-right' | 'look-left';
  };
  totalStacked?: number;
}

export const NotchNotificationPill: React.FC<NotchNotificationPillProps> = ({
  toast,
  onDismiss,
  onOpenNotch,
  shapeConfig,
  totalStacked = 1
}) => {
  const [progress, setProgress] = useState<number>(100);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const duration = toast.duration || 1400; // ~1.4s display then auto-hide
  const remainingTimeRef = useRef<number>(duration);

  // Auto-dismiss countdown timer, paused when user hovers
  useEffect(() => {
    let animFrame: number;
    let lastTime = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      if (!isHovered) {
        remainingTimeRef.current -= delta;
        const pct = Math.max(0, (remainingTimeRef.current / duration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          onDismiss(toast.id);
          return;
        }
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [toast.id, duration, isHovered, onDismiss]);

  const isDownload = shapeConfig.type === 'download';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpenNotch}
      className="w-full h-full flex items-center justify-between px-2.5 py-1 select-none cursor-pointer relative overflow-hidden"
    >
      {/* Left Section: Vayll Animated Eye with custom expression & glow */}
      <div className="flex items-center gap-2 shrink-0">
        <VayllEye
          size="xs"
          glowColor={shapeConfig.glowColor}
          expression={shapeConfig.eyeExpression}
          forceAlert={shapeConfig.type === 'error' || shapeConfig.type === 'warning'}
        />

        {/* Divider */}
        <div className="w-[1px] h-4 bg-white/15 shrink-0" />

        {/* Animated Custom Notification Icon */}
        <div className="shrink-0 scale-90">
          <NotificationIconAnimation
            type={toast.animType || toast.title || toast.appName || toast.icon}
            size="sm"
          />
        </div>
      </div>

      {/* Middle Section: Title & Message snippet */}
      <div className="flex-1 min-w-0 px-2 flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className="text-[10px] font-bold uppercase tracking-wider truncate"
            style={{ color: shapeConfig.glowColor }}
          >
            {toast.appName}
          </span>
          <span className="text-[10px] text-slate-400 truncate">
            {toast.title}
          </span>
        </div>
        <p className="text-[11px] text-slate-200 truncate font-medium">
          {toast.message}
        </p>
      </div>

      {/* Right Section: Stack Badge, Action & Dismiss */}
      <div className="flex items-center gap-1 shrink-0">
        {totalStacked > 1 && (
          <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] font-mono text-slate-300 font-bold border border-white/10">
            +{totalStacked - 1}
          </span>
        )}

        {toast.actionLabel && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotch();
            }}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-0.5 cursor-pointer"
          >
            <span>{toast.actionLabel}</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Progress Bar:
          If download, shows live moving pulse;
          Otherwise, shows the auto-hide progress indicator */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 overflow-hidden pointer-events-none">
        {isDownload ? (
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-1/2 h-full shadow-[0_0_8px_#38bdf8]"
            style={{ backgroundColor: shapeConfig.glowColor }}
          />
        ) : (
          <div
            className="h-full transition-all duration-75 ease-linear"
            style={{
              width: `${progress}%`,
              backgroundColor: shapeConfig.glowColor,
              boxShadow: `0 0 6px ${shapeConfig.glowColor}`
            }}
          />
        )}
      </div>
    </div>
  );
};
