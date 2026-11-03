import React from 'react';
import {
  Bell,
  BellOff,
  Trash2,
  Send,
  Shield,
  Mail,
  GitPullRequest,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { AppNotification } from '../../types';
import { NotificationIconAnimation, NotificationAnimationType } from '../notifications/NotificationIconAnimation';

export const NotchNotificationsTab: React.FC = () => {
  const {
    notifications,
    dismissNotification,
    clearAllNotifications,
    triggerTestNotification,
    dndEnabled,
    toggleDND,
    showToast,
    toasts,
    clearAllToasts
  } = useNotch();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'Mail':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'GitPullRequest':
        return <GitPullRequest className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  const formatTimestamp = (ts: number) => {
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header Controls: DND & Actions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDND}
            className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold ${
              dndEnabled
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {dndEnabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            <span>{dndEnabled ? 'Do Not Disturb: ON' : 'Notifications: Active'}</span>
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {dndEnabled ? 'Muting audio chimes & banners' : 'Audio alerts enabled'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerTestNotification}
            className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert</span>
          </button>

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Temporary Notch Toast Tester Banner */}
      <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Notch Stacked Toast Banners</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Temporary notifications stack directly beneath the notch with swipe-to-dismiss & countdown
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast({
                appName: 'Spotify Audio',
                title: 'Track Switched',
                message: 'Playing Midnight Rain & Warm Keys',
                icon: 'Bell',
                priority: 'normal',
                actionLabel: 'Media'
              });
              setTimeout(() => {
                showToast({
                  appName: 'GitHub Desktop',
                  title: 'Pull Request #144 Approved',
                  message: 'Dynamic Island notification stacking and swipe-to-dismiss active.',
                  icon: 'GitPullRequest',
                  priority: 'high',
                  actionLabel: 'Inspect'
                });
              }, 140);
              setTimeout(() => {
                showToast({
                  appName: 'Windows Security',
                  title: 'Threat Shield Active',
                  message: 'Kernel hardware isolation active with zero issues.',
                  icon: 'Shield',
                  priority: 'normal',
                  actionLabel: 'Report'
                });
              }, 280);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium border border-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            Stack 3 Toasts Demo
          </button>
          {toasts.length > 0 && (
            <button
              onClick={clearAllToasts}
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 text-xs cursor-pointer"
            >
              Dismiss Stack ({toasts.length})
            </button>
          )}
        </div>
      </div>

      {/* 9 Unique Notification Animation Triggers */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-300 px-1 uppercase tracking-wider flex items-center justify-between">
          <span>9 Unique Animation Types (Click to test in Notch)</span>
          <span className="text-[10px] text-sky-400 font-mono">Real-time GPU motion</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { label: 'Message', type: 'message', title: 'New Message from Alex', msg: 'The sprint review is confirmed for 2 PM.', app: 'Teams' },
            { label: 'Download', type: 'download', title: 'Downloading Unreal Engine', msg: '1.2 GB of 4.8 GB · 14.2 MB/s', app: 'Epic Games' },
            { label: 'Complete', type: 'download_complete', title: 'VS Code Downloaded', msg: 'Package verified with SHA-256 integrity.', app: 'Downloads' },
            { label: 'Warning', type: 'warning', title: 'High Memory Pressure', msg: 'RAM usage exceeded 85%. Freeing pages.', app: 'System Shield' },
            { label: 'Error', type: 'error', title: 'Compilation Error', msg: 'Build job failed in release target: code 1.', app: 'Terminal' },
            { label: 'Battery', type: 'battery_low', title: 'Battery Critical', msg: '12% battery remaining. Plug into AC power.', app: 'Windows Power' },
            { label: 'Music', type: 'music', title: 'Now Playing Synthwave', msg: 'Neon Horizon by NOVA Audio', app: 'Spotify' },
            { label: 'Timer', type: 'timer_complete', title: 'System Timer Finished', msg: 'Count down completed for task reminder.', app: 'Clock & Timer' },
            { label: 'Update', type: 'system_update', title: 'Windows 11 Update', msg: 'Security intelligence definitions updated.', app: 'Windows Update' }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => {
                showToast({
                  appName: item.app,
                  title: item.title,
                  message: item.msg,
                  icon: item.type,
                  priority: item.type === 'error' ? 'urgent' : item.type === 'warning' ? 'high' : 'normal',
                  animType: item.type as NotificationAnimationType,
                  actionLabel: 'View'
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/40 text-slate-300 hover:text-white transition-all whitespace-nowrap cursor-pointer text-[11px] font-medium"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No new notifications. You're completely caught up.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white/5 hover:bg-white/[0.08] border rounded-xl p-3 transition-all ${
                notif.priority === 'urgent'
                  ? 'border-rose-500/40'
                  : notif.priority === 'high'
                  ? 'border-amber-500/30'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <NotificationIconAnimation
                    type={notif.animType || notif.title || notif.appName || notif.icon}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
                        {notif.appName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        · {formatTimestamp(notif.timestamp)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-0.5">{notif.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>

                    {notif.actionLabel && (
                      <div className="mt-2.5">
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                        >
                          {notif.actionLabel}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="text-slate-500 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <span className="text-xs font-bold">&times;</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
