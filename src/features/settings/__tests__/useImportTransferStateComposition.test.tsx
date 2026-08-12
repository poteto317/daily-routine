import { renderHook } from "@testing-library/react";

jest.mock("../state/importTransferStateResult", () => ({
  createImportTransferStateResult: jest.fn(),
}));

jest.mock("../state/useImportTransferAction", () => ({
  useImportTransferAction: jest.fn(),
}));

jest.mock("../state/useImportTransferFileInput", () => ({
  useImportTransferFileInput: jest.fn(),
}));

import { useImportTransferState } from "../state/useImportTransferState";
import { useImportTransferAction } from "../state/useImportTransferAction";
import { useImportTransferFileInput } from "../state/useImportTransferFileInput";
import { createImportTransferStateResult } from "../state/importTransferStateResult";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";

describe("useImportTransferState composition", () => {
  it("state と file input/action hook を compose する", () => {
    const handleImport = jest.fn();
    const handleImportClick = jest.fn();
    const fileInputRef = { current: null };

    (useImportTransferAction as jest.Mock).mockReturnValue(handleImport);
    (useImportTransferFileInput as jest.Mock).mockReturnValue({
      fileInputRef,
      handleImportClick,
    });
    (createImportTransferStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );

    const { result } = renderHook(() => useImportTransferState());

    expect(useImportTransferFileInput).toHaveBeenCalledWith();
    expect(useImportTransferAction).toHaveBeenCalledWith({
      importOptions: ALL_TRANSFER_OPTIONS,
      setImportStatus: expect.any(Function),
    });
    expect(createImportTransferStateResult).toHaveBeenCalledWith({
      fileInputRef,
      handleImport,
      handleImportClick,
      importOptions: ALL_TRANSFER_OPTIONS,
      importStatus: "idle",
      setImportOptions: expect.any(Function),
    });
    expect(result.current).toEqual({
      fileInputRef,
      handleImport,
      handleImportClick,
      importOptions: ALL_TRANSFER_OPTIONS,
      importStatus: "idle",
      setImportOptions: expect.any(Function),
    });
  });
});
