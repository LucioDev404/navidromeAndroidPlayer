import Constants from "expo-constants";

import { logger } from "../utils/logger";

const FALLBACK_API_BASE_URL = "https://your-navidrome-server.example.com";

function readApiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra;
  const value = extra?.apiBaseUrl;

  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  logger.warn(
    "apiBaseUrl missing in app config; using fallback placeholder URL",
    { extra },
  );

  return FALLBACK_API_BASE_URL;
}

export const env = {
  apiBaseUrl: readApiBaseUrl(),
};
