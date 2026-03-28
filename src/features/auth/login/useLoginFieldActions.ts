import type { Dispatch, SetStateAction } from "react";
import { createLoginFieldActionsResult } from "./loginFieldActionsResult";

type UseLoginFieldActionsArgs = {
  setEmail: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
};

export const useLoginFieldActions = ({
  setEmail,
  setPassword,
}: UseLoginFieldActionsArgs) => {
  return createLoginFieldActionsResult({
    handleEmailChange: (value: string) => setEmail(value),
    handlePasswordChange: (value: string) => setPassword(value),
  });
};
