import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Song } from "../../api/models/media";
import { openArtist } from "../../navigation/navigationHelpers";
import { authColors, authSpacing } from "../../theme/authTheme";
import { CachedCover } from "../ui/CachedCover";

interface PlayerTrackHeaderProps {
  song: Song;
  artSize?: number;
}

function PlayerTrackHeaderComponent({
  song,
  artSize = 280,
}: PlayerTrackHeaderProps) {
  const router = useRouter();

  const openArtistDetail = useCallback(() => {
    if (song.artistId) {
      openArtist(router, song.artistId);
    }
  }, [router, song.artistId]);

  return (
    <View style={styles.wrap}>
      <View style={styles.artWrap}>
        <CachedCover
          uri={song.coverArtUrl}
          size={artSize}
          borderRadius={20}
          style={styles.art}
        />
      </View>
      <Text style={styles.title}>{song.title}</Text>
      <Pressable
        onPress={openArtistDetail}
        accessibilityRole="button"
        accessibilityLabel={`Open artist ${song.artist}`}
        style={({ pressed }) => [
          styles.artistButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.artist}>{song.artist}</Text>
      </Pressable>
      <View style={styles.metaRow}>
        <Text style={styles.album}>{song.album}</Text>
        {song.year ? <Text style={styles.dot}>•</Text> : null}
        {song.year ? <Text style={styles.year}>{song.year}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.lg,
  },
  artWrap: {
    marginBottom: authSpacing.lg,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 12,
  },
  art: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  artistButton: {
    marginTop: authSpacing.sm,
    paddingVertical: authSpacing.xs,
  },
  artist: {
    color: authColors.accent,
    fontSize: 18,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: authSpacing.xs,
    marginTop: authSpacing.sm,
  },
  album: {
    color: authColors.textSecondary,
    fontSize: 14,
  },
  dot: {
    color: authColors.textSecondary,
    fontSize: 14,
    marginHorizontal: authSpacing.xs,
  },
  year: {
    color: authColors.textSecondary,
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});

export const PlayerTrackHeader = memo(
  PlayerTrackHeaderComponent,
  (prev, next) =>
    prev.song.id === next.song.id &&
    prev.song.title === next.song.title &&
    prev.song.artist === next.song.artist &&
    prev.song.artistId === next.song.artistId &&
    prev.song.coverArtUrl === next.song.coverArtUrl,
);
