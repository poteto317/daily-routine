import { act, renderHook } from "@testing-library/react";
import { useMealPageFormState } from "../useMealPageFormState";

describe("useMealPageFormState", () => {
  const initialState = {
    showForm: false,
    mealTypeInput: "breakfast" as const,
    timeInput: "08:30",
    descriptionInput: "",
    notesInput: "",
  };

  it("初期値と入力変更を管理する", () => {
    const { result } = renderHook(() => useMealPageFormState(initialState));

    expect(result.current.showForm).toBe(false);
    expect(result.current.mealTypeInput).toBe("breakfast");
    expect(result.current.timeInput).toBe("08:30");

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

  it("フォーム open/cancel/reset を管理する", () => {
    const { result } = renderHook(() => useMealPageFormState(initialState));

    act(() => {
      result.current.openForm();
    });

    expect(result.current.showForm).toBe(true);

    act(() => {
      result.current.setDescriptionInput("ramen");
      result.current.setNotesInput("spicy");
      result.current.handleCancelForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.descriptionInput).toBe("");
    expect(result.current.notesInput).toBe("");

    act(() => {
      result.current.setDescriptionInput("temp");
      result.current.setNotesInput("memo");
      result.current.resetForm();
    });

    expect(result.current.descriptionInput).toBe("");
    expect(result.current.notesInput).toBe("");
  });
});
