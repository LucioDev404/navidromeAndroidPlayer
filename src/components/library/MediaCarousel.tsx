import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
  type ViewStyle,
} from "react-native";

import type { Album, Artist, Playlist, Song } from "../../api/models/media";
import { openAlbum, openArtist } from "../../navigation/navigationHelpers";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";
import { CachedCover } from "../ui/CachedCover";

type CarouselItem = Album | Artist | Song | Playlist;

interface MediaCarouselProps {
  title: string;
  items: CarouselItem[];
  variant?: "album" | "artist" | "song";
  onPressItem?: (item: CarouselItem) => void;
  style?: ViewStyle;
}

function getTitle(item: CarouselItem): string {
  if ("name" in item) {
    return item.name;
  }
  return item.title;
}

function getSubtitle(item: CarouselItem): string {
  if ("artist" in item && item.artist) {
    return item.artist;
  }
  if ("albumCount" in item) {
    return `${item.albumCount} albums`;
  }
  if ("album" in item && item.album) {
    return item.album;
  }
  return "";
}

interface CarouselTileProps {
  item: CarouselItem;
  variant: "album" | "artist" | "song";
  tileSize: number;
  onPress: () => void;
}

const CarouselTile = memo(function CarouselTile({
  item,
  variant,
  tileSize,
  onPress,
}: CarouselTileProps) {
  const borderRadius = variant === "artist" ? tileSize / 2 : authRadii.md;

  return (
    <Pressable style={[styles.tile, { width: tileSize }]} onPress={onPress}>
      <CachedCover
        uri={item.coverArtUrl}
        size={tileSize}
        borderRadius={borderRadius}
        style={styles.cover}
      />
      <Text style={styles.itemTitle} numberOfLines={2}>
        {getTitle(item)}
      </Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {getSubtitle(item)}
      </Text>
    </Pressable>
  );
});

function MediaCarouselComponent({
  title,
  items,
  variant = "album",
  onPressItem,
  style,
}: MediaCarouselProps) {
  const router = useRouter();
  const tileSize = variant === "artist" ? 140 : 160;

  const defaultPress = useCallback(
    (item: CarouselItem) => {
      if (variant === "album" && "title" in item) {
        openAlbum(router, item.id);
        return;
      }
      if (variant === "artist" && "name" in item) {
        openArtist(router, item.id);
      }
    },
    [router, variant],
  );

  const renderItem: ListRenderItem<CarouselItem> = useCallback(
    ({ item }) => (
      <CarouselTile
        item={item}
        variant={variant}
        tileSize={tileSize}
        onPress={() => (onPressItem ?? defaultPress)(item)}
      />
    ),
    [defaultPress, onPressItem, tileSize, variant],
  );

  const keyExtractor = useCallback(
    (item: CarouselItem, index: number) =>
      "id" in item && item.id ? item.id : `${getTitle(item)}-${index}`,
    [],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: authSpacing.lg,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.md,
    paddingHorizontal: authSpacing.lg,
  },
  list: {
    paddingHorizontal: authSpacing.lg,
    gap: authSpacing.md,
  },
  tile: {
    marginRight: authSpacing.md,
  },
  cover: {
    marginBottom: authSpacing.sm,
  },
  itemTitle: {
    color: authColors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  itemSubtitle: {
    color: authColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

export const MediaCarousel = memo(MediaCarouselComponent);
