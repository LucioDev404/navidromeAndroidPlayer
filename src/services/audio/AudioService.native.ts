import TrackPlayer, { Event, State } from "react-native-track-player";

import type {
  AudioEngine,
  AudioStatusListener,
  AudioTrackPayload,
  UnifiedPlaybackStatus,
} from "./AudioEngine.types";
import { ensureTrackPlayerReady } from "./TrackPlayerSetup";
import { safeLog } from "../../security/safeLog";

function mapTrackPlayerState(state: State): UnifiedPlaybackStatus {
  const isPlaying = state === State.Playing;
  const isBuffering = state === State.Buffering || state === State.Connecting;
  const isLoaded = state !== State.None && state !== State.Stopped;

  return {
    isLoaded,
    isPlaying,
    isBuffering,
    positionMillis: 0,
    durationMillis: 0,
    didJustFinish: false,
  };
}

async function readProgress(
  base: UnifiedPlaybackStatus,
): Promise<UnifiedPlaybackStatus> {
  try {
    const { position, duration } = await TrackPlayer.getProgress();
    return {
      ...base,
      positionMillis: Math.round(position * 1000),
      durationMillis: Math.round(duration * 1000),
    };
  } catch {
    return base;
  }
}

class TrackPlayerAudioEngine implements AudioEngine {
  private listener: AudioStatusListener | null = null;
  private eventsBound = false;
  private lastEmitAt = 0;
  private readonly throttleMs = 500;

  async initialize(): Promise<void> {
    await ensureTrackPlayerReady();
    this.bindEngineEvents();
  }

  setStatusListener(listener: AudioStatusListener | null): void {
    this.listener = listener;
  }

  async load({ url, song }: AudioTrackPayload): Promise<void> {
    await ensureTrackPlayerReady();
    await TrackPlayer.reset();

    await TrackPlayer.add({
      id: song.id,
      url,
      title: song.title,
      artist: song.artist,
      album: song.album,
      artwork: song.coverArtUrl ?? undefined,
      duration: song.duration > 0 ? song.duration : undefined,
    });

    safeLog("debug", "TrackPlayer track loaded", {
      trackId: song.id,
      title: song.title,
    });
  }

  async play(): Promise<void> {
    await TrackPlayer.play();
  }

  async pause(): Promise<void> {
    await TrackPlayer.pause();
  }

  async seek(positionMillis: number): Promise<void> {
    await TrackPlayer.seekTo(Math.max(0, positionMillis / 1000));
  }

  async unload(): Promise<void> {
    await TrackPlayer.reset();
  }

  async getStatus(): Promise<UnifiedPlaybackStatus | null> {
    const playbackState = await TrackPlayer.getPlaybackState();
    if (playbackState.state === State.None) {
      return null;
    }
    return readProgress(mapTrackPlayerState(playbackState.state));
  }

  private bindEngineEvents(): void {
    if (this.eventsBound) {
      return;
    }
    this.eventsBound = true;

    TrackPlayer.addEventListener(Event.PlaybackState, async (playbackState) => {
      await this.emitStatus({
        ...(await readProgress(mapTrackPlayerState(playbackState.state))),
        didJustFinish: false,
      });
    });

    TrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      async ({ position, duration }) => {
        const now = Date.now();
        if (now - this.lastEmitAt < this.throttleMs) {
          return;
        }
        this.lastEmitAt = now;

        const playbackState = await TrackPlayer.getPlaybackState();
        await this.emitStatus({
          isLoaded: playbackState.state !== State.None,
          isPlaying: playbackState.state === State.Playing,
          isBuffering:
            playbackState.state === State.Buffering ||
            playbackState.state === State.Connecting,
          positionMillis: Math.round(position * 1000),
          durationMillis: Math.round(duration * 1000),
          didJustFinish: false,
        });
      },
    );

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      await this.emitStatus({
        isLoaded: true,
        isPlaying: false,
        isBuffering: false,
        positionMillis: 0,
        durationMillis: 0,
        didJustFinish: true,
      });
    });
  }

  private async emitStatus(status: UnifiedPlaybackStatus): Promise<void> {
    this.listener?.(status);
  }
}

export const AudioService: AudioEngine = new TrackPlayerAudioEngine();
