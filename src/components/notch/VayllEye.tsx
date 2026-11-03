import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useNotch } from '../../context/NotchContext';

export type VayllEyeExpression =
  | 'auto'
  | 'normal'
  | 'alert'
  | 'happy'
  | 'sleepy'
  | 'focused'
  | 'wink'
  | 'look-right'
  | 'look-left';

interface VayllEyeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  expression?: VayllEyeExpression;
  glowColor?: string;
  forceAlert?: boolean;
}

export const VayllEye: React.FC<VayllEyeProps> = ({
  size = 'md',
  interactive = true,
  expression = 'auto',
  glowColor,
  forceAlert = false
}) => {
  const { dndEnabled, activeActivityCount } = useNotch();

  // Spring-based motion values for smooth 60fps cursor tracking
  const rawTargetX = useMotionValue(0);
  const rawTargetY = useMotionValue(0);
  const rawScale = useMotionValue(1);

  // Precision spring physics configuration
  // stiffness: 320, damping: 26, mass: 0.32 gives alive, organic elasticity
  const springPhysics = { stiffness: 320, damping: 26, mass: 0.32 };
  const springX = useSpring(rawTargetX, springPhysics);
  const springY = useSpring(rawTargetY, springPhysics);
  const springScale = useSpring(rawScale, { stiffness: 440, damping: 28 });

  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isSquinting, setIsSquinting] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isNearCursor, setIsNearCursor] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMouseMoveRef = useRef<number>(Date.now());
  const blinkTimeoutRef = useRef<number | null>(null);
  const glanceTimeoutRef = useRef<number | null>(null);

  // Dimensions based on size
  const dims = useMemo(() => {
    return {
      xs: { w: 9, h: 12, pupilW: 4.5, pupilH: 6, gap: 4 },
      sm: { w: 11, h: 15, pupilW: 5.5, pupilH: 7.5, gap: 5 },
      md: { w: 13, h: 18, pupilW: 6.5, pupilH: 9, gap: 6 },
      lg: { w: 16, h: 22, pupilW: 8, pupilH: 11, gap: 7 }
    }[size];
  }, [size]);

  // Derived expressions
  const isSleepy = expression === 'sleepy' || (expression === 'auto' && dndEnabled);
  const isHappy = expression === 'happy' || (expression === 'auto' && isHovered);
  const isAlert = forceAlert || expression === 'alert';
  const isFocused = expression === 'focused' || (expression === 'auto' && activeActivityCount > 0 && !isHovered);
  const isLookingRight = expression === 'look-right';
  const isLookingLeft = expression === 'look-left';
  const isWinking = expression === 'wink';

  // Pupil displacement transforms driven directly by spring physics
  const pupilShiftX = useTransform(springX, (v) => {
    if (isLookingRight) return dims.w * 0.22;
    if (isLookingLeft) return -dims.w * 0.22;
    return v * (dims.w * 0.28);
  });

  const pupilShiftY = useTransform(springY, (v) => {
    return v * (dims.h * 0.24);
  });

  // Cursor position tracking & proximity handling
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveRef.current = Date.now();

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - eyeCenterX;
      const deltaY = e.clientY - eyeCenterY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Proximity detection: if cursor is within 140px, react
      const isNear = dist < 140;
      setIsNearCursor(isNear);

      // Scale up subtly when cursor gets close to the eyes
      rawScale.set(isAlert ? 1.15 : isNear ? 1.08 : 1);

      // Angle and non-linear distance tracking for natural deflection
      const maxDistance = Math.max(window.innerWidth, window.innerHeight);
      const intensity = Math.min(1, Math.max(0.12, dist / (maxDistance * 0.42)));

      const angle = Math.atan2(deltaY, deltaX);
      const targetGazeX = Math.cos(angle) * intensity;
      const targetGazeY = Math.sin(angle) * intensity;

      // Update spring target
      rawTargetX.set(Math.max(-0.68, Math.min(0.68, targetGazeX * 0.72)));
      rawTargetY.set(Math.max(-0.55, Math.min(0.55, targetGazeY * 0.62)));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, isAlert, rawScale, rawTargetX, rawTargetY]);

  // Organic random blink intervals and realistic double-blinks
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);

      // Eyelid down duration: 95ms
      const closeTimer = window.setTimeout(() => {
        setIsBlinking(false);

        // 20% probability of spontaneous double-blink
        if (Math.random() < 0.2) {
          const pauseTimer = window.setTimeout(() => {
            setIsBlinking(true);
            const secondClose = window.setTimeout(() => {
              setIsBlinking(false);
              scheduleNextBlink();
            }, 85);
            return () => clearTimeout(secondClose);
          }, 110);
          return () => clearTimeout(pauseTimer);
        } else {
          scheduleNextBlink();
        }
      }, 95);

      return () => clearTimeout(closeTimer);
    };

    const scheduleNextBlink = () => {
      // Natural random interval: 2.5s to 5.4s
      const delay = Math.random() * 2900 + 2500;
      blinkTimeoutRef.current = window.setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  // Subtle autonomous glance movement (micro-saccades) when mouse is idle
  useEffect(() => {
    const scheduleNextGlance = () => {
      // Idle saccades trigger every 2.4s to 4.2s
      const delay = Math.random() * 1800 + 2400;
      glanceTimeoutRef.current = window.setTimeout(() => {
        const now = Date.now();
        const isMouseIdle = now - lastMouseMoveRef.current > 2000;

        if (isMouseIdle && !isHovered && expression === 'auto') {
          const subtleSaccades = [
            { x: 0, y: 0 },
            { x: 0.35, y: -0.1 },
            { x: -0.35, y: -0.1 },
            { x: 0, y: 0.2 },
            { x: 0.42, y: 0.12 },
            { x: -0.42, y: 0.12 },
            { x: 0, y: 0 }
          ];
          const choice = subtleSaccades[Math.floor(Math.random() * subtleSaccades.length)];
          rawTargetX.set(choice.x);
          rawTargetY.set(choice.y);
        }

        scheduleNextGlance();
      }, delay);
    };

    scheduleNextGlance();

    return () => {
      if (glanceTimeoutRef.current) clearTimeout(glanceTimeoutRef.current);
    };
  }, [isHovered, expression, rawTargetX, rawTargetY]);

  // Color palette and glow
  const primaryGlow = glowColor || '#38bdf8';
  const irisGradient = glowColor
    ? `linear-gradient(180deg, ${glowColor}ee, ${glowColor})`
    : 'linear-gradient(180deg, #7dd3fc 0%, #38bdf8 50%, #0284c7 100%)';

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setIsHovered(true);
        rawScale.set(1.1);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        rawScale.set(1);
        rawTargetX.set(0);
        rawTargetY.set(0);
      }}
      onMouseDown={() => setIsSquinting(true)}
      onMouseUp={() => setIsSquinting(false)}
      className="inline-flex items-center justify-center select-none cursor-pointer group"
      style={{ gap: `${dims.gap}px` }}
      title="Vayll Reactive Smart Notch Eyes"
    >
      {/* Left Eye */}
      <motion.div
        style={{
          width: `${dims.w}px`,
          height: `${dims.h}px`,
          scale: springScale,
          backgroundColor: '#040711',
          boxShadow: isAlert
            ? `0 0 12px ${primaryGlow}, inset 0 0 5px ${primaryGlow}`
            : isHovered || isNearCursor
            ? `0 0 10px ${primaryGlow}99, inset 0 0 4px ${primaryGlow}66`
            : `0 0 6px ${primaryGlow}55`,
          border: `1px solid ${primaryGlow}88`
        }}
        className="relative flex items-center justify-center overflow-hidden rounded-full"
      >
        {/* Pupil & Iris with spring physics */}
        <motion.div
          animate={{
            scaleY: isBlinking ? 0.04 : isSquinting ? 0.25 : isSleepy ? 0.42 : isHappy ? 0.85 : 1,
            scaleX: isAlert ? 1.18 : isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
          className="rounded-full flex items-center justify-center relative"
          style={{
            x: pupilShiftX,
            y: pupilShiftY,
            width: `${dims.pupilW}px`,
            height: `${dims.pupilH}px`,
            background: irisGradient,
            boxShadow: `0 0 8px ${primaryGlow}`
          }}
        >
          {/* Specular White Glint */}
          <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white opacity-95 shadow-[0_0_2px_#ffffff]" />
        </motion.div>

        {/* Eyelid curve for happy / friendly expression */}
        {isHappy && !isBlinking && (
          <div
            className="absolute inset-0 border-b-2 rounded-b-full pointer-events-none"
            style={{ borderColor: primaryGlow }}
          />
        )}
      </motion.div>

      {/* Right Eye */}
      <motion.div
        style={{
          width: `${dims.w}px`,
          height: `${dims.h}px`,
          scale: springScale,
          backgroundColor: '#040711',
          boxShadow: isAlert
            ? `0 0 12px ${primaryGlow}, inset 0 0 5px ${primaryGlow}`
            : isHovered || isNearCursor
            ? `0 0 10px ${primaryGlow}99, inset 0 0 4px ${primaryGlow}66`
            : `0 0 6px ${primaryGlow}55`,
          border: `1px solid ${primaryGlow}88`
        }}
        className="relative flex items-center justify-center overflow-hidden rounded-full"
      >
        {/* Pupil & Iris with spring physics */}
        <motion.div
          animate={{
            scaleY: isBlinking || isWinking ? 0.04 : isSquinting ? 0.25 : isSleepy ? 0.42 : isHappy ? 0.85 : 1,
            scaleX: isAlert ? 1.18 : isHovered ? 1.1 : 1
          }}
          transition={{ duration: 0.08, ease: 'easeOut' }}
          className="rounded-full flex items-center justify-center relative"
          style={{
            x: pupilShiftX,
            y: pupilShiftY,
            width: `${dims.pupilW}px`,
            height: `${dims.pupilH}px`,
            background: irisGradient,
            boxShadow: `0 0 8px ${primaryGlow}`
          }}
        >
          {/* Specular White Glint */}
          <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white opacity-95 shadow-[0_0_2px_#ffffff]" />
        </motion.div>

        {/* Eyelid curve for happy / friendly expression */}
        {isHappy && !isBlinking && (
          <div
            className="absolute inset-0 border-b-2 rounded-b-full pointer-events-none"
            style={{ borderColor: primaryGlow }}
          />
        )}
      </motion.div>
    </div>
  );
};
