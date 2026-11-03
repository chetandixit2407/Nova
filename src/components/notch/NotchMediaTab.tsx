import React, { useEffect, useState } from 'react';
import { Music2 } from 'lucide-react';
import { audioEngine, PLAYLIST } from '../../services/audioEngine';
import { MediaControls } from './MediaControls';

export const NotchMediaTab: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(audioEngine.getCurrentIndex());

  useEffect(() => {
    const unsub = audioEngine.subscribe(() => {
      setCurrentIndex(audioEngine.getCurrentIndex());
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-4">
      {/* Primary Media Controls Component with Audio Detection Pulse */}
      <MediaControls />

      {/* Playlist Selector */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Ambient Soundscapes & Lo-Fi
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {PLAYLIST.map((t, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={t.id}
                onClick={() => audioEngine.selectTrack(idx)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400/40 text-white shadow-sm ring-1 ring-sky-400/30'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white shadow-sm"
                  style={{ background: t.coverArt }}
                >
                  <Music2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate text-white">{t.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{t.artist}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
