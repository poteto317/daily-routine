import {
  buildLocalAuthUser,
  isLocalAuthEnabled,
  readLocalAuthSnapshot,
  subscribeLocalAuthSnapshot,
  writeLocalAuthSnapshot,
} from "@/features/auth/storage";
import { isFirebaseConfigured } from "@/lib/firebase";
import { setCurrentUserId } from "@/lib/storage/core";

/*
 * 開発用のローカル擬似認証。
 * Firebase が未設定で、かつローカル認証が有効（NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true で、
 * ローカル開発用のホスト。判定は features/auth/storage.ts の isLocalAuthEnabled）のときだけ、
 * Firebase の代わりに使う。
 */

/** Firebase の代わりにローカル擬似認証を使うか */
export const shouldUseLocalAuth = (): boolean =>
  !isFirebaseConfigured && isLocalAuthEnabled;

/**
 * ローカルユーザーの uid を作る。
 * value があれば小文字にし、英数字以外の連続をハイフン 1 つにして前後のハイフンを除いて付ける。
 */
const createLocalAuthUid = (prefix: string, value?: string): string => {
  if (!value) {
    return `local-${prefix}`;
  }

  return `local-${prefix}-${value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
};

/** メールアドレスのローカルユーザーとしてログインする（uid は local-user-...） */
export const signInLocalEmailUser = (email: string): void => {
  writeLocalAuthSnapshot({
    uid: createLocalAuthUid("user", email),
    email,
    isAnonymous: false,
  });
};

/** テストアカウントのローカルユーザーとしてログインする（uid は local-test-...） */
export const signInLocalTestUser = (email: string): void => {
  writeLocalAuthSnapshot({
    uid: createLocalAuthUid("test", email),
    email,
    isAnonymous: false,
  });
};

/** 匿名のローカルユーザーとしてログインする（uid は local-anonymous） */
export const signInLocalAnonymousUser = (): void => {
  writeLocalAuthSnapshot({
    uid: createLocalAuthUid("anonymous"),
    email: null,
    isAnonymous: true,
  });
};

/** ローカルユーザーをログアウトし、現在のユーザー ID も解除する */
export const signOutLocalUser = (): void => {
  writeLocalAuthSnapshot(null);
  setCurrentUserId(null);
};

/** ログイン中のローカルユーザー。いなければ null */
export const getLocalAuthUser = () => {
  const snapshot = readLocalAuthSnapshot();
  return snapshot ? buildLocalAuthUser(snapshot) : null;
};

/** ローカルユーザーの変化を購読する。購読直後に現在の状態も通知する */
export const subscribeLocalAuthUser = (
  listener: (user: ReturnType<typeof getLocalAuthUser>) => void,
): (() => void) => {
  return subscribeLocalAuthSnapshot((snapshot) => {
    listener(snapshot ? buildLocalAuthUser(snapshot) : null);
  });
};
