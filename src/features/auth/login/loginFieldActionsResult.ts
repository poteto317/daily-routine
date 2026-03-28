type CreateLoginFieldActionsResultArgs = {
  handleEmailChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
};

export const createLoginFieldActionsResult = ({
  handleEmailChange,
  handlePasswordChange,
}: CreateLoginFieldActionsResultArgs) => {
  return {
    handleEmailChange,
    handlePasswordChange,
  };
};
