import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotch } from '../../context/NotchContext';
import { NotchCompactPill } from './NotchCompactPill';
import { NotchExpandedDashboard } from './NotchExpandedDashboard';
import { NotchNotificationPill } from './NotchNotificationPill';
import { InvisibilityCloakOverlay } from './InvisibilityCloakOverlay';
import { FullscreenMusicModal } from './FullscreenMusicModal';
import { DetachedNotchWidget } from './DetachedNotchWidget';
import { getNotificationShapeConfig } from '../../utils/notchShapeHelper';
import { systemService } from '../../services/systemService';
import { audioEngine } from '../../services/audioEngine';
import { windowActivityService, DynamicActivity, WindowsApp } from '../../services/windowActivityService';
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
    addDropShelfFiles
  } = useNotch();

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [foregroundApp, setForegroundApp] = useState<WindowsApp | null>(null);
  const [launchStage, setLaunchStage] = useState<'pop' | 'compact' | 'expanded' | null>(null);

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

  // Custom notch dimensions (Feature 9):
  // Collapsed length: 100–340px, thickness: 28–72px
  const baseCompactWidth = Math.max(100, Math.min(340, config.compactWidth || 220));
  const baseCompactHeight = Math.max(28, Math.min(72, config.compactHeight || 38));

  const targetWidth = isExpanded
    ? Math.min(Math.max(config.expandedWidth, 680), typeof window !== 'undefined' ? Math.max(340, window.innerWidth - 32) : 680)
    : shapeConfig
    ? shapeConfig.width
    : launchStage === 'pop'
    ? 72
    : launchStage === 'compact'
    ? Math.max(baseCompactWidth, 240)
    : launchStage === 'expanded'
    ? 360
    : isCompleting
    ? 225
    : showLiveActivities && activeActivitiesCount >= 2
    ? Math.max(baseCompactWidth, 295)
    : showLiveActivities && (activeActivitiesCount === 1 || Boolean(foregroundApp))
    ? Math.max(baseCompactWidth, 245)
    : baseCompactWidth;

  const targetHeight = isExpanded
    ? 'auto'
    : shapeConfig
    ? shapeConfig.height
    : launchStage === 'pop'
    ? 44
    : launchStage === 'compact'
    ? baseCompactHeight
    : launchStage === 'expanded'
    ? 96
    : baseCompactHeight;

  const targetCornerRadius = isExpanded
    ? config.cornerRadius
    : shapeConfig
    ? shapeConfig.cornerRadius
    : launchStage === 'pop'
    ? 22
    : launchStage === 'expanded'
    ? 24
    : showLiveActivities && activeActivitiesCount > 0
    ? config.cornerRadius
    : Math.min(config.cornerRadius, Math.floor(baseCompactHeight / 2));

  // Theme styling (Including all 5 Pro Appearance Themes)
  const getThemeStyles = () => {
    if (shapeConfig) {
      return {
        background: shapeConfig.bg,
        backdropFilter: 'blur(30px)',
        border: shapeConfig.border,
        color: '#ffffff'
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
          border: '1px solid rgba(255, 255, 255, 0.14)',
          color: '#f8fafc'
        };
    }
  };

  // Glow shadow calculation
  const glowShadow = isNotchIngesting
    ? '0 0 0 1.5px #38bdf8, 0 16px 48px -4px rgba(0, 0, 0, 0.9), 0 0 36px 4px rgba(56, 189, 248, 0.85)'
    : shapeConfig
    ? `0 0 0 1px ${shapeConfig.glowColor}55, 0 16px 44px -4px rgba(0, 0, 0, 0.9), 0 0 28px -2px ${shapeConfig.glowColor}77`
    : config.theme === 'liquid-titanium'
    ? '0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 24px rgba(226, 232, 240, 0.22)'
    : config.theme === 'supernova-horizon'
    ? '0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 32px rgba(245, 158, 11, 0.35)'
    : config.theme === 'cyber-matrix-3d'
    ? '0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.4)'
    : config.theme === 'celestial-orrery'
    ? '0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 32px rgba(99, 102, 241, 0.35)'
    : config.theme === 'prism-core'
    ? '0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 28px rgba(236, 72, 153, 0.32), 0 0 14px rgba(56, 189, 248, 0.25)'
    : config.glowIntensity > 0
    ? `0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 ${Math.round(
        config.glowIntensity * 0.4
      )}px -2px ${config.glowColor}${Math.round((config.glowIntensity / 100) * 160)
        .toString(16)
        .padStart(2, '0')}`
    : '0 8px 32px rgba(0, 0, 0, 0.7)';

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

  // Precision spring physics configuration for 60fps fluid morphing
  const morphSpringTransition = {
    width: {
      type: 'spring' as const,
      stiffness: 480,
      damping: 32,
      mass: 0.48,
      restDelta: 0.05
    },
    height: {
      type: 'spring' as const,
      stiffness: 480,
      damping: 32,
      mass: 0.48,
      restDelta: 0.05
    },
    borderRadius: {
      type: 'spring' as const,
      stiffness: 440,
      damping: 28,
      mass: 0.46,
      restDelta: 0.05
    },
    scale: {
      type: 'spring' as const,
      stiffness: 520,
      damping: 30
    }
  };

  // Flexible notch placement classes (Feature 8)
  const getPlacementClass = () => {
    switch (config.placement) {
      case 'top-left':
        return 'fixed left-8 top-2 z-50 flex justify-start pointer-events-none select-none';
      case 'top-right':
        return 'fixed right-8 top-2 z-50 flex justify-end pointer-events-none select-none';
      case 'left':
        return 'fixed left-3 top-1/2 -translate-y-1/2 z-50 flex items-center pointer-events-none select-none';
      case 'right':
        return 'fixed right-3 top-1/2 -translate-y-1/2 z-50 flex items-center pointer-events-none select-none';
      case 'top-center':
      default:
        return 'fixed left-0 right-0 top-2 z-50 flex justify-center pointer-events-none select-none';
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

      {/* 4. Dynamic Island Notch on Screen Edge */}
      <div
        id="nova-notch-container"
        className={getPlacementClass()}
        style={{ top: config.placement.startsWith('top') ? `${config.topOffset}px` : undefined }}
      >
        {/* Invisible safe hover buffer with mouse shake listener */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handlePointerShake}
          className="pointer-events-auto p-1.5 -m-1.5"
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
              <AnimatePresence mode="wait" initial={false}>
                {isExpanded ? (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, y: -4, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.985 }}
                    transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full flex flex-col"
                  >
                    <NotchExpandedDashboard />
                  </motion.div>
                ) : activeToast && shapeConfig ? (
                  <motion.div
                    key={`notification-${activeToast.id}`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex items-center"
                  >
                    <NotchNotificationPill
                      toast={activeToast}
                      shapeConfig={shapeConfig}
                      totalStacked={toasts.length}
                      onDismiss={dismissToast}
                      onOpenNotch={handleOpenNotificationNotch}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="compact"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.09, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full flex items-center"
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
