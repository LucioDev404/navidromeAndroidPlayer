import { Text, TextInput } from "react-native";

import { ScreenShell } from "../src/components/ScreenShell";

export default function SearchScreen() {
  return (
    <ScreenShell title="Search">
      <Text style={{ color: "#B3B3B3", marginBottom: 20 }}>
        Search artists, albums, and songs across your Navidrome server.
      </Text>
      <TextInput
        placeholder="Search music"
        placeholderTextColor="#666"
        style={{
          width: "100%",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#333",
          padding: 14,
          color: "#FFF",
        }}
      />
    </ScreenShell>
  );
}
