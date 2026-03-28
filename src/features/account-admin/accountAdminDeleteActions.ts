import type { Dispatch, SetStateAction } from "react";
import { submitDeleteAccount } from "./accountAdminPageActionHandlers";
import type { Account } from "./types";

type DeleteHandlerArgs = {
  account: Account;
  currentUid?: string;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const createAccountAdminDeleteHandler = ({
  account,
  currentUid,
  loadAccounts,
  reportError,
  clearError,
  setActionLoading,
}: DeleteHandlerArgs) => {
  return async () => {
    await submitDeleteAccount({
      account,
      currentUid,
      loadAccounts,
      reportError,
      clearError,
      setActionLoading,
    });
  };
};
