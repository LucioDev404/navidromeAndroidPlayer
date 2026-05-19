import { ReactNode, useEffect } from "react";

import { PlaybackController } from "../services/audio/PlaybackController";
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

    return () => {
      unbindRecent();
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
