# Background playback & media notification test plan

Requires a **native rebuild** after merging (`npm run build:apk` or GitHub Actions `build-apk` job).

## Architecture

| Platform      | Engine                      | Notification                          |
| ------------- | --------------------------- | ------------------------------------- |
| Android / iOS | `react-native-track-player` | Media session + lockscreen controls   |
| Web           | `expo-av`                   | Browser tab only (no OS notification) |

## Pre-test

1. Install fresh APK from CI artifact
2. Sign in to Navidrome server
3. Play any track from Library or Album detail

## Test cases

| #   | Scenario                | Steps                                  | Expected                                            |
| --- | ----------------------- | -------------------------------------- | --------------------------------------------------- |
| 1   | Background notification | Play track → press Home                | Persistent notification with title, artist, artwork |
| 2   | Lockscreen              | Play → lock device                     | Lockscreen shows art + metadata + controls          |
| 3   | Pause from notification | Tap pause in notification              | Audio stops; mini player shows paused               |
| 4   | Play from notification  | Tap play                               | Audio resumes; UI syncs                             |
| 5   | Next track              | Tap next in notification               | Queue advances; notification metadata updates       |
| 6   | Previous track          | Tap previous                           | Previous track or restart if >3s elapsed            |
| 7   | App resume              | Background → reopen app                | Mini player + full player match notification state  |
| 8   | Track change from UI    | Skip in app while notification visible | Notification updates to new track                   |
| 9   | Queue end               | Let track finish                       | Auto-advances to next queue item                    |
| 10  | Clear playback          | Stop/log out                           | Notification dismisses                              |

## Regression checks

- [ ] Only **one** media notification (no duplicates)
- [ ] No crash when minimizing during buffering
- [ ] HTTP stream servers still play (cleartext + auth URLs)
- [ ] Album art loads in notification when cover URL is reachable

## Known limits

- **Web** does not show Android-style media notifications (expo-av only).
- Self-signed HTTPS artwork URLs may fail to load in notification; stream still plays.
