import { SyncedLyricLine } from '../types';

export interface SongLyrics {
  trackId: string;
  lines: SyncedLyricLine[];
}

const TRACK_LYRICS: Record<string, SyncedLyricLine[]> = {
  'synth-1': [
    { time: 0, text: '• Ambient electronic synthesizer begins •' },
    { time: 5, text: 'Neon lights reflecting on the wet pavement' },
    { time: 12, text: 'Signals drifting quietly through the night' },
    { time: 19, text: 'Whispers in the fiber optic cables hum' },
    { time: 26, text: 'A skyline bathed in deep magenta and cyan' },
    { time: 34, text: 'Echoes of the city fading into dusk' },
    { time: 42, text: 'Pulse of the grid steady and electric' },
    { time: 50, text: 'Memories suspended in digital glass' },
    { time: 62, text: 'We move unseen between the glowing high-rises' },
    { time: 75, text: 'Watching the dawn break across the obsidian harbor' },
    { time: 90, text: 'Lost in the frequency, weightless in the air' },
    { time: 105, text: '• Smooth synthesizer outro fading •' }
  ],
  'synth-2': [
    { time: 0, text: '• Retro wave bassline ignites •' },
    { time: 6, text: 'Cruising through the midnight boulevard' },
    { time: 14, text: 'Analog dreams playing on the radio' },
    { time: 22, text: 'Chromed reflections on the rear-view mirror' },
    { time: 30, text: 'Accelerating toward the distant neon horizon' },
    { time: 40, text: 'Never looking back, chasing after the stars' },
    { time: 52, text: 'Synths rising high through the cool summer breeze' },
    { time: 65, text: 'An eternal drift in a city that never sleeps' },
    { time: 80, text: 'Speed of sound, pure electric liberty' },
    { time: 96, text: '• Dynamic arpeggio cascade outro •' }
  ],
  'synth-3': [
    { time: 0, text: '• Soft celestial chime resonance •' },
    { time: 8, text: 'Floating beyond the atmospheric edge' },
    { time: 16, text: 'Orbits aligned in velvet black expanse' },
    { time: 25, text: 'Solar winds brushing against metallic hulls' },
    { time: 35, text: 'Constellations guiding every calculation' },
    { time: 48, text: 'Gravity gently releasing its hold' },
    { time: 60, text: 'Infinite serenity in the stellar void' },
    { time: 76, text: 'A silent symphony of nebular colors' },
    { time: 94, text: 'Resting in the orbit of new beginnings' }
  ]
};

class LyricsService {
  public getLyricsForTrack(trackId: string): SyncedLyricLine[] {
    return TRACK_LYRICS[trackId] || TRACK_LYRICS['synth-1'];
  }

  public getCurrentLineIndex(lines: SyncedLyricLine[], currentTime: number): number {
    if (!lines || lines.length === 0) return -1;
    let activeIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  }
}

export const lyricsService = new LyricsService();
