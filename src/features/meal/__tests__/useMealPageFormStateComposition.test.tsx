import { renderHook } from "@testing-library/react";

jest.mock("../mealPageFormStateResult", () => ({
  createMealPageFormStateResult: jest.fn(),
}));

jest.mock("../useMealPageFormActions", () => ({
  useMealPageFormActions: jest.fn(),
}));

jest.mock("../useMealPageInputState", () => ({
  useMealPageInputState: jest.fn(),
}));

jest.mock("../useMealPageFormVisibilityState", () => ({
  useMealPageFormVisibilityState: jest.fn(),
}));

import { createMealPageFormStateResult } from "../mealPageFormStateResult";
import { useMealPageFormActions } from "../useMealPageFormActions";
import { useMealPageFormVisibilityState } from "../useMealPageFormVisibilityState";
import { useMealPageInputState } from "../useMealPageInputState";
import { useMealPageFormState } from "../useMealPageFormState";

describe("useMealPageFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("form state と form action hook を compose する", () => {
    const actions = {
      handleCancelForm: jest.fn(),
      openForm: jest.fn(),
      resetForm: jest.fn(),
    };
    const inputState = {
      descriptionInput: "",
      mealTypeInput: "breakfast",
      notesInput: "",
      timeInput: "08:30",
      setDescriptionInput: jest.fn(),
      setMealTypeInput: jest.fn(),
      setNotesInput: jest.fn(),
      setTimeInput: jest.fn(),
    };
    const visibilityState = {
      showForm: false,
      setShowForm: jest.fn(),
    };
    (useMealPageInputState as jest.Mock).mockReturnValue(inputState);
    (useMealPageFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useMealPageFormActions as jest.Mock).mockReturnValue(actions);
    const resultState = {
      ...inputState,
      ...visibilityState,
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
      resetForm: actions.resetForm,
    };
    (createMealPageFormStateResult as jest.Mock).mockReturnValue(resultState);

    const { result } = renderHook(() =>
      useMealPageFormState({
        showForm: false,
        mealTypeInput: "breakfast",
        timeInput: "08:30",
        descriptionInput: "",
        notesInput: "",
      }),
    );

    expect(useMealPageFormVisibilityState).toHaveBeenCalledWith({
      initialShowForm: false,
    });
    expect(useMealPageInputState).toHaveBeenCalledWith({
      initialMealTypeInput: "breakfast",
      initialTimeInput: "08:30",
      initialDescriptionInput: "",
      initialNotesInput: "",
    });
    expect(useMealPageFormActions).toHaveBeenCalledWith({
      setShowForm: visibilityState.setShowForm,
      setDescriptionInput: inputState.setDescriptionInput,
      setNotesInput: inputState.setNotesInput,
    });
    expect(createMealPageFormStateResult).toHaveBeenCalledWith({
      inputState,
      visibilityState,
      handleCancelForm: actions.handleCancelForm,
      openForm: actions.openForm,
      resetForm: actions.resetForm,
    });
    expect(result.current).toBe(resultState);
  });
});
