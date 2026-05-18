import { ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface ScreenShellProps {
  title: string;
  children: ReactNode;
}

export function ScreenShell({ title, children }: ScreenShellProps) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#050505",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 16,
  },
  content: {
    backgroundColor: "#111111",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
});
