import type { Song } from "../../api/models/media";

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "buffering"
  | "playing"
  | "paused"
  | "error";

export interface PlaybackQueue {
  tracks: Song[];
  activeIndex: number;
}

export interface QueueContext {
  type: "album" | "playlist" | "search" | "library" | "recent" | "genre";
  id?: string;
  title?: string;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlaybackSnapshot {
  currentSong: Song | null;
  queue: Song[];
  activeIndex: number;
  isPlaying: boolean;
  status: PlaybackStatus;
  positionMillis: number;
  durationMillis: number;
  playbackError: string | null;
  queueContext: QueueContext | null;
}
