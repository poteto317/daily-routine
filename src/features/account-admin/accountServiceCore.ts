import { doc } from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";

export const ACCOUNTS_COLLECTION = "accounts";
export const TEST_USER_EMAIL = "test@example.com";

export const getAccountDocRef = (uid: string) => {
  const firestore = getFirestoreInstance();
  return doc(firestore, ACCOUNTS_COLLECTION, uid);
};

export const createTimestamp = () => new Date().toISOString();
