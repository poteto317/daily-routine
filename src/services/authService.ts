import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { appConfig } from "@/config";
import {
  buildLocalAuthUser,
  isLocalAuthEnabled,
  readLocalAuthSnapshot,
  subscribeLocalAuthSnapshot,
  type LocalAuthSnapshot,
  writeLocalAuthSnapshot,
} from "@/features/auth/storage";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import texts from "./locales/ja.json";

const TEST_ACCOUNT = {
  email: appConfig.auth.testAccount.email,
  password: appConfig.auth.testAccount.password,
};

const createLocalAuthUid = (prefix: string, value?: string) => {
  if (!value) {
    return `local-${prefix}`;
  }

  return `local-${prefix}-${value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
};

const signInWithLocalSnapshot = async (snapshot: LocalAuthSnapshot) => {
  writeLocalAuthSnapshot(snapshot);
};

export const getLocalAuthUser = () => {
  const snapshot = readLocalAuthSnapshot();
  return snapshot ? buildLocalAuthUser(snapshot) : null;
};

export const subscribeLocalAuthUser = (
  listener: (user: ReturnType<typeof getLocalAuthUser>) => void,
): (() => void) => {
  return subscribeLocalAuthSnapshot((snapshot) => {
    listener(snapshot ? buildLocalAuthUser(snapshot) : null);
  });
};

const assertFirebaseConfigured = (message: string) => {
  if (!isFirebaseConfigured) throw new Error(message);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured && isLocalAuthEnabled) {
    await signInWithLocalSnapshot({
      uid: createLocalAuthUid("user", email),
      email,
      isAnonymous: false,
    });
    return;
  }

  assertFirebaseConfigured(texts.authService.firebaseNotConfigured);
  const auth = getAuthInstance();
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured && isLocalAuthEnabled) {
    await signInWithLocalSnapshot({
      uid: createLocalAuthUid("user", email),
      email,
      isAnonymous: false,
    });
    return;
  }

  assertFirebaseConfigured(texts.authService.firebaseNotConfigured);
  const auth = getAuthInstance();
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  if (!isFirebaseConfigured && isLocalAuthEnabled) {
    writeLocalAuthSnapshot(null);
    setCurrentUserId(null);
    return;
  }

  const auth = getAuthInstance();
  setCurrentUserId(null);
  await firebaseSignOut(auth);
};

export const signInAnonymousUser = async () => {
  if (!isFirebaseConfigured && isLocalAuthEnabled) {
    await signInWithLocalSnapshot({
      uid: createLocalAuthUid("anonymous"),
      email: null,
      isAnonymous: true,
    });
    return;
  }

  assertFirebaseConfigured(texts.authService.cloudNotConfigured);
  const auth = getAuthInstance();
  await signInAnonymously(auth);
};

export const signInAsTestUser = async () => {
  if (!isFirebaseConfigured && isLocalAuthEnabled) {
    await signInWithLocalSnapshot({
      uid: createLocalAuthUid("test", TEST_ACCOUNT.email),
      email: TEST_ACCOUNT.email,
      isAnonymous: false,
    });
    return;
  }

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
