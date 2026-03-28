import { ACCOUNT_FIREBASE_ERROR_MESSAGES } from "./helpers";

export const getCreateAccountErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "code" in err) {
    const firebaseErr = err as { code: string };
    switch (firebaseErr.code) {
      case "auth/email-already-in-use":
        return ACCOUNT_FIREBASE_ERROR_MESSAGES.emailAlreadyInUse;
      case "auth/weak-password":
        return ACCOUNT_FIREBASE_ERROR_MESSAGES.weakPassword;
      case "auth/invalid-email":
        return ACCOUNT_FIREBASE_ERROR_MESSAGES.invalidEmail;
      default:
        return firebaseErr.code.includes("network")
          ? ACCOUNT_FIREBASE_ERROR_MESSAGES.networkError
          : ACCOUNT_FIREBASE_ERROR_MESSAGES.createAccountGeneric;
    }
  }

  return ACCOUNT_FIREBASE_ERROR_MESSAGES.createAccountGeneric;
};
