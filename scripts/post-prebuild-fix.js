/**
 * Restores Expo Router entry and dev scripts after `expo prebuild`.
 * Ensures Android cleartext (HTTP) support in generated native projects.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const packageJsonPath = path.join(root, "package.json");
const indexJsPath = path.join(root, "index.js");
const androidManifestPath = path.join(
  root,
  "android",
  "app",
  "src",
  "main",
  "AndroidManifest.xml",
);
const networkConfigDir = path.join(
  root,
  "android",
  "app",
  "src",
  "main",
  "res",
  "xml",
);
const networkConfigPath = path.join(
  networkConfigDir,
  "network_security_config.xml",
);

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

const networkSecurityConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>
</network-security-config>
`;

function ensureAndroidCleartextSupport() {
  if (!fs.existsSync(androidManifestPath)) {
    console.log(
      "post-prebuild-fix: android manifest not found (run prebuild first)",
    );
    return;
  }

  if (!fs.existsSync(networkConfigDir)) {
    fs.mkdirSync(networkConfigDir, { recursive: true });
  }
  fs.writeFileSync(networkConfigPath, networkSecurityConfigXml);

  let manifest = fs.readFileSync(androidManifestPath, "utf8");

  manifest = manifest.replace(/<application([^>]*)>/, (_match, attrs) => {
    let next = attrs;
    if (!next.includes("usesCleartextTraffic")) {
      next += ' android:usesCleartextTraffic="true"';
    }
    if (!next.includes("networkSecurityConfig")) {
      next += ' android:networkSecurityConfig="@xml/network_security_config"';
    }
    return `<application${next}>`;
  });

  fs.writeFileSync(androidManifestPath, manifest);
  console.log(
    "post-prebuild-fix: Android cleartext + network_security_config applied",
  );
}

ensureAndroidCleartextSupport();

console.log("post-prebuild-fix: restored expo-router/entry and dev scripts");
