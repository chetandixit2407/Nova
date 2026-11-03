import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Headphones,
  Speaker,
  Music,
  Check,
  ChevronDown,
  Sparkles,
  Sliders
} from 'lucide-react';
import { audioEngine, PLAYLIST } from '../../services/audioEngine';
import { lyricsService } from '../../services/lyricsService';
import { audioDeviceService } from '../../services/audioDeviceService';
import { soundService } from '../../services/soundService';
import { AudioOutputDevice, SyncedLyricLine } from '../../types';

interface FullscreenMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullscreenMusicModal: React.FC<FullscreenMusicModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState(audioEngine.getCurrentTrack());
  const [currentTime, setCurrentTime] = useState<number>(audioEngine.getCurrentTime());
  const [volume, setVolume] = useState<number>(75);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'lyrics'>('lyrics');
  const [devices, setDevices] = useState<AudioOutputDevice[]>(audioDeviceService.getDevices());
  const [activeDevice, setActiveDevice] = useState<AudioOutputDevice>(audioDeviceService.getActiveDevice());
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to Audio Engine
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
      setCurrentTrack(audioEngine.getCurrentTrack());
      setCurrentTime(audioEngine.getCurrentTime());
    });
    return unsub;
  }, []);

  // Subscribe to Audio Output devices
  useEffect(() => {
    const unsub = audioDeviceService.subscribe(() => {
      setDevices(audioDeviceService.getDevices());
      setActiveDevice(audioDeviceService.getActiveDevice());
    });
    return unsub;
  }, []);

  // Visualizer Animation Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'visualizer') return;

    let animFrame: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 48;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const heightMultiplier = isPlaying ? Math.sin((Date.now() / 200) + i * 0.4) * 0.4 + 0.6 : 0.05;
        const barHeight = Math.max(4, Math.random() * 80 * heightMultiplier + (isPlaying ? 20 : 0));

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(0.7, 'rgba(129, 140, 248, 0.85)');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * barWidth + 2, canvas.height - barHeight, barWidth - 4, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, activeTab, isPlaying]);

  const lyrics: SyncedLyricLine[] = lyricsService.getLyricsForTrack(currentTrack.id);
  const activeLyricIndex = lyricsService.getCurrentLineIndex(lyrics, currentTime);

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsContainerRef.current) {
      const activeElem = lyricsContainerRef.current.querySelector(`[data-lyric-idx="${activeLyricIndex}"]`);
      if (activeElem) {
        activeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    audioEngine.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleSelectLyricLine = (time: number) => {
    audioEngine.seek(time);
    soundService.play('button_click');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 bg-[#060810] text-white flex flex-col overflow-hidden select-none"
      >
        {/* Dynamic Album Ambient Aura Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[140px] opacity-35 transition-colors duration-1000"
            style={{
              background: isPlaying ? 'radial-gradient(circle, #38bdf8 0%, #6366f1 70%)' : '#1e1b4b'
            }}
          />
          <div
            className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-25 transition-colors duration-1000"
            style={{
              background: isPlaying ? 'radial-gradient(circle, #ec4899 0%, #8b5cf6 80%)' : '#0f172a'
            }}
          />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[60px]" />
        </div>

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-sky-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Now Playing • NOVA Pro</span>
              <h2 className="text-sm font-semibold text-white/90">Immersive Audio Studio</h2>
            </div>
          </div>

          {/* Tab Switcher: Lyrics vs Visualizer */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'lyrics' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Synced Lyrics
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'visualizer' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visualizer
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center text-slate-300 hover:text-white border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content: Two Columns on Large Screens */}
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 px-8 py-4 overflow-hidden">
          {/* Left Column: Big Album Art & Details */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.015, 1] : 0.98,
                rotate: isPlaying ? [0, 0.2, 0] : 0
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 group"
            >
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {isPlaying && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] text-sky-300">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <span>HQ 320k</span>
                </div>
              )}
            </motion.div>

            <div className="mt-6 text-center max-w-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
                {currentTrack.title}
              </h1>
              <p className="text-sm md:text-base text-slate-300 mt-1 font-medium">{currentTrack.artist}</p>
              <p className="text-xs text-slate-400 mt-0.5">{currentTrack.album} • {currentTrack.genre}</p>
            </div>
          </div>

          {/* Right Column: Synced Lyrics or Visualizer */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            {activeTab === 'lyrics' ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    Synced Timed Lyrics • Click any line to seek
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {lyrics.length} lines timed
                  </span>
                </div>

                <div
                  ref={lyricsContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 py-8 px-4 scroll-smooth"
                >
                  {lyrics.map((line, idx) => {
                    const isCurrent = idx === activeLyricIndex;
                    const isPassed = idx < activeLyricIndex;

                    return (
                      <motion.div
                        key={idx}
                        data-lyric-idx={idx}
                        onClick={() => handleSelectLyricLine(line.time)}
                        whileHover={{ scale: 1.01, x: 4 }}
                        className={`cursor-pointer transition-all duration-300 py-2 px-4 rounded-xl ${
                          isCurrent
                            ? 'text-white text-xl md:text-2xl font-bold bg-white/10 shadow-lg border-l-4 border-sky-400 pl-4'
                            : isPassed
                            ? 'text-slate-400 text-sm md:text-base font-medium opacity-70 hover:opacity-100 hover:text-slate-200'
                            : 'text-slate-400 text-sm md:text-base font-medium opacity-50 hover:opacity-100 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{line.text}</span>
                          <span className="text-[11px] font-mono opacity-50 ml-4 shrink-0">
                            {formatTime(line.time)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center p-6">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={240}
                  className="w-full max-w-xl h-60 rounded-2xl bg-black/30 border border-white/10 shadow-inner"
                />
                <p className="text-xs text-slate-400 mt-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Real-time 48-band procedural frequency synthesizer visualizer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Playback & Device Controls Bar */}
        <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-2xl px-8 py-5 flex flex-col gap-3">
          {/* Timeline Bar */}
          <div className="w-full flex items-center gap-4 max-w-4xl mx-auto">
            <span className="text-xs font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={currentTrack.duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300"
            />
            <span className="text-xs font-mono text-slate-400 w-10">
              {formatTime(currentTrack.duration)}
            </span>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            {/* Audio Output Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 border border-white/10 transition"
              >
                {activeDevice.kind === 'headphones' || activeDevice.kind === 'bluetooth' ? (
                  <Headphones className="w-4 h-4 text-sky-400" />
                ) : (
                  <Speaker className="w-4 h-4 text-emerald-400" />
                )}
                <span className="max-w-[140px] truncate">{activeDevice.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Output Devices Popup Menu */}
              {isDeviceMenuOpen && (
                <div className="absolute bottom-12 left-0 w-72 rounded-2xl bg-[#0f1422] border border-white/15 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10">
                    Audio Output Device
                  </div>
                  <div className="py-1 space-y-1">
                    {devices.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => {
                          audioDeviceService.selectDevice(device.id);
                          setIsDeviceMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                          device.isActive
                            ? 'bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {device.kind === 'headphones' || device.kind === 'bluetooth' ? (
                            <Headphones className="w-4 h-4 shrink-0 text-sky-400" />
                          ) : (
                            <Speaker className="w-4 h-4 shrink-0 text-slate-400" />
                          )}
                          <span className="truncate">{device.label}</span>
                        </div>
                        {device.isActive && <Check className="w-4 h-4 shrink-0 text-sky-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transport Playback Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => audioEngine.prevTrack()}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center text-slate-200"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => audioEngine.togglePlay()}
                className="w-14 h-14 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow-xl shadow-white/10 flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              <button
                onClick={() => audioEngine.nextTrack()}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center text-slate-200"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setVolume(v);
                  audioEngine.setVolume(v / 100);
                }}
                className="w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
              <span className="text-xs font-mono text-slate-400 w-8">{volume}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
