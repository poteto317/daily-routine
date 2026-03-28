import type { Account } from "./types";

type AccountAdminPageActionBindingsArgs = {
  cancelEdit: () => void;
  clearError: () => void;
  createDisplayName: string;
  createEmail: string;
  createIsAdmin: boolean;
  createPassword: string;
  currentUid?: string;
  editDisplayName: string;
  editIsAdmin: boolean;
  editingAccount: Account | null;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  resetCreateForm: () => void;
};

export const createAccountAdminPageActionBindings = ({
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
}: AccountAdminPageActionBindingsArgs) => {
  return {
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
  };
};
