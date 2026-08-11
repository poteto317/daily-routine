"use client";

import type { StorageWriteFailureReason } from "@/lib/storage/core";
import texts from "./locales/ja.json";

type StorageWriteFailureBannerProps = {
  reason: StorageWriteFailureReason;
  onDismiss: () => void;
};

/**
 * localStorage への書き込みが失敗したことを知らせるバナー。
 *
 * 表示するかどうかは呼び出し側が決める。ここは表示だけを担う。
 *
 * 画面下部に固定する。ヘッダーが sticky top-0 z-50 で画面上部を占めており、
 * 上部に同じ重なり順で置くと DOM 順の関係でヘッダーに完全に隠れる。
 * ヘッダーより手前に出す手もあるが、それだとメニューボタンを覆ってしまい、
 * バナーが出ている間ユーザーが画面を移動できなくなる。
 */
export const StorageWriteFailureBanner = ({
  reason,
  onDismiss,
}: StorageWriteFailureBannerProps) => {
  const message =
    reason === "quota-exceeded"
      ? texts.storageWriteFailure.quotaExceeded
      : texts.storageWriteFailure.unknown;

  return (
    <div
      role="alert"
      className="fixed bottom-0 inset-x-0 z-50 bg-red-50 dark:bg-red-100 border-t border-red-200 dark:border-red-300 px-4 py-3 shadow-lg"
    >
      <div className="flex items-start gap-3 max-w-3xl mx-auto">
        <span className="text-xl shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <p className="flex-1 text-sm text-red-800 dark:text-red-900">
          {message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-red-600 dark:text-red-700 font-medium hover:text-red-800 dark:hover:text-red-900 underline shrink-0"
        >
          {texts.storageWriteFailure.dismissLabel}
        </button>
      </div>
    </div>
  );
};
