import { create } from "zustand";

import type { Song } from "../api/models/media";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isExpanded: boolean;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  setExpanded: (expanded: boolean) => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  isExpanded: false,

  playSong: (song, queue) => {
    const nextQueue = queue?.length ? queue : [song];
    set({
      currentSong: song,
      queue: nextQueue,
      isPlaying: true,
      isExpanded: false,
    });
  },

  togglePlay: () => {
    if (!get().currentSong) {
      return;
    }
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  playNext: () => {
    const { queue, currentSong } = get();
    if (!currentSong || queue.length === 0) {
      return;
    }

    const index = queue.findIndex((item) => item.id === currentSong.id);
    const next = queue[index + 1] ?? queue[0];
    set({ currentSong: next, isPlaying: true });
  },

  setExpanded: (expanded) => set({ isExpanded: expanded }),

  clear: () =>
    set({
      currentSong: null,
      queue: [],
      isPlaying: false,
      isExpanded: false,
    }),
}));

export default usePlayerStore;
