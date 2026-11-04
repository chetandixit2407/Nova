import React from 'react';
import { NotchProvider, useNotch } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { NotchToastCenter } from './components/notch/NotchToastCenter';

const MainLayout: React.FC = () => {
  const { isExpanded, collapseNotch } = useNotch();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent pointer-events-none text-slate-100 select-none">
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
