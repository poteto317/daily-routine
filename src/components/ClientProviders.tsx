"use client";

import type { ReactNode } from "react";
import { usePWAInstaller } from "@/hooks/usePWAInstaller";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { StorageWriteFailureNotifier } from "./StorageWriteFailureNotifier";

type ClientProvidersProps = {
  children: ReactNode;
};

export const ClientProviders = ({ children }: ClientProvidersProps) => {
  useThemeEffect();
  usePWAInstaller();

  return (
    <>
      <StorageWriteFailureNotifier />
      {children}
    </>
  );
};
