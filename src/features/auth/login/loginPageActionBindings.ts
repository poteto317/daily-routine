import type { Dispatch, SetStateAction } from "react";

type LoginPageActionBindingsArgs = {
  email: string;
  isSignUp: boolean;
  password: string;
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
};

export const createLoginPageActionBindings = ({
  email,
  isSignUp,
  password,
  setIsSignUp,
}: LoginPageActionBindingsArgs) => {
  return {
    email,
    isSignUp,
    password,
    setIsSignUp,
  };
};
