import React, { useState } from 'react';
import {
  X,
  Minus,
  Square,
  Code,
  Terminal as TerminalIcon,
  Globe,
  Folder,
  HardDrive,
  Download,
  FileText,
  Image as ImageIcon,
  Activity,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { windowActivityService, WindowsApp } from '../../services/windowActivityService';
import { audioEngine } from '../../services/audioEngine';

interface WindowsWindowManagerProps {
  openApps: string[];
  foregroundAppId: string | null;
  onClose: (appId: string) => void;
  onMinimize: (appId: string) => void;
  onFocus: (appId: string) => void;
}

export const WindowsWindowManager: React.FC<WindowsWindowManagerProps> = ({
  openApps,
  foregroundAppId,
  onClose,
  onMinimize,
  onFocus
}) => {
  // Terminal state
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Windows PowerShell',
    'Copyright (C) Microsoft Corporation. All rights reserved.',
    '',
    'PS C:\\Users\\Nova\\Project> nova status',
    '[OK] NOVA Dynamic Island daemon active.',
    '[OK] 60 FPS spring physics pipeline running.',
    ''
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  // VS Code active tab
  const [activeCodeTab, setActiveCodeTab] = useState<'App.tsx' | 'NotchRoot.tsx' | 'index.css'>('App.tsx');

  // Edge browser URL
  const [edgeUrl, setEdgeUrl] = useState<string>('https://gemini.google.com');

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newLines = [...terminalLines, `PS C:\\Users\\Nova\\Project> ${terminalInput}`];

    if (cmd === 'clear' || cmd === 'cls') {
      setTerminalLines(['PS C:\\Users\\Nova\\Project> ']);
      setTerminalInput('');
      return;
    } else if (cmd === 'help') {
      newLines.push('Available commands: systeminfo, ping, dir, ver, nova status, cls');
    } else if (cmd === 'systeminfo') {
      newLines.push('OS Name:                   Microsoft Windows 11 Pro 64-bit');
      newLines.push('System Model:              NOVA Fluent Workstation');
      newLines.push('Total Physical Memory:     16,384 MB');
      newLines.push('Processor(s):              8 Virtual Cores @ 3.40 GHz');
    } else if (cmd.startsWith('ping')) {
      newLines.push('Pinging 127.0.0.1 with 32 bytes of data:');
      newLines.push('Reply from 127.0.0.1: bytes=32 time<1ms TTL=128');
      newLines.push('Reply from 127.0.0.1: bytes=32 time<1ms TTL=128');
      newLines.push('Ping statistics: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)');
    } else if (cmd === 'dir' || cmd === 'ls') {
      newLines.push(' Mode                 LastWriteTime         Length Name');
      newLines.push(' ----                 -------------         ------ ----');
      newLines.push(' d----          11/03/2026  09:20 AM                src');
      newLines.push(' d----          11/03/2026  09:20 AM                public');
      newLines.push(' -a---          11/03/2026  09:20 AM           887  package.json');
      newLines.push(' -a---          11/03/2026  09:20 AM          1024  vite.config.ts');
    } else if (cmd === 'ver') {
      newLines.push('Microsoft Windows [Version 10.0.26100.1742]');
    } else {
      newLines.push(`'${terminalInput}' is recognized. Command executed successfully.`);
    }

    setTerminalLines(newLines);
    setTerminalInput('');
  };

  const codeSnippets = {
    'App.tsx': `import React from 'react';
import { NotchProvider } from './context/NotchContext';
import { NotchRoot } from './components/notch/NotchRoot';
import { WindowsDesktop } from './components/desktop/WindowsDesktop';

export default function App() {
  return (
    <NotchProvider>
      <div className="relative w-screen h-screen bg-black overflow-hidden">
        <NotchRoot />
        <WindowsDesktop />
      </div>
    </NotchProvider>
  );
}`,
    'NotchRoot.tsx': `export const NotchRoot: React.FC = () => {
  const { isExpanded, config } = useNotch();
  
  // iPhone Dynamic Island multi-activity spring transitions
  return (
    <motion.div
      animate={{ width: targetWidth, height: targetHeight }}
      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
      className="backdrop-blur-2xl rounded-3xl"
    >
      {isExpanded ? <NotchExpandedDashboard /> : <NotchCompactPill />}
    </motion.div>
  );
};`,
    'index.css': `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --notch-glow: rgba(56, 189, 248, 0.4);
}`
  };

  return (
    <>
      {openApps.map((appId, index) => {
        const isFg = foregroundAppId === appId;
        const app = windowActivityService.getApp(appId);
        if (!app || app.status === 'closed' || app.status === 'minimized') return null;

        // Stagger positions slightly for multiple windows
        const offsetLeft = 40 + (index % 4) * 28;
        const offsetTop = 75 + (index % 4) * 24;

        return (
          <div
            key={appId}
            onMouseDown={() => onFocus(appId)}
            style={{
              left: `${offsetLeft}px`,
              top: `${offsetTop}px`,
              zIndex: isFg ? 35 : 20 + index
            }}
            className={`absolute w-[660px] max-w-[92vw] max-h-[76vh] flex flex-col rounded-2xl overflow-hidden border transition-all duration-150 select-none ${
              isFg
                ? 'bg-slate-900/95 border-sky-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_24px_rgba(56,189,248,0.15)]'
                : 'bg-slate-900/80 border-white/10 shadow-xl opacity-90'
            } backdrop-blur-2xl`}
          >
            {/* Windows 11 Title Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-black/40 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {appId === 'vscode' && <Code className="w-4 h-4 text-sky-400" />}
                {appId === 'terminal' && <TerminalIcon className="w-4 h-4 text-emerald-400" />}
                {appId === 'spotify' && <Music className="w-4 h-4 text-emerald-400" />}
                {appId === 'edge' && <Globe className="w-4 h-4 text-blue-400" />}
                {appId === 'explorer' && <Folder className="w-4 h-4 text-amber-400" />}
                {appId === 'taskmgr' && <Activity className="w-4 h-4 text-cyan-400" />}
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {app.windowTitle}
                </span>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMinimize(appId);
                  }}
                  className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Minimize"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Maximize"
                >
                  <Square className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(appId);
                  }}
                  className="p-1.5 hover:bg-rose-500 hover:text-white text-slate-400 rounded-md transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 overflow-y-auto">
              {/* 1. VISUAL STUDIO CODE WINDOW */}
              {appId === 'vscode' && (
                <div className="flex flex-col h-[380px] bg-[#1e1e1e] text-slate-200 font-mono text-xs">
                  {/* File Tabs */}
                  <div className="flex items-center bg-[#252526] border-b border-[#333333] px-2">
                    {(['App.tsx', 'NotchRoot.tsx', 'index.css'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveCodeTab(tab)}
                        className={`flex items-center gap-2 px-3 py-1.5 border-r border-[#333333] cursor-pointer text-xs ${
                          activeCodeTab === tab
                            ? 'bg-[#1e1e1e] text-sky-400 border-t-2 border-t-sky-400 font-semibold'
                            : 'text-slate-400 hover:bg-[#2a2d2e]'
                        }`}
                      >
                        <Code className="w-3 h-3 text-sky-400" />
                        <span>{tab}</span>
                      </button>
                    ))}
                  </div>

                  {/* Code Editor Body */}
                  <div className="flex-1 p-4 overflow-auto font-mono text-[12px] leading-relaxed text-slate-300">
                    <pre className="text-sky-300">{codeSnippets[activeCodeTab]}</pre>
                  </div>

                  {/* VS Code Bottom Status Bar */}
                  <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-[10px] font-sans font-medium">
                    <div className="flex items-center gap-3">
                      <span>main*</span>
                      <span>0 errors, 0 warnings</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span>Ln 42, Col 18</span>
                      <span>UTF-8</span>
                      <span>TypeScript React</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WINDOWS TERMINAL / POWERSHELL */}
              {appId === 'terminal' && (
                <div className="flex flex-col h-[360px] bg-[#0c0c0c] text-emerald-400 font-mono text-xs p-4">
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {terminalLines.map((line, i) => (
                      <div key={i} className="whitespace-pre-wrap leading-relaxed">
                        {line}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                    <span className="text-white shrink-0 font-bold">PS C:\Users\Nova\Project&gt;</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Type a command (help, dir, systeminfo, ping)..."
                      className="flex-1 bg-transparent text-emerald-300 focus:outline-none font-mono text-xs"
                      autoFocus
                    />
                  </form>
                </div>
              )}

              {/* 3. SPOTIFY MUSIC WINDOW */}
              {appId === 'spotify' && (
                <div className="p-5 bg-gradient-to-b from-[#181818] to-[#121212] space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl"
                      style={{ background: audioEngine.getCurrentTrack().coverArt }}
                    >
                      <Music className="w-10 h-10" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        Playing on Windows Fluent
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                        {audioEngine.getCurrentTrack().title}
                      </h3>
                      <p className="text-xs text-slate-400">{audioEngine.getCurrentTrack().artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-2">
                    <button
                      onClick={() => audioEngine.previousTrack()}
                      className="p-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                    <button
                      onClick={() => audioEngine.toggle()}
                      className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-lg"
                    >
                      {audioEngine.getIsPlaying() ? (
                        <Pause className="w-5 h-5 fill-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => audioEngine.nextTrack()}
                      className="p-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              )}

              {/* 4. MICROSOFT EDGE BROWSER */}
              {appId === 'edge' && (
                <div className="flex flex-col h-[380px] bg-slate-950">
                  {/* Address bar */}
                  <div className="flex items-center gap-2 p-2 bg-slate-900 border-b border-white/10">
                    <button className="p-1 rounded text-slate-400 hover:text-white">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-slate-200">
                      <Search className="w-3 h-3 text-slate-500" />
                      <input
                        type="text"
                        value={edgeUrl}
                        onChange={(e) => setEdgeUrl(e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Browser viewport simulation */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-slate-900 to-black">
                    <Globe className="w-12 h-12 text-sky-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Google Gemini & Web Search</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Microsoft Edge secure sandboxed browser session active. Live browsing synced to NOVA Notch.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. TASK MANAGER */}
              {appId === 'taskmgr' && (
                <div className="p-4 bg-slate-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Processes (7 Active)</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Total CPU: 62% · RAM: 72%</span>
                  </div>

                  <div className="rounded-xl border border-white/10 overflow-hidden text-xs font-mono">
                    <div className="grid grid-cols-4 bg-white/5 p-2 font-bold text-slate-400 border-b border-white/10">
                      <span>Process Name</span>
                      <span>PID</span>
                      <span>CPU</span>
                      <span>Memory</span>
                    </div>
                    {windowActivityService.getAllApps().map((p) => (
                      <div
                        key={p.id}
                        className="grid grid-cols-4 p-2 border-b border-white/5 hover:bg-white/5 text-slate-300"
                      >
                        <span className="truncate text-white font-medium">{p.processName}</span>
                        <span className="text-slate-500">{1024 + p.id.length * 84}</span>
                        <span className="text-emerald-400">{p.status === 'running' ? `${p.cpuPercent}%` : '0%'}</span>
                        <span>{p.status === 'running' ? `${p.memoryMB} MB` : '0 MB'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. FILE EXPLORER */}
              {appId === 'explorer' && (
                <div className="p-4 space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Drives and System Storage
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                      <HardDrive className="w-8 h-8 text-sky-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Windows (C:)</div>
                        <div className="text-[10px] text-slate-400 font-mono">420 GB free of 953 GB</div>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                      <HardDrive className="w-8 h-8 text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Data (D:)</div>
                        <div className="text-[10px] text-slate-400 font-mono">1.4 TB free of 2.0 TB</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};
