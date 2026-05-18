import { BlurView } from "expo-blur";
import { memo, type ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import { supportsNativeBlur } from "../../utils/platform";

interface GlassSurfaceProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

function GlassSurfaceComponent({
  children,
  style,
  intensity = 48,
}: GlassSurfaceProps) {
  if (supportsNativeBlur) {
    return (
      <BlurView
        intensity={Platform.OS === "ios" ? intensity + 20 : intensity}
        tint="dark"
        style={style}
      >
        {children}
      </BlurView>
    );
  }

  return <View style={[style, styles.webFallback]}>{children}</View>;
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: "rgba(24,24,24,0.94)",
  },
});

export const GlassSurface = memo(GlassSurfaceComponent);
