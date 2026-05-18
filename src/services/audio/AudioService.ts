import {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  type AVPlaybackStatus,
} from "expo-av";

import { safeLog } from "../../security/safeLog";
import { isWeb } from "../../utils/platform";

export type AudioStatusListener = (status: AVPlaybackStatus) => void;

/**
 * Low-level wrapper around expo-av Sound.
 * UI and Zustand must not import expo-av directly.
 */
class AudioServiceImpl {
  private sound: Audio.Sound | null = null;
  private listener: AudioStatusListener | null = null;
  private initialized = false;
  private lastEmitAt = 0;
  private readonly positionThrottleMs = isWeb ? 1000 : 500;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: !isWeb,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      this.initialized = true;
      safeLog("info", "AudioService initialized", {
        platform: isWeb ? "web" : "native",
      });
    } catch (error) {
      safeLog("error", "AudioService init failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  setStatusListener(listener: AudioStatusListener | null): void {
    this.listener = listener;
  }

  async load(uri: string): Promise<void> {
    await this.initialize();
    await this.unload();

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      {
        shouldPlay: false,
        progressUpdateIntervalMillis: this.positionThrottleMs,
      },
      (status) => this.handleStatus(status),
    );

    this.sound = sound;
  }

  async play(): Promise<void> {
    if (!this.sound) {
      return;
    }
    await this.sound.playAsync();
  }

  async pause(): Promise<void> {
    if (!this.sound) {
      return;
    }
    await this.sound.pauseAsync();
  }

  async seek(positionMillis: number): Promise<void> {
    if (!this.sound) {
      return;
    }
    await this.sound.setPositionAsync(Math.max(0, positionMillis));
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
      /* ignore unload errors */
    }

    this.sound = null;
  }

  async getStatus(): Promise<AVPlaybackStatus | null> {
    if (!this.sound) {
      return null;
    }
    return this.sound.getStatusAsync();
  }

  private handleStatus(status: AVPlaybackStatus): void {
    const now = Date.now();
    const shouldEmit =
      !status.isLoaded ||
      status.didJustFinish ||
      now - this.lastEmitAt >= this.positionThrottleMs;

    if (shouldEmit) {
      this.lastEmitAt = now;
      this.listener?.(status);
    }
  }
}

export const AudioService = new AudioServiceImpl();
