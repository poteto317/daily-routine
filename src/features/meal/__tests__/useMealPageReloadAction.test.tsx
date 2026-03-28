import { act, renderHook } from "@testing-library/react";

jest.mock("../mealPageStateActions", () => ({
  createReloadMealsAction: jest.fn(),
}));

jest.mock("../mealPageReloadActionResult", () => ({
  createMealPageReloadActionResult: jest.fn(),
}));

import { createReloadMealsAction } from "../mealPageStateActions";
import { createMealPageReloadActionResult } from "../mealPageReloadActionResult";
import { useMealPageReloadAction } from "../useMealPageReloadAction";

describe("useMealPageReloadAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reload action を組み立てて委譲する", () => {
    const reloadAction = jest.fn();
    const resultShape = { reloadMeals: reloadAction, composed: true };
    (createReloadMealsAction as jest.Mock).mockReturnValue(reloadAction);
    (createMealPageReloadActionResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      setTodayMeals: jest.fn(),
      setRecentMeals: jest.fn(),
    };
    const { result } = renderHook(() => useMealPageReloadAction(params));

    expect(result.current).toBe(resultShape);
    expect(createMealPageReloadActionResult).toHaveBeenCalledWith({
      reloadMeals: expect.any(Function),
    });

    const builtReloadMeals = (createMealPageReloadActionResult as jest.Mock)
      .mock.calls[0][0].reloadMeals as () => void;

    act(() => {
      builtReloadMeals();
    });

    expect(createReloadMealsAction).toHaveBeenCalledWith(
      expect.objectContaining({
        setTodayMeals: params.setTodayMeals,
        setRecentMeals: params.setRecentMeals,
      }),
    );
    expect(reloadAction).toHaveBeenCalledTimes(1);
  });
});
