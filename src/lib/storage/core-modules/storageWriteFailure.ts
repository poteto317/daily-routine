export const STORAGE_WRITE_FAILED_EVENT = "storage-write-failed";

/** 書き込みが失敗した理由 */
export type StorageWriteFailureReason = "quota-exceeded" | "unknown";

export type StorageWriteFailureDetail = {
  /** 書き込もうとしたキー（ユーザースコープ適用前） */
  key: string;
  reason: StorageWriteFailureReason;
};

/**
 * 保存領域の上限超過かどうかを判定する。
 *
 * ブラウザによって例外の name が異なるため両方を見る。
 * Chrome / Safari は QuotaExceededError、Firefox は
 * NS_ERROR_DOM_QUOTA_REACHED を投げる。
 */
export const isQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) return false;

  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
};

// 発火中フラグ。リスナーの中で再び書き込みが失敗したときの連鎖を止める。
let isDispatching = false;

// 直近の失敗。リスナーが張られる前に起きた失敗を取りこぼさないために保持する。
let lastFailure: StorageWriteFailureDetail | null = null;

/**
 * まだ誰も受け取っていない失敗を、いま張られているリスナーへ再送する。
 *
 * React は子の effect を親より先に実行するため、アプリ全体を包む側で
 * 購読していると、子のマウント処理で起きた失敗はリスナーが張られる前に
 * 発火してしまう。起動直後の移行処理や既定値の書き込みはこの経路を通るため、
 * イベントだけに頼ると取りこぼす。
 *
 * 取りこぼしを直接返さず再送にしているのは、購読側が「イベントを受けたら
 * 状態を更新する」という 1 本の経路だけを持てるようにするため。
 *
 * 再送は 1 度だけ。同じ失敗が購読のたびに蘇らないように、送ったら消す。
 */
export const replayLastStorageWriteFailure = (): void => {
  if (typeof window === "undefined") return;

  const failure = lastFailure;
  if (!failure) return;
  lastFailure = null;

  window.dispatchEvent(
    new CustomEvent<StorageWriteFailureDetail>(STORAGE_WRITE_FAILED_EVENT, {
      detail: failure,
    }),
  );
};

/**
 * 書き込み失敗を window イベントで通知する。
 *
 * setStorageItem 系の呼び出しはアプリ全体で 46 箇所あり、戻り値で失敗を
 * 伝える形にすると全箇所に手が入る。既存の LOCAL_DATA_UPDATED_AT_EVENT と
 * 同じく CustomEvent で伝播させ、受け手を 1 つに集約する。
 *
 * 発火中に同期的に呼び直された場合は無視する。リスナーの中で別の書き込みを
 * 行い、それも失敗したときの直接の連鎖を止めるため。防げるのは同期的な再入
 * だけである点に注意。React の再描画はバッチされてこの関数を抜けたあとに
 * 走るため、再描画をきっかけにした失敗はここでは止まらない。
 */
export const dispatchStorageWriteFailed = (
  key: string,
  error: unknown,
): void => {
  if (typeof window === "undefined") return;
  if (isDispatching) return;

  const detail: StorageWriteFailureDetail = {
    key,
    reason: isQuotaExceededError(error) ? "quota-exceeded" : "unknown",
  };
  lastFailure = detail;

  isDispatching = true;
  try {
    window.dispatchEvent(
      new CustomEvent<StorageWriteFailureDetail>(STORAGE_WRITE_FAILED_EVENT, {
        detail,
      }),
    );
  } finally {
    isDispatching = false;
  }
};
