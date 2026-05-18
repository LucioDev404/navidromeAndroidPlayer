import { getStreamUrl } from "../../api/subsonic/services/mediaService";
import { useEndpointStore } from "../../store/useEndpointStore";

export async function resolveStreamUrl(songId: string): Promise<string> {
  const client = await useEndpointStore.getState().getActiveClient();
  if (!client) {
    throw new Error("Sign in to a server before playing music.");
  }

  const url = getStreamUrl(client, songId);
  if (!url) {
    throw new Error("Unable to build stream URL for this track.");
  }

  return url;
}
