import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';

const MainLayout: React.FC = () => {
  const { isExpanded, collapseNotch } = useNotch();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#06080e] via-[#0b101c] to-[#04060a] text-slate-100 select-none">
      {/* 1. Subtle ambient illumination behind the floating notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[680px] h-[260px] bg-sky-500/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[420px] h-[260px] bg-indigo-500/[0.03] blur-[110px] rounded-full pointer-events-none" />

      {/* 2. Backdrop click handler to collapse notch if clicked outside */}
      {isExpanded && (
        <div
          onClick={collapseNotch}
          className="fixed inset-0 z-30 pointer-events-auto bg-transparent"
          aria-hidden="true"
        />
      )}

      {/* 3. Dynamic Smart Notch (Draggable, hover-expanded App Launcher) */}
      <NotchRoot />

      {/* 4. Notification Toast Center */}
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
