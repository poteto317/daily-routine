import type { Dispatch, SetStateAction } from "react";
import { createAccountAdminCreateHandler } from "./accountAdminFormSubmitActions";

type UseAccountAdminCreateHandlerArgs = {
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
