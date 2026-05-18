import { useSegments } from "expo-router";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { MiniPlayer } from "./MiniPlayer";
import { useHasActiveTrack } from "../store/playerSelectors";

/**
 * Root-level mini player — visible on tabs AND album/artist stack screens.
 */
function GlobalPlayerOverlayComponent() {
  const segments = useSegments();
  const hasTrack = useHasActiveTrack();

  const showTabBar = useMemo(() => {
    const root = segments[0];
    return root === "(tabs)";
  }, [segments]);

  if (!hasTrack) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <MiniPlayer showTabBar={showTabBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
});

export const GlobalPlayerOverlay = memo(GlobalPlayerOverlayComponent);
