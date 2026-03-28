import type { Dispatch, SetStateAction } from "react";
import type { TransferOptions, TransferStatus } from "./constants";
import { createExportData, downloadExportData } from "./dataTransferHelpers";
import { runExportTransfer } from "./dataTransferStateActions";

type UseExportTransferActionArgs = {
  exportOptions: TransferOptions;
  setExportStatus: Dispatch<SetStateAction<TransferStatus>>;
};

export const useExportTransferAction = ({
  exportOptions,
  setExportStatus,
}: UseExportTransferActionArgs) => {
  return () => {
    const nextStatus = runExportTransfer({
      exportOptions,
      createExportData,
      downloadExportData,
    });

    setExportStatus(nextStatus);
    setTimeout(() => setExportStatus("idle"), 3000);
  };
};
