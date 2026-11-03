import React from 'react';
import {
  Activity,
  Music,
  Bot,
  Sliders,
  Bell,
  Settings,
  Pin,
  PinOff,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { NotchTab } from '../../types';
import { VayllEye } from './VayllEye';

export const NotchExpandedHeader: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    collapseNotch,
    isPinned,
    togglePin,
    activeActivityCount,
    notifications,
    showLiveActivities,
    toggleLiveActivities
  } = useNotch();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const tabs: { id: NotchTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'activities', label: 'Activities', icon: Activity, badge: activeActivityCount },
    { id: 'media', label: 'Media', icon: Music },
    { id: 'ai_hub', label: 'AI Hub', icon: Bot },
    { id: 'controls', label: 'Controls', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 select-none">
      {/* Brand Wordmark with Vayll Eye */}
      <div className="flex items-center gap-2.5 shrink-0">
        <VayllEye size="sm" />
        <span className="text-sm font-bold tracking-tight text-white">
          NOVA
        </span>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden lg:inline">
          Smart Notch
        </span>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-sky-500 text-white rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Live Activity Toggle, Pin & Collapse */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleLiveActivities}
          title={showLiveActivities ? 'Hide Live Activities in Notch (Strict Eyes-Only)' : 'Show Live Activities in Notch'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            showLiveActivities
              ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
              : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
          }`}
        >
          {showLiveActivities ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={togglePin}
          title={isPinned ? 'Unpin (auto-collapses on mouse leave)' : 'Pin Notch open'}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isPinned
              ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {isPinned ? <Pin className="w-3.5 h-3.5 fill-sky-300" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={collapseNotch}
          title="Collapse Notch (Esc)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
