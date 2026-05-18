import { Redirect } from "expo-router";

/** Legacy route — account management lives in the Account tab. */
export default function AccountsRedirect() {
  return <Redirect href="/(tabs)/account" />;
}
