import { memo, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import type { Song } from "../../api/models/media";
import {
  useActiveQueueIndex,
  usePlayerActions,
} from "../../store/playerSelectors";
import { authColors, authSpacing } from "../../theme/authTheme";
import { CachedCover } from "../ui/CachedCover";

interface QueueListProps {
  queue: Song[];
  /** When true, list expands inside a parent ScrollView (no nested scroll / height cap). */
  embeddedInScrollView?: boolean;
}

const ROW_HEIGHT = 56;

function QueueRow({
  item,
  isActive,
  onPress,
}: {
  item: Song;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isActive && styles.rowActive,
        pressed && styles.rowPressed,
      ]}
    >
      {isActive ? (
        <View style={styles.indicator} />
      ) : (
        <View style={styles.indicatorPlaceholder} />
      )}
      <CachedCover uri={item.coverArtUrl} size={44} borderRadius={8} />
      <View style={styles.meta}>
        <Text
          style={[styles.title, isActive && styles.titleActive]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </Pressable>
  );
}

const MemoQueueRow = memo(QueueRow);

function QueueListComponent({
  queue,
  embeddedInScrollView = false,
}: QueueListProps) {
  const activeIndex = useActiveQueueIndex();
  const { playQueueIndex } = usePlayerActions();

  const renderItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => (
      <MemoQueueRow
        item={item}
        isActive={index === activeIndex}
        onPress={() => playQueueIndex(index)}
      />
    ),
    [activeIndex, playQueueIndex],
  );

  const keyExtractor = useCallback((item: Song) => item.id, []);

  if (queue.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrap, embeddedInScrollView && styles.wrapEmbedded]}>
      <Text style={styles.heading}>Up next</Text>
      <Text style={styles.subheading}>{queue.length} tracks in queue</Text>
      <View style={styles.queueCard}>
        <FlatList
          data={queue}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={!embeddedInScrollView}
          nestedScrollEnabled={!embeddedInScrollView}
          style={[styles.list, embeddedInScrollView && styles.listEmbedded]}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={14}
          windowSize={6}
          getItemLayout={(_, index) => ({
            length: ROW_HEIGHT,
            offset: ROW_HEIGHT * index,
            index,
          })}
          ItemSeparatorComponent={Separator}
        />
      </View>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: authSpacing.md,
    maxHeight: 420,
  },
  wrapEmbedded: {
    maxHeight: undefined,
    marginBottom: authSpacing.lg,
  },
  list: {
    flexGrow: 0,
  },
  listEmbedded: {
    flexGrow: 1,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: authSpacing.md,
    borderRadius: 12,
    backgroundColor: authColors.surface,
  },
  rowActive: {
    backgroundColor: "rgba(29,185,84,0.16)",
    borderColor: authColors.accent,
    borderWidth: 1,
  },
  rowPressed: {
    opacity: 0.7,
  },
  indicator: {
    width: 4,
    height: 32,
    borderRadius: 999,
    backgroundColor: authColors.accent,
    marginRight: authSpacing.sm,
  },
  indicatorPlaceholder: {
    width: 4,
    height: 32,
    marginRight: authSpacing.sm,
  },
  meta: {
    flex: 1,
    marginLeft: authSpacing.sm,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  titleActive: {
    color: authColors.accent,
  },
  subtitle: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  queueCard: {
    borderRadius: 0,
    backgroundColor: "transparent",
    overflow: "hidden",
    borderWidth: 0,
  },
  listContent: {
    paddingBottom:
      authSpacing.xl + authSpacing.lg + authSpacing.md + authSpacing.sm,
  },
  heading: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.xs,
  },
  subheading: {
    color: authColors.textSecondary,
    fontSize: 13,
    marginBottom: authSpacing.sm,
  },
  separator: {
    height: 4,
  },
});

export const QueueList = memo(QueueListComponent);
