import { executeCreateAccount } from "./accountAdminCreateAction";
import { getCreateAccountErrorMessage } from "./accountAdminCreateError";
import {
  executeDeleteAccount,
  executeUpdateAccount,
} from "./accountAdminMutationActions";
import { ACCOUNT_ADMIN_ERROR_MESSAGES } from "./helpers";
import {
  blockSelfAccountDeletion,
  confirmAccountDeletion,
  runAccountAdminAction,
} from "./accountAdminPageActionWorkflowActions";
import type { Account } from "./types";

type SharedActionArgs = {
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  setActionLoading: (loading: boolean) => void;
};

type CreateActionArgs = SharedActionArgs & {
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  resetCreateForm: () => void;
};

type UpdateActionArgs = SharedActionArgs & {
  editingAccount: Account | null;
  editDisplayName: string;
  editIsAdmin: boolean;
  cancelEdit: () => void;
};

type DeleteActionArgs = SharedActionArgs & {
  account: Account;
  currentUid?: string;
  confirmFn?: (message?: string) => boolean;
};

export const canCreateAccount = (
  createEmail: string,
  createPassword: string,
): boolean => {
  return Boolean(createEmail && createPassword);
};

export const submitCreateAccount = async ({
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
  loadAccounts,
  reportError,
  clearError,
  resetCreateForm,
  setActionLoading,
}: CreateActionArgs): Promise<void> => {
  if (!canCreateAccount(createEmail, createPassword)) {
    return;
  }

  await runAccountAdminAction({
    clearError,
    setActionLoading,
    execute: async () => {
      await executeCreateAccount({
        createDisplayName,
        createEmail,
        createIsAdmin,
        createPassword,
      });

      resetCreateForm();
      await loadAccounts();
    },
    onError: (error) => {
      reportError(getCreateAccountErrorMessage(error));
    },
  });
};

export const submitUpdateAccount = async ({
  editingAccount,
  editDisplayName,
  editIsAdmin,
  loadAccounts,
  reportError,
  clearError,
  cancelEdit,
  setActionLoading,
}: UpdateActionArgs): Promise<void> => {
  if (!editingAccount) {
    return;
  }

  await runAccountAdminAction({
    clearError,
    setActionLoading,
    execute: async () => {
      await executeUpdateAccount({
        editDisplayName,
        editIsAdmin,
        editingAccount,
      });
      cancelEdit();
      await loadAccounts();
    },
    onError: () => {
      reportError(ACCOUNT_ADMIN_ERROR_MESSAGES.updateAccountFailed);
    },
  });
};

export const submitDeleteAccount = async ({
  account,
  currentUid,
  loadAccounts,
  reportError,
  clearError,
  setActionLoading,
  confirmFn = window.confirm,
}: DeleteActionArgs): Promise<void> => {
  if (
    blockSelfAccountDeletion({
      account,
      currentUid,
      reportError,
    })
  ) {
    return;
  }

  if (!confirmAccountDeletion({ account, confirmFn })) {
    return;
  }

  await runAccountAdminAction({
    clearError,
    setActionLoading,
    execute: async () => {
      await executeDeleteAccount({ account, currentUid });
      await loadAccounts();
    },
    onError: () => {
      reportError(ACCOUNT_ADMIN_ERROR_MESSAGES.deleteAccountFailed);
    },
  });
};
