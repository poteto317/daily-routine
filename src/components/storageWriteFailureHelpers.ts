import type { StorageWriteFailureReason } from "@/lib/storage/core";
import texts from "./locales/ja.json";

/**
 * 保存に失敗した理由から、ユーザーに見せる文言を決める。
 *
 * 上限超過はユーザー自身が解消できるため、対処方法まで案内する。
 */
export const getStorageWriteFailureMessage = (
  reason: StorageWriteFailureReason,
): string =>
  reason === "quota-exceeded"
    ? texts.storageWriteFailure.quotaExceeded
    : texts.storageWriteFailure.unknown;
