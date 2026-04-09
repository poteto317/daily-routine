import { useState } from "react";
import type {
  TransferOptions,
  TransferStatus} from "./constants";
import {
  ALL_TRANSFER_OPTIONS
} from "./constants";
import { createImportTransferStateResult } from "./importTransferStateResult";
import { useImportTransferAction } from "./useImportTransferAction";
import { useImportTransferFileInput } from "./useImportTransferFileInput";

export const useImportTransferState = () => {
  const [importStatus, setImportStatus] = useState<TransferStatus>("idle");
  const [importOptions, setImportOptions] =
    useState<TransferOptions>(ALL_TRANSFER_OPTIONS);
  const { fileInputRef, handleImportClick } = useImportTransferFileInput();
  const handleImport = useImportTransferAction({
    importOptions,
    setImportStatus,
  });

  return createImportTransferStateResult({
    importStatus,
    importOptions,
    setImportOptions,
    fileInputRef,
    handleImportClick,
    handleImport,
  });
};
