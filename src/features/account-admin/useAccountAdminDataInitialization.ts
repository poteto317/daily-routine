import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { createInitAccountAdminDataAction } from "./accountAdminInitializationActions";

type UseAccountAdminDataInitializationParams = {
  uid?: string;
  checkIsAdmin: (uid: string) => Promise<boolean>;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  loadAccounts: () => Promise<void>;
};

export const useAccountAdminDataInitialization = ({
  uid,
  checkIsAdmin,
  setIsAdmin,
  setLoading,
  loadAccounts,
}: UseAccountAdminDataInitializationParams) => {
  useEffect(() => {
    createInitAccountAdminDataAction({
      uid,
      checkIsAdmin,
      setIsAdmin,
      setLoading,
      loadAccounts,
    })();
  }, [uid, checkIsAdmin, setIsAdmin, setLoading, loadAccounts]);
};
