import { useRouter } from "expo-router";
import { Text } from "react-native";

import { PrimaryButton } from "../src/components/PrimaryButton";
import { ScreenShell } from "../src/components/ScreenShell";
import { useAppStore } from "../src/store/useAppStore";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, login } = useAppStore();

  return (
    <ScreenShell title="Welcome back">
      <Text style={{ color: "#B3B3B3", marginBottom: 24 }}>
        Connect to your Navidrome server and play your music library.
      </Text>
      <PrimaryButton
        label={isAuthenticated ? "Continue to home" : "Login to Navidrome"}
        onPress={() => {
          login();
          router.replace("/home");
        }}
      />
    </ScreenShell>
  );
}
