import { act, renderHook } from "@testing-library/react";
import { useMealPageFormVisibilityState } from "../useMealPageFormVisibilityState";

describe("useMealPageFormVisibilityState", () => {
  it("showForm state を管理する", () => {
    const { result } = renderHook(() =>
      useMealPageFormVisibilityState({ initialShowForm: false }),
    );

    act(() => {
      result.current.setShowForm(true);
    });

    expect(result.current.showForm).toBe(true);
  });
});
