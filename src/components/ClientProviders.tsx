"use client";

import type { ReactNode } from "react";
import { usePWAInstaller } from "@/hooks/usePWAInstaller";
import { useStorageWriteFailure } from "@/hooks/useStorageWriteFailure";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { StorageWriteFailureBanner } from "./StorageWriteFailureBanner";

type ClientProvidersProps = {
  children: ReactNode;
};

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  useThemeEffect();
  usePWAInstaller();
  // 保存の失敗はどの画面でも起きうるため、アプリ全体で1つのバナーが受ける
  const { failure, dismiss } = useStorageWriteFailure();

  return (
    <>
      {failure && (
        <StorageWriteFailureBanner
          reason={failure.reason}
          onDismiss={dismiss}
        />
      )}
      {children}
    </>
  );
};
