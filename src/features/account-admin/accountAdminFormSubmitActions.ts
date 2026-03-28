import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  submitCreateAccount,
  submitUpdateAccount,
} from "./accountAdminPageActionHandlers";
import type { Account } from "./types";

type SharedActionDeps = {
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

type CreateHandlerArgs = SharedActionDeps & {
  currentUid?: string;
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  resetCreateForm: () => void;
};

type UpdateHandlerArgs = SharedActionDeps & {
  editingAccount: Account | null;
  editDisplayName: string;
  editIsAdmin: boolean;
  cancelEdit: () => void;
};

export const createAccountAdminCreateHandler = ({
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
}: CreateHandlerArgs) => {
  return async (event: FormEvent) => {
    event.preventDefault();
    await submitCreateAccount({
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
  };
};

export const createAccountAdminUpdateHandler = ({
  editingAccount,
  editDisplayName,
  editIsAdmin,
  loadAccounts,
  reportError,
  clearError,
  cancelEdit,
  setActionLoading,
}: UpdateHandlerArgs) => {
  return async (event: FormEvent) => {
    event.preventDefault();
    await submitUpdateAccount({
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
};
