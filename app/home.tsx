import { useRouter } from "expo-router";
import { Text } from "react-native";

import { PrimaryButton } from "../src/components/PrimaryButton";
import { ScreenShell } from "../src/components/ScreenShell";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenShell title="Home">
      <Text style={{ color: "#B3B3B3", marginBottom: 24 }}>
        Your music feed is waiting. Start browsing your library or searching for
        tracks.
      </Text>
      <PrimaryButton
        label="Go to Library"
        onPress={() => router.push("/library")}
      />
    </ScreenShell>
  );
}
