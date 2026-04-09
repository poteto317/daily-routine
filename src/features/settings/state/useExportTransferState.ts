import { useState } from "react";
import {
  ALL_TRANSFER_OPTIONS,
  type TransferOptions,
  type TransferStatus,
} from "./constants";
import { createExportTransferStateResult } from "./exportTransferStateResult";
import { useExportTransferAction } from "./useExportTransferAction";

export const useExportTransferState = () => {
  const [exportStatus, setExportStatus] = useState<TransferStatus>("idle");
  const [exportOptions, setExportOptions] =
    useState<TransferOptions>(ALL_TRANSFER_OPTIONS);
  const handleExport = useExportTransferAction({
    exportOptions,
    setExportStatus,
  });

  return createExportTransferStateResult({
    exportStatus,
    exportOptions,
    setExportOptions,
    handleExport,
  });
};
