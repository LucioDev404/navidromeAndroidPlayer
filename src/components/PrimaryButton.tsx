import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, style }: PrimaryButtonProps) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1DB954",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});
