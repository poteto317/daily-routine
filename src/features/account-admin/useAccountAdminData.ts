import { createAccountAdminDataResult } from "./accountAdminDataResult";
import { useAccountAdminDataInitialization } from "./useAccountAdminDataInitialization";
import { useAccountAdminDataState } from "./useAccountAdminDataState";

export const useAccountAdminData = (uid?: string) => {
  const dataState = useAccountAdminDataState();

  useAccountAdminDataInitialization({
    uid,
    checkIsAdmin: dataState.checkIsAdmin,
    setIsAdmin: dataState.setIsAdmin,
    setLoading: dataState.setLoading,
    loadAccounts: dataState.loadAccounts,
  });

  return createAccountAdminDataResult({ dataState });
};
