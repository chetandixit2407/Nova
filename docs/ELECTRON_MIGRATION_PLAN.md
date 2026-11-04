# NOVA NOTCH — Tauri 2 to Electron Migration Plan & MSIX Store Specification

## 1. Executive Summary
This document outlines the complete migration of **NOVA NOTCH** (`ChetanDixit.NOVANOTCH`, version `1.0.2.0`) from **Tauri 2 (Rust + WebView2)** to **Electron (Main + Sandboxed Preload + Chromium/Vite React Renderer)** while preserving 100% of the existing Dynamic Island UI, spring physics animations, compact startup behavior, system tray integration, and Microsoft Store MSIX identity.

---

## 2. Tauri-Specific Features Identified & Electron Replacements

| # | Area | Existing Tauri 2 Implementation | Electron Replacement |
|---|---|---|---|
| 1 | **Desktop Runtime & Entry** | `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`, `src-tauri/tauri.conf.json` | `electron/main.cjs` (Main Process), `electron/preload.cjs` (Preload), `electron-builder.json` |
| 2 | **ACL / IPC Security** | `src-tauri/capabilities/default.json` + `withGlobalTauri: true` (`window.__TAURI__`) | `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, and allowlisted `contextBridge.exposeInMainWorld('electronAPI', ...)` |
| 3 | **Frameless Transparent Notch Window** | Tauri `WebviewWindow` (`150x64`, `transparent: true`, `decorations: false`, `alwaysOnTop: true`, `skipTaskbar: true`, `visible: false`) + `WEBVIEW2_DEFAULT_BACKGROUND_COLOR=0` | Electron `BrowserWindow` (`width: 150`, `height: 64`, `frame: false`, `transparent: true`, `backgroundColor: '#00000000'`, `hasShadow: false`, `resizable: false`, `alwaysOnTop: true` at `'screen-saver'` level, `skipTaskbar: true`, `show: false` until initial sync) |
| 4 | **Dynamic Expand/Collapse & Drag Positioning** | Rust commands `sync_notch_window`, `move_notch_window`, `reset_notch_window`, `toggle_notch_visibility` using `PhysicalSize` / `PhysicalPosition` | `ipcMain.handle` channels (`notch:sync-window`, `notch:move-window`, `notch:reset-window`, `notch:toggle-visibility`) using Electron DIP coordinates (`screen.getDisplayMatching`, `win.setBounds`) for crisp Per-Monitor DPI v2 scaling |
| 5 | **System Tray & Background Lifecycle** | `TrayIconBuilder` + `MenuBuilder` (`toggle`, `settings` emitting `open-tab`, `quit`) | Electron `Tray` + `Menu.buildFromTemplate` (left-click toggle, `NOVA Preferences...` sending `nova:open-tab`, `Reset Notch Position`, `Launch at Windows Startup`, `Exit NOVA NOTCH`) + hide-to-tray close lifecycle |
| 6 | **Global Hotkeys** | `tauri-plugin-global-shortcut` | Electron `globalShortcut.register('Alt+N', ...)` with clean unregister on `will-quit` |
| 7 | **Windows Startup (Autostart)** | `tauri-plugin-autostart` + `desktop:StartupTask` in `AppxManifest.xml` | Electron `app.getLoginItemSettings()` / `app.setLoginItemSettings()` via IPC (`autostart:get`, `autostart:set`) + MSIX `desktop:StartupTask` (`NOVAStartupTask`) extension |
| 8 | **External Links & App Launcher** | `tauri-plugin-shell` (`plugin:shell|open`) + `installedAppsService.ts` `__TAURI__` checks + `window.open` guard | `shell.openExternal` (validated `https:`/`http:`/`mailto:` & registered Windows URI protocols), `shell.openPath` for local apps/folders via `apps:launch` IPC, and `webContents.setWindowOpenHandler` denying stray popup windows |
| 9 | **Native Notifications** | `tauri-plugin-notification` + Web `Notification` API | Electron Main `Notification` (`notifications:send` IPC) bound to `app.setAppUserModelId('ChetanDixit.NOVANOTCH')` |
| 10 | **System Clipboard** | `tauri-plugin-clipboard-manager` + `navigator.clipboard` | Electron `clipboard` (`clipboard:read-text`, `clipboard:write-text`, `clipboard:clear` IPC) with renderer fallback |
| 11 | **Screen Capture & Recording** | Web `navigator.mediaDevices.getDisplayMedia` in WebView2 | Electron `session.defaultSession.setDisplayMediaRequestHandler` backed by `desktopCapturer.getSources({ types: ['screen'] })` so `captureScreen()` and `startScreenRecording()` work natively |
| 12 | **Custom URI Protocol (`nova://`)** | `AppxManifest.xml` `uap:Protocol` | `app.setAsDefaultProtocolClient('nova')` + `second-instance` handler + MSIX `uap:Protocol Name="nova"` |
| 13 | **MSIX Packaging & CI/CD** | `cargo tauri build --bundles msix`, `src-tauri/AppxManifest.xml`, `scripts/build-msix.ps1`, `.github/workflows/store-release.yml` | `electron-builder` (`msix` / `appx` + `nsis` targets), `build/appx/` visual assets & manifest extensions, updated `scripts/build-msix.ps1`, and updated `.github/workflows/store-release.yml` |

---

## 3. Security Architecture
1. **Renderer Isolation**:
   - `contextIsolation: true`
   - `nodeIntegration: false`
   - `sandbox: true`
   - `webSecurity: true`
2. **Allowlisted Preload Bridge (`electron/preload.cjs`)**:
   - Exposes a narrow, typed `window.electronAPI` object via `contextBridge.exposeInMainWorld`.
   - Never exposes raw `ipcRenderer`, `require`, `process`, or `Buffer` objects to the renderer.
   - Event subscriptions (`onOpenTab`) strip the raw `IpcRendererEvent` object and pass only the validated tab string payload with an unsubscribe disposer.
3. **Main Process Validation (`electron/main.cjs`)**:
   - Clamps window dimensions and screen coordinates to valid finite integer ranges.
   - Restricts `shell:open-external` strictly to safe allowlisted URI schemes.
   - Blocks unexpected navigation (`will-navigate`) and popup window creation (`setWindowOpenHandler`).

---

## 4. Microsoft Store MSIX Capabilities & `runFullTrust` Approval Process

### Preserved Store Identity
- **Identity Name**: `ChetanDixit.NOVANOTCH`
- **Publisher**: `CN=1635A490-94F8-403E-9B36-79A1AE02E253`
- **Publisher Display Name**: `Chetan Dixit`
- **Product Name**: `NOVA NOTCH`
- **Package Version**: `1.0.2.0` (`package.json` SemVer `1.0.2` + `buildVersion: "1.0.2.0"`)

### Exact MSIX Manifest Capabilities Required by Electron
```xml
<Capabilities>
  <Capability Name="internetClient" />
  <rescap:Capability Name="runFullTrust" />
</Capabilities>
```
1. **`rescap:runFullTrust` (Required Restricted Capability — Do NOT Remove)**:
   - Every Electron Windows application packaged as MSIX uses the Windows Desktop Bridge (`EntryPoint="Windows.FullTrustApplication"`).
   - Electron's Chromium + Node.js multi-process architecture spawns GPU, renderer, and utility child processes via Win32 job objects, uses DWM layered frameless window compositing for the transparent Smart Notch pill, registers a Win32 System Tray icon (`Shell_NotifyIcon`), and binds global hotkeys (`RegisterHotKey`).
   - Stripping `runFullTrust` breaks process creation and prevents Windows from launching the packaged MSIX executable.
2. **`internetClient` (Standard Capability)**:
   - Declares outbound client HTTPS access for weather forecasts, currency exchange rates, and web integrations.
3. **No Unnecessary Restricted Capabilities**:
   - Capabilities such as `broadFileSystemAccess`, `allowElevation`, `unvirtualizedResources`, and `modifiableApp` are intentionally **omitted** so only the standard Desktop Bridge `runFullTrust` declaration is reviewed.

### Correct Microsoft Partner Center Approval Process for `runFullTrust`
1. **Upload the `.msix` / `.appx` Package**: Upload the `1.0.2.0` package in **Microsoft Partner Center → Apps and games → NOVA → Packages**.
2. **Navigate to Submission Options**: Partner Center will display a restricted capability notice for `runFullTrust`. Open **Submission options** (and **Notes for certification**).
3. **Provide the Technical Justification**: Enter a concise, accurate explanation of why `runFullTrust` is required:
   > *"NOVA NOTCH is built with the Electron framework and packaged via Windows Desktop Bridge (`Windows.FullTrustApplication`). It requires `runFullTrust` to run Electron's multi-process Chromium runtime, render a frameless always-on-top transparent desktop notch overlay, provide a Windows System Tray icon, and register user-Initiated global keyboard shortcuts (`Alt+N`). The app runs with standard user privileges, never requests elevation, and stores configuration within standard user app data."*
4. **Certification Persistence**: Once approved by Microsoft Store reviewers on the initial Desktop Bridge submission for `ChetanDixit.NOVANOTCH`, `runFullTrust` approval persists automatically across future `1.0.x` / `1.x` updates unless new restricted capabilities are introduced.

---

## 5. Execution Sequence
1. Copy Store icon assets (`StoreLogo.png`, `Square150x150Logo.png`, `Square44x44Logo.png`, `Wide310x150Logo.png`, `icon.ico`) into `build/` and `build/appx/`.
2. Install `electron` and `electron-builder` and verify exact MSIX builder schema.
3. Implement `electron/main.cjs`, `electron/preload.cjs`, `electron-builder.json`, and `build/appx/AppxManifest.xml` (template/extensions).
4. Migrate frontend services (`systemService.ts`, `installedAppsService.ts`, `NotchContext.tsx`, `NotchRoot.tsx`, `NotchSettingsTab.tsx`, `MicrosoftStoreModal.tsx`) to use typed `window.electronAPI` exclusively while keeping AI Studio / browser preview compatibility intact.
5. Update `package.json` (`version: "1.0.2"`, `main: "electron/main.cjs"`, Electron dev/build/pack scripts), `scripts/build-msix.ps1`, `.github/workflows/store-release.yml`, and `docs/MICROSOFT_STORE_GUIDE.md`.
6. Test the Electron Main + Preload + Renderer startup, IPC round-trips, and production build.
7. Remove `src-tauri/` and verify zero remaining Tauri dependencies or code references.
