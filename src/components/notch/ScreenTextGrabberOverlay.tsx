import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointerClick, X, Copy, Check, Sparkles } from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { soundService } from '../../services/soundService';

export const ScreenTextGrabberOverlay: React.FC = () => {
  const { isScreenCopyMode, toggleScreenCopyMode, triggerFlyToNotch } = useNotch();
  const [hoverBox, setHoverBox] = useState<{ x: number; y: number; width: number; height: number; text: string } | null>(null);
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (!isScreenCopyMode) {
      setHoverBox(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Find element beneath cursor
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) {
        setHoverBox(null);
        return;
      }

      // Ignore our own overlay banner or notch elements
      if (el.closest('#grabber-control-banner') || el.closest('#nova-notch-container')) {
        setHoverBox(null);
        return;
      }

      // Extract meaningful text
      const selectedText = window.getSelection()?.toString()?.trim();
      let text = selectedText || '';

      if (!text) {
        // Inspect element text
        const targetText = (el as HTMLElement).innerText?.trim() || el.textContent?.trim() || '';
        // If element is container with massive text, pick closest heading/p/span/button if available
        if (targetText && targetText.length < 300) {
          text = targetText;
        } else if (targetText) {
          text = targetText.slice(0, 140) + '...';
        }
      }

      if (text) {
        const rect = el.getBoundingClientRect();
        setHoverBox({
          x: Math.max(4, rect.left),
          y: Math.max(4, rect.top),
          width: Math.min(window.innerWidth - 8, rect.width),
          height: rect.height,
          text
        });
      } else {
        setHoverBox(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      // If clicking inside the banner, do not grab
      if ((e.target as HTMLElement).closest('#grabber-control-banner') || (e.target as HTMLElement).closest('#nova-notch-container')) {
        return;
      }

      const selected = window.getSelection()?.toString()?.trim();
      let captured = selected;

      if (!captured) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
          captured = (el as HTMLElement).innerText?.trim() || el.textContent?.trim() || '';
        }
      }

      if (captured) {
        e.preventDefault();
        e.stopPropagation();

        // Trigger cinematic fly-to-notch animation from click point
        triggerFlyToNotch(captured, e.clientX, e.clientY);
        setLastCopiedText(captured.slice(0, 30));

        const timer = window.setTimeout(() => setLastCopiedText(null), 1500);
        return () => clearTimeout(timer);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleScreenCopyMode();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScreenCopyMode, toggleScreenCopyMode, triggerFlyToNotch]);

  if (!isScreenCopyMode) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Subtle vignette tint indicating interactive text grab mode */}
      <div className="absolute inset-0 bg-sky-950/10 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Hover Highlighter Box */}
      {hoverBox && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
          style={{
            left: `${hoverBox.x}px`,
            top: `${hoverBox.y}px`,
            width: `${hoverBox.width}px`,
            height: `${hoverBox.height}px`
          }}
          className="absolute border-2 border-dashed border-sky-400 bg-sky-500/15 rounded-lg shadow-[0_0_15px_rgba(56,189,248,0.4)] pointer-events-none z-40 flex items-start justify-end p-1"
        >
          <div className="bg-slate-900/90 border border-sky-400/50 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-sky-200 flex items-center gap-1 shadow-md -translate-y-6">
            <MousePointerClick className="w-2.5 h-2.5 text-sky-400" />
            <span>Click to Copy</span>
          </div>
        </motion.div>
      )}

      {/* Floating Control Banner */}
      <div
        id="grabber-control-banner"
        className="fixed bottom-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/95 border border-sky-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-xl text-white text-xs font-medium"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
            <MousePointerClick className="w-4 h-4 animate-bounce" />
          </div>

          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Screen Click-to-Copy Active</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-[11px] text-slate-400">
              {lastCopiedText ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Copied "{lastCopiedText}..."
                </span>
              ) : (
                'Click any text or element to fly it into Notch Clipboard'
              )}
            </div>
          </div>

          <button
            onClick={toggleScreenCopyMode}
            className="ml-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
          >
            <span>Exit (ESC)</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
