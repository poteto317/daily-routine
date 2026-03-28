import type { Dispatch, SetStateAction } from "react";

type CreateAccountAdminStatusStateResultArgs = {
  error: string | null;
  isAdmin: boolean;
  loading: boolean;
  setError: Dispatch<SetStateAction<string | null>>;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const createAccountAdminStatusStateResult = ({
  error,
  isAdmin,
  loading,
  setError,
  setIsAdmin,
  setLoading,
}: CreateAccountAdminStatusStateResultArgs) => {
  return {
    error,
    isAdmin,
    loading,
    setError,
    setIsAdmin,
    setLoading,
  };
};
