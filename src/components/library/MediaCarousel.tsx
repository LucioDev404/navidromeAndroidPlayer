import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import type { Album, Artist, Playlist, Song } from "../../api/models/media";
import { authColors, authRadii, authSpacing } from "../../theme/authTheme";

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

function getCover(item: CarouselItem): string | undefined {
  return item.coverArtUrl;
}

export function MediaCarousel({
  title,
  items,
  variant = "album",
  onPressItem,
  style,
}: MediaCarouselProps) {
  if (items.length === 0) {
    return null;
  }

  const tileSize = variant === "artist" ? 140 : 160;

  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item, index) =>
          "id" in item && item.id ? item.id : `${getTitle(item)}-${index}`
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.tile, { width: tileSize }]}
            onPress={() => onPressItem?.(item)}
          >
            {getCover(item) ? (
              <Image
                source={{ uri: getCover(item) }}
                style={[
                  styles.cover,
                  {
                    width: tileSize,
                    height: tileSize,
                    borderRadius:
                      variant === "artist" ? tileSize / 2 : authRadii.md,
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.coverPlaceholder,
                  {
                    width: tileSize,
                    height: tileSize,
                    borderRadius:
                      variant === "artist" ? tileSize / 2 : authRadii.md,
                  },
                ]}
              />
            )}
            <Text style={styles.itemTitle} numberOfLines={2}>
              {getTitle(item)}
            </Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {getSubtitle(item)}
            </Text>
          </Pressable>
        )}
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
  coverPlaceholder: {
    backgroundColor: authColors.surfaceHighlight,
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
