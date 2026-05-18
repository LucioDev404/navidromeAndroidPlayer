# Player Android

A React Native / Expo migration of the Navidrome music streaming client.

## Setup

1. Install Node.js 20+ and Expo CLI.
2. Run `npm install`.
3. Launch the app with `npm run start`.

## Phase 1 status

- Expo + TypeScript app shell created
- Expo Router navigation pages added
- Strict TypeScript enabled
- Zustand store scaffolded
- Navidrome API client scaffolded
- GitHub Actions CI pipeline added
- Legacy Flutter files removed

## GitHub Actions CI/CD

The project builds APKs **directly on GitHub Actions** (no EAS, no Expo cloud build limits).

### What runs on each push/PR

1. Lint and TypeScript check
2. `expo prebuild` to generate the Android project
3. Gradle `assembleRelease` to produce the APK
4. Upload the APK as a workflow artifact (`app-apk`)

### Download the APK

After a workflow run completes:

1. Open the workflow run on GitHub
2. Scroll to **Artifacts**
3. Download `app-apk` (contains `app-release.apk`)

Artifacts are kept for 30 days.

### Build locally (optional)

Requires JDK 17 and the Android SDK:

```bash
npm run build:apk
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.
