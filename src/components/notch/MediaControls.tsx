import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  Radio,
  Sparkles
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface MediaControlsProps {
  compact?: boolean;
}

export const MediaControls: React.FC<MediaControlsProps> = ({ compact = false }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState(audioEngine.getCurrentTime());
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Subscribe to audio engine updates
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });
    return unsub;
  }, []);

  // Visual pulse animation loop: calculates real-time audio amplitude from frequencies
  useEffect(() => {
    let animId: number;

    const checkAudioPulse = () => {
      if (isPlaying) {
        const freqs = audioEngine.getFrequencies();
        // Compute average amplitude across low-mid frequency bands (bass/rhythm pulse)
        let sum = 0;
        const bands = Math.min(12, freqs.length);
        for (let i = 0; i < bands; i++) {
          sum += freqs[i];
        }
        const avg = sum / bands;
        setAudioAmplitude(avg);
      } else {
        setAudioAmplitude((prev) => Math.max(0, prev - 4));
      }
      animId = requestAnimationFrame(checkAudioPulse);
    };

    animId = requestAnimationFrame(checkAudioPulse);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  // Pulse intensity derived from audio amplitude (0 to 1)
  const pulseScale = isPlaying ? 1 + (audioAmplitude / 255) * 0.14 : 1;
  const pulseGlow = isPlaying
    ? `0 0 ${Math.round(8 + (audioAmplitude / 255) * 24)}px rgba(56, 189, 248, ${0.4 + (audioAmplitude / 255) * 0.5})`
    : '0 4px 16px rgba(0, 0, 0, 0.4)';

  return (
    <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 backdrop-blur-xl select-none transition-colors hover:border-white/20">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Album Cover with Reactive Visual Audio Pulse Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          {/* Audio detection pulse halo */}
          {isPlaying && (
            <motion.div
              animate={{
                scale: [pulseScale * 0.98, pulseScale * 1.15, pulseScale * 0.98],
                opacity: [0.5, 0.85, 0.5]
              }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl bg-sky-400/20 blur-md pointer-events-none"
            />
          )}

          <motion.div
            style={{
              background: currentTrack.coverArt,
              boxShadow: pulseGlow
            }}
            animate={{ scale: pulseScale }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl relative flex items-center justify-center overflow-hidden transition-all duration-100"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
            <Disc3
              className={`w-8 h-8 sm:w-10 sm:h-10 text-white/90 transition-transform ${
                isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
              }`}
            />
            {isPlaying && (
              <span className="absolute bottom-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
              </span>
            )}
          </motion.div>
        </div>

        {/* Track Metadata, Scrubber & Controls */}
        <div className="flex-1 w-full min-w-0 space-y-2.5">
          {/* Header metadata + Audio pulse indicator */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h4>
                {isPlaying && (
                  <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 border border-sky-400/30 text-[9px] font-mono text-sky-300 font-semibold flex items-center gap-1 shrink-0">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                    <span>AUDIO DETECTED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack.artist} · <span className="text-slate-500">{currentTrack.album}</span>
              </p>
            </div>

            {/* Live equalizer indicator */}
            <div className="flex items-end gap-0.5 h-4 px-1 shrink-0">
              {[0.4, 0.9, 0.6, 0.75].map((factor, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-sky-400 to-cyan-300 rounded-full transition-all duration-75"
                  style={{
                    height: isPlaying
                      ? `${Math.max(3, (audioAmplitude / 255) * 16 * factor)}px`
                      : '3px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Time Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={currentTrack.duration}
              value={currentTime}
              onChange={(e) => audioEngine.seek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tabular-nums">
              <span>{formatSecs(currentTime)}</span>
              <span>{formatSecs(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Buttons & Volume */}
          <div className="flex items-center justify-between pt-0.5">
            {/* Playback Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => audioEngine.previousTrack()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => audioEngine.toggle()}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-slate-950" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => audioEngine.nextTrack()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 sm:w-20 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
