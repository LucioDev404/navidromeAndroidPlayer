import { memo, useCallback, useMemo } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

import {
  usePlaybackProgress,
  usePlayerActions,
} from "../../store/playerSelectors";
import { authColors, authSpacing } from "../../theme/authTheme";

function formatTime(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SeekBarComponent() {
  const { positionMillis, durationMillis } = usePlaybackProgress();
  const { seekTo } = usePlayerActions();
  const max = Math.max(durationMillis, 1);
  const progress = Math.min(positionMillis / max, 1);

  const seekFromEvent = useCallback(
    (width: number, locationX: number) => {
      if (width <= 0) {
        return;
      }
      const ratio = Math.min(Math.max(locationX / width, 0), 1);
      seekTo(Math.floor(ratio * max));
    },
    [max, seekTo],
  );

  const barWidthRef = useMemo(() => ({ current: 0 }), []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      barWidthRef.current = event.nativeEvent.layout.width;
    },
    [barWidthRef],
  );

  const onPress = useCallback(
    (event: GestureResponderEvent) => {
      seekFromEvent(barWidthRef.current, event.nativeEvent.locationX);
    },
    [barWidthRef, seekFromEvent],
  );

  return (
    <View style={styles.wrap}>
      <Pressable onLayout={onLayout} onPress={onPress} style={styles.trackHit}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </Pressable>
      <View style={styles.labels}>
        <Text style={styles.time}>{formatTime(positionMillis)}</Text>
        <Text style={styles.time}>{formatTime(max)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: authSpacing.lg,
  },
  trackHit: {
    paddingVertical: authSpacing.sm,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: authColors.surfaceHighlight,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: authColors.accent,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: authSpacing.xs,
  },
  time: {
    color: authColors.textMuted,
    fontSize: 12,
  },
});

export const SeekBar = memo(SeekBarComponent);
