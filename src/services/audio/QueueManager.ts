import type { PlaybackQueue } from "./types";
import type { Song } from "../../api/models/media";

export const QueueManager = {
  build(tracks: Song[], startIndex = 0): PlaybackQueue {
    if (tracks.length === 0) {
      return { tracks: [], activeIndex: 0 };
    }

    const index = Math.min(Math.max(startIndex, 0), tracks.length - 1);
    return { tracks: [...tracks], activeIndex: index };
  },

  getCurrentTrack(queue: PlaybackQueue): Song | null {
    return queue.tracks[queue.activeIndex] ?? null;
  },

  getNextIndex(queue: PlaybackQueue): number | null {
    if (queue.tracks.length === 0) {
      return null;
    }
    if (queue.activeIndex < queue.tracks.length - 1) {
      return queue.activeIndex + 1;
    }
    return null;
  },

  getPreviousIndex(queue: PlaybackQueue): number | null {
    if (queue.tracks.length === 0) {
      return null;
    }
    if (queue.activeIndex > 0) {
      return queue.activeIndex - 1;
    }
    return null;
  },

  withActiveIndex(queue: PlaybackQueue, activeIndex: number): PlaybackQueue {
    const index = Math.min(Math.max(activeIndex, 0), queue.tracks.length - 1);
    return { ...queue, activeIndex: index };
  },

  shuffle(tracks: Song[]): Song[] {
    const copy = [...tracks];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  },
};
