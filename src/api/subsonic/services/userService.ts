import { SubsonicClient } from "../client/SubsonicClient";
import { SUBSONIC_PATHS } from "../endpoints/paths";

export interface SubsonicUser {
  username: string;
  email?: string;
  admin: boolean;
  folder: number[];
  maxBitRate?: number;
}

export async function fetchCurrentUser(
  client: SubsonicClient,
): Promise<SubsonicUser | null> {
  const payload = await client.request<Record<string, unknown>>(
    SUBSONIC_PATHS.getUser,
    {
      username: client.buildAuthParams().u,
    },
  );

  const user = payload.user as
    | {
        username?: string;
        email?: string;
        admin?: boolean;
        folder?: number | number[];
        maxBitRate?: number;
      }
    | undefined;

  if (!user?.username) {
    return null;
  }

  const folders =
    user.folder == null
      ? []
      : Array.isArray(user.folder)
        ? user.folder
        : [user.folder];

  return {
    username: user.username,
    email: user.email,
    admin: user.admin ?? false,
    folder: folders,
    maxBitRate: user.maxBitRate,
  };
}
