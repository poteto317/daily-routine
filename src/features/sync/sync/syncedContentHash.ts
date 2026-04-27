const SYNCED_CONTENT_HASH_KEY = "synced-content-hash";

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
 * 同期済みデータのコンテンツハッシュを localStorage に保存する。
 * アップロード / ダウンロード成功時に呼び出す。
 */
export const saveSyncedContentHash = (data: object): void => {
  if (typeof window === "undefined") return;
  try {
    const hash = computeContentHash(data);
    localStorage.setItem(SYNCED_CONTENT_HASH_KEY, String(hash));
  } catch {
    // SecurityError / QuotaExceededError などは無視する
  }
};

/**
 * 保存されている同期済みコンテンツハッシュを取得する。
 * 未保存（初回）の場合は null を返す。
 */
export const getSyncedContentHash = (): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SYNCED_CONTENT_HASH_KEY);
    if (stored === null) return null;
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
};
