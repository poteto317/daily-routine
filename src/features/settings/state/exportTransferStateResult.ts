import type { Dispatch, SetStateAction } from "react";
import type { TransferOptions, TransferStatus } from "./constants";

type ExportTransferStateResultArgs = {
  exportStatus: TransferStatus;
  exportOptions: TransferOptions;
  setExportOptions: Dispatch<SetStateAction<TransferOptions>>;
  handleExport: () => void;
};

export const createExportTransferStateResult = ({
  exportStatus,
  exportOptions,
  setExportOptions,
  handleExport,
}: ExportTransferStateResultArgs) => {
  return {
    exportStatus,
    exportOptions,
    setExportOptions,
    handleExport,
  };
};
