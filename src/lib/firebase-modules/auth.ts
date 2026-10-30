import { signInAnonymously, type Auth, type User } from "firebase/auth";
import { isFirebaseConfigured } from "./config";
import { FirebaseError } from "./error";
import { getFirebaseState } from "./state";
import texts from "../locales/ja.json";

/** 初期化済みの Auth を返す。未初期化なら auth-not-available を投げる */
const requireInitializedAuth = (): Auth => {
  const { auth } = getFirebaseState();
  if (!auth) {
    throw new FirebaseError(
      texts.firebaseAuth.notInitialized,
      "auth-not-available",
    );
  }

  return auth;
};

/**
 * ログイン中のユーザーを返す。未ログインなら匿名ログインしてそのユーザーを返す。
 * Firebase の設定が不完全・Auth が未初期化なら FirebaseError を投げる。
 */
export const getOrCreateUser = async (): Promise<User> => {
  if (!isFirebaseConfigured) {
    throw new FirebaseError(
      texts.firebaseAuth.configIncomplete,
      "auth/configuration-not-found",
    );
  }

  const auth = requireInitializedAuth();

  if (auth.currentUser) return auth.currentUser;

  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
};

/**
 * ブラウザ上で初期化済みの Auth を返す。
 * サーバー側（window が無い環境）や Auth が未初期化なら FirebaseError を投げる。
 */
export const getAuthInstance = (): Auth => {
  if (typeof window === "undefined") {
    throw new FirebaseError(
      texts.firebaseAuth.serverSideNotAvailable,
      "auth-not-available",
    );
  }

  return requireInitializedAuth();
};
