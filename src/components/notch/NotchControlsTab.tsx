import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  MousePointerClick,
  Sparkles,
  Wifi,
  WifiOff,
  BatteryCharging,
  Battery,
  CloudSun,
  Clipboard,
  FileText,
  RotateCw,
  Copy,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';
import { BatteryHealth } from './BatteryHealth';

export const NotchControlsTab: React.FC = () => {
  const {
    systemStatus,
    weather,
    refreshWeather,
    clipboardHistory,
    copyText,
    readSystemClipboard,
    clearClipboard,
    quickNotes,
    setQuickNotes,
    isScreenCopyMode,
    toggleScreenCopyMode,
    triggerFlyToNotch
  } = useNotch();

  const [volume, setVolume] = useState<number>(50);
  const [brightness, setBrightness] = useState<number>(90);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val / 100);
  };

  const handleBrightness = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setBrightness(val);
    const root = document.getElementById('desktop-viewport-container');
    if (root) {
      root.style.filter = `brightness(${val}%)`;
    }
  };

  const handleCopyClipboardItem = async (id: string, text: string, e?: React.MouseEvent) => {
    await copyText(text);
    const startX = e ? e.clientX : window.innerWidth / 2;
    const startY = e ? e.clientY : window.innerHeight * 0.4;
    triggerFlyToNotch(text, startX, startY);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calendar math
  const now = new Date();
  const displayDate = new Date(now.getFullYear(), now.getMonth() + calendarMonthOffset, 1);
  const monthName = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0).getDate();
  const startDay = displayDate.getDay();

  return (
    <div className="space-y-4">
      {/* Windows Battery & Power Health Component */}
      <BatteryHealth />

      {/* Quick Sliders & Capture Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Sliders Box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
          {/* Master Volume */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                Master Audio Level
              </span>
              <span className="font-mono text-slate-400">{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolume}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Screen Dimmer / Brightness */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Display Luminance
              </span>
              <span className="font-mono text-slate-400">{brightness}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={brightness}
              onChange={handleBrightness}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Real Screen Grabber & Network Telemetry */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleScreenCopyMode}
              className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isScreenCopyMode
                  ? 'bg-amber-500/30 border-amber-500/80 text-amber-200 animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              <MousePointerClick className="w-4 h-4 text-amber-400" />
              <span>{isScreenCopyMode ? 'Click Text on Screen...' : 'Screen Copy Tool'}</span>
            </button>

            <button
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                triggerFlyToNotch('Sample Screen Copied Text', rect.left + rect.width / 2, rect.top);
              }}
              className="py-2 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Fly-to-Notch Test</span>
            </button>
          </div>

          {/* System Network & RAM Telemetry */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                {systemStatus.isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
                Wi-Fi
              </span>
              <span className="text-slate-200 font-semibold">{systemStatus.effectiveType.toUpperCase()} · {systemStatus.downlinkSpeed}Mb</span>
            </div>

            <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                Sys Memory
              </span>
              <span className="text-slate-200 font-semibold">7.4 / 16 GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Weather & Interactive Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Weather Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>{weather?.location || 'Local Weather'}</span>
            </div>
            <button
              onClick={refreshWeather}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Weather"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-white tracking-tight">
                {weather?.temp ?? 72}°F
              </div>
              <div className="text-xs text-sky-300 font-medium">{weather?.condition ?? 'Sunny / Clear'}</div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
              <div>High: {weather?.high ?? 76}° · Low: {weather?.low ?? 58}°</div>
              <div>Humidity: {weather?.humidity ?? 48}%</div>
              <div>Wind: {weather?.windSpeed ?? 8} mph</div>
            </div>
          </div>
        </div>

        {/* Interactive Calendar Widget */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              {monthName}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCalendarMonthOffset((m) => m - 1)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCalendarMonthOffset(0)}
                className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-white/10 rounded cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonthOffset((m) => m + 1)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-slate-500 font-semibold">{d}</span>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = calendarMonthOffset === 0 && dayNum === now.getDate();
              return (
                <span
                  key={dayNum}
                  className={`py-0.5 rounded transition-colors ${
                    isToday
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {dayNum}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Real Clipboard History & Quick Scratchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Clipboard Manager */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-sky-400" />
              Clipboard History
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={readSystemClipboard}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-medium px-2 py-0.5 rounded bg-sky-500/10 cursor-pointer"
              >
                Sync Current
              </button>
              {clipboardHistory.length > 0 && (
                <button
                  onClick={clearClipboard}
                  className="text-[10px] text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {clipboardHistory.length === 0 ? (
              <div className="text-[11px] text-slate-500 py-4 text-center">Clipboard history empty</div>
            ) : (
              clipboardHistory.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleCopyClipboardItem(item.id, item.text, e)}
                    className="w-full p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <span className="text-xs text-slate-300 font-mono truncate max-w-[240px]">
                      {item.text}
                    </span>
                    <span className="text-slate-500 group-hover:text-white shrink-0 ml-2">
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Scratchpad */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Quick Scratchpad
            </span>
            <span className="text-[10px] font-mono text-slate-500">Autosaved</span>
          </div>

          <textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            placeholder="Type quick thoughts, phone numbers, or code snippets..."
            rows={4}
            className="w-full flex-1 p-2 bg-black/20 border border-white/10 rounded-lg text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400/50 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
