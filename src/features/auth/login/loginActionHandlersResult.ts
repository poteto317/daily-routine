type LoginActionHandlersResultArgs = {
  handleAnonymousLogin: () => Promise<void>;
  handleSubmit: (event: React.FormEvent) => Promise<void>;
  handleTestLogin: () => Promise<void>;
  toggleMode: () => void;
};

export const createLoginActionHandlersResult = ({
  handleAnonymousLogin,
  handleSubmit,
  handleTestLogin,
  toggleMode,
}: LoginActionHandlersResultArgs) => {
  return {
    handleAnonymousLogin,
    handleSubmit,
    handleTestLogin,
    toggleMode,
  };
};
