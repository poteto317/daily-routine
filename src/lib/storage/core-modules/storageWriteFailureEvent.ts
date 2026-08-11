import {
  toStorageWriteFailureReason,
  type StorageWriteFailureReason,
} from "./storageWriteFailureReason";

export const STORAGE_WRITE_FAILED_EVENT = "storage-write-failed";

export type StorageWriteFailureDetail = {
  /** 書き込もうとしたキー（ユーザースコープ適用前） */
  key: string;
  reason: StorageWriteFailureReason;
};

// 発火中フラグ。リスナーの中で再び書き込みが失敗したときの連鎖を止める。
let isDispatching = false;

// 直近の失敗。リスナーが張られる前に起きた失敗を取りこぼさないために保持する。
// リスナーが受け取れたかどうかは区別せず、常に最後の 1 件を上書きで持つ。
let lastFailure: StorageWriteFailureDetail | null = null;

/**
 * 再入ガードをかけて 1 件だけ発火する。
 *
 * 発火中に呼び直された場合は無視する。リスナーの中で別の書き込みを行い、
 * それも失敗したときの直接の連鎖を止めるため。防げるのは同期的な再入だけで
 * ある点に注意。React の再描画はバッチされてこの関数を抜けたあとに走るため、
 * 再描画をきっかけにした失敗はここでは止まらない。そちらは購読側で
 * 「同じ失敗なら状態を据え置く」ことで再描画のループを断つ。
 */
const emitStorageWriteFailure = (detail: StorageWriteFailureDetail): void => {
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

/**
 * 直近の失敗を、いま張られているリスナーへ再送する。
 *
 * React は子の effect を親より先に実行するため、アプリ全体を包む側で
 * 購読していると、子のマウント処理で起きた失敗はリスナーが張られる前に
 * 発火してしまう。起動直後の移行処理や既定値の書き込みはこの経路を通るため、
 * イベントだけに頼ると取りこぼす。
 *
 * 取りこぼしを直接返さず再送にしているのは、購読側が「イベントを受けたら
 * 状態を更新する」という 1 本の経路だけを持てるようにするため。
 *
 * 対象は「まだ誰も受け取っていない失敗」に限らない。受け取れたかどうかを
 * 追跡していないため、リスナーが既に処理した失敗もそのまま再送する。
 * 購読側はアプリ全体で 1 つだけ、ルートレイアウトに置かれて再マウントしない
 * ため、実際に二度送られることはない。追跡の仕組みを足すほどの利点がない。
 *
 * 再送は 1 度だけ。同じ失敗が購読のたびに蘇らないように、送ったら消す。
 */
export const replayLastStorageWriteFailure = (): void => {
  if (typeof window === "undefined") return;
  // 発火中なら失敗を消さずに戻る。ここで消すと再送先が居ないまま失われる
  if (isDispatching) return;

  const failure = lastFailure;
  if (!failure) return;
  lastFailure = null;

  emitStorageWriteFailure(failure);
};

/**
 * 書き込み失敗を window イベントで通知する。
 *
 * setStorageItem 系の呼び出しはアプリ全体で 46 箇所あり、戻り値で失敗を
 * 伝える形にすると全箇所に手が入る。既存の LOCAL_DATA_UPDATED_AT_EVENT と
 * 同じく CustomEvent で伝播させ、受け手を 1 つに集約する。
 *
 * 再入の扱いは emitStorageWriteFailure に委ねる。
 */
export const dispatchStorageWriteFailed = (
  key: string,
  error: unknown,
): void => {
  if (typeof window === "undefined") return;
  if (isDispatching) return;

  const detail: StorageWriteFailureDetail = {
    key,
    reason: toStorageWriteFailureReason(error),
  };
  lastFailure = detail;

  emitStorageWriteFailure(detail);
};
