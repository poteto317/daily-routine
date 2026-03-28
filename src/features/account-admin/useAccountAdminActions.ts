import type { Account } from "./types";
import { createAccountAdminActionsResult } from "./accountAdminActionsResult";
import { useAccountAdminActionHandlers } from "./useAccountAdminActionHandlers";
import { useAccountAdminActionState } from "./useAccountAdminActionState";

interface ActionDeps {
  currentUid?: string;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  resetCreateForm: () => void;
  cancelEdit: () => void;
  editingAccount: Account | null;
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  editDisplayName: string;
  editIsAdmin: boolean;
}

export const useAccountAdminActions = ({
  cancelEdit,
  clearError,
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
  currentUid,
  editDisplayName,
  editIsAdmin,
  editingAccount,
  loadAccounts,
  reportError,
  resetCreateForm,
}: ActionDeps) => {
  const { actionLoading, setActionLoading } = useAccountAdminActionState();
  const handlers = useAccountAdminActionHandlers({
    cancelEdit,
    clearError,
    createDisplayName,
    createEmail,
    createIsAdmin,
    createPassword,
    currentUid,
    editDisplayName,
    editIsAdmin,
    editingAccount,
    loadAccounts,
    reportError,
    resetCreateForm,
    setActionLoading,
  });

  return createAccountAdminActionsResult({
    actionLoading,
    ...handlers,
  });
};
