import { signInAnonymously, type User } from "firebase/auth";
import { isFirebaseConfigured } from "./config";
import { FirebaseError } from "./error";
import { getFirebaseState } from "./state";
import texts from "../locales/ja.json";

export const getOrCreateUser = async (): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new FirebaseError(
      texts.firebaseAuth.configIncomplete,
      "auth/configuration-not-found",
    );
  }

  const { auth } = getFirebaseState();
  if (!auth) {
    throw new FirebaseError(
      texts.firebaseAuth.notInitialized,
      "auth-not-available",
    );
  }

  if (auth.currentUser) return auth.currentUser;

  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

export const getAuthInstance = () => {
  if (typeof window === "undefined") {
    throw new FirebaseError(
      texts.firebaseAuth.serverSideNotAvailable,
      "auth-not-available",
    );
  }

  const { auth } = getFirebaseState();
  if (!auth) {
    throw new FirebaseError(
      texts.firebaseAuth.notInitialized,
      "auth-not-available",
    );
  }

  return auth;
};
