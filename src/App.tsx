import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';
import { WindowsDesktop } from './components/desktop/WindowsDesktop';

const MainLayout: React.FC = () => {
  const { isExpanded, collapseNotch } = useNotch();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 select-none">
      {/* 1. Underlying Windows 11 Desktop Experience with Wallpaper, Windows & Taskbar */}
      <WindowsDesktop />

      {/* 2. Click-outside backdrop to smoothly collapse notch when expanded */}
      {isExpanded && (
        <div
          onClick={collapseNotch}
          className="fixed inset-0 z-30 pointer-events-auto bg-transparent"
          aria-hidden="true"
        />
      )}

      {/* 3. Dynamic Smart Notch pinned at the top-center */}
      <NotchRoot />

      {/* 4. Stacked Toast Notification Center within the Notch area */}
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
