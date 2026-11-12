import React from 'react';
import { motion } from 'motion/react';
import { useNotch } from '../../context/NotchContext';

export const FullscreenEdgeLight: React.FC = () => {
  const { config, isPrivacyCameraActive } = useNotch();

  // If camera auto mode is on and camera is active, or if edge light is explicitly enabled
  const shouldShow =
    config.edgeLightEnabled ||
    (config.edgeLightEffect === 'camera_auto' && isPrivacyCameraActive);

  if (!shouldShow) return null;

  const thickness = config.edgeLightThickness || 12;
  const brightness = (config.edgeLightBrightness || 90) / 100;
  const isRgb = config.edgeLightEffect === 'rgb_rainbow';
  const isBreathe = config.edgeLightEffect === 'breathe';
  const color = config.edgeLightColor || '#ffffff';

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Top Edge Light Bar */}
      <motion.div
        animate={
          isRgb
            ? {
                background: [
                  'linear-gradient(90deg, #ff007f, #7928ca, #0070f3, #00dfd8, #7928ca, #ff007f)',
                  'linear-gradient(90deg, #0070f3, #00dfd8, #7928ca, #ff007f, #7928ca, #0070f3)'
                ]
              }
            : isBreathe
            ? { opacity: [brightness * 0.4, brightness, brightness * 0.4] }
            : { opacity: brightness }
        }
        transition={{
          repeat: Infinity,
          duration: isBreathe ? 2.5 : 4,
          ease: 'easeInOut'
        }}
        style={{
          height: `${thickness}px`,
          backgroundColor: isRgb ? undefined : color,
          boxShadow: `0 0 ${thickness * 2.5}px ${color}, 0 0 ${thickness * 5}px ${color}`
        }}
        className="absolute top-0 left-0 right-0"
      />

      {/* Bottom Edge Light Bar */}
      <motion.div
        animate={
          isRgb
            ? {
                background: [
                  'linear-gradient(90deg, #00dfd8, #7928ca, #ff007f, #0070f3, #00dfd8)',
                  'linear-gradient(90deg, #7928ca, #ff007f, #0070f3, #00dfd8, #7928ca)'
                ]
              }
            : isBreathe
            ? { opacity: [brightness * 0.4, brightness, brightness * 0.4] }
            : { opacity: brightness }
        }
        transition={{
          repeat: Infinity,
          duration: isBreathe ? 2.5 : 4,
          ease: 'easeInOut'
        }}
        style={{
          height: `${thickness}px`,
          backgroundColor: isRgb ? undefined : color,
          boxShadow: `0 0 ${thickness * 2.5}px ${color}, 0 0 ${thickness * 5}px ${color}`
        }}
        className="absolute bottom-0 left-0 right-0"
      />

      {/* Left Edge Light Bar */}
      <motion.div
        animate={
          isRgb
            ? {
                background: [
                  'linear-gradient(180deg, #ff007f, #7928ca, #0070f3, #00dfd8)',
                  'linear-gradient(180deg, #00dfd8, #0070f3, #7928ca, #ff007f)'
                ]
              }
            : isBreathe
            ? { opacity: [brightness * 0.4, brightness, brightness * 0.4] }
            : { opacity: brightness }
        }
        transition={{
          repeat: Infinity,
          duration: isBreathe ? 2.5 : 4,
          ease: 'easeInOut'
        }}
        style={{
          width: `${thickness}px`,
          backgroundColor: isRgb ? undefined : color,
          boxShadow: `0 0 ${thickness * 2.5}px ${color}, 0 0 ${thickness * 5}px ${color}`
        }}
        className="absolute top-0 bottom-0 left-0"
      />

      {/* Right Edge Light Bar */}
      <motion.div
        animate={
          isRgb
            ? {
                background: [
                  'linear-gradient(180deg, #00dfd8, #0070f3, #7928ca, #ff007f)',
                  'linear-gradient(180deg, #ff007f, #7928ca, #0070f3, #00dfd8)'
                ]
              }
            : isBreathe
            ? { opacity: [brightness * 0.4, brightness, brightness * 0.4] }
            : { opacity: brightness }
        }
        transition={{
          repeat: Infinity,
          duration: isBreathe ? 2.5 : 4,
          ease: 'easeInOut'
        }}
        style={{
          width: `${thickness}px`,
          backgroundColor: isRgb ? undefined : color,
          boxShadow: `0 0 ${thickness * 2.5}px ${color}, 0 0 ${thickness * 5}px ${color}`
        }}
        className="absolute top-0 bottom-0 right-0"
      />
    </div>
  );
};
