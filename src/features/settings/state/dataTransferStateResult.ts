type DataTransferStateResultArgs = {
  exportTransfer: ReturnType<
    typeof import("./useExportTransferState").useExportTransferState
  >;
  importTransfer: ReturnType<
    typeof import("./useImportTransferState").useImportTransferState
  >;
};

export const createDataTransferStateResult = ({
  exportTransfer,
  importTransfer,
}: DataTransferStateResultArgs) => {
  return {
    ...exportTransfer,
    ...importTransfer,
  };
};
