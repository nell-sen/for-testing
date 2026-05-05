import { create } from 'zustand';
import { Track } from '@/types';

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  addToQueue: (track: Track) => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setIsPlaying: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  repeatMode: 'none',
  shuffle: false,

  playTrack: (track) => set({ currentTrack: track, isPlaying: true, progress: 0 }),

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, currentTrack, shuffle, repeatMode } = get();
    if (repeatMode === 'one' && currentTrack) {
      set({ progress: 0, isPlaying: true });
      return;
    }
    if (queue.length === 0) {
      if (repeatMode === 'all' && currentTrack) set({ progress: 0, isPlaying: true });
      return;
    }
    let nextIdx = 0;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    const next = queue[nextIdx];
    const newQueue = queue.filter((_, i) => i !== nextIdx);
    set({ currentTrack: next, queue: newQueue, progress: 0, isPlaying: true });
  },

  prev: () => set({ progress: 0 }),

  addToQueue: (track) => set(s => ({ queue: [...s.queue, track] })),

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v }),

  toggleRepeat: () => {
    const m = get().repeatMode;
    set({ repeatMode: m === 'none' ? 'one' : m === 'one' ? 'all' : 'none' });
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  setIsPlaying: (v) => set({ isPlaying: v }),
}));
