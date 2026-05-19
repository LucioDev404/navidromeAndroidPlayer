import { create } from "zustand";

import type { Song } from "../api/models/media";
import { PlaybackController } from "../services/audio/PlaybackController";
import { QueueManager } from "../services/audio/QueueManager";
import type {
  PlaybackQueue,
  PlaybackStatus,
  QueueContext,
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
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  ...INITIAL_STATE,

  applyQueue: (queue, patch) => {
    const track = QueueManager.getCurrentTrack(queue);
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
    });
  },

  patchPlayback: (patch) => {
    set((state) => ({
      ...state,
      ...patch,
    }));
  },

  resetPlayback: () => {
    set({ ...INITIAL_STATE });
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
}));

export default usePlayerStore;
