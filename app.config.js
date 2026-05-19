const appJson = require("./app.json");

const packageJson = require("./package.json");

const buildNumber =
  process.env.ANDROID_VERSION_CODE || process.env.GITHUB_RUN_NUMBER || "1";

const appVersion = packageJson.version || appJson.expo.version;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  version: appVersion,
  android: {
    ...appJson.expo.android,
    versionCode: Number.parseInt(String(buildNumber), 10) || 1,
  },
  ios: {
    ...appJson.expo.ios,
    buildNumber: String(buildNumber),
  },
  extra: {
    ...appJson.expo.extra,
    appVersion,
    buildNumber: String(buildNumber),
    environment:
      process.env.APP_ENV ||
      (process.env.NODE_ENV === "development" ? "development" : "production"),
  },
};
