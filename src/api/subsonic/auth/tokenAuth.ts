import CryptoJS from "crypto-js";
import * as ExpoCrypto from "expo-crypto";

import { bytesToHex } from "../../../crypto/bytes";
import type { EndpointCredentials, SubsonicAuthParams } from "../models/types";

export const SUBSONIC_CLIENT_ID = "NavidromePlayerExpo";
export const SUBSONIC_API_VERSION = "1.16.1";

const SALT_BYTE_LENGTH = 16;

/**
 * Subsonic token authentication (recommended over plaintext password param):
 *
 * 1. Client generates random `salt` (secure random via expo-crypto)
 * 2. Client computes `token = md5(password + salt)` as lowercase hex
 * 3. Request sends: u=username, t=token, s=salt, v=version, c=client, f=json
 *
 * crypto-js WordArray.random() is NOT used — it requires Node/browser crypto
 * and crashes React Native production builds with:
 * "Native crypto module could not be used to get secure random number"
 */
export function generateSalt(length = SALT_BYTE_LENGTH): string {
  const bytes = ExpoCrypto.getRandomBytes(length);
  return bytesToHex(bytes);
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
