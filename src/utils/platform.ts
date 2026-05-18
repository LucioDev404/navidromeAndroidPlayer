import { Platform } from "react-native";

export const isWeb = Platform.OS === "web";
export const isNative = Platform.OS === "ios" || Platform.OS === "android";

/** BlurView is expensive on web and can freeze the tab. */
export const supportsNativeBlur = isNative;
