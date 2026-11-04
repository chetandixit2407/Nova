# NOVA NOTCH — Microsoft Store Publication & Electron MSIX Packaging Guide

This guide details the complete process of packaging **NOVA NOTCH** (`v1.0.2.0`) with **Electron Builder**, certifying with the **Windows App Certification Kit (WACK)**, and submitting the MSIX package—including the required `runFullTrust` Desktop Bridge capability declaration—to the **Microsoft Store** via **Microsoft Partner Center**.

---

## 1. Preserved Microsoft Store Identity (`v1.0.2.0`)

The following verified Microsoft Partner Center identity values are configured across `electron-builder.json`, `package.json`, `scripts/build-msix.ps1`, and `.github/workflows/store-release.yml`:

| Field | Value in NOVA NOTCH Manifest | Notes |
|---|---|---|
| **Identity Name** | `ChetanDixit.NOVANOTCH` | Exact Partner Center `<Identity Name>` |
| **Product / Display Name** | `NOVA NOTCH` | Official Store & Start Menu title |
| **Publisher** | `CN=1635A490-94F8-403E-9B36-79A1AE02E253` | Exact Partner Center Publisher CN |
| **Publisher Display Name** | `Chetan Dixit` | Verified Publisher Display Name |
| **Package Version** | `1.0.2.0` | Quad-notation (`package.json` `1.0.2` + `buildVersion` `1.0.2.0`) |
| **Application Id** | `NOVAApp` | Preserved `<Application Id="NOVAApp">` |
| **Executable** | `app\nova.exe` | Electron Desktop Bridge EntryPoint (`Windows.FullTrustApplication`) |
| **Package Family Name** | `ChetanDixit.NOVANOTCH_r4gq9kq12zn2y` | Derived Windows PFN |
| **Store ID** | `9PNBBD1G9ZW9` | Official Microsoft Store Product ID |
| **Processor Architectures** | `x64` and `ARM64` | Windows 10 (Build 17763+) & Windows 11 |

Configuration files:
- `electron-builder.json` (`appx` target, Store identity, capabilities, visual assets)
- `build/appx/extensions.xml` (`desktop:StartupTask` background startup extension)
- `build/appx/*.png` (`StoreLogo.png`, `Square44x44Logo.png`, `Square150x150Logo.png`, `Wide310x150Logo.png`, `SplashScreen.png`)
- `scripts/build-msix.ps1` (Local PowerShell MSIX + MSIXBundle + WACK build pipeline)
- `.github/workflows/store-release.yml` (Automated GitHub Actions Windows MSIX build pipeline)

---

## 2. MSIX Manifest Capabilities Required by Electron

Electron applications packaged as MSIX run via the **Windows Desktop Bridge** (`EntryPoint="Windows.FullTrustApplication"`). Unlike UWP AppContainer apps, Chromium's multi-process sandbox, Win32 transparent layered `BrowserWindow` overlays (`WS_EX_LAYERED`, `alwaysOnTop`), system tray icons (`Shell_NotifyIcon`), and global keyboard shortcuts (`RegisterHotKey`) execute as Win32 desktop processes.

Accordingly, `electron-builder.json` declares **only the two exact capabilities required**:

```xml
<Capabilities>
  <Capability Name="internetClient" />
  <rescap:Capability Name="runFullTrust" />
</Capabilities>
```

1. **`internetClient`** *(Standard Capability)* — Required for outbound HTTPS requests (optional weather, exchange rates, lyrics, and cloud assistant endpoints). Requires no special Store approval.
2. **`rescap:runFullTrust`** *(Restricted Desktop Bridge Capability — Mandatory)* — Required by **every** Electron MSIX package because `Executable="app\nova.exe"` launches under `EntryPoint="Windows.FullTrustApplication"`. Removing `runFullTrust` causes `MakeAppx.exe`, Windows installation, and Store ingestion to fail immediately because Win32 Desktop Bridge executables cannot launch inside a pure UWP AppContainer.

> **Important Security Note:** No unnecessary or elevated restricted capabilities (`allowElevation`, `broadFileSystemAccess`, `unvirtualizedResources`, `packageManagement`, etc.) are declared. Execution level is strictly `asInvoker` with Electron renderer hardening (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).

---

## 3. Microsoft Partner Center `runFullTrust` Approval Process

Because `rescap:runFullTrust` is a Microsoft-reviewed restricted capability, follow these exact steps during your Partner Center submission:

1. Open [Microsoft Partner Center](https://partner.microsoft.com/dashboard/apps-and-games/overview) → **NOVA NOTCH** → Start/Update submission `1.0.2.0`.
2. Upload `NOVA-NOTCH-1.0.2.0-x64.msix` and `NOVA-NOTCH-1.0.2.0-arm64.msix` (or `NOVA-NOTCH_1.0.2.0_MultiArch.msixbundle`) in the **Packages** section.
   - Do **not** self-sign packages intended for Partner Center if you want clean validation without local cert warnings (`CSC_IDENTITY_AUTO_DISCOVERY=false` is set automatically in `build-msix.ps1` and CI); Microsoft Store signs the MSIX packages automatically upon certification.
3. Navigate to **Submission options** (or **Properties** → **Supplemental information / Notes for certification**, and the **Restricted capabilities** prompt automatically shown when Partner Center detects `runFullTrust` in `AppxManifest.xml`).
4. Provide a clear explanation of why `runFullTrust` is required and confirm that your app does not modify system-wide state outside its MSIX container or require administrator elevation:

   > **Ready-to-paste Partner Center Justification for `runFullTrust`:**
   > "NOVA NOTCH is a Windows desktop utility built with the Electron framework (Desktop Bridge / `Windows.FullTrustApplication`). The `runFullTrust` capability is required by Electron's Chromium multi-process architecture and Win32 desktop APIs to render a frameless, transparent, always-on-top Smart Notch overlay at the top edge of the primary display, register a Windows System Tray icon (`Tray`), listen for the user-configurable `Alt+N` toggle shortcut, and register an optional user-controllable `desktop:StartupTask` (`NOVAStartupTask`). The application runs strictly at standard user privilege (`asInvoker`), enforces renderer sandboxing (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`), does not bundle third-party installers or auto-updaters outside the Microsoft Store, and stores all configuration cleanly within the packaged user profile container."

5. **Account Eligibility Note**: Individual and Company developer accounts in Partner Center are routinely approved for `runFullTrust` on standard Desktop Bridge apps (Electron, WPF, WinForms, WinUI 3) when the justification above is supplied in **Submission options → Notes for certification**. Ensure no external auto-update code (`electron-updater`) is included in the Store build (NOVA NOTCH intentionally excludes `electron-updater` so updates are delivered exclusively through the Microsoft Store).

---

## 4. How to Build the `.msix` / `.msixbundle` (`v1.0.2.0`)

### Option A: Quick NPM Script (Windows 10/11)
```powershell
npm install
npm run electron:msix
```
Outputs `release/NOVA-NOTCH-1.0.2.0-x64.msix` and `release/NOVA-NOTCH-1.0.2.0-arm64.msix`.

### Option B: Full PowerShell Pipeline with MSIXBundle & WACK
```powershell
.\scripts\build-msix.ps1 -Version "1.0.2.0"
```
This script:
1. Synchronizes `package.json` (`1.0.2`) and `electron-builder.json` (`1.0.2.0` + Partner Center Identity).
2. Builds the React + Vite frontend (`dist/`).
3. Invokes `electron-builder --win appx --x64 --arm64` to generate Store-ready MSIX packages.
4. Bundles x64 + ARM64 into `release/store_packages/NOVA-NOTCH_1.0.2.0_MultiArch.msixbundle` via `MakeAppx.exe`.
5. Executes `appcert.exe` (Windows App Certification Kit) and writes `WACK-Certification-Report.xml`.

### Option C: GitHub Actions CI/CD
Push a `v1.0.2` tag or trigger **Microsoft Store Multi-Arch Electron MSIX & WACK Certification** manually via `workflow_dispatch` in GitHub Actions to build and download `NOVA-NOTCH-Store-Packages-1.0.2.0`.
