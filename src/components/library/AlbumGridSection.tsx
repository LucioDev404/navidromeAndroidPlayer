import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { Album } from "../../api/models/media";
import { usePlayerStore } from "../../store/usePlayerStore";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

interface AlbumGridSectionProps {
  title: string;
  albums: Album[];
  maxItems?: number;
}

export function AlbumGridSection({
  title,
  albums,
  maxItems = 12,
}: AlbumGridSectionProps) {
  const playSong = usePlayerStore((s) => s.playSong);

  if (albums.length === 0) {
    return null;
  }

  const visible = albums.slice(0, maxItems);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {visible.map((album) => (
          <Pressable
            key={album.id}
            style={styles.tile}
            onPress={() => {
              playSong({
                id: `album-preview-${album.id}`,
                title: album.title,
                artist: album.artist,
                artistId: album.artistId,
                album: album.title,
                albumId: album.id,
                track: 1,
                duration: album.duration,
                year: album.year,
                genre: album.genre,
                coverArtUrl: album.coverArtUrl,
              });
            }}
          >
            {album.coverArtUrl ? (
              <Image source={{ uri: album.coverArtUrl }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]} />
            )}
            <Text style={styles.albumTitle} numberOfLines={2}>
              {album.title}
            </Text>
            <Text style={styles.albumArtist} numberOfLines={1}>
              {album.artist}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: authSpacing.lg,
    paddingHorizontal: authSpacing.lg,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: authSpacing.md,
  },
  tile: {
    width: "48%",
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: authRadii.md,
    marginBottom: authSpacing.sm,
  },
  coverPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
  albumTitle: {
    color: authColors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  albumArtist: {
    color: authColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
