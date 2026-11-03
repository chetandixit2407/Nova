import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  FileUp,
  Folder,
  Copy,
  Trash2,
  FileText,
  Image,
  Code,
  Archive,
  Check,
  ExternalLink
} from 'lucide-react';
import { DropShelfFile } from '../../types';
import { soundService } from '../../services/soundService';
import { windowActivityService } from '../../services/windowActivityService';

interface DropShelfModalProps {
  files: DropShelfFile[];
  onAddFiles: (newFiles: DropShelfFile[]) => void;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const DropShelfModal: React.FC<DropShelfModalProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClearAll,
  onClose
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-4 h-4 text-pink-400" />;
    if (type.includes('text') || type.includes('pdf')) return <FileText className="w-4 h-4 text-sky-400" />;
    if (type.includes('zip') || type.includes('tar') || type.includes('compressed')) return <Archive className="w-4 h-4 text-amber-400" />;
    return <Code className="w-4 h-4 text-emerald-400" />;
  };

  const handleCopyTogether = () => {
    if (files.length === 0) return;
    const paths = files.map((f) => `C:\\Users\\User\\DropShelf\\${f.name}`).join('\n');
    navigator.clipboard.writeText(paths);
    setIsCopied(true);
    soundService.play('button_click');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRevealInExplorer = () => {
    windowActivityService.launchApp('explorer');
    soundService.play('button_click');
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedList: DropShelfFile[] = Array.from(e.dataTransfer.files).map((f) => ({
        id: `shelf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        addedAt: Date.now()
      }));
      onAddFiles(droppedList);
      soundService.play('button_click');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <FileUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Drop Shelf (Pro)</h3>
            <p className="text-[11px] text-slate-400">Hold files temporarily, copy together & reveal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-4 rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragOver
            ? 'border-sky-400 bg-sky-500/15 text-sky-200'
            : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04] text-slate-400'
        }`}
      >
        <FileUp className="w-6 h-6 mb-1 text-slate-300" />
        <span className="text-xs font-medium text-slate-200">Drag & drop files onto this shelf</span>
        <span className="text-[10px] text-slate-500">Temporarily staged for multi-tasking</span>
      </div>

      {/* Held Files List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {files.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Drop Shelf is empty. Drag files onto the notch to park them.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/10">
                  {getFileIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{file.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{formatSize(file.size)}</div>
                </div>
              </div>

              <button
                onClick={() => onRemoveFile(file.id)}
                className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition"
                title="Remove from Shelf"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action Footer */}
      {files.length > 0 && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyTogether}
            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Paths Copied!' : 'Copy Paths Together'}</span>
          </button>

          <button
            onClick={handleRevealInExplorer}
            className="flex-1 py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-xs font-medium text-sky-200 flex items-center justify-center gap-2 transition"
          >
            <Folder className="w-3.5 h-3.5 text-sky-400" />
            <span>Reveal in Explorer</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
