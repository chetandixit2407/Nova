import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';
import { WindowsDesktop } from './components/desktop/WindowsDesktop';
import { Monitor, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { viewMode, setViewMode } = useNotch();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 select-none">
      {/* Dynamic Notch always mounted on top */}
      <NotchRoot />

      {/* Stacked Toast Notification Center within the Notch area */}
      <NotchToastCenter />

      {/* View Mode: Windows Desktop or Standalone Overlay */}
      {viewMode === 'desktop' ? (
        <WindowsDesktop />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 to-black text-center p-6">
          <div className="max-w-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              NOVA Smart Notch — Standalone Overlay Mode
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The notch is pinned to the top of your screen. Hover over the top center to reveal live activities, synthesizer media player, AI Hub, and system quick controls.
            </p>
            <div>
              <button
                onClick={() => setViewMode('desktop')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>Return to Windows 11 Desktop Sandbox</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <NotchProvider>
      <MainLayout />
    </NotchProvider>
  );
}
