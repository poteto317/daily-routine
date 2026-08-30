import { act, renderHook } from "@testing-library/react";
import { usePresetEditFieldsState } from "../usePresetEditFieldsState";

describe("usePresetEditFieldsState", () => {
  it("edit fields と単一の元曜日を保持する", () => {
    const { result } = renderHook(() => usePresetEditFieldsState());

    act(() => {
      result.current.setEditPresetName("更新後");
      result.current.setEditPresetDescription("新しい説明");
      result.current.setEditSourceDay(7);
    });

    expect(result.current.editPresetName).toBe("更新後");
    expect(result.current.editPresetDescription).toBe("新しい説明");
    expect(result.current.editSourceDay).toBe(7);
  });
});
