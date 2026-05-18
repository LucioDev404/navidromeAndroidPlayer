import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { authColors } from "../../theme/authTheme";

interface AuthGradientBackgroundProps {
  children: ReactNode;
}

export function AuthGradientBackground({
  children,
}: AuthGradientBackgroundProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[
          authColors.gradientStart,
          authColors.gradientMid,
          authColors.gradientEnd,
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {Platform.OS !== "web" ? (
        <BlurView intensity={28} tint="dark" style={styles.blurOrbTop} />
      ) : (
        <View style={[styles.blurOrbTop, styles.webOrb]} />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  blurOrbTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: "hidden",
  },
  webOrb: {
    backgroundColor: "rgba(29, 185, 84, 0.12)",
  },
  content: {
    flex: 1,
  },
});
