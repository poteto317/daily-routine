import { renderHook } from "@testing-library/react";

jest.mock("../state/exportTransferStateResult", () => ({
  createExportTransferStateResult: jest.fn(),
}));

jest.mock("../state/useExportTransferAction", () => ({
  useExportTransferAction: jest.fn(),
}));

import { createExportTransferStateResult } from "../state/exportTransferStateResult";
import { useExportTransferAction } from "../state/useExportTransferAction";
import { useExportTransferState } from "../state/useExportTransferState";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";

describe("useExportTransferState composition", () => {
  it("state と export action hook を compose する", () => {
    const handleExport = jest.fn();
    (useExportTransferAction as jest.Mock).mockReturnValue(handleExport);
    (createExportTransferStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );

    const { result } = renderHook(() => useExportTransferState());

    expect(useExportTransferAction).toHaveBeenCalledWith({
      exportOptions: ALL_TRANSFER_OPTIONS,
      setExportStatus: expect.any(Function),
    });
    expect(createExportTransferStateResult).toHaveBeenCalledWith({
      exportStatus: "idle",
      exportOptions: ALL_TRANSFER_OPTIONS,
      setExportOptions: expect.any(Function),
      handleExport,
    });
    expect(result.current).toEqual({
      exportStatus: "idle",
      exportOptions: ALL_TRANSFER_OPTIONS,
      setExportOptions: expect.any(Function),
      handleExport,
    });
  });
});
