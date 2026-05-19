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
      <CachedCover
        uri={song.coverArtUrl}
        size={artSize}
        borderRadius={16}
        style={styles.art}
      />
      <Text style={styles.title}>{song.title}</Text>
      {song.artistId ? (
        <Pressable
          onPress={openArtistDetail}
          accessibilityRole="button"
          accessibilityLabel={`Open artist ${song.artist}`}
        >
          <Text style={styles.artist}>{song.artist}</Text>
        </Pressable>
      ) : (
        <Text style={styles.artist}>{song.artist}</Text>
      )}
      <Text style={styles.album}>{song.album}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.lg,
  },
  art: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    marginBottom: authSpacing.lg,
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
