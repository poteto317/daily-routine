import type { Dispatch, SetStateAction } from "react";
import { createLoginActionStateResult } from "./loginActionStateResult";
import { useLoginActionHandlers } from "./useLoginActionHandlers";
import { useLoginActionRuntimeState } from "./useLoginActionRuntimeState";

type UseLoginActionStateParams = {
  email: string;
  password: string;
  isSignUp: boolean;
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
};

export const useLoginActionState = ({
  email,
  isSignUp,
  password,
  setIsSignUp,
}: UseLoginActionStateParams) => {
  const runtime = useLoginActionRuntimeState();
  const handlers = useLoginActionHandlers({
    email,
    isSignUp,
    password,
    setIsSignUp,
    setError: runtime.setError,
    setLoading: runtime.setLoading,
  });

  return createLoginActionStateResult({
    error: runtime.error,
    loading: runtime.loading,
    handleAnonymousLogin: handlers.handleAnonymousLogin,
    handleSubmit: handlers.handleSubmit,
    handleTestLogin: handlers.handleTestLogin,
    toggleMode: handlers.toggleMode,
  });
};
