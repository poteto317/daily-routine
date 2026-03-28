import type { Dispatch, SetStateAction } from "react";
import type { Account } from "./types";

type CreateAccountAdminDataStateResultParams = {
  accounts: Account[];
  checkIsAdmin: (uid: string) => Promise<boolean>;
  clearError: () => void;
  error: string | null;
  isAdmin: boolean;
  loadAccounts: () => Promise<void>;
  loading: boolean;
  reportError: (message: string) => void;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const createAccountAdminDataStateResult = ({
  accounts,
  checkIsAdmin,
  clearError,
  error,
  isAdmin,
  loadAccounts,
  loading,
  reportError,
  setIsAdmin,
  setLoading,
}: CreateAccountAdminDataStateResultParams) => {
  return {
    accounts,
    checkIsAdmin,
    clearError,
    error,
    isAdmin,
    loadAccounts,
    loading,
    reportError,
    setIsAdmin,
    setLoading,
  };
};
