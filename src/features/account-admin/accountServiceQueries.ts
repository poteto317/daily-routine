import {
  collection,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";
import type { Account } from "./types";
import { ACCOUNTS_COLLECTION, getAccountDocRef } from "./accountServiceCore";

export const getAccounts = async (): Promise<Account[]> => {
  const firestore = getFirestoreInstance();
  const accountsRef = collection(firestore, ACCOUNTS_COLLECTION);
  const q = query(accountsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((entry) => ({
    uid: entry.id,
    ...entry.data(),
  })) as Account[];
};

export const getAccount = async (uid: string): Promise<Account | null> => {
  const docSnap = await getDoc(getAccountDocRef(uid));

  if (!docSnap.exists()) {
    return null;
  }

  return { uid: docSnap.id, ...docSnap.data() } as Account;
};

export const checkIsAdmin = async (uid: string): Promise<boolean> => {
  const account = await getAccount(uid);
  return account?.isAdmin === true;
};
