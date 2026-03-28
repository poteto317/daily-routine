import { act, renderHook } from "@testing-library/react";
import * as presetEditFieldsStateResultModule from "../presetEditFieldsStateResult";
import { usePresetEditFieldsState } from "../usePresetEditFieldsState";

describe("usePresetEditFieldsState", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("edit fields と routine selection を保持する", () => {
    const resultSpy = jest.spyOn(
      presetEditFieldsStateResultModule,
      "createPresetEditFieldsStateResult",
    );
    const { result } = renderHook(() => usePresetEditFieldsState());

    act(() => {
      result.current.setEditPresetName("更新後");
      result.current.setEditPresetDescription("新しい説明");
      result.current.setEditSelectedRoutines(new Set(["r1"]));
    });

    expect(result.current.editPresetName).toBe("更新後");
    expect(result.current.editPresetDescription).toBe("新しい説明");
    expect(Array.from(result.current.editSelectedRoutines)).toEqual(["r1"]);
    expect(resultSpy).toHaveBeenLastCalledWith({
      editPresetDescription: "新しい説明",
      editPresetName: "更新後",
      editSelectedRoutines: new Set(["r1"]),
      setEditPresetDescription: expect.any(Function),
      setEditPresetName: expect.any(Function),
      setEditSelectedRoutines: expect.any(Function),
    });
  });
});
