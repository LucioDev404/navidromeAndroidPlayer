import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PlayerControls } from "./PlayerControls";
import { PlayerTrackHeader } from "./PlayerTrackHeader";
import { QueueList } from "./QueueList";
import { SeekBar } from "./SeekBar";
import {
  useCurrentSong,
  usePlayerQueue,
  usePlaybackError,
  usePlaybackStatus,
  usePlayerActions,
} from "../../store/playerSelectors";
import { authColors, authSpacing } from "../../theme/authTheme";

function FullPlayerContentComponent() {
  const currentSong = useCurrentSong();
  const queue = usePlayerQueue();
  const playbackError = usePlaybackError();
  const status = usePlaybackStatus();
  const { retryPlayback } = usePlayerActions();

  if (!currentSong) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["rgba(29,185,84,0.18)", "rgba(5,5,5,0)"]}
        style={styles.glow}
        pointerEvents="none"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.sectionCard}>
          <PlayerTrackHeader song={currentSong} artSize={320} />
          <SeekBar />
          <PlayerControls size="lg" />
        </View>

        {playbackError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{playbackError}</Text>
            <Pressable onPress={retryPlayback} style={styles.retryButton}>
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {status === "buffering" || status === "loading" ? (
          <Text style={styles.statusHint}>Buffering from Navidrome…</Text>
        ) : null}

        <QueueList queue={queue} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    height: 280,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: authSpacing.xl,
    paddingHorizontal: authSpacing.lg,
  },
  sectionCard: {
    borderRadius: authSpacing.xl,
    backgroundColor: authColors.surface,
    padding: authSpacing.lg,
    marginHorizontal: -authSpacing.lg,
    marginBottom: authSpacing.lg,
    overflow: "hidden",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: authSpacing.lg,
  },
  emptyText: {
    color: authColors.textSecondary,
    fontSize: 16,
  },
  statusHint: {
    color: authColors.textMuted,
    fontSize: 13,
    marginBottom: authSpacing.md,
  },
  errorBox: {
    backgroundColor: "rgba(233,20,41,0.12)",
    borderRadius: 12,
    padding: authSpacing.md,
    marginBottom: authSpacing.md,
    borderWidth: 1,
    borderColor: "rgba(233,20,41,0.35)",
  },
  errorText: {
    color: authColors.danger,
    marginBottom: authSpacing.sm,
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: authColors.surfaceHighlight,
    paddingHorizontal: authSpacing.md,
    paddingVertical: authSpacing.xs,
    borderRadius: 999,
  },
  retryLabel: {
    color: authColors.textPrimary,
    fontWeight: "600",
  },
});

export const FullPlayerContent = memo(FullPlayerContentComponent);
