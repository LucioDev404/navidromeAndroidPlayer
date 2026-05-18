import { Text } from "react-native";

import { ScreenShell } from "../src/components/ScreenShell";

export default function LibraryScreen() {
  return (
    <ScreenShell title="Library">
      <Text style={{ color: "#B3B3B3" }}>
        Browse artists, albums, and songs from your Navidrome collection.
      </Text>
    </ScreenShell>
  );
}
