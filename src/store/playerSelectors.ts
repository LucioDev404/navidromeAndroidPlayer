import { shallow } from "zustand/shallow";

import { usePlayerStore } from "./usePlayerStore";
import type { Song } from "../api/models/media";
import type { PlaybackStatus, QueueContext } from "../services/audio/types";

/** Stable action references — components that only call actions won't re-render on track change. */
export function usePlayerActions() {
  return usePlayerStore(
    (s) => ({
      playSong: s.playSong,
      playQueue: s.playQueue,
      playQueueIndex: s.playQueueIndex,
      togglePlay: s.togglePlay,
      playNext: s.playNext,
      playPrevious: s.playPrevious,
      seekTo: s.seekTo,
      retryPlayback: s.retryPlayback,
      clear: s.clear,
    }),
    shallow,
  );
}

export function useCurrentSong(): Song | null {
  return usePlayerStore((s) => s.currentSong);
}

export function useIsPlaying(): boolean {
  return usePlayerStore((s) => s.isPlaying);
}

export function usePlaybackStatus(): PlaybackStatus {
  return usePlayerStore((s) => s.status);
}

export function usePlaybackError(): string | null {
  return usePlayerStore((s) => s.playbackError);
}

export function useQueueLength(): number {
  return usePlayerStore((s) => s.queue.length);
}

export function useHasActiveTrack(): boolean {
  return usePlayerStore((s) => s.currentSong != null);
}

export function useActiveQueueIndex(): number {
  return usePlayerStore((s) => s.activeIndex);
}

export function useQueueContext(): QueueContext | null {
  return usePlayerStore((s) => s.queueContext);
}

export function usePlayerQueue(): Song[] {
  return usePlayerStore((s) => s.queue);
}

/** Subscribe only in player UI — throttled updates from audio engine. */
export function usePlaybackProgress() {
  return usePlayerStore(
    (s) => ({
      positionMillis: s.positionMillis,
      durationMillis: s.durationMillis,
    }),
    shallow,
  );
}

/** True when the current queue is this album (for highlight sync). */
export function useIsAlbumQueue(albumId: string): boolean {
  return usePlayerStore(
    (s) => s.queueContext?.type === "album" && s.queueContext.id === albumId,
  );
}

export function useIsPlaylistQueue(playlistId: string): boolean {
  return usePlayerStore(
    (s) =>
      s.queueContext?.type === "playlist" && s.queueContext.id === playlistId,
  );
}
