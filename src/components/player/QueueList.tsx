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
      style={[styles.row, isActive && styles.rowActive]}
    >
      <CachedCover uri={item.coverArtUrl} size={44} borderRadius={6} />
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

function QueueListComponent({ queue }: QueueListProps) {
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

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Up next</Text>
      <FlatList
        data={queue}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        scrollEnabled
        nestedScrollEnabled
        style={styles.list}
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
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: authSpacing.md,
    maxHeight: 320,
  },
  list: {
    flexGrow: 0,
  },
  heading: {
    color: authColors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: authSpacing.sm,
    borderRadius: 8,
  },
  rowActive: {
    backgroundColor: "rgba(29,185,84,0.12)",
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
  separator: {
    height: 4,
  },
});

export const QueueList = memo(QueueListComponent);
