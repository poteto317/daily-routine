import type { Firestore } from "../adminSdk";
import { API_KEY_PATTERN, hashApiKey } from "./apiKey";

/**
 * API キーから uid を解決する。
 * 形式が不正なキーは Firestore を引かずに null にする。失効は apiKeys ドキュメントの削除で表す。
 */
export const resolveUidByApiKey = async (
  db: Firestore,
  key: string,
): Promise<string | null> => {
  if (!API_KEY_PATTERN.test(key)) return null;
  const snapshot = await db.collection("apiKeys").doc(hashApiKey(key)).get();
  if (!snapshot.exists) return null;
  const uid = snapshot.data()?.uid;
  return typeof uid === "string" && uid.length > 0 ? uid : null;
};
