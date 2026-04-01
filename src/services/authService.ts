import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { appConfig } from "@/config";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import texts from "./locales/ja.json";

const LOCAL_AUTH_STORAGE_KEY = "local-dev-auth-user";
const LOCAL_AUTH_CHANGED_EVENT = "local-dev-auth-changed";

type LocalAuthSnapshot = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

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

const buildLocalAuthUser = (snapshot: LocalAuthSnapshot): User => {
  return {
    uid: snapshot.uid,
    email: snapshot.email,
    isAnonymous: snapshot.isAnonymous,
    displayName: snapshot.email,
    emailVerified: !snapshot.isAnonymous,
    phoneNumber: null,
    photoURL: null,
    providerId: "local",
    tenantId: null,
    delete: async () => undefined,
    getIdToken: async () => "local-dev-token",
    getIdTokenResult: async () => ({
      token: "local-dev-token",
      signInProvider: "custom",
      signInSecondFactor: null,
      authTime: new Date(0).toISOString(),
      issuedAtTime: new Date(0).toISOString(),
      expirationTime: new Date(8640000000000000).toISOString(),
      claims: {},
    }),
    reload: async () => undefined,
    toJSON: () => snapshot,
    providerData: [],
    metadata: {
      creationTime: new Date(0).toISOString(),
      lastSignInTime: new Date(0).toISOString(),
    },
    refreshToken: "local-dev-refresh-token",
  } as User;
};

const readLocalAuthSnapshot = (): LocalAuthSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as LocalAuthSnapshot;
  } catch {
    return null;
  }
};

const writeLocalAuthSnapshot = (snapshot: LocalAuthSnapshot | null) => {
  if (typeof window === "undefined") return;

  try {
    if (snapshot) {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(snapshot));
    } else {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }

    window.dispatchEvent(
      new CustomEvent(LOCAL_AUTH_CHANGED_EVENT, { detail: snapshot }),
    );
  } catch {
    // ignore local auth persistence failures
  }
};

const signInWithLocalSnapshot = async (snapshot: LocalAuthSnapshot) => {
  writeLocalAuthSnapshot(snapshot);
};

export const getLocalAuthUser = (): User | null => {
  const snapshot = readLocalAuthSnapshot();
  return snapshot ? buildLocalAuthUser(snapshot) : null;
};

export const subscribeLocalAuthUser = (
  listener: (user: User | null) => void,
): (() => void) => {
  if (typeof window === "undefined") {
    listener(null);
    return () => undefined;
  }

  const emitCurrentUser = () => {
    listener(getLocalAuthUser());
  };

  const handleLocalAuthChanged = () => {
    emitCurrentUser();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_AUTH_STORAGE_KEY) {
      emitCurrentUser();
    }
  };

  emitCurrentUser();
  window.addEventListener(LOCAL_AUTH_CHANGED_EVENT, handleLocalAuthChanged);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      LOCAL_AUTH_CHANGED_EVENT,
      handleLocalAuthChanged,
    );
    window.removeEventListener("storage", handleStorage);
  };
};

const assertFirebaseConfigured = (message: string) => {
  if (!isFirebaseConfigured) throw new Error(message);
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured) {
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
  if (!isFirebaseConfigured) {
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
  if (!isFirebaseConfigured) {
    writeLocalAuthSnapshot(null);
    setCurrentUserId(null);
    return;
  }

  const auth = getAuthInstance();
  setCurrentUserId(null);
  await firebaseSignOut(auth);
};

export const signInAnonymousUser = async () => {
  if (!isFirebaseConfigured) {
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
  if (!isFirebaseConfigured) {
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
