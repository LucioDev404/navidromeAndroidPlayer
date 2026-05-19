import type { Song } from "../api/models/media";

/**
 * Resolves which index in the queue must start playback.
 * Never silently picks index 0 unless the target is actually first (or solo queue).
 */
export function resolveQueueStartIndex(
  queue: Song[],
  target: Song,
  explicitIndex?: number,
): { tracks: Song[]; startIndex: number } {
  if (queue.length === 0) {
    return { tracks: [target], startIndex: 0 };
  }

  if (
    explicitIndex != null &&
    explicitIndex >= 0 &&
    explicitIndex < queue.length &&
    queue[explicitIndex]?.id === target.id
  ) {
    return { tracks: queue, startIndex: explicitIndex };
  }

  const byId = queue.findIndex((track) => track.id === target.id);
  if (byId >= 0) {
    return { tracks: queue, startIndex: byId };
  }

  return { tracks: [target], startIndex: 0 };
}
