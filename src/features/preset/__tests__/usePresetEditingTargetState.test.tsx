import { act, renderHook } from "@testing-library/react";
import * as presetEditingTargetStateResultModule from "../presetEditingTargetStateResult";
import { usePresetEditingTargetState } from "../usePresetEditingTargetState";

describe("usePresetEditingTargetState", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("editingPresetId を保持する", () => {
    const resultSpy = jest.spyOn(
      presetEditingTargetStateResultModule,
      "createPresetEditingTargetStateResult",
    );
    const { result } = renderHook(() => usePresetEditingTargetState());

    expect(result.current.editingPresetId).toBeNull();

    act(() => {
      result.current.setEditingPresetId("p1");
    });

    expect(result.current.editingPresetId).toBe("p1");
    expect(resultSpy).toHaveBeenLastCalledWith({
      editingPresetId: "p1",
      setEditingPresetId: expect.any(Function),
    });
  });
});
