import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";

const API_KEYS_COLLECTION = "apiKeys";

export const listApiKeyHashes = async (uid: string): Promise<string[]> => {
  const snapshot = await getDocs(
    query(
      collection(getFirestoreInstance(), API_KEYS_COLLECTION),
      where("uid", "==", uid),
    ),
  );
  return snapshot.docs.map((keyDoc) => keyDoc.id);
};

export const saveApiKeyHash = async (
  uid: string,
  hash: string,
): Promise<void> => {
  await setDoc(doc(getFirestoreInstance(), API_KEYS_COLLECTION, hash), {
    uid,
    createdAt: serverTimestamp(),
  });
};

export const deleteApiKeyHashes = async (hashes: string[]): Promise<void> => {
  const firestore = getFirestoreInstance();
  await Promise.all(
    hashes.map((hash) => deleteDoc(doc(firestore, API_KEYS_COLLECTION, hash))),
  );
};
