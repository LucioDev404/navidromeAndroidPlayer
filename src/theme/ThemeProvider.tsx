import { ReactNode } from "react";
import { Appearance, ColorSchemeName, StyleSheet, View } from "react-native";

const darkColors = {
  background: "#000000",
  surface: "#111111",
  card: "#1C1C1C",
  text: "#FFFFFF",
  subtext: "#B3B3B3",
  accent: "#1DB954",
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme: ColorSchemeName = Appearance.getColorScheme() ?? "dark";

  return (
    <View
      style={[
        styles.container,
        colorScheme === "dark" ? styles.dark : styles.light,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  dark: {
    backgroundColor: darkColors.background,
  },
  light: {
    backgroundColor: "#F5F5F5",
  },
});
