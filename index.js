import TrackPlayer from "react-native-track-player";

TrackPlayer.registerPlaybackService(() =>
  require("./src/services/audio/playbackServiceRegistration"),
);

import "expo-router/entry";
