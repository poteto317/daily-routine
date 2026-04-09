import { type User } from "firebase/auth";

type SyncAdminStatusArgs = {
  user: Pick<User, "uid" | "email" | "isAnonymous">;
  setIsAdmin: (value: boolean) => void;
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
  ensureAccountRecord,
  checkIsAdmin,
  isMounted,
}: SyncAdminStatusArgs): Promise<void> => {
  try {
    await ensureAccountRecord(user.uid, user.email, user.isAnonymous);
    const adminStatus = await checkIsAdmin(user.uid);
    if (isMounted()) {
      setIsAdmin(adminStatus);
    }
  } catch {
    if (isMounted()) {
      setIsAdmin(false);
    }
  }
};

export type { SyncAdminStatusArgs };
