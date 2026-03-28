import type { Dispatch, SetStateAction } from "react";

type CreateLoginActionRuntimeStateResultArgs = {
  error: string | null;
  loading: boolean;
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const createLoginActionRuntimeStateResult = ({
  error,
  loading,
  setError,
  setLoading,
}: CreateLoginActionRuntimeStateResultArgs) => {
  return {
    error,
    loading,
    setError,
    setLoading,
  };
};
