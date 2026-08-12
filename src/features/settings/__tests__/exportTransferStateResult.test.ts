import { createExportTransferStateResult } from "../state/exportTransferStateResult";
import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";

describe("exportTransferStateResult", () => {
  it("export transfer state の公開 shape を組み立てる", () => {
    const setExportOptions = jest.fn();
    const handleExport = jest.fn();

    expect(
      createExportTransferStateResult({
        exportStatus: "success",
        exportOptions: {
          ...EMPTY_TRANSFER_OPTIONS,
          routines: true,
          history: true,
        },
        setExportOptions,
        handleExport,
      }),
    ).toEqual({
      exportStatus: "success",
      exportOptions: {
        ...EMPTY_TRANSFER_OPTIONS,
        routines: true,
        history: true,
      },
      setExportOptions,
      handleExport,
    });
  });
});
