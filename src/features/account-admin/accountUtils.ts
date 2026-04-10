/**
 * 純粋なユーティリティ関数・データ定数
 * 表示層・サービス層・アクション層のいずれにも依存しない
 */

/** 匿名ユーザーのデフォルト表示名（DBに保存されるデータ値） */
export const ANONYMOUS_USER_DEFAULT_DISPLAY_NAME = "匿名ユーザー";

export const isAccountSelf = (
  accountUid: string,
  currentUid?: string,
): boolean => {
  return accountUid === currentUid;
};

export const getDefaultDisplayNameFromEmail = (email: string): string => {
  return email.split("@")[0];
};

export const getAccountIdentifierLabel = (account: {
  displayName: string;
  email: string;
}): string => {
  return account.displayName || account.email;
};
