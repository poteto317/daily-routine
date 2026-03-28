import type { Dispatch, SetStateAction } from "react";

type CreateLoginModeStateResultArgs = {
  isSignUp: boolean;
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
};

export const createLoginModeStateResult = ({
  isSignUp,
  setIsSignUp,
}: CreateLoginModeStateResultArgs) => {
  return {
    isSignUp,
    setIsSignUp,
  };
};
