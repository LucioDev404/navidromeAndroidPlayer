import type { UnifiedPlaybackStatus } from "./AudioEngine.types";
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

function mapEngineStatus(
  status: UnifiedPlaybackStatus,
  fallback: PlaybackStatus,
): {
  status: PlaybackStatus;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
} {
  if (!status.isLoaded) {
    return {
      status: fallback,
      isPlaying: false,
      positionMillis: 0,
      durationMillis: 0,
    };
  }

  let nextStatus: PlaybackStatus = fallback;
  if (status.isBuffering) {
    nextStatus = "buffering";
  } else if (status.isPlaying) {
    nextStatus = "playing";
  } else {
    nextStatus = "paused";
  }

  return {
    status: nextStatus,
    isPlaying: status.isPlaying,
    positionMillis: status.positionMillis,
    durationMillis: status.durationMillis,
  };
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
 * Native Android uses react-native-track-player for media session + notification.
 */
export const PlaybackController = {
  async initialize(): Promise<void> {
    await AudioService.initialize();
    AudioService.setStatusListener((status) => {
      PlaybackController.onEngineStatus(status);
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

    if (state.repeatMode === "one" && state.currentSong) {
      await PlaybackController.seekTo(0);
      await AudioService.play();
      usePlayerStore
        .getState()
        .patchPlayback({ isPlaying: true, status: "playing" });
      return;
    }

    const nextIndex = QueueManager.getNextIndex(queue);
    if (nextIndex != null) {
      await PlaybackController.playQueueIndex(nextIndex);
      return;
    }

    if (state.repeatMode === "all" && queue.tracks.length > 0) {
      await PlaybackController.playQueueIndex(0);
    }
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

  onEngineStatus(status: UnifiedPlaybackStatus): void {
    const state = usePlayerStore.getState();
    if (!state.currentSong) {
      return;
    }

    if (status.isLoaded && status.didJustFinish) {
      PlaybackController.playNext().catch(() => undefined);
      return;
    }

    const mapped = mapEngineStatus(status, state.status);
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

      await AudioService.load({ url: streamUrl, song: track });
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
