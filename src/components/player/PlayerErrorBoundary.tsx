import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { authColors, authSpacing } from "../../theme/authTheme";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export class PlayerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn("Player UI error", error.message, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.title}>Player unavailable</Text>
          <Text style={styles.body}>
            Something went wrong rendering playback controls. You can retry or
            go back and pick another track.
          </Text>
          <Pressable style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonLabel}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: authSpacing.lg,
    backgroundColor: authColors.background,
  },
  title: {
    color: authColors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: authSpacing.sm,
  },
  body: {
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: authSpacing.lg,
  },
  button: {
    backgroundColor: authColors.accent,
    borderRadius: 999,
    paddingHorizontal: authSpacing.lg,
    paddingVertical: authSpacing.sm,
  },
  buttonLabel: {
    color: "#000",
    fontWeight: "700",
  },
});
