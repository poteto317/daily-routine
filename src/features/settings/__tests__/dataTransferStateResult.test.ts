import { createDataTransferStateResult } from "../state/dataTransferStateResult";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";

describe("dataTransferStateResult", () => {
  it("export/import transfer の返り値を結合する", () => {
    const exportTransfer = {
      exportStatus: "idle" as const,
      exportOptions: ALL_TRANSFER_OPTIONS,
      setExportOptions: jest.fn(),
      handleExport: jest.fn(),
    };
    const importTransfer = {
      importStatus: "idle" as const,
      importOptions: ALL_TRANSFER_OPTIONS,
      setImportOptions: jest.fn(),
      fileInputRef: { current: null },
      handleImportClick: jest.fn(),
      handleImport: jest.fn(),
    };

    expect(
      createDataTransferStateResult({
        exportTransfer,
        importTransfer,
      }),
    ).toEqual({
      ...exportTransfer,
      ...importTransfer,
    });
  });
});
