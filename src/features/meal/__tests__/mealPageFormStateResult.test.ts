import { createMealPageFormStateResult } from "../mealPageFormStateResult";

describe("createMealPageFormStateResult", () => {
  it("input と visibility と form actions の公開 shape をまとめて返す", () => {
    const inputState = {
      descriptionInput: "ramen",
      mealTypeInput: "dinner" as const,
      notesInput: "spicy",
      timeInput: "19:00",
      setDescriptionInput: jest.fn(),
      setMealTypeInput: jest.fn(),
      setNotesInput: jest.fn(),
      setTimeInput: jest.fn(),
    };
    const visibilityState = {
      showForm: true,
      setShowForm: jest.fn(),
    };
    const handleCancelForm = jest.fn();
    const openForm = jest.fn();
    const resetForm = jest.fn();

    const result = createMealPageFormStateResult({
      inputState,
      visibilityState,
      handleCancelForm,
      openForm,
      resetForm,
    });

    expect(result).toEqual({
      ...inputState,
      ...visibilityState,
      handleCancelForm,
      openForm,
      resetForm,
    });
  });
});
