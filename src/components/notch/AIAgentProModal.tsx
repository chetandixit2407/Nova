import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  ShieldAlert,
  GitBranch,
  GitCommit,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
  Clock,
  Terminal,
  RefreshCw,
  Power,
  ChevronRight
} from 'lucide-react';
import { aiAgentService, GitUpdate } from '../../services/aiAgentService';
import { AIAgentState, AIAgentPermissionApproval } from '../../types';
import { soundService } from '../../services/soundService';

interface AIAgentProModalProps {
  onClose: () => void;
}

export const AIAgentProModal: React.FC<AIAgentProModalProps> = ({ onClose }) => {
  const [agents, setAgents] = useState<AIAgentState[]>(aiAgentService.getAgents());
  const [approvals, setApprovals] = useState<AIAgentPermissionApproval[]>(aiAgentService.getApprovals());
  const [gitUpdates, setGitUpdates] = useState<GitUpdate[]>(aiAgentService.getGitUpdates());
  const [activeTab, setActiveTab] = useState<'approvals' | 'usage' | 'git'>('approvals');

  useEffect(() => {
    const unsub = aiAgentService.subscribe(() => {
      setAgents(aiAgentService.getAgents());
      setApprovals(aiAgentService.getApprovals());
      setGitUpdates(aiAgentService.getGitUpdates());
    });
    return unsub;
  }, []);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  const handleApprove = (id: string) => {
    aiAgentService.approveRequest(id);
    soundService.play('button_click');
  };

  const handleReject = (id: string) => {
    aiAgentService.rejectRequest(id);
    soundService.play('toggle');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="p-5 w-full flex flex-col space-y-4 text-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Notchy — AI Agent Hub & Usage
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-mono">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Codex, Claude Code, Cursor & Antigravity live control
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'approvals' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Approvals ({pendingApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'usage' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span>Agent Usage Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('git')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            activeTab === 'git' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Git Feed</span>
        </button>
      </div>

      {/* Tab 1: Permission Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No pending permissions. All connected AI agents are operating within policy.
            </div>
          ) : (
            pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-amber-400/25 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">{appr.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/20 text-amber-300">
                      {appr.riskLevel} risk
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(appr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-emerald-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{appr.command}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleReject(appr.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(appr.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Approve Command</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Provider-Reported Agent Usage Monitor */}
      {activeTab === 'usage' && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {agents.map((ag) => (
            <div
              key={ag.id}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ag.isConnected ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-xs font-semibold text-white">{ag.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">
                    ({ag.status.replace('_', ' ')})
                  </span>
                </div>

                <button
                  onClick={() => aiAgentService.toggleAgentConnection(ag.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                    ag.isConnected
                      ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                      : 'border-white/10 text-slate-400 bg-white/5'
                  }`}
                >
                  {ag.isConnected ? 'Connected' : 'Disconnected'}
                </button>
              </div>

              {/* Usage Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Quota Consumed</span>
                  <span className="font-mono text-slate-200">
                    {ag.usage.used} / {ag.usage.limit} {ag.usage.unit} ({ag.usage.percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ag.usage.percentage > 80
                        ? 'bg-rose-400'
                        : ag.usage.percentage > 60
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                    }`}
                    style={{ width: `${ag.usage.percentage}%` }}
                  />
                </div>
              </div>

              {/* Reset time info */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {ag.usage.resetTimeStr}
                </span>
                <span className="text-slate-400 font-mono truncate max-w-[200px]">
                  Branch: {ag.gitBranch || 'main'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Local Git Updates */}
      {activeTab === 'git' && (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {gitUpdates.map((git) => (
            <div
              key={git.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-sky-300 font-semibold">
                  <GitCommit className="w-3.5 h-3.5 text-sky-400" />
                  <span>{git.commitHash}</span>
                  <span className="text-slate-400 font-normal">on</span>
                  <span className="text-emerald-300">{git.branch}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(git.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-xs text-slate-200">{git.message}</div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                <span>By {git.author}</span>
                <span className="font-mono text-slate-400">{git.repo}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
