import { act, renderHook } from "@testing-library/react";
import { usePresetApplySelectionState } from "../usePresetApplySelectionState";

describe("usePresetApplySelectionState", () => {
  it("selected preset と target days を保持する", () => {
    const { result } = renderHook(() => usePresetApplySelectionState());

    expect(result.current.selectedPresetId).toBeNull();
    expect(Array.from(result.current.selectedDays)).toEqual([]);

    act(() => {
      result.current.setSelectedPresetId("p1");
      result.current.setSelectedDays(new Set([1, 2]));
    });

    expect(result.current.selectedPresetId).toBe("p1");
    expect(Array.from(result.current.selectedDays)).toEqual([1, 2]);
  });
});
