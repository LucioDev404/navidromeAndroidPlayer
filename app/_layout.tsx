import "react-native-gesture-handler";

import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppInitializer } from "../src/bootstrap/AppInitializer";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { AuthGate } from "../src/navigation/AuthGate";
import { useIsAuthenticated, useIsAuthReady } from "../src/store/useAuthStore";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { logger } from "../src/utils/logger";

const AUTHENTICATED_HOME = "/(tabs)/library";

function ProtectedNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthReady = useIsAuthReady();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const root = segments[0];
    const isPublicRoute =
      root === undefined || root === "login" || root === "index";
    const isLegacyAuthRoute =
      root === "home" ||
      root === "library" ||
      root === "profile" ||
      root === "accounts";

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (
      isAuthenticated &&
      (root === "login" || root === "index" || isLegacyAuthRoute)
    ) {
      router.replace(AUTHENTICATED_HOME);
    }
  }, [isAuthReady, isAuthenticated, router, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
      <Stack.Screen name="home" />
      <Stack.Screen name="library" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="accounts" />
      <Stack.Screen name="search" />
    </Stack>
  );
}

export default function RootLayout() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <ErrorBoundary
      onRetry={() => {
        logger.info("Retrying app after error boundary reset");
        setResetKey((value) => value + 1);
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <AppInitializer resetKey={resetKey}>
            <StatusBar style="light" />
            <AuthGate>
              <ProtectedNavigation />
            </AuthGate>
          </AppInitializer>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
