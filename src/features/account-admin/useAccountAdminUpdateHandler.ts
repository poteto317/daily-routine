import type { Dispatch, SetStateAction } from "react";
import type { Account } from "./types";
import { createAccountAdminUpdateHandler } from "./accountAdminFormSubmitActions";

type UseAccountAdminUpdateHandlerArgs = {
  editingAccount: Account | null;
  editDisplayName: string;
  editIsAdmin: boolean;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  cancelEdit: () => void;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAccountAdminUpdateHandler = ({
  editingAccount,
  editDisplayName,
  editIsAdmin,
  loadAccounts,
  reportError,
  clearError,
  cancelEdit,
  setActionLoading,
}: UseAccountAdminUpdateHandlerArgs) => {
  return createAccountAdminUpdateHandler({
    editingAccount,
    editDisplayName,
    editIsAdmin,
    loadAccounts,
    reportError,
    clearError,
    cancelEdit,
    setActionLoading,
  });
};
