import type { Account } from "./types";
import {
  ACCOUNT_COMMON_EMPTY_LABEL,
  ACCOUNT_DISPLAY_LABELS,
  ACCOUNT_EMAIL_EMPTY_LABEL,
} from "./helpers";
import { isAccountSelf } from "./accountUtils";

export const getAccountEmailLabel = (email: string): string => {
  return email || ACCOUNT_EMAIL_EMPTY_LABEL;
};

export const getAccountDisplayNameLabel = (displayName: string): string => {
  return displayName || ACCOUNT_COMMON_EMPTY_LABEL;
};

export const getAccountRowClassName = (
  accountUid: string,
  currentUid?: string,
): string => {
  return `border-b border-gray-100 ${isAccountSelf(accountUid, currentUid) ? "bg-blue-50/50" : ""}`;
};

export const getAccountRoleLabel = (isAdmin: boolean): string => {
  return isAdmin ? ACCOUNT_DISPLAY_LABELS.roleAdmin : ACCOUNT_DISPLAY_LABELS.roleUser;
};

export const getAccountTypeLabel = (account: Account): string => {
  if (account.isAnonymous) return ACCOUNT_DISPLAY_LABELS.typeAnonymous;
  if (account.isTestUser) return ACCOUNT_DISPLAY_LABELS.typeTest;
  return ACCOUNT_DISPLAY_LABELS.typeNormal;
};

export const getAccountCreatedDateLabel = (createdAt?: string): string => {
  if (!createdAt) return ACCOUNT_COMMON_EMPTY_LABEL;
  return new Date(createdAt).toLocaleDateString("ja-JP");
};

