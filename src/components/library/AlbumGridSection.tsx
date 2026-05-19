import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import type { Album } from "../../api/models/media";
import { openAlbum } from "../../navigation/navigationHelpers";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";
import { CachedCover } from "../ui/CachedCover";

interface AlbumGridSectionProps {
  title: string;
  albums: Album[];
  maxItems?: number;
}

const TILE_WIDTH_PERCENT = "48%";

function AlbumGridTile({
  album,
  onPress,
}: {
  album: Album;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <CachedCover
        uri={album.coverArtUrl}
        size={160}
        borderRadius={authRadii.md}
        style={styles.cover}
      />
      <Text style={styles.albumTitle} numberOfLines={2}>
        {album.title}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {album.artist}
      </Text>
    </Pressable>
  );
}

const MemoAlbumGridTile = memo(AlbumGridTile);

function AlbumGridSectionComponent({
  title,
  albums,
  maxItems = 24,
}: AlbumGridSectionProps) {
  const router = useRouter();
  const visible = albums.slice(0, maxItems);

  const handleAlbumPress = useCallback(
    (album: Album) => {
      openAlbum(router, album.id);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Album }) => (
      <MemoAlbumGridTile album={item} onPress={() => handleAlbumPress(item)} />
    ),
    [handleAlbumPress],
  );

  const keyExtractor = useCallback((item: Album) => item.id, []);

  if (visible.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={visible}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        initialNumToRender={8}
        maxToRenderPerBatch={12}
      />
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
    gap: authSpacing.md,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: authSpacing.md,
  },
  tile: {
    width: TILE_WIDTH_PERCENT,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: authSpacing.sm,
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

export const AlbumGridSection = memo(AlbumGridSectionComponent);
