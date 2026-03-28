import type { FormEvent } from "react";
import { AUTH_ERROR_MESSAGES, getAuthErrorMessage } from "./authErrorMessage";
import { runLoginPageAction } from "./loginRuntimeActions";

type SetValue<T> = (value: T) => void;

export const createLoginSubmitHandler = (params: {
  isSignUp: boolean;
  email: string;
  password: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  setError: SetValue<string | null>;
  setLoading: SetValue<boolean>;
}) => {
  const { isSignUp, email, password, signIn, signUp, setError, setLoading } =
    params;

  return async (event: FormEvent) => {
    event.preventDefault();

    await runLoginPageAction({
      setError,
      setLoading,
      execute: () =>
        isSignUp ? signUp(email, password) : signIn(email, password),
      onError: getAuthErrorMessage,
    });
  };
};

export const createTestLoginHandler = (params: {
  signInAsTestUser: () => Promise<void>;
  setError: SetValue<string | null>;
  setLoading: SetValue<boolean>;
  logError?: (error: unknown) => void;
}) => {
  const {
    signInAsTestUser,
    setError,
    setLoading,
    logError = console.error,
  } = params;

  return async () => {
    await runLoginPageAction({
      setError,
      setLoading,
      execute: signInAsTestUser,
      onError: () => AUTH_ERROR_MESSAGES.testLoginFailed,
      logError,
    });
  };
};

export const createAnonymousLoginHandler = (params: {
  signInAnonymous: () => Promise<void>;
  setError: SetValue<string | null>;
  setLoading: SetValue<boolean>;
  logError?: (error: unknown) => void;
}) => {
  const {
    signInAnonymous,
    setError,
    setLoading,
    logError = console.error,
  } = params;

  return async () => {
    await runLoginPageAction({
      setError,
      setLoading,
      execute: signInAnonymous,
      onError: () => AUTH_ERROR_MESSAGES.anonymousLoginFailed,
      logError,
    });
  };
};
