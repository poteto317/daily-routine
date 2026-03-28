import {
  signInAnonymousUser,
  signInAsTestUser as signInAsTestUserService,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/services/authService";
import { createAuthActionsResult } from "./authActionsResult";

export const useAuthActions = () => {
  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await signUpWithEmail(email, password);
  };

  const signOut = async () => {
    await signOutUser();
  };

  const signInAnonymous = async () => {
    await signInAnonymousUser();
  };

  const signInAsTestUser = async () => {
    await signInAsTestUserService();
  };

  return createAuthActionsResult({
    signIn,
    signUp,
    signOut,
    signInAnonymous,
    signInAsTestUser,
  });
};
