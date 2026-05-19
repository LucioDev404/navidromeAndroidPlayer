/**
 * Runs in TrackPlayer headless JS context — must use require(), not top-level TS imports.
 * Wires Android notification / lockscreen controls to app playback logic.
 */
const TrackPlayer = require("react-native-track-player").default;
const { Event } = require("react-native-track-player");

module.exports = async function playbackServiceRegistration() {
  const { RemotePlaybackBridge } = require("./RemotePlaybackBridge");

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    RemotePlaybackBridge.onPlay().catch(() => undefined);
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    RemotePlaybackBridge.onPause().catch(() => undefined);
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    RemotePlaybackBridge.onNext().catch(() => undefined);
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    RemotePlaybackBridge.onPrevious().catch(() => undefined);
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    RemotePlaybackBridge.onSeek(event.position).catch(() => undefined);
  });
};
