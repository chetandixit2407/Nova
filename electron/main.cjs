'use strict';

const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Tray,
  Menu,
  nativeImage,
  shell,
  clipboard,
  Notification,
  globalShortcut,
  session,
  desktopCapturer
} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const APP_IDENTITY_NAME = 'ChetanDixit.NOVANOTCH';
const INITIAL_NOTCH_WIDTH = 150;
const INITIAL_NOTCH_HEIGHT = 64;

const startHidden = process.argv.includes('--hidden');
const isSmokeTest = process.env.NOVA_ELECTRON_SMOKE_TEST === '1';

if (isSmokeTest) {
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-gpu');
}

// Configure Windows Application User Model ID for native Toast Notifications & Store identity
if (process.platform === 'win32') {
  app.setAppUserModelId(APP_IDENTITY_NAME);
}

// Enforce single running instance of NOVA NOTCH
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock && !isSmokeTest) {
  app.quit();
}

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {Tray | null} */
let tray = null;
let isQuitting = false;
let suppressInitialReveal = startHidden;

/**
 * Custom user-dragged anchor in logical DIP screen coordinates: { centerX, topY }
 * @type {{ centerX: number, topY: number } | null}
 */
let customAnchor = null;

// Previous CPU tick snapshot for accurate live CPU load delta
let prevCpuSnapshot = captureCpuSnapshot();

function captureCpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times)) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

function computeCpuUsagePercent() {
  const current = captureCpuSnapshot();
  const idleDiff = current.idle - prevCpuSnapshot.idle;
  const totalDiff = current.total - prevCpuSnapshot.total;
  prevCpuSnapshot = current;
  if (totalDiff <= 0) return 8;
  const pct = Math.round((1 - idleDiff / totalDiff) * 100);
  return Math.max(1, Math.min(100, pct));
}

function resolveTrayIconPath() {
  const candidates =
    process.platform === 'win32'
      ? [
          path.join(__dirname, 'icons', 'icon.ico'),
          path.join(__dirname, '..', 'build', 'icon.ico'),
          path.join(__dirname, 'icons', 'tray.png')
        ]
      : [
          path.join(__dirname, 'icons', 'tray.png'),
          path.join(__dirname, '..', 'build', 'appx', 'Square44x44Logo.png'),
          path.join(__dirname, 'icons', 'icon.ico')
        ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

function expandWindowsEnvVars(rawPath) {
  if (typeof rawPath !== 'string') return '';
  return rawPath.replace(/%([^%]+)%/g, (match, varName) => {
    const val = process.env[varName];
    return typeof val === 'string' ? val : match;
  });
}

function isSafeExternalUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function isSafeAppProtocol(rawProtocol) {
  if (typeof rawProtocol !== 'string' || !rawProtocol.trim()) return false;
  const trimmed = rawProtocol.trim();
  const blocked = /^(javascript|vbscript|data|file|blob|about|chrome):/i;
  if (blocked.test(trimmed)) return false;
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
}

async function openSafeExternalUrl(rawUrl) {
  if (!isSafeExternalUrl(rawUrl)) return false;
  try {
    await shell.openExternal(rawUrl);
    return true;
  } catch {
    return false;
  }
}

function getActiveDisplay(targetWindow) {
  try {
    if (targetWindow && !targetWindow.isDestroyed()) {
      return screen.getDisplayMatching(targetWindow.getBounds());
    }
  } catch {
    // Fallback to primary display
  }
  return screen.getPrimaryDisplay();
}

function applyAlwaysOnTopOverlay(win) {
  if (!win || win.isDestroyed()) return;
  try {
    win.setAlwaysOnTop(true, 'screen-saver');
  } catch {
    win.setAlwaysOnTop(true);
  }
  try {
    win.setSkipTaskbar(true);
  } catch {}
}

function computeNotchBounds(win, width, height, fullscreen) {
  const display = getActiveDisplay(win);
  const workArea = display.workArea;
  const screenBounds = display.bounds;

  const clampedW = Math.max(64, Math.min(8192, Math.round(Number(width) || INITIAL_NOTCH_WIDTH)));
  const clampedH = Math.max(24, Math.min(4320, Math.round(Number(height) || INITIAL_NOTCH_HEIGHT)));

  const isFullscreenOverlay =
    Boolean(fullscreen) ||
    (clampedW >= workArea.width - 32 && clampedH >= workArea.height - 120);

  if (isFullscreenOverlay) {
    return {
      x: workArea.x,
      y: workArea.y,
      width: workArea.width,
      height: workArea.height
    };
  }

  if (customAnchor) {
    const rawX = customAnchor.centerX - Math.round(clampedW / 2);
    const minX = screenBounds.x;
    const maxX = Math.max(minX, screenBounds.x + screenBounds.width - clampedW);
    const minY = screenBounds.y;
    const maxY = Math.max(minY, screenBounds.y + screenBounds.height - clampedH);
    return {
      x: Math.max(minX, Math.min(maxX, rawX)),
      y: Math.max(minY, Math.min(maxY, customAnchor.topY)),
      width: clampedW,
      height: clampedH
    };
  }

  const centeredX = workArea.x + Math.round((workArea.width - clampedW) / 2);
  const topY = screenBounds.y;
  return {
    x: centeredX,
    y: topY,
    width: clampedW,
    height: clampedH
  };
}

function showNotchWindow(focusWindow = false) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (focusWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else if (typeof mainWindow.showInactive === 'function') {
    mainWindow.showInactive();
  } else {
    mainWindow.show();
  }
  applyAlwaysOnTopOverlay(mainWindow);
}

function getAutostartState() {
  try {
    const settings = app.getLoginItemSettings();
    return {
      openAtLogin: Boolean(settings.openAtLogin),
      isWindowsStore: Boolean(process.windowsStore)
    };
  } catch {
    return {
      openAtLogin: false,
      isWindowsStore: Boolean(process.windowsStore)
    };
  }
}

function setAutostartState(enabled) {
  try {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enabled),
      path: process.execPath,
      args: []
    });
    rebuildTrayMenu();
    return getAutostartState();
  } catch {
    return getAutostartState();
  }
}

function handleProtocolUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string' || !mainWindow || mainWindow.isDestroyed()) return;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'nova:') return;
    const action = (parsed.hostname || parsed.pathname.replace(/^\/+/, '')).toLowerCase();
    showNotchWindow(true);
    if (action === 'settings' || action === 'preferences') {
      mainWindow.webContents.send('nova:open-tab', 'settings');
    } else if (action === 'notifications') {
      mainWindow.webContents.send('nova:open-tab', 'notifications');
    } else {
      mainWindow.webContents.send('nova:toggle-expand');
    }
  } catch {
    showNotchWindow(false);
  }
}

function rebuildTrayMenu() {
  if (!tray) return;
  const autostart = getAutostartState();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Dynamic Notch (Alt+N)',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          showNotchWindow(false);
        }
      }
    },
    {
      label: 'NOVA Preferences...',
      click: () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        showNotchWindow(true);
        mainWindow.webContents.send('nova:open-tab', 'settings');
      }
    },
    {
      label: 'Reset Notch Position',
      click: () => {
        customAnchor = null;
        if (mainWindow && !mainWindow.isDestroyed()) {
          const current = mainWindow.getBounds();
          const next = computeNotchBounds(mainWindow, current.width, current.height, false);
          mainWindow.setBounds(next, false);
          showNotchWindow(false);
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Launch at Windows Startup',
      type: 'checkbox',
      checked: autostart.openAtLogin || autostart.isWindowsStore,
      enabled: !autostart.isWindowsStore,
      click: (menuItem) => {
        setAutostartState(menuItem.checked);
      }
    },
    { type: 'separator' },
    {
      label: 'Exit NOVA NOTCH',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function setupSystemTray() {
  try {
    const iconPath = resolveTrayIconPath();
    const trayImage = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
    tray = new Tray(trayImage);
    tray.setToolTip('NOVA NOTCH — Windows Smart Notch');
    rebuildTrayMenu();

    tray.on('click', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        showNotchWindow(false);
      }
    });
  } catch (err) {
    console.warn('[NOVA] System tray unavailable in current environment:', err?.message || err);
  }
}

function registerIpcHandlers() {
  ipcMain.handle('notch:sync-window', (_event, payload) => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    const isExpanded = Boolean(payload?.isExpanded);
    const reveal = Boolean(payload?.reveal);
    const fullscreen = Boolean(payload?.fullscreen);
    const bounds = computeNotchBounds(mainWindow, payload?.width, payload?.height, fullscreen);

    mainWindow.setBounds(bounds, false);
    applyAlwaysOnTopOverlay(mainWindow);

    if (reveal && !mainWindow.isVisible()) {
      if (suppressInitialReveal) {
        suppressInitialReveal = false;
      } else {
        showNotchWindow(isExpanded);
      }
    }
    return true;
  });

  ipcMain.handle('notch:move-window', (_event, payload) => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    const dx = Math.round(Number(payload?.dx) || 0);
    const dy = Math.round(Number(payload?.dy) || 0);
    if (dx === 0 && dy === 0) return true;

    const current = mainWindow.getBounds();
    const display = getActiveDisplay(mainWindow);
    const sb = display.bounds;

    const minX = sb.x;
    const maxX = Math.max(minX, sb.x + sb.width - current.width);
    const minY = sb.y;
    const maxY = Math.max(minY, sb.y + sb.height - current.height);

    const nextX = Math.max(minX, Math.min(maxX, current.x + dx));
    const nextY = Math.max(minY, Math.min(maxY, current.y + dy));

    mainWindow.setPosition(nextX, nextY, false);
    customAnchor = {
      centerX: nextX + Math.round(current.width / 2),
      topY: nextY
    };
    return true;
  });

  ipcMain.handle('notch:reset-window', () => {
    customAnchor = null;
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    const current = mainWindow.getBounds();
    const next = computeNotchBounds(mainWindow, current.width, current.height, false);
    mainWindow.setBounds(next, false);
    applyAlwaysOnTopOverlay(mainWindow);
    return true;
  });

  ipcMain.handle('notch:toggle-visibility', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      return false;
    }
    showNotchWindow(false);
    return true;
  });

  ipcMain.handle('shell:open-external', async (_event, url) => {
    return openSafeExternalUrl(url);
  });

  ipcMain.handle('apps:launch', async (_event, payload) => {
    const protocol = typeof payload?.protocol === 'string' ? payload.protocol.trim() : '';
    const rawExePath = typeof payload?.exePath === 'string' ? payload.exePath.trim() : '';

    try {
      if (isSafeExternalUrl(protocol)) {
        await shell.openExternal(protocol);
        return { success: true, method: 'url' };
      }

      if (process.platform === 'win32' && rawExePath) {
        const resolvedPath = expandWindowsEnvVars(rawExePath);
        if (fs.existsSync(resolvedPath)) {
          const openErr = await shell.openPath(resolvedPath);
          if (!openErr) {
            return { success: true, method: 'openPath' };
          }
        }
      }

      if (isSafeAppProtocol(protocol)) {
        await shell.openExternal(protocol);
        return { success: true, method: 'protocol' };
      }

      return { success: false, error: 'Target executable or protocol unavailable' };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Launch failed' };
    }
  });

  ipcMain.handle('notifications:send', (_event, payload) => {
    try {
      if (!Notification.isSupported()) return false;
      const title = typeof payload?.title === 'string' && payload.title.trim() ? payload.title.trim() : 'NOVA NOTCH';
      const body = typeof payload?.body === 'string' ? payload.body : '';
      const iconPath = resolveTrayIconPath();
      const notif = new Notification({
        title,
        body,
        icon: iconPath,
        silent: Boolean(payload?.silent)
      });
      notif.on('click', () => {
        showNotchWindow(true);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('nova:open-tab', 'notifications');
        }
      });
      notif.show();
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('clipboard:read-text', () => {
    try {
      return clipboard.readText() || '';
    } catch {
      return '';
    }
  });

  ipcMain.handle('clipboard:write-text', (_event, text) => {
    try {
      if (typeof text !== 'string') return false;
      clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('clipboard:clear', () => {
    try {
      clipboard.clear();
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('autostart:get', () => {
    return getAutostartState();
  });

  ipcMain.handle('autostart:set', (_event, enabled) => {
    return setAutostartState(Boolean(enabled));
  });

  ipcMain.handle('system:get-metrics', () => {
    const totalMemBytes = os.totalmem();
    const freeMemBytes = os.freemem();
    const usedMemBytes = Math.max(0, totalMemBytes - freeMemBytes);
    return {
      cpuPercent: computeCpuUsagePercent(),
      memoryPercent: totalMemBytes > 0 ? Math.round((usedMemBytes / totalMemBytes) * 100) : 40,
      usedMemoryGB: Number((usedMemBytes / (1024 ** 3)).toFixed(1)),
      totalMemoryGB: Number((totalMemBytes / (1024 ** 3)).toFixed(1)),
      uptimeSeconds: Math.round(os.uptime())
    };
  });
}

function createSmartNotchWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  const screenBounds = primaryDisplay.bounds;

  const initialX = workArea.x + Math.round((workArea.width - INITIAL_NOTCH_WIDTH) / 2);
  const initialY = screenBounds.y;

  mainWindow = new BrowserWindow({
    title: 'NOVA NOTCH',
    width: INITIAL_NOTCH_WIDTH,
    height: INITIAL_NOTCH_HEIGHT,
    x: initialX,
    y: initialY,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: resolveTrayIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false,
      spellcheck: false
    }
  });

  applyAlwaysOnTopOverlay(mainWindow);

  try {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch {}

  // Never allow stray secondary popup BrowserWindows; route safe external URLs to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openSafeExternalUrl(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    const devUrl = process.env.ELECTRON_RENDERER_URL;
    const isInternalFile = targetUrl.startsWith('file://');
    const isAllowedDev = Boolean(devUrl && targetUrl.startsWith(devUrl));
    if (!isInternalFile && !isAllowedDev) {
      event.preventDefault();
      openSafeExternalUrl(targetUrl);
    }
  });

  // Intercept close button / Alt+F4 to hide cleanly to Windows System Tray unless quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting && !isSmokeTest) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const devRendererUrl = process.env.ELECTRON_RENDERER_URL;
  if (devRendererUrl) {
    mainWindow.loadURL(devRendererUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Fallback reveal if renderer IPC hasn't already revealed the compact Smart Notch
  mainWindow.webContents.once('did-finish-load', () => {
    if (!startHidden) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
          showNotchWindow(false);
        }
      }, 450);
    }

    if (isSmokeTest) {
      setTimeout(async () => {
        try {
          const allWindows = BrowserWindow.getAllWindows();
          const bounds = mainWindow.getBounds();
          const domState = await mainWindow.webContents.executeJavaScript(`({
            hasElectronAPI: Boolean(window.electronAPI && window.electronAPI.isElectron),
            hasNodeProcess: typeof window.process !== 'undefined',
            hasNodeRequire: typeof window.require !== 'undefined',
            pillExists: Boolean(document.querySelector('#nova-notch-container')),
            bg: getComputedStyle(document.body).backgroundColor
          })`);
          console.log(
            'ELECTRON_SMOKE_RESULT:' +
              JSON.stringify({
                windowCount: allWindows.length,
                bounds,
                alwaysOnTop: mainWindow.isAlwaysOnTop(),
                visible: mainWindow.isVisible(),
                domState
              })
          );
          isQuitting = true;
          app.exit(0);
        } catch (err) {
          console.error('ELECTRON_SMOKE_ERROR:', err);
          app.exit(1);
        }
      }, 900);
    }
  });
}

// Guard against any unexpected secondary BrowserWindow creation
app.on('browser-window-created', (_event, createdWindow) => {
  if (mainWindow && createdWindow !== mainWindow) {
    createdWindow.destroy();
  }
});

app.on('second-instance', (_event, commandLine) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  showNotchWindow(false);
  const protocolArg = commandLine.find((arg) => typeof arg === 'string' && arg.startsWith('nova://'));
  if (protocolArg) {
    handleProtocolUrl(protocolArg);
  }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleProtocolUrl(url);
});

app.whenReady().then(() => {
  // Register nova:// custom protocol when running unpackaged or via NSIS installer
  if (!process.windowsStore) {
    try {
      if (process.defaultApp && process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('nova', process.execPath, [path.resolve(process.argv[1])]);
      } else {
        app.setAsDefaultProtocolClient('nova');
      }
    } catch {}
  }

  // Enable native desktop screen capture & recording via getDisplayMedia in Electron
  try {
    session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
      try {
        const sources = await desktopCapturer.getSources({ types: ['screen'] });
        if (sources.length > 0) {
          callback({ video: sources[0], audio: 'loopback' });
        } else {
          callback({});
        }
      } catch {
        callback({});
      }
    });
  } catch {}

  registerIpcHandlers();
  createSmartNotchWindow();
  setupSystemTray();

  // Register global keyboard shortcut (Alt+N) to toggle Smart Notch from anywhere in Windows
  try {
    globalShortcut.register('Alt+N', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (!mainWindow.isVisible()) {
        showNotchWindow(true);
        mainWindow.webContents.send('nova:toggle-expand');
      } else {
        mainWindow.webContents.send('nova:toggle-expand');
      }
    });
  } catch {}

  // Re-clamp Smart Notch if monitor resolution / DPI / display topology changes
  const handleDisplayChange = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const current = mainWindow.getBounds();
    const next = computeNotchBounds(mainWindow, current.width, current.height, false);
    mainWindow.setBounds(next, false);
  };
  screen.on('display-metrics-changed', handleDisplayChange);
  screen.on('display-added', handleDisplayChange);
  screen.on('display-removed', handleDisplayChange);
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll();
  } catch {}
});

app.on('window-all-closed', () => {
  if (isQuitting || isSmokeTest) {
    app.quit();
  }
});
