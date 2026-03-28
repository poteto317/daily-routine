import { createExportTransferStateResult } from "../state/exportTransferStateResult";

describe("exportTransferStateResult", () => {
  it("export transfer state の公開 shape を組み立てる", () => {
    const setExportOptions = jest.fn();
    const handleExport = jest.fn();

    expect(
      createExportTransferStateResult({
        exportStatus: "success",
        exportOptions: {
          routines: true,
          progress: false,
          history: true,
          settings: false,
        },
        setExportOptions,
        handleExport,
      }),
    ).toEqual({
      exportStatus: "success",
      exportOptions: {
        routines: true,
        progress: false,
        history: true,
        settings: false,
      },
      setExportOptions,
      handleExport,
    });
  });
});
