import { act, renderHook } from "@testing-library/react";
import * as presetCreationSelectionStateResultModule from "../presetCreationSelectionStateResult";
import { usePresetCreationSelectionState } from "../usePresetCreationSelectionState";

describe("usePresetCreationSelectionState", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("routine selection と filter day の state を管理する", () => {
    const resultSpy = jest.spyOn(
      presetCreationSelectionStateResultModule,
      "createPresetCreationSelectionStateResult",
    );
    const { result } = renderHook(() => usePresetCreationSelectionState());

    expect(result.current.selectedRoutines.size).toBe(0);
    expect(result.current.createFilterDays.size).toBe(0);

    act(() => {
      result.current.setSelectedRoutines(new Set(["r1"]));
      result.current.setCreateFilterDays(new Set([1, 2]));
    });

    expect(Array.from(result.current.selectedRoutines)).toEqual(["r1"]);
    expect(Array.from(result.current.createFilterDays)).toEqual([1, 2]);
    expect(resultSpy).toHaveBeenLastCalledWith({
      createFilterDays: new Set([1, 2]),
      selectedRoutines: new Set(["r1"]),
      setCreateFilterDays: expect.any(Function),
      setSelectedRoutines: expect.any(Function),
    });
  });
});
