import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase";

const API_KEYS_COLLECTION = "apiKeys";

const apiKeyRef = (hash: string) =>
  doc(getFirestoreInstance(), API_KEYS_COLLECTION, hash);

export const listApiKeyHashes = async (uid: string): Promise<string[]> => {
  const snapshot = await getDocs(
    query(
      collection(getFirestoreInstance(), API_KEYS_COLLECTION),
      where("uid", "==", uid),
    ),
  );
  return snapshot.docs.map((keyDoc) => keyDoc.id);
};

/**
 * 新しいキーのハッシュを保存し、旧キーのハッシュをすべて削除する。
 * 1 回のバッチで行うため、成功すれば入れ替わり、失敗すれば何も変わらない
 * （旧キーは有効なまま、使われないキーも残らない）。
 */
export const replaceApiKeyHash = async (
  uid: string,
  newHash: string,
  previousHashes: string[],
): Promise<void> => {
  const batch = writeBatch(getFirestoreInstance());
  batch.set(apiKeyRef(newHash), { uid, createdAt: serverTimestamp() });
  previousHashes.forEach((hash) => batch.delete(apiKeyRef(hash)));
  await batch.commit();
};

/** 指定したキーのハッシュを 1 回のバッチですべて削除する（途中まで失効した状態を作らない） */
export const deleteApiKeyHashes = async (hashes: string[]): Promise<void> => {
  const batch = writeBatch(getFirestoreInstance());
  hashes.forEach((hash) => batch.delete(apiKeyRef(hash)));
  await batch.commit();
};
