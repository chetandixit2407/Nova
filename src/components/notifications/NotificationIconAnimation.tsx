import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  ArrowDown,
  Check,
  AlertTriangle,
  AlertOctagon,
  BatteryWarning,
  Music,
  Timer,
  RefreshCw,
  Bell,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  MessageCircle
} from 'lucide-react';

export type NotificationAnimationType =
  | 'message'
  | 'download'
  | 'download_complete'
  | 'warning'
  | 'error'
  | 'battery_low'
  | 'music'
  | 'timer_complete'
  | 'system_update'
  | 'incoming_call'
  | 'missed_call'
  | 'whatsapp'
  | 'sms'
  | 'default';

interface NotificationIconAnimationProps {
  type: NotificationAnimationType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationIconAnimation: React.FC<NotificationIconAnimationProps> = ({
  type,
  size = 'md'
}) => {
  const dims = {
    sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
    md: { box: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { box: 'w-10 h-10', icon: 'w-5 h-5' }
  }[size];

  // Resolve type from string keywords
  const resolveType = (): NotificationAnimationType => {
    const t = type.toLowerCase();
    if (t.includes('incoming_call') || t.includes('ringing')) return 'incoming_call';
    if (t.includes('missed_call') || t.includes('missed')) return 'missed_call';
    if (t.includes('whatsapp')) return 'whatsapp';
    if (t.includes('sms')) return 'sms';
    if (t.includes('message') || t.includes('chat') || t.includes('mail')) return 'message';
    if (t.includes('download_complete') || t.includes('succeeded') || t.includes('merged') || t.includes('completed')) return 'download_complete';
    if (t.includes('download') || t.includes('installing') || t.includes('transfer')) return 'download';
    if (t.includes('warn') || t.includes('caution') || t.includes('threat')) return 'warning';
    if (t.includes('error') || t.includes('danger') || t.includes('failed') || t.includes('crash')) return 'error';
    if (t.includes('battery') || t.includes('power')) return 'battery_low';
    if (t.includes('music') || t.includes('spotify') || t.includes('track') || t.includes('sound')) return 'music';
    if (t.includes('timer') || t.includes('clock') || t.includes('pomodoro') || t.includes('alarm')) return 'timer_complete';
    if (t.includes('update') || t.includes('sync') || t.includes('refresh') || t.includes('system')) return 'system_update';
    return 'default';
  };

  const animType = resolveType();

  switch (animType) {
    // 0A. Incoming Phone Call: Ringing phone with expanding concentric soundwaves
    case 'incoming_call':
      return (
        <div
          className={`${dims.box} rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center relative shadow-[0_0_16px_rgba(16,185,129,0.4)] shrink-0`}
        >
          <motion.div
            animate={{ rotate: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}
          >
            <PhoneIncoming className={dims.icon} />
          </motion.div>
          <motion.span
            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl border-2 border-emerald-400 pointer-events-none"
          />
          <motion.span
            animate={{ scale: [1, 2], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            className="absolute inset-0 rounded-xl border-2 border-emerald-300 pointer-events-none"
          />
        </div>
      );

    // 0B. Missed Call
    case 'missed_call':
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${dims.box} rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0`}
        >
          <PhoneMissed className={dims.icon} />
        </motion.div>
      );

    // 0C. WhatsApp: Authentic Green with pulse
    case 'whatsapp':
      return (
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className={`${dims.box} rounded-xl bg-[#25D366]/25 border border-[#25D366]/60 text-[#25D366] flex items-center justify-center relative shadow-[0_0_14px_rgba(37,211,102,0.4)] shrink-0`}
        >
          <MessageCircle className={dims.icon} />
          <motion.span
            animate={{ scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_6px_#25D366]"
          />
        </motion.div>
      );

    // 0D. SMS Text Message
    case 'sms':
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${dims.box} rounded-xl bg-sky-500/25 border border-sky-400/60 text-sky-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(56,189,248,0.35)] shrink-0`}
        >
          <MessageSquare className={dims.icon} />
        </motion.div>
      );

    // 1. Message: gentle breathing pulse with staggered typing dot effects
    case 'message':
      return (
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(59,130,246,0.3)] shrink-0`}
        >
          <MessageSquare className={dims.icon} />
          {/* Subtle typing indicator dot on top right */}
          <motion.span
            animate={{ scale: [0, 1.2, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]"
          />
        </motion.div>
      );

    // 2. Download: animated download arrow with dipping progression
    case 'download':
      return (
        <div
          className={`${dims.box} rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex flex-col items-center justify-center relative shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0 overflow-hidden`}
        >
          <motion.div
            animate={{ y: [-4, 3, -4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className={dims.icon} />
          </motion.div>
          {/* Live tracking bar at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-cyan-500/30 overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              className="w-1/2 h-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]"
            />
          </div>
        </div>
      );

    // 3. Download Complete: radiant green success halo and pop-in checkmark
    case 'download_complete':
      return (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center relative shadow-[0_0_16px_rgba(16,185,129,0.4)] shrink-0`}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <Check className={`${dims.icon} stroke-[2.5]`} />
          </motion.div>
          {/* Expanding success halo */}
          <motion.span
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl border border-emerald-400"
          />
        </motion.div>
      );

    // 4. Warning: amber attention vibration pulse
    case 'warning':
      return (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -3, 3, -2, 0]
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center relative shadow-[0_0_14px_rgba(245,158,11,0.35)] shrink-0`}
        >
          <AlertTriangle className={dims.icon} />
          <motion.span
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl bg-amber-400/10 pointer-events-none"
          />
        </motion.div>
      );

    // 5. Error: red alert cardiac strobe and shake
    case 'error':
      return (
        <motion.div
          animate={{
            scale: [1, 1.1, 1, 1.08, 1],
            boxShadow: [
              '0 0 10px rgba(239,68,68,0.4)',
              '0 0 22px rgba(239,68,68,0.7)',
              '0 0 10px rgba(239,68,68,0.4)'
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-rose-500/25 border border-rose-500/60 text-rose-300 flex items-center justify-center relative shrink-0`}
        >
          <AlertOctagon className={dims.icon} />
        </motion.div>
      );

    // 6. Battery Low: flashing warning and electric spark
    case 'battery_low':
      return (
        <motion.div
          animate={{
            opacity: [1, 0.65, 1]
          }}
          transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-amber-600/20 border border-amber-500/50 text-amber-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(217,119,6,0.3)] shrink-0`}
        >
          <BatteryWarning className={dims.icon} />
          <motion.span
            animate={{ scale: [0.8, 1.3], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 rounded-xl border border-amber-400"
          />
        </motion.div>
      );

    // 7. Music: animated live equalizer oscillating frequency bars
    case 'music':
      return (
        <div
          className={`${dims.box} rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-300 flex items-center justify-center gap-0.5 px-2 relative shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0`}
        >
          <motion.span
            animate={{ height: ['4px', '14px', '6px'] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 bg-violet-400 rounded-full"
          />
          <motion.span
            animate={{ height: ['12px', '5px', '16px'] }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            className="w-1 bg-fuchsia-400 rounded-full"
          />
          <motion.span
            animate={{ height: ['6px', '16px', '8px'] }}
            transition={{ duration: 0.65, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="w-1 bg-sky-400 rounded-full"
          />
        </div>
      );

    // 8. Timer Complete: smooth expanding sonar radar ring ripple
    case 'timer_complete':
      return (
        <div
          className={`${dims.box} rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center relative shadow-[0_0_14px_rgba(245,158,11,0.35)] shrink-0`}
        >
          <Timer className={dims.icon} />
          {/* Sonar Ripple Rings */}
          <motion.span
            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl border border-amber-400"
          />
          <motion.span
            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            className="absolute inset-0 rounded-xl border border-amber-300"
          />
        </div>
      );

    // 9. System Update: smooth 360-degree rotating update sync gears
    case 'system_update':
      return (
        <div
          className={`${dims.box} rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center relative shadow-[0_0_12px_rgba(99,102,241,0.3)] shrink-0`}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className={dims.icon} />
          </motion.div>
        </div>
      );

    default:
      return (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`${dims.box} rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.25)]`}
        >
          <Bell className={dims.icon} />
        </motion.div>
      );
  }
};
