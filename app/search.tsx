import { Redirect } from "expo-router";

/** Legacy route — search lives in the Search tab. */
export default function SearchRedirect() {
  return <Redirect href="/(tabs)/search" />;
}
