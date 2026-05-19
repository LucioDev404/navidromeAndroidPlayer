import { useSegments } from "expo-router";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { MiniPlayer } from "./MiniPlayer";
import { useHasActiveTrack } from "../store/playerSelectors";

/**
 * Root-level mini player — visible on tabs AND album/artist stack screens.
 * Positioned at the bottom only (not full-screen) so library scroll/taps pass through.
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
    <View style={styles.host} pointerEvents="box-none" collapsable={false}>
      <MiniPlayer showTabBar={showTabBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
});

export const GlobalPlayerOverlay = memo(GlobalPlayerOverlayComponent);
