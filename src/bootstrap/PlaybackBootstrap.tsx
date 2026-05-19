import { ReactNode, useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { PlaybackController, AudioService } from "../services/audio";
import { usePlayerStore } from "../store/usePlayerStore";
import { useEndpointStore } from "../store/useEndpointStore";
import {
  bindRecentlyPlayedToPlayback,
  useRecentlyPlayedStore,
} from "../store/useRecentlyPlayedStore";
import { logger } from "../utils/logger";

interface PlaybackBootstrapProps {
  children: ReactNode;
}

/**
 * Initializes audio engine + playback event listeners once per app session.
 * Native Android: react-native-track-player (media session + notification).
 * Web: expo-av fallback.
 */
export function PlaybackBootstrap({ children }: PlaybackBootstrapProps) {
  useEffect(() => {
    PlaybackController.initialize().catch((error) => {
      logger.error("PlaybackController.initialize failed", error);
    });

    const unbindRecent = bindRecentlyPlayedToPlayback();
    // Sync engine state on app foreground / background transitions and
    // add lightweight debug logging for lifecycle debugging.
    const handleAppStateChange = (next: AppStateStatus) => {
      logger.info("AppState change", { next });
      // On resume, ensure playback store and engine are synchronized.
      if (next === "active") {
        // Quietly query engine status and reset playback state when nothing
        // is loaded to avoid stale UI showing `isPlaying=true` after a
        // full process restart.
        (async () => {
          try {
            const status = await AudioService.getStatus();
            // PlaybackController exposes onEngineStatus, but a small sync
            // helper here keeps store consistent when the app comes back.
            if (!status) {
              // No engine loaded — reset UI playback state to safe defaults
              usePlayerStore.getState().resetPlayback();
            }
          } catch (error) {
            logger.warn("Failed to sync playback status on resume", error);
          }
        })();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      unbindRecent();
      subscription.remove();
    };
  }, []);

  const activeEndpointId = useEndpointStore((s) => s.activeEndpointId);

  useEffect(() => {
    if (!activeEndpointId) {
      useRecentlyPlayedStore.getState().clear();
      return;
    }

    useRecentlyPlayedStore
      .getState()
      .hydrate(activeEndpointId)
      .catch(() => undefined);
  }, [activeEndpointId]);

  return <>{children}</>;
}
