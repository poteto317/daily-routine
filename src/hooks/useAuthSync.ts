import {
  useAuthStateChangedHandler,
  type UseAuthSyncParams,
} from "./useAuthStateChangedHandler";
import { useAuthSyncSubscription } from "./useAuthSyncSubscription";

export const useAuthSync = ({
  setUser,
  setIsAdmin,
  setLoading,
}: UseAuthSyncParams) => {
  const handleAuthStateChanged = useAuthStateChangedHandler({
    setUser,
    setIsAdmin,
    setLoading,
  });

  useAuthSyncSubscription({ handleAuthStateChanged, setLoading });
};
