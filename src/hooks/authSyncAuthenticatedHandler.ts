import type { User } from "firebase/auth";
import type { SyncAdminStatusArgs } from "./authSyncAdminActions";
import { syncAdminStatus } from "./authSyncAdminActions";
import type {
  AuthSyncSetters} from "./authSyncStateActions";
import {
  applyAuthenticatedUserState
} from "./authSyncStateActions";

type AuthStateStorageActions = {
  setCurrentUserId: (uid: string | null) => void;
  migrateToUserStorage: (uid: string) => void;
};

type CreateAuthenticatedAuthStateHandlerArgs = Pick<
  AuthSyncSetters,
  "setUser" | "setLoading"
> &
  AuthStateStorageActions &
  Pick<
    SyncAdminStatusArgs,
    "setIsAdmin" | "ensureAccountRecord" | "checkIsAdmin" | "isMounted"
  >;

export const createAuthenticatedAuthStateHandler = ({
  setUser,
  setIsAdmin,
  setLoading,
  setCurrentUserId,
  migrateToUserStorage,
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
}: CreateAuthenticatedAuthStateHandlerArgs) => {
  return (user: User) => {
    applyAuthenticatedUserState(
      user,
      { setUser, setLoading },
      { setCurrentUserId, migrateToUserStorage },
    );

    void syncAdminStatus({
      user,
      setIsAdmin,
      ensureAccountRecord,
      checkIsAdmin,
      isMounted,
    });
  };
};
