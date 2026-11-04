import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, PhoneCall, Mic, MicOff, Volume2, ShieldCheck, Smartphone } from 'lucide-react';
import { ActiveCallState } from '../../types';
import { phoneSyncService } from '../../services/phoneSyncService';
import { VayllEye } from './VayllEye';

interface IncomingCallNotchPillProps {
  call: ActiveCallState;
  onOpenNotch?: () => void;
}

export const IncomingCallNotchPill: React.FC<IncomingCallNotchPillProps> = ({ call, onOpenNotch }) => {
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  useEffect(() => {
    if (call.status !== 'connected' || !call.connectedAt) {
      setElapsedSec(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - call.connectedAt!) / 1000));
      setElapsedSec(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [call.status, call.connectedAt]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isRinging = call.status === 'ringing';
  const isConnected = call.status === 'connected';
  const isEnded = call.status === 'ended' || call.status === 'declined';

  return (
    <div
      onClick={onOpenNotch}
      className="w-full h-full flex items-center justify-between px-3 py-1 select-none cursor-pointer relative overflow-hidden"
    >
      {/* Dynamic Background Glow Layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isRinging
            ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent'
            : isConnected
            ? 'bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-transparent'
            : 'bg-rose-500/15'
        }`}
      />

      {/* Left Section: Eye Companion & Animated Phone Ring Icon */}
      <div className="flex items-center gap-2.5 shrink-0 z-10">
        <VayllEye
          size="xs"
          glowColor={isRinging ? '#10b981' : isConnected ? '#38bdf8' : '#f43f5e'}
          expression={isRinging ? 'alert' : isConnected ? 'happy' : 'sleepy'}
          forceAlert={isRinging}
        />

        <div className="w-[1px] h-4 bg-white/20 shrink-0" />

        {/* Dynamic Caller Avatar / Call Icon */}
        <div className="relative flex items-center justify-center">
          {isRinging && (
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute -inset-1 rounded-full bg-emerald-400/40"
            />
          )}

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md ${
              isRinging
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/30'
                : isConnected
                ? 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-sky-500/30'
                : 'bg-gradient-to-br from-rose-500 to-red-700'
            }`}
          >
            {isRinging ? (
              <motion.div
                animate={{ rotate: [-12, 12, -12, 12, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.8 }}
              >
                <PhoneCall className="w-4 h-4" />
              </motion.div>
            ) : isConnected ? (
              <Phone className="w-4 h-4" />
            ) : (
              <PhoneOff className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Caller Name, App & Live Timer */}
      <div className="flex-1 min-w-0 px-3 flex flex-col justify-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white truncate tracking-wide">
            {call.callerName}
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
              call.appType === 'whatsapp'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                : 'bg-sky-500/25 text-sky-300 border border-sky-500/30'
            }`}
          >
            {call.appType === 'whatsapp' ? 'WhatsApp' : 'Cellular HD'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-300">
          {isRinging && (
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Incoming Call • {call.callerNumber}</span>
              <span className="text-[9px] bg-white/10 px-1 rounded text-slate-300">📳 Vibrate</span>
            </div>
          )}

          {isConnected && (
            <div className="flex items-center gap-2 text-sky-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="font-semibold text-white">{formatDuration(elapsedSec)}</span>
              {call.isMuted && (
                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MUTED
                </span>
              )}
              {/* Subtle Audio Wave Equalizer Visualizer */}
              <div className="flex items-center gap-0.5 h-2.5 ml-1">
                {[40, 90, 60, 100, 75, 45].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                    transition={{
                      duration: 0.6 + i * 0.1,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut'
                    }}
                    className="w-0.5 bg-emerald-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          {isEnded && (
            <span className="text-rose-400 font-medium">
              {call.status === 'declined' ? 'Call Declined' : 'Call Ended'}
            </span>
          )}
        </div>
      </div>

      {/* Right Section: Interactive Action Controls */}
      <div className="flex items-center gap-2 shrink-0 z-10">
        {isRinging && (
          <div className="flex items-center gap-1.5">
            {/* Decline Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                phoneSyncService.declineCall(call.id);
              }}
              className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 cursor-pointer transition-colors"
              title="Decline Call"
            >
              <PhoneOff className="w-4 h-4" />
            </motion.button>

            {/* Answer / Accept Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                phoneSyncService.answerCall(call.id);
              }}
              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 cursor-pointer transition-colors relative"
              title="Answer Call"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute -inset-1 rounded-full border-2 border-emerald-400 pointer-events-none"
              />
              <Phone className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {isConnected && (
          <div className="flex items-center gap-1.5">
            {/* Mute Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                phoneSyncService.toggleMuteCall(call.id);
              }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                call.isMuted
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
              title={call.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {call.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </motion.button>

            {/* End Call Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                phoneSyncService.endCall(call.id);
              }}
              className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30 cursor-pointer transition-colors"
              title="End Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
