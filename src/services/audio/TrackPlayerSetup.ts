import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from "react-native-track-player";

import { safeLog } from "../../security/safeLog";

let setupPromise: Promise<void> | null = null;

/**
 * One-time TrackPlayer setup: foreground service, media notification capabilities.
 */
export async function ensureTrackPlayerReady(): Promise<void> {
  if (setupPromise) {
    return setupPromise;
  }

  setupPromise = (async () => {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
      autoUpdateMetadata: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        alwaysPauseOnInterruption: false,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      progressUpdateEventInterval: 0.5,
    });

    safeLog("info", "TrackPlayer ready (media session + notification)");
  })().catch((error) => {
    setupPromise = null;
    throw error;
  });

  return setupPromise;
}
