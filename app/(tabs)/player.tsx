import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { AuthPrimaryButton } from "../../src/components/auth/AuthPrimaryButton";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import { usePlayerStore } from "../../src/store/usePlayerStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

export default function PlayerTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const queue = usePlayerStore((s) => s.queue);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthGradientBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + authSpacing.lg,
            paddingBottom: getScrollBottomInset(insets.bottom, {
              hasMiniPlayer: false,
            }),
          },
        ]}
      >
        <Text style={styles.title}>Now Playing</Text>

        {!currentSong ? (
          <View style={styles.empty}>
            <Ionicons
              name="musical-notes"
              size={56}
              color={authColors.textMuted}
            />
            <Text style={styles.emptyTitle}>Nothing playing</Text>
            <Text style={styles.emptyBody}>
              Pick a song from your Library or Search to start listening.
            </Text>
          </View>
        ) : (
          <>
            {currentSong.coverArtUrl ? (
              <Image
                source={{ uri: currentSong.coverArtUrl }}
                style={styles.art}
              />
            ) : (
              <View style={[styles.art, styles.artPlaceholder]} />
            )}
            <Text style={styles.songTitle}>{currentSong.title}</Text>
            <Text style={styles.songArtist}>{currentSong.artist}</Text>
            <Text style={styles.songAlbum}>{currentSong.album}</Text>

            <View style={styles.controls}>
              <Pressable onPress={togglePlay} style={styles.controlButton}>
                <Ionicons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={64}
                  color={authColors.accent}
                />
              </Pressable>
              <Pressable onPress={playNext} style={styles.controlButton}>
                <Ionicons
                  name="play-skip-forward"
                  size={32}
                  color={authColors.textPrimary}
                />
              </Pressable>
            </View>

            <Text style={styles.queueLabel}>
              Up next · {queue.length} tracks
            </Text>
          </>
        )}

        <AuthPrimaryButton
          label="Open full player"
          variant="secondary"
          onPress={() => router.push("/player")}
          style={styles.fullPlayerButton}
        />
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: authSpacing.lg,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: authSpacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: authSpacing.sm,
    paddingBottom: authSpacing.xl,
  },
  emptyTitle: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  emptyBody: {
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  art: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: authSpacing.lg,
  },
  artPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
  songTitle: {
    color: authColors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  songArtist: {
    color: authColors.textSecondary,
    fontSize: 16,
    marginTop: 6,
  },
  songAlbum: {
    color: authColors.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: authSpacing.lg,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: authSpacing.lg,
    marginBottom: authSpacing.lg,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  queueLabel: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.lg,
  },
  fullPlayerButton: {
    marginTop: "auto",
  },
});
