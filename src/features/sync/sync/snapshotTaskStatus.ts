import { FirebaseError } from "@/lib/firebase";
import { getSyncErrorMessage } from "./errorMessage";
import { setSyncStatus } from "./statusStore";
import type { SyncStatus } from "./types";

type SnapshotTaskOptions = {
  /** 失敗の内容から文言を作れないときに使う定型文 */
  fallbackMessage: string;
  /** 失敗時に投げる FirebaseError のコード */
  errorCode: string;
  /** 成功時に反映する同期状態。省略時は同期中を解除してエラーを消す */
  successStatus?: () => Partial<SyncStatus>;
};

const clearSyncingStatus = (): Partial<SyncStatus> => ({
  isSyncing: false,
  error: null,
});

/**
 * 同期履歴の操作を「同期中」の状態で実行する。
 *
 * - 開始時に同期中にしてエラーを消す
 * - 成功したら successStatus を反映して結果を返す
 * - 失敗したら同期中を解除してエラー文言を状態に残し、errorCode の FirebaseError を投げる
 */
export const runSnapshotTask = async <T>(
  task: () => Promise<T>,
  {
    fallbackMessage,
    errorCode,
    successStatus = clearSyncingStatus,
  }: SnapshotTaskOptions,
): Promise<T> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });
    const result = await task();
    setSyncStatus(successStatus());
    return result;
  } catch (error) {
    const errorMessage = getSyncErrorMessage(error, fallbackMessage);
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, errorCode);
  }
};
