import React, { useState, useEffect } from 'react';
import {
  Search,
  Wifi,
  Volume2,
  Battery,
  BatteryCharging,
  Bell,
  Folder,
  HardDrive,
  Download,
  FileText,
  Image,
  Monitor,
  Sparkles,
  Power,
  Settings,
  Terminal,
  Code,
  Globe,
  CloudSun
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';

export const WindowsDesktop: React.FC = () => {
  const {
    systemStatus,
    notifications,
    wallpaperIndex,
    setWallpaperIndex,
    toggleExpand,
    isExpanded,
    setActiveTab,
    expandNotch,
    tasks,
    weather
  } = useNotch();

  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState<boolean>(false);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Audio subscribe
  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setIsPlaying(audioEngine.getIsPlaying());
    });
    return unsub;
  }, []);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const wallpapers = [
    { name: 'Fluent Bloom', src: '/src/assets/images/windows_fluent_bloom_1793691054545.jpg' },
    { name: 'Aurora Dusk', src: '/src/assets/images/aurora_minimal_dusk_1793691072691.jpg' },
    { name: 'Mica Obsidian', src: '' }
  ];

  const currentWallpaper = wallpapers[wallpaperIndex % wallpapers.length];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeDownload = tasks.find((t) => t.type === 'download' && t.status === 'running');
  const activeInstall = tasks.find((t) => t.type === 'install' && t.status === 'running');

  return (
    <div
      id="desktop-viewport-container"
      className="relative w-screen h-screen overflow-hidden flex flex-col justify-between bg-black text-slate-100 select-none transition-[filter] duration-300"
    >
      {/* Wallpaper Layer */}
      <div className="absolute inset-0 z-0">
        {currentWallpaper.src ? (
          <img
            src={currentWallpaper.src}
            alt="Windows Desktop Wallpaper"
            className="w-full h-full object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-950 via-[#0d1222] to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/15 backdrop-contrast-[1.02]" />
      </div>

      {/* Main Desktop Canvas Area */}
      <div className="relative z-10 flex-1 w-full p-6 pt-16 flex justify-between items-start overflow-hidden pointer-events-auto">
        {/* Left Side: Desktop Icons */}
        <div className="grid grid-cols-1 gap-5 w-24 shrink-0">
          {/* This PC */}
          <button
            onDoubleClick={() => setIsFileExplorerOpen(true)}
            onClick={() => setActiveWindow('this_pc')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              This PC
            </span>
          </button>

          {/* NOVA Control Center */}
          <button
            onClick={() => {
              expandNotch();
              setActiveTab('settings');
            }}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-600 to-cyan-400 p-[1px] shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              NOVA
            </span>
          </button>

          {/* Wallpaper Switcher */}
          <button
            onClick={() => setWallpaperIndex((wallpaperIndex + 1) % wallpapers.length)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Click to cycle Windows 11 wallpaper"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Image className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Wallpaper
            </span>
          </button>
        </div>
      </div>

      {/* Simulated Window: This PC / File Explorer */}
      {isFileExplorerOpen && (
        <div className="absolute z-20 top-24 md:top-28 left-1/2 -translate-x-1/2 w-[680px] max-w-[90vw] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span>This PC</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFileExplorerOpen(false)}
                className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer"
                title="Close"
              />
            </div>
          </div>

          {/* Drives & Folders */}
          <div className="p-5 space-y-5">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Drives and Devices
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Local Disk C: */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 hover:border-sky-400/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">Local Disk (C:)</div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 mb-1 overflow-hidden">
                      <div className="w-[58%] h-full bg-sky-400 rounded-full" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">420 GB free of 953 GB</div>
                  </div>
                </div>

                {/* Storage D: */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 hover:border-indigo-400/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">Storage (D:)</div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 mb-1 overflow-hidden">
                      <div className="w-[28%] h-full bg-indigo-400 rounded-full" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">1.4 TB free of 2.0 TB</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Access Folders
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Downloads', icon: Download, count: '38 items' },
                  { name: 'Documents', icon: FileText, count: '142 items' },
                  { name: 'Pictures', icon: Image, count: '89 items' },
                  { name: 'Projects', icon: Code, count: '24 repos' }
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.name}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-sky-400/40 transition-colors flex flex-col items-center text-center cursor-pointer"
                    >
                      <Icon className="w-6 h-6 text-sky-400 mb-1.5" />
                      <div className="text-xs font-semibold text-white">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Windows 11 Start Menu Modal */}
      {isStartOpen && (
        <div className="absolute z-40 bottom-14 left-1/2 -translate-x-1/2 w-[540px] max-w-[92vw] bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
          {/* Start Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for apps, settings, and documents..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Pinned Apps */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-3 px-1">
              <span>Pinned Applications</span>
              <span className="text-[10px] text-sky-400 cursor-pointer hover:underline">All apps &gt;</span>
            </div>
            <div className="grid grid-cols-6 gap-3 text-center">
              {[
                { name: 'Edge', icon: Globe, color: 'text-sky-400' },
                { name: 'Terminal', icon: Terminal, color: 'text-emerald-400' },
                { name: 'VS Code', icon: Code, color: 'text-blue-400' },
                { name: 'Explorer', icon: Folder, color: 'text-amber-400' },
                { name: 'NOVA', icon: Sparkles, color: 'text-cyan-400' },
                { name: 'Settings', icon: Settings, color: 'text-slate-300' }
              ].map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.name}
                    onClick={() => {
                      if (app.name === 'NOVA') {
                        expandNotch();
                      } else if (app.name === 'Explorer') {
                        setIsFileExplorerOpen(true);
                      }
                      setIsStartOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${app.color}`} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-200">{app.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Account & Power */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                W
              </div>
              <div className="text-xs font-semibold text-white">Windows User</div>
            </div>

            <button
              onClick={() => setIsStartOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Power options"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Windows 11 Taskbar */}
      <div className="relative z-30 h-12 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 px-3 flex items-center justify-between select-none">
        {/* Left Side: Weather button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              expandNotch();
              setActiveTab('controls');
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            title="Weather & Quick Controls"
          >
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 font-bold font-mono">{weather?.temp ?? 72}°F</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">{weather?.condition ?? 'Sunny · Redmond'}</span>
          </button>
        </div>

        {/* Center: Windows 11 App Icons */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {/* Start Button */}
          <button
            onClick={() => setIsStartOpen(!isStartOpen)}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              isStartOpen ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
            title="Start"
          >
            {/* Windows 11 4-square logo */}
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <span className="bg-sky-400 rounded-sm" />
              <span className="bg-sky-400 rounded-sm" />
              <span className="bg-sky-400 rounded-sm" />
              <span className="bg-sky-400 rounded-sm" />
            </div>
          </button>

          {/* Windows Search */}
          <button
            onClick={() => {
              expandNotch();
              setActiveTab('ai_hub');
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* File Explorer */}
          <button
            onClick={() => setIsFileExplorerOpen(!isFileExplorerOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isFileExplorerOpen ? 'bg-white/15 text-amber-400' : 'hover:bg-white/10 text-amber-400'
            }`}
            title="File Explorer"
          >
            <Folder className="w-4 h-4" />
          </button>

          {/* NOVA Dynamic Notch Trigger App */}
          <button
            onClick={toggleExpand}
            className={`p-2 rounded-lg transition-all cursor-pointer relative ${
              isExpanded ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-sky-400'
            }`}
            title="NOVA Smart Notch"
          >
            <Sparkles className="w-4 h-4" />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
          </button>

          {/* Browser */}
          <button
            onClick={() => {
              expandNotch();
              setActiveTab('ai_hub');
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-cyan-400 transition-colors cursor-pointer"
            title="Web & AI"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        {/* Right Side: Windows 11 System Tray */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          {/* NOVA System Tray Icon */}
          <button
            onClick={toggleExpand}
            className="px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="NOVA Smart Notch running in background"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <span className="font-bold text-[11px] text-white">NOVA</span>
          </button>

          {/* Connectivity & Audio Group */}
          <div
            onClick={() => {
              expandNotch();
              setActiveTab('controls');
            }}
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <Volume2 className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1 font-mono text-[11px]">
              {systemStatus.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className="w-3.5 h-3.5" />
              )}
              <span>{systemStatus.batteryLevel}%</span>
            </div>
          </div>

          {/* Clock & Date */}
          <div
            onClick={() => {
              expandNotch();
              setActiveTab('controls');
            }}
            className="text-right px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer leading-tight font-mono text-[11px]"
          >
            <div>{timeStr}</div>
            <div className="text-[10px] text-slate-400">{dateStr}</div>
          </div>

          {/* Notification Center Trigger */}
          <button
            onClick={() => {
              expandNotch();
              setActiveTab('notifications');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 relative transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
