import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { ToastNotification } from '../../types';
import { NotificationIconAnimation } from '../notifications/NotificationIconAnimation';

interface ToastItemProps {
  toast: ToastNotification;
  index: number;
  total: number;
  onDismiss: (id: string) => void;
  onOpenNotch: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  index,
  total,
  onDismiss,
  onOpenNotch
}) => {
  const [progress, setProgress] = useState<number>(100);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const duration = toast.duration || 1400; // ~1.4 second display then auto-hide
  const remainingTimeRef = useRef<number>(duration);

  // Auto-dismiss countdown timer with pause on hover
  useEffect(() => {
    if (index !== 0) return; // Only front toast drives auto-dismiss timer

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
  }, [toast.id, duration, isHovered, index, onDismiss]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 260) {
      onDismiss(toast.id);
    }
  };

  // Stack visuals: index 0 is front, index 1 & 2 stack cleanly behind
  const isFront = index === 0;
  const yOffset = index * 9;
  const scale = 1 - index * 0.035;
  const opacity = index === 0 ? 1 : index === 1 ? 0.88 : 0.68;
  const zIndex = total - index;

  return (
    <motion.div
      layout
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{
        opacity,
        y: yOffset,
        scale,
        transition: { type: 'spring', stiffness: 520, damping: 32 }
      }}
      exit={{
        opacity: 0,
        scale: 0.88,
        y: -14,
        transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] }
      }}
      style={{
        zIndex,
        pointerEvents: isFront ? 'auto' : 'none',
        transformOrigin: 'top center'
      }}
      className={`absolute top-0 left-1/2 -translate-x-1/2 w-[350px] max-w-[94vw] select-none rounded-2xl border border-white/20 bg-slate-950/92 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden cursor-grab active:cursor-grabbing transition-colors ${
        toast.priority === 'urgent'
          ? 'border-rose-500/50 shadow-[0_0_24px_rgba(244,63,94,0.3)]'
          : toast.priority === 'high'
          ? 'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]'
          : 'border-white/20'
      }`}
    >
      {/* Top Glass Highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          {/* Animated Unique Icon & Details */}
          <div
            onClick={onOpenNotch}
            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
          >
            <div className="shrink-0 mt-0.5">
              <NotificationIconAnimation
                type={toast.animType || toast.title || toast.appName || toast.icon}
                size="md"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 leading-none mb-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider truncate">
                  {toast.appName}
                </span>
                <span className="text-[10px] text-slate-500">· now</span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-tight truncate leading-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-0.5">
                {toast.message}
              </p>
            </div>
          </div>

          {/* Action & Close */}
          <div className="flex items-center gap-1 shrink-0">
            {toast.actionLabel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotch();
                }}
                className="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-bold border border-sky-400/30 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{toast.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-dismiss countdown bar */}
      {isFront && (
        <div className="w-full h-0.5 bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export const NotchToastCenter: React.FC = () => {
  const {
    toasts,
    dismissToast,
    config,
    isExpanded,
    expandNotch,
    setActiveTab
  } = useNotch();

  // In compact mode, the primary toast (toasts[0]) is rendered directly inside the morphing Notch!
  // Secondary stacked toasts (toasts.slice(1)) or all toasts during expanded state render here.
  const visibleToasts = isExpanded ? toasts : toasts.slice(1);

  if (visibleToasts.length === 0) return null;

  const handleOpenNotch = () => {
    expandNotch();
    setActiveTab('notifications');
  };

  const isBottomDocked = isExpanded;

  return (
    <div
      className={`fixed left-0 right-0 z-40 flex justify-center pointer-events-none select-none transition-all duration-200 ${
        isBottomDocked ? 'bottom-16' : ''
      }`}
      style={
        isBottomDocked
          ? undefined
          : { top: `${config.topOffset + config.compactHeight + 14}px` }
      }
    >
      <div className="relative w-[350px] max-w-[94vw] h-24">
        <AnimatePresence>
          {visibleToasts.slice(0, 3).map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={index}
              total={Math.min(visibleToasts.length, 3)}
              onDismiss={dismissToast}
              onOpenNotch={handleOpenNotch}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
