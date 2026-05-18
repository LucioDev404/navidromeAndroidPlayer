import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../src/components/auth/AuthGradientBackground";
import { usePlayerStore } from "../src/store/usePlayerStore";
import { authColors, authSpacing } from "../src/theme/authTheme";

export default function FullPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const queue = usePlayerStore((s) => s.queue);

  return (
    <AuthGradientBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + authSpacing.md,
            paddingBottom: insets.bottom + authSpacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityLabel="Close player"
        >
          <Ionicons
            name="chevron-down"
            size={30}
            color={authColors.textPrimary}
          />
        </Pressable>

        {!currentSong ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No track selected</Text>
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

            <Text style={styles.title}>{currentSong.title}</Text>
            <Text style={styles.artist}>{currentSong.artist}</Text>
            <Text style={styles.album}>{currentSong.album}</Text>

            <View style={styles.controls}>
              <Pressable onPress={togglePlay}>
                <Ionicons
                  name={isPlaying ? "pause-circle" : "play-circle"}
                  size={76}
                  color={authColors.accent}
                />
              </Pressable>
              <Pressable onPress={playNext} style={styles.skip}>
                <Ionicons
                  name="play-skip-forward"
                  size={36}
                  color={authColors.textPrimary}
                />
              </Pressable>
            </View>

            <Text style={styles.queue}>Queue · {queue.length} songs</Text>
            <Text style={styles.note}>
              Full streaming playback will connect to your Navidrome stream URL
              in the next phase.
            </Text>
          </>
        )}
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: authSpacing.lg,
  },
  close: {
    alignSelf: "flex-start",
    marginBottom: authSpacing.md,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: authColors.textSecondary,
    fontSize: 16,
  },
  art: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: authSpacing.xl,
  },
  artPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  artist: {
    color: authColors.textSecondary,
    fontSize: 18,
    marginTop: 8,
  },
  album: {
    color: authColors.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: authSpacing.xl,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: authSpacing.xl,
    marginBottom: authSpacing.lg,
  },
  skip: {
    padding: authSpacing.sm,
  },
  queue: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.sm,
  },
  note: {
    color: authColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
