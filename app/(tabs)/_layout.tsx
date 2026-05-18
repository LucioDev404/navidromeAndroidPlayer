import { Tabs } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { FloatingTabBar } from "../../src/navigation/FloatingTabBar";
import { MiniPlayer } from "../../src/navigation/MiniPlayer";
import { useIsAuthenticated } from "../../src/store/useAuthStore";
import useLibraryStore from "../../src/store/useLibraryStore";

export default function MainTabsLayout() {
  const isAuthenticated = useIsAuthenticated();
  const loadLibrary = useLibraryStore((s) => s.loadLibrary);
  const isHydrated = useLibraryStore((s) => s.isHydrated);

  useEffect(() => {
    if (isAuthenticated && !isHydrated) {
      loadLibrary().catch(() => undefined);
    }
  }, [isAuthenticated, isHydrated, loadLibrary]);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: true,
        }}
      >
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
          }}
        />
        <Tabs.Screen
          name="player"
          options={{
            title: "Player",
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050505",
  },
});
