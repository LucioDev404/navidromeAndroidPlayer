<!-- prettier-ignore -->
# Soundly

<img src="assets/icon.png" alt="Soundly logo" width="96" align="right" />

> A premium self-hosted music player for Navidrome/Subsonic servers — built with React Native + Expo for Android and Web.

[![Expo](https://img.shields.io/badge/Expo-%2359C1CC?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-%2364D8FF?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-%233178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-%23721D8E?style=for-the-badge&logo=zustand&logoColor=white)](https://github.com/pmndrs/zustand)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20Web-lightgrey?style=for-the-badge)](#)

---

## What is this?

**Soundly** is a polished music client inspired by modern streaming experiences like Spotify and Plexamp. It connects to self-hosted Navidrome or Subsonic servers, giving you mobile and browser access to your music library with queue management, background playback, rich metadata screens, and offline-friendly behavior.

### Why it matters

- Works with self-hosted music libraries.
- Designed for Android and Web developers who want a fast client powered by Expo.
- Supports multiple server endpoints with secure session handling.
- Built to feel premium, modern, and reliable.

---

## Preview

> Visual assets are ready to swap in once screenshots are available.

- **Library**: browse albums, artists, playlists, and recently played content
- **Player**: full-screen playback with cover art, seek, and queue controls
- **Queue**: reorder, clear, or continue playback without breaking the flow
- **Album**: rich track listings with metadata and play actions
- **Account**: multi-server account management with secure sessions

<!--
## Screenshots

![Library preview](docs/screenshots/library.png)
![Player preview](docs/screenshots/player.png)
![Queue preview](docs/screenshots/queue.png)
![Album preview](docs/screenshots/album.png)

If no assets are available yet, replace these placeholders with real screenshots in `docs/screenshots`.
-->

---

## Features

- 🎧 Spotify-style playback flow with queue and now playing
- 🌐 Navidrome / Subsonic API compatibility
- 🔁 Multi-endpoint server support with secure saved connections
- 🧩 Persistent sessions and account management
- 📱 Mini player and full player UI for fluid mobile controls
- 🪟 Web support via Expo web
- 🔔 Background playback with Android notification controls
- 🔐 HTTP/HTTPS endpoint handling, including local network support
- 📦 Playlist, album, and artist navigation
- 🔄 Offline-friendly reconnect behavior for self-hosted servers

---

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| UI         | React Native + Expo Router          |
| Language   | TypeScript                          |
| State      | Zustand                             |
| Audio      | react-native-track-player + expo-av |
| Networking | Navidrome/Subsonic API clients      |
| Build      | Expo SDK 50                         |
| CI         | GitHub Actions                      |

---

## Getting Started

### Prerequisites

- Node.js 18+ or compatible LTS version
- npm 10+ or yarn
- Expo CLI (`npm install -g expo-cli` recommended)
- Android Studio / emulator if you want native Android testing
- A running Navidrome or Subsonic server

### Clone the repo

```bash
git clone https://github.com/<your-org>/player_android.git
cd player_android
```

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm start
```

That opens Expo Dev Tools. Then:

- `w` → open Web build in browser
- `a` → launch Android emulator or Expo Go
- `i` → launch iOS simulator (supported by Expo)

### Fast Web preview

```bash
npm run web
```

### Android local run

```bash
npm run android
```

### Build release APK

```bash
npm run build:apk
```

> Note: `build:apk` creates an Android native project and packages a release APK. Use this when you want a sideloadable app bundle.

---

## Configuration

### Connect your Navidrome server

This app is built for multi-endpoint self-hosted servers. Update the default server endpoint in `app.json` only for quick local testing.

```json
"extra": {
  "apiBaseUrl": "https://your-navidrome-server.example.com"
}
```

### Add more servers in-app

The app supports multiple saved endpoints from the account screen. Use this pattern:

- `https://` for secure public servers
- `http://` for local networks when the server is on the same LAN
- `http://192.168.x.x` or `http://10.x.x.x` for local development

### Network requirements

- Your device/emulator must reach the Navidrome/Subsonic server URL
- Local Android emulators can access `10.0.2.2` for host machine servers
- If your server is self-signed, configure HTTPS on the server side or use HTTP with local networking

---

## Architecture Overview

Soundly is structured to keep UI, playback, and API concerns separate.

### Key folders

- `app/` — Expo Router screens and route layout
- `src/api/` — Navidrome/Subsonic client logic and mappers
- `src/bootstrap/` — app initialization and playback bootstrap
- `src/components/` — shared UI widgets and screen components
- `src/playback/` — queue resolution and audio session helpers
- `src/store/` — Zustand state hooks and selectors
- `src/theme/` — theming and color definitions
- `src/utils/` — formatting, validation, and platform helpers

### Core architecture

```text
app/                    - Expo Router screen definitions
src/api/                - Navidrome/Subsonic API service layer
src/store/              - global state with Zustand
src/playback/           - queue/track resolution and audio engine
src/components/         - UI building blocks and screen sections
```

### Player engine

- Uses `react-native-track-player` for background playback
- Integrates with Expo audio when needed for cross-platform support
- Exposes queue controls, seek, and notification state
- Handles playback resume after app backgrounding

### State management

- Zustand provides lightweight global state
- Separate stores for auth, player, library, and endpoints
- Selectors keep screens responsive and minimize re-renders

### API integration

- `src/api/navidromeClient.ts` contains HTTP client logic
- `src/api/mappers` converts Subsonic / Navidrome payloads into app models
- The app normalizes server responses so playlist, album, and artist screens behave consistently

---

## CI / Release Flow

This repository is designed for modern open-source delivery.

- `npm run validate` checks TypeScript, lint rules, and formatting
- GitHub Actions runs validation on every PR
- Releases can be automated through semantic versioning scripts
- `npm run version:bump` updates package version via `scripts/bump-version.js`
- Android APK artifacts are produced without Expo cloud build by using local Gradle and `expo prebuild`

### Versioning

The repo follows a semantic release mindset:

- `MAJOR.MINOR.PATCH`
- `version:bump` updates the local package version
- GitHub Actions should publish build artifacts and release notes from tagged versions

---

## Roadmap

Future enhancements to elevate the experience:

- native iOS release pipeline
- offline downloads and local cache support
- richer playlist creation + editing
- better media metadata sync and album art caching
- Apple CarPlay / Android Auto integration
- improved server discovery on local networks

---

## Contributing

We welcome contributors who care about quality and modern mobile UX.

### Ready to help?

1. Fork the repo
2. Create a branch: `feature/<short-description>`
3. Run `npm install`
4. Follow lint + format rules
5. Open a PR with an explanation and screenshots if relevant

### Code standards

- TypeScript for all app logic
- Functional React components only
- Keep shared UI in `src/components`
- Use `npm run validate` before pushing

### Issues

- Bug reports: include steps to reproduce and expected behavior
- Feature requests: describe the use case and why it improves the self-hosted experience
- Performance issues: attach logs and device details when possible

---

## Troubleshooting

| Symptom                           | Fix                                                 |
| --------------------------------- | --------------------------------------------------- |
| Stale bundle or red screen        | `npm run start:clear` then restart Expo             |
| Native build fails after prebuild | `npm run post-prebuild-fix`                         |
| Dependency mismatch               | `npm run doctor` and re-run install                 |
| Local server unreachable          | confirm LAN IP, use `10.0.2.2` for Android emulator |

---

## License

MIT License — open source for self-hosted music lovers.
