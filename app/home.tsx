import { Redirect } from "expo-router";

/** Legacy route — library hub is the home experience. */
export default function HomeRedirect() {
  return <Redirect href="/(tabs)/library" />;
}
