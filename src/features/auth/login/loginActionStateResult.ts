type CreateLoginActionStateResultArgs = {
  error: string | null;
  loading: boolean;
  handleAnonymousLogin: () => Promise<void>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleTestLogin: () => Promise<void>;
  toggleMode: () => void;
};

export const createLoginActionStateResult = ({
  error,
  loading,
  handleAnonymousLogin,
  handleSubmit,
  handleTestLogin,
  toggleMode,
}: CreateLoginActionStateResultArgs) => {
  return {
    error,
    loading,
    handleAnonymousLogin,
    handleSubmit,
    handleTestLogin,
    toggleMode,
  };
};
