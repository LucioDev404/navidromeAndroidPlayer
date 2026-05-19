# Networking & authentication test plan

Use this checklist after changing crypto, URL policy, or Android networking config.
**Rebuild the native APK** (`npm run build:apk`) after `app.json` or `post-prebuild-fix` changes.

## Prerequisites

- Navidrome or compatible Subsonic server reachable from the device/emulator
- Test servers: HTTP LAN, HTTPS public, HTTPS self-signed (optional)

## Test cases

| #   | Scenario                   | URL example                 | Allow HTTP toggle | Expected                                  |
| --- | -------------------------- | --------------------------- | ----------------- | ----------------------------------------- |
| 1   | HTTP LAN                   | `http://192.168.1.10:4533`  | On (auto)         | Login OK, library loads, playback streams |
| 2   | HTTPS reverse proxy        | `https://music.example.com` | Off               | Login OK, no crypto crash                 |
| 3   | LAN IP no scheme           | `192.168.1.10:4533`         | On                | Defaults to `http://`, login OK           |
| 4   | Custom port                | `http://10.0.0.5:4040`      | On                | Login OK                                  |
| 5   | Invalid URL                | `not a url`                 | —                 | Form error, no crash                      |
| 6   | HTTP blocked intentionally | `http://host`               | Off               | Clear INSECURE_URL message                |
| 7   | Self-signed HTTPS          | `https://192.168.x.x`       | Off               | SSL_ERROR message (no crash)              |
| 8   | Offline                    | valid URL, airplane mode    | —                 | OFFLINE / unreachable message             |

## Verification steps (each successful login)

1. **Login** — ping succeeds, redirect to library
2. **Library** — albums/artists load
3. **Playback** — stream URL plays (mini player advances)
4. **Queue** — play album, queue shows full track list
5. **Reconnect** — kill app, reopen; session restores and pings in background

## Platform matrix

- [ ] Android emulator (API 34)
- [ ] Physical Android device on Wi‑Fi (LAN HTTP)
- [ ] Physical device on cellular (HTTPS only server)

## Regression checks

- [ ] No `"Native crypto module could not be used"` on HTTPS login
- [ ] No `"HTTP is not allowed"` when Allow HTTP is enabled
- [ ] Credentials never appear in Metro/device logs (only redacted URLs)

## Rebuild reminder

```bash
npm run prebuild:android
cd android && ./gradlew assembleRelease --no-daemon
```

Install the new APK before testing cleartext manifest changes.
