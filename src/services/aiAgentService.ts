import { AIAgentState, AIAgentPermissionApproval, AIAgentProvider } from '../types';

export interface GitUpdate {
  id: string;
  repo: string;
  branch: string;
  commitHash: string;
  message: string;
  author: string;
  timestamp: number;
}

const INITIAL_AGENTS: AIAgentState[] = [
  {
    id: 'cursor',
    name: 'Cursor AI',
    isConnected: true,
    status: 'active',
    activeTask: 'Refactoring NotchRoot spring transitions for 60fps',
    gitBranch: 'main',
    lastCommit: 'a89f21b (feat: Add Dynamic Island spring physics)',
    usage: {
      used: 382,
      limit: 500,
      unit: 'Fast Requests',
      resetTimeStr: 'Resets in 11 days (Nov 15)',
      percentage: 76
    }
  },
  {
    id: 'claude_code',
    name: 'Claude Code',
    isConnected: true,
    status: 'waiting_approval',
    activeTask: 'Awaiting permission to run `git push origin main`',
    gitBranch: 'feature/pro-island',
    lastCommit: '41e7dc0 (perf: memoize active activity stacked pill)',
    usage: {
      used: 84,
      limit: 100,
      unit: '% 5-hr window',
      resetTimeStr: 'Resets at 5:00 PM (in 1h 42m)',
      percentage: 84
    }
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    isConnected: true,
    status: 'idle',
    activeTask: 'Codebase indexing up to date',
    gitBranch: 'main',
    lastCommit: 'f9011ba (docs: update API documentation)',
    usage: {
      used: 42100,
      limit: 100000,
      unit: 'Tokens / min',
      resetTimeStr: 'Rate limit bucket resets in 18s',
      percentage: 42
    }
  },
  {
    id: 'antigravity',
    name: 'Antigravity Agent',
    isConnected: true,
    status: 'executing',
    activeTask: 'Autonomous workspace analysis & dependency tree pruning',
    gitBranch: 'chore/clean-deps',
    lastCommit: 'c029df1 (chore: purge legacy Tauri binary scaffolding)',
    usage: {
      used: 6.2,
      limit: 16.0,
      unit: 'GB VRAM / Local LLM',
      resetTimeStr: 'Local Ollama / vLLM runtime active',
      percentage: 39
    }
  }
];

const INITIAL_APPROVALS: AIAgentPermissionApproval[] = [
  {
    id: 'appr-1',
    agentId: 'claude_code',
    title: 'Git Push Remote Origin',
    command: 'git push --set-upstream origin feature/pro-island',
    riskLevel: 'medium',
    timestamp: Date.now() - 120000,
    status: 'pending'
  },
  {
    id: 'appr-2',
    agentId: 'antigravity',
    title: 'Install Dev Dependency',
    command: 'npm install -D @types/canvas-confetti',
    riskLevel: 'low',
    timestamp: Date.now() - 360000,
    status: 'pending'
  }
];

const INITIAL_GIT_UPDATES: GitUpdate[] = [
  {
    id: 'git-1',
    repo: 'chetandixit2407/Nova',
    branch: 'main',
    commitHash: 'a89f21b',
    message: 'feat: Add Dynamic Island spring physics & Pro features',
    author: 'AI Studio Engine',
    timestamp: Date.now() - 480000
  },
  {
    id: 'git-2',
    repo: 'chetandixit2407/Nova',
    branch: 'feature/pro-island',
    commitHash: '41e7dc0',
    message: 'perf: optimize multi-activity layout transitions',
    author: 'Claude Code Agent',
    timestamp: Date.now() - 920000
  },
  {
    id: 'git-3',
    repo: 'chetandixit2407/Nova',
    branch: 'main',
    commitHash: 'c029df1',
    message: 'chore: purge legacy Tauri binary scaffolding for Vite web stack',
    author: 'Antigravity Runner',
    timestamp: Date.now() - 1800000
  }
];

class AIAgentService {
  private agents: AIAgentState[] = [...INITIAL_AGENTS];
  private approvals: AIAgentPermissionApproval[] = [...INITIAL_APPROVALS];
  private gitUpdates: GitUpdate[] = [...INITIAL_GIT_UPDATES];
  private listeners: Set<() => void> = new Set();

  public getAgents(): AIAgentState[] {
    return this.agents;
  }

  public getApprovals(): AIAgentPermissionApproval[] {
    return this.approvals;
  }

  public getPendingApprovals(): AIAgentPermissionApproval[] {
    return this.approvals.filter((a) => a.status === 'pending');
  }

  public getGitUpdates(): GitUpdate[] {
    return this.gitUpdates;
  }

  public approveRequest(approvalId: string): void {
    this.approvals = this.approvals.map((a) =>
      a.id === approvalId ? { ...a, status: 'approved' as const } : a
    );
    // If agent was waiting, transition to executing/active
    const appr = this.approvals.find((a) => a.id === approvalId);
    if (appr) {
      this.agents = this.agents.map((ag) =>
        ag.id === appr.agentId
          ? {
              ...ag,
              status: 'executing' as const,
              activeTask: `Executing: ${appr.command.slice(0, 40)}...`
            }
          : ag
      );
      // Simulate completion after 3s
      setTimeout(() => {
        this.agents = this.agents.map((ag) =>
          ag.id === appr.agentId
            ? {
                ...ag,
                status: 'active' as const,
                activeTask: 'Command executed successfully.'
              }
            : ag
        );
        this.notify();
      }, 3000);
    }
    this.notify();
  }

  public rejectRequest(approvalId: string): void {
    this.approvals = this.approvals.map((a) =>
      a.id === approvalId ? { ...a, status: 'rejected' as const } : a
    );
    const appr = this.approvals.find((a) => a.id === approvalId);
    if (appr) {
      this.agents = this.agents.map((ag) =>
        ag.id === appr.agentId
          ? {
              ...ag,
              status: 'idle' as const,
              activeTask: 'Permission rejected by user.'
            }
          : ag
      );
    }
    this.notify();
  }

  public toggleAgentConnection(agentId: AIAgentProvider): void {
    this.agents = this.agents.map((ag) =>
      ag.id === agentId
        ? {
            ...ag,
            isConnected: !ag.isConnected,
            status: !ag.isConnected ? 'active' : 'idle'
          }
        : ag
    );
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const aiAgentService = new AIAgentService();
