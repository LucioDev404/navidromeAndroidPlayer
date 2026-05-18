import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthGradientBackground } from "../src/components/auth/AuthGradientBackground";
import { FullPlayerContent } from "../src/components/player/FullPlayerContent";
import { PlayerErrorBoundary } from "../src/components/player/PlayerErrorBoundary";
import { authColors, authSpacing } from "../src/theme/authTheme";

export default function FullPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <AuthGradientBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + authSpacing.sm,
            paddingBottom: insets.bottom + authSpacing.md,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityLabel="Close player"
        >
          <Ionicons
            name="chevron-down"
            size={30}
            color={authColors.textPrimary}
          />
        </Pressable>

        <PlayerErrorBoundary>
          <FullPlayerContent />
        </PlayerErrorBoundary>
      </View>
    </AuthGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: authSpacing.lg,
  },
  close: {
    alignSelf: "flex-start",
    marginBottom: authSpacing.sm,
  },
});
