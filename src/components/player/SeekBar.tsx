import { memo, useCallback, useMemo } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

/**
 * Premium seek bar with Spotify-like interactions:
 * - Smooth animated progress tracking with Reanimated
 * - Draggable thumb with visual feedback
 * - Responsive touch area (44px hit target)
 * - Interpolated position updates (no jank between 0.5s engine updates)
 * - Precise seeking without freezing playback
 */
function SeekBarComponent() {
  const { positionMillis, durationMillis } = usePlaybackProgress();
  const { seekTo } = usePlayerActions();

  const max = Math.max(durationMillis, 1);
  const progress = Math.min(positionMillis / max, 1);

  // Shared values for smooth animation
  const trackWidth = useSharedValue(0);
  const containerX = useSharedValue(0);
  const dragX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const animatedProgress = useSharedValue(progress);
  const thumbScale = useSharedValue(1);

  // Animate progress smoothly between engine updates
  useAnimatedReaction(
    () => progress,
    (currentProgress) => {
      animatedProgress.value = withSpring(currentProgress, {
        damping: 20,
        mass: 0.8,
        overshootClamping: true,
      });
    },
  );

  // Get track measurements on layout
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width;
      containerX.value = event.nativeEvent.layout.x;
    },
    [trackWidth, containerX],
  );

  // Pan gesture for dragging with proper absolute positioning
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          isDragging.value = true;
          thumbScale.value = withSpring(1.3, {
            damping: 20,
            mass: 0.5,
          });
        })
        .onChange((event) => {
          // Clamp X to track bounds using absolute position
          const newX = Math.min(
            Math.max(event.absoluteX - containerX.value, 0),
            trackWidth.value,
          );
          dragX.value = newX;
        })
        .onEnd(() => {
          if (trackWidth.value > 0) {
            const ratio = dragX.value / trackWidth.value;
            const newPosition = Math.floor(ratio * max);
            runOnJS(seekTo)(newPosition);
          }
          isDragging.value = false;
          thumbScale.value = withSpring(1, {
            damping: 20,
            mass: 0.5,
          });
        }),
    [dragX, isDragging, containerX, trackWidth, max, seekTo, thumbScale],
  );

  // Animated style for progress fill (smooth spring animation)
  const fillAnimatedStyle = useAnimatedStyle(() => {
    const currentProgress = isDragging.value
      ? dragX.value / trackWidth.value
      : animatedProgress.value;
    const fillWidth = interpolate(
      currentProgress,
      [0, 1],
      [0, trackWidth.value],
      Extrapolate.CLAMP,
    );

    return {
      width: fillWidth,
    };
  });

  // Animated style for thumb (interactive scale + position)
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const currentProgress = isDragging.value
      ? dragX.value / trackWidth.value
      : animatedProgress.value;
    const thumbX = interpolate(
      currentProgress,
      [0, 1],
      [0, trackWidth.value],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: thumbX - 6 }, // 12px thumb width, center it
        { scale: thumbScale.value },
      ],
    };
  });

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          onLayout={onLayout}
          style={styles.trackContainer}
          pointerEvents="box-none"
        >
          {/* Background track */}
          <View style={styles.track}>
            {/* Animated progress fill */}
            <Animated.View
              style={[styles.fill, fillAnimatedStyle]}
              pointerEvents="none"
            />
          </View>

          {/* Draggable thumb */}
          <Animated.View
            style={[styles.thumb, thumbAnimatedStyle]}
            pointerEvents="none"
          />
        </Animated.View>
      </GestureDetector>

      {/* Timestamps */}
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
    height: 44, // Hit target area (44px per accessibility guidelines)
    justifyContent: "center",
    width: "100%",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: authColors.surfaceHighlight,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    backgroundColor: authColors.accent,
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    // Position is controlled by animated transform
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: authSpacing.sm,
  },
  time: {
    color: authColors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
});

export const SeekBar = memo(SeekBarComponent);
