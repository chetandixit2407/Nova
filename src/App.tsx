import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';
import { WindowsDesktop } from './components/desktop/WindowsDesktop';

const MainLayout: React.FC = () => {
  const { isExpanded, collapseNotch } = useNotch();
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 select-none">
      {/* Simulated Windows 11 Desktop environment when running in web browser */}
      {!isElectron && <WindowsDesktop />}

      {/* Backdrop click handler to collapse notch when clicked outside while expanded */}
      {isExpanded && (
        <div
          onClick={collapseNotch}
          className="fixed inset-0 z-30 pointer-events-auto bg-transparent"
          aria-hidden="true"
        />
      )}

      {/* Compact-first Dynamic Smart Notch */}
      <NotchRoot />

      {/* Notification Toast Center (renders only when active secondary toasts exist) */}
      <NotchToastCenter />
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
