import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { appConfig } from "@/config";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";
import {
  shouldUseLocalAuth,
  signInLocalAnonymousUser,
  signInLocalEmailUser,
  signInLocalTestUser,
  signOutLocalUser,
} from "./localAuthService";
import texts from "./locales/ja.json";

/*
 * 認証の窓口。Firebase Auth を使い、Firebase 未設定でローカル認証が有効な
 * 開発環境ではローカル擬似認証（localAuthService.ts）に切り替える。
 */

export { getLocalAuthUser, subscribeLocalAuthUser } from "./localAuthService";

const TEST_ACCOUNT = {
  email: appConfig.auth.testAccount.email,
  password: appConfig.auth.testAccount.password,
};

/** テストアカウントがまだ作られていないとみなす Firebase のエラーコード */
const TEST_ACCOUNT_MISSING_CODES = new Set([
  "auth/user-not-found",
  "auth/invalid-credential",
]);

/** Firebase が設定済みなら Auth を返し、未設定なら message のエラーを投げる */
const requireFirebaseAuth = (message: string) => {
  if (!isFirebaseConfigured) throw new Error(message);
  return getAuthInstance();
};

const isTestAccountMissingError = (error: unknown): boolean =>
  !!error &&
  typeof error === "object" &&
  "code" in error &&
  TEST_ACCOUNT_MISSING_CODES.has((error as { code: string }).code);

export const signInWithEmail = async (email: string, password: string) => {
  if (shouldUseLocalAuth()) {
    signInLocalEmailUser(email);
    return;
  }

  const auth = requireFirebaseAuth(texts.authService.firebaseNotConfigured);
  await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (shouldUseLocalAuth()) {
    signInLocalEmailUser(email);
    return;
  }

  const auth = requireFirebaseAuth(texts.authService.firebaseNotConfigured);
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  if (shouldUseLocalAuth()) {
    signOutLocalUser();
    return;
  }

  // Firebase の設定有無は確かめず、取得できない場合は getAuthInstance のエラーになる
  const auth = getAuthInstance();
  setCurrentUserId(null);
  await firebaseSignOut(auth);
};

export const signInAnonymousUser = async () => {
  if (shouldUseLocalAuth()) {
    signInLocalAnonymousUser();
    return;
  }

  const auth = requireFirebaseAuth(texts.authService.cloudNotConfigured);
  await signInAnonymously(auth);
};

/**
 * テストアカウントでログインする。
 * アカウントがまだ無い（user-not-found / invalid-credential）ときは作成してログインする。
 */
export const signInAsTestUser = async () => {
  if (shouldUseLocalAuth()) {
    signInLocalTestUser(TEST_ACCOUNT.email);
    return;
  }

  if (!isFirebaseConfigured) {
    throw new Error(texts.authService.cloudNotConfigured);
  }

  try {
    await signInWithEmail(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
  } catch (error: unknown) {
    if (!isTestAccountMissingError(error)) throw error;
    await signUpWithEmail(TEST_ACCOUNT.email, TEST_ACCOUNT.password);
  }
};
