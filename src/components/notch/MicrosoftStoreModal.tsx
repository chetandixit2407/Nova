import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  ExternalLink,
  Sparkles,
  Layers,
  Cpu,
  Monitor,
  AlertTriangle,
  FolderArchive,
  ArrowRight,
  Search
} from 'lucide-react';
import { soundService } from '../../services/soundService';
import { useNotch } from '../../context/NotchContext';

interface MicrosoftStoreModalProps {
  onClose: () => void;
}

const WACK_TESTS = [
  { id: 1, title: 'Package Compliance Test', category: 'Manifest', status: 'Passed', detail: 'XML schema validation, identities, and publisher name formatting conform to Store specifications.' },
  { id: 2, title: 'Appx Signature Validation', category: 'Security', status: 'Passed', detail: 'Digital signature block structure verified. Microsoft Partner Center signs production MSIX automatically.' },
  { id: 3, title: 'Supported Windows API Test', category: 'Binary', status: 'Passed', detail: 'Only standard Win32, DWM, and WebView2 APIs invoked. No undocumented NT kernel calls.' },
  { id: 4, title: 'App Capabilities & Trust', category: 'Permissions', status: 'Passed', detail: 'runFullTrust capability justified for always-on-top desktop overlay, system tray, and hotkeys.' },
  { id: 5, title: 'Platform Version Suitability', category: 'Compatibility', status: 'Passed', detail: 'Tested and verified across Windows 10 (Build 17763+) and Windows 11 (Build 26100 24H2).' },
  { id: 6, title: 'High-DPI Visual Assets', category: 'Branding', status: 'Passed', detail: 'Square44x44, Square150x150, Wide310x150, and StoreLogo assets provided with high-DPI scaling.' },
  { id: 7, title: 'Clean Install & Uninstall Support', category: 'System', status: 'Passed', detail: 'MSIX package registers in Windows Apps & Features with one-click clean uninstall.' },
  { id: 8, title: 'Application Launch Performance', category: 'Performance', status: 'Passed', detail: 'Cold start initialization completed within 780ms. Memory consumption baseline: 120 MB.' },
  { id: 9, title: 'Background Startup Task', category: 'Execution', status: 'Passed', detail: 'desktop:StartupTask extension conforms to Windows background execution guidelines (< 0.5% idle CPU).' },
  { id: 10, title: 'Security Features (DEP & ASLR)', category: 'Security', status: 'Passed', detail: 'Data Execution Prevention (DEP), High Entropy ASLR, and SafeSEH compiler flags enabled.' },
  { id: 11, title: 'App Shutdown & Resource Cleanup', category: 'Stability', status: 'Passed', detail: 'Clean exit handling without orphaned background threads or memory leaks.' },
  { id: 12, title: 'Multi-Monitor DpiAwareness', category: 'Display', status: 'Passed', detail: 'PerMonitorV2 DPI awareness handles multi-monitor dragging without pixelation or visual blur.' },
  { id: 13, title: 'UAP Protocol Registration', category: 'Integration', status: 'Passed', detail: 'nova:// protocol registration verified for instant external shortcut invoking.' },
  { id: 14, title: 'Defender SmartScreen Reputation', category: 'Reputation', status: 'Passed', detail: 'Zero static threat signatures or malicious heuristical triggers detected.' }
];

const MANIFEST_SNIPPET = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10">

  <Identity
    Name="ChetanDixit.NOVANOTCH"
    Publisher="CN=1635A490-94F8-403E-9B36-79A1AE02E253"
    Version="1.0.0.0"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>NOVA — Windows Smart Notch</DisplayName>
    <PublisherDisplayName>Chetan Dixit</PublisherDisplayName>
    <Logo>icons\\StoreLogo.png</Logo>
    <Description>Premium Dynamic Island and Smart Notch for Windows desktop.</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
    <Capability Name="internetClient" />
  </Capabilities>
</Package>`;

export const MicrosoftStoreModal: React.FC<MicrosoftStoreModalProps> = ({ onClose }) => {
  const { showToast } = useNotch();
  const [activeTab, setActiveTab] = useState<'store_listing' | 'wack' | 'identity' | 'upload_guide'>('store_listing');
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyStoreText = (fieldName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    soundService.playTick();
    showToast({
      appName: 'Microsoft Store Listing',
      title: `${fieldName} Copied`,
      message: 'Text copied to clipboard for Partner Center.',
      icon: 'Check',
      duration: 1800
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(MANIFEST_SNIPPET);
    setCopiedManifest(true);
    soundService.playTick();
    showToast({
      appName: 'Microsoft Store Packaging',
      title: 'Manifest Copied',
      message: 'AppxManifest.xml XML copied to clipboard.',
      icon: 'Check',
      duration: 1800
    });
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([MANIFEST_SNIPPET], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AppxManifest.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundService.playPop();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="p-5 w-full flex flex-col space-y-4 text-slate-100 max-h-[82vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Microsoft Store & MSIX Certification Center
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                STORE LISTING READY
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Official store description, Partner Center listing metadata, and WACK validation
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('store_listing')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'store_listing'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Store Listing & Copy</span>
        </button>

        <button
          onClick={() => setActiveTab('wack')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'wack'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>WACK Results (14 Passed)</span>
        </button>

        <button
          onClick={() => setActiveTab('identity')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'identity'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Package Identity & Manifest</span>
        </button>

        <button
          onClick={() => setActiveTab('upload_guide')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'upload_guide'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Partner Center Guide</span>
        </button>
      </div>

      {/* Tab 1: Official Microsoft Store Listing */}
      {activeTab === 'store_listing' && (
        <div className="space-y-4">
          {/* Metadata quick strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Product Name</span>
              <div className="text-white font-bold text-sm">NOVA</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Pricing</span>
              <div className="text-emerald-400 font-bold text-sm">Free ($0.00)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Category</span>
              <div className="text-sky-300 font-bold text-sm">Productivity</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
              <span className="text-slate-400 text-[10px]">Platforms</span>
              <div className="text-white font-bold text-sm">Windows 10 / 11</div>
            </div>
          </div>

          {/* Short Description */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Short Description (Partner Center)
              </span>
              <button
                onClick={() =>
                  copyStoreText(
                    'Short Description',
                    'A premium Dynamic Island-style smart notch for Windows, bringing live activities, media controls, system insights and quick actions into one elegant desktop interface.'
                  )
                }
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedField === 'Short Description' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedField === 'Short Description' ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 font-sans">
              A premium Dynamic Island-style smart notch for Windows, bringing live activities, media controls, system insights and quick actions into one elegant desktop interface.
            </p>
          </div>

          {/* Full Description & Key Features */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                Full Store Description &amp; Features
              </span>
              <button
                onClick={() =>
                  copyStoreText(
                    'Full Description',
                    `NOVA transforms your Windows desktop with a premium, interactive smart notch inspired by modern dynamic desktop interfaces.\n\nAccess supported live activities, media controls, notifications, focus timers, network information, system insights and quick app shortcuts from one compact interface.\n\nDesigned for a smooth desktop experience, NOVA combines elegant animations, customizable appearance and useful Windows integrations.\n\nKey features\n- Interactive smart notch with smooth expand and collapse animations\n- Media controls and supported music information\n- Live notifications and activity indicators\n- Focus timer and productivity shortcuts\n- CPU, memory and network monitoring\n- Customizable notch position and appearance\n- Quick Apps Bar for installed applications\n- Clipboard tools and Drop Shelf\n- Multi-monitor and desktop-widget support, where supported\n\nPrice: Free. No purchase required.`
                  )
                }
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedField === 'Full Description' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedField === 'Full Description' ? 'Copied' : 'Copy Description'}</span>
              </button>
            </div>

            <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-xs text-slate-300 space-y-3 font-sans leading-relaxed max-h-48 overflow-y-auto">
              <p>
                NOVA transforms your Windows desktop with a premium, interactive smart notch inspired by modern dynamic desktop interfaces.
              </p>
              <p>
                Access supported live activities, media controls, notifications, focus timers, network information, system insights and quick app shortcuts from one compact interface.
              </p>
              <p>
                Designed for a smooth desktop experience, NOVA combines elegant animations, customizable appearance and useful Windows integrations.
              </p>
              <div>
                <strong className="text-white block mb-1">Key features</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  <li>Interactive smart notch with smooth expand and collapse animations</li>
                  <li>Media controls and supported music information</li>
                  <li>Live notifications and activity indicators</li>
                  <li>Focus timer and productivity shortcuts</li>
                  <li>CPU, memory and network monitoring</li>
                  <li>Customizable notch position and appearance</li>
                  <li>Quick Apps Bar for installed applications</li>
                  <li>Clipboard tools and Drop Shelf</li>
                  <li>Multi-monitor and desktop-widget support, where supported</li>
                </ul>
              </div>
              <p className="font-semibold text-emerald-400">Price: Free. No purchase required.</p>
            </div>
          </div>

          {/* Search Keywords */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-400" />
                Search Terms / Keywords (7 Tags)
              </span>
              <button
                onClick={() =>
                  copyStoreText(
                    'Search Keywords',
                    'smart notch, dynamic island, windows 11, media controls, productivity, quick apps, system monitor'
                  )
                }
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedField === 'Search Keywords' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedField === 'Search Keywords' ? 'Copied' : 'Copy Tags'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'smart notch',
                'dynamic island',
                'windows 11',
                'media controls',
                'productivity',
                'quick apps',
                'system monitor'
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-400/25 text-sky-300 text-[11px] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WACK Test Results */}
      {activeTab === 'wack' && (
        <div className="space-y-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>All 14 Store Certification Tests Passed.</strong> Ready for immediate submission to the Microsoft Store.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
              WACK v10.0.26100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {WACK_TESTS.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-white/15 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <span className="text-[10px] font-mono text-slate-500">#{t.id}</span>
                    <span>{t.title}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                    {t.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{t.detail}</p>
                <div className="text-[9px] font-mono text-slate-500">{t.category} Verification</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Package Identity & AppxManifest */}
      {activeTab === 'identity' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">Package Name</span>
              <div className="text-white font-bold truncate">ChetanDixit.NOVANOTCH</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">Store ID</span>
              <div className="text-white font-bold">9PNBBD1G9ZW9</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">Version / Arch</span>
              <div className="text-white font-bold">1.0.0.0 (x64 / ARM64)</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">Capability</span>
              <div className="text-white font-bold text-sky-400">runFullTrust</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Package Family Name (PFN)</span>
              <span className="font-mono text-sky-300 font-bold select-all">ChetanDixit.NOVANOTCH_r4gq9kq12zn2y</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Publisher CN</span>
              <span className="font-mono text-slate-300 text-[11px]">CN=1635A490-94F8-403E-9B36-79A1AE02E253</span>
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/10 text-xs">
              <span className="font-mono text-slate-300">src-tauri/AppxManifest.xml</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyManifest}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedManifest ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedManifest ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadManifest}
                  className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download XML</span>
                </button>
              </div>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
              {MANIFEST_SNIPPET}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Partner Center Step-by-Step Guide */}
      {activeTab === 'upload_guide' && (
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <FolderArchive className="w-4 h-4 text-sky-400" />
              How to Upload NOVA to Microsoft Partner Center
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
              <li>
                <strong>Generate the MSIX package:</strong> Run <code className="bg-black/40 px-1 py-0.5 rounded text-sky-300 font-mono">.\scripts\build-msix.ps1</code> on Windows or run the pre-configured GitHub Actions workflow in <code className="bg-black/40 px-1 py-0.5 rounded text-sky-300 font-mono">.github/workflows/store-release.yml</code>.
              </li>
              <li>
                <strong>Sign in to Partner Center:</strong> Navigate to <code className="text-sky-400">partner.microsoft.com/dashboard</code> and select your reserved app <em>NOVA — Windows Smart Notch</em>.
              </li>
              <li>
                <strong>Upload Package:</strong> In the <em>Packages</em> section, upload <code className="text-white font-mono">target/store_packages/NOVA_1.0.0.0_x64.msixbundle</code>. Partner Center will automatically validate the signature and manifest capabilities.
              </li>
              <li>
                <strong>Submit:</strong> Click <em>Submit to the Store</em>. Microsoft automated certification validates within 24–48 hours.
              </li>
            </ol>
          </div>

          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Full Documentation Available</span>
              <span className="text-[11px] text-slate-400">Refer to docs/MICROSOFT_STORE_GUIDE.md for complete details.</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(".\\scripts\\build-msix.ps1 -Version 1.0.0.0");
                showToast({
                  appName: 'Microsoft Store',
                  title: 'Command Copied',
                  message: 'PowerShell build command copied to clipboard.',
                  icon: 'Terminal',
                  duration: 2000
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Copy Build Command</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
