import { memo, useCallback } from "react";
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

  const startDragX = useSharedValue(0);

  const isDragging = useSharedValue(false);

  const localProgress = useSharedValue(progress);

  const thumbScale = useSharedValue(1);

  /**
   * Sync playback -> UI
   */
  useAnimatedReaction(
    () => progress,
    (p) => {
      if (isDragging.value) return;

      localProgress.value = withTiming(p, {
        duration: 120,
      });
    },
  );

  /**
   * Current displayed progress
   */
  const currentProgress = useDerivedValue(() => {
    if (isDragging.value) {
      return dragX.value / trackWidth.value;
    }

    return localProgress.value;
  });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  /**
   * Gesture
   */
  const panGesture = Gesture.Pan()

    .hitSlop(25)

    .shouldCancelWhenOutside(false)

    .onStart(() => {
      isDragging.value = true;

      cancelAnimation(localProgress);

      /**
       * Current thumb position
       */
      const currentX = currentProgress.value * trackWidth.value;

      dragX.value = currentX;

      startDragX.value = currentX;

      thumbScale.value = withSpring(1.15, {
        damping: 18,
        stiffness: 220,
      });
    })

    .onUpdate((event) => {
      /**
       * Relative drag from initial point
       */
      const nextX = startDragX.value + event.translationX;

      dragX.value = Math.min(Math.max(nextX, 0), trackWidth.value);
    })

    .onFinalize(() => {
      const ratio = dragX.value / trackWidth.value;

      const newPosition = Math.floor(ratio * max);

      runOnJS(seekTo)(newPosition);

      /**
       * Prevent release glitch
       */
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
    });

  /**
   * Fill
   */
  const fillAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: currentProgress.value * trackWidth.value,
    };
  });

  /**
   * Thumb
   */
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const x = currentProgress.value * trackWidth.value;

    return {
      transform: [
        {
          translateX: x - 7,
        },
        {
          scale: thumbScale.value,
        },
      ],

      opacity: isDragging.value ? 1 : 0.92,
    };
  });

  return (
    <View style={styles.wrap}>
      <Animated.View onLayout={onLayout} style={styles.trackContainer}>
        {/* Track */}
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillAnimatedStyle]} />
        </View>

        {/* Thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
        </GestureDetector>
      </Animated.View>

      {/* Labels */}
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

    shadowOffset: {
      width: 0,
      height: 2,
    },

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
