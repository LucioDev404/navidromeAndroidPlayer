import { useLocalSearchParams } from "expo-router";

import { AlbumDetailScreen } from "../../src/components/browse/AlbumDetailScreen";

export default function AlbumRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const albumId = typeof id === "string" ? id : "";

  if (!albumId) {
    return null;
  }

  return <AlbumDetailScreen albumId={albumId} />;
}
