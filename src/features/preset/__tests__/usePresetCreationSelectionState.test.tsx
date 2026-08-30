import { act, renderHook } from "@testing-library/react";
import { usePresetCreationSelectionState } from "../usePresetCreationSelectionState";

describe("usePresetCreationSelectionState", () => {
  it("作成元曜日を単一のnumberまたはnullで管理する", () => {
    const { result } = renderHook(() => usePresetCreationSelectionState());

    expect(result.current.sourceDay).toBeNull();

    act(() => {
      result.current.setSourceDay(7);
    });

    expect(result.current.sourceDay).toBe(7);
  });
});
