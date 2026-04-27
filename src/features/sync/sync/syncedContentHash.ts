import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { SYNCED_CONTENT_HASH_KEY } from "./constants";

/**
 * djb2 ハッシュ関数（32bit integer）。
 * JSON.stringify した文字列から高速に数値ハッシュを計算する。
 */
export const computeContentHash = (data: object): number => {
  const str = JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash | 0; // 32bit integer に丸める
  }
  return hash;
};

/**
 * 同期済みデータのコンテンツハッシュをユーザースコープ付きで保存する。
 * アップロード / ダウンロード成功時に呼び出す。
 */
export const saveSyncedContentHash = (data: object): void => {
  setStorageItem(SYNCED_CONTENT_HASH_KEY, computeContentHash(data), {
    skipLocalDataUpdatedAt: true,
  });
};

/**
 * 保存されている同期済みコンテンツハッシュを取得する。
 * 未保存（初回）の場合は null を返す。
 */
export const getSyncedContentHash = (): number | null => {
  const stored = getStorageItem<number | null>(SYNCED_CONTENT_HASH_KEY, null);
  return typeof stored === "number" ? stored : null;
};
