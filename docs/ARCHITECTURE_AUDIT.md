# Architecture audit summary

Last updated: production hardening pass.

## Critical fixes applied

| Issue                                           | Impact                                       | Resolution                              |
| ----------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| `PlaybackBootstrap` not mounted                 | No playback init, no recently-played binding | Wrapped in `app/_layout.tsx`            |
| `GlobalPlayerOverlay` not mounted               | Mini player never visible                    | Restored in root layout                 |
| `playlist` missing from auth detail routes      | Redirect loops / broken navigation           | Added to `isDetailRoute` + stack screen |
| `MediaCarousel` album guard blocked `songCount` | Album taps did nothing                       | Navigate by `variant` only              |
| HTTP blocked in production                      | Login failed on LAN HTTP                     | `endpointPolicy` + user toggle          |
| `crypto-js` random on RN                        | HTTPS login crash                            | `expo-crypto` for Subsonic salt         |
| No Android media notification                   | No lockscreen controls                       | `react-native-track-player` on native   |

## Architecture layers

```
app/ (Expo Router)
  └── src/
        api/subsonic/     Subsonic client, services, mappers
        services/audio/   PlaybackController, TrackPlayer, queue
        store/            Zustand (endpoint = source of truth)
        navigation/       Mini player, tabs, helpers
        components/       UI by domain
        bootstrap/        Startup, playback init
```

## State ownership

- **Session / servers:** `useEndpointStore` (+ SecureStore)
- **UI mirror:** `useAppStore` (auto-synced on endpoint changes)
- **Playback:** `usePlayerStore` → `PlaybackController` → `AudioService`
- **Library cache:** `useLibraryStore` + AsyncStorage
- **Detail caches:** `useBrowseStore`

## Performance guidelines

- Use `playerSelectors` — never subscribe to full `usePlayerStore` in list screens
- `usePlaybackProgress` only in `SeekBar` / player screens
- `CachedCover` is memoized; lists use `FlatList` virtualization
- API dedupe via `requestCache.ts`

## Release versioning

- `scripts/bump-version.js` — conventional commit semver on CI push
- `app.config.js` — injects version + `ANDROID_VERSION_CODE` from `GITHUB_RUN_NUMBER`
- Account → **About** shows version, build, environment, playback engine

## Beta features (this pass)

- Repeat modes: off / all / one
- Shuffle queue toggle with natural order restore

## Removed dead code

- `authService.ts`, `env.ts`, `PrimaryButton.tsx`, `ScreenShell.tsx`

## Follow-up recommendations

1. FlashList for large album grids
2. Favorites with server-side star API when available
3. E2E tests (Detox) for playback + navigation
4. iOS CI build job
5. `expo-image` for disk-cached artwork
