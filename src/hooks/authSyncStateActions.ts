import { type Dispatch, type SetStateAction } from "react";
import { type User } from "firebase/auth";

type SetUser = Dispatch<SetStateAction<User | null>>;
type SetIsAdmin = Dispatch<SetStateAction<boolean>>;
type SetLoading = Dispatch<SetStateAction<boolean>>;
type SetIsAdminLoading = Dispatch<SetStateAction<boolean>>;

export type AuthSyncSetters = {
  setUser: SetUser;
  setIsAdmin: SetIsAdmin;
  setLoading: SetLoading;
  setIsAdminLoading: SetIsAdminLoading;
};

type AuthStateStorageActions = {
  setCurrentUserId: (uid: string | null) => void;
  migrateToUserStorage: (uid: string) => void;
};

export const applyAuthenticatedUserState = (
  user: User,
  setters: Pick<AuthSyncSetters, "setUser" | "setLoading">,
  storageActions: AuthStateStorageActions,
): void => {
  storageActions.setCurrentUserId(user.uid);
  storageActions.migrateToUserStorage(user.uid);
  setters.setUser(user);
  setters.setLoading(false);
};

export const applySignedOutUserState = (
  setters: AuthSyncSetters,
  setCurrentUserId: (uid: string | null) => void,
): void => {
  setCurrentUserId(null);
  setters.setIsAdmin(false);
  setters.setUser(null);
  setters.setLoading(false);
  setters.setIsAdminLoading(false);
};
