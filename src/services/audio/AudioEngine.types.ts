import type { Song } from "../../api/models/media";

export interface AudioTrackPayload {
  url: string;
  song: Song;
}

/** Engine-agnostic status for PlaybackController (expo-av + TrackPlayer). */
export interface UnifiedPlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  positionMillis: number;
  durationMillis: number;
  didJustFinish: boolean;
}

export type AudioStatusListener = (status: UnifiedPlaybackStatus) => void;

export interface AudioEngine {
  initialize(): Promise<void>;
  setStatusListener(listener: AudioStatusListener | null): void;
  load(payload: AudioTrackPayload): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(positionMillis: number): Promise<void>;
  unload(): Promise<void>;
  getStatus(): Promise<UnifiedPlaybackStatus | null>;
}
