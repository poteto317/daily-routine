import { act, renderHook } from "@testing-library/react";
import { useJournalPageInputState } from "../useJournalPageInputState";

describe("useJournalPageInputState", () => {
  it("title/content/date input を独立して保持する", () => {
    const { result } = renderHook(() =>
      useJournalPageInputState({
        titleInput: "初期タイトル",
        contentInput: "初期本文",
        dateInput: null,
      }),
    );

    expect(result.current.titleInput).toBe("初期タイトル");
    expect(result.current.contentInput).toBe("初期本文");
    expect(result.current.dateInput).toBeNull();

    act(() => {
      result.current.setTitleInput("更新タイトル");
      result.current.setContentInput("更新本文");
      result.current.setDateInput("2026-03-10");
    });

    expect(result.current.titleInput).toBe("更新タイトル");
    expect(result.current.contentInput).toBe("更新本文");
    expect(result.current.dateInput).toBe("2026-03-10");

    act(() => {
      result.current.setDateInput("");
    });

    // 空にした値は null（未操作）と区別して保持する
    expect(result.current.dateInput).toBe("");
  });
});
