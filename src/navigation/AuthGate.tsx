import { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useIsAuthReady } from "../store/useAuthStore";
import { authColors } from "../theme/authTheme";

interface AuthGateProps {
  children: ReactNode;
}

/**
 * Prevents protected routes from rendering before secure hydration + session restore.
 * Works with AppInitializer splash — no login-screen flash.
 */
export function AuthGate({ children }: AuthGateProps) {
  const isAuthReady = useIsAuthReady();

  if (!isAuthReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={authColors.accent} />
        <Text style={styles.text}>Restoring your session…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authColors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    color: authColors.textSecondary,
    fontSize: 14,
  },
});
