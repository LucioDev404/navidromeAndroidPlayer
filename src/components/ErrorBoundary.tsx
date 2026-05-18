import { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { logger } from "../utils/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("Unhandled React render error", {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: "" });
    this.props.onRetry?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.message}</Text>
        <Pressable style={styles.button} onPress={this.handleRetry}>
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  message: {
    color: "#B3B3B3",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonLabel: {
    color: "#000000",
    fontWeight: "700",
  },
});
