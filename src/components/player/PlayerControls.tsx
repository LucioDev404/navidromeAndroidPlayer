import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import {
  useIsPlaying,
  usePlaybackStatus,
  usePlayerActions,
} from "../../store/playerSelectors";
import { authColors, authSpacing } from "../../theme/authTheme";

interface PlayerControlsProps {
  size?: "md" | "lg";
}

function PlayerControlsComponent({ size = "md" }: PlayerControlsProps) {
  const isPlaying = useIsPlaying();
  const status = usePlaybackStatus();
  const { togglePlay, playNext, playPrevious } = usePlayerActions();

  const playIconSize = size === "lg" ? 76 : 64;
  const skipIconSize = size === "lg" ? 36 : 32;
  const sideIconSize = size === "lg" ? 32 : 28;
  const isLoading = status === "loading" || status === "buffering";

  return (
    <View style={styles.row}>
      <Pressable
        onPress={playPrevious}
        accessibilityLabel="Previous track"
        style={styles.side}
      >
        <Ionicons
          name="play-skip-back"
          size={sideIconSize}
          color={authColors.textPrimary}
        />
      </Pressable>

      <Pressable
        onPress={togglePlay}
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
        style={styles.center}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={authColors.accent} />
        ) : (
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={playIconSize}
            color={authColors.accent}
          />
        )}
      </Pressable>

      <Pressable
        onPress={playNext}
        accessibilityLabel="Next track"
        style={styles.side}
      >
        <Ionicons
          name="play-skip-forward"
          size={skipIconSize}
          color={authColors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: authSpacing.lg,
    marginBottom: authSpacing.lg,
  },
  side: {
    padding: authSpacing.sm,
    minWidth: 44,
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
});

export const PlayerControls = memo(PlayerControlsComponent);
