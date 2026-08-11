"use client";

import { useStorageWriteFailure } from "@/hooks/useStorageWriteFailure";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

/**
 * 保存の失敗を購読し、バナーを出すかどうかを決める。
 *
 * 保存の失敗はどの画面でも起きうるため、アプリ全体で 1 つだけ置く。
 */
export const StorageWriteFailureNotifier = () => {
  const { failure, dismiss } = useStorageWriteFailure();

  if (!failure) return null;

  return (
    <StorageWriteFailureBanner reason={failure.reason} onDismiss={dismiss} />
  );
};
