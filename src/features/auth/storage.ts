import type { User } from "firebase/auth";
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "@/lib/storage/core";

const LOCAL_AUTH_STORAGE_KEY = "local-dev-auth-user";
const LOCAL_AUTH_CHANGED_EVENT = "local-dev-auth-changed";

export type LocalAuthSnapshot = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

export const isLocalAuthEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH === "true";

export const readLocalAuthSnapshot = (): LocalAuthSnapshot | null => {
  return getStorageItem<LocalAuthSnapshot | null>(LOCAL_AUTH_STORAGE_KEY, null);
};

export const writeLocalAuthSnapshot = (
  snapshot: LocalAuthSnapshot | null,
): void => {
  if (typeof window === "undefined") return;

  try {
    if (snapshot) {
      setStorageItem(LOCAL_AUTH_STORAGE_KEY, snapshot, {
        skipLocalDataUpdatedAt: true,
      });
    } else {
      removeStorageItem(LOCAL_AUTH_STORAGE_KEY, {
        skipLocalDataUpdatedAt: true,
      });
    }

    window.dispatchEvent(
      new CustomEvent(LOCAL_AUTH_CHANGED_EVENT, { detail: snapshot }),
    );
  } catch {
    // ignore local auth persistence failures
  }
};

export const subscribeLocalAuthSnapshot = (
  listener: (snapshot: LocalAuthSnapshot | null) => void,
): (() => void) => {
  if (typeof window === "undefined") {
    listener(null);
    return () => undefined;
  }

  const emitCurrentSnapshot = () => {
    listener(readLocalAuthSnapshot());
  };

  const handleLocalAuthChanged = () => {
    emitCurrentSnapshot();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_AUTH_STORAGE_KEY) {
      emitCurrentSnapshot();
    }
  };

  emitCurrentSnapshot();
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

export const buildLocalAuthUser = (snapshot: LocalAuthSnapshot): User => {
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
