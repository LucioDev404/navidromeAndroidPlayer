import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
  getMiniPlayerBottomOffset,
  MINI_PLAYER_HEIGHT,
} from "./layoutMetrics";
import { openArtist, openFullPlayer } from "./navigationHelpers";
import { CachedCover } from "../components/ui/CachedCover";
import { GlassSurface } from "../components/ui/GlassSurface";
import {
  useCurrentSong,
  useIsPlaying,
  usePlaybackStatus,
  usePlayerActions,
} from "../store/playerSelectors";
import { authColors, authRadii, authSpacing } from "../theme/authTheme";

interface MiniPlayerProps {
  showTabBar: boolean;
}

function MiniPlayerComponent({ showTabBar }: MiniPlayerProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentSong = useCurrentSong();
  const isPlaying = useIsPlaying();
  const status = usePlaybackStatus();
  const { togglePlay } = usePlayerActions();

  const openPlayer = useCallback(() => {
    openFullPlayer(router);
  }, [router]);

  const handleToggle = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      togglePlay();
    },
    [togglePlay],
  );

  const handleArtistPress = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      if (currentSong?.artistId) {
        openArtist(router, currentSong.artistId);
      }
    },
    [currentSong?.artistId, router],
  );

  if (!currentSong) {
    return null;
  }

  const bottomOffset = getMiniPlayerBottomOffset(insets.bottom, { showTabBar });
  const isBuffering = status === "loading" || status === "buffering";

  return (
    <View
      style={[styles.wrapper, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <Pressable onPress={openPlayer} style={styles.pressable}>
        <GlassSurface style={styles.bar}>
          <View style={styles.inner}>
            <CachedCover
              uri={currentSong.coverArtUrl}
              size={42}
              borderRadius={6}
            />
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={1}>
                {currentSong.title}
              </Text>
              {currentSong.artistId ? (
                <Pressable
                  onPress={handleArtistPress}
                  accessibilityRole="button"
                  accessibilityLabel={`Open artist ${currentSong.artist}`}
                >
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {currentSong.artist}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {currentSong.artist}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleToggle}
              hitSlop={12}
              style={styles.playButton}
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
            >
              <Ionicons
                name={isBuffering ? "hourglass" : isPlaying ? "pause" : "play"}
                size={26}
                color={authColors.textPrimary}
              />
            </Pressable>
          </View>
        </GlassSurface>
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
  meta: {
    flex: 1,
    marginLeft: authSpacing.sm,
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

export const MiniPlayer = memo(MiniPlayerComponent);
