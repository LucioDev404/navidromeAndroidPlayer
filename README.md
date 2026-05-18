# Player Android

React Native / Expo Navidrome music client (TypeScript, Expo Router, Zustand).

**Expo SDK 50** · local debug first · APK build via GitHub Actions (optional).

## Quick start

```bash
npm install
npm run validate
npm run web          # fastest: browser on PC
# or
npm start          # Expo Go / emulator menu
```

## Scripts

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm start`           | Metro dev server                                  |
| `npm run start:clear` | Metro with cache cleared                          |
| `npm run web`         | Run in browser (PC debug)                         |
| `npm run android`     | Open on Android emulator (Expo Go)                |
| `npm run clean`       | Clear `.expo`, Metro cache, generated native dirs |
| `npm run reset`       | Full reinstall                                    |
| `npm run doctor`      | Expo compatibility (15 checks)                    |
| `npm run validate`    | typecheck + lint + prettier                       |
| `npm run build:apk`   | Generate Android project + release APK            |

## Before every commit

```bash
npm run validate
npm run doctor
npm run web    # smoke test: login → home → logout
```

## Configuration

Set your Navidrome server URL in `app.json`:

```json
"extra": {
  "apiBaseUrl": "https://your-server.example.com"
}
```

## CI

GitHub Actions runs `validate` on every push/PR, then builds an APK artifact (`app-apk`). No EAS or Expo cloud build required.

## Troubleshooting

| Problem                      | Fix                                            |
| ---------------------------- | ---------------------------------------------- |
| Red screen / stale bundle    | `npm run start:clear`                          |
| Weird native errors          | `npm run clean` then `npm start`               |
| Dependency mismatch          | `npm run doctor` then `npx expo install --fix` |
| `expo prebuild` broke `main` | `npm run post-prebuild-fix`                    |
