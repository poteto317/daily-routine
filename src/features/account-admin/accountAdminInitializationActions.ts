import type { Dispatch, SetStateAction } from "react";

type CreateInitAccountAdminDataArgs = {
  uid?: string;
  checkIsAdmin: (uid: string) => Promise<boolean>;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loadAccounts: () => Promise<void>;
};

export const createInitAccountAdminDataAction = ({
  uid,
  checkIsAdmin,
  setIsAdmin,
  setLoading,
  loadAccounts,
}: CreateInitAccountAdminDataArgs) => {
  return async () => {
    if (!uid) {
      return;
    }

    const admin = await checkIsAdmin(uid);
    setIsAdmin(admin);

    if (admin) {
      await loadAccounts();
      return;
    }

    setLoading(false);
  };
};
