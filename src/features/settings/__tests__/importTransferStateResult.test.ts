import { createImportTransferStateResult } from "../state/importTransferStateResult";
import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";

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
          ...EMPTY_TRANSFER_OPTIONS,
          progress: true,
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
        ...EMPTY_TRANSFER_OPTIONS,
        progress: true,
        settings: true,
      },
      setImportOptions,
      fileInputRef,
      handleImportClick,
      handleImport,
    });
  });
});
