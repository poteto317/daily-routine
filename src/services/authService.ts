import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { appConfig } from "@/config";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import texts from "./locales/ja.json";

const TEST_ACCOUNT = {
  email: appConfig.auth.testAccount.email,
  password: appConfig.auth.testAccount.password,
};

const assertFirebaseConfigured = (message: string) => {
  if (!isFirebaseConfigured) throw new Error(message);
};

export const signInWithEmail = async (email: string, password: string) => {
  assertFirebaseConfigured(texts.authService.firebaseNotConfigured);
  const auth = getAuthInstance();
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  assertFirebaseConfigured(texts.authService.firebaseNotConfigured);
  const auth = getAuthInstance();
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  if (!isFirebaseConfigured) return;

  const auth = getAuthInstance();
  setCurrentUserId(null);
  await firebaseSignOut(auth);
};

export const signInAnonymousUser = async () => {
  assertFirebaseConfigured(texts.authService.cloudNotConfigured);
  const auth = getAuthInstance();
  await signInAnonymously(auth);
};

export const signInAsTestUser = async () => {
  assertFirebaseConfigured(texts.authService.cloudNotConfigured);

  try {
    await signInWithEmail(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      const firebaseError = error as { code: string };
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/invalid-credential"
      ) {
        await signUpWithEmail(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
        return;
      }
    }

    throw error;
  }
};
