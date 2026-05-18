import { useLocalSearchParams } from "expo-router";

import { ArtistDetailScreen } from "../../src/components/browse/ArtistDetailScreen";

export default function ArtistRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const artistId = typeof id === "string" ? id : "";

  if (!artistId) {
    return null;
  }

  return <ArtistDetailScreen artistId={artistId} />;
}
