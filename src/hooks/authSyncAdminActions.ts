import { type User } from "firebase/auth";

type SyncAdminStatusArgs = {
  user: Pick<User, "uid" | "email" | "isAnonymous">;
  setIsAdmin: (value: boolean) => void;
  setIsAdminLoading: (value: boolean) => void;
  ensureAccountRecord: (
    uid: string,
    email: string | null,
    isAnonymous: boolean,
  ) => Promise<void>;
  checkIsAdmin: (uid: string) => Promise<boolean>;
  isMounted: () => boolean;
  getCurrentUserId: () => string | null;
};

export const syncAdminStatus = async ({
  user,
  setIsAdmin,
  setIsAdminLoading,
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
  getCurrentUserId,
}: SyncAdminStatusArgs): Promise<void> => {
  const isCurrentUser = () => isMounted() && getCurrentUserId() === user.uid;

  if (isMounted()) {
    setIsAdminLoading(true);
  }

  try {
    await ensureAccountRecord(user.uid, user.email, user.isAnonymous);
    const adminStatus = await checkIsAdmin(user.uid);
    if (isCurrentUser()) {
      setIsAdmin(adminStatus);
      setIsAdminLoading(false);
    }
  } catch {
    if (isCurrentUser()) {
      setIsAdmin(false);
      setIsAdminLoading(false);
    }
  }
};

export type { SyncAdminStatusArgs };
