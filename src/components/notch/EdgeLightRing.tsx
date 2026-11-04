import React from 'react';
import { motion } from 'motion/react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';

interface EdgeLightRingProps {
  borderRadius: number;
}

export const EdgeLightRing: React.FC<EdgeLightRingProps> = ({ borderRadius }) => {
  const { config, isExpanded, tasks, isPomodoroRunning, toasts } = useNotch();
  const isPlaying = audioEngine.getIsPlaying();
  const hasRunningTask = tasks.some((t) => t.status === 'running');
  const hasUnreadToast = toasts.length > 0;

  // Determine edge color gradient based on active ecosystem status
  let glowColor = 'rgba(255, 255, 255, 0.15)';
  let auraShadow = '0 0 12px rgba(255, 255, 255, 0.08)';

  if (hasUnreadToast) {
    glowColor = 'rgba(244, 63, 94, 0.7)';
    auraShadow = '0 0 20px rgba(244, 63, 94, 0.4)';
  } else if (isPomodoroRunning) {
    glowColor = 'rgba(245, 158, 11, 0.6)';
    auraShadow = '0 0 18px rgba(245, 158, 11, 0.35)';
  } else if (hasRunningTask) {
    glowColor = 'rgba(16, 185, 129, 0.65)';
    auraShadow = '0 0 18px rgba(16, 185, 129, 0.35)';
  } else if (isPlaying) {
    glowColor = 'rgba(34, 211, 238, 0.65)';
    auraShadow = '0 0 20px rgba(34, 211, 238, 0.38)';
  }

  return (
    <motion.div
      animate={{
        boxShadow: auraShadow,
        borderColor: glowColor
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        borderRadius: `${borderRadius}px`,
        pointerEvents: 'none'
      }}
      className="absolute inset-0 border border-white/20 z-30 transition-colors pointer-events-none"
    >
      {/* Subtle sweeping neon highlight across the top edge */}
      <motion.div
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          repeat: Infinity,
          duration: isPlaying ? 2.2 : 5,
          ease: 'linear'
        }}
        className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none opacity-50"
      />
    </motion.div>
  );
};
