import { Redirect } from "expo-router";

/** Legacy route — merged into the Library tab. */
export default function LibraryRedirect() {
  return <Redirect href="/(tabs)/library" />;
}
