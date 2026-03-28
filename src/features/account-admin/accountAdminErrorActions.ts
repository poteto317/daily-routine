import type { Dispatch, SetStateAction } from "react";

export const createAccountAdminErrorActions = (
  setError: Dispatch<SetStateAction<string | null>>,
) => {
  return {
    clearError: () => setError(null),
    reportError: (message: string) => setError(message),
  };
};
