import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  FLOATING_TAB_BAR_BOTTOM_MARGIN,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
} from "./layoutMetrics";
import { authColors, authRadii } from "../theme/authTheme";

type TabKey = "library" | "search" | "player" | "account";

const TAB_CONFIG: Record<
  TabKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  library: { label: "Library", icon: "albums" },
  search: { label: "Search", icon: "search" },
  player: { label: "Player", icon: "play-circle" },
  account: { label: "Account", icon: "person-circle" },
};

function resolveTabKey(routeName: string): TabKey | null {
  if (routeName in TAB_CONFIG) {
    return routeName as TabKey;
  }
  return null;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom + FLOATING_TAB_BAR_BOTTOM_MARGIN,
          paddingHorizontal: FLOATING_TAB_BAR_HORIZONTAL_MARGIN,
        },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 72 : 48}
        tint="dark"
        style={styles.bar}
      >
        <View style={styles.barInner}>
          {state.routes.map((route, index) => {
            const tabKey = resolveTabKey(route.name);
            if (!tabKey) {
              return null;
            }

            const config = TAB_CONFIG[tabKey];
            const isFocused = state.index === index;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={
                  options.tabBarAccessibilityLabel ?? config.label
                }
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tab}
              >
                <Ionicons
                  name={config.icon}
                  size={22}
                  color={isFocused ? authColors.accent : authColors.textMuted}
                />
                <Text
                  style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    borderRadius: authRadii.pill,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
    height: FLOATING_TAB_BAR_HEIGHT,
  },
  barInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(18,18,18,0.55)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: authColors.textMuted,
  },
  tabLabelActive: {
    color: authColors.accent,
  },
});
