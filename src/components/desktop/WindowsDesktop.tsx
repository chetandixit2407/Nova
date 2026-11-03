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
  CloudSun,
  Music,
  Activity,
  Calculator
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { audioEngine } from '../../services/audioEngine';
import { windowActivityService } from '../../services/windowActivityService';
import { WindowsWindowManager } from './WindowsWindowManager';

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
  const [openApps, setOpenApps] = useState<string[]>(['vscode']); // Default VS Code open
  const [foregroundAppId, setForegroundAppId] = useState<string | null>('vscode');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Subscribe to window activity service
  useEffect(() => {
    const unsub = windowActivityService.subscribeForeground((app) => {
      setForegroundAppId(app ? app.id : null);
    });
    return unsub;
  }, []);

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

  const handleLaunchApp = (appId: string) => {
    if (!openApps.includes(appId)) {
      setOpenApps((prev) => [...prev, appId]);
    }
    setForegroundAppId(appId);
    windowActivityService.launchApp(appId);
  };

  const handleFocusApp = (appId: string) => {
    setForegroundAppId(appId);
    windowActivityService.focusApp(appId);
  };

  const handleMinimizeApp = (appId: string) => {
    windowActivityService.minimizeApp(appId);
  };

  const handleCloseApp = (appId: string) => {
    setOpenApps((prev) => prev.filter((id) => id !== appId));
    windowActivityService.closeApp(appId);
  };

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

      {/* Main Desktop Canvas Area with Shortcut Icons */}
      <div className="relative z-10 flex-1 w-full p-6 pt-16 flex justify-between items-start overflow-hidden pointer-events-auto">
        {/* Left Side: Desktop Shortcuts Grid */}
        <div className="grid grid-cols-1 gap-4 w-24 shrink-0">
          {/* 1. VS Code */}
          <button
            onClick={() => handleLaunchApp('vscode')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch Visual Studio Code"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#007acc] to-[#005a9e] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              VS Code
            </span>
          </button>

          {/* 2. Windows Terminal */}
          <button
            onClick={() => handleLaunchApp('terminal')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch Windows Terminal"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#0c0c0c] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Terminal
            </span>
          </button>

          {/* 3. Spotify */}
          <button
            onClick={() => handleLaunchApp('spotify')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch Spotify Music"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1db954] to-[#128a3c] flex items-center justify-center text-black font-bold shadow-lg group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Spotify
            </span>
          </button>

          {/* 4. Microsoft Edge */}
          <button
            onClick={() => handleLaunchApp('edge')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch Microsoft Edge"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0078d7] via-[#00c8ff] to-[#00a2ed] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Edge
            </span>
          </button>

          {/* 5. This PC / File Explorer */}
          <button
            onClick={() => handleLaunchApp('explorer')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch File Explorer"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Folder className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Explorer
            </span>
          </button>

          {/* 6. Task Manager */}
          <button
            onClick={() => handleLaunchApp('taskmgr')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 hover:backdrop-blur-sm transition-colors text-center group cursor-pointer"
            title="Launch Task Manager"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              Taskmgr
            </span>
          </button>
        </div>

        {/* Right Side: Quick Wallpaper & Notch Control */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setWallpaperIndex((wallpaperIndex + 1) % wallpapers.length)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-medium text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Click to cycle wallpaper"
          >
            <Image className="w-4 h-4 text-emerald-400" />
            <span>Cycle Wallpaper</span>
          </button>

          <button
            onClick={() => {
              expandNotch();
              setActiveTab('settings');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-medium text-white backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="NOVA Dynamic Notch Preferences"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>NOVA Island</span>
          </button>
        </div>
      </div>

      {/* Real Windows Desktop Windows Manager */}
      <WindowsWindowManager
        openApps={openApps}
        foregroundAppId={foregroundAppId}
        onFocus={handleFocusApp}
        onMinimize={handleMinimizeApp}
        onClose={handleCloseApp}
      />

      {/* Windows 11 Start Menu Modal */}
      {isStartOpen && (
        <div className="absolute z-40 bottom-14 left-1/2 -translate-x-1/2 w-[540px] max-w-[92vw] bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
          {/* Start Search */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search apps, files, commands (triggers Dynamic Notch)..."
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
                { id: 'vscode', name: 'VS Code', icon: Code, color: 'text-blue-400' },
                { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-emerald-400' },
                { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-emerald-400' },
                { id: 'edge', name: 'Edge', icon: Globe, color: 'text-sky-400' },
                { id: 'explorer', name: 'Explorer', icon: Folder, color: 'text-amber-400' },
                { id: 'taskmgr', name: 'Task Manager', icon: Activity, color: 'text-cyan-400' }
              ].map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      handleLaunchApp(app.id);
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

          {/* VS Code Taskbar Button */}
          <button
            onClick={() => handleLaunchApp('vscode')}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              openApps.includes('vscode') ? 'bg-white/15 text-sky-400' : 'hover:bg-white/10 text-slate-400'
            }`}
            title="Visual Studio Code"
          >
            <Code className="w-4 h-4" />
            {openApps.includes('vscode') && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-sky-400" />
            )}
          </button>

          {/* Terminal Taskbar Button */}
          <button
            onClick={() => handleLaunchApp('terminal')}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              openApps.includes('terminal') ? 'bg-white/15 text-emerald-400' : 'hover:bg-white/10 text-slate-400'
            }`}
            title="Windows Terminal"
          >
            <Terminal className="w-4 h-4" />
            {openApps.includes('terminal') && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Spotify Taskbar Button */}
          <button
            onClick={() => handleLaunchApp('spotify')}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              openApps.includes('spotify') ? 'bg-white/15 text-emerald-400' : 'hover:bg-white/10 text-slate-400'
            }`}
            title="Spotify Music"
          >
            <Music className="w-4 h-4" />
            {openApps.includes('spotify') && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* File Explorer Taskbar Button */}
          <button
            onClick={() => handleLaunchApp('explorer')}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              openApps.includes('explorer') ? 'bg-white/15 text-amber-400' : 'hover:bg-white/10 text-amber-400'
            }`}
            title="File Explorer"
          >
            <Folder className="w-4 h-4" />
            {openApps.includes('explorer') && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-amber-400" />
            )}
          </button>

          {/* NOVA Dynamic Notch Trigger App */}
          <button
            onClick={toggleExpand}
            className={`p-2 rounded-lg transition-all cursor-pointer relative ${
              isExpanded ? 'bg-sky-500/20 text-sky-400' : 'hover:bg-white/10 text-sky-400'
            }`}
            title="NOVA Dynamic Island Smart Notch"
          >
            <Sparkles className="w-4 h-4" />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-400" />
          </button>

          {/* Edge Browser */}
          <button
            onClick={() => handleLaunchApp('edge')}
            className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
              openApps.includes('edge') ? 'bg-white/15 text-cyan-400' : 'hover:bg-white/10 text-cyan-400'
            }`}
            title="Microsoft Edge"
          >
            <Globe className="w-4 h-4" />
            {openApps.includes('edge') && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-cyan-400" />
            )}
          </button>
        </div>

        {/* Right Side: Windows 11 System Tray */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          {/* NOVA System Tray Icon */}
          <button
            onClick={toggleExpand}
            className="px-2 py-1 rounded-lg hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="NOVA Dynamic Island daemon active"
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
