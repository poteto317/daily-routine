import { useCallback } from "react";
import { createAccountAdminDataStateResult } from "./accountAdminDataStateResult";
import { checkIsAdmin, getAccounts } from "./accountService";
import { ACCOUNT_ADMIN_ERROR_MESSAGES } from "./helpers";
import { createAccountAdminErrorActions } from "./accountAdminErrorActions";
import { createLoadAccountsAction } from "./accountAdminLoadActions";
import { useAccountAdminAccountListState } from "./useAccountAdminAccountListState";
import { useAccountAdminStatusState } from "./useAccountAdminStatusState";

export const useAccountAdminDataState = () => {
  const { accounts, setAccounts } = useAccountAdminAccountListState();
  const { error, isAdmin, loading, setError, setIsAdmin, setLoading } =
    useAccountAdminStatusState();

  const loadAccounts = useCallback(async () => {
    await createLoadAccountsAction({
      setAccounts,
      setLoading,
      setError,
      getAccounts,
      loadErrorMessage: ACCOUNT_ADMIN_ERROR_MESSAGES.loadAccountsFailed,
    })();
  }, [setAccounts, setError, setLoading]);

  const { clearError, reportError } = createAccountAdminErrorActions(setError);

  return createAccountAdminDataStateResult({
    accounts,
    checkIsAdmin,
    clearError,
    error,
    isAdmin,
    loadAccounts,
    loading,
    reportError,
    setIsAdmin,
    setLoading,
  });
};
