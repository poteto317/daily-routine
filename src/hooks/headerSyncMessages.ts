/**
 * Header sync feedback messages
 */

import type { HeaderSyncResult } from "./useHeaderSync";

export const HEADER_SYNC_MESSAGES = {
  uploaded: "現在のローカルデータをクラウドへアップロードしました。",
  downloaded: "最後にアップロードされたクラウドデータをダウンロードして反映します。",
  error: "同期に失敗しました。通信状況を確認して再試行してください。",
} as const;

export const getHeaderSyncFeedbackMessage = (
  result: HeaderSyncResult,
): string | null => {
  if (result === "skipped") return null;

  if (result === "uploaded") return HEADER_SYNC_MESSAGES.uploaded;

  if (result === "downloaded") return HEADER_SYNC_MESSAGES.downloaded;

  return HEADER_SYNC_MESSAGES.error;
};
