import { LibraryHubScreen } from "../../src/components/library/LibraryHubScreen";
import { useIsAuthenticated } from "../../src/store/useAuthStore";

export default function LibraryTabScreen() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return null;
  }

  return <LibraryHubScreen />;
}
