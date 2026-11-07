import { renderHook } from "@testing-library/react";

jest.mock("../useMealPageMutationActions", () => ({
  useMealPageMutationActions: jest.fn(),
}));

jest.mock("../useMealPageReloadAction", () => ({
  useMealPageReloadAction: jest.fn(),
}));

jest.mock("../mealPageActionsResult", () => ({
  createMealPageActionsResult: jest.fn(),
}));

import { createMealPageActionsResult } from "../mealPageActionsResult";
import { useMealPageMutationActions } from "../useMealPageMutationActions";
import { useMealPageActions } from "../useMealPageActions";
import { useMealPageReloadAction } from "../useMealPageReloadAction";

describe("useMealPageActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reload hook と mutation hook を compose して委譲する", () => {
    const reloadAction = jest.fn();
    const addAction = jest.fn();
    const deleteAction = jest.fn();
    const resultShape = { composed: true };
    (useMealPageReloadAction as jest.Mock).mockReturnValue({
      reloadMeals: reloadAction,
    });
    (useMealPageMutationActions as jest.Mock).mockReturnValue({
      handleAddMeal: addAction,
      handleDeleteMeal: deleteAction,
    });
    (createMealPageActionsResult as jest.Mock).mockReturnValue(resultShape);

    const params = {
      mealTypeInput: "lunch" as const,
      timeInput: "12:00",
      descriptionInput: "ramen",
      notesInput: "spicy",
      setTodayMeals: jest.fn(),
      setRecentMeals: jest.fn(),
      setShowForm: jest.fn(),
      setDescriptionInput: jest.fn(),
      setNotesInput: jest.fn(),
    };
    const { result } = renderHook(() => useMealPageActions(params));

    expect(useMealPageReloadAction).toHaveBeenCalledWith({
      setTodayMeals: params.setTodayMeals,
      setRecentMeals: params.setRecentMeals,
    });
    expect(useMealPageMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect(
      (useMealPageMutationActions as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
    expect(createMealPageActionsResult).toHaveBeenCalledWith({
      handleAddMeal: addAction,
      handleDeleteMeal: deleteAction,
      reloadMeals: reloadAction,
    });
    expect(result.current).toBe(resultShape);
  });
});
