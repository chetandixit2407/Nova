'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_TABS = new Set([
  'media',
  'activities',
  'controls',
  'notifications',
  'ai',
  'ai_hub',
  'settings',
  'clipboard',
  'shelf',
  'time',
  'calendar',
  'converters',
  'notes',
  'pet',
  'bluetooth'
]);

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  syncNotchWindow: (payload) => {
    if (!payload || typeof payload !== 'object') return Promise.resolve(false);
    return ipcRenderer.invoke('notch:sync-window', {
      isExpanded: Boolean(payload.isExpanded),
      width: Number(payload.width) || 150,
      height: Number(payload.height) || 64,
      reveal: Boolean(payload.reveal),
      fullscreen: Boolean(payload.fullscreen)
    });
  },

  moveNotchWindow: (dx, dy) => {
    return ipcRenderer.invoke('notch:move-window', {
      dx: Number(dx) || 0,
      dy: Number(dy) || 0
    });
  },

  resetNotchWindow: () => {
    return ipcRenderer.invoke('notch:reset-window');
  },

  toggleNotchVisibility: () => {
    return ipcRenderer.invoke('notch:toggle-visibility');
  },

  openExternal: (url) => {
    if (typeof url !== 'string' || !url.trim()) return Promise.resolve(false);
    return ipcRenderer.invoke('shell:open-external', url.trim());
  },

  launchApp: (payload) => {
    if (!payload || typeof payload !== 'object') return Promise.resolve({ success: false });
    return ipcRenderer.invoke('apps:launch', {
      id: typeof payload.id === 'string' ? payload.id : '',
      name: typeof payload.name === 'string' ? payload.name : '',
      protocol: typeof payload.protocol === 'string' ? payload.protocol : '',
      exePath: typeof payload.exePath === 'string' ? payload.exePath : '',
      processName: typeof payload.processName === 'string' ? payload.processName : ''
    });
  },

  sendNotification: (payload) => {
    if (!payload || typeof payload !== 'object') return Promise.resolve(false);
    return ipcRenderer.invoke('notifications:send', {
      title: typeof payload.title === 'string' ? payload.title.slice(0, 160) : 'NOVA NOTCH',
      body: typeof payload.body === 'string' ? payload.body.slice(0, 500) : '',
      silent: Boolean(payload.silent)
    });
  },

  readClipboardText: () => {
    return ipcRenderer.invoke('clipboard:read-text');
  },

  writeClipboardText: (text) => {
    if (typeof text !== 'string') return Promise.resolve(false);
    return ipcRenderer.invoke('clipboard:write-text', text);
  },

  clearClipboard: () => {
    return ipcRenderer.invoke('clipboard:clear');
  },

  getAutostart: () => {
    return ipcRenderer.invoke('autostart:get');
  },

  setAutostart: (enabled) => {
    return ipcRenderer.invoke('autostart:set', Boolean(enabled));
  },

  getSystemMetrics: () => {
    return ipcRenderer.invoke('system:get-metrics');
  },

  onOpenTab: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, tab) => {
      if (typeof tab === 'string' && ALLOWED_TABS.has(tab)) {
        callback(tab);
      }
    };
    ipcRenderer.on('nova:open-tab', listener);
    return () => {
      ipcRenderer.removeListener('nova:open-tab', listener);
    };
  },

  onToggleExpand: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = () => {
      callback();
    };
    ipcRenderer.on('nova:toggle-expand', listener);
    return () => {
      ipcRenderer.removeListener('nova:toggle-expand', listener);
    };
  }
});
