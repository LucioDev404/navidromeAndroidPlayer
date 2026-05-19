#!/usr/bin/env node
/**
 * Semantic version bump from latest commit message (Conventional Commits).
 * Writes package.json + app.json. CI sets ANDROID_VERSION_CODE via env.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const packagePath = path.join(root, "package.json");
const appJsonPath = path.join(root, "app.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Invalid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function formatVersion(parts) {
  return `${parts.major}.${parts.minor}.${parts.patch}`;
}

function bump(version, level) {
  const parts = parseVersion(version);
  if (level === "major") {
    parts.major += 1;
    parts.minor = 0;
    parts.patch = 0;
  } else if (level === "minor") {
    parts.minor += 1;
    parts.patch = 0;
  } else {
    parts.patch += 1;
  }
  return formatVersion(parts);
}

function getCommitMessage() {
  if (
    process.env.GITHUB_EVENT_PATH &&
    fs.existsSync(process.env.GITHUB_EVENT_PATH)
  ) {
    try {
      const event = JSON.parse(
        fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"),
      );
      const head = event.head_commit?.message;
      if (head) {
        return head;
      }
    } catch {
      /* fall through */
    }
  }

  try {
    return execSync("git log -1 --pretty=%B", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function resolveBumpLevel(message) {
  const firstLine = message.split("\n")[0] ?? "";

  if (
    /^(feat|feature)(\(.+\))?!:/.test(firstLine) ||
    /BREAKING CHANGE/i.test(message)
  ) {
    return "major";
  }
  if (/^feat(\(.+\))?:/.test(firstLine)) {
    return "minor";
  }
  if (/^fix(\(.+\))?:/.test(firstLine)) {
    return "patch";
  }

  return process.env.VERSION_BUMP_DEFAULT || "patch";
}

function main() {
  const pkg = readJson(packagePath);
  const appJson = readJson(appJsonPath);
  const current = pkg.version || appJson.expo?.version || "1.0.0";
  const message = getCommitMessage();
  const level = resolveBumpLevel(message);
  const next = bump(current, level);

  pkg.version = next;
  appJson.expo.version = next;

  writeJson(packagePath, pkg);
  writeJson(appJsonPath, appJson);

  console.log(`bump-version: ${current} → ${next} (${level})`);
  console.log(`bump-version: commit="${message.split("\n")[0]}"`);
}

main();
