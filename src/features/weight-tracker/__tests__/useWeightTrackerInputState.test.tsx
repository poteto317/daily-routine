import { act, renderHook } from "@testing-library/react";
import { useWeightTrackerInputState } from "../page/useWeightTrackerInputState";

describe("useWeightTrackerInputState", () => {
  it("weight と notes の入力 state を管理する", () => {
    const { result } = renderHook(() =>
      useWeightTrackerInputState({
        initialWeightInput: "69.5",
        initialNotesInput: "updated",
      }),
    );

    act(() => {
      result.current.setWeightInput("70.0");
      result.current.setNotesInput("temp");
    });

    expect(result.current.weightInput).toBe("70.0");
    expect(result.current.notesInput).toBe("temp");
  });
});
