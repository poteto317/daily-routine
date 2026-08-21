import { act, renderHook } from "@testing-library/react";
import { useRoutineMetaFieldsState } from "../components/useRoutineMetaFieldsState";

describe("useRoutineMetaFieldsState", () => {
  it("title/category/description/weeklyGoalTarget を管理する", () => {
    const { result } = renderHook(() =>
      useRoutineMetaFieldsState({
        initialTitle: "朝活",
        initialCategory: "work",
        initialDescription: "準備",
        initialWeeklyGoalTarget: "3",
      }),
    );

    act(() => {
      result.current.setTitle("運動");
      result.current.setCategory("health");
      result.current.setDescription("ストレッチ");
      result.current.setWeeklyGoalTarget("4");
    });

    expect(result.current.title).toBe("運動");
    expect(result.current.category).toBe("health");
    expect(result.current.description).toBe("ストレッチ");
    expect(result.current.weeklyGoalTarget).toBe("4");
  });
});
