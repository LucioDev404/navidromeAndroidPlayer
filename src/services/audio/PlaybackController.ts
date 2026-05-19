import type { AVPlaybackStatus } from "expo-av";

import { AudioService } from "./AudioService";
import { PlaybackEvents } from "./PlaybackEvents";
import { QueueManager } from "./QueueManager";
import { resolveStreamUrl } from "./StreamResolver";
import type { PlaybackQueue, PlaybackStatus, QueueContext } from "./types";
import type { Song } from "../../api/models/media";
import { resolveQueueStartIndex } from "../../playback/resolveQueueStart";
import { safeLog } from "../../security/safeLog";
import { usePlayerStore } from "../../store/usePlayerStore";

let loadToken = 0;
let lastTrackStartedId: string | null = null;

function mapAvStatus(
  av: AVPlaybackStatus,
  fallback: PlaybackStatus,
): {
  status: PlaybackStatus;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
} {
  if (!av.isLoaded) {
    return {
      status: fallback,
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
    };
  }

  const isPlaying = av.isPlaying;
  const positionMillis = av.positionMillis ?? 0;
  const durationMillis = av.durationMillis ?? 0;

  let status: PlaybackStatus = fallback;
  if (av.isBuffering) {
    status = "buffering";
  } else if (isPlaying) {
    status = "playing";
  } else {
    status = "paused";
  }

  return { status, isPlaying, positionMillis, durationMillis };
}

async function confirmPlaybackStarted(
  track: Song,
  token: number,
): Promise<void> {
  const status = await AudioService.getStatus();
  if (token !== loadToken) {
    return;
  }

  if (status?.isLoaded && status.isPlaying && lastTrackStartedId !== track.id) {
    lastTrackStartedId = track.id;
    PlaybackEvents.emitTrackStarted(track);
  }
}

/**
 * Orchestrates queue + audio engine + Zustand (optimistic UI first, then stream).
 */
export const PlaybackController = {
  async initialize(): Promise<void> {
    await AudioService.initialize();
    AudioService.setStatusListener((status) => {
      PlaybackController.onAudioStatus(status);
    });
  },

  async playQueue(
    tracks: Song[],
    startIndex = 0,
    queueContext?: QueueContext | null,
  ): Promise<void> {
    if (tracks.length === 0) {
      return;
    }

    const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    const queue = QueueManager.build(tracks, safeIndex);
    const track = queue.tracks[queue.activeIndex];
    if (!track) {
      return;
    }

    usePlayerStore.getState().applyQueue(queue, {
      status: "loading",
      isPlaying: true,
      queueContext: queueContext ?? null,
    });

    await PlaybackController.loadTrack(track, queue);
  },

  async playSong(
    song: Song,
    queueTracks?: Song[],
    queueContext?: QueueContext | null,
    explicitStartIndex?: number,
  ): Promise<void> {
    const sourceQueue = queueTracks?.length ? queueTracks : [song];
    const { tracks, startIndex } = resolveQueueStartIndex(
      sourceQueue,
      song,
      explicitStartIndex,
    );

    await PlaybackController.playQueue(tracks, startIndex, queueContext);
  },

  async playQueueIndex(index: number): Promise<void> {
    const state = usePlayerStore.getState();
    if (state.queue.length === 0) {
      return;
    }

    const safeIndex = Math.min(Math.max(index, 0), state.queue.length - 1);
    const queue = QueueManager.build(state.queue, safeIndex);
    const track = queue.tracks[queue.activeIndex];
    if (!track) {
      return;
    }

    state.applyQueue(queue, {
      status: "loading",
      isPlaying: true,
      queueContext: state.queueContext,
    });

    await PlaybackController.loadTrack(track, queue);
  },

  async togglePlay(): Promise<void> {
    const state = usePlayerStore.getState();
    if (!state.currentSong) {
      return;
    }

    if (state.isPlaying) {
      await AudioService.pause();
      usePlayerStore
        .getState()
        .patchPlayback({ isPlaying: false, status: "paused" });
      return;
    }

    if (state.status === "error" || state.status === "idle") {
      await PlaybackController.retryCurrent();
      return;
    }

    await AudioService.play();
    usePlayerStore
      .getState()
      .patchPlayback({ isPlaying: true, status: "playing" });
  },

  async playNext(): Promise<void> {
    const state = usePlayerStore.getState();
    const queue = QueueManager.build(state.queue, state.activeIndex);
    const nextIndex = QueueManager.getNextIndex(queue);
    if (nextIndex == null) {
      return;
    }
    await PlaybackController.playQueueIndex(nextIndex);
  },

  async playPrevious(): Promise<void> {
    const state = usePlayerStore.getState();
    const { positionMillis } = state;

    if (positionMillis > 3000) {
      await PlaybackController.seekTo(0);
      return;
    }

    const queue = QueueManager.build(state.queue, state.activeIndex);
    const prevIndex = QueueManager.getPreviousIndex(queue);
    if (prevIndex == null) {
      await PlaybackController.seekTo(0);
      return;
    }

    await PlaybackController.playQueueIndex(prevIndex);
  },

  async seekTo(positionMillis: number): Promise<void> {
    await AudioService.seek(positionMillis);
    usePlayerStore.getState().patchPlayback({ positionMillis });
  },

  async clear(): Promise<void> {
    loadToken += 1;
    lastTrackStartedId = null;
    await AudioService.unload();
    usePlayerStore.getState().resetPlayback();
  },

  async retryCurrent(): Promise<void> {
    const state = usePlayerStore.getState();
    if (!state.currentSong) {
      return;
    }

    const queue = QueueManager.build(state.queue, state.activeIndex);
    await PlaybackController.loadTrack(state.currentSong, queue);
  },

  onAudioStatus(status: AVPlaybackStatus): void {
    const state = usePlayerStore.getState();
    if (!state.currentSong) {
      return;
    }

    if (status.isLoaded && status.didJustFinish) {
      PlaybackController.playNext().catch(() => undefined);
      return;
    }

    const mapped = mapAvStatus(status, state.status);
    usePlayerStore.getState().patchPlayback(mapped);

    if (
      status.isLoaded &&
      status.isPlaying &&
      lastTrackStartedId !== state.currentSong.id
    ) {
      lastTrackStartedId = state.currentSong.id;
      PlaybackEvents.emitTrackStarted(state.currentSong);
    }
  },

  async loadTrack(track: Song, queue: PlaybackQueue): Promise<void> {
    const token = ++loadToken;
    lastTrackStartedId = null;

    try {
      const streamUrl = await resolveStreamUrl(track.id);
      if (token !== loadToken) {
        return;
      }

      await AudioService.load(streamUrl);
      if (token !== loadToken) {
        return;
      }

      usePlayerStore.getState().applyQueue(queue, {
        status: "buffering",
        isPlaying: true,
        playbackError: null,
        queueContext: usePlayerStore.getState().queueContext,
      });

      await AudioService.play();
      await confirmPlaybackStarted(track, token);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Playback failed to start.";
      safeLog("error", "Playback load failed", { error: message });

      if (token !== loadToken) {
        return;
      }

      usePlayerStore.getState().patchPlayback({
        status: "error",
        isPlaying: false,
        playbackError: message,
      });
    }
  },
};
