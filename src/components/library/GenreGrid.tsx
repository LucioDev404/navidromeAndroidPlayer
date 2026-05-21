import { memo, ReactElement, useCallback, useMemo } from "react";
import {
  FlatList,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";

import GenreCard from "./GenreCard";
import { authSpacing } from "../../theme/authTheme";

export type GenreGridItem =
  | { key: string; skeleton: true }
  | {
      key: string;
      skeleton: false;
      name: string;
      songCount: number;
      albumCount: number;
    };

interface GenreGridProps {
  data: GenreGridItem[];
  onPressGenre: (genreName: string) => void;
  numColumns?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ComponentType<any> | ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | ReactElement | null;
}

const GenreCardSkeleton = memo(function GenreCardSkeleton() {
  return (
    <View style={styles.itemWrapper}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonBlock} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineLong} />
      </View>
    </View>
  );
});

function GenreGrid({
  data,
  onPressGenre,
  numColumns,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
}: GenreGridProps) {
  const { width } = useWindowDimensions();

  const columns = useMemo(() => {
    if (typeof numColumns === "number") {
      return numColumns;
    }

    if (width >= 900) {
      return 3;
    }

    return 2;
  }, [numColumns, width]);

  const renderItem = useCallback(
    ({ item }: { item: GenreGridItem }) => {
      if (item.skeleton) {
        return <GenreCardSkeleton />;
      }

      return (
        <View style={styles.itemWrapper}>
          <GenreCard
            name={item.name}
            songCount={item.songCount}
            albumCount={item.albumCount}
            onPress={() => onPressGenre(item.name)}
          />
        </View>
      );
    },
    [onPressGenre],
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      numColumns={columns}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={12}
      windowSize={6}
      removeClippedSubviews
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: authSpacing.lg,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: authSpacing.sm,
  },
  itemWrapper: {
    flex: 1,
    marginBottom: authSpacing.lg,
    paddingHorizontal: authSpacing.xs,
  },
  skeletonCard: {
    flex: 1,
    minHeight: 140,
    borderRadius: authSpacing.lg,
    padding: authSpacing.md,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  skeletonBlock: {
    width: "70%",
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: authSpacing.sm,
  },
  skeletonLineShort: {
    width: "40%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: authSpacing.xs,
  },
  skeletonLineLong: {
    width: "80%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});

export default memo(GenreGrid);
