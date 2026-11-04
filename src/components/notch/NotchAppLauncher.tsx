import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Terminal,
  X,
  Play
} from 'lucide-react';
import { installedAppsService } from '../../services/installedAppsService';
import { InstalledWindowsApp } from '../../types';
import { soundService } from '../../services/soundService';
import { useNotch } from '../../context/NotchContext';
import { AppOfficialIcon } from './AppOfficialIcon';

export const NotchAppLauncher: React.FC = () => {
  const { resetNotchPosition, isCustomPositioned, collapseNotch } = useNotch();
  const [apps, setApps] = useState<InstalledWindowsApp[]>(installedAppsService.getInstalledApps());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [launchingApp, setLaunchingApp] = useState<{ id: string; name: string } | null>(null);
  const [launchFeedback, setLaunchFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = installedAppsService.subscribe(() => {
      setApps(installedAppsService.getInstalledApps());
    });
    return unsub;
  }, []);

  const handleLaunch = async (app: InstalledWindowsApp, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.play('button_click');

    setLaunchingApp({ id: app.id, name: app.name });
    setLaunchFeedback(`Launching ${app.name}...`);

    try {
      const res = await installedAppsService.launchApp(app);
      setLaunchFeedback(res.message);
    } catch {
      setLaunchFeedback(`Invoked ${app.protocol || app.name}`);
    }

    setTimeout(() => {
      setLaunchingApp(null);
    }, 1800);
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.processName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'developer' && (app.category === 'developer' || app.id === 'vscode' || app.id === 'terminal')) ||
      (selectedCategory === 'browser' && (app.category === 'browser' || app.id === 'chrome' || app.id === 'edge' || app.id === 'firefox')) ||
      (selectedCategory === 'utility' && (app.category === 'utility' || app.category === 'system' || app.id === 'explorer' || app.id === 'settings' || app.id === 'calculator' || app.id === 'notepad'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden text-slate-100 select-none font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. TOP HEADER BAR: Search, Launching Status, Reset Position */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-black/40 backdrop-blur-md gap-2">
        {/* Search Input */}
        <div className="flex-1 min-w-0 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed applications..."
            className="w-full pl-8 pr-6 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] focus:bg-white/[0.12] border border-white/10 focus:border-sky-400/50 text-xs text-white placeholder:text-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Live Launch Status / Feedback */}
        {launchFeedback && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[10px] font-medium shrink-0 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="truncate max-w-[170px]">{launchFeedback}</span>
          </div>
        )}

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Reset Position Button */}
          <button
            onClick={resetNotchPosition}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
              isCustomPositioned
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Reset Smart Notch to Original Top-Center Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Pos</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY FILTER CHIPS */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.05] bg-black/20 text-[10px]">
        {[
          { id: 'all', label: 'All Applications' },
          { id: 'developer', label: 'Developer & Code' },
          { id: 'browser', label: 'Web Browsers' },
          { id: 'utility', label: 'System & Tools' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-sky-500/25 text-sky-200 border border-sky-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-slate-500">
          {filteredApps.length} Apps
        </span>
      </div>

      {/* 3. APPS GRID CONTAINER (Fast scrollable, responsive) */}
      <div className="flex-1 min-h-0 overflow-y-auto notch-dashboard-scroll p-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {filteredApps.map((app) => {
            const isLaunchingThis = launchingApp?.id === app.id;

            return (
              <button
                key={app.id}
                onClick={(e) => handleLaunch(app, e)}
                className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer text-center select-none active:scale-95 ${
                  isLaunchingThis
                    ? 'bg-sky-500/20 border-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.4)] scale-105'
                    : 'bg-white/[0.03] hover:bg-white/[0.09] border-white/[0.07] hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10'
                }`}
                title={`Single-click to launch ${app.name} (${app.processName})`}
              >
                {/* Launching glowing ring indicator */}
                {isLaunchingThis && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-sky-400 animate-ping" />
                )}

                {/* Official Authentic App Icon */}
                <div className="relative mb-1.5 transition-transform duration-150 group-hover:scale-110">
                  <AppOfficialIcon appId={app.id} size={38} />
                </div>

                {/* App Display Name */}
                <span className="text-[11px] font-semibold text-slate-100 group-hover:text-white leading-tight truncate max-w-full block">
                  {app.name}
                </span>

                {/* App Subtitle / Category */}
                <span className="text-[9px] font-mono text-slate-400 truncate max-w-full block mt-0.5 opacity-80 group-hover:opacity-100">
                  {app.publisher?.split(' ')[0] || app.category}
                </span>

                {/* Subtle Hover Action Pill */}
                <span className="absolute bottom-1 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono font-bold text-sky-300 uppercase tracking-wider bg-black/80 px-1 rounded">
                  Open
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FOOTER: Smooth Hover Hint */}
      <div className="shrink-0 px-3 py-1 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
          <span>Mouse out to collapse automatically</span>
        </span>
        <span className="font-mono text-slate-500">
          Drag notch anywhere • Click icon to launch
        </span>
      </div>
    </div>
  );
};
