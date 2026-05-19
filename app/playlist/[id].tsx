import { useLocalSearchParams } from "expo-router";

import { PlaylistDetailScreen } from "../../src/components/browse/PlaylistDetailScreen";

export default function PlaylistRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const playlistId = typeof id === "string" ? id : "";

  if (!playlistId) {
    return null;
  }

  return <PlaylistDetailScreen playlistId={playlistId} />;
}
