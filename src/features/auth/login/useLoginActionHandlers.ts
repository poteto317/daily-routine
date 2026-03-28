import type { Dispatch, SetStateAction } from "react";
import { useAuth } from "../context/useAuth";
import { createLoginActionHandlersResult } from "./loginActionHandlersResult";
import {
  createAnonymousLoginHandler,
  createLoginSubmitHandler,
  createTestLoginHandler,
} from "./loginAuthHandlers";
import { createLoginModeToggleHandler } from "./loginModeActions";

type UseLoginActionHandlersParams = {
  email: string;
  password: string;
  isSignUp: boolean;
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export const useLoginActionHandlers = ({
  email,
  isSignUp,
  password,
  setError,
  setIsSignUp,
  setLoading,
}: UseLoginActionHandlersParams) => {
  const { signIn, signUp, signInAnonymous, signInAsTestUser } = useAuth();

  const handleAnonymousLogin = createAnonymousLoginHandler({
    signInAnonymous,
    setError,
    setLoading,
  });
  const handleSubmit = createLoginSubmitHandler({
    isSignUp,
    email,
    password,
    signIn,
    signUp,
    setError,
    setLoading,
  });
  const handleTestLogin = createTestLoginHandler({
    signInAsTestUser,
    setError,
    setLoading,
  });
  const toggleMode = createLoginModeToggleHandler({
    isSignUp,
    setIsSignUp,
    setError,
  });

  return createLoginActionHandlersResult({
    handleAnonymousLogin,
    handleSubmit,
    handleTestLogin,
    toggleMode,
  });
};
