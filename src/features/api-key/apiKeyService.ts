import { getOrCreateUser } from "@/lib/firebase";
import { generateApiKey, hashApiKey } from "./apiKeyGenerator";
import {
  deleteApiKeyHashes,
  listApiKeyHashes,
  saveApiKeyHash,
} from "./apiKeyRepository";

/**
 * 新しいキーを保存してから旧キーを削除する。
 * 保存に失敗した場合は旧キーを残し、キーが無い状態を作らない。
 * 戻り値の平文キーは呼び出し側が 1 回だけ表示する（保存しない）。
 */
export const issueApiKey = async (): Promise<string> => {
  const user = await getOrCreateUser();
  const key = generateApiKey();
  const hash = await hashApiKey(key);
  const previousHashes = await listApiKeyHashes(user.uid);

  await saveApiKeyHash(user.uid, hash);
  if (previousHashes.length > 0) {
    await deleteApiKeyHashes(previousHashes);
  }
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
