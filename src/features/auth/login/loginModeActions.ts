type SetValue<T> = (value: T) => void;

export const createLoginModeToggleHandler = (params: {
  isSignUp: boolean;
  setIsSignUp: SetValue<boolean>;
  setError: SetValue<string | null>;
}) => {
  const { isSignUp, setIsSignUp, setError } = params;

  return () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };
};
