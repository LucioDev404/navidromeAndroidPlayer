import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import { AlbumDetailScreen } from "../../src/components/browse/AlbumDetailScreen";
import { logger } from "../../src/utils/logger";

export default function AlbumRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const albumId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");

  useEffect(() => {
    if (albumId) {
      logger.debug("nav:albumRoute mounted", { albumId });
    }
  }, [albumId]);

  if (!albumId) {
    return null;
  }

  return <AlbumDetailScreen albumId={albumId} />;
}
