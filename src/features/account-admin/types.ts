/**
 * アカウント管理の型定義
 */

export interface Account {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  isAnonymous: boolean;
  isTestUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  email: string;
  password: string;
  displayName: string;
  isAdmin: boolean;
}

export interface UpdateAccountInput {
  displayName?: string;
  isAdmin?: boolean;
  password?: string;
}
