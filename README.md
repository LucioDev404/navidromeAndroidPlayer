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

The project includes automated CI/CD that builds and exports APKs.

### Setup steps

1. Create an Expo account at https://expo.dev and generate a personal access token.
2. Link the project to EAS once on your machine (this adds `extra.eas.projectId` to `app.json`):
   ```bash
   npx eas-cli login
   npx eas-cli init
   git add app.json && git commit -m "Link EAS project"
   ```
   Optionally run a local Android build first so credentials are configured: `npx eas-cli build --platform android --profile preview`
3. In your GitHub repository, add a secret:
   - Go to **Settings > Secrets and variables > Actions**
   - Add `EXPO_TOKEN` with your Expo personal access token (never commit this token)
4. Commit and push to `main` or a PR branch.
4. GitHub Actions will:
   - Run lint and typecheck
   - Build an APK using EAS Build
   - Upload the APK as a downloadable artifact

### Download APK from GitHub Actions

After a workflow run completes:
1. Go to the workflow run page
2. Scroll to **Artifacts** section
3. Download `app-apk` (contains the built APK file)

The APK is retained for 30 days.
