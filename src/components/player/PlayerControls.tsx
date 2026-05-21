import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { RepeatMode } from "../../services/audio/types";
import {
  useIsPlaying,
  usePlaybackStatus,
  usePlayerActions,
  useRepeatMode,
  useShuffleEnabled,
} from "../../store/playerSelectors";
import { authColors, authSpacing } from "../../theme/authTheme";

interface PlayerControlsProps {
  size?: "md" | "lg";
}

function repeatIcon(mode: RepeatMode): keyof typeof Ionicons.glyphMap {
  if (mode === "one") {
    return "repeat-outline";
  }
  if (mode === "all") {
    return "repeat";
  }
  return "repeat-outline";
}

function PlayerControlsComponent({ size = "md" }: PlayerControlsProps) {
  const isPlaying = useIsPlaying();
  const status = usePlaybackStatus();
  const repeatMode = useRepeatMode();
  const shuffleEnabled = useShuffleEnabled();
  const { togglePlay, playNext, playPrevious, cycleRepeatMode, toggleShuffle } =
    usePlayerActions();

  const playIconSize = size === "lg" ? 76 : 64;
  const skipIconSize = size === "lg" ? 36 : 32;
  const sideIconSize = size === "lg" ? 32 : 28;
  const isLoading = status === "loading" || status === "buffering";

  return (
    <View style={styles.wrap}>
      <View style={styles.controlCard}>
        <View style={styles.secondaryRow}>
          <Pressable
            onPress={toggleShuffle}
            accessibilityLabel="Toggle shuffle"
            style={styles.secondaryButton}
          >
            <Ionicons
              name="shuffle"
              size={22}
              color={shuffleEnabled ? authColors.accent : authColors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={cycleRepeatMode}
            accessibilityLabel="Cycle repeat mode"
            style={styles.secondaryButton}
          >
            <Ionicons
              name={repeatIcon(repeatMode)}
              size={22}
              color={
                repeatMode !== "off" ? authColors.accent : authColors.textMuted
              }
            />
            {repeatMode === "one" ? (
              <Text style={styles.repeatOne}>1</Text>
            ) : null}
          </Pressable>
        </View>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.lg,
  },
  controlCard: {
    backgroundColor: authColors.surface,
    borderRadius: authSpacing.xl,
    padding: authSpacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: authSpacing.xl,
    marginBottom: authSpacing.sm,
  },
  secondaryButton: {
    padding: authSpacing.sm,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: authSpacing.lg,
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
  repeatOne: {
    position: "absolute",
    right: 2,
    bottom: 0,
    color: authColors.accent,
    fontSize: 9,
    fontWeight: "800",
  },
});

export const PlayerControls = memo(PlayerControlsComponent);
