import { memo, useMemo } from "react";
import {
  Image,
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
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius }, style]}
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
