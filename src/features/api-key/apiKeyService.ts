import { getOrCreateUser } from "@/lib/firebase";
import { generateApiKey, hashApiKey } from "./apiKeyGenerator";
import {
  deleteApiKeyHashes,
  listApiKeyHashes,
  replaceApiKeyHash,
} from "./apiKeyRepository";

/**
 * 新しいキーの保存と旧キーの削除を、1 つのバッチで原子的に行う。
 * 失敗したら何も変わらない（旧キーは有効なまま）ので、エラー表示が実際の状態と一致する。
 * 戻り値の平文キーは呼び出し側が 1 回だけ表示する（保存しない）。
 */
export const issueApiKey = async (): Promise<string> => {
  const user = await getOrCreateUser();
  const key = generateApiKey();
  const hash = await hashApiKey(key);
  const previousHashes = await listApiKeyHashes(user.uid);

  await replaceApiKeyHash(user.uid, hash, previousHashes);
  return key;
};

export const revokeApiKeys = async (): Promise<void> => {
  const user = await getOrCreateUser();
  await deleteApiKeyHashes(await listApiKeyHashes(user.uid));
};

export const hasApiKey = async (): Promise<boolean> => {
  const user = await getOrCreateUser();
  return (await listApiKeyHashes(user.uid)).length > 0;
};
