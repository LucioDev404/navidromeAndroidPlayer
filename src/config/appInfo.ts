import Constants from "expo-constants";
import { Platform } from "react-native";

import { isWeb } from "../utils/platform";

type Extra = {
  appVersion?: string;
  buildNumber?: string;
  environment?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const appInfo = {
  name: Constants.expoConfig?.name ?? "Navidrome Player",
  version: extra.appVersion ?? Constants.expoConfig?.version ?? "1.0.0",
  buildNumber: extra.buildNumber ?? "1",
  environment: extra.environment ?? (__DEV__ ? "development" : "production"),
  platform: Platform.OS,
  playbackEngine: isWeb ? "expo-av (web)" : "react-native-track-player",
} as const;
