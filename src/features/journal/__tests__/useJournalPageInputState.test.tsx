import { act, renderHook } from "@testing-library/react";
import { useJournalPageInputState } from "../useJournalPageInputState";

describe("useJournalPageInputState", () => {
  it("title/content input を独立して保持する", () => {
    const { result } = renderHook(() =>
      useJournalPageInputState({
        titleInput: "初期タイトル",
        contentInput: "初期本文",
      }),
    );

    expect(result.current.titleInput).toBe("初期タイトル");
    expect(result.current.contentInput).toBe("初期本文");

    act(() => {
      result.current.setTitleInput("更新タイトル");
      result.current.setContentInput("更新本文");
    });

    expect(result.current.titleInput).toBe("更新タイトル");
    expect(result.current.contentInput).toBe("更新本文");
  });
});
