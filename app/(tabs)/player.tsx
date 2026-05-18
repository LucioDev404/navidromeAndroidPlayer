import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../../src/components/auth/AuthGradientBackground";
import { AuthPrimaryButton } from "../../src/components/auth/AuthPrimaryButton";
import { PlayerControls } from "../../src/components/player/PlayerControls";
import { PlayerErrorBoundary } from "../../src/components/player/PlayerErrorBoundary";
import { PlayerTrackHeader } from "../../src/components/player/PlayerTrackHeader";
import { SeekBar } from "../../src/components/player/SeekBar";
import { getScrollBottomInset } from "../../src/navigation/layoutMetrics";
import { openFullPlayer } from "../../src/navigation/navigationHelpers";
import {
  useCurrentSong,
  useQueueLength,
} from "../../src/store/playerSelectors";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import { authColors, authSpacing } from "../../src/theme/authTheme";

export default function PlayerTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useIsAuthenticated();
  const currentSong = useCurrentSong();
  const queueLength = useQueueLength();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthGradientBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + authSpacing.lg,
            paddingBottom: getScrollBottomInset(insets.bottom, {
              hasMiniPlayer: false,
            }),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Now Playing</Text>

        <PlayerErrorBoundary>
          {!currentSong ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing playing</Text>
              <Text style={styles.emptyBody}>
                Pick a song from your Library, an album page, or Search.
              </Text>
            </View>
          ) : (
            <>
              <PlayerTrackHeader song={currentSong} artSize={260} />
              <SeekBar />
              <PlayerControls />
              <Text style={styles.queueLabel}>
                Up next · {queueLength} tracks
              </Text>
            </>
          )}
        </PlayerErrorBoundary>

        <AuthPrimaryButton
          label="Open full player"
          variant="secondary"
          onPress={() => openFullPlayer(router)}
          style={styles.fullPlayerButton}
        />
      </ScrollView>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: authSpacing.lg,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: authSpacing.lg,
  },
  empty: {
    alignItems: "center",
    paddingVertical: authSpacing.xl,
  },
  emptyTitle: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  emptyBody: {
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  queueLabel: {
    color: authColors.textSecondary,
    marginBottom: authSpacing.lg,
  },
  fullPlayerButton: {
    marginTop: authSpacing.md,
  },
});
