import React, { useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  Copy,
  Clock,
  Play,
  Pause,
  X,
  Plus,
  Trash2,
  FileUp,
  CheckCircle2,
  Activity,
  Zap
} from 'lucide-react';
import { useNotch } from '../../context/NotchContext';
import { systemService } from '../../services/systemService';
import { soundService } from '../../services/soundService';

export const NotchActivitiesTab: React.FC = () => {
  const {
    tasks,
    addTask,
    pauseTask,
    resumeTask,
    cancelTask,
    clearCompletedTasks
  } = useNotch();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'download' | 'upload' | 'install' | 'copy'>('download');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Add initial running task
      addTask({
        title: `Processing: ${file.name}`,
        type: 'upload',
        progress: 0,
        speed: 'Hashing...',
        detail: `${(file.size / (1024 * 1024)).toFixed(2)} MB · SHA-256`,
        status: 'running',
        icon: 'FileUp',
        canPause: false,
        canCancel: true
      });

      // Run real chunked processing with progress updates
      systemService.processFileDrop(file, () => {});
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      type: newTaskType,
      progress: 5,
      speed: newTaskType === 'download' ? '18.4 MB/s' : '9.2 MB/s',
      detail: 'Starting transfer worker...',
      status: 'running',
      icon: newTaskType === 'download' ? 'Download' : newTaskType === 'upload' ? 'Upload' : 'ShieldCheck',
      canPause: true,
      canCancel: true
    });

    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const handleSimulateQuickDownload = () => {
    addTask({
      title: 'DirectX Runtime June 2024 Update',
      type: 'download',
      progress: 8,
      speed: '24.2 MB/s',
      detail: 'Downloading runtime package (340 MB)...',
      status: 'running',
      icon: 'Download',
      canPause: true,
      canCancel: true
    });
  };

  const handleSimulateBackup = () => {
    addTask({
      title: 'Cloud Document Vault Backup',
      type: 'upload',
      progress: 12,
      speed: '12.8 MB/s',
      detail: 'Syncing 42 modified files to cloud...',
      status: 'running',
      icon: 'Upload',
      canPause: true,
      canCancel: true
    });
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const runningCount = tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="space-y-3.5">
      {/* Top Banner: Activity Hub Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">
              Live Task Engine
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {runningCount > 0 ? (
                <span className="text-sky-400 font-medium">{runningCount} active</span>
              ) : (
                '0 active'
              )}{' '}
              · {tasks.length} total
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="py-1.5 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.25)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            onClick={handleSimulateQuickDownload}
            className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Simulate Windows download task"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>+Download</span>
          </button>

          <button
            onClick={handleSimulateBackup}
            className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Simulate Cloud backup sync"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span>+Backup</span>
          </button>

          {completedCount > 0 && (
            <button
              onClick={clearCompletedTasks}
              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear finished tasks"
            >
              <Trash2 className="w-3 h-3" />
              <span>({completedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
          <FileUp className="w-4 h-4 text-sky-400" />
          <span>Drag & drop any file to inspect, hash, or track transfer in NOVA</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active system tasks. Use "New Task" or drag a file into the notch.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isPaused = task.status === 'paused';

            return (
              <div
                key={task.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3 transition-all hover:border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : task.type === 'download' ? (
                        <Download className="w-4 h-4" />
                      ) : task.type === 'install' ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {task.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                        {task.speed && <span>{task.speed}</span>}
                        {task.detail && <span>· {task.detail}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-bold text-sky-400 tabular-nums">
                      {task.progress}%
                    </span>
                    {!isCompleted && task.canPause && (
                      <button
                        onClick={() => (isPaused ? resumeTask(task.id) : pauseTask(task.id))}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={isPaused ? 'Resume' : 'Pause'}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {task.canCancel && (
                      <button
                        onClick={() => cancelTask(task.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : isPaused
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_#38bdf8]'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Create Live Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Downloading Unreal Engine 5.5"
                  autoFocus
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Operation Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['download', 'upload', 'install'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTaskType(t)}
                      className={`py-1.5 text-xs font-medium rounded-lg border capitalize transition-colors cursor-pointer ${
                        newTaskType === t
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 rounded-lg transition-colors cursor-pointer"
                >
                  Start Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
