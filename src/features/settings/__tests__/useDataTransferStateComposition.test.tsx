import { renderHook } from "@testing-library/react";

jest.mock("../state/useExportTransferState", () => ({
  useExportTransferState: jest.fn(),
}));

jest.mock("../state/useImportTransferState", () => ({
  useImportTransferState: jest.fn(),
}));

jest.mock("../state/dataTransferStateResult", () => ({
  createDataTransferStateResult: jest.fn(),
}));

import { createDataTransferStateResult } from "../state/dataTransferStateResult";
import { useDataTransferState } from "../state/useDataTransferState";
import { useExportTransferState } from "../state/useExportTransferState";
import { useImportTransferState } from "../state/useImportTransferState";

describe("useDataTransferState composition", () => {
  it("export/import state と result builder を compose する", () => {
    const exportTransfer = { exportStatus: "idle" };
    const importTransfer = { importStatus: "idle" };
    const composed = { merged: true };

    (useExportTransferState as jest.Mock).mockReturnValue(exportTransfer);
    (useImportTransferState as jest.Mock).mockReturnValue(importTransfer);
    (createDataTransferStateResult as jest.Mock).mockReturnValue(composed);

    const { result } = renderHook(() => useDataTransferState());

    expect(useExportTransferState).toHaveBeenCalledWith();
    expect(useImportTransferState).toHaveBeenCalledWith();
    expect(createDataTransferStateResult).toHaveBeenCalledWith({
      exportTransfer,
      importTransfer,
    });
    expect(result.current).toBe(composed);
  });
});
