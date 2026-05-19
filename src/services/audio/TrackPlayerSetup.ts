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
        // IMPORTANT: stop playback when the app process is killed to avoid
        // orphaned / ghost playback. Previously this was ContinuePlayback
        // which allowed audio to continue after the JS process exited.
        // Stop playback and remove notification when the app process is killed.
        // This prevents orphaned audio playback after the JS process exits.
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
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
