/**
 * Real Web Audio procedural synthesizer music player and frequency analyzer.
 * Features 3 ambient lo-fi / synthwave generative tracks + AnalyserNode for live visualizer.
 * Full integration with Windows MediaSession API.
 */

import { MediaTrack } from '../types';

export const PLAYLIST: MediaTrack[] = [
  {
    id: 'track-1',
    title: 'Neon Horizon (Windows Mica)',
    artist: 'NOVA Soundscape',
    album: 'Smart Notch Audio Vol. 1',
    duration: 180,
    coverArt: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    genre: 'Synthwave / Ambient'
  },
  {
    id: 'track-2',
    title: 'Midnight Rain & Warm Keys',
    artist: 'Aether Beats',
    album: 'Deep Focus Sessions',
    duration: 210,
    coverArt: 'linear-gradient(135deg, #10b981, #06b6d4)',
    genre: 'Lo-Fi Chill'
  },
  {
    id: 'track-3',
    title: '432Hz Binaural Obsidian',
    artist: 'Kroma Studio',
    album: 'Spatial Productivity',
    duration: 240,
    coverArt: 'linear-gradient(135deg, #a855f7, #ec4899)',
    genre: 'Mindfulness / Focus'
  }
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackIndex: number = 0;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private timerId: number | null = null;
  private synthLoopId: number | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(32));
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Setup MediaSession if available
    this.setupMediaSession();
  }

  private initAudio() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;
    this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  private setupMediaSession() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => this.previousTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            this.seek(details.seekTime);
          }
        });
      } catch {
        // unsupported mediaSession actions fallback
      }
    }
  }

  private updateMediaSessionMetadata() {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      const track = this.getCurrentTrack();
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album
      });
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getCurrentTrack(): MediaTrack {
    return PLAYLIST[this.currentTrackIndex] || PLAYLIST[0];
  }

  public getCurrentIndex(): number {
    return this.currentTrackIndex;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getFrequencies(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    } else {
      // Gentle decay when stopped
      for (let i = 0; i < this.frequencyData.length; i++) {
        this.frequencyData[i] = Math.max(0, this.frequencyData[i] - 12);
      }
    }
    return this.frequencyData;
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public async play() {
    this.initAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
    this.updateMediaSessionMetadata();
    this.startSynth();
    this.startClock();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    this.updateMediaSessionMetadata();
    this.stopSynth();
    this.stopClock();
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public togglePlay() {
    this.toggle();
  }

  public prevTrack() {
    this.previousTrack();
  }

  public nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    this.currentTime = 0;
    this.updateMediaSessionMetadata();
    if (this.isPlaying) {
      this.stopSynth();
      this.startSynth();
    }
    this.notify();
  }

  public previousTrack() {
    if (this.currentTime > 3) {
      this.currentTime = 0;
    } else {
      this.currentTrackIndex = (this.currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
      this.currentTime = 0;
    }
    this.updateMediaSessionMetadata();
    if (this.isPlaying) {
      this.stopSynth();
      this.startSynth();
    }
    this.notify();
  }

  public selectTrack(index: number) {
    if (index >= 0 && index < PLAYLIST.length) {
      this.currentTrackIndex = index;
      this.currentTime = 0;
      this.updateMediaSessionMetadata();
      if (this.isPlaying) {
        this.stopSynth();
        this.startSynth();
      }
      this.notify();
    }
  }

  public seek(seconds: number) {
    const track = this.getCurrentTrack();
    this.currentTime = Math.max(0, Math.min(track.duration, seconds));
    this.notify();
  }

  private startClock() {
    this.stopClock();
    this.timerId = window.setInterval(() => {
      const track = this.getCurrentTrack();
      this.currentTime += 1;
      if (this.currentTime >= track.duration) {
        this.nextTrack();
      } else {
        this.notify();
      }
    }, 1000);
  }

  private stopClock() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Generative music synthesizer loop that feeds the analyser
  private startSynth() {
    this.stopSynth();
    if (!this.ctx || !this.analyser) return;

    // Chord progressions per track
    const chordSets = [
      // Track 1: D Minor synthwave (Dm9 -> Bbmaj7 -> Fmaj7 -> C)
      [
        [293.66, 349.23, 440.0, 523.25, 659.25], // Dm9
        [233.08, 293.66, 349.23, 440.0],         // Bbmaj7
        [174.61, 261.63, 349.23, 440.0, 523.25], // Fmaj7
        [261.63, 329.63, 392.0, 523.25]          // C
      ],
      // Track 2: Lofi Chill (Am7 -> Fmaj7 -> Cmaj7 -> Em7)
      [
        [220.0, 261.63, 329.63, 392.0],          // Am7
        [174.61, 220.0, 261.63, 329.63],         // Fmaj7
        [261.63, 329.63, 392.0, 493.88],         // Cmaj7
        [164.81, 246.94, 329.63, 392.0]          // Em7
      ],
      // Track 3: 432 Hz Harmonic Drone & Shimmer
      [
        [216.0, 324.0, 432.0, 648.0],
        [216.0, 288.0, 432.0, 576.0],
        [242.0, 324.0, 484.0, 648.0],
        [216.0, 324.0, 432.0, 864.0]
      ]
    ];

    const currentChords = chordSets[this.currentTrackIndex % chordSets.length];
    let step = 0;

    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || !this.analyser) return;

      const chord = currentChords[step % currentChords.length];
      const now = this.ctx.currentTime;
      const duration = 2.4;

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.analyser) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Warm analog triangle/saw
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + (i * 200), now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 1.0);
        filter.frequency.exponentialRampToValueAtTime(600, now + duration);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08 / Math.sqrt(chord.length), now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.analyser);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Ambient arpeggio note
      const arpFreq = chord[(step * 2) % chord.length] * 2;
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpFreq, now + 0.6);
      arpGain.gain.setValueAtTime(0.001, now + 0.6);
      arpGain.gain.linearRampToValueAtTime(0.06, now + 0.7);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      arpOsc.connect(arpGain);
      arpGain.connect(this.analyser);
      arpOsc.start(now + 0.6);
      arpOsc.stop(now + 1.9);

      step++;
    };

    // Play immediately and cycle every 2.4s
    playChordStep();
    this.synthLoopId = window.setInterval(playChordStep, 2400);
  }

  private stopSynth() {
    if (this.synthLoopId !== null) {
      clearInterval(this.synthLoopId);
      this.synthLoopId = null;
    }
  }
}

export const audioEngine = new AudioEngine();
