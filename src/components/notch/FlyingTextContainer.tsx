import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Sparkles } from 'lucide-react';
import { useNotch } from '../../context/NotchContext';

export const FlyingTextContainer: React.FC = () => {
  const { flyingTextItems, config } = useNotch();

  const notchX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
  const notchY = config.topOffset + 18;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {flyingTextItems.map((item) => {
          // Calculate curve control points for fluid Apple-style parabolic ingestion
          const deltaX = notchX - item.startX;
          const deltaY = notchY - item.startY;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 0.8,
                opacity: 0,
                rotate: deltaX > 0 ? -6 : 6
              }}
              animate={{
                x: [item.startX, item.startX + deltaX * 0.35, notchX],
                y: [item.startY, item.startY + deltaY * 0.7 - 20, notchY],
                scale: [0.8, 1.08, 0.18],
                opacity: [0, 1, 1, 0.4, 0],
                rotate: 0
              }}
              transition={{
                duration: 0.62,
                times: [0, 0.3, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                transformOrigin: 'center center'
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.7),inset_0_0_12px_rgba(56,189,248,0.3)] text-white text-xs select-none"
            >
              <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                <Copy className="w-3 h-3 text-sky-300 animate-pulse" />
              </div>
              <span className="font-mono text-[11px] text-sky-100 font-medium truncate max-w-[180px]">
                {item.text}
              </span>
              <Sparkles className="w-3 h-3 text-cyan-300 animate-spin shrink-0" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
