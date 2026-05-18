/**
 * Restores Expo Router entry and dev scripts after `expo prebuild` overwrites package.json.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const packageJsonPath = path.join(root, "package.json");
const indexJsPath = path.join(root, "index.js");

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

pkg.main = "expo-router/entry";

pkg.scripts = {
  ...pkg.scripts,
  start: "expo start",
  "start:clear": "expo start -c",
  android: "expo start --android",
  ios: "expo start --ios",
  web: "expo start --web",
};

fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`);

if (fs.existsSync(indexJsPath)) {
  fs.unlinkSync(indexJsPath);
}

console.log("post-prebuild-fix: restored expo-router/entry and dev scripts");
