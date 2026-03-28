import { useExportTransferState } from "./useExportTransferState";
import { useImportTransferState } from "./useImportTransferState";
import { createDataTransferStateResult } from "./dataTransferStateResult";

export const useDataTransferState = () => {
  const exportTransfer = useExportTransferState();
  const importTransfer = useImportTransferState();

  return createDataTransferStateResult({
    exportTransfer,
    importTransfer,
  });
};
