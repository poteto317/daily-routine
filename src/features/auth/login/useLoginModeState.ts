import { useState } from "react";
import { createLoginModeStateResult } from "./loginModeStateResult";

export const useLoginModeState = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return createLoginModeStateResult({
    isSignUp,
    setIsSignUp,
  });
};
