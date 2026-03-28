import { act, renderHook } from "@testing-library/react";
import { useJournalPageFormVisibilityState } from "../useJournalPageFormVisibilityState";

describe("useJournalPageFormVisibilityState", () => {
  it("showForm visibility を保持する", () => {
    const { result } = renderHook(() =>
      useJournalPageFormVisibilityState({ showForm: false }),
    );

    expect(result.current.showForm).toBe(false);

    act(() => {
      result.current.setShowForm(true);
    });

    expect(result.current.showForm).toBe(true);
  });
});
