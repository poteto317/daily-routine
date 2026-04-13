import type { User } from "firebase/auth";
import {
  getUnscopedStorageItem,
  removeUnscopedStorageItem,
  setUnscopedStorageItem,
} from "@/lib/storage/core";

const LOCAL_AUTH_STORAGE_KEY = "local-dev-auth-user";
const LOCAL_AUTH_CHANGED_EVENT = "local-dev-auth-changed";

export type LocalAuthSnapshot = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

/**
 * ローカル認証が有効かどうかを判定する。
 *
 * 環境変数だけでなく、実行環境が localhost/127.0.0.1/::1 の場合のみ許可する。
 * これにより、本番環境で環境変数が誤って設定された場合でも
 * 意図しない認証バイパスが発生しないよう防御している。
 * SSR（サーバーサイド）では window が存在しないため常に false を返す。
 */
export const isLocalDevHostname = (hostname: string): boolean =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1";

export const isLocalAuthEnabled =
  process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH === "true" &&
  typeof window !== "undefined" &&
  isLocalDevHostname(window.location.hostname);

export const readLocalAuthSnapshot = (): LocalAuthSnapshot | null => {
  return getUnscopedStorageItem<LocalAuthSnapshot | null>(
    LOCAL_AUTH_STORAGE_KEY,
    null,
  );
};

export const writeLocalAuthSnapshot = (
  snapshot: LocalAuthSnapshot | null,
): void => {
  if (typeof window === "undefined") return;

  try {
    if (snapshot) {
      setUnscopedStorageItem(LOCAL_AUTH_STORAGE_KEY, snapshot, {
        skipLocalDataUpdatedAt: true,
      });
    } else {
      removeUnscopedStorageItem(LOCAL_AUTH_STORAGE_KEY, {
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
