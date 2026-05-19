import { create } from "zustand";

import type { Song } from "../api/models/media";
import { PlaybackController } from "../services/audio/PlaybackController";
import { QueueManager } from "../services/audio/QueueManager";
import type {
  PlaybackQueue,
  PlaybackStatus,
  QueueContext,
  RepeatMode,
} from "../services/audio/types";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  activeIndex: number;
  queueContext: QueueContext | null;
  isPlaying: boolean;
  status: PlaybackStatus;
  positionMillis: number;
  durationMillis: number;
  playbackError: string | null;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  /** Snapshot before shuffle so we can restore order. */
  naturalQueue: Song[] | null;

  applyQueue: (
    queue: PlaybackQueue,
    patch?: Partial<{
      isPlaying: boolean;
      status: PlaybackStatus;
      playbackError: string | null;
      positionMillis: number;
      durationMillis: number;
      queueContext: QueueContext | null;
    }>,
  ) => void;
  patchPlayback: (
    patch: Partial<{
      isPlaying: boolean;
      status: PlaybackStatus;
      playbackError: string | null;
      positionMillis: number;
      durationMillis: number;
    }>,
  ) => void;
  resetPlayback: () => void;

  playSong: (
    song: Song,
    queue?: Song[],
    context?: QueueContext | null,
    startIndex?: number,
  ) => void;
  playQueue: (
    songs: Song[],
    startIndex?: number,
    context?: QueueContext | null,
  ) => void;
  playQueueIndex: (index: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (positionMillis: number) => void;
  retryPlayback: () => void;
  clear: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;
  toggleShuffle: () => void;
}

const INITIAL_STATE = {
  currentSong: null as Song | null,
  queue: [] as Song[],
  activeIndex: 0,
  queueContext: null as QueueContext | null,
  isPlaying: false,
  status: "idle" as PlaybackStatus,
  positionMillis: 0,
  durationMillis: 0,
  playbackError: null as string | null,
  repeatMode: "off" as RepeatMode,
  shuffleEnabled: false,
  naturalQueue: null as Song[] | null,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...INITIAL_STATE,

  applyQueue: (queue, patch) => {
    const track = QueueManager.getCurrentTrack(queue);
    const prevQueue = get().queue;
    const queueChanged =
      prevQueue.length !== queue.tracks.length ||
      prevQueue.some((song, index) => song.id !== queue.tracks[index]?.id);

    set({
      currentSong: track,
      queue: queue.tracks,
      activeIndex: queue.activeIndex,
      queueContext: patch?.queueContext ?? get().queueContext,
      playbackError: patch?.playbackError ?? null,
      isPlaying: patch?.isPlaying ?? get().isPlaying,
      status: patch?.status ?? get().status,
      positionMillis: patch?.positionMillis ?? 0,
      durationMillis:
        patch?.durationMillis ?? (track?.duration ? track.duration * 1000 : 0),
      ...(queueChanged
        ? { shuffleEnabled: false, naturalQueue: null }
        : undefined),
    });
  },

  patchPlayback: (patch) => {
    set((state) => ({
      ...state,
      ...patch,
    }));
  },

  resetPlayback: () => {
    set({ ...INITIAL_STATE, naturalQueue: null });
  },

  playSong: (song, queue, context, startIndex) => {
    PlaybackController.playSong(song, queue, context, startIndex).catch(
      (error) => {
        const message =
          error instanceof Error ? error.message : "Playback failed";
        get().patchPlayback({
          status: "error",
          isPlaying: false,
          playbackError: message,
        });
      },
    );
  },

  playQueue: (songs, startIndex = 0, context) => {
    PlaybackController.playQueue(songs, startIndex, context).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Playback failed";
      get().patchPlayback({
        status: "error",
        isPlaying: false,
        playbackError: message,
      });
    });
  },

  playQueueIndex: (index) => {
    PlaybackController.playQueueIndex(index).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Playback failed";
      get().patchPlayback({
        status: "error",
        isPlaying: false,
        playbackError: message,
      });
    });
  },

  togglePlay: () => {
    PlaybackController.togglePlay().catch((error) => {
      const message =
        error instanceof Error ? error.message : "Playback failed";
      get().patchPlayback({ status: "error", playbackError: message });
    });
  },

  playNext: () => {
    PlaybackController.playNext().catch(() => undefined);
  },

  playPrevious: () => {
    PlaybackController.playPrevious().catch(() => undefined);
  },

  seekTo: (positionMillis) => {
    PlaybackController.seekTo(positionMillis).catch(() => undefined);
  },

  retryPlayback: () => {
    PlaybackController.retryCurrent().catch((error) => {
      const message = error instanceof Error ? error.message : "Retry failed";
      get().patchPlayback({ status: "error", playbackError: message });
    });
  },

  clear: () => {
    PlaybackController.clear().catch(() => undefined);
  },

  setRepeatMode: (mode) => {
    set({ repeatMode: mode });
  },

  cycleRepeatMode: () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const current = get().repeatMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    set({ repeatMode: next });
  },

  toggleShuffle: () => {
    const state = get();
    if (state.queue.length < 2) {
      set({ shuffleEnabled: !state.shuffleEnabled, naturalQueue: null });
      return;
    }

    if (!state.shuffleEnabled) {
      const current = state.currentSong;
      const naturalQueue = [...state.queue];
      const shuffled = QueueManager.shuffle(naturalQueue);
      const startIndex = current
        ? Math.max(
            0,
            shuffled.findIndex((track) => track.id === current.id),
          )
        : 0;
      set({
        shuffleEnabled: true,
        naturalQueue,
        queue: shuffled,
        activeIndex: startIndex,
      });
      return;
    }

    const naturalQueue = state.naturalQueue ?? state.queue;
    const current = state.currentSong;
    const startIndex = current
      ? Math.max(
          0,
          naturalQueue.findIndex((track) => track.id === current.id),
        )
      : state.activeIndex;
    set({
      shuffleEnabled: false,
      naturalQueue: null,
      queue: naturalQueue,
      activeIndex: startIndex >= 0 ? startIndex : 0,
    });
  },
}));

export default usePlayerStore;
