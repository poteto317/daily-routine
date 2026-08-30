import { act, renderHook } from "@testing-library/react";
import { usePresetEditingTargetState } from "../usePresetEditingTargetState";

describe("usePresetEditingTargetState", () => {
  it("編集中のプリセットIDと開始時の更新日時を保持する", () => {
    const { result } = renderHook(() => usePresetEditingTargetState());

    expect(result.current.editingPresetId).toBeNull();
    expect(result.current.editingPresetUpdatedAt).toBeNull();

    act(() => {
      result.current.setEditingPresetId("p1");
      result.current.setEditingPresetUpdatedAt("2026-03-07T00:00:00.000Z");
    });

    expect(result.current.editingPresetId).toBe("p1");
    expect(result.current.editingPresetUpdatedAt).toBe(
      "2026-03-07T00:00:00.000Z",
    );
  });
});
