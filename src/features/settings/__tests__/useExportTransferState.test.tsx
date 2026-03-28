import { act, renderHook } from "@testing-library/react";
import { useExportTransferState } from "../state/useExportTransferState";

describe("useExportTransferState", () => {
  it("初期 state と option 更新を管理する", () => {
    const { result } = renderHook(() => useExportTransferState());

    act(() => {
      result.current.setExportOptions({
        routines: false,
        progress: true,
        history: false,
        settings: true,
      });
    });

    expect(result.current.exportStatus).toBe("idle");
    expect(result.current.exportOptions).toEqual({
      routines: false,
      progress: true,
      history: false,
      settings: true,
    });
  });
});
