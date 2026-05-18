import { Redirect } from "expo-router";

import { useIsAuthenticated, useIsAuthReady } from "../src/store/useAuthStore";

export default function Index() {
  const isAuthReady = useIsAuthReady();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/library" />;
  }

  return <Redirect href="/login" />;
}
