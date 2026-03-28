import { createLoginPageActionBindings } from "./loginPageActionBindings";
import { createLoginPageStateResult } from "./loginPageStateResult";
import { useLoginActionState } from "./useLoginActionState";
import { useLoginFormState } from "./useLoginFormState";

export const useLoginPageState = () => {
  const form = useLoginFormState();
  const actions = useLoginActionState(
    createLoginPageActionBindings({
      email: form.email,
      isSignUp: form.isSignUp,
      password: form.password,
      setIsSignUp: form.setIsSignUp,
    }),
  );

  return createLoginPageStateResult({
    email: form.email,
    error: actions.error,
    isSignUp: form.isSignUp,
    loading: actions.loading,
    password: form.password,
    handleAnonymousLogin: actions.handleAnonymousLogin,
    handleEmailChange: form.handleEmailChange,
    handlePasswordChange: form.handlePasswordChange,
    handleSubmit: actions.handleSubmit,
    handleTestLogin: actions.handleTestLogin,
    toggleMode: actions.toggleMode,
  });
};
