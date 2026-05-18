import CryptoJS from "crypto-js";

import type { EndpointCredentials, SubsonicAuthParams } from "../models/types";

export const SUBSONIC_CLIENT_ID = "NavidromePlayerExpo";
export const SUBSONIC_API_VERSION = "1.16.1";

/**
 * Subsonic token authentication (recommended over plaintext password param):
 *
 * 1. Client generates random `salt`
 * 2. Client computes `token = md5(password + salt)` as lowercase hex
 * 3. Request sends: u=username, t=token, s=salt, v=version, c=client, f=json
 *
 * The server stores only a hash of the password and validates token using the
 * same formula, so the password never travels over the wire after setup.
 */
export function generateSalt(length = 16): string {
  const bytes = CryptoJS.lib.WordArray.random(length);
  return CryptoJS.enc.Hex.stringify(bytes).slice(0, length * 2);
}

export function computeSubsonicToken(password: string, salt: string): string {
  return CryptoJS.MD5(`${password}${salt}`).toString(CryptoJS.enc.Hex);
}

export function buildSubsonicAuthParams(
  credentials: EndpointCredentials,
  salt: string = generateSalt(),
): SubsonicAuthParams {
  return {
    u: credentials.username.trim(),
    t: computeSubsonicToken(credentials.password, salt),
    s: salt,
    v: SUBSONIC_API_VERSION,
    c: SUBSONIC_CLIENT_ID,
    f: "json",
  };
}
