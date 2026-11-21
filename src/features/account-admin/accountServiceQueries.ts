import {
  collection,
  getDocFromServer,
  getDocsFromServer,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";
import { type Account } from "./types";
import {
  ACCOUNTS_COLLECTION,
  ACCOUNT_ADMIN_GRANTS_COLLECTION,
  getAccountAdminGrantRef,
  getAccountDocRef,
} from "./accountServiceCore";

const stringOrEmpty = (value: unknown): string =>
  typeof value === "string" ? value : "";

const toAccount = (entry: QueryDocumentSnapshot, isAdmin: boolean): Account => {
  const profile = entry.data();
  return {
    uid: entry.id,
    email: stringOrEmpty(profile.email),
    displayName: stringOrEmpty(profile.displayName),
    isAdmin,
    isAnonymous: profile.isAnonymous === true,
    isTestUser: profile.isTestUser === true,
    createdAt: stringOrEmpty(profile.createdAt),
    updatedAt: stringOrEmpty(profile.updatedAt),
  };
};

export const checkIsAdmin = async (uid: string): Promise<boolean> =>
  (await getDocFromServer(getAccountAdminGrantRef(uid))).exists();

export const getAccounts = async (): Promise<Account[]> => {
  const firestore = getFirestoreInstance();
  const accountsRef = collection(firestore, ACCOUNTS_COLLECTION);
  const grantsRef = collection(firestore, ACCOUNT_ADMIN_GRANTS_COLLECTION);
  const [accounts, grants] = await Promise.all([
    getDocsFromServer(accountsRef),
    getDocsFromServer(grantsRef),
  ]);
  const adminIds = new Set(grants.docs.map((entry) => entry.id));

  // Firestore の orderBy は createdAt が欠けた旧プロフィールを除外する。
  return accounts.docs
    .map((entry) => toAccount(entry, adminIds.has(entry.id)))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const getAccount = async (uid: string): Promise<Account | null> => {
  const entry = await getDocFromServer(getAccountDocRef(uid));
  if (!entry.exists()) return null;
  return toAccount(entry, await checkIsAdmin(entry.id));
};
