import { PROCESSING_LOCK_TIMEOUT_MS } from "./constants";

/**
 * processing ロック取得可否を判定する純粋関数。
 *
 * 取得可能なケース:
 * - status が "pending"（通常フロー）。
 * - status が "processing" かつ processingAt が stale（>= PROCESSING_LOCK_TIMEOUT_MS 前）。
 *   過去の実行がクラッシュ等で stuck している場合の復旧経路。
 * - status が "processing" かつ processingAt が未設定（旧データ互換）。
 *
 * 取得不可なケース:
 * - status が "processing" かつ processingAt が fresh: 他の実行が進行中。
 * - status が "issued" / "error": 終端状態。
 */
export const canClaimProcessing = (
  status: string | undefined,
  processingAtMs: number | undefined,
  nowMs: number,
): boolean => {
  if (status === "pending") return true;
  if (status === "processing") {
    if (processingAtMs == null) return true;
    return nowMs - processingAtMs >= PROCESSING_LOCK_TIMEOUT_MS;
  }
  return false;
};
