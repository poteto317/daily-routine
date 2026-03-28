import { act, renderHook } from "@testing-library/react";
import { useWeightTrackerFormVisibilityState } from "../page/useWeightTrackerFormVisibilityState";

describe("useWeightTrackerFormVisibilityState", () => {
  it("showForm state を管理する", () => {
    const { result } = renderHook(() =>
      useWeightTrackerFormVisibilityState({ initialShowForm: false }),
    );

    act(() => {
      result.current.setShowForm(true);
    });

    expect(result.current.showForm).toBe(true);
  });
});
