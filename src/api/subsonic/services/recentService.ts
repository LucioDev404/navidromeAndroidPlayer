import { safeLog } from "../../../security/safeLog";
import { SubsonicMappers } from "../../mappers/subsonic";
import type { Song } from "../../models/media";
import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import type { SubsonicSong } from "../models/responses";
import { asArray } from "../utils/parse";

const mappers = SubsonicMappers;

export async function fetchNowPlaying(client: SubsonicClient): Promise<Song[]> {
  try {
    const payload = await client.request<Record<string, unknown>>(
      SUBSONIC_PATHS.getNowPlaying,
    );

    const nowPlaying = payload.nowPlaying as
      | { entry?: SubsonicSong | SubsonicSong[] }
      | undefined;

    return mappers.mapSongs(client, asArray(nowPlaying?.entry));
  } catch (error) {
    safeLog("warn", "getNowPlaying failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
