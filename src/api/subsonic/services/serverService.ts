import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";
import { asArray } from "../utils/parse";

export interface ServerLicense {
  valid: boolean;
  email?: string;
  expires?: string;
}

export interface MusicFolder {
  id: number;
  name: string;
}

export async function fetchLicense(
  client: SubsonicClient,
): Promise<ServerLicense> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getLicense,
  );
  const license = payload.license as
    | { valid?: boolean; email?: string; expires?: string }
    | undefined;

  return {
    valid: license?.valid ?? false,
    email: license?.email,
    expires: license?.expires,
  };
}

export async function fetchMusicFolders(
  client: SubsonicClient,
): Promise<MusicFolder[]> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getMusicFolders,
  );

  const folders = payload.musicFolders as
    | {
        musicFolder?:
          | { id?: number; name?: string }
          | { id?: number; name?: string }[];
      }
    | undefined;

  return asArray(folders?.musicFolder)
    .filter((folder) => folder.id != null && folder.name)
    .map((folder) => ({
      id: folder.id as number,
      name: folder.name as string,
    }));
}

export async function validateServerHealth(client: SubsonicClient): Promise<{
  pingOk: boolean;
  version?: string;
  licenseValid: boolean;
  folderCount: number;
}> {
  const ping = await client.ping();
  const [license, folders] = await Promise.all([
    fetchLicense(client).catch(() => ({ valid: false })),
    fetchMusicFolders(client).catch(() => [] as MusicFolder[]),
  ]);

  return {
    pingOk: ping.status === "ok",
    version: ping.version,
    licenseValid: license.valid,
    folderCount: folders.length,
  };
}
