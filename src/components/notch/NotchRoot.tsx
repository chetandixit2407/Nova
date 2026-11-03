import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotch } from '../../context/NotchContext';
import { NotchCompactPill } from './NotchCompactPill';
import { NotchExpandedHeader } from './NotchExpandedHeader';
import { NotchActivitiesTab } from './NotchActivitiesTab';
import { NotchMediaTab } from './NotchMediaTab';
import { NotchAIHubTab } from './NotchAIHubTab';
import { NotchControlsTab } from './NotchControlsTab';
import { NotchNotificationsTab } from './NotchNotificationsTab';
import { NotchSettingsTab } from './NotchSettingsTab';
import { NotchNotificationPill } from './NotchNotificationPill';
import { getNotificationShapeConfig } from '../../utils/notchShapeHelper';
import { systemService } from '../../services/systemService';
import { audioEngine } from '../../services/audioEngine';
import { FileUp } from 'lucide-react';

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
    setActiveTab
  } = useNotch();

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsAudioPlaying(audioEngine.getIsPlaying());
    });
    return unsub;
  }, []);

  const hasLiveTask = tasks.some((t) => t.status === 'running');
  const hasLiveActivity = isAudioPlaying || hasLiveTask;

  // Active notification detection for dynamic notch morphing
  const activeToast = !isExpanded && toasts.length > 0 ? toasts[0] : null;
  const shapeConfig = activeToast ? getNotificationShapeConfig(activeToast) : null;

  // Target dimensions based on state:
  // 1. Expanded: Sleek compact NOVA dashboard
  // 2. Active Notification: Dynamically tailored width, height, corner radius & glow
  // 3. Live Activity: Streamlined live activity pill
  // 4. Idle Resting: Pure Eyes-Only resting capsule
  const targetWidth = isExpanded
    ? Math.min(config.expandedWidth, typeof window !== 'undefined' ? Math.max(340, window.innerWidth - 32) : 540)
    : shapeConfig
    ? shapeConfig.width
    : hasLiveActivity && showLiveActivities
    ? 265
    : 112;

  const targetHeight = isExpanded
    ? 'auto'
    : shapeConfig
    ? shapeConfig.height
    : config.compactHeight;

  const targetCornerRadius = isExpanded
    ? config.cornerRadius
    : shapeConfig
    ? shapeConfig.cornerRadius
    : hasLiveActivity && showLiveActivities
    ? config.cornerRadius
    : 18;

  // Theme styling
  const getThemeStyles = () => {
    // If notification is actively morphing the notch, tint background and border dynamically
    if (shapeConfig) {
      return {
        background: shapeConfig.bg,
        backdropFilter: 'blur(30px)',
        border: shapeConfig.border,
        color: '#ffffff'
      };
    }

    switch (config.theme) {
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
    : config.glowIntensity > 0
    ? `0 0 0 1px rgba(255, 255, 255, 0.1), 0 16px 48px -6px rgba(0, 0, 0, 0.85), 0 0 ${Math.round(
        config.glowIntensity * 0.4
      )}px -2px ${config.glowColor}${Math.round((config.glowIntensity / 100) * 160)
        .toString(16)
        .padStart(2, '0')}`
    : '0 8px 32px rgba(0, 0, 0, 0.7)';

  // Drag and drop directly onto notch
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
      const file = e.dataTransfer.files[0];
      addTask({
        title: `Ingesting: ${file.name}`,
        type: 'upload',
        progress: 0,
        speed: 'Reading file...',
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'activities':
        return <NotchActivitiesTab />;
      case 'media':
        return <NotchMediaTab />;
      case 'ai_hub':
        return <NotchAIHubTab />;
      case 'controls':
        return <NotchControlsTab />;
      case 'notifications':
        return <NotchNotificationsTab />;
      case 'settings':
        return <NotchSettingsTab />;
      default:
        return <NotchActivitiesTab />;
    }
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

  return (
    <div
      id="nova-notch-container"
      className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none select-none"
      style={{ top: `${config.topOffset}px` }}
    >
      {/* Invisible safe hover buffer */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto p-1.5 -m-1.5"
      >
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
              <span>Drop file into NOVA</span>
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
                <NotchExpandedHeader />
                <div className="p-3.5 max-h-[calc(80vh-68px)] overflow-y-auto overscroll-contain pr-2">
                  {renderActiveTab()}
                </div>
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
      </div>
    </div>
  );
};
