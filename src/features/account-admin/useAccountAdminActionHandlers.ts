import type { Dispatch, SetStateAction } from "react";
import { createAccountAdminActionHandlersResult } from "./accountAdminActionHandlersResult";
import type { Account } from "./types";
import { useAccountAdminCreateHandler } from "./useAccountAdminCreateHandler";
import { useAccountAdminDeleteHandler } from "./useAccountAdminDeleteHandler";
import { useAccountAdminUpdateHandler } from "./useAccountAdminUpdateHandler";

type ActionDeps = {
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
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAccountAdminActionHandlers = ({
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
}: ActionDeps) => {
  const handleCreate = useAccountAdminCreateHandler({
    currentUid,
    createDisplayName,
    createEmail,
    createIsAdmin,
    createPassword,
    loadAccounts,
    reportError,
    clearError,
    resetCreateForm,
    setActionLoading,
  });
  const handleUpdate = useAccountAdminUpdateHandler({
    editingAccount,
    editDisplayName,
    editIsAdmin,
    loadAccounts,
    reportError,
    clearError,
    cancelEdit,
    setActionLoading,
  });
  const handleDelete = useAccountAdminDeleteHandler({
    currentUid,
    loadAccounts,
    reportError,
    clearError,
    setActionLoading,
  });

  return createAccountAdminActionHandlersResult({
    handleCreate,
    handleUpdate,
    handleDelete,
  });
};
