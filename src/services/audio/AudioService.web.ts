import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from "expo-av";

import type {
  AudioEngine,
  AudioStatusListener,
  AudioTrackPayload,
  UnifiedPlaybackStatus,
} from "./AudioEngine.types";
import { safeLog } from "../../security/safeLog";

function mapAvStatus(av: AVPlaybackStatus): UnifiedPlaybackStatus {
  if (!av.isLoaded) {
    return {
      isLoaded: false,
      isPlaying: false,
      isBuffering: false,
      positionMillis: 0,
      durationMillis: 0,
      didJustFinish: false,
    };
  }

  return {
    isLoaded: true,
    isPlaying: av.isPlaying,
    isBuffering: av.isBuffering,
    positionMillis: av.positionMillis ?? 0,
    durationMillis: av.durationMillis ?? 0,
    didJustFinish: av.didJustFinish ?? false,
  };
}

/**
 * Web fallback — expo-av (no Android media session on web).
 */
class ExpoAvAudioEngine implements AudioEngine {
  private sound: Audio.Sound | null = null;
  private listener: AudioStatusListener | null = null;
  private initialized = false;
  private lastEmitAt = 0;
  private readonly positionThrottleMs = 1000;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });

    this.initialized = true;
    safeLog("info", "Expo AV audio engine initialized (web)");
  }

  setStatusListener(listener: AudioStatusListener | null): void {
    this.listener = listener;
  }

  async load({ url }: AudioTrackPayload): Promise<void> {
    await this.initialize();
    await this.unload();

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      {
        shouldPlay: false,
        progressUpdateIntervalMillis: this.positionThrottleMs,
      },
      (status) => this.handleStatus(status),
    );

    this.sound = sound;
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async seek(positionMillis: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(Math.max(0, positionMillis));
    }
  }

  async unload(): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      await this.sound.stopAsync();
    } catch {
      /* already stopped */
    }

    try {
      await this.sound.unloadAsync();
    } catch {
      /* ignore */
    }

    this.sound = null;
  }

  async getStatus(): Promise<UnifiedPlaybackStatus | null> {
    if (!this.sound) {
      return null;
    }
    const status = await this.sound.getStatusAsync();
    return mapAvStatus(status);
  }

  private handleStatus(status: AVPlaybackStatus): void {
    const now = Date.now();
    const mapped = mapAvStatus(status);
    const shouldEmit =
      !mapped.isLoaded ||
      mapped.didJustFinish ||
      now - this.lastEmitAt >= this.positionThrottleMs;

    if (shouldEmit) {
      this.lastEmitAt = now;
      this.listener?.(mapped);
    }
  }
}

export const AudioService: AudioEngine = new ExpoAvAudioEngine();
