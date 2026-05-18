import { Text } from "react-native";

import { ScreenShell } from "../src/components/ScreenShell";

export default function PlayerScreen() {
  return (
    <ScreenShell title="Player">
      <Text style={{ color: "#B3B3B3" }}>
        Player controls and queue management will be implemented in Phase 4.
      </Text>
    </ScreenShell>
  );
}
