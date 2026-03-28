import texts from "./locales/ja.json";

export const AUTH_ERROR_MESSAGES = texts.authErrors;

export const getAuthErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "code" in err) {
    const firebaseError = err as { code: string };

    if (firebaseError.code === "auth/invalid-email") {
      return AUTH_ERROR_MESSAGES.invalidEmail;
    }
    if (
      firebaseError.code === "auth/user-not-found" ||
      firebaseError.code === "auth/wrong-password" ||
      firebaseError.code === "auth/invalid-credential"
    ) {
      return AUTH_ERROR_MESSAGES.invalidCredential;
    }
    if (firebaseError.code === "auth/email-already-in-use") {
      return AUTH_ERROR_MESSAGES.emailAlreadyInUse;
    }
    if (firebaseError.code === "auth/weak-password") {
      return AUTH_ERROR_MESSAGES.weakPassword;
    }
    if (firebaseError.code.includes("network")) {
      return AUTH_ERROR_MESSAGES.networkError;
    }
  }

  return AUTH_ERROR_MESSAGES.authFailed;
};
