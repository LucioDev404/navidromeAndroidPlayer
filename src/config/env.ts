import Constants from "expo-constants";

export const env = {
  apiBaseUrl:
    typeof Constants.expoConfig?.extra?.apiBaseUrl === "string"
      ? Constants.expoConfig.extra.apiBaseUrl
      : "https://your-navidrome-server.example.com",
};
