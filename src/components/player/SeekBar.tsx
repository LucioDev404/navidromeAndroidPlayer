import { memo, useCallback, useMemo } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

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

  const trackWidth = useSharedValue(0);

  const dragX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const localProgress = useSharedValue(progress);
  const thumbScale = useSharedValue(1);

  useAnimatedReaction(
    () => progress,
    (p) => {
      if (isDragging.value) return;
      localProgress.value = withTiming(p, { duration: 120 });
    },
  );

  const currentProgress = useDerivedValue(() => {
    if (isDragging.value) {
      return dragX.value / trackWidth.value;
    }
    return localProgress.value;
  });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  }, []);

  /**
   * 🚨 ONLY THUMB GESTURE
   */
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          isDragging.value = true;

          cancelAnimation(localProgress);

          dragX.value = currentProgress.value * trackWidth.value;

          thumbScale.value = withSpring(1.15, {
            damping: 18,
            stiffness: 220,
          });
        })

        .onChange((event) => {
          dragX.value = Math.min(
            Math.max(dragX.value + event.changeX, 0),
            trackWidth.value,
          );
        })

        .onEnd(() => {
          const ratio = dragX.value / trackWidth.value;
          const newPosition = Math.floor(ratio * max);

          runOnJS(seekTo)(newPosition);

          localProgress.value = withTiming(ratio, {
            duration: 150,
          });

          thumbScale.value = withSpring(1, {
            damping: 18,
            stiffness: 220,
          });

          setTimeout(() => {
            isDragging.value = false;
          }, 150);
        }),
    [max, seekTo],
  );

  const fillAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: currentProgress.value * trackWidth.value,
    };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const x = currentProgress.value * trackWidth.value;

    return {
      transform: [{ translateX: x - 7 }, { scale: thumbScale.value }],
      opacity: 1,
    };
  });

  return (
    <View style={styles.wrap}>
      {/* TRACK IS NOW ONLY VISUAL */}
      <Animated.View onLayout={onLayout} style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillAnimatedStyle]} />
        </View>

        {/* ONLY THUMB IS INTERACTIVE */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
        </GestureDetector>
      </Animated.View>

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
  trackContainer: {
    height: 44,
    justifyContent: "center",
    width: "100%",
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: authColors.surfaceHighlight,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: authColors.accent,
    borderRadius: 999,
  },
  thumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: authColors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: authSpacing.sm,
  },
  time: {
    color: authColors.textMuted,
    fontSize: 12,
  },
});

export const SeekBar = memo(SeekBarComponent);
