import React from 'react';
import {
  Code,
  Terminal,
  Music,
  Globe,
  Folder,
  Activity,
  Calculator,
  Sparkles,
  Download,
  ShieldCheck,
  Coffee
} from 'lucide-react';

interface AppIconBadgeProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const AppIconBadge: React.FC<AppIconBadgeProps> = ({
  name,
  size = 'md',
  glow = true
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  const lower = name.toLowerCase();

  // VS Code
  if (lower.includes('code') || lower.includes('vs')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#007acc] to-[#005a9e] flex items-center justify-center text-white shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(0,122,204,0.5)]' : ''
        }`}
        title="Visual Studio Code"
      >
        <Code className={iconSizes} />
      </div>
    );
  }

  // Windows Terminal
  if (lower.includes('terminal') || lower.includes('powershell')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#1e1e1e] to-[#0c0c0c] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' : ''
        }`}
        title="Windows Terminal"
      >
        <Terminal className={iconSizes} />
      </div>
    );
  }

  // Spotify
  if (lower.includes('spotify') || lower.includes('music')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#1db954] to-[#128a3c] flex items-center justify-center text-black font-bold shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(29,185,84,0.5)]' : ''
        }`}
        title="Spotify Music"
      >
        <Music className={iconSizes} />
      </div>
    );
  }

  // Microsoft Edge / Browser
  if (lower.includes('edge') || lower.includes('browser') || lower.includes('chrome')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#0078d7] via-[#00c8ff] to-[#00a2ed] flex items-center justify-center text-white shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(0,120,215,0.5)]' : ''
        }`}
        title="Microsoft Edge"
      >
        <Globe className={iconSizes} />
      </div>
    );
  }

  // File Explorer
  if (lower.includes('explorer') || lower.includes('folder')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#ffb900] to-[#f78200] flex items-center justify-center text-white shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(255,185,0,0.5)]' : ''
        }`}
        title="File Explorer"
      >
        <Folder className={iconSizes} />
      </div>
    );
  }

  // Task Manager
  if (lower.includes('task') || lower.includes('system') || lower.includes('performance')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-[#00a4ef] to-[#0078d4] flex items-center justify-center text-white shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(0,164,239,0.5)]' : ''
        }`}
        title="Task Manager"
      >
        <Activity className={iconSizes} />
      </div>
    );
  }

  // Calculator
  if (lower.includes('calc')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-sky-400 to-cyan-600 flex items-center justify-center text-white shrink-0 shadow-md ${
          glow ? 'shadow-[0_0_12px_rgba(56,189,248,0.5)]' : ''
        }`}
        title="Calculator"
      >
        <Calculator className={iconSizes} />
      </div>
    );
  }

  // Download
  if (lower.includes('download')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md`}
      >
        <Download className={iconSizes} />
      </div>
    );
  }

  // Install
  if (lower.includes('install')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md`}
      >
        <ShieldCheck className={iconSizes} />
      </div>
    );
  }

  // Focus
  if (lower.includes('coffee') || lower.includes('focus')) {
    return (
      <div
        className={`${sizeClasses} rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0 shadow-md`}
      >
        <Coffee className={iconSizes} />
      </div>
    );
  }

  // Default NOVA Sparkles
  return (
    <div
      className={`${sizeClasses} rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md`}
    >
      <Sparkles className={iconSizes} />
    </div>
  );
};
