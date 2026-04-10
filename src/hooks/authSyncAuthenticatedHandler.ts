import { type User } from "firebase/auth";
import {
  syncAdminStatus,
  type SyncAdminStatusArgs,
} from "./authSyncAdminActions";
import {
  applyAuthenticatedUserState,
  type AuthSyncSetters,
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
    | "setIsAdmin"
    | "setIsAdminLoading"
    | "ensureAccountRecord"
    | "checkIsAdmin"
    | "isMounted"
    | "getCurrentUserId"
  >;

export const createAuthenticatedAuthStateHandler = ({
  setUser,
  setIsAdmin,
  setIsAdminLoading,
  setLoading,
  setCurrentUserId,
  migrateToUserStorage,
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
  getCurrentUserId,
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
      setIsAdminLoading,
      ensureAccountRecord,
      checkIsAdmin,
      isMounted,
      getCurrentUserId,
    });
  };
};
