import { createDataTransferStateResult } from "../state/dataTransferStateResult";

describe("dataTransferStateResult", () => {
  it("export/import transfer の返り値を結合する", () => {
    const exportTransfer = {
      exportStatus: "idle" as const,
      exportOptions: {
        routines: true,
        progress: true,
        history: true,
        settings: true,
      },
      setExportOptions: jest.fn(),
      handleExport: jest.fn(),
    };
    const importTransfer = {
      importStatus: "idle" as const,
      importOptions: {
        routines: true,
        progress: true,
        history: true,
        settings: true,
      },
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
