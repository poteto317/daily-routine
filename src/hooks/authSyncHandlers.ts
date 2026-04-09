import type { User } from "firebase/auth";
import type { SyncAdminStatusArgs } from "./authSyncAdminActions";
import { syncAdminStatus } from "./authSyncAdminActions";
import type {
  AuthSyncSetters} from "./authSyncStateActions";
import {
  applyAuthenticatedUserState,
  applySignedOutUserState
} from "./authSyncStateActions";
import { createAuthenticatedAuthStateHandler } from "./authSyncAuthenticatedHandler";
import { createSignedOutAuthStateHandler } from "./authSyncSignedOutHandler";

type AuthStateStorageActions = {
  setCurrentUserId: (uid: string | null) => void;
  migrateToUserStorage: (uid: string) => void;
};

type CreateAuthStateChangedHandlerArgs = AuthSyncSetters &
  AuthStateStorageActions & {
    ensureAccountRecord: SyncAdminStatusArgs["ensureAccountRecord"];
    checkIsAdmin: SyncAdminStatusArgs["checkIsAdmin"];
    isMounted: SyncAdminStatusArgs["isMounted"];
  };

export const createAuthStateChangedHandler = ({
  setUser,
  setIsAdmin,
  setLoading,
  setCurrentUserId,
  migrateToUserStorage,
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
}: CreateAuthStateChangedHandlerArgs) => {
  const handleAuthenticatedUser = createAuthenticatedAuthStateHandler({
    setUser,
    setIsAdmin,
    setLoading,
    setCurrentUserId,
    migrateToUserStorage,
    ensureAccountRecord,
    checkIsAdmin,
    isMounted,
  });
  const handleSignedOutUser = createSignedOutAuthStateHandler({
    setUser,
    setIsAdmin,
    setLoading,
    setCurrentUserId,
  });

  return (user: User | null) => {
    if (user) {
      handleAuthenticatedUser(user);
      return;
    }

    handleSignedOutUser();
  };
};

export {
  applyAuthenticatedUserState,
  applySignedOutUserState,
  createAuthenticatedAuthStateHandler,
  createSignedOutAuthStateHandler,
  syncAdminStatus,
};
export type { AuthSyncSetters };
