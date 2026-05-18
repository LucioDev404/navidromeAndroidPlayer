import { Redirect } from "expo-router";

/** Legacy route — account management lives in the Account tab. */
export default function ProfileRedirect() {
  return <Redirect href="/(tabs)/account" />;
}
