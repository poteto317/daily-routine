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

/** ログイン直後に 1 度だけ行う準備処理 */
type AuthenticatedUserSetupActions = {
  setCurrentUserId: (uid: string | null) => void;
  migrateToUserStorage: (uid: string) => void;
  runDateKeyMigrationOnce: (uid: string) => void;
};

export const applyAuthenticatedUserState = (
  user: User,
  setters: Pick<AuthSyncSetters, "setUser" | "setLoading">,
  setupActions: AuthenticatedUserSetupActions,
): void => {
  setupActions.setCurrentUserId(user.uid);
  setupActions.migrateToUserStorage(user.uid);
  // ユーザースコープが確定してから移行する。先に走らせるとスコープ外の
  // キーを読んでしまい、何も移せない。
  setupActions.runDateKeyMigrationOnce(user.uid);
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
