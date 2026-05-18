import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FLOATING_TAB_BAR_BOTTOM_MARGIN,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  MINI_PLAYER_GAP,
  MINI_PLAYER_HEIGHT,
} from "./layoutMetrics";
import { usePlayerStore } from "../store/usePlayerStore";
import { authColors, authRadii, authSpacing } from "../theme/authTheme";

export function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  if (!currentSong) {
    return null;
  }

  const bottomOffset =
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_MARGIN +
    FLOATING_TAB_BAR_HEIGHT +
    FLOATING_TAB_BAR_BOTTOM_MARGIN +
    MINI_PLAYER_GAP;

  return (
    <View
      style={[styles.wrapper, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => router.push("/player")}
        style={styles.pressable}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 68 : 44}
          tint="dark"
          style={styles.bar}
        >
          <View style={styles.inner}>
            {currentSong.coverArtUrl ? (
              <Image
                source={{ uri: currentSong.coverArtUrl }}
                style={styles.art}
              />
            ) : (
              <View style={[styles.art, styles.artPlaceholder]} />
            )}
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {currentSong.artist}
              </Text>
            </View>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                togglePlay();
              }}
              hitSlop={12}
              style={styles.playButton}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={26}
                color={authColors.textPrimary}
              />
            </Pressable>
          </View>
        </BlurView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
    right: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  },
  pressable: {
    borderRadius: authRadii.lg,
    overflow: "hidden",
  },
  bar: {
    borderRadius: authRadii.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    height: MINI_PLAYER_HEIGHT,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: authSpacing.sm,
    backgroundColor: "rgba(24,24,24,0.72)",
  },
  art: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: authSpacing.sm,
  },
  artPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
  meta: {
    flex: 1,
    marginRight: authSpacing.sm,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
