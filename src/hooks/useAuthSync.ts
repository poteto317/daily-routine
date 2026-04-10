import {
  useAuthStateChangedHandler,
  type UseAuthSyncParams,
} from "./useAuthStateChangedHandler";
import { useAuthSyncSubscription } from "./useAuthSyncSubscription";

export const useAuthSync = ({
  setUser,
  setIsAdmin,
  setLoading,
  setIsAdminLoading,
}: UseAuthSyncParams) => {
  const handleAuthStateChanged = useAuthStateChangedHandler({
    setUser,
    setIsAdmin,
    setLoading,
    setIsAdminLoading,
  });

  useAuthSyncSubscription({
    handleAuthStateChanged,
    setLoading,
    setIsAdminLoading,
  });
};
