import type { Dispatch, SetStateAction } from "react";
import { createAccountAdminDeleteHandler } from "./accountAdminDeleteActions";
import type { Account } from "./types";

type UseAccountAdminDeleteHandlerArgs = {
  currentUid?: string;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAccountAdminDeleteHandler = ({
  currentUid,
  loadAccounts,
  reportError,
  clearError,
  setActionLoading,
}: UseAccountAdminDeleteHandlerArgs) => {
  return (account: Account) =>
    createAccountAdminDeleteHandler({
      account,
      currentUid,
      loadAccounts,
      reportError,
      clearError,
      setActionLoading,
    })();
};
