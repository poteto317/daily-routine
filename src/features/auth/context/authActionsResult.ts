type CreateAuthActionsResultArgs = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signInAsTestUser: () => Promise<void>;
};

export const createAuthActionsResult = ({
  signIn,
  signUp,
  signOut,
  signInAnonymous,
  signInAsTestUser,
}: CreateAuthActionsResultArgs) => {
  return {
    signIn,
    signUp,
    signOut,
    signInAnonymous,
    signInAsTestUser,
  };
};
