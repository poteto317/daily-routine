import type { Dispatch, SetStateAction } from "react";
import { createAccountAdminCreateHandler } from "./accountAdminFormSubmitActions";

type UseAccountAdminCreateHandlerArgs = {
  currentUid?: string;
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  loadAccounts: () => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
  resetCreateForm: () => void;
  setActionLoading: Dispatch<SetStateAction<boolean>>;
};

export const useAccountAdminCreateHandler = ({
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
}: UseAccountAdminCreateHandlerArgs) => {
  return createAccountAdminCreateHandler({
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
