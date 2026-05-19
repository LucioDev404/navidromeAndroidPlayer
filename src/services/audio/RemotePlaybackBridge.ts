import { PlaybackController } from "./PlaybackController";
import { usePlayerStore } from "../../store/usePlayerStore";

/**
 * Headless-safe bridge for lockscreen / notification remote controls.
 * Keeps remote events in sync with playerStore + PlaybackController.
 */
export const RemotePlaybackBridge = {
  async onPlay(): Promise<void> {
    const { isPlaying, currentSong } = usePlayerStore.getState();
    if (!currentSong) {
      return;
    }
    if (!isPlaying) {
      await PlaybackController.togglePlay();
    }
  },

  async onPause(): Promise<void> {
    const { isPlaying, currentSong } = usePlayerStore.getState();
    if (!currentSong) {
      return;
    }
    if (isPlaying) {
      await PlaybackController.togglePlay();
    }
  },

  async onNext(): Promise<void> {
    await PlaybackController.playNext();
  },

  async onPrevious(): Promise<void> {
    await PlaybackController.playPrevious();
  },

  async onSeek(positionSeconds: number): Promise<void> {
    await PlaybackController.seekTo(Math.round(positionSeconds * 1000));
  },
};
