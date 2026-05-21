import { useSegments } from "expo-router";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { MiniPlayer } from "./MiniPlayer";
import { useMiniPlayerState } from "../store/playerSelectors";

/**
 * Root-level mini player — visible on tabs AND album/artist stack screens.
 * Positioned at the bottom only (not full-screen) so library scroll/taps pass through.
 */
function GlobalPlayerOverlayComponent() {
  const segments = useSegments();
  const miniPlayer = useMiniPlayerState(segments);

  if (!miniPlayer.visible) {
    return null;
  }

  return (
    <View style={styles.host} pointerEvents="box-none" collapsable={false}>
      <MiniPlayer showTabBar={miniPlayer.showTabBar} />
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
