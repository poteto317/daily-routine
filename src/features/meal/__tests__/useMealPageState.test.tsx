import { renderHook } from "@testing-library/react";

jest.mock("../mealPageActionBindings", () => ({
  createMealPageActionBindings: jest.fn(),
}));

jest.mock("../mealPageStateResult", () => ({
  createMealPageStateResult: jest.fn(),
}));

jest.mock("../useMealPageActions", () => ({
  useMealPageActions: jest.fn(),
}));

jest.mock("../useMealPageDataState", () => ({
  useMealPageDataState: jest.fn(),
}));

jest.mock("../useMealPageFormState", () => ({
  useMealPageFormState: jest.fn(),
}));

import { createMealPageActionBindings } from "../mealPageActionBindings";
import { createMealPageStateResult } from "../mealPageStateResult";
import { useMealPageActions } from "../useMealPageActions";
import { useMealPageDataState } from "../useMealPageDataState";
import { useMealPageFormState } from "../useMealPageFormState";
import { useMealPageState } from "../useMealPageState";

describe("useMealPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mealData = {
      initialState: {
        showForm: false,
        mealTypeInput: "breakfast",
        timeInput: "08:30",
        descriptionInput: "",
        notesInput: "",
        todayMeals: [],
        recentMeals: [],
      },
      recentMeals: [],
      setRecentMeals: jest.fn(),
      setTodayMeals: jest.fn(),
      today: "2024-01-12",
      todayMeals: [],
    };
    const formState = {
      descriptionInput: "",
      handleCancelForm: jest.fn(),
      mealTypeInput: "breakfast",
      notesInput: "",
      openForm: jest.fn(),
      setDescriptionInput: jest.fn(),
      setMealTypeInput: jest.fn(),
      setNotesInput: jest.fn(),
      setShowForm: jest.fn(),
      setTimeInput: jest.fn(),
      showForm: false,
      timeInput: "08:30",
    };
    const actionBindings = { bound: true };
    const actionState = {
      handleAddMeal: jest.fn(),
      handleDeleteMeal: jest.fn(),
    };
    const resultState = { composed: true };

    (useMealPageDataState as jest.Mock).mockReturnValue(mealData);
    (useMealPageFormState as jest.Mock).mockReturnValue(formState);
    (createMealPageActionBindings as jest.Mock).mockReturnValue(actionBindings);
    (useMealPageActions as jest.Mock).mockReturnValue(actionState);
    (createMealPageStateResult as jest.Mock).mockReturnValue(resultState);
  });

  it("data/form/actions/result を compose する", () => {
    const { result } = renderHook(() => useMealPageState());

    expect(useMealPageFormState).toHaveBeenCalledWith(
      expect.objectContaining({
        showForm: false,
        mealTypeInput: "breakfast",
        timeInput: "08:30",
      }),
    );
    expect(createMealPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "breakfast",
        timeInput: "08:30",
      }),
    );
    // 描画時の today は表示（結果）にだけ渡し、保存の経路（action の束）には渡さない
    expect(
      (createMealPageActionBindings as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
    expect(useMealPageActions).toHaveBeenCalledWith({ bound: true });
    expect(createMealPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        recentMeals: [],
        todayMeals: [],
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
