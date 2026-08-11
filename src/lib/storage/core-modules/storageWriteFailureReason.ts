/** 書き込みが失敗した理由 */
export type StorageWriteFailureReason = "quota-exceeded" | "unknown";

/**
 * 保存領域の上限超過かどうかを判定する。
 *
 * ブラウザによって例外の name が異なるため両方を見る。
 * Chrome / Safari は QuotaExceededError、Firefox は
 * NS_ERROR_DOM_QUOTA_REACHED を投げる。
 *
 * DOMException であることを先に確かめるのは、同じ名前を持つだけの
 * 普通の Error を上限超過と誤認しないため。
 */
export const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) return false;

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
};

/** 捕捉した例外を、ユーザーに伝える理由へ変換する */
export const toStorageWriteFailureReason = (
  error: unknown,
): StorageWriteFailureReason =>
  isQuotaExceededError(error) ? "quota-exceeded" : "unknown";
