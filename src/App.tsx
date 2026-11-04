import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';
import { WindowsDesktop } from './components/desktop/WindowsDesktop';

const MainLayout: React.FC = () => {
  const { viewMode, isExpanded, collapseNotch } = useNotch();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent text-slate-100 select-none pointer-events-none">
      {/* Click-outside backdrop to smoothly collapse notch in overlay mode */}
      {isExpanded && viewMode === 'overlay' && (
        <div
          onClick={collapseNotch}
          className="fixed inset-0 z-30 pointer-events-auto bg-transparent"
          aria-hidden="true"
        />
      )}

      {/* Dynamic Smart Notch pinned at the top-center */}
      <NotchRoot />

      {/* Stacked Toast Notification Center within the Notch area */}
      <NotchToastCenter />

      {/* Optional Windows Desktop Sandbox (accessible via Settings if explicitly enabled) */}
      {viewMode === 'desktop' && (
        <div className="pointer-events-auto w-full h-full">
          <WindowsDesktop />
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
