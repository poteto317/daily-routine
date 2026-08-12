import { act, renderHook } from "@testing-library/react";
import { useExportTransferState } from "../state/useExportTransferState";
import { EMPTY_TRANSFER_OPTIONS } from "../state/constants";

describe("useExportTransferState", () => {
  it("初期 state と option 更新を管理する", () => {
    const { result } = renderHook(() => useExportTransferState());

    act(() => {
      result.current.setExportOptions({
        ...EMPTY_TRANSFER_OPTIONS,
        progress: true,
        settings: true,
      });
    });

    expect(result.current.exportStatus).toBe("idle");
    expect(result.current.exportOptions).toEqual({
      ...EMPTY_TRANSFER_OPTIONS,
      progress: true,
      settings: true,
    });
  });
});
