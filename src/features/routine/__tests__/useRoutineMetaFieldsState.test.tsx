import { act, renderHook } from "@testing-library/react";
import { useRoutineMetaFieldsState } from "../components/useRoutineMetaFieldsState";

describe("useRoutineMetaFieldsState", () => {
  it("title/category/description を管理する", () => {
    const { result } = renderHook(() =>
      useRoutineMetaFieldsState({
        initialTitle: "朝活",
        initialCategory: "work",
        initialDescription: "準備",
      }),
    );

    act(() => {
      result.current.setTitle("運動");
      result.current.setCategory("health");
      result.current.setDescription("ストレッチ");
    });

    expect(result.current.title).toBe("運動");
    expect(result.current.category).toBe("health");
    expect(result.current.description).toBe("ストレッチ");
  });
});
