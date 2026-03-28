import { act, renderHook } from "@testing-library/react";
import { useMealPageInputState } from "../useMealPageInputState";

describe("useMealPageInputState", () => {
  it("meal form の入力 state を管理する", () => {
    const { result } = renderHook(() =>
      useMealPageInputState({
        initialMealTypeInput: "breakfast",
        initialTimeInput: "08:30",
        initialDescriptionInput: "",
        initialNotesInput: "",
      }),
    );

    act(() => {
      result.current.setMealTypeInput("dinner");
      result.current.setTimeInput("19:00");
      result.current.setDescriptionInput("カレー");
      result.current.setNotesInput("辛口");
    });

    expect(result.current.mealTypeInput).toBe("dinner");
    expect(result.current.timeInput).toBe("19:00");
    expect(result.current.descriptionInput).toBe("カレー");
    expect(result.current.notesInput).toBe("辛口");
  });
});
