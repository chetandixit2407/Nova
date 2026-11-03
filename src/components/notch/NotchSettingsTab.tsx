import React from 'react';
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
  Activity
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { NotchConfig, NotchTheme } from '../../types';

export const NotchSettingsTab: React.FC = () => {
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

  const themes: { id: NotchTheme; label: string; color: string }[] = [
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
          <label className="text-xs font-semibold text-slate-200 block mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            Color Palette & Glass Base
          </label>
          <div className="grid grid-cols-3 gap-2">
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
                <span className="truncate text-[11px] font-medium">{t.label}</span>
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

      {/* Geometry Sliders */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>Notch Geometry & Layout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Compact Width</span>
              <span className="font-mono">{config.compactWidth}px</span>
            </div>
            <input
              type="range"
              min={160}
              max={320}
              value={config.compactWidth}
              onChange={(e) => updateConfig({ compactWidth: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Expanded Width</span>
              <span className="font-mono">{config.expandedWidth}px</span>
            </div>
            <input
              type="range"
              min={440}
              max={760}
              value={config.expandedWidth}
              onChange={(e) => updateConfig({ expandedWidth: parseInt(e.target.value), notchPreset: 'custom' })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Corner Radius</span>
              <span className="font-mono">{config.cornerRadius}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={32}
              value={config.cornerRadius}
              onChange={(e) => updateConfig({ cornerRadius: parseInt(e.target.value), notchPreset: 'custom' })}
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
    </div>
  );
};
