import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotch } from '../../context/NotchContext';
import { NotchCompactPill } from './NotchCompactPill';
import { NotchExpandedDashboard } from './NotchExpandedDashboard';
import { NotchAppLauncher } from './NotchAppLauncher';
import { NotchNotificationPill } from './NotchNotificationPill';
import { IncomingCallNotchPill } from './IncomingCallNotchPill';
import { InvisibilityCloakOverlay } from './InvisibilityCloakOverlay';
import { FullscreenMusicModal } from './FullscreenMusicModal';
import { DetachedNotchWidget } from './DetachedNotchWidget';
import { EdgeLightRing } from './EdgeLightRing';
import { getNotificationShapeConfig } from '../../utils/notchShapeHelper';
import { systemService } from '../../services/systemService';
import { audioEngine } from '../../services/audioEngine';
import { windowActivityService, DynamicActivity, WindowsApp } from '../../services/windowActivityService';
import { phoneSyncService } from '../../services/phoneSyncService';
import { soundService } from '../../services/soundService';
import { greetingService, ActiveGreetingState } from '../../services/greetingService';
import { PersonalizedGreetingBanner } from './PersonalizedGreetingBanner';
import { ActiveCallState } from '../../types';
import { FileUp, Sparkles, Dock } from 'lucide-react';

export const NotchRoot: React.FC = () => {
  const {
    config,
    isExpanded,
    activeTab,
    handleMouseEnter,
    handleMouseLeave,
    addTask,
    showLiveActivities,
    tasks,
    isNotchIngesting,
    toasts,
    dismissToast,
    expandNotch,
    setActiveTab,
    invisibilityCloakActive,
    toggleInvisibilityCloak,
    setInvisibilityCloakActive,
    isDetached,
    toggleDetached,
    isFullscreenMusicOpen,
    setIsFullscreenMusicOpen,
    addDropShelfFiles,
    eyesOnlyMode,
    toggleExpand,
    collapseNotch,
    notchPosition,
    setNotchPosition,
    resetNotchPosition,
    isCustomPositioned
  } = useNotch();

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [foregroundApp, setForegroundApp] = useState<WindowsApp | null>(null);
  const [launchStage, setLaunchStage] = useState<'pop' | 'compact' | 'expanded' | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(phoneSyncService.getActiveCall());
  const [activeGreeting, setActiveGreeting] = useState<ActiveGreetingState>(greetingService.getActiveGreeting());

  // Phone Call & Notification sync subscription
  useEffect(() => {
    const unsub = phoneSyncService.subscribe(() => {
      setActiveCall(phoneSyncService.getActiveCall());
    });
    return unsub;
  }, []);

  // Personalized Greeting subscription
  useEffect(() => {
    const unsub = greetingService.subscribe(() => {
      setActiveGreeting(greetingService.getActiveGreeting());
    });
    return unsub;
  }, []);

  // Dynamic Island content measurement and OS reduced-motion sensitivity
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(510);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [screenBounds, setScreenBounds] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);

    const handleResize = () => {
      setScreenBounds({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      mql.removeEventListener('change', handler);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!expandedContentRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
        if (h && h > 120) {
          setContentHeight(Math.round(h));
        }
      }
    });
    ro.observe(expandedContentRef.current);
    return () => ro.disconnect();
  }, [isExpanded]);

  // Mouse shake detection inside notch for Invisibility Cloak activation
  const lastShakeRef = useRef<{ lastX: number; lastDir: number; count: number; lastTime: number }>({
    lastX: 0,
    lastDir: 0,
    count: 0,
    lastTime: 0
  });

  const handlePointerShake = (e: React.MouseEvent) => {
    const now = Date.now();
    const currentX = e.clientX;
    const diff = currentX - lastShakeRef.current.lastX;

    if (Math.abs(diff) > 20) {
      const dir = diff > 0 ? 1 : -1;
      if (lastShakeRef.current.lastDir !== 0 && dir !== lastShakeRef.current.lastDir) {
        if (now - lastShakeRef.current.lastTime < 500) {
          lastShakeRef.current.count += 1;
          if (lastShakeRef.current.count >= 4) {
            toggleInvisibilityCloak();
            lastShakeRef.current.count = 0;
          }
        } else {
          lastShakeRef.current.count = 1;
        }
      }
      lastShakeRef.current.lastDir = dir;
      lastShakeRef.current.lastX = currentX;
      lastShakeRef.current.lastTime = now;
    }
  };

  useEffect(() => {
    const unsubAudio = audioEngine.subscribe(() => {
      setIsAudioPlaying(audioEngine.getIsPlaying());
    });
    const unsubActs = windowActivityService.subscribeActivities((acts) => {
      setActivities(acts);
    });
    const unsubFg = windowActivityService.subscribeForeground((app) => {
      setForegroundApp(app);
    });
    const unsubLaunch = windowActivityService.subscribeLaunchEvents((e) => {
      setLaunchStage(e.stage);
      if (e.stage === 'expanded') {
        window.setTimeout(() => {
          setLaunchStage(null);
        }, 2800);
      }
    });

    return () => {
      unsubAudio();
      unsubActs();
      unsubFg();
      unsubLaunch();
    };
  }, []);

  const hasLiveTask = tasks.some((t) => t.status === 'running');
  const activeActivitiesCount = activities.filter((a) => a.status === 'active' || a.status === 'launching').length + (isAudioPlaying ? 1 : 0);
  const isCompleting = activities.some((a) => a.status === 'completing');

  // Active notification detection for dynamic notch morphing
  const activeToast = !isExpanded && toasts.length > 0 ? toasts[0] : null;
  const shapeConfig = activeToast ? getNotificationShapeConfig(activeToast) : null;
  const isGreetingActive = !isExpanded && !activeCall && !activeToast && activeGreeting.isActive;

  // Vault-Style Minimal Notch UI:
  // Collapsed: ONLY two minimal animated eyes in an ultra-clean compact capsule
  const baseCompactWidth = 118;
  const baseCompactHeight = 36;
  const responsiveCompactWidth = Math.min(baseCompactWidth, screenBounds.width - 24);

  // Expanded: The complete rich NOVA Dashboard (Media Player, Activities, Controls, Phone Sync, Quick Apps, etc.)
  const maxAllowedWidth = Math.min(560, screenBounds.width - 24);
  const maxAllowedHeight = eyesOnlyMode
    ? 220
    : Math.min(340, screenBounds.height - 24);

  const targetWidth = isExpanded ? maxAllowedWidth : responsiveCompactWidth;
  const targetHeight = isExpanded ? maxAllowedHeight : baseCompactHeight;

  // Synchronize Tauri native window bounds and top-center positioning with zero resize flicker
  useEffect(() => {
    const numHeight = typeof targetHeight === 'number' ? targetHeight : 340;
    systemService.syncNativeWindow(isExpanded, targetWidth, numHeight);
  }, [isExpanded, targetWidth, targetHeight]);

  const targetCornerRadius = isExpanded ? 24 : 18;

  // Theme styling (Including all 5 Pro Appearance Themes)
  const getThemeStyles = () => {
    if (!isExpanded) {
      return {
        background: 'rgba(5, 8, 16, 0.96)',
        backdropFilter: 'blur(28px)',
        border: '1px solid rgba(56, 189, 248, 0.45)',
        color: '#f8fafc'
      };
    }

    if (activeCall) {
      if (activeCall.status === 'ringing') {
        return {
          background: 'radial-gradient(ellipse at top, rgba(6, 40, 28, 0.96) 0%, rgba(2, 16, 12, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(16, 185, 129, 0.65)',
          color: '#ecfdf5'
        };
      } else if (activeCall.status === 'connected') {
        return {
          background: 'radial-gradient(ellipse at top, rgba(8, 30, 48, 0.96) 0%, rgba(4, 14, 24, 0.98) 100%)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(56, 189, 248, 0.6)',
          color: '#f0f9ff'
        };
      } else {
        return {
          background: 'rgba(30, 10, 16, 0.95)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(244, 63, 94, 0.55)',
          color: '#fff1f2'
        };
      }
    }

    if (shapeConfig) {
      return {
        background: shapeConfig.bg,
        backdropFilter: 'blur(30px)',
        border: shapeConfig.border,
        color: '#ffffff'
      };
    }

    if (isGreetingActive) {
      return {
        background: 'radial-gradient(ellipse at top, rgba(12, 28, 48, 0.96) 0%, rgba(5, 12, 24, 0.98) 100%)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(56, 189, 248, 0.5)',
        color: '#f0f9ff'
      };
    }


    switch (config.theme) {
      // 1. Pro: Liquid Titanium
      case 'liquid-titanium':
        return {
          background: 'linear-gradient(135deg, rgba(28, 33, 44, 0.94) 0%, rgba(16, 19, 26, 0.97) 100%)',
          backdropFilter: `blur(${Math.max(config.blur, 28)}px)`,
          border: '1px solid rgba(226, 232, 240, 0.42)',
          color: '#f8fafc'
        };

      // 2. Pro: Supernova Horizon
      case 'supernova-horizon':
        return {
          background: 'radial-gradient(ellipse at top, rgba(48, 22, 10, 0.95) 0%, rgba(14, 10, 20, 0.97) 100%)',
          backdropFilter: `blur(${Math.max(config.blur, 30)}px)`,
          border: '1px solid rgba(245, 158, 11, 0.55)',
          color: '#fef3c7'
        };

      // 3. Pro: Cyber Matrix 3D
      case 'cyber-matrix-3d':
        return {
          background: 'linear-gradient(180deg, rgba(4, 24, 18, 0.96) 0%, rgba(2, 12, 10, 0.98) 100%)',
          backdropFilter: `blur(${Math.max(config.blur, 30)}px)`,
          border: '1px solid rgba(52, 211, 153, 0.55)',
          color: '#ecfdf5'
        };

      // 4. Pro: Celestial Orrery
      case 'celestial-orrery':
        return {
          background: 'linear-gradient(135deg, rgba(16, 18, 44, 0.95) 0%, rgba(8, 10, 26, 0.98) 100%)',
          backdropFilter: `blur(${Math.max(config.blur, 30)}px)`,
          border: '1px solid rgba(129, 140, 248, 0.5)',
          color: '#e0e7ff'
        };

      // 5. Pro: Prism Core
      case 'prism-core':
        return {
          background: 'linear-gradient(135deg, rgba(18, 18, 30, 0.94) 0%, rgba(10, 10, 18, 0.97) 100%)',
          backdropFilter: `blur(${Math.max(config.blur, 32)}px)`,
          border: '1px solid rgba(236, 72, 153, 0.5)',
          color: '#ffffff'
        };

      case 'windows-mica':
        return {
          background: `rgba(22, 27, 46, ${config.opacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          border: '1px solid rgba(129, 140, 248, 0.25)',
          color: '#f8fafc'
        };
      case 'cyber-glow':
        return {
          background: `rgba(4, 20, 16, ${config.opacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          border: '1px solid rgba(16, 185, 129, 0.45)',
          color: '#ecfdf5'
        };
      case 'oled-stealth':
        return {
          background: '#000000',
          backdropFilter: 'none',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          color: '#ffffff'
        };
      case 'frosted-glass':
        return {
          background: `rgba(24, 24, 32, ${Math.min(config.opacity, 0.82)})`,
          backdropFilter: `blur(${Math.max(config.blur, 30)}px)`,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff'
        };
      case 'light-frost':
        return {
          background: `rgba(255, 255, 255, ${config.opacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          color: '#0f172a'
        };
      case 'midnight':
      default:
        return {
          background: `rgba(10, 14, 24, ${config.opacity})`,
          backdropFilter: `blur(${config.blur}px)`,
          border: '1px solid rgba(56, 189, 248, 0.45)',
          color: '#f8fafc'
        };
    }
  };

  // Glow shadow calculation
  const glowShadow = !isExpanded
    ? '0 0 0 1px rgba(56, 189, 248, 0.4), 0 8px 24px -4px rgba(0, 0, 0, 0.85), 0 0 16px -2px rgba(56, 189, 248, 0.4)'
    : activeCall
    ? activeCall.status === 'ringing'
      ? '0 0 0 1.5px #10b981, 0 16px 48px -4px rgba(0, 0, 0, 0.9), 0 0 36px 4px rgba(16, 185, 129, 0.75)'
      : '0 0 0 1px #38bdf8, 0 16px 48px -4px rgba(0, 0, 0, 0.9), 0 0 28px -2px rgba(56, 189, 248, 0.65)'
    : isNotchIngesting
    ? '0 0 0 1.5px #38bdf8, 0 16px 48px -4px rgba(0, 0, 0, 0.9), 0 0 36px 4px rgba(56, 189, 248, 0.85)'
    : config.glowIntensity > 0
    ? `0 0 0 1px rgba(56, 189, 248, 0.35), 0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 ${Math.round(
        config.glowIntensity * 0.4
      )}px -2px ${config.glowColor}${Math.round((config.glowIntensity / 100) * 160)
        .toString(16)
        .padStart(2, '0')}`
    : '0 0 0 1px rgba(56, 189, 248, 0.35), 0 12px 36px -4px rgba(0, 0, 0, 0.85), 0 0 20px -2px rgba(56, 189, 248, 0.35)';

  // Drag and drop directly onto notch (Feat 10: Drop Shelf integration)
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files);
      const droppedList = filesArr.map((f) => ({
        id: `shelf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        addedAt: Date.now()
      }));
      addDropShelfFiles(droppedList);

      const file = filesArr[0];
      addTask({
        title: `Ingesting: ${file.name}`,
        type: 'upload',
        progress: 0,
        speed: 'Drop Shelf Added',
        detail: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        status: 'running',
        icon: 'FileUp',
        canPause: false,
        canCancel: true
      });

      systemService.processFileDrop(file, () => {});
    }
  };

  const handleOpenNotificationNotch = () => {
    expandNotch();
    setActiveTab('notifications');
  };

  // Precision Apple Dynamic Island spring physics configuration for 60fps fluid morphing
  const morphSpringTransition = prefersReducedMotion
    ? { duration: 0.01 }
    : {
        width: {
          type: 'spring' as const,
          stiffness: 420,
          damping: 34,
          mass: 0.48,
          restDelta: 0.01
        },
        height: {
          type: 'spring' as const,
          stiffness: 420,
          damping: 34,
          mass: 0.48,
          restDelta: 0.01
        },
        borderRadius: {
          type: 'spring' as const,
          stiffness: 420,
          damping: 34,
          mass: 0.48,
          restDelta: 0.01
        },
        scale: {
          type: 'spring' as const,
          stiffness: 450,
          damping: 30
        }
      };

  // Screen bounds clamping and free positioning calculation
  const defaultTop = config.topOffset || 12;
  const defaultLeft = Math.max(8, Math.round((screenBounds.width - targetWidth) / 2));

  const currentLeft = notchPosition ? notchPosition.x : defaultLeft;
  const currentTop = notchPosition ? notchPosition.y : defaultTop;

  const clampPos = (x: number, y: number, w: number, h: number) => {
    const minX = 8;
    const maxX = Math.max(minX, screenBounds.width - w - 8);
    const minY = 8;
    const maxY = Math.max(minY, screenBounds.height - h - 8);
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  };

  const activePos = clampPos(
    currentLeft,
    currentTop,
    targetWidth,
    typeof targetHeight === 'number' ? targetHeight : 48
  );

  const [isDraggingNow, setIsDraggingNow] = useState<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const notchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const target = e.target as HTMLElement;
    // Don't drag when clicking controls, buttons, inputs, sliders, or links
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('[role="slider"]') ||
      target.closest('.interactive-control') ||
      target.closest('.no-drag')
    ) {
      return;
    }

    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    notchStartRef.current = { x: activePos.x, y: activePos.y };
    hasMovedRef.current = false;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (!hasMovedRef.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      hasMovedRef.current = true;
      setIsDraggingNow(true);
    }

    if (hasMovedRef.current) {
      const rawX = notchStartRef.current.x + dx;
      const rawY = notchStartRef.current.y + dy;
      const clamped = clampPos(
        rawX,
        rawY,
        targetWidth,
        typeof targetHeight === 'number' ? targetHeight : 48
      );
      setNotchPosition({ x: clamped.x, y: clamped.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const wasDragging = hasMovedRef.current;
    pointerStartRef.current = null;
    setIsDraggingNow(false);

    if (wasDragging) {
      soundService.playTick();
    }
  };

  return (
    <>
      {/* 1. Invisibility Cloak Fullscreen Privacy Layer */}
      <InvisibilityCloakOverlay
        isActive={invisibilityCloakActive}
        onDismiss={() => setInvisibilityCloakActive(false)}
      />

      {/* 2. Fullscreen Immersive Music Studio Modal */}
      <FullscreenMusicModal
        isOpen={isFullscreenMusicOpen}
        onClose={() => setIsFullscreenMusicOpen(false)}
      />

      {/* 3. Detached Notch Screen Floating Widget */}
      {isDetached && (
        <DetachedNotchWidget
          onDockBack={() => toggleDetached()}
          onOpenFullscreenMusic={() => setIsFullscreenMusicOpen(true)}
        />
      )}

      {/* 4. Dynamic Island Notch on Screen Edge (Free Drag Anywhere) */}
      <div
        id="nova-notch-container"
        className="fixed z-50 pointer-events-none select-none transition-[left,top] duration-75 ease-out"
        style={{
          left: `${activePos.x}px`,
          top: `${activePos.y}px`
        }}
      >
        {/* Invisible safe buffer with drag handlers & mouse shake listener */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handlePointerShake}
          className={`pointer-events-auto p-1.5 -m-1.5 ${isDraggingNow ? 'cursor-grabbing' : 'cursor-default'}`}
        >
          {isDetached ? (
            /* Subtle Re-dock Capsule when Detached */
            <motion.button
              onClick={() => toggleDetached()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3.5 py-1.5 rounded-full bg-black/80 border border-sky-400/40 backdrop-blur-xl text-sky-300 text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-sky-500/15"
            >
              <Dock className="w-3.5 h-3.5" />
              <span>Notch Detached • Click to Dock</span>
            </motion.button>
          ) : (
            <motion.div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              initial={false}
              animate={{
                width: targetWidth,
                height: targetHeight,
                borderRadius: targetCornerRadius,
                scale: isNotchIngesting ? 1.06 : isExpanded ? 1 : 0.995
              }}
              transition={morphSpringTransition}
              style={{
                ...getThemeStyles(),
                boxShadow: glowShadow,
                willChange: 'width, height, transform, border-radius, box-shadow',
                transform: 'translateZ(0)'
              }}
              className="relative overflow-hidden transition-[box-shadow,border-color,background-color] duration-150"
            >
              {/* Ambient dynamic edge light ring */}
              <EdgeLightRing borderRadius={targetCornerRadius} />

              {/* Subtle glass sheen on top edge */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Drag & drop active indicator */}
              {isDragOver && (
                <div className="absolute inset-0 z-50 bg-sky-500/20 backdrop-blur-md flex items-center justify-center border-2 border-dashed border-sky-400 text-sky-200 text-xs font-semibold gap-2">
                  <FileUp className="w-5 h-5 animate-bounce" />
                  <span>Drop into Shelf</span>
                </div>
              )}

              {/* Fluid content morphing */}
              <AnimatePresence mode="popLayout" initial={false}>
                {isExpanded ? (
                  <motion.div
                    ref={expandedContentRef}
                    key="expanded"
                    initial={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(3px)', transition: { duration: 0.12 } }}
                    transition={{ duration: 0.22, delay: 0.03, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex flex-col overflow-hidden"
                  >
                    <NotchExpandedDashboard />
                  </motion.div>
                ) : (
                  <motion.div
                    key="compact"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.18, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <NotchCompactPill />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};
