import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { type User } from "firebase/auth";
import { migrateToUserStorage, setCurrentUserId } from "@/lib/storage/core";
import {
  checkIsAdmin,
  ensureAccountRecord,
} from "@/features/account-admin/accountService";
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
    (user: User | null) =>
      createAuthStateChangedHandler({
        setUser,
        setIsAdmin,
        setIsAdminLoading,
        setLoading,
        setCurrentUserId,
        migrateToUserStorage,
        ensureAccountRecord,
        checkIsAdmin,
        isMounted,
      })(user),
    [isMounted, setIsAdmin, setIsAdminLoading, setLoading, setUser],
  );
};
