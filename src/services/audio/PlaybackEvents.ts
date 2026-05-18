import type { Song } from "../../api/models/media";

export type PlaybackEventListener = (song: Song) => void;

/**
 * Lightweight playback event bus.
 * Recently played and analytics subscribe here — never from UI clicks alone.
 */
class PlaybackEventsImpl {
  private trackStartedListeners = new Set<PlaybackEventListener>();

  onTrackStarted(listener: PlaybackEventListener): () => void {
    this.trackStartedListeners.add(listener);
    return () => {
      this.trackStartedListeners.delete(listener);
    };
  }

  /** Call only after the audio engine confirms playback has started. */
  emitTrackStarted(song: Song): void {
    for (const listener of this.trackStartedListeners) {
      try {
        listener(song);
      } catch {
        /* listener must not break playback */
      }
    }
  }
}

export const PlaybackEvents = new PlaybackEventsImpl();
