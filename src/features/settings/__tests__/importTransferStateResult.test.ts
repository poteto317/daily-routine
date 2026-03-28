import { createImportTransferStateResult } from "../state/importTransferStateResult";

describe("importTransferStateResult", () => {
  it("import transfer state の公開 shape を組み立てる", () => {
    const setImportOptions = jest.fn();
    const handleImportClick = jest.fn();
    const handleImport = jest.fn();
    const fileInputRef = { current: null };

    expect(
      createImportTransferStateResult({
        importStatus: "error",
        importOptions: {
          routines: false,
          progress: true,
          history: false,
          settings: true,
        },
        setImportOptions,
        fileInputRef,
        handleImportClick,
        handleImport,
      }),
    ).toEqual({
      importStatus: "error",
      importOptions: {
        routines: false,
        progress: true,
        history: false,
        settings: true,
      },
      setImportOptions,
      fileInputRef,
      handleImportClick,
      handleImport,
    });
  });
});
