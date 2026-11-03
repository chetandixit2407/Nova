import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Edit2,
  ExternalLink,
  Terminal,
  Globe,
  Folder,
  Code,
  Music,
  Check,
  RotateCcw,
  Search,
  Pin,
  PinOff,
  RefreshCw,
  Play,
  Layers,
  Sparkles,
  Sliders,
  FolderOpen,
  Upload,
  FileCode,
  Activity,
  Calculator,
  Settings,
  Scissors,
  FileText,
  Gamepad2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  MessageSquare,
  BookOpen,
  Mail,
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { QuickAppShortcut, InstalledWindowsApp } from '../../types';
import { installedAppsService } from '../../services/installedAppsService';
import { windowActivityService } from '../../services/windowActivityService';
import { soundService } from '../../services/soundService';
import { useNotch } from '../../context/NotchContext';

interface QuickAppsBarModalProps {
  onClose: () => void;
}

const AVAILABLE_ICONS: { name: string; icon: React.ElementType }[] = [
  { name: 'Code', icon: Code },
  { name: 'Terminal', icon: Terminal },
  { name: 'Globe', icon: Globe },
  { name: 'Folder', icon: Folder },
  { name: 'Music', icon: Music },
  { name: 'Calculator', icon: Calculator },
  { name: 'Settings', icon: Settings },
  { name: 'Activity', icon: Activity },
  { name: 'Scissors', icon: Scissors },
  { name: 'FileText', icon: FileText },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Layers', icon: Layers },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Hash', icon: Hash },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Mail', icon: Mail }
];

const COLOR_OPTIONS = [
  '#007ACC', // VS Code Blue
  '#107C41', // Windows Terminal Green
  '#0078D7', // Windows Blue
  '#1DB954', // Spotify Green
  '#FFB900', // Explorer Amber
  '#EA4335', // Chrome Red
  '#FB542B', // Brave Orange
  '#FF7139', // Firefox Orange
  '#7C3AED', // Violet
  '#EC4899', // Pink
  '#00A4EF', // Cyan
  '#38BDF8'  // Sky
];

export const QuickAppsBarModal: React.FC<QuickAppsBarModalProps> = ({ onClose }) => {
  const { showToast } = useNotch();

  // State
  const [quickSlots, setQuickSlots] = useState<QuickAppShortcut[]>(installedAppsService.getQuickSlots());
  const [installedApps, setInstalledApps] = useState<InstalledWindowsApp[]>(installedAppsService.getInstalledApps());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<number>(installedAppsService.getLastScanTimestamp());

  // Slot assignment modal
  const [slotPickerIndex, setSlotPickerIndex] = useState<number | null>(null);

  // Custom App Creator modal
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [customType, setCustomType] = useState<'exe' | 'folder' | 'url'>('exe');
  const [customName, setCustomName] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<string>('');
  const [customIcon, setCustomIcon] = useState<string>('FileCode');
  const [customColor, setCustomColor] = useState<string>('#38BDF8');
  const [assignDirectlyToSlot, setAssignDirectlyToSlot] = useState<number | null>(null);

  // Edit App modal
  const [editingApp, setEditingApp] = useState<InstalledWindowsApp | null>(null);

  // Active view: 'quick_bar' or 'all_installed'
  const [activeViewTab, setActiveViewTab] = useState<'quick_bar' | 'all_installed'>('quick_bar');

  // Running apps tracker
  const [runningAppIds, setRunningAppIds] = useState<Set<string>>(new Set());

  // Subscribe to installed apps service and window activity service
  useEffect(() => {
    const updateRunning = () => {
      const all = windowActivityService.getAllApps();
      const running = new Set(all.filter((a) => a.status === 'running').map((a) => a.id));
      setRunningAppIds(running);
    };

    updateRunning();

    const unsubApps = installedAppsService.subscribe(() => {
      setQuickSlots(installedAppsService.getQuickSlots());
      setInstalledApps(installedAppsService.getInstalledApps());
      setLastScanTime(installedAppsService.getLastScanTimestamp());
      updateRunning();
    });

    const unsubWin = windowActivityService.subscribeForeground(() => {
      updateRunning();
    });

    const unsubActs = windowActivityService.subscribeActivities(() => {
      updateRunning();
    });

    return () => {
      unsubApps();
      unsubWin();
      unsubActs();
    };
  }, []);

  const renderIcon = (iconName: string, iconColor?: string, className = 'w-5 h-5') => {
    const found = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === iconName.toLowerCase());
    const IconComp = found ? found.icon : Code;
    return <IconComp className={className} style={{ color: iconColor || '#38BDF8' }} />;
  };

  // Launch handler with real Windows protocol and running-window activation
  const handleLaunch = async (shortcutOrApp: QuickAppShortcut | InstalledWindowsApp) => {
    const isApp = 'processName' in shortcutOrApp;
    const title = isApp ? (shortcutOrApp as InstalledWindowsApp).name : (shortcutOrApp as QuickAppShortcut).title;
    const targetId = isApp ? (shortcutOrApp as InstalledWindowsApp).id : (shortcutOrApp as QuickAppShortcut).target;
    const iconName = isApp ? (shortcutOrApp as InstalledWindowsApp).iconName : (shortcutOrApp as QuickAppShortcut).icon;
    const isRunning = runningAppIds.has(targetId);

    const result = await installedAppsService.launchApp(shortcutOrApp, {
      activateIfRunning: true
    });

    if (result.success) {
      if (result.activated) {
        showToast({
          appName: 'Quick Apps Bar',
          title: `Activated: ${title}`,
          message: `Switched foreground focus to existing running window.`,
          icon: iconName || 'Play',
          duration: 1800
        });
      } else {
        showToast({
          appName: 'Windows Launch Engine',
          title: `Launching ${title}`,
          message: `Process initialized via Windows execution pipeline.`,
          icon: iconName || 'Play',
          duration: 2000
        });
      }
    } else {
      showToast({
        appName: 'Windows Launch Error',
        title: `Could not launch ${title}`,
        message: result.message,
        icon: 'AlertCircle',
        duration: 3200
      });
    }

    onClose();
  };

  // Rescan Windows Installed Apps
  const handleScanApps = async () => {
    setIsScanning(true);
    const result = await installedAppsService.scanInstalledApps();
    setIsScanning(false);
    showToast({
      appName: 'Windows App Scanner',
      title: 'Scan Complete',
      message: `Detected ${result.count} Windows applications across Start Menu & Program Files.`,
      icon: 'ShieldCheck',
      duration: 2400
    });
  };

  // Save Custom Shortcut
  const handleSaveCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customTarget.trim()) return;

    const newApp = installedAppsService.addCustomApp({
      name: customName.trim(),
      target: customTarget.trim(),
      type: customType,
      iconName: customIcon,
      iconColor: customColor
    });

    if (assignDirectlyToSlot !== null) {
      installedAppsService.setSlotApp(assignDirectlyToSlot, newApp);
      showToast({
        appName: 'Quick Apps Bar',
        title: 'Shortcut Assigned',
        message: `Assigned "${newApp.name}" to Slot #${assignDirectlyToSlot + 1}.`,
        icon: 'Check',
        duration: 1800
      });
    }

    // Reset form
    setCustomName('');
    setCustomTarget('');
    setShowAddCustomModal(false);
    setAssignDirectlyToSlot(null);
  };

  // File Picker for EXE / Shortcuts
  const handleLocalFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileName = file.name;
      // Auto-populate name if empty
      if (!customName.trim()) {
        setCustomName(fileName.replace(/\.(exe|lnk|bat|cmd)$/i, ''));
      }
      setCustomTarget(`C:\\Program Files\\${fileName}`);
      soundService.playTick();
    }
  };

  // Filtered Apps
  const filteredApps = installedAppsService.searchApps(searchQuery, selectedCategory);

  const categories = [
    { id: 'all', label: 'All Installed' },
    { id: 'developer', label: 'Developer' },
    { id: 'browser', label: 'Browsers' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'media', label: 'Media' },
    { id: 'utility', label: 'Utilities' },
    { id: 'system', label: 'System' },
    { id: 'custom', label: 'Custom' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-5 w-full flex flex-col space-y-4 text-slate-100 max-h-[82vh] overflow-y-auto"
    >
      {/* 1. Header with Status & Action Buttons */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Quick Apps Bar & Windows App Manager
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono">
                PRO • 5 SLOTS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Real Windows application detection, Start Menu scan, and single-click launcher
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScanApps}
            disabled={isScanning}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Scan Windows Start Menu & Program Files"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan Apps'}</span>
          </button>

          <button
            onClick={() => {
              setAssignDirectlyToSlot(null);
              setShowAddCustomModal(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom EXE</span>
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Switcher: Quick Slots vs Installed Catalog */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveViewTab('quick_bar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'quick_bar'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quick Apps Bar (5 Slots)</span>
          </button>

          <button
            onClick={() => setActiveViewTab('all_installed')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'all_installed'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Installed Windows Apps ({installedApps.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{runningAppIds.size} Apps Running in Background</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: THE 5-SLOT QUICK APPS BAR (Premium Dynamic Island Slots) */}
      {/* ============================================================== */}
      {activeViewTab === 'quick_bar' && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Active 5-Slot Desktop Dock
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Click slot to launch or focus window · Click "Change" to reassign
              </span>
            </div>

            {/* The 5 Slots Grid */}
            <div className="grid grid-cols-5 gap-3">
              {quickSlots.map((slot, index) => {
                const isRunning = runningAppIds.has(slot.target);

                return (
                  <div
                    key={slot.id || `slot-${index}`}
                    className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-sky-400/30 transition-all group relative"
                  >
                    {/* Slot badge */}
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500 font-bold">
                      #{index + 1}
                    </div>

                    {/* Running status badge */}
                    {isRunning && (
                      <div
                        className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold"
                        title="Application running in background"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>RUN</span>
                      </div>
                    )}

                    {/* App Launch Button */}
                    <button
                      onClick={() => handleLaunch(slot)}
                      className="mt-4 w-13 h-13 rounded-2xl bg-black/50 border border-white/15 hover:border-sky-400 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
                      title={`Launch or switch to ${slot.title}`}
                    >
                      {renderIcon(slot.icon, slot.iconColor, 'w-6 h-6')}
                    </button>

                    {/* Title */}
                    <span className="mt-2 text-xs font-semibold text-slate-200 text-center truncate w-full px-1">
                      {slot.title}
                    </span>

                    {/* Path / Protocol tag */}
                    <span className="text-[10px] text-slate-400 font-mono truncate w-full text-center">
                      {isRunning ? 'Active Window' : slot.category || slot.actionType}
                    </span>

                    {/* Slot Actions */}
                    <div className="mt-3 flex items-center gap-1.5 w-full pt-2 border-t border-white/5">
                      <button
                        onClick={() => setSlotPickerIndex(index)}
                        className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer text-center"
                        title="Pick installed application for this slot"
                      >
                        Change
                      </button>

                      <button
                        onClick={() => {
                          setAssignDirectlyToSlot(index);
                          setShowAddCustomModal(true);
                        }}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                        title="Set Custom EXE or URL for this slot"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>Permanently saved to Windows NOVA profile</span>
              <button
                onClick={() => installedAppsService.resetQuickSlots()}
                className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Default 5 Slots</span>
              </button>
            </div>
          </div>

          {/* Quick Launch Direct Grid from Top Pinned Apps */}
          <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-sky-400" />
                Pinned Windows Applications
              </span>
              <button
                onClick={() => setActiveViewTab('all_installed')}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View all {installedApps.length} apps</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {installedApps
                .filter((app) => app.isPinned)
                .slice(0, 12)
                .map((app) => {
                  const isRunning = runningAppIds.has(app.id);

                  return (
                    <button
                      key={app.id}
                      onClick={() => handleLaunch(app)}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-sky-400/40 flex flex-col items-center gap-1.5 transition-all cursor-pointer group text-center relative"
                    >
                      {isRunning && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {renderIcon(app.iconName, app.iconColor, 'w-4 h-4')}
                      </div>
                      <span className="text-[11px] font-medium text-slate-200 group-hover:text-white truncate w-full">
                        {app.name}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: ALL INSTALLED WINDOWS APPS (Search, Filter, Pin & Edit) */}
      {/* ============================================================== */}
      {activeViewTab === 'all_installed' && (
        <div className="space-y-3.5">
          {/* Search Bar & Category Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search installed Windows apps, process name, or EXE path..."
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Installed Apps List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredApps.length === 0 ? (
              <div className="col-span-full py-10 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No applications match your search criteria.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredApps.map((app) => {
                const isRunning = runningAppIds.has(app.id);

                return (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-sky-400/30 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                        {renderIcon(app.iconName, app.iconColor, 'w-5 h-5')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white tracking-tight truncate">
                            {app.name}
                          </h4>
                          {isRunning && (
                            <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Running
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {app.processName} · {app.publisher || 'Windows App'}
                        </div>

                        <div className="text-[9px] text-slate-500 font-mono truncate" title={app.exePath}>
                          {app.exePath}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLaunch(app)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isRunning
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                            : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
                        }`}
                        title={isRunning ? 'Switch focus to existing window' : 'Launch new instance'}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isRunning ? 'Activate' : 'Launch'}</span>
                      </button>

                      {/* Pin Toggle */}
                      <button
                        onClick={() => installedAppsService.togglePinApp(app.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          app.isPinned
                            ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title={app.isPinned ? 'Unpin app' : 'Pin to favorites'}
                      >
                        {app.isPinned ? <Pin className="w-3.5 h-3.5 fill-amber-300" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Slot Assignment quick button */}
                      <div className="relative group/slot">
                        <button
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-sky-300 text-xs transition-colors cursor-pointer"
                          title="Assign to Quick Slot"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 hidden group-hover/slot:flex flex-col bg-slate-900 border border-white/20 rounded-xl p-1 shadow-2xl z-20 min-w-[120px]">
                          <span className="px-2 py-1 text-[9px] font-mono text-slate-400 uppercase">
                            Set as Slot
                          </span>
                          {[0, 1, 2, 3, 4].map((slotIdx) => (
                            <button
                              key={slotIdx}
                              onClick={() => {
                                installedAppsService.setSlotApp(slotIdx, app);
                                showToast({
                                  appName: 'Quick Apps Bar',
                                  title: `Assigned to Slot #${slotIdx + 1}`,
                                  message: `${app.name} is now in Quick Apps Slot #${slotIdx + 1}.`,
                                  icon: 'Check',
                                  duration: 1800
                                });
                              }}
                              className="px-2.5 py-1 text-left text-xs text-slate-200 hover:bg-sky-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <span>Slot #{slotIdx + 1}</span>
                              <span className="text-[10px] opacity-70">
                                ({quickSlots[slotIdx]?.title || 'Empty'})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Edit / Customize */}
                      <button
                        onClick={() => setEditingApp(app)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit app properties"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Custom app deletion */}
                      {app.isCustom && (
                        <button
                          onClick={() => installedAppsService.deleteApp(app.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete custom shortcut"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: PICK APP FOR SLOT (Triggered from Slot "Change" button) */}
      {/* ============================================================== */}
      {slotPickerIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Select Application for Slot #{slotPickerIndex + 1}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pick any installed Windows application or custom executable
                </p>
              </div>

              <button
                onClick={() => setSlotPickerIndex(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    installedAppsService.setSlotApp(slotPickerIndex, app);
                    setSlotPickerIndex(null);
                    showToast({
                      appName: 'Quick Apps Bar',
                      title: 'Slot Updated',
                      message: `Assigned "${app.name}" to Slot #${slotPickerIndex + 1}.`,
                      icon: 'Check',
                      duration: 1800
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-sky-500/20 border border-white/5 hover:border-sky-400 flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                      {renderIcon(app.iconName, app.iconColor, 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-sky-300">
                        {app.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {app.processName} · {app.category}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select &gt;
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setAssignDirectlyToSlot(slotPickerIndex);
                  setSlotPickerIndex(null);
                  setShowAddCustomModal(true);
                }}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Custom Shortcut</span>
              </button>

              <button
                onClick={() => setSlotPickerIndex(null)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD CUSTOM EXE / FOLDER / URL SHORTCUT                */}
      {/* ============================================================== */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Add Custom Windows Shortcut
              </h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'exe', label: 'EXE / Program' },
                { id: 'folder', label: 'Folder / Drive' },
                { id: 'url', label: 'Website / URL' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCustomType(t.id as any)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                    customType === t.id
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveCustomApp} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Application / Shortcut Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Google Chrome, Obsidian, or Work Vault"
                  required
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    {customType === 'exe'
                      ? 'Executable (.exe, .bat, .cmd) Path'
                      : customType === 'folder'
                      ? 'Folder / Drive Path'
                      : 'Website / Protocol URL'}
                  </label>
                  {customType === 'exe' && (
                    <label className="text-[10px] text-sky-400 hover:text-sky-300 cursor-pointer flex items-center gap-1 font-mono">
                      <Upload className="w-3 h-3" />
                      <span>Browse Local File</span>
                      <input
                        type="file"
                        accept=".exe,.bat,.cmd,.lnk,*"
                        onChange={handleLocalFileBrowse}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  placeholder={
                    customType === 'exe'
                      ? 'C:\\Program Files\\App\\app.exe'
                      : customType === 'folder'
                      ? 'C:\\Users\\Nova\\Projects'
                      : 'https://github.com or vscode://'
                  }
                  required
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Choose Icon
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-24 overflow-y-auto p-1 bg-black/40 rounded-lg border border-white/10">
                  {AVAILABLE_ICONS.map((i) => {
                    const IconComp = i.icon;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setCustomIcon(i.name)}
                        className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          customIcon === i.name
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={i.name}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Accent */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer shrink-0 ${
                        customColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!customName.trim() || !customTarget.trim()}
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Windows Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT APP PROPERTIES                                    */}
      {/* ============================================================== */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-sky-400" />
                Edit {editingApp.name}
              </h3>
              <button
                onClick={() => setEditingApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Executable Path</label>
                <input
                  type="text"
                  value={editingApp.exePath}
                  onChange={(e) => setEditingApp({ ...editingApp, exePath: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Protocol Scheme (optional)</label>
                <input
                  type="text"
                  value={editingApp.protocol || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, protocol: e.target.value })}
                  placeholder="e.g. vscode:// or spotify://"
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setEditingApp(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    installedAppsService.updateApp(editingApp.id, editingApp);
                    setEditingApp(null);
                    showToast({
                      appName: 'Quick Apps Bar',
                      title: 'App Updated',
                      message: `Saved changes to ${editingApp.name}.`,
                      icon: 'Check',
                      duration: 1800
                    });
                  }}
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
