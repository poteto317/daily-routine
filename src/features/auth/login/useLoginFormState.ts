import { useLoginFieldActions } from "./useLoginFieldActions";
import { useLoginCredentialsState } from "./useLoginCredentialsState";
import { useLoginModeState } from "./useLoginModeState";

export const useLoginFormState = () => {
  const { email, password, setEmail, setPassword } =
    useLoginCredentialsState();
  const { isSignUp, setIsSignUp } = useLoginModeState();
  const { handleEmailChange, handlePasswordChange } = useLoginFieldActions({
    setEmail,
    setPassword,
  });

  return {
    email,
    handleEmailChange,
    handlePasswordChange,
    isSignUp,
    password,
    setIsSignUp,
  };
};
