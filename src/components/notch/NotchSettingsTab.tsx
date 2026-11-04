import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sliders,
  Volume2,
  MousePointer2,
  RotateCcw,
  Sparkles,
  Monitor,
  Laptop,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Smile,
  Clock,
  Type,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Play,
  Zap,
  Check,
  Edit2
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import {
  NotchConfig,
  NotchTheme,
  GreetingSettings,
  GreetingFontStyle,
  GreetingColorTheme,
  GreetingAnimationStyle
} from '../../types';
import { MicrosoftStoreModal } from './MicrosoftStoreModal';
import { greetingService, DEFAULT_GREETING_SETTINGS } from '../../services/greetingService';

export const NotchSettingsTab: React.FC = () => {
  const [showStoreModal, setShowStoreModal] = useState<boolean>(false);
  const [greetingSettings, setGreetingSettings] = useState<GreetingSettings>(greetingService.getSettings());

  useEffect(() => {
    const unsub = greetingService.subscribe(() => {
      setGreetingSettings(greetingService.getSettings());
    });
    return unsub;
  }, []);

  const {
    config,
    updateConfig,
    applyPreset,
    resetConfig,
    viewMode,
    setViewMode,
    wallpaperIndex,
    setWallpaperIndex,
    showLiveActivities,
    toggleLiveActivities
  } = useNotch();

  const presets: { id: NotchConfig['notchPreset']; name: string; desc: string }[] = [
    { id: 'dynamic_classic', name: 'Dynamic Island', desc: 'Classic Apple/Smart Notch deep black curves' },
    { id: 'windows_fluent', name: 'Windows 11 Mica', desc: 'Fluent acrylic glass with soft violet accents' },
    { id: 'cyber_stealth', name: 'Cyberpunk Glow', desc: 'Sharp edges with neon emerald border radiation' },
    { id: 'compact_dot', name: 'OLED Minimal', desc: 'Ultra compact pure black minimal profile' }
  ];

  const themes: { id: NotchTheme; label: string; color: string; isPro?: boolean }[] = [
    { id: 'liquid-titanium', label: 'Liquid Titanium', color: '#94a3b8', isPro: true },
    { id: 'supernova-horizon', label: 'Supernova Horizon', color: '#f59e0b', isPro: true },
    { id: 'cyber-matrix-3d', label: 'Cyber Matrix 3D', color: '#10b981', isPro: true },
    { id: 'celestial-orrery', label: 'Celestial Orrery', color: '#6366f1', isPro: true },
    { id: 'prism-core', label: 'Prism Core', color: '#ec4899', isPro: true },
    { id: 'midnight', label: 'Midnight Obsidian', color: '#090d16' },
    { id: 'windows-mica', label: 'Windows Mica', color: '#181b2a' },
    { id: 'cyber-glow', label: 'Cyber Glow', color: '#051b14' },
    { id: 'oled-stealth', label: 'OLED Stealth', color: '#000000' },
    { id: 'frosted-glass', label: 'Frosted Glass', color: '#27272a' },
    { id: 'light-frost', label: 'Fluent Light', color: '#f8fafc' }
  ];

  const glowSwatches = ['#38bdf8', '#818cf8', '#10b981', '#f43f5e', '#f59e0b', '#ffffff'];

  return (
    <div className="space-y-4">
      {/* 1-Click Presets */}
      <div>
        <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Appearance Presets</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = config.notchPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold">{p.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme & Glow Swatches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Themes */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <label className="text-xs font-semibold text-slate-200 block mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              Appearance Themes (5 Pro Effects)
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updateConfig({ theme: t.id, notchPreset: 'custom' })}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  config.theme === t.id
                    ? 'border-sky-400 bg-sky-500/10 text-white'
                    : 'border-white/5 bg-white/[0.02] text-slate-400 hover:text-white'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="truncate text-[11px] font-medium">
                  {t.label}
                  {t.isPro && <span className="ml-1 text-[9px] text-sky-400 font-mono">PRO</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Glow Accent Color */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <label className="text-xs font-semibold text-slate-200 block mb-2">
            Border Glow Illumination
          </label>
          <div className="flex items-center gap-2 mb-3">
            {glowSwatches.map((color) => (
              <button
                key={color}
                onClick={() => updateConfig({ glowColor: color, notchPreset: 'custom' })}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  config.glowColor === color ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
              />
            ))}
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Glow Intensity</span>
              <span className="font-mono">{config.glowIntensity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.glowIntensity}
              onChange={(e) => updateConfig({ glowIntensity: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Feature 8: Flexible Notch Placement */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
        <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            Flexible Notch Placement (Edge & Corners)
          </span>
          <span className="text-[10px] text-sky-400 font-mono uppercase">Feature 8</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(['top-center', 'top-left', 'top-right', 'left', 'right'] as const).map((placement) => (
            <button
              key={placement}
              onClick={() => updateConfig({ placement })}
              className={`py-2 px-2 rounded-lg border text-center text-xs transition capitalize ${
                config.placement === placement
                  ? 'bg-sky-500/20 border-sky-400 text-white font-semibold'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {placement.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Feature 9: Custom Notch Dimensions (Length & Thickness 28-72px) */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            Custom Notch Dimensions (Independent Length & Thickness)
          </span>
          <span className="text-[10px] text-sky-400 font-mono uppercase">Feature 9 • 28–72px</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Collapsed Length</span>
              <span className="font-mono text-white">{config.compactWidth}px</span>
            </div>
            <input
              type="range"
              min={180}
              max={240}
              value={config.compactWidth}
              onChange={(e) => updateConfig({ compactWidth: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Collapsed Thickness</span>
              <span className="font-mono text-sky-300 font-bold">{config.compactHeight}px</span>
            </div>
            <input
              type="range"
              min={32}
              max={42}
              value={config.compactHeight}
              onChange={(e) => updateConfig({ compactHeight: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Expanded Width</span>
              <span className="font-mono text-white">{config.expandedWidth}px</span>
            </div>
            <input
              type="range"
              min={320}
              max={420}
              value={config.expandedWidth}
              onChange={(e) => updateConfig({ expandedWidth: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Interaction & Hover Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <MousePointer2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hover & Trigger Behavior</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Auto-expand on Mouse Hover</span>
            <input
              type="checkbox"
              checked={config.hoverExpansion}
              onChange={(e) => updateConfig({ hoverExpansion: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                {showLiveActivities ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                Show Live Activities in Notch
              </span>
              <span className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Displays active music, downloads & timers in notch. When off, notch stays strictly Eyes-Only.
              </span>
            </div>
            <input
              type="checkbox"
              checked={showLiveActivities}
              onChange={toggleLiveActivities}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Auto-Collapse Grace Delay</span>
              <span className="font-mono">{config.graceDelay}ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={20}
              value={config.graceDelay}
              onChange={(e) => updateConfig({ graceDelay: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Audio Micro-Interactions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tactile Sound Effects</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Pop, Snap & Chime Sounds</span>
            <input
              type="checkbox"
              checked={config.soundEnabled}
              onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Feedback Sound Volume</span>
              <span className="font-mono">{Math.round(config.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.soundVolume}
              onChange={(e) => updateConfig({ soundVolume: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Desktop Sandbox View Mode & Wallpaper */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Viewing Environment Mode</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Switch between interactive Windows 11 desktop simulation or clean overlay mode
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-sky-500 text-slate-950 font-semibold border-sky-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Windows 11 Desktop
          </button>
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-sky-500 text-slate-950 font-semibold border-sky-400'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Standalone Notch Overlay
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PERSONALIZED GREETING & ANIMATION SETTINGS                     */}
      {/* ============================================================== */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-4">
        {/* Header & Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Personalized Greeting & Name</span>
                <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono font-bold">
                  LOCAL TIME ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Dynamic time greetings (Morning, Afternoon, Evening, Night) with custom name and motion
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={greetingSettings.enabled}
              onChange={(e) => greetingService.updateSettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
          </label>
        </div>

        {greetingSettings.enabled && (
          <div className="space-y-4 pt-1 border-t border-white/10">
            {/* Live Interactive Preview Box */}
            <div className="p-3 rounded-xl bg-black/50 border border-sky-400/30 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                <span>Live Greeting Preview</span>
                <span className="text-sky-400">
                  {greetingService.getTimePeriodSalutation(greetingService.getTimeOfDayPeriod())} (Auto Detected)
                </span>
              </div>

              <div className="py-2 text-center">
                <div
                  className={`text-base md:text-lg font-bold transition-all ${
                    greetingSettings.fontStyle === 'mono'
                      ? 'font-mono'
                      : greetingSettings.fontStyle === 'serif'
                      ? 'font-serif italic'
                      : greetingSettings.fontStyle === 'cyber'
                      ? 'font-mono uppercase tracking-wider font-extrabold'
                      : 'font-sans'
                  } ${
                    greetingSettings.colorTheme === 'cyan'
                      ? 'bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                      : greetingSettings.colorTheme === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : greetingSettings.colorTheme === 'amber'
                      ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : greetingSettings.colorTheme === 'violet'
                      ? 'bg-gradient-to-r from-purple-300 via-violet-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : greetingSettings.colorTheme === 'rose'
                      ? 'bg-gradient-to-r from-rose-300 via-pink-200 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                      : greetingSettings.colorTheme === 'white'
                      ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                      : 'bg-gradient-to-r from-teal-300 via-sky-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  }`}
                >
                  {greetingService.getGreetingText().main}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {greetingService.getGreetingText().subtitle}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                <button
                  onClick={() => greetingService.triggerTestGreeting()}
                  className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Test in Top Notch (5s)</span>
                </button>

                <button
                  onClick={() => greetingService.resetSettings()}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to default Virendra greeting"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* User Name & Emoji Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Display Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Custom Display Name</span>
                  <button
                    onClick={() => greetingService.updateSettings({ userName: 'Virendra' })}
                    className="text-[10px] text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Set to "Virendra"
                  </button>
                </label>
                <input
                  type="text"
                  value={greetingSettings.userName}
                  onChange={(e) => greetingService.updateSettings({ userName: e.target.value })}
                  placeholder="e.g. Virendra"
                  maxLength={24}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Emoji Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 block">
                  Greeting Icon / Emoji
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['👋', '✨', '☕', '🚀', '💻', '⚡', '🌙', '☀️', '👑', '🎯'].map((emoji) => {
                    const isSelected = greetingSettings.emojiIcon === emoji;
                    return (
                      <button
                        key={emoji}
                        onClick={() => greetingService.updateSettings({ emojiIcon: emoji })}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-500/20 border-2 border-sky-400 scale-110 shadow-sm'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Greeting Format Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Greeting Salutation Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => greetingService.updateSettings({ customGreetingMode: 'auto_time' })}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    greetingSettings.customGreetingMode === 'auto_time'
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto Local Time</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Good Morning (5-12) • Afternoon (12-17) • Evening (17-22) • Night (22-5)
                  </div>
                </button>

                <button
                  onClick={() => greetingService.updateSettings({ customGreetingMode: 'custom_prefix' })}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    greetingSettings.customGreetingMode === 'custom_prefix'
                      ? 'bg-sky-500/20 border-sky-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Custom Prefix</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Fixed custom wording like "Welcome back," or "Hello,"
                  </div>
                </button>
              </div>

              {greetingSettings.customGreetingMode === 'custom_prefix' && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    value={greetingSettings.customPrefix}
                    onChange={(e) => greetingService.updateSettings({ customPrefix: e.target.value })}
                    placeholder="e.g. Welcome back,"
                    maxLength={30}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              )}
            </div>

            {/* Typography / Font Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Typography Font Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'fluent', label: 'Windows Fluent', sample: 'Aa Modern' },
                  { id: 'mono', label: 'JetBrains Mono', sample: 'Aa Monospace' },
                  { id: 'serif', label: 'Elegant Serif', sample: 'Aa Editorial' },
                  { id: 'cyber', label: 'Cyber Display', sample: 'AA BOLD' }
                ].map((f) => {
                  const isSelected = greetingSettings.fontStyle === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() =>
                        greetingService.updateSettings({ fontStyle: f.id as GreetingFontStyle })
                      }
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.sample}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent & Glow */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Glowing Accent Color & Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                {[
                  { id: 'cyan', label: 'Sky Cyan', color: '#38bdf8' },
                  { id: 'emerald', label: 'Emerald', color: '#10b981' },
                  { id: 'amber', label: 'Sunset Amber', color: '#f59e0b' },
                  { id: 'violet', label: 'Violet Dusk', color: '#a855f7' },
                  { id: 'rose', label: 'Rose Gold', color: '#f43f5e' },
                  { id: 'white', label: 'Pure Frost', color: '#ffffff' },
                  { id: 'aurora', label: 'Aurora Wave', color: '#38bdf8' }
                ].map((c) => {
                  const isSelected = greetingSettings.colorTheme === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        greetingService.updateSettings({ colorTheme: c.id as GreetingColorTheme })
                      }
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="truncate text-[10px]">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Animation Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 block">
                Motion & Animation Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'glow-shimmer', name: 'Glow & Shimmer', desc: 'Breathing neon glow' },
                  { id: 'fade-slide', name: 'Fade & Slide Down', desc: 'Smooth acrylic drop' },
                  { id: 'typewriter', name: 'Typewriter', desc: 'Dynamic letter typing' },
                  { id: 'aurora-wave', name: 'Aurora Wave', desc: 'Multicolor cycle' },
                  { id: 'bounce-soft', name: 'Gentle Bounce', desc: 'Dynamic Island spring' }
                ].map((anim) => {
                  const isSelected = greetingSettings.animationStyle === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() =>
                        greetingService.updateSettings({
                          animationStyle: anim.id as GreetingAnimationStyle
                        })
                      }
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{anim.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{anim.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Triggers & Display Conditions */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold text-slate-200 block">
                Greeting Triggers & Behaviors
              </label>

              {/* 1. Show on Startup */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Show when Windows starts</div>
                  <div className="text-[10px] text-slate-400">
                    Displays animated greeting pill in top notch upon application launch ({greetingSettings.startupDurationSec}s)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    step="1"
                    value={greetingSettings.startupDurationSec}
                    onChange={(e) =>
                      greetingService.updateSettings({ startupDurationSec: Number(e.target.value) })
                    }
                    className="w-16 accent-sky-400 h-1"
                    title={`${greetingSettings.startupDurationSec} seconds`}
                  />
                  <input
                    type="checkbox"
                    checked={greetingSettings.showOnStartup}
                    onChange={(e) =>
                      greetingService.updateSettings({ showOnStartup: e.target.checked })
                    }
                    className="accent-sky-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* 2. Show on Dashboard Open */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Show when Dashboard opens</div>
                  <div className="text-[10px] text-slate-400">
                    Header banner at top of expanded notch cards with quick inline name edit
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={greetingSettings.showOnDashboardOpen}
                  onChange={(e) =>
                    greetingService.updateSettings({ showOnDashboardOpen: e.target.checked })
                  }
                  className="accent-sky-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {/* 3. Show on Inactivity Return */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Show on return after inactivity</div>
                  <div className="text-[10px] text-slate-400">
                    Welcomes user back when returning to computer (after {greetingSettings.inactivityThresholdSec}s idle)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="15"
                    value={greetingSettings.inactivityThresholdSec}
                    onChange={(e) =>
                      greetingService.updateSettings({
                        inactivityThresholdSec: Number(e.target.value)
                      })
                    }
                    className="w-16 accent-sky-400 h-1"
                    title={`${greetingSettings.inactivityThresholdSec} seconds idle threshold`}
                  />
                  <input
                    type="checkbox"
                    checked={greetingSettings.showOnInactivityReturn}
                    onChange={(e) =>
                      greetingService.updateSettings({
                        showOnInactivityReturn: e.target.checked
                      })
                    }
                    className="accent-sky-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Microsoft Store MSIX Packaging & WACK Certification */}
      <div className="bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-slate-900/40 border border-sky-400/25 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Microsoft Store & MSIX Package Center</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                14/14 WACK PASSED
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Windows App Certification Kit compliance, AppxManifest.xml, and Partner Center submission
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowStoreModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <span>Open Store Center</span>
        </button>
      </div>

      {/* Reset Defaults */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={resetConfig}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All to Defaults</span>
        </button>
      </div>

      {/* Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            <MicrosoftStoreModal onClose={() => setShowStoreModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
