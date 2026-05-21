import { memo, useEffect, useMemo, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  type ImageStyle,
  type StyleProp,
} from "react-native";

import { authColors } from "../../theme/authTheme";

interface CachedCoverProps {
  uri?: string;
  size: number;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
}

function CachedCoverComponent({
  uri,
  size,
  borderRadius = 8,
  style,
}: CachedCoverProps) {
  const source = useMemo(() => (uri ? { uri } : null), [uri]);
  const [opacity] = useState(() => new Animated.Value(0));

  const onLoad = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    opacity.setValue(0);
  }, [source, opacity]);

  if (!source) {
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius },
          style,
        ]}
      />
    );
  }

  return (
    <Animated.Image
      source={source}
      onLoad={onLoad}
      style={[{ width: size, height: size, borderRadius, opacity }, style]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: authColors.surfaceHighlight,
  },
});

export const CachedCover = memo(CachedCoverComponent, (prev, next) => {
  return (
    prev.uri === next.uri &&
    prev.size === next.size &&
    prev.borderRadius === next.borderRadius
  );
});
