type LoginPageStateResultArgs = {
  email: string;
  error: string | null;
  isSignUp: boolean;
  loading: boolean;
  password: string;
  handleAnonymousLogin: () => Promise<void>;
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleTestLogin: () => Promise<void>;
  toggleMode: () => void;
};

export const createLoginPageStateResult = ({
  email,
  error,
  isSignUp,
  loading,
  password,
  handleAnonymousLogin,
  handleEmailChange,
  handlePasswordChange,
  handleSubmit,
  handleTestLogin,
  toggleMode,
}: LoginPageStateResultArgs) => {
  return {
    email,
    error,
    isSignUp,
    loading,
    password,
    handleAnonymousLogin,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleTestLogin,
    toggleMode,
  };
};
