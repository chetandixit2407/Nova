import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, EyeOff, Lock, X } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface InvisibilityCloakOverlayProps {
  isActive: boolean;
  onDismiss: () => void;
}

export const InvisibilityCloakOverlay: React.FC<InvisibilityCloakOverlayProps> = ({
  isActive,
  onDismiss
}) => {
  useEffect(() => {
    if (isActive) {
      soundService.play('notch_expand');
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(36px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={onDismiss}
          className="fixed inset-0 z-40 bg-black/60 cursor-pointer flex flex-col items-center justify-center select-none"
        >
          {/* Frosted Glass Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/40 pointer-events-none" />

          {/* Privacy Badge Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 15, opacity: 0 }}
            transition={{ duration: 0.22, delay: 0.05 }}
            onClick={(e) => e.stopPropagation()}
            className="relative px-8 py-6 rounded-2xl bg-[#090d16]/85 border border-white/20 shadow-2xl backdrop-blur-2xl flex flex-col items-center max-w-sm text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
              <EyeOff className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Invisibility Cloak Active
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              All background windows and desktop content are securely frosted behind a privacy blur.
            </p>

            <div className="mt-5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-[11px] text-slate-300 border border-white/10">
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white font-mono text-[10px]">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white font-mono text-[10px]">Alt</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white font-mono text-[10px]">H</kbd>
              <span className="text-slate-400 mx-1">or</span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-white font-mono text-[10px]">Esc</kbd>
            </div>

            <button
              onClick={onDismiss}
              className="mt-5 w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 transition text-xs font-medium text-white flex items-center justify-center gap-2"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss Cloak
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
