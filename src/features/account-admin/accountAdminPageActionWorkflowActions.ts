import { getAccountIdentifierLabel, isAccountSelf } from "./accountUtils";
import {
  ACCOUNT_ADMIN_ERROR_MESSAGES,
  ACCOUNT_ADMIN_MESSAGES,
} from "./helpers";
import type { Account } from "./types";

type RunAccountAdminActionArgs = {
  clearError: () => void;
  setActionLoading: (loading: boolean) => void;
  execute: () => Promise<void>;
  onError: (error: unknown) => void;
  logError?: (error: unknown) => void;
};

type DeleteSelfGuardArgs = {
  account: Account;
  currentUid?: string;
  reportError: (message: string) => void;
};

type DeleteConfirmationArgs = {
  account: Account;
  confirmFn: (message?: string) => boolean;
};

export const runAccountAdminAction = async ({
  clearError,
  setActionLoading,
  execute,
  onError,
  logError = console.error,
}: RunAccountAdminActionArgs): Promise<void> => {
  try {
    setActionLoading(true);
    clearError();
    await execute();
  } catch (error) {
    onError(error);
    logError(error);
  } finally {
    setActionLoading(false);
  }
};

export const blockSelfAccountDeletion = ({
  account,
  currentUid,
  reportError,
}: DeleteSelfGuardArgs): boolean => {
  if (!isAccountSelf(account.uid, currentUid)) {
    return false;
  }

  reportError(ACCOUNT_ADMIN_ERROR_MESSAGES.deleteSelfForbidden);
  return true;
};

export const confirmAccountDeletion = ({
  account,
  confirmFn,
}: DeleteConfirmationArgs): boolean => {
  return confirmFn(
    ACCOUNT_ADMIN_MESSAGES.confirmDeleteAccount(
      getAccountIdentifierLabel(account),
    ),
  );
};
