import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Coffee, Music, Moon, Smile } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface NovaPetProps {
  compact?: boolean;
}

export const NovaPetWidget: React.FC<NovaPetProps> = ({ compact = false }) => {
  const [mood, setMood] = useState<'happy' | 'dancing' | 'focus' | 'sleepy' | 'loved'>('happy');
  const [blink, setBlink] = useState<boolean>(false);
  const [petCount, setPetCount] = useState<number>(0);
  const [speechBubble, setSpeechBubble] = useState<string>('Hello! I am NOVA!');
  const [showHeart, setShowHeart] = useState<boolean>(false);

  // Monitor music playback
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      const isPlaying = audioEngine.getIsPlaying();
      if (isPlaying) {
        setMood('dancing');
        setSpeechBubble('Vibing to the beat! 🎵');
      } else {
        setMood('happy');
        setSpeechBubble('Ready for your next task!');
      }
    });
    return unsub;
  }, []);

  // Natural eye blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const handlePet = () => {
    setPetCount((prev) => prev + 1);
    setMood('loved');
    setShowHeart(true);
    const phrases = [
      'You are doing great!',
      'Best human ever! ❤️',
      'Purr... system optimized!',
      'Keep up the great work!',
      '*Happy robotic chirps*'
    ];
    setSpeechBubble(phrases[Math.floor(Math.random() * phrases.length)]);

    setTimeout(() => {
      setShowHeart(false);
      setMood(audioEngine.getIsPlaying() ? 'dancing' : 'happy');
    }, 2500);
  };

  return (
    <div className={`relative flex items-center ${compact ? 'gap-2' : 'gap-3 p-2 bg-white/5 rounded-xl border border-white/10'}`}>
      {/* Robot Avatar Body */}
      <motion.div
        onClick={handlePet}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={
          mood === 'dancing'
            ? { y: [0, -3, 0], rotate: [0, -4, 4, 0] }
            : mood === 'loved'
            ? { scale: [1, 1.1, 1] }
            : { y: [0, -1, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'dancing' ? 0.6 : 2.5,
          ease: 'easeInOut'
        }}
        className="relative cursor-pointer select-none shrink-0"
        title="Click to pet NOVA!"
      >
        {/* Heart Burst Particle */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -20, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-rose-400 pointer-events-none z-20"
            >
              <Heart className="w-4 h-4 fill-rose-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer Head Capsule */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.25)] flex items-center justify-center relative overflow-hidden">
          {/* Antenna */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />

          {/* Visor Screen */}
          <div className="w-7 h-5 rounded-lg bg-black/80 border border-cyan-500/40 flex items-center justify-around px-1">
            {/* Left Eye */}
            <motion.div
              animate={
                blink
                  ? { scaleY: 0.1 }
                  : mood === 'loved'
                  ? { scale: 1.1 }
                  : mood === 'dancing'
                  ? { scaleY: [1, 1.3, 0.8, 1] }
                  : { scaleY: 1 }
              }
              className={`w-1.5 h-2 rounded-full ${
                mood === 'loved'
                  ? 'bg-rose-400 shadow-[0_0_6px_#fb7185]'
                  : mood === 'dancing'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
              }`}
            />

            {/* Right Eye */}
            <motion.div
              animate={
                blink
                  ? { scaleY: 0.1 }
                  : mood === 'loved'
                  ? { scale: 1.1 }
                  : mood === 'dancing'
                  ? { scaleY: [1, 1.3, 0.8, 1] }
                  : { scaleY: 1 }
              }
              className={`w-1.5 h-2 rounded-full ${
                mood === 'loved'
                  ? 'bg-rose-400 shadow-[0_0_6px_#fb7185]'
                  : mood === 'dancing'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'
              }`}
            />
          </div>

          {/* Cheeks blush when loved */}
          {mood === 'loved' && (
            <>
              <div className="absolute bottom-1.5 left-1.5 w-1 h-0.5 bg-rose-400/80 rounded-full blur-[0.5px]" />
              <div className="absolute bottom-1.5 right-1.5 w-1 h-0.5 bg-rose-400/80 rounded-full blur-[0.5px]" />
            </>
          )}
        </div>
      </motion.div>

      {/* Info / Interaction Dialogue */}
      {!compact && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-200">NOVA Bot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                Lvl {Math.min(10, Math.floor(petCount / 3) + 1)}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-500/40" /> {petCount} pets
            </span>
          </div>

          <p className="text-[10px] text-slate-300 truncate mt-0.5">
            "{speechBubble}"
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            <button
              onClick={() => {
                setMood('focus');
                setSpeechBubble('Focus mode engaged! Let us crush this.');
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-all"
            >
              <Coffee className="w-2.5 h-2.5 text-amber-400" /> Focus
            </button>
            <button
              onClick={() => {
                setMood('dancing');
                setSpeechBubble('Music powers activated!');
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-all"
            >
              <Music className="w-2.5 h-2.5 text-cyan-400" /> Groove
            </button>
            <button
              onClick={handlePet}
              className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 flex items-center gap-1 transition-all"
            >
              <Smile className="w-2.5 h-2.5 text-rose-400" /> Pet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
