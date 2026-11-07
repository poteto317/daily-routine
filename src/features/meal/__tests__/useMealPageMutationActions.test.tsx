import { act, renderHook } from "@testing-library/react";

jest.mock("../mealPageMutationActionsResult", () => ({
  createMealPageMutationActionsResult: jest.fn(),
}));

jest.mock("../useMealAddAction", () => ({
  useMealAddAction: jest.fn(),
}));

jest.mock("../useMealDeleteAction", () => ({
  useMealDeleteAction: jest.fn(),
}));

import { useMealAddAction } from "../useMealAddAction";
import { useMealDeleteAction } from "../useMealDeleteAction";
import { createMealPageMutationActionsResult } from "../mealPageMutationActionsResult";
import { useMealPageMutationActions } from "../useMealPageMutationActions";

describe("useMealPageMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createMealPageMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("add/delete handler を組み立てて委譲する", () => {
    const addAction = jest.fn();
    const deleteAction = jest.fn();
    const resultShape = {
      handleAddMeal: jest.fn(),
      handleDeleteMeal: jest.fn(),
      composed: true,
    };
    (useMealAddAction as jest.Mock).mockReturnValue(addAction);
    (useMealDeleteAction as jest.Mock).mockReturnValue(deleteAction);
    (createMealPageMutationActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

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
    const { result } = renderHook(() => useMealPageMutationActions(params));

    expect(result.current).toBe(resultShape);
    expect(createMealPageMutationActionsResult).toHaveBeenCalledWith({
      handleAddMeal: expect.any(Function),
      handleDeleteMeal: expect.any(Function),
    });

    const builtActions = (createMealPageMutationActionsResult as jest.Mock).mock
      .calls[0][0] as {
      handleAddMeal: () => void;
      handleDeleteMeal: (date: string, mealId: string) => void;
    };

    act(() => {
      builtActions.handleAddMeal();
      builtActions.handleDeleteMeal("2024-01-12", "meal-1");
    });

    expect(useMealAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect((useMealAddAction as jest.Mock).mock.calls[0][0]).not.toHaveProperty(
      "today",
    );
    expect(useMealDeleteAction).toHaveBeenCalledWith(
      expect.objectContaining({
        setTodayMeals: params.setTodayMeals,
        setRecentMeals: params.setRecentMeals,
      }),
    );
    expect(addAction).toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledWith("2024-01-12", "meal-1");
  });
});
