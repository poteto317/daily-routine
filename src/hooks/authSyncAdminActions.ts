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
};

export const syncAdminStatus = async ({
  user,
  setIsAdmin,
  setIsAdminLoading,
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
}: SyncAdminStatusArgs): Promise<void> => {
  try {
    await ensureAccountRecord(user.uid, user.email, user.isAnonymous);
    const adminStatus = await checkIsAdmin(user.uid);
    if (isMounted()) {
      setIsAdmin(adminStatus);
      setIsAdminLoading(false);
    }
  } catch {
    if (isMounted()) {
      setIsAdmin(false);
      setIsAdminLoading(false);
    }
  }
};

export type { SyncAdminStatusArgs };
