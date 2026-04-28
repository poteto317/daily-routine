import { getStorageItem, setStorageItem } from "@/lib/storage/core";
import { SYNCED_CONTENT_HASH_KEY } from "./constants";

/**
 * オブジェクトのキーを再帰的にアルファベット順でソートして JSON 文字列化する。
 * JSON.stringify はプロパティ挿入順に依存するため、同一内容でも生成経路によって
 * 順序が異なる場合がある。stableStringify を使うことで順序依存を排除する。
 */
const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as object).sort();
    const pairs = keys.map(
      (k) =>
        `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
    );
    return `{${pairs.join(",")}}`;
  }
  return JSON.stringify(value);
};

/**
 * djb2 ハッシュ関数（32bit integer）。
 * stableStringify でキー順序を安定化してからハッシュを計算する。
 *
 * 注意: djb2 は 32bit であり、理論上衝突（異なるデータが同一ハッシュを持つ）が
 * 起こり得る。ハッシュ一致時に hasLocalChanges を false にするため、誤 false 判定の
 * リスクはあるが、典型的なユーザーデータの範囲では衝突確率は無視できるほど小さい。
 */
export const computeContentHash = (data: object): number => {
  const str = stableStringify(data);
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
 * 呼び出し前に setCurrentUserId(user.uid) でスコープが確立されていること。
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
