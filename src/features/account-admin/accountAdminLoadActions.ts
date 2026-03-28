import type { Dispatch, SetStateAction } from "react";
import type { Account } from "./types";

type CreateLoadAccountsActionArgs = {
  setAccounts: Dispatch<SetStateAction<Account[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  getAccounts: () => Promise<Account[]>;
  loadErrorMessage: string;
  logError?: (error: unknown) => void;
};

export const createLoadAccountsAction = ({
  setAccounts,
  setLoading,
  setError,
  getAccounts,
  loadErrorMessage,
  logError = console.error,
}: CreateLoadAccountsActionArgs) => {
  return async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      setError(loadErrorMessage);
      logError(error);
    } finally {
      setLoading(false);
    }
  };
};
