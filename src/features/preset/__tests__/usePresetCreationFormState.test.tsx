import { act, renderHook } from "@testing-library/react";
import { usePresetCreationFormState } from "../usePresetCreationFormState";

describe("usePresetCreationFormState", () => {
  it("作成フォームの入力 state を管理する", () => {
    const { result } = renderHook(() => usePresetCreationFormState());

    expect(result.current.isCreating).toBe(false);
    expect(result.current.newPresetName).toBe("");
    expect(result.current.newPresetDescription).toBe("");

    act(() => {
      result.current.setIsCreating(true);
      result.current.setNewPresetName("朝");
      result.current.setNewPresetDescription("desc");
    });

    expect(result.current.isCreating).toBe(true);
    expect(result.current.newPresetName).toBe("朝");
    expect(result.current.newPresetDescription).toBe("desc");
  });
});
