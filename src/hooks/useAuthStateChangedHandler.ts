import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { type User } from "firebase/auth";
import {
  getCurrentUserId,
  migrateToUserStorage,
  setCurrentUserId,
} from "@/lib/storage/core";
import {
  checkIsAdmin,
  ensureAccountRecord,
} from "@/features/account-admin/accountService";
import { runDateKeyMigrationOnce } from "@/lib/dateKeyMigration";
import { syncRoutinesToFirebase } from "@/features/routine/helpersSync";
import { getNotificationBootstrapRoutines } from "@/features/routine/storageRoutinesCore";
import { createAuthStateChangedHandler } from "./authSyncHandlers";

export type UseAuthSyncParams = {
  setUser: Dispatch<SetStateAction<User | null>>;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setIsAdminLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAuthStateChangedHandler = ({
  setUser,
  setIsAdmin,
  setLoading,
  setIsAdminLoading,
}: UseAuthSyncParams) => {
  const mountedRef = useRef(true);
  const isMounted = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(
    (user: User | null) => {
      const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL;
      const routines =
        user && functionsUrl
          ? getNotificationBootstrapRoutines(user.uid)
          : null;

      createAuthStateChangedHandler({
        setUser,
        setIsAdmin,
        setIsAdminLoading,
        setLoading,
        setCurrentUserId,
        getCurrentUserId,
        migrateToUserStorage,
        runDateKeyMigrationOnce,
        ensureAccountRecord,
        checkIsAdmin,
        isMounted,
      })(user);

      if (user && routines) {
        void syncRoutinesToFirebase(routines, functionsUrl, user.uid);
      }
    },
    [isMounted, setIsAdmin, setIsAdminLoading, setLoading, setUser],
  );
};
