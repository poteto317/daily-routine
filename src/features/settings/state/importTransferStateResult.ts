import type { Dispatch, RefObject, SetStateAction } from "react";
import type { TransferOptions, TransferStatus } from "./constants";

type ImportTransferStateResultArgs = {
  importStatus: TransferStatus;
  importOptions: TransferOptions;
  setImportOptions: Dispatch<SetStateAction<TransferOptions>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleImportClick: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export const createImportTransferStateResult = ({
  importStatus,
  importOptions,
  setImportOptions,
  fileInputRef,
  handleImportClick,
  handleImport,
}: ImportTransferStateResultArgs) => {
  return {
    importStatus,
    importOptions,
    setImportOptions,
    fileInputRef,
    handleImportClick,
    handleImport,
  };
};
